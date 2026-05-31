import { useState, useRef, useEffect, useCallback } from 'react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline';

/**
 * Lightweight per-screen hook for tracking save/sync confidence.
 *
 * Status machine:
 *   idle → saving → saved (auto-resets to idle after 2.5 s)
 *                 → error
 *                 → offline  (detected from network-related error messages)
 *
 * Use setSaving() at the start of a write, setSuccess() on completion,
 * setError(err) in the catch block.  reset() returns to idle at any time.
 */
export function useSaveStatus() {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up the auto-reset timer on unmount.
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const setSaving = useCallback(() => {
    clearTimer();
    setStatus('saving');
  }, []);

  const setSuccess = useCallback(() => {
    clearTimer();
    setStatus('saved');
    // Auto-dismiss the "Saved" confirmation after 2.5 s — unobtrusive.
    timer.current = setTimeout(() => setStatus('idle'), 2500);
  }, []);

  /**
   * Call in catch blocks.  Inspects the error message to distinguish
   * genuine network failures ("offline") from server/API errors ("error").
   * This avoids showing misleading "no connection" UI for API errors.
   */
  const setError = useCallback((err?: unknown) => {
    clearTimer();
    const msg = err instanceof Error ? err.message : String(err ?? '');
    const isOffline = /network|fetch|offline|internet|unreachable|failed to fetch/i.test(msg);
    setStatus(isOffline ? 'offline' : 'error');
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setStatus('idle');
  }, []);

  return { status, setSaving, setSuccess, setError, reset };
}
