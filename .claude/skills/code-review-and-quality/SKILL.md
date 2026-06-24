---
name: code-review-and-quality
description: Guides the agent through a structured multi-axis review of a completed change. Use before commit, approval, or merge for any non-trivial edit.
---

# Code Review and Quality

This skill reviews a change for correctness, clarity, safety, maintainability, and verification quality. Every non-trivial implementation should be reviewed before commit.

## When to Use

Use this skill when:
- A code change is complete and needs pre-commit review.
- The user asks whether a diff is safe or ready.
- The repo is production-facing and small regressions matter.
- The implementation touched UI, state flow, data flow, auth, or config.

Do not use this skill for:
- Pre-implementation planning.
- Pure exploration with no code changes.
- Commit-message-only tasks.

## Review Axes

Evaluate the change across these five axes:

1. **Correctness**
   - Does the code do what it claims?
   - Does it match the approved spec?
   - Are obvious edge cases handled?

2. **Readability**
   - Is the code understandable without extra explanation?
   - Are names clear and intent-revealing?
   - Is unnecessary complexity avoided?

3. **Architecture fit**
   - Does the change fit current repo patterns?
   - Did it preserve boundaries and avoid accidental coupling?
   - Is the abstraction level appropriate for the size of the change?

4. **Security and safety**
   - Any auth, permissions, destructive, data, or production risk?
   - Any unproven assumptions about stored data or user identity?
   - Any hidden side effects?

5. **Performance and UX**
   - Any obvious hot-path, loading, or rendering cost?
   - Any user-visible regressions or ambiguity?
   - Any misleading output or silent behavior changes?

## Core Process

1. **Understand intent first**
   - What problem was being solved?
   - What was the approved scope?
   - What user-visible behavior should now differ?

2. **Review verification story**
   - What checks were run?
   - What passed?
   - What was not run?
   - Are there pre-existing repo issues that affect confidence?

3. **Review the diff**
   - Read every changed file.
   - Check that each modification is necessary.
   - Look for hidden scope expansion or mixed concerns.

4. **Categorize findings**
   - Required change
   - Important follow-up
   - Nice-to-have
   - No issue found

5. **Make a commit recommendation**
   - Ready to commit
   - Ready with caveats
   - Not ready

## Required Review Receipt

- Exact files changed
- Diff summary
- User-visible behavior changes
- Verification run
- Verification not run
- New issues introduced, if any
- Pre-existing unrelated issues
- Remaining risks
- Commit recommendation

## Anti-Rationalization Table

| Rationalization | Correct response |
|---|---|
| “The diff is small, so review can be light.” | Small diffs can still break critical behavior. |
| “Type check failed elsewhere, so this file is probably fine.” | Isolate whether the changed file introduced anything new. |
| “The code looks clean, so it must be correct.” | Review correctness and edge cases separately from style. |
| “The user just wants it shipped.” | Production-facing code still needs a disciplined review. |
| “Unverified behavior is probably fine.” | State exactly what remains unverified. |

## Red Flags

- Hidden behavior change not mentioned in the report
- Mixed feature work and cleanup in one diff
- Ambiguous data semantics in UI or logic
- Claims of “fully verified” when only partial checks were run
- Commit recommendation without clear verification evidence

## Exit Criteria

Do not recommend commit until:
- [ ] The change was reviewed across all five axes.
- [ ] Verification results were examined.
- [ ] New issues are distinguished from pre-existing ones.
- [ ] Remaining risks are stated.
- [ ] A clear commit recommendation is given.