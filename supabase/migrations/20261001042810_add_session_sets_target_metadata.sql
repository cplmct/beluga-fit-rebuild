-- Additive only: no backfill, result-field changes, or application rollout.
-- Legacy clients omit all three columns and remain unclassified.
BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

ALTER TABLE public.session_sets
  ADD COLUMN target_kind text,
  ADD COLUMN target_value integer,
  ADD COLUMN target_raw text,

  ADD CONSTRAINT session_sets_target_kind_check
    CHECK (
      target_kind IS NULL
      OR target_kind IN ('reps', 'seconds', 'steps', 'unknown')
    ) NOT VALID,

  ADD CONSTRAINT session_sets_target_value_positive_check
    CHECK (
      target_value IS NULL
      OR target_value > 0
    ) NOT VALID,

  ADD CONSTRAINT session_sets_target_metadata_shape_check
    CHECK (
      (
        (
          target_kind IS NULL
          AND target_value IS NULL
          AND target_raw IS NULL
        )
        OR
        (
          target_kind IN ('reps', 'seconds', 'steps')
          AND target_value IS NOT NULL
          AND target_raw IS NULL
        )
        OR
        (
          target_kind = 'unknown'
          AND target_value IS NULL
          AND target_raw IS NOT NULL
          AND length(btrim(target_raw)) > 0
          AND target_raw ~ '[^[:space:]]'
        )
      ) IS TRUE
    ) NOT VALID;

ALTER TABLE public.session_sets
  VALIDATE CONSTRAINT session_sets_target_kind_check,
  VALIDATE CONSTRAINT session_sets_target_value_positive_check,
  VALIDATE CONSTRAINT session_sets_target_metadata_shape_check;

COMMIT;
