-- ============================================================
-- Beluga Fit — Active Plan Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
--
-- REQUIRED before the "Start This Plan" button will persist.
-- These columns are also included in supabase_migration.sql —
-- if you have already run that file, this is a no-op (safe to re-run).
-- ============================================================

-- Active workout plan stored per-user on the profile row.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS active_plan_id TEXT DEFAULT NULL;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS active_plan_start_date TIMESTAMPTZ DEFAULT NULL;

-- ── Verification ─────────────────────────────────────────────
-- Run this after the block above to confirm the columns exist.
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('active_plan_id', 'active_plan_start_date')
ORDER BY column_name;
