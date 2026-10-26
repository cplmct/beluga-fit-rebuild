export const TEST_APP_ID = 'ca-app-pub-3940256099942544~3347511713';
export const TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';

export interface TestConfig {
  mode?: string;
  appId?: string;
  bannerId?: string;
  audienceApproved?: boolean;
}

export interface ConsentInfo {
  status: string;
  canRequestAds: boolean;
  isConsentFormAvailable: boolean;
  privacyOptionsRequirementStatus: string;
}

export interface AdsAdapter {
  requestInfoUpdate(): Promise<ConsentInfo>;
  getConsentInfo(): Promise<ConsentInfo>;
  loadAndShowConsentFormIfRequired(): Promise<ConsentInfo>;
  showPrivacyOptionsForm(): Promise<ConsentInfo>;
  getGdprApplies(): Promise<boolean | undefined>;
  configure(): Promise<unknown>;
  initialize(): Promise<unknown>;
}

export function isEnabled(config: TestConfig): boolean {
  return config.mode === 'test' && config.audienceApproved === true
    && config.appId === TEST_APP_ID && config.bannerId === TEST_BANNER_ID;
}

export function readEmbeddedConfig(manifest: unknown): TestConfig {
  try {
    if (typeof manifest !== 'string') return {};
    const value = JSON.parse(manifest)?.extra?.belugaAdvertising;
    return value && typeof value === 'object' ? value : {};
  } catch { return {}; }
}

// canRequestAds/OBTAINED alone are not affirmative purpose/vendor acceptance.
// This first phase cannot reliably prove all regulated permissions, so it
// suppresses those cases even if UMP would allow limited ads.
export function permitsBanner(info: ConsentInfo, gdpr: boolean | undefined): boolean {
  return info.canRequestAds === true && info.status === 'NOT_REQUIRED'
    && gdpr === false && info.privacyOptionsRequirementStatus === 'NOT_REQUIRED';
}

const EMPTY = { privacyRequired: false, revision: 0, error: '' };

export class AdvertisingController {
  private adapter?: AdsAdapter;
  private state = EMPTY;
  private listeners = new Set<() => void>();
  private launchRefresh?: Promise<void>;
  private initialization?: Promise<unknown>;
  private formBusy = false;

  constructor(
    readonly config: TestConfig,
    private load: () => AdsAdapter,
  ) {}

  get enabled() { return isEnabled(this.config); }
  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };

  private update(info?: ConsentInfo, error = '') {
    this.state = {
      privacyRequired: info
        ? info.privacyOptionsRequirementStatus === 'REQUIRED'
        : this.state.privacyRequired,
      revision: this.state.revision + 1,
      error,
    };
    this.listeners.forEach(listener => listener());
  }

  refreshAtLaunch = (): Promise<void> => {
    if (!this.enabled) return Promise.resolve();
    if (!this.launchRefresh) {
      this.launchRefresh = (async () => {
        try {
          this.adapter = this.load();
          this.update(await this.adapter.requestInfoUpdate());
        } catch {
          this.update(undefined, 'Advertising privacy information is unavailable.');
        }
      })();
    }
    return this.launchRefresh;
  };

  prepareHome = async (isSafe: () => boolean): Promise<boolean> => {
    if (!this.enabled || !isSafe()) return false;
    await this.refreshAtLaunch();
    const sdk = this.adapter;
    if (!sdk || this.state.error || !isSafe() || this.formBusy) return false;
    try {
      let info = await sdk.getConsentInfo();
      if (!isSafe()) return false;
      if (info.status === 'REQUIRED' && info.isConsentFormAvailable) {
        this.formBusy = true;
        try { info = await sdk.loadAndShowConsentFormIfRequired(); }
        finally { this.formBusy = false; }
      }
      this.update(info);
      if (!isSafe() || !permitsBanner(info, await sdk.getGdprApplies())) return false;
      if (!isSafe()) return false;
      if (!this.initialization) {
        this.initialization = (async () => {
          await sdk.configure();
          if (!isSafe()) return false;
          await sdk.initialize();
          return true;
        })();
      }
      const initialized = await this.initialization;
      if (initialized === false) this.initialization = undefined;
      return initialized !== false && isSafe() && !this.formBusy;
    } catch {
      this.initialization = undefined;
      this.update(undefined, 'Advertising is unavailable. Your workout is unaffected.');
      return false;
    }
  };

  showPrivacyOptions = async (isSafe: () => boolean): Promise<void> => {
    const sdk = this.adapter;
    if (!this.enabled || !sdk || !isSafe() || this.formBusy || !this.state.privacyRequired) return;
    this.formBusy = true;
    // Notify consumers before the form: remove any eligible banner.
    this.update({ privacyOptionsRequirementStatus: 'REQUIRED' } as ConsentInfo);
    try {
      await sdk.showPrivacyOptionsForm();
      if (isSafe()) this.update(await sdk.getConsentInfo());
    } catch {
      this.update({ privacyOptionsRequirementStatus: 'REQUIRED' } as ConsentInfo,
        'Could not open advertising privacy options. Please try again.');
    } finally { this.formBusy = false; }
  };
}
