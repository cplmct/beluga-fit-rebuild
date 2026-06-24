param(
    [string]$ProjectRoot = ".",
    [switch]$Force
)

$ErrorActionPreference = "Stop"

$skillNames = @(
    "spec-driven-development",
    "incremental-implementation",
    "code-review-and-quality",
    "security-and-hardening",
    "test-driven-development"
)

$skillsRoot = Join-Path $ProjectRoot ".claude\skills"

function Ensure-Directory {
    param([string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
        Write-Host "Created directory: $Path"
    }
    else {
        Write-Host "Directory already exists: $Path"
    }
}

function Write-SkillFile {
    param(
        [string]$FilePath,
        [string]$Content
    )

    if ((Test-Path -LiteralPath $FilePath) -and (-not $Force)) {
        Write-Host "Skipped existing file: $FilePath"
        return
    }

    $Content | Set-Content -LiteralPath $FilePath -Encoding UTF8
    Write-Host "Wrote file: $FilePath"
}

Ensure-Directory -Path $skillsRoot

$skillTemplates = @{
    "spec-driven-development" = @'
---
name: spec-driven-development
description: Require a spec-first workflow before non-trivial edits.
---

# Spec-Driven Development

Use this skill before making any non-trivial code change.

## Required output before editing
- Exact problem
- Why it matters now
- Exact files likely involved
- Risk level
- Whether schema changes are required
- Smallest safe implementation slice
- Verification plan
- Explicit out-of-scope list

## Rules
- Do not edit code until the spec is approved.
- If a core assumption fails, stop and update the spec.
- Keep the spec concrete and file-specific.
'@

    "incremental-implementation" = @'
---
name: incremental-implementation
description: Implement only the smallest approved reversible slice.
---

# Incremental Implementation

Use this skill after a spec has been approved.

## Rules
- Implement one smallest shippable slice only.
- Do not broaden scope during implementation.
- Avoid opportunistic refactors.
- Preserve existing behavior outside the approved area.
- Stop after the approved slice is complete.

## Required report after editing
- Exact files changed
- Final diff summary
- User-visible behavior changes
- Risks and follow-ups
'@

    "code-review-and-quality" = @'
---
name: code-review-and-quality
description: Review the implemented change for correctness, clarity, and risk before commit.
---

# Code Review and Quality

Use this skill before commit or approval.

## Review checklist
- Is the diff minimal and on-scope?
- Did the change preserve existing behavior outside the approved area?
- Are there hidden edge cases or ambiguous assumptions?
- Is the code readable and maintainable?
- Were relevant verification steps run?
- Are unrelated repo issues separated from change-specific issues?

## Required review receipt
- Exact files changed
- Verification results
- New errors introduced, if any
- Pre-existing unrelated errors
- Remaining risks
- Commit recommendation
'@

    "security-and-hardening" = @'
---
name: security-and-hardening
description: Apply extra scrutiny to risky auth, data, and destructive changes.
---

# Security and Hardening

Use this skill for auth, database, destructive actions, secrets, or production-sensitive flows.

## Audit for
- Auth/session impact
- RLS or authorization impact
- Destructive behavior
- Data integrity risk
- Rollback strategy
- Safer lower-blast-radius alternative

## Rules
- Do not implement risky changes until the risks are explicitly reviewed.
- Prefer the safest viable option over the most ambitious one.
'@

    "test-driven-development" = @'
---
name: test-driven-development
description: Require proof-oriented verification for behavior changes.
---

# Test-Driven Development

Use this skill when behavior changes need stronger proof.

## Rules
- Define expected behavior before editing.
- Prefer narrow, relevant verification first.
- Distinguish tested behavior from assumed behavior.
- Never claim a change works without evidence.

## Required output
- What behavior was expected
- What was tested
- What passed
- What remains unverified
'@
}

foreach ($skillName in $skillNames) {
    $skillDir = Join-Path $skillsRoot $skillName
    Ensure-Directory -Path $skillDir

    $skillFile = Join-Path $skillDir "SKILL.md"
    Write-SkillFile -FilePath $skillFile -Content $skillTemplates[$skillName]
}

Write-Host ""
Write-Host "Done. Skill scaffold is ready under: $skillsRoot"
Write-Host ""
Write-Host "Next step: replace the placeholder SKILL.md content with the full skill files you want to use."
Write-Host "If you rerun this script with -Force, it will overwrite existing SKILL.md files."