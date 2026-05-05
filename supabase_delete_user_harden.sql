/*
  delete_user() — hardened replacement
  =====================================
  Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query).

  Changes from the original:
  1. EXCEPTION block now uses RAISE EXCEPTION instead of RETURN json_build_object.
     Previously, errors inside the function were returned as a successful JSON
     payload { "error": "..." } — the Supabase client saw error: null and silently
     swallowed the failure. Now errors propagate as real PostgreSQL exceptions,
     which the client correctly surfaces as { error: { message: "..." } }.

  2. Client-side profiles delete removed from the app. The RPC is now the single
     authoritative place for all cleanup, making the operation atomic. If any
     step fails the whole transaction rolls back — no partial deletion states.

  3. Cleanup order is explicit and dependency-safe:
     workout_exercises → workouts → body_measurements → ai_workout_plans
     → profiles → auth.users

  4. The function still uses SECURITY DEFINER so it can access auth.users, and
     still validates auth.uid() so a user can only ever delete their own account.

  Security:
  - Only authenticated users can call this (GRANT EXECUTE ... TO authenticated).
  - auth.uid() is checked server-side — no client-supplied user ID is trusted.
  - SECURITY DEFINER + SET search_path = public prevents search-path injection.
*/

CREATE OR REPLACE FUNCTION delete_user()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_user_id uuid;
BEGIN
  deleted_user_id := auth.uid();

  IF deleted_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete child rows before parents to respect foreign key constraints.
  DELETE FROM workout_exercises
  WHERE workout_id IN (
    SELECT id FROM workouts WHERE user_id = deleted_user_id
  );

  DELETE FROM workouts
  WHERE user_id = deleted_user_id;

  DELETE FROM body_measurements
  WHERE user_id = deleted_user_id;

  -- ai_workout_plans may not exist in all environments; guard with a
  -- conditional delete so the function still runs even if the table is absent.
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'ai_workout_plans'
  ) THEN
    EXECUTE 'DELETE FROM ai_workout_plans WHERE user_id = $1'
    USING deleted_user_id;
  END IF;

  -- profiles is deleted last among public tables so FK references are clear.
  DELETE FROM profiles
  WHERE id = deleted_user_id;

  -- Remove the auth user. SECURITY DEFINER gives us access to auth.users.
  DELETE FROM auth.users
  WHERE id = deleted_user_id;

  RETURN json_build_object('success', true);

EXCEPTION
  WHEN OTHERS THEN
    -- Re-raise as a real PostgreSQL exception so the Supabase client surfaces
    -- it as { error: { message: "..." } } instead of a silent success payload.
    RAISE EXCEPTION '%', SQLERRM;
END;
$$;

-- Ensure only authenticated users can invoke this function.
GRANT EXECUTE ON FUNCTION delete_user() TO authenticated;
