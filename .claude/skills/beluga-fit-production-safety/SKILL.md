---
name: beluga-fit-production-safety
description: Use for any Beluga Fit task that touches auth, onboarding, password reset, Supabase, schema, migrations, destructive actions, workout persistence, or progress-tracking data. Applies near-launch conservative change discipline and production-safety review before implementation.
---

# Beluga Fit Production Safety

This skill exists because Beluga Fit is a near-launch Expo / React Native app with Supabase-backed auth and app data. In this repository, small mistakes in auth, destructive actions, workout persistence, or schema assumptions can create outsized user harm.

Use this skill whenever the task could affect:
- authentication or session restoration,
- onboarding resolution,
- password reset or login flows,
- Supabase data reads/writes,
- schema or migrations,
- RLS or user-scoped access,
- account deletion,
- workout completion history,
- future progressive overload data,
- release-sensitive config or startup behavior.

This skill is intentionally conservative. It prefers correctness, data integrity, and reversibility over speed or elegance.

## Primary Goal

Prevent high-blast-radius changes from being implemented casually.

## Beluga Fit Risk Model

The highest-risk mistake categories in this repository are:

1. **Auth and session regressions**
   - Broken session restore
   - Incorrect onboarding resolution
   - Password reset flow breakage
   - Auth state race conditions

2. **User data integrity mistakes**
   - Writing workout or progress data with ambiguous ownership
   - Storing values whose unit or meaning is unclear
   - Overwriting existing data semantics during additive feature work
   - Assuming lifecycle or provenance that the schema does not prove

3. **Destructive flow mistakes**
   - Unsafe account deletion behavior
   - Broken cleanup logic
   - Partial deletion with silent failure
   - Irreversible state changes without rollback thinking

4. **Schema and migration mistakes**
   - Adding schema complexity too early
   - Creating tables or columns without clear product need
   - Breaking existing app reads/writes
   - Introducing migrations that are difficult to roll back near launch

5. **Startup and release regressions**
   - Splash/loading/auth handoff regressions
   - Config drift in `app.json`, `eas.json`, env usage, or startup wrappers
   - Release-sensitive behavior changes without adequate verification

## When to Use

Use this skill when a task involves any of these areas:

- `App.tsx`
- auth context/provider logic
- onboarding gating logic
- password recovery flow
- login/signup/session handling
- Supabase wrappers or query helpers
- tables, policies, migrations, RPC functions
- account deletion or destructive actions
- workout completion persistence
- progress or weight-tracking persistence
- startup, splash, navigation boot flow
- release/configuration files

Also use it when:
- stored data semantics are unclear,
- the feature may require schema change,
- the task touches user-owned records,
- a proposed improvement sounds “small” but crosses a trust boundary.

## Do Not Use This Skill For

- Pure styling or cosmetic changes with no behavioral impact
- Text-only copy changes
- Local component cleanup with no auth, data, config, or persistence impact

## Core Process

### 1. Identify the blast radius

Before proposing implementation, answer:
- What user flow could break?
- What user data could be corrupted, lost, or misrepresented?
- Is this change local, cross-screen, or cross-system?
- Does this touch auth, persistence, schema, or destructive actions?

If the blast radius is not clearly low, treat the task as medium or high risk.

### 2. Confirm what the schema actually proves

For any data-related change, determine:
- What fields exist today?
- What do they unambiguously mean?
- What ownership model is actually enforced?
- What unit semantics are stored versus merely inferred?
- What future behavior is being assumed but not modeled yet?

Never invent data meaning that the schema does not prove.

### 3. Prefer additive change over reinterpretation

For near-launch work:
- prefer additive columns or additive UI over rewiring existing behavior,
- prefer preserving current completion flows over redesigning the workout system,
- prefer capturing new data cleanly rather than reinterpreting old data optimistically.

If the safer additive route is unavailable, stop and explain why.

### 4. Review trust and ownership boundaries

If Supabase is involved, verify:
- whether the action is user-scoped,
- whether access assumptions rely on auth identity,
- whether cross-user access is impossible by design rather than by hope,
- whether RLS or ownership guarantees are actually enforced,
- whether the client code is assuming authorization that must be enforced server-side. Supabase Auth and its JWT-based identity model are designed to support secure user-scoped access, but correctness depends on the application and policy layer using that identity properly. [web:3884][web:3881]

### 5. Evaluate destructive and irreversible behavior

