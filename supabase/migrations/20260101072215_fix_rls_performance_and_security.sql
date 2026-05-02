/*
  # Fix RLS Performance and Security Issues

  ## Overview
  This migration optimizes RLS policies and fixes security issues identified by Supabase.

  ## Changes

  ### 1. Optimize RLS Policies
  All policies now use `(select auth.uid())` instead of `auth.uid()` directly.
  This prevents re-evaluation of the function for each row, significantly improving query performance at scale.

  ### 2. Tables Updated
  - `profiles` - 3 policies optimized
  - `workouts` - 4 policies optimized  
  - `workout_exercises` - 4 policies optimized
  - `body_measurements` - 4 policies optimized
  - `ai_workout_plans` - 4 policies optimized

  ### 3. Function Security
  - Fix `handle_new_user` function to use stable search_path
  - Explicitly set search_path to 'public, auth' for security

  ### 4. Index Cleanup
  - Drop `ai_workout_plans_created_at_idx` (unused index)
  - Keep user_id indexes (critical for RLS performance despite "unused" warnings)

  ## Security Notes
  - All RLS policies remain restrictive and secure
  - Performance improved without compromising security
  - Function search_path now stable and secure
*/

-- =====================================================
-- PROFILES TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- =====================================================
-- WORKOUTS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can insert own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can update own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can delete own workouts" ON workouts;

CREATE POLICY "Users can view own workouts"
  ON workouts FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own workouts"
  ON workouts FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own workouts"
  ON workouts FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own workouts"
  ON workouts FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- =====================================================
-- WORKOUT_EXERCISES TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own workout exercises" ON workout_exercises;
DROP POLICY IF EXISTS "Users can insert own workout exercises" ON workout_exercises;
DROP POLICY IF EXISTS "Users can update own workout exercises" ON workout_exercises;
DROP POLICY IF EXISTS "Users can delete own workout exercises" ON workout_exercises;

CREATE POLICY "Users can view own workout exercises"
  ON workout_exercises FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert own workout exercises"
  ON workout_exercises FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update own workout exercises"
  ON workout_exercises FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete own workout exercises"
  ON workout_exercises FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = (select auth.uid())
    )
  );

-- =====================================================
-- BODY_MEASUREMENTS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own measurements" ON body_measurements;
DROP POLICY IF EXISTS "Users can insert own measurements" ON body_measurements;
DROP POLICY IF EXISTS "Users can update own measurements" ON body_measurements;
DROP POLICY IF EXISTS "Users can delete own measurements" ON body_measurements;

CREATE POLICY "Users can view own measurements"
  ON body_measurements FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own measurements"
  ON body_measurements FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own measurements"
  ON body_measurements FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own measurements"
  ON body_measurements FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- =====================================================
-- AI_WORKOUT_PLANS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own AI plans" ON ai_workout_plans;
DROP POLICY IF EXISTS "Users can insert own AI plans" ON ai_workout_plans;
DROP POLICY IF EXISTS "Users can update own AI plans" ON ai_workout_plans;
DROP POLICY IF EXISTS "Users can delete own AI plans" ON ai_workout_plans;

CREATE POLICY "Users can view own AI plans"
  ON ai_workout_plans FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own AI plans"
  ON ai_workout_plans FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own AI plans"
  ON ai_workout_plans FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own AI plans"
  ON ai_workout_plans FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- =====================================================
-- FIX FUNCTION SEARCH PATH
-- =====================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

-- =====================================================
-- INDEX CLEANUP
-- =====================================================

DROP INDEX IF EXISTS ai_workout_plans_created_at_idx;
