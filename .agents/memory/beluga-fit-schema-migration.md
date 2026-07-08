---
name: Beluga Fit schema migration
description: Decisions and gotchas from migrating Beluga Fit off the old workouts/workout_exercises schema onto workout_sessions/session_exercises/session_sets.
---

## Aggregation rules (apply consistently wherever old per-exercise fields are derived from new per-set data)
- `session_sets` holds `set_number`, `reps`, `weight_kg`, `is_completed`, `is_pr` — one row per set, not per exercise.
- Derived "per-exercise" values: reps/weight = first set (lowest `set_number`); `completed` = ALL sets `is_completed`; `is_pr` = ANY set `is_pr`.
**Why:** the old schema had these as single columns on `workout_exercises`; the new schema moved them to a child table, so every screen reading exercise-level PR/completion state needs the same reduction rule to stay consistent with each other.

## Body part / muscle group lookup
- No `body_part` column on `exercises` anymore. Must join `exercise_muscle_groups` (per-exercise) or `session_muscle_groups` (per-session) → `muscle_groups(name)`.
- `exercise_muscle_groups` was empty at migration time (only 45/60+ static exercises exist in the `exercises` master table) — any body-part UI fed from it will render blank until seeded. This was an accepted, known risk across all affected screens, not a bug.

## Status filtering — completed vs. all sessions
- Default to NOT filtering on `status = 'completed'` for historical/informational queries (stats aggregation, last-active display, pre-deletion summaries) — this matches the old table's semantics because it only ever held finished workouts.
- Only add `.eq('status', 'completed')` where a comment/behavior explicitly says "most recent completed workout" (e.g. inactivity-reminder scheduling), since the new `workout_sessions` table can hold in-progress rows the old one never had.
**Why:** getting this wrong either silently excludes valid history everywhere, or lets an in-progress session trigger logic meant only for finished ones.

## Deletion / cascade
- `auth.users` → `workout_sessions` → `session_exercises` → `session_sets` has `ON DELETE CASCADE`. Account deletion should only delete the auth user; never manually delete `workout_sessions` rows.