If the task can delete, overwrite, or invalidate data:
- identify exactly what gets removed or changed,
- identify whether partial failure is possible,
- identify the rollback path,
- identify whether the user can be left in an inconsistent state.

Destructive flows require stricter scrutiny than additive reads.

### 6. Minimize the implementation slice

Near launch, the correct question is not “what is the best long-term architecture?” but:
- what is the smallest safe step that advances the product,
- what can be verified now,
- what should be deferred until after launch.

Prefer one small slice that preserves current behavior.

### 7. Define proof requirements before coding

Before implementation, state:
- what commands will run,
- what manual flows must be tested,
- what cannot be verified locally,
- what risk remains even after verification.

Do not allow “looks right” to count as proof.

## Required Output Before Implementation

For any task using this skill, provide:

- Risk classification: low / medium / high
- Why the task is risky in Beluga Fit specifically
- Systems touched
- Exact files likely involved
- Whether schema change is required, optional, or not allowed
- Whether destructive behavior exists
- Smallest safe implementation slice
- Verification plan
- Remaining unknowns

## Beluga Fit-Specific Rules

### Auth and onboarding
- Do not casually modify auth boot, session restore, onboarding resolution, or password recovery flow.
- If auth timing or loading state is involved, assume race-condition risk until proven otherwise.
- Treat session handoff logic as production-sensitive.

### Supabase and persistence
- Do not propose migrations casually.
- Do not reinterpret ambiguous existing records to support a new feature.
- Do not assume stored units or exercise semantics unless the schema explicitly supports them.
- Prefer user-scoped, additive, explicit persistence.

### Progressive overload features
If working on weight/progression tracking:
- do not redesign the entire workout architecture in one pass,
- preserve the existing “check off exercise” workflow,
- start with additive capture and persistence,
- avoid implying precision the data cannot support,
- prefer showing “last recorded value” over inventing complex analytics too early.

### Destructive actions
- Account deletion, cleanup, overwrite paths, or irreversible state changes require explicit risk review.
- Never rely on best-case execution assumptions.
- Consider partial failure and user recovery.

### Release-sensitive config
Treat these as higher risk:
- `app.json`
- `eas.json`
- env usage
- splash/startup config
- provider and navigation boot order

## Anti-Rationalization Table

| Rationalization | Correct response |
|---|---|
| “It’s just a small auth change.” | Auth changes have disproportionate blast radius in near-launch apps. |
| “We can infer the missing data meaning.” | If the schema does not prove it, do not treat inference as fact. |
| “A migration is probably the cleanest option.” | Near launch, prefer the safest option, not the most architecturally ambitious one. |
| “This deletion path looks straightforward.” | Destructive flows require rollback and partial-failure thinking. |
| “I can improve startup while I’m in here.” | Startup, splash, and auth boot are protected high-risk paths. |
| “We’ll clean up old behavior as part of this feature.” | Preserve working behavior unless change was explicitly approved. |
| “The UI can just display something reasonable.” | Misleading fitness/progress data is worse than incomplete data. |

## Red Flags

Stop and escalate if any of these appear:
- Schema ambiguity blocks correct implementation
- A migration seems necessary for a “small” task
- Ownership or authorization guarantees are not explicit
- The task touches both auth boot and product logic
- The feature requires reinterpreting existing stored data
- The proposed diff spans multiple systems
- A destructive flow lacks rollback thinking
- Verification cannot actually prove safety

## Exit Criteria

Do not recommend implementation or approval until:
- [ ] The blast radius is identified.
- [ ] Risk is classified and justified.
- [ ] Data semantics are confirmed from real schema or code, not inference.
- [ ] Trust and ownership boundaries are reviewed.
- [ ] Destructive behavior has been analyzed, if present.
- [ ] The smallest safe slice is proposed.
- [ ] Verification requirements are explicit.
- [ ] Remaining unknowns are stated honestly.

## Output Format

Use this structure:

### Risk summary
- Risk level
- Why it matters
- Systems touched

### Safety assessment
- Data integrity concerns
- Auth / ownership concerns
- Destructive behavior concerns
- Schema / migration concerns

### Smallest safe slice
- What to implement now
- What to defer
- Why this is the safest path

### Verification plan
| Step | Purpose | Required |
|------|---------|----------|

### Remaining unknowns
- Unknown 1
- Unknown 2

### Recommendation
- Proceed
- Proceed only with constraints
- Do not proceed yet