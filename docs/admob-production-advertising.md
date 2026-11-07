# Android Home banner — production implementation, NOT activation approval

## Repository and documentation provenance

Implementation began on `feature/admob-home-banner` at
`822d0e4264123abad695a0d1726f505fbfe052b6`, with a clean working tree.
The owner's Windows documentation commit `bc39f07` is not resolvable locally.
No remote fetch or history repair was performed. The existing
`docs/admob-consent-eea-test.md` is deliberately unchanged to avoid overwriting
that documentation divergence. Reconcile the owner's documentation separately
without resetting, recreating or rewriting that commit.

## Approved scope and explicit limits

One Android Home banner; non-personalized requests only. UMP remains consent
status authority. Only explicit TCF applicability can proceed. Non-TCF/US,
missing/invalid/unreadable applicability and explicit zero remain blocked.
`NOT_REQUIRED` is not permission to bypass this restriction. NPA is not a
consent exemption, and Purpose 1 checking is not a complete vendor/TCF/GPP engine
or worldwide compliance guarantee.

This change adds capability only. No build, APK install, live request, Play
upload/rollout, AdMob/message/policy publication, dependency upgrade, database or
Personal Routines change is authorized or performed.

## Exact binary configuration

| Setting | Production-advertising candidate |
| --- | --- |
| EAS profile | `production-advertising`, extends `production` |
| Mode | `production-tcf` |
| App ID | `ca-app-pub-5534915161634783~7684377807` |
| Banner ID | `ca-app-pub-5534915161634783/2005509866` |
| `audienceApproved` | `true`, explicit release-configuration approval only |
| Inherited output | Android App Bundle, Node 22.0.0, `autoIncrement: true` |

`audienceApproved` means the exact release configuration was reviewed for this
bounded implementation. It is not Google approval, user age verification,
consent, regional permission, or an account eligibility grant. Flipping this
flag on another configuration cannot enable the production path. Build-time and
runtime predicates require the whole exact profile/mode/ID/boolean combination.

Ordinary `production` remains `BELUGA_ADS_MODE=disabled`. Development/preview,
internal rendering and both public consent-test profiles keep their previous
configuration. The consent-test App ID and sample banner never become production
identifiers. Tests exercise rejection of partial/mixed/unknown combinations.

`app.config.js` passes the selected profile/mode into the builder. The validated
App ID is written by `withAndroidTestAds` with delayed-measurement metadata.
`withGdprApplicability` registers the unchanged read-only reader for the exact
production combination. Runtime reads `ExponentConstants.manifest` from the
installed binary, not OTA extras. An OTA manifest cannot turn a disabled binary
into the enabled production configuration.

The new profile WOULD permit real banner requests in a built/distributed binary
once all gates pass. Its presence is not authorization to build or distribute it.
No remote switch needs to be changed for that binary to request ads; do not
mistake its separate profile for a remote activation mechanism.

## Shared runtime and gates

The existing public controller is extended, not replaced by the legacy
controller. Production requires a matching signed-in owner, loaded adult
self-declaration, safe/focused/foreground surface, successful current-flow
refresh and required-form API completion, UMP `canRequestAds=true`,
`status=OBTAINED`, bridge result `applicable`, supported positive Purpose 1
evidence and still-valid generations. Configure/initialize occur only after
those checks. Malformed/missing Purpose 1 evidence and refresh/form errors block.

The native applicability key is shared SDK storage; reading it after refresh
does not prove it was rewritten by that refresh or bound to a Beluga account.
Account changes invalidate app eligibility but do not reset Google consent.

The Home creative selects its ID only from the enabled, validated controller.
It retains `requestNonPersonalizedAdsOnly: true`, the fixed banner size, existing
label/slot logic, width checks and workout/recovery/resume/cleanup blockers.
No Supabase, profile, workout, injury, goal, measurement, account identifier or
declaration is supplied as SDK targeting/request arguments by this change.
This source finding is not a claim about Google's independent native payloads.

