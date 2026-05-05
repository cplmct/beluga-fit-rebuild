-- Migration: add notification preference columns to profiles
--
-- Run once in the Supabase SQL editor.
-- These columns store the user's chosen reminder time and style so that
-- preferences survive device reinstalls. The actual notification schedule
-- remains device-local (it must be re-registered by the app on each install),
-- but these values allow the app to restore the user's settings automatically.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS notif_enabled BOOLEAN  DEFAULT false,
  ADD COLUMN IF NOT EXISTS notif_hour    INTEGER  DEFAULT 8,
  ADD COLUMN IF NOT EXISTS notif_minute  INTEGER  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notif_type    TEXT     DEFAULT 'checkin';

-- Backfill existing rows with the defaults so no row has NULLs.
UPDATE profiles
SET
  notif_enabled = COALESCE(notif_enabled, false),
  notif_hour    = COALESCE(notif_hour,    8),
  notif_minute  = COALESCE(notif_minute,  0),
  notif_type    = COALESCE(notif_type,    'checkin')
WHERE
  notif_enabled IS NULL
  OR notif_hour    IS NULL
  OR notif_minute  IS NULL
  OR notif_type    IS NULL;
