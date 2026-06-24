---
name: incremental-implementation
description: Guides the agent to implement one smallest approved reversible slice at a time. Use after a spec is approved and when scope control matters more than speed.
---

# Incremental Implementation

This skill keeps implementation narrow, reviewable, and reversible. It is designed for production-facing repositories where broad rewrites create more risk than value.

## When to Use

Use this skill when:
- A spec has already been approved.
- The task can be implemented in small slices.
- The codebase is production-facing or near launch.
- The user wants minimal blast radius and reviewable diffs.

Do not use this skill for:
- Exploratory audits with no approved implementation yet.
- Large coordinated migrations where the smallest safe unit is inherently broad.
- Tasks that must first be re-specified.

## Core Process

1. **Confirm the approved slice**
   - Restate the exact approved scope.
   - Re-list the files allowed to change.
   - Reconfirm what must not be touched.

2. **Implement the smallest shippable unit**
   - Make only the minimum edits needed to satisfy the approved scope.
   - Prefer local changes over new abstractions.
   - Prefer app-layer fixes over schema or infrastructure changes unless previously approved.

3. **Avoid opportunistic expansion**
   - Do not refactor adjacent code without approval.
   - Do not mix cleanup and feature work unless explicitly requested.
   - Do not convert one task into a platform redesign.

4. **Verify immediately**
   - Run the narrowest relevant verification first.
   - If that passes, optionally run broader checks as needed.
   - Separate failures introduced by this change from pre-existing repo problems.

5. **Stop after the slice**
   - Report the result.
   - Do not continue into “slice 2” without approval.

## Implementation Rules

- One approved slice only.
- No broad refactors.
- No hidden scope expansion.
- No schema changes unless previously approved.
- Preserve existing behavior outside the approved area.
- If a core assumption fails, stop and return to spec mode.

## Required Output After Editing

- Exact files changed
- Final diff summary
- User-visible behavior changes
- Verification results
- Remaining risks or caveats
- Whether the change is reversible

## Anti-Rationalization Table

| Rationalization | Correct response |
|---|---|
| “This extra cleanup is harmless.” | If it was not approved, do not include it. |
| “I’m already in the file, so I should fix nearby issues too.” | Nearby issues are separate work unless explicitly included. |
| “This would be better if I rewired the architecture first.” | Prefer the smallest approved slice over idealized redesign. |
| “I need one more helper and then one more abstraction.” | Add abstractions only when they are necessary for the approved slice. |
| “I can continue to the next step without asking.” | Stop after the approved slice and report back. |

## Red Flags

Pause and report if:
- The diff starts growing beyond the approved scope.
- More files are needed than expected.
- A schema or backend change becomes necessary.
- Verification indicates a related regression.
- The implementation is no longer easily reversible.

## Exit Criteria

Do not mark implementation complete until:
- [ ] Only the approved slice was implemented.
- [ ] Changed files match the approved scope, or deviations are explained.
- [ ] Verification was run and results were reported honestly.
- [ ] Remaining risks are stated.
- [ ] No unapproved follow-on work was bundled in.