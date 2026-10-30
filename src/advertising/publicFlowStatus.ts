import type { PublicFlowController } from './publicFlowController';

type Snapshot = ReturnType<PublicFlowController['getSnapshot']>;
const reasons = new Set(['age-unresolved', 'age-ineligible', 'age-saving', 'consent-needed',
  'refresh-failed', 'ump-not-ready', 'applicability-unresolved', 'purpose-one-unresolved',
  'purpose-one-refused', 'consent-or-sdk-error', 'privacy-options', 'banner-unavailable', '']);
const errors = new Set(['', 'storage-read-failed', 'storage-write-failed', 'sdk-error',
  'no-fill', 'network-error', 'invalid-request', 'internal-error', 'timeout']);
const phases = new Set(['blocked', 'refreshing', 'awaiting-form', 'checking', 'initializing',
  'eligible', 'loading', 'loaded', 'failed']);

// Call only inside the exact sample-only public-flow branch. No owner, age
// category, consent strings, raw messages or arbitrary SDK fields are formatted.
export function publicFlowStatus(state: Snapshot, owned: boolean, safe: boolean, width: number) {
  if (!owned) return { reserve: false,
    text: 'TEST ads: view=blocked; controller=unavailable; reason=owner-unresolved; error=none' };
  const adult = state.loaded && !state.saving && state.declaration === 'adult';
  const reason = !safe ? 'surface-paused' : !adult && !state.error ? 'age-ineligible'
    : width < 320 && state.ready ? 'insufficient-width'
    : reasons.has(state.reason) ? state.reason || 'none' : 'unknown';
  const phase = phases.has(state.phase) ? state.phase : 'blocked';
  const view = !safe ? 'blocked' : !adult && !state.error ? 'blocked'
    : width < 320 && state.ready ? 'blocked' : phase;
  return {
    reserve: safe && adult && width >= 320 && (state.ready || state.bannerAttempted),
    text: `TEST ads: view=${view}; controller=${phase}; reason=${reason}; error=${
      errors.has(state.errorCode) ? state.errorCode || 'none' : 'sdk-error'
    }${phase === 'awaiting-form' ? ' (form API pending; visibility unverified)' : ''}`,
  };
}
