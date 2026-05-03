-- ============================================================
-- Beluga Fit — Row Level Security
-- Run this entire file in the Supabase SQL Editor.
-- ============================================================


-- ── 1. Enable RLS on all four tables ─────────────────────────

ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;


-- ── 2. Drop existing policies (safe to re-run) ────────────────

DO $$ DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE tablename IN ('profiles','workouts','workout_exercises','body_measurements')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
  END LOOP;
END $$;


-- ── 3. profiles ───────────────────────────────────────────────

CREATE POLICY "profiles: select own"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles: insert own"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles: update own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles: delete own"
  ON profiles FOR DELETE
  TO authenticated
  USING (id = auth.uid());


-- ── 4. workouts ───────────────────────────────────────────────

CREATE POLICY "workouts: select own"
  ON workouts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "workouts: insert own"
  ON workouts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "workouts: update own"
  ON workouts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "workouts: delete own"
  ON workouts FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());


-- ── 5. workout_exercises ──────────────────────────────────────

CREATE POLICY "workout_exercises: select own"
  ON workout_exercises FOR SELECT
  TO authenticated
  USING (
    workout_id IN (
      SELECT id FROM workouts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "workout_exercises: insert own"
  ON workout_exercises FOR INSERT
  TO authenticated
  WITH CHECK (
    workout_id IN (
      SELECT id FROM workouts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "workout_exercises: update own"
  ON workout_exercises FOR UPDATE
  TO authenticated
  USING (
    workout_id IN (
      SELECT id FROM workouts WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    workout_id IN (
      SELECT id FROM workouts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "workout_exercises: delete own"
  ON workout_exercises FOR DELETE
  TO authenticated
  USING (
    workout_id IN (
      SELECT id FROM workouts WHERE user_id = auth.uid()
    )
  );


-- ── 6. body_measurements ──────────────────────────────────────

CREATE POLICY "body_measurements: select own"
  ON body_measurements FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "body_measurements: insert own"
  ON body_measurements FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "body_measurements: update own"
  ON body_measurements FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "body_measurements: delete own"
  ON body_measurements FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());


-- ── 7. Verification ───────────────────────────────────────────
-- Run this after the block above to confirm everything is set up.

SELECT
  c.relname                          AS "table",
  c.relrowsecurity                   AS "rls_enabled",
  c.relforcerowsecurity              AS "rls_forced",
  COUNT(p.policyname)                AS "policy_count"
FROM pg_class c
LEFT JOIN pg_policies p
  ON p.tablename = c.relname
WHERE c.relname IN ('profiles','workouts','workout_exercises','body_measurements')
  AND c.relkind = 'r'
GROUP BY c.relname, c.relrowsecurity, c.relforcerowsecurity
ORDER BY c.relname;
