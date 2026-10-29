import { AdsAdapter, ConsentInfo, TestConfig, TEST_APP_ID, TEST_BANNER_ID } from './controller';
import { AgeDeclaration, AgeDeclarationStore, isDeclaration } from './ageDeclaration';

export type PublicFlowAdapter = Omit<AdsAdapter, 'getUserChoices'> & {
  getGdprApplies(): Promise<boolean>;
  getPurposeConsents(): Promise<string>;
};

export function isPublicFlowTest(config: TestConfig): boolean {
  return config.mode === 'public-flow-test' && config.buildProfile === 'public-ad-flow-test'
    && config.audienceApproved === false
    && config.appId === TEST_APP_ID && config.bannerId === TEST_BANNER_ID;
}

// UMP remains status authority. This is ONLY an extra supported Purpose 1 veto,
// not a purpose/vendor/LI/GPP engine. False includes absent native storage.
export function purposeOneVeto(applies: unknown, purposes: unknown): string {
  if (applies !== true) return 'applicability-unresolved';
  if (typeof purposes !== 'string' || !/^[01]{1,24}$/.test(purposes)) {
    return 'purpose-one-unresolved';
  }
  return purposes[0] === '1' ? '' : 'purpose-one-refused';
}

const initialState = () => ({
  owner: null as string | null, declaration: 'unknown' as AgeDeclaration,
  loaded: false, saving: false, busy: false, ready: false, privacyRequired: false,
  refresh: 'needed' as 'needed' | 'ok' | 'failed',
  reason: 'age-unresolved', error: '', trigger: 0,
});

