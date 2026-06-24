---
name: security-and-hardening
description: Guides the agent through risk-focused review for auth, data, permissions, destructive actions, and production-sensitive changes. Use when a task touches security boundaries or could harm user data.
---

# Security and Hardening

This skill applies additional scrutiny to changes with elevated blast radius. It is especially important for apps with authentication, backend policies, destructive flows, and production data.

## When to Use

Use this skill when the task touches:
- Authentication or session handling
- Authorization or RLS
- Account deletion or destructive actions
- Secrets, tokens, env handling, or privileged operations
- Supabase schema, policies, or server-side functions
- Data integrity or ownership boundaries

Do not use this skill for:
- Purely cosmetic UI changes with no data or auth impact
- Isolated local-only edits with no sensitive flow involvement

## Core Process

1. **Map the trust boundary**
   - What system boundary is being crossed?
   - Who is allowed to do what?
   - What assumptions does the code make about identity, ownership, or privilege?

2. **Identify failure modes**
   - Unauthorized access
   - Data loss
   - Cross-user leakage
   - Incorrect deletion
   - Irreversible state change
   - Broken rollback path

3. **Check the narrowest safe alternative**
   - Is there an additive solution?
   - Can the risky behavior be disabled, delayed, or decoupled?
   - Is there a lower-blast-radius implementation?

4. **Require explicit verification**
   - What evidence would prove this is safe?
   - What edge cases must be checked?
   - What manual review is still required?

5. **Decide whether implementation should proceed**
   - If risk is insufficiently controlled, do not implement.
   - Return with safer options.

## Required Security Review Output

- Risky area touched
- Threat or failure modes
- Data integrity concerns
- Safer alternative, if any
- Rollback strategy
- Verification needed before claiming safety
- Go / no-go recommendation

## Anti-Rationalization Table

| Rationalization | Correct response |
|---|---|
| “It’s just one small auth tweak.” | Small auth changes can have large blast radius. |
| “The query is scoped, so it must be safe.” | Verify ownership and permissions explicitly. |
| “Deletion logic worked once in testing.” | Destructive flows need stronger proof and rollback thinking. |
| “The environment variables are already there.” | Confirm secrecy, scope, and exposure boundaries. |
| “This migration is simple.” | Schema changes in production are never casual. |

## Red Flags

- Unreviewed destructive operations
- Schema or policy changes with no rollback plan
- Assumptions about user ownership not proven in code
- Data semantics inferred rather than stored
- Claims of security without testable evidence

## Exit Criteria

Do not recommend implementation or approval until:
- [ ] The trust boundary is clearly identified.
- [ ] Failure modes are listed.
- [ ] A lower-risk alternative has been considered.
- [ ] Verification requirements are explicit.
- [ ] A rollback or containment strategy exists.
- [ ] The final recommendation is clearly stated.