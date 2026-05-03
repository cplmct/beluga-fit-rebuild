-- ============================================================
-- Beluga Fit — Database Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Unit preference (metric / imperial) on each user's profile
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS unit_system TEXT DEFAULT 'metric'
    CHECK (unit_system IN ('metric', 'imperial'));

-- 2. Active plan stored in Supabase (replaces local file storage)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS active_plan_id TEXT DEFAULT NULL;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS active_plan_start_date TIMESTAMPTZ DEFAULT NULL;

-- 3. Workout duration tracking
ALTER TABLE workouts
  ADD COLUMN IF NOT EXISTS duration_seconds INTEGER DEFAULT NULL;

-- 4. Personal record flag on each exercise entry
ALTER TABLE workout_exercises
  ADD COLUMN IF NOT EXISTS is_pr BOOLEAN DEFAULT FALSE;

-- ============================================================
-- Done. All columns use IF NOT EXISTS so it is safe to re-run.
-- ============================================================