Production has no forced UMP debug geography, consent-reset adapter/control, or
test diagnostic display. Its Mobile Ads request configuration contains no
programmatic test-device IDs. Exact test profiles retain their prior behavior,
including EEA debug/reset only for `consent-eea-test`.

## Cold Settings privacy-options discovery

For a loaded matching adult in the production configuration, safe/focused
Settings can perform `requestInfoUpdate` without visiting Home first.
This uses the controller's existing shared operation mutex and generation
checks, not a second consent manager.

- Discovery only obtains the privacy-options requirement.
- It does NOT automatically present a required consent form, initialize Mobile
  Ads, set ad readiness, or create a banner.
- The Settings privacy-options control appears when UMP reports `REQUIRED`.
  Opening it remains an explicit action using the existing guarded form flow.
- Errors remain blocked with a retry control; no automatic error retry loop.
- Background/blur/account changes invalidate the pending operation through its
  safety/generation checks; a safe later attempt can refresh again.
- Home and Settings cannot run competing controller SDK operations.
- After privacy choices change, refresh/reassessment is required before another
  Home request. UMP communication can occur without any Mobile Ads request.

Ordinary logout retains only that account's local declaration. Existing deletion
cleanup, durable failure suppression and generation protections are unchanged.
No destructive deletion testing is authorized by this document.

## Supplied evidence — not independent console/device verification

Owner-supplied console screenshots show, at capture time:

- Production app **Beluga Fit**, package `com.belugafit.app`.
- The production App ID above; app verification **Verified**, approval **Ready**.
- **Home Banner Android**, Banner format, with the production banner ID above.
- Production European message **Draft**, associated with production Beluga Fit,
  targeting EEA, UK and Switzerland.
- Privacy-policy URL configured as `https://belugafit.tranbtc.com/privacy`.
- Earlier supplied screenshots showed the dedicated consent-test message
  **Published** and the production message **Draft**.

These are screenshot-supported console facts, not independently accessed
current state or production-message-delivery proof. The old handoff's statement
that publication status lacked screenshot support is superseded here, without
editing the divergent owner handoff.

Owner-reported emulator sample-banner results additionally include adult
declaration, form presentation, consent and a labelled Test Ad, Calendar to Home
with a 30-second wait and a visible banner, and background/foreground with a
visible banner and no owner-reported crash or overlapping controls. Earlier
refusal/withdrawal/reset/declaration observations retain their documented limits.
No sample result establishes production ID delivery, complete native traffic
suppression, geographic location or comprehensive lifecycle/account isolation.

## Candidate testing with real IDs — test devices only

Do not install/run this real-ID candidate on uncontrolled devices. A separately
authorized build and test session must first establish a Google-supported test
device setup for these real ad units. Google's documented non-programmatic
option is registration in the AdMob UI; the owner must separately authorize and
perform any external setting changes. Observe registration/propagation guidance.
The code does not embed a device hash or invent a UMP test identifier.

Mobile Ads test-device registration is distinct from UMP test-device recognition
and EEA debug geography. Production does not force geography or expose reset.
Test mode alone cannot make an unresolved/non-TCF production session eligible.
If the actual production UMP flow cannot establish the existing positive TCF
gates, stop and record blocked status; do not force flags or reuse test fixtures.

Only proceed under a controlled, confirmed test setup. A Google Test Ad label
supports that displayed creative's test status, not registration of every future
request. Do not click ads. If test status cannot be established, stop before
eligible real-ID requests; inspect offline artifacts instead. Any mediation
requires separate network-specific test setup and review, not assumed coverage.

Official references:
- https://developers.google.com/admob/android/test-ads
- https://developers.google.com/admob/android/privacy
- https://developers.google.com/admob/android/privacy/release-notes

## Remaining release prerequisites and finite validation checklist

All remain release blockers until evidence is recorded, not instructions to
execute now:

1. Reconcile owner documentation and tie the candidate to an exact EAS build ID,
   profile, full recorded commit, uploaded-source state and installed artifact.
2. Inspect actual resolved GMA/UMP dependencies, merged manifest App ID/providers,
   delayed-measurement metadata and reader registration. Declared defaults or
   the APK manifest alone do not prove all of these.
3. Owner separately approves the production app's European message publication
   and verifies association/policy/partners. Draft is not delivery-ready evidence.
   Confirm hosted policy, app-ads.txt, Play Contains ads, Data safety and
   audience declarations match the final configuration.
4. Establish a controlled registered-test-device session before using real IDs.
   Observe production-app message delivery, refusal, positive TCF consent,
   sample/test-labelled delivery and withdrawal. Check cold Settings first and
   after account/external-choice changes; no Home prerequisite.
5. Using synthetic accounts, validate owner isolation/logout and account
   transitions during refresh/form/banner callbacks. Destructive deletion cases
   need separate authorization. Confirm local-cleanup failure remains blocked.
6. Validate Home/Calendar/workout/recovery/Settings, background/foreground,
   stale callbacks, narrow layout, offline refresh, no-fill and banner failure.
   Establish an actually loaded banner before timing declaration/withdrawal
   removal. Still captures cannot establish removal timing.
7. Confirm explicit zero/missing/invalid/unreadable applicability, NOT_REQUIRED
   and unknown/minor/prefer-not declaration remain blocked. No non-TCF fallback.
   Treat network observation separately; UI blocking is not no-native-traffic
   evidence.

US/non-TCF activation is excluded. It would require a separate supported
regional-requirements/opt-out/signal review and approval, not merely explicit
`gdprApplies=0`, Ready status or a published European message.

## Disabled configuration and rollback

Keep ordinary production disabled and do not build/distribute the new profile
without release approval. Changing `eas.json` affects future builds, not installed
apps. There is no implemented remote advertising kill switch.

After an enabled release, a reliable app-level shutdown requires a separately
authorized new disabled native release with a higher Android version code,
distribution and user updates. Stopping rollout does not disable installed
copies. AdMob serving controls are not equivalent to preventing UMP/SDK activity.
No verified OTA shutdown mechanism or native SDK uninitialization is promised.

## Automated verification

Executed successfully in the workspace:

```text
npm run type-check
node scripts/test-production-advertising.js
node scripts/test-advertising.js
node scripts/test-public-ad-flow.js
node scripts/test-consent-eea-test.js
node scripts/test-internal-test-ads.js
node scripts/test-gdpr-applicability.js
node scripts/test-account-boundaries.js
node scripts/test-account-overlay.js
node scripts/test-account-summary.js
```

The new production suite covers exact and negative configuration combinations,
ordinary disabled defaults, synthetic manifest metadata, runtime factory
arguments, installed-manifest selection, closed applicability/consent paths,
no reset/debug/diagnostics, NPA/banner selection, owner/stale-callback protection,
and mounted cold-Settings discovery, errors, cancellation and shared-operation
serialization. Existing suites also pass for unchanged test profiles and account
cleanup.

These checks use mocked SDK/storage/native views, synthetic manifests and local
TypeScript. They are not APK, native dependency, console delivery or network
verification. Java harness fixtures were not run (the default reader suite
reports these as not run); no JDK installation or Android build was attempted.
No destructive account operation or native/live SDK request was performed.

`git diff --check` passed. A comparison against HEAD also confirmed every
pre-existing EAS profile, CLI setting and submit setting is unchanged. Protected
policy, test-handoff, dependency, native-reader and Supabase paths have no diff.
The existing preview workflow was restarted successfully; a web screenshot showed
the Beluga Fit launch screen. This is only a web-startup sanity check, not
verification of the Android production branch or authenticated native Settings.
