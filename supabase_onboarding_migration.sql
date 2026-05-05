-- ============================================================
-- Beluga Fit — Onboarding persistence migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================
--
-- WHAT THIS DOES
-- ──────────────
-- 1. Adds onboarding_completed (BOOLEAN, default FALSE) to profiles.
--    New users who have no profile row yet are handled by the app:
--    a null result from maybeSingle() is treated as onboarding not done.
--
-- 2. Immediately marks every existing profile row as completed.
--    These are users who signed up before this migration and have already
--    seen (or skipped) onboarding. Without this UPDATE, every existing user
--    would be shown the onboarding flow again on their next app open.
--
-- SAFE TO RE-RUN
-- ──────────────
-- ADD COLUMN IF NOT EXISTS is idempotent.
-- The UPDATE only touches rows where the column is still FALSE, so
-- re-running after the initial migration is a no-op.
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;

-- Backfill: treat every user who already has a profile row as done.
UPDATE profiles
  SET onboarding_completed = TRUE
  WHERE onboarding_completed = FALSE;

-- ── Verification ───────────────────────────────────────────
-- Run this after the block above.
SELECT
  COUNT(*)                                          AS total_profiles,
  COUNT(*) FILTER (WHERE onboarding_completed)      AS completed,
  COUNT(*) FILTER (WHERE NOT onboarding_completed)  AS pending
FROM profiles;
