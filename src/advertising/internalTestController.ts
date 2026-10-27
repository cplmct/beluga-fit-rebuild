import {
  AdsAdapter, ConsentInfo, TestConfig, TEST_APP_ID, TEST_BANNER_ID, consentFlowAllowsRequests,
} from './controller';

type InternalAdapter = Omit<AdsAdapter, 'getUserChoices'>;
interface InternalState {
  active: boolean;
  busy: boolean;
  ready: boolean;
  privacyRequired: boolean;
  error: string;
}

export function isInternalTestConfig(config: TestConfig): boolean {
  return config.buildProfile === 'internal-ad-rendering' && config.mode === 'internal-test'
    && config.audienceApproved === false
    && config.appId === TEST_APP_ID && config.bannerId === TEST_BANNER_ID;
}

// Owner-operated emulator rendering only, NOT a real-user permission evaluator.
// No launch hook, persistence, consent reset, fabricated choice or real gate mutation.
export class InternalTestAdsController {
  private state: InternalState = {
    active: false, busy: false, ready: false, privacyRequired: false, error: '',
  };
  private listeners = new Set<() => void>();
  private epoch = 0;
  private adapter?: InternalAdapter;
  private initialized = false;

  constructor(
    private readonly config: TestConfig,
    private readonly isEmulator: () => boolean,
    private readonly load: () => InternalAdapter,
  ) {}

  get enabled() { return isInternalTestConfig(this.config) && this.isEmulator(); }
  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };
  private update(patch: Partial<InternalState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach(listener => listener());
  }
  private updatePrivacy(info: ConsentInfo) {
    this.update({ privacyRequired: info.privacyOptionsRequirementStatus === 'REQUIRED' });
  }

  stop = () => {
    this.epoch++;
    this.update({ active: false, ready: false, error: '' });
    // Keep busy until a native call already in flight settles. It cannot be
    // cancelled by JS; a second session must not race a pending native form.
  };

  failBanner = () => {
    this.stop();
    this.update({ error: 'Test banner unavailable (no fill or network/SDK error). Start again manually.' });
  };

  start = async (isSafe: () => boolean): Promise<void> => {
    if (!this.enabled || !isSafe() || this.state.busy || this.state.active) return;
    const epoch = ++this.epoch;
    const valid = () => epoch === this.epoch && this.enabled && isSafe();
    this.update({ active: true, busy: true, ready: false, error: '' });
    try {
      const sdk = this.adapter ??= this.load();
      const refreshed = await sdk.requestInfoUpdate();
      if (!valid()) return;
      this.updatePrivacy(refreshed);
      // Documented UMP flow even for sample inventory. Never reset consent,
      // force geography/status, or use a form error as permission.
      await sdk.loadAndShowConsentFormIfRequired();
      if (!valid()) return;
      const info = await sdk.getConsentInfo();
      if (!valid()) return;
      this.updatePrivacy(info);
      if (!consentFlowAllowsRequests(info)) {
        this.update({ active: false, error: 'UMP has not permitted ad requests. Test session blocked.' });
        return;
      }
      await sdk.configure();
      if (!valid()) return;
      if (!this.initialized) {
        await sdk.initialize();
        this.initialized = true;
      }
      if (valid()) this.update({ ready: true });
    } catch {
      if (valid()) this.update({
        active: false, ready: false,
        error: 'Test session unavailable. No consent or SDK error is bypassed. Start again manually.',
      });
    } finally {
      if (epoch !== this.epoch || !isSafe()) this.update({ active: false, ready: false });
      this.update({ busy: false });
    }
  };

  showPrivacyOptions = async (isSafe: () => boolean): Promise<void> => {
    if (!this.enabled || !isSafe() || this.state.busy || !this.state.privacyRequired || !this.adapter) return;
    this.stop();
    const epoch = this.epoch;
    this.update({ busy: true });
    try {
      await this.adapter.showPrivacyOptionsForm();
      if (epoch !== this.epoch || !isSafe()) return;
      const info = await this.adapter.getConsentInfo();
      if (epoch === this.epoch && isSafe()) this.updatePrivacy(info);
    } catch {
      if (epoch === this.epoch && isSafe()) this.update({ error: 'Test privacy options unavailable.' });
    } finally {
      this.update({ busy: false }); // Explicit Start is required after any options change.
    }
  };
}
