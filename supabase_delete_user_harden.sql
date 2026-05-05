-- ============================================================
-- Beluga Fit — Hardened delete_user() function
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================
--
-- AUDIT SUMMARY
-- ─────────────
-- Tables confirmed in use (from RLS policies + all app source):
--
--   profiles          FK: id = auth.uid()   (NOT user_id — confirmed by RLS)
--   workouts          FK: user_id
--   workout_exercises FK: workout_id        (child of workouts; no direct user_id)
--   body_measurements FK: user_id
--
-- ai_workout_plans: not referenced anywhere in the app's TypeScript source.
--   Included with an existence guard in case it exists in the database.
--
-- Supabase Storage buckets: NONE found in the app.
--   All "storage" in the codebase is AsyncStorage (local device only).
--   Nothing will block auth.users deletion.
--
-- Notification preferences: stored in AsyncStorage only (beluga_notif_prefs,
--   beluga_notif_id). No Supabase table involved — no server-side cleanup needed.
--   The client already clears these on sign-out.
--
-- WHY SECURITY DEFINER IS REQUIRED
-- ─────────────────────────────────
-- The authenticated role cannot delete from auth.users directly.
-- SECURITY DEFINER allows the function to run with the privileges of its
-- definer (postgres), which has access to the auth schema.
-- SET search_path = public prevents search-path injection attacks.
-- The explicit auth.uid() check ensures a user can only delete their own row.
--
-- WHAT CHANGED FROM THE ORIGINAL
-- ────────────────────────────────
-- 1. EXCEPTION block now uses RAISE EXCEPTION instead of
--    RETURN json_build_object('error', ...). The old version returned errors
--    as a successful JSON payload — supabase.rpc() saw error: null and silently
--    swallowed every failure. Now errors surface as { error: { message: "..." } }.
--
-- 2. Return type changed from json to void. Cleaner — the client only needs to
--    check whether error is null.
--
-- 3. profiles.id (not profiles.user_id) is confirmed as the auth FK.
--    The DELETE uses WHERE id = uid, matching the actual RLS policies.
--
-- 4. Cleanup order is explicit and dependency-safe:
--    workout_exercises → workouts → body_measurements
--    → ai_workout_plans (guarded) → profiles → auth.users
--
-- 5. ai_workout_plans delete is wrapped in an information_schema existence check
--    so the function succeeds whether or not that table exists.
-- ============================================================


CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid;
BEGIN
  -- Resolve the caller's identity server-side. Never trust a client-supplied ID.
  uid := auth.uid();

  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- ── Step 1: workout_exercises ──────────────────────────────────────────────
  -- No direct user_id column. Delete via the parent workouts rows.
  DELETE FROM workout_exercises
  WHERE workout_id IN (
    SELECT id FROM workouts WHERE user_id = uid
  );

  -- ── Step 2: workouts ───────────────────────────────────────────────────────
  DELETE FROM workouts
  WHERE user_id = uid;

  -- ── Step 3: body_measurements ──────────────────────────────────────────────
  DELETE FROM body_measurements
  WHERE user_id = uid;

  -- ── Step 4: ai_workout_plans (guarded) ────────────────────────────────────
  -- This table is not used in the current app but may exist from an earlier
  -- schema version. The existence check prevents a runtime error either way.
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name   = 'ai_workout_plans'
  ) THEN
    EXECUTE 'DELETE FROM ai_workout_plans WHERE user_id = $1' USING uid;
  END IF;

  -- ── Step 5: profiles ───────────────────────────────────────────────────────
  -- profiles.id is the auth FK (confirmed by RLS: USING (id = auth.uid())).
  -- This is NOT profiles.user_id.
  DELETE FROM profiles
  WHERE id = uid;

  -- ── Step 6: auth.users ─────────────────────────────────────────────────────
  -- Must be last. Requires SECURITY DEFINER to access the auth schema.
  -- Deleting this row immediately invalidates all active sessions for this user.
  DELETE FROM auth.users
  WHERE id = uid;

EXCEPTION
  WHEN OTHERS THEN
    -- Re-raise as a real PostgreSQL exception so supabase.rpc() surfaces it as
    -- { error: { message: "..." } } instead of a silent success payload.
    RAISE EXCEPTION '%', SQLERRM;
END;
$$;

-- Only authenticated users may call this function.
-- Unauthenticated callers will fail the auth.uid() IS NULL check above even
-- if they somehow invoke it directly.
GRANT EXECUTE ON FUNCTION delete_user() TO authenticated;


-- ============================================================
-- VERIFICATION QUERY
-- Run this after the block above to confirm the function exists
-- with the correct security settings.
-- ============================================================
SELECT
  p.proname                              AS function_name,
  p.prosecdef                            AS security_definer,
  pg_get_function_result(p.oid)          AS return_type,
  pg_get_functiondef(p.oid)              AS definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE p.proname = 'delete_user'
  AND n.nspname = 'public';