export class PublicFlowController {
  private state = initialState();
  private listeners = new Set<() => void>();
  private ownerVersion = 0;
  private generation = 0;
  private sdk?: PublicFlowAdapter;
  private initialized = false;
  private running = false;
  constructor(
    private config: TestConfig,
    private store: AgeDeclarationStore,
    private load: () => PublicFlowAdapter,
    private afterBannerRemoval: () => Promise<void> = () => Promise.resolve(),
  ) {}
  get enabled() { return isPublicFlowTest(this.config); }
  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };
  private update(patch: Partial<ReturnType<typeof initialState>>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach(listener => listener());
  }
  private trigger() { this.update({ trigger: this.state.trigger + 1 }); }
  private adult() {
    return this.enabled && !!this.state.owner && this.state.loaded
      && !this.state.saving && this.state.declaration === 'adult';
  }

  setOwner = async (owner: string | null, reload = false): Promise<void> => {
    if (!this.enabled || (!reload && owner === this.state.owner)) return;
    const version = ++this.ownerVersion;
    this.generation++;
    this.state = { ...initialState(), owner, busy: this.running, trigger: this.state.trigger + 1 };
    this.listeners.forEach(listener => listener());
    if (!owner) return;
    try {
      const declaration = await this.store.read(owner);
      if (version !== this.ownerVersion) return;
      this.update({ declaration, loaded: true, reason: declaration === 'adult' ? 'consent-needed' : 'age-ineligible' });
    } catch {
      if (version === this.ownerVersion) {
        this.update({ error: 'Could not read your advertising age choice. Tracking is unaffected.' });
      }
    }
    if (version === this.ownerVersion) this.trigger();
  };

  declare = async (owner: string, declaration: AgeDeclaration): Promise<void> => {
    if (!this.enabled || owner !== this.state.owner || this.state.saving || !isDeclaration(declaration)) return;
    const version = ++this.ownerVersion;
    this.generation++;
    this.update({ ready: false, loaded: false, saving: true, declaration: 'unknown',
      refresh: 'needed', error: '', reason: 'age-saving' });
    try {
      await this.store.write(owner, declaration);
      if (version !== this.ownerVersion) return;
      this.update({ declaration, loaded: true, saving: false,
        reason: declaration === 'adult' ? 'consent-needed' : 'age-ineligible' });
    } catch {
      if (version === this.ownerVersion) {
        this.update({ saving: false, error: 'Could not save your advertising age choice. Advertising stays off.' });
      }
    }
    if (version === this.ownerVersion) this.trigger();
  };

  suspend = () => {
    this.generation++;
    this.update({ ready: false });
  };
  invalidateDeletedOwner = (owner: string) => {
    // Do not disturb B while retrying A's cleanup. Invalidate both storage and
    // SDK generations for A before any deletion/storage await.
    if (this.state.owner === owner) void this.setOwner(null);
  };
  removeDeclaration = async (owner: string): Promise<void> => {
    this.invalidateDeletedOwner(owner);
    await this.store.remove(owner);
  };
  retry = () => {
    if (!this.adult() || this.running) return;
    this.update({ refresh: 'needed', error: '', reason: 'consent-needed' });
    this.trigger();
  };
  failBanner = () => {
    this.suspend();
    this.update({ reason: 'banner-unavailable', error: 'Advertising is unavailable. Tracking is unaffected.' });
  };
  private privacy(info: ConsentInfo) {
    this.update({ privacyRequired: info.privacyOptionsRequirementStatus === 'REQUIRED' });
  }

  prepareHome = async (isSafe: () => boolean): Promise<void> => {
    if (!this.adult() || !isSafe() || this.running || this.state.refresh === 'failed' || this.state.error) return;
    const generation = this.generation;
    const valid = () => generation === this.generation && this.adult() && isSafe();
    this.running = true;
    this.update({ busy: true, ready: false });
    try {
      const sdk = this.sdk ??= this.load();
      if (this.state.refresh !== 'ok') {
        try {
          const updated = await sdk.requestInfoUpdate();
          if (!valid()) return;
          this.privacy(updated);
          this.update({ refresh: 'ok' });
        } catch {
          if (valid()) this.update({ refresh: 'failed', reason: 'refresh-failed',
            error: 'Advertising privacy refresh failed. Advertising stays off; tracking is unaffected.' });
          return;
        }
      }
      // This API decides whether a form is required; do not infer acceptance
      // from OBTAINED or bypass a required form after an update.
      await sdk.loadAndShowConsentFormIfRequired();
      if (!valid()) return;
      const info = await sdk.getConsentInfo();
      if (!valid()) return;
      this.privacy(info);
      if (info.canRequestAds !== true) { this.update({ reason: 'ump-not-ready' }); return; }
      const applies = await sdk.getGdprApplies();
      if (!valid()) return;
      // NOT_REQUIRED plus a positive TCF flag is inconsistent, not an
      // invitation to use a possibly stale flag to enable requests.
      if (applies !== true || info.status !== 'OBTAINED') {
        this.update({ reason: 'applicability-unresolved' }); return;
      }
      const purposes = await sdk.getPurposeConsents();
      if (!valid()) return;
      const reason = purposeOneVeto(applies, purposes);
      this.update({ reason });
      if (reason) return;
      await sdk.configure();
      if (!valid()) return;
      if (!this.initialized) {
        await sdk.initialize();
        this.initialized = true;
      }
      if (valid()) this.update({ ready: true });
    } catch {
      if (valid()) this.update({ reason: 'consent-or-sdk-error',
        error: 'Advertising is unavailable. Tracking is unaffected.' });
    } finally {
      this.running = false;
      this.update({ busy: false });
      if (generation !== this.generation) this.trigger();
    }
  };

  showPrivacyOptions = async (isSafe: () => boolean): Promise<void> => {
    if (!this.adult() || !this.sdk || !isSafe() || this.running || !this.state.privacyRequired) return;
    this.suspend();
    const generation = this.generation;
    const valid = () => generation === this.generation && this.adult() && isSafe();
    this.running = true;
    this.update({ busy: true, refresh: 'needed', reason: 'privacy-options', error: '' });
    try {
      await this.afterBannerRemoval();
      if (!valid()) return;
      await this.sdk.showPrivacyOptionsForm();
      if (!valid()) return;
      const info = await this.sdk.getConsentInfo();
      if (valid()) this.privacy(info);
    } catch {
      if (valid()) this.update({ error: 'Could not open advertising privacy options. Advertising stays off.' });
    } finally {
      this.running = false;
      this.update({ busy: false });
      // Next Home must refresh and reassess, never reuse pre-form eligibility.
      this.trigger();
    }
  };
}
