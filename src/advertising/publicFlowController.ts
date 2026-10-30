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

export type PublicPhase = 'blocked' | 'refreshing' | 'awaiting-form' | 'checking'
  | 'initializing' | 'eligible' | 'loading' | 'loaded' | 'failed';

// Never expose raw SDK messages/codes (which can contain identifiers or URLs).
export function publicErrorCode(error: unknown): string {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : null;
  for (const known of ['no-fill', 'network-error', 'invalid-request', 'internal-error', 'timeout']) {
    if (code === known || code === `googleMobileAds/${known}`
      || code === `googleMobileAds/error-code-${known}`) return known;
  }
  return 'sdk-error';
}

const initialState = () => ({
  owner: null as string | null, declaration: 'unknown' as AgeDeclaration,
  loaded: false, saving: false, busy: false, ready: false, privacyRequired: false,
  refresh: 'needed' as 'needed' | 'ok' | 'failed',
  reason: 'age-unresolved', error: '', trigger: 0,
  phase: 'blocked' as PublicPhase, errorCode: '', bannerAttempted: false,
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
        this.update({ phase: 'failed', errorCode: 'storage-read-failed',
          error: 'Could not read your advertising age choice. Tracking is unaffected.' });
      }
    }
    if (version === this.ownerVersion) this.trigger();
  };

  declare = async (owner: string, declaration: AgeDeclaration): Promise<void> => {
    if (!this.enabled || owner !== this.state.owner || this.state.saving || !isDeclaration(declaration)) return;
    const version = ++this.ownerVersion;
    this.generation++;
    this.update({ ready: false, loaded: false, saving: true, declaration: 'unknown',
      refresh: 'needed', error: '', reason: 'age-saving', phase: 'blocked',
      errorCode: '', bannerAttempted: false });
    try {
      await this.store.write(owner, declaration);
      if (version !== this.ownerVersion) return;
      this.update({ declaration, loaded: true, saving: false,
        reason: declaration === 'adult' ? 'consent-needed' : 'age-ineligible' });
    } catch {
      if (version === this.ownerVersion) {
        this.update({ saving: false, phase: 'failed', errorCode: 'storage-write-failed',
          error: 'Could not save your advertising age choice. Advertising stays off.' });
      }
    }
    if (version === this.ownerVersion) this.trigger();
  };

  suspend = () => {
    this.generation++;
    this.update({ ready: false, bannerAttempted: false,
      phase: this.state.error ? 'failed' : 'blocked' });
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
    this.update({ refresh: 'needed', error: '', errorCode: '', reason: 'consent-needed', phase: 'blocked' });
    this.trigger();
  };
  failBanner = (error?: unknown) => {
    this.suspend();
    this.update({ phase: 'failed', bannerAttempted: true, errorCode: publicErrorCode(error),
      reason: 'banner-unavailable', error: 'Advertising is unavailable. Tracking is unaffected.' });
  };
  createBannerCallbacks = () => {
    const generation = this.generation;
    const valid = () => generation === this.generation && this.adult() && this.state.ready;
    return {
      onLoadStart: () => {
        if (valid()) this.update({ bannerAttempted: true,
          phase: this.state.phase === 'loaded' ? 'loaded' : 'loading' });
      },
      onAdLoaded: () => { if (valid()) this.update({ phase: 'loaded', bannerAttempted: true }); },
      onAdFailedToLoad: (error: unknown) => { if (valid()) this.failBanner(error); },
    };
  };
  private block(reason: string) {
    this.update({ reason, phase: 'blocked', bannerAttempted: false });
  }
  private privacy(info: ConsentInfo) {
    this.update({ privacyRequired: info.privacyOptionsRequirementStatus === 'REQUIRED' });
  }

  prepareHome = async (isSafe: () => boolean): Promise<void> => {
    if (!this.adult() || !isSafe() || this.running || this.state.refresh === 'failed' || this.state.error) return;
    const generation = this.generation;
    const valid = () => generation === this.generation && this.adult() && isSafe();
    this.running = true;
    this.update({ busy: true, ready: false, phase: 'checking' });
    try {
      const sdk = this.sdk ??= this.load();
      if (this.state.refresh !== 'ok') {
        try {
          this.update({ phase: 'refreshing' });
          const updated = await sdk.requestInfoUpdate();
          if (!valid()) return;
          this.privacy(updated);
          this.update({ refresh: 'ok' });
        } catch (error) {
          if (valid()) this.update({ refresh: 'failed', reason: 'refresh-failed', phase: 'failed',
            bannerAttempted: false, errorCode: publicErrorCode(error),
            error: 'Advertising privacy refresh failed. Advertising stays off; tracking is unaffected.' });
          return;
        }
      }
      // This API decides whether a form is required; do not infer acceptance
      // from OBTAINED or bypass a required form after an update.
      // This stage means the required-form API is pending, NOT proof a form is visible.
      this.update({ phase: 'awaiting-form' });
      await sdk.loadAndShowConsentFormIfRequired();
      if (!valid()) return;
      this.update({ phase: 'checking' });
      const info = await sdk.getConsentInfo();
      if (!valid()) return;
      this.privacy(info);
      if (info.canRequestAds !== true) { this.block('ump-not-ready'); return; }
      const applies = await sdk.getGdprApplies();
      if (!valid()) return;
      // NOT_REQUIRED plus a positive TCF flag is inconsistent, not an
      // invitation to use a possibly stale flag to enable requests.
      if (applies !== true || info.status !== 'OBTAINED') {
        this.block('applicability-unresolved'); return;
      }
      const purposes = await sdk.getPurposeConsents();
      if (!valid()) return;
      const reason = purposeOneVeto(applies, purposes);
      this.update({ reason });
      if (reason) { this.block(reason); return; }
      this.update({ phase: 'initializing' });
      await sdk.configure();
      if (!valid()) return;
      if (!this.initialized) {
        await sdk.initialize();
        this.initialized = true;
      }
      if (valid()) this.update({ ready: true, phase: 'eligible', errorCode: '' });
    } catch (error) {
      if (valid()) this.update({ reason: 'consent-or-sdk-error', phase: 'failed',
        bannerAttempted: false, errorCode: publicErrorCode(error),
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
    this.update({ busy: true, refresh: 'needed', reason: 'privacy-options', error: '',
      errorCode: '', phase: 'awaiting-form' });
    try {
      await this.afterBannerRemoval();
      if (!valid()) return;
      await this.sdk.showPrivacyOptionsForm();
      if (!valid()) return;
      this.update({ phase: 'checking' });
      const info = await this.sdk.getConsentInfo();
      if (valid()) this.privacy(info);
    } catch (error) {
      if (valid()) this.update({ phase: 'failed', errorCode: publicErrorCode(error),
        error: 'Could not open advertising privacy options. Advertising stays off.' });
    } finally {
      this.running = false;
      this.update({ busy: false, phase: this.state.error ? 'failed' : 'blocked' });
      // Next Home must refresh and reassess, never reuse pre-form eligibility.
      this.trigger();
    }
  };
}
