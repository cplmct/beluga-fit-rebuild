import { NativeModules } from 'react-native';

export type GdprApplicability = 'missing' | 'not-applicable' | 'applicable' | 'invalid';

function failure(code: 'applicability-unavailable' | 'applicability-read-failed') {
  return Object.assign(new Error('Applicability unavailable.'), { code });
}

// Called only by the exact sample-only public test flow, never at import time.
export async function readGdprApplicability(): Promise<GdprApplicability> {
  let bridge: { readGdprApplicability?: () => Promise<unknown> } | undefined;
  let read: (() => Promise<unknown>) | undefined;
  try {
    bridge = NativeModules.BelugaGdprApplicability;
    read = bridge?.readGdprApplicability;
  } catch {
    throw failure('applicability-unavailable');
  }
  if (typeof read !== 'function') {
    throw failure('applicability-unavailable');
  }
  try {
    const value = await read.call(bridge);
    return value === 'missing' || value === 'not-applicable' || value === 'applicable'
      || value === 'invalid' ? value : 'invalid';
  } catch {
    throw failure('applicability-read-failed');
  }
}
