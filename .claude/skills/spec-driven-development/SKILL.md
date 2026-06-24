---
name: spec-driven-development
description: Guides the agent through spec-first implementation planning. Use when a task is non-trivial, touches multiple files, changes behavior, affects data flow, or could expand in scope.
---

# Spec-Driven Development

This skill prevents premature coding. It forces the agent to define the intended change clearly enough that a human can approve or reject it before implementation begins.

## When to Use

Use this skill when:
- The task is more than a trivial one-line fix.
- The change affects behavior, state flow, data flow, or user-visible output.
- More than one file is likely involved.
- The task could drift into refactoring or architecture changes.
- The request is broad, ambiguous, or under-specified.
- The code touches production-sensitive paths.

Do not use this skill for:
- Purely mechanical edits with no behavioral impact.
- Tiny typo fixes or comment-only changes.
- Formatting-only changes that do not affect execution.

## Core Process

1. **Restate the task**
   - Summarize the problem in concrete engineering terms.
   - Separate what the user asked for from what the agent assumes.

2. **Inspect before proposing**
   - Read the minimum relevant files first.
   - Verify whether the requested change fits the current architecture.
   - Identify constraints from the repo, schema, runtime, or product stage.

3. **Define the implementation scope**
   - Name the exact files likely to change.
   - Explain why each file is involved.
   - Explicitly identify what is out of scope.

4. **Identify risk**
   - Label the task as low, medium, or high risk.
   - Explain what could break if the implementation is wrong.
   - State whether auth, destructive actions, schema, or production data are involved.

5. **Propose the smallest safe slice**
   - Break broad work into one smallest meaningful increment.
   - Prefer additive changes over rewrites.
   - Prefer reversible changes over structural changes.

6. **Define verification before coding**
   - List the commands, checks, or manual flows that will be used to verify the change.
   - Distinguish between what can be proven and what will remain unverified.

7. **Pause for approval**
   - Do not edit until the spec is approved.

## Required Output

Before editing, provide:

- Problem
- Current behavior
- Root cause or likely cause
- Exact files likely involved
- Risk level
- Smallest safe implementation slice
- Verification plan
- Explicit out-of-scope list

## Anti-Rationalization Table

| Rationalization | Correct response |
|---|---|
| “I already know what to change.” | Inspect the repo first and prove it matches the assumption. |
| “This is probably only one file.” | Name the file and verify that adjacent systems are not implicated. |
| “I can clean up nearby code while I’m here.” | Do only the approved task unless cleanup was explicitly requested. |
| “I’ll just start coding and explain later.” | The spec comes first for any non-trivial task. |
| “The user said what they want, so assumptions are fine.” | Separate user request from implementation assumptions and validate both. |

## Red Flags

Stop and re-spec if any of these happen:
- A required file outside the approved scope becomes necessary.
- A schema limitation invalidates the original plan.
- A migration appears necessary.
- Stored data semantics cannot be proven.
- The task expands beyond one small slice.
- Verification requirements materially change.

## Exit Criteria

Do not proceed to implementation until all are true:
- [ ] The task has been restated clearly.
- [ ] Relevant files have been inspected.
- [ ] Exact files likely to change are named.
- [ ] Risk level is stated and justified.
- [ ] Verification steps are defined.
- [ ] Out-of-scope items are explicitly listed.
- [ ] The human has approved the spec.