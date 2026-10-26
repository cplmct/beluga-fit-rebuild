---
name: Scoped npm overrides
description: Avoid npm direct-dependency override conflicts when replacing a pinned transitive dependency.
---

When a version-qualified override targets a direct dependency only to change its child, preserve the parent with an explicit `"."` reference to its original dependency specification.

**Why:** npm 10 otherwise interprets the version-qualified parent selector as a replacement specification and rejects it when it differs from the root dependency range. `npm ci` obscures this EOVERRIDE behind a generic lockfile EUSAGE message; inspect the verbose log rather than regenerating the lockfile.

**How to apply:** use `"." : "$<parent-package>"` inside the scoped parent override, keep the parent resolution unchanged, and verify every lock entry against the pre-change baseline before running `npm ci`.
