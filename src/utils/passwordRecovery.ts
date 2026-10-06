export type RecoveryLinkStatus = 'idle' | 'processing' | 'invalid' | 'expired' | 'failed' | 'ready';
export type RecoveryLinkState = { status: RecoveryLinkStatus; message: string };
export type ParsedRecoveryLink =
  | { status: 'valid'; accessToken: string; refreshToken: string }
  | { status: 'invalid' | 'expired'; message: string };

const INVALID = 'This reset link is invalid. Request another reset link.';
const EXPIRED = 'This reset link has expired. Request another reset link.';
export const RECOVERY_CLEANUP_MESSAGE = 'Finish local account cleanup before resetting your password. Then request another reset link.';
const AUTH_PARAMS = ['access_token', 'refresh_token', 'type', 'code', 'error', 'error_code', 'error_description'];

/** Exact destination only. Never merge query/fragment credentials. A fragment
 * takes precedence over non-auth query metadata; auth in both is ambiguous.
 * Tokens exist only in this local return value, never in React/UI state. */
export function parseRecoveryUrl(value: string): ParsedRecoveryLink {
  try {
    if (!value || value !== value.trim()) return { status: 'invalid', message: INVALID };
    const url = new URL(value);
    if (url.protocol !== 'belugafit:' || url.hostname !== 'reset-password' ||
        url.pathname !== '' || url.port || url.username || url.password) {
      return { status: 'invalid', message: INVALID };
    }
    const query = url.search.slice(1);
    const fragment = url.hash.slice(1);
    // URLSearchParams tolerates invalid escapes; explicitly validate first.
    for (const raw of [query, fragment]) decodeURIComponent(raw);
    const queryParams = new URLSearchParams(query);
    const fragmentParams = new URLSearchParams(fragment);
    if (fragment && AUTH_PARAMS.some(key => queryParams.has(key))) {
      return { status: 'invalid', message: INVALID };
    }
    const params = fragment ? fragmentParams : queryParams;
    if (AUTH_PARAMS.some(key => params.getAll(key).length > 1)) {
      return { status: 'invalid', message: INVALID };
    }
    if (params.has('error') || params.has('error_code') || params.has('error_description')) {
      const expired = /expired/i.test(`${params.get('error_code')} ${params.get('error_description')}`);
      return { status: expired ? 'expired' : 'invalid', message: expired ? EXPIRED : INVALID };
    }
    if (params.has('code')) {
      return { status: 'invalid', message: 'This reset link format is not supported. Request another reset link.' };
    }
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    if (params.get('type') !== 'recovery' || !accessToken?.trim() || !refreshToken?.trim()) {
      return { status: 'invalid', message: INVALID };
    }
    return { status: 'valid', accessToken, refreshToken };
  } catch {
    return { status: 'invalid', message: INVALID };
  }
}

export function recoverySessionFailure(error: { code?: string; message?: string }): RecoveryLinkState {
  // Classify, but never display/log the provider's potentially sensitive text.
  const expired = /expired|refresh_token_not_found|refresh_token_already_used/i.test(`${error.code ?? ''} ${error.message ?? ''}`);
  return { status: expired ? 'expired' : 'failed', message: expired ? EXPIRED :
    'Couldn’t open this reset link. It may be invalid or unavailable. Check your connection or request another reset link.' };
}

/** Keep meaningful returned Auth errors, but never render an object or "{}"
 * as the only guidance when a transport returns a nonstandard error body. */
export function recoveryActionError(error: { message?: unknown }, fallback: string): string {
  const message = typeof error.message === 'string' ? error.message.trim() : '';
  return message && !/^(?:\{\s*\}|\[\s*\]|\[object Object\])$/i.test(message)
    ? message : fallback;
}
