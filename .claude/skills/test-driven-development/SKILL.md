---
name: test-driven-development
description: Guides the agent to define expected behavior first, verify it with evidence, and distinguish tested outcomes from assumptions. Use when behavior changes need proof.
---

# Test-Driven Development

This skill emphasizes proof over confidence. It is for behavior-sensitive changes where the agent must demonstrate that the code works, not merely assert it.

## When to Use

Use this skill when:
- The change affects runtime behavior.
- The user asks for proof, verification, or strong confidence.
- The code touches edge-case-heavy flows.
- Regressions would be costly.
- Manual testing or automated tests are relevant.

Do not use this skill for:
- Non-executable documentation changes
- Pure refactors with no behavioral change, unless regression risk is high

## Core Process

1. **Define expected behavior first**
   - What should happen before and after the change?
   - What scenario proves success?
   - What scenario would reveal failure?

2. **Choose the narrowest valid verification**
   - Unit test, integration test, type check, lint, build check, manual flow, or targeted command
   - Prefer the most direct proof for the specific change

3. **Verify behavior, not just code shape**
   - Tests should reflect outcomes, not implementation details
   - Manual checks should validate user-visible or system-visible behavior

4. **Separate proof from assumption**
   - What was directly tested?
   - What is inferred but untested?
   - What remains blocked by repo limitations?

5. **Report honestly**
   - Never say “works” without evidence
   - Never upgrade partial verification into full certainty

## Required Verification Output

- Expected behavior
- Verification steps run
- What passed
- What failed
- What remains unverified
- Confidence level and why

## Anti-Rationalization Table

| Rationalization | Correct response |
|---|---|
| “The code is simple, so I know it works.” | Simple code still needs proof when behavior matters. |
| “Type check passing means the feature works.” | Type checks prove shape, not runtime behavior. |
| “Manual testing is enough for everything.” | Use the strongest relevant proof, not just the easiest. |
| “The repo has unrelated errors, so verification isn’t possible.” | Narrow the verification to the changed behavior and report the gap honestly. |
| “I didn’t see any errors, so it passed.” | State the exact evidence and command output behind the claim. |

## Red Flags

- “Looks correct” presented as verification
- Type safety conflated with behavioral correctness
- Partial test coverage described as complete proof
- Manual testing with no scenario description
- No distinction between tested and untested paths

## Exit Criteria

Do not claim the change is verified until:
- [ ] Expected behavior was stated in advance.
- [ ] At least one relevant verification method was run.
- [ ] The result of each verification step is reported.
- [ ] Untested areas are explicitly identified.
- [ ] Final confidence level matches the available evidence.