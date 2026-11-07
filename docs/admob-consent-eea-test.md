# consent-eea-test — native handoff and owner-reported observations

## Scope and configuration

This isolated APK profile extends preview (Node 22.0.0; Android buildType apk).
Only this exact combination permits the additional consent test:

- Profile: `consent-eea-test`
- Mode: `public-flow-test`
- App ID: `ca-app-pub-5534915161634783~8443553999`
- Banner: `ca-app-pub-3940256099942544/6300978111` (Google sample only)
- `audienceApproved: false`

The installed binary's manifest remains runtime authority; OTA extras cannot
enable a disabled binary. The manifest plugin preserves delayed measurement.
No live banner unit, native reader modification, dependency, policy publication,
production/preview activation, non-TCF activation or internal-rendering change.

The owner reports only the dedicated Beluga Fit Consent Test message is
published; the production message remains draft and shared partners unchanged.
This is owner testimony, not an independently inspected console screenshot.
The previously completed policy files remain unchanged by this implementation.

## Supported emulator test setup

Pinned react-native-google-mobile-ads 15.8.3 declares Android UMP 3.2.0 and GMA
24.6.0. These are dependency defaults, NOT confirmed Gradle resolutions.
Google's UMP release notes document automatic emulator test-device recognition
starting at 2.2.0. The new profile alone passes
`AdsConsentDebugGeography.EEA` to `AdsConsent.requestInfoUpdate`.
No hashed ID is invented or embedded. Mobile Ads `EMULATOR` is a different API,
not a UMP hash.

After a separately authorized build, inspect resolved UMP version and emulator
logs. A successful refresh or a stored applicability value alone does not prove
EEA debug geography was honored. If emulator recognition cannot be established,
record uncertainty and stop before claiming a deterministic EEA result. Do not
weaken gates. For a nonrecognized device, obtain the real UMP hashed ID from its
requestConsentInfoUpdate log guidance; a separately reviewed change would be
needed to register that ID. Do not expose raw preferences, consent strings,
account IDs or complete payloads in diagnostic output or shared captures.

## Explicit reset — this process stays blocked

Settings' existing AdvertisingPrivacyOptions mount adds a reset control only
for the exact new profile and an owned, loaded adult declaration on a safe
foreground surface. It is disabled during controller consent work.

Reset first latches a controller-lifetime restart requirement and invalidates
eligibility/callback generations. It waits for banner removal before invoking
the pinned void `AdsConsent.reset()` API. It does not await or claim native
completion, erasure or a cleared native state. If the surface/account changes
before the call, the call is canceled but the restart lock remains.

Reset is never automatic. It does not remove the local adult declaration or
serve as account cleanup. No account, declaration, retry, privacy form,
navigation, background/foreground, deletion cleanup or old banner callback can
release the latch. A synchronous reset failure also keeps it latched and shows a
sanitized error. The runtime controller is a module singleton; a full process
restart is required. Fast Refresh is not a native-process restart or valid reset
validation. The next process must freshly refresh and pass every existing gate.
The UI says only "reset requested", not that native reset completed.

## Checks before any build

```
npm run type-check
node scripts/test-consent-eea-test.js
node scripts/test-public-ad-flow.js
node scripts/test-advertising.js
node scripts/test-internal-test-ads.js
node scripts/test-gdpr-applicability.js
node scripts/test-account-boundaries.js
git diff --check
```

These use mocks and synthetic manifests, not live consent or ads. Preserve the
policy, dependency, bridge-reader and Personal Routines diffs as empty.

## Build and device instructions — no new build authorized here

After implementation review and separate build approval, Windows PowerShell:

```powershell
npx eas-cli build --platform android --profile consent-eea-test
adb install -r "<downloaded-apk-path>"
```

Use a clean profile-specific generated native tree; do not reuse generated
Android output from another profile. Inspect the build's resolved dependency
report for GMA and UMP, merged manifest App ID, SDK providers and delayed-
measurement metadata, plus unchanged bridge registration. An APK compilation
alone does not establish correct consent behavior.

Capture only sanitized, narrowly filtered logs and nonpersonal UI observations.
Do not share raw logcat dumps. For reset testing, request reset while safe/idle,
observe the blocked/restart-required UI, then fully stop and reopen the app.
The void API does not confirm the native operation finished before a force-stop;
verify fresh refresh/form behavior after restart rather than claiming success.

## Device test matrix

- Unknown/minor/prefer-not declarations: no eligibility; core tracking works.
- Acceptance: actual dedicated message, fresh refresh, applicability explicit 1,
  OBTAINED, Purpose 1 permits, sample NPA banner only if all gates pass.
- Refusal: Purpose 1 refusal blocks; personalization-only refusal is a distinct
  case, not automatically a request veto. Record the real choice and outcome.
- Missing/invalid/read failure/explicit 0: still blocked. No non-TCF fallback.
- Privacy options: visible after UMP REQUIRED; opening invalidates eligibility,
  changes require fresh reassessment. REQUIRED itself is not refusal.
- Home-first dependency: cold start directly into Settings; record whether
  options exist, then visit eligible Home and return. Repeat after account
  changes and externally changed choices. No behavior change resolves this.
- Restart and offline/refresh failure: cached prior consent is insufficient.
- Account change during refresh/form/banner callbacks: no stale eligibility or
  inherited declaration. Existing deletion cleanup remains fail-closed.
- Reset: no automatic invocation; busy/unsafe rejected; pending work canceled;
  navigate/background/logout/switch account/redeclare/retry: still locked.
  Restart creates a new session, NOT evidence by itself that native reset ran.
- Home/workout/recovery/Settings/logout smoke checks; no ineligible blank slot;
  no-fill/network failure preserve layout once an eligible load has started.

## Owner-controlled emulator observations

The following are owner-reported observations from consent-eea-test emulator
testing, not independently reproduced results or a completed device test matrix:

1. The consent message displayed **Consent**, **Do not consent**, and
   **Manage options**.
2. After **Do not consent**: controller/view blocked,
   `reason=purpose-one-refused`, `error=none`, `applicability=applicable`.
   No banner was visible in the supplied capture.
3. Following the privacy-options consent-change test:
   `view=loaded`, `controller=loaded`, `reason=none`, `error=none`,
   `applicability=applicable`. A labelled **Google Test Ad** was visible.
4. Following withdrawal: controller/view blocked,
   `reason=purpose-one-refused`, `error=none`, `applicability=applicable`.
   The banner was no longer visible in the capture.
5. After `adb force-stop` and manual reopening, the owner reports
   `reason=purpose-one-refused`, `error=none`, `applicability=applicable`.
   No new screenshot was supplied for this step. This was not reset validation.

These observations do not verify geographic location, debug-device recognition,
complete native traffic suppression or production compliance. They do not mark
comprehensive reset validation, account switching, background/workout safety,
Home-first privacy-options availability or native dependency/manifest inspection
as device-verified.
Production and normal-preview advertising remain disabled; the non-TCF path
remains blocked. No activation is implied by the observed test banner.

### Additional reset/restart/refusal sequence — owner reported

1. After the explicit test-only reset action, Settings displayed:
   “Consent reset requested. Restart the app to begin a fresh consent
   test. This is not confirmation of native completion or erasure.”
   The adult declaration remained selected.
2. Home showed `view=blocked`, `controller=blocked`,
   `reason=reset-restart-required`, `error=none`, `applicability=unread`.
3. Following the instructed force-stop/manual-reopen sequence, the owner
   supplied a screenshot of the consent form appearing again.
4. After selecting **Do not consent** on that form, Home showed
   `view=blocked`, `controller=blocked`, `reason=purpose-one-refused`,
   `error=none`, `applicability=applicable`. No banner was visible in the
   supplied capture.

This records the observed reset/restart/refusal sequence only, not complete
native erasure or comprehensive reset validation. Busy/unsafe rejection, stale
callbacks, account-switch lock persistence and complete navigation-lock coverage
remain unverified on device.

### Declaration-based blocking — owner-supplied Home captures

The owner supplied two emulator Home screenshots: one with **Under 18**
selected and one with **Prefer not to answer** selected. Both show:

```text
view=blocked
controller=blocked
reason=age-ineligible
error=none
applicability=unread
```

No banner is visible in either supplied capture. These are observations of
declaration-based controller/UI blocking only, not proof of complete SDK traffic
suppression or account isolation. Still screenshots do not establish the timing
of banner removal. They also do not independently establish that a banner was
loaded immediately before either declaration change; that precondition remains
unconfirmed unless the owner explicitly confirms it.

### Separate network issue — owner reported

- UMP logs showed connection failures to
  `fundingchoicesmessages.google.com:443`.
- Windows curl tests initially failed.
- After changing Wi-Fi, IPv4 and IPv6 curl tests received HTTP 404 responses.
- Subsequent emulator consent tests succeeded.

The specific cause on the original network remains undetermined. HTTP 404
responses from the Windows tests are not proof that emulator UMP requests
succeeded, nor evidence of complete native traffic suppression. The later
emulator outcomes are separate observations, not a diagnosis of that network.

### Remaining device-test checklist

- Inspect actual resolved GMA/UMP versions, merged providers, App ID,
  delayed-measurement metadata and bridge registration.
- Establish UMP debug-device recognition before claiming deterministic EEA
  testing; applicability alone is insufficient.
- Beyond the observed reset/restart/refusal sequence, validate busy/unsafe
  rejection, stale callbacks, account-switch lock persistence and complete
  navigation-lock coverage. The observed sequence does not prove native erasure.
- Test account switching, deletion cleanup and in-flight account changes.
- Test background/foreground and Home/workout/recovery/Settings/logout safety.
- Validate Home-first privacy-options availability, including cold Settings,
  account changes and externally changed choices.
- Exercise missing/invalid/read-failure/explicit-zero applicability, offline
  refresh failure, no-fill and banner-load failure/layout behavior.
- Distinguish Purpose 1 refusal from personalization-only refusal.
- Independently observe network behavior if needed; UI/controller states alone
  cannot establish absence of native SDK traffic.

## Evidence boundaries / outstanding native requirements

- Source inspection: API mapping, defaults, exact config and call order.
- Automated tests: mocked controller, SDK, UI/storage and synthetic manifest.
- Owner reports: external message state, consent-message display,
  refusal/consent-change/withdrawal UI and sample-banner outcomes, restart result
  without a new screenshot, the additional reset/restart/refusal sequence with
  supplied form/refusal captures, the Under 18 and Prefer not to answer Home
  captures showing declaration-based blocking, and the separate network issue
  above.
- Console screenshots: visible setup at capture time only, if supplied.
- Native/device evidence: the observations above are limited owner-supplied
  evidence, not independent verification. Resolved versions, merged providers,
  emulator recognition, comprehensive reset validation (busy/unsafe rejection,
  stale callbacks, account-switch lock persistence and complete navigation-lock
  coverage), account transitions, background/workout safety and Home-first
  privacy-options availability remain unverified on device.
- Network evidence: separate from all of the above. Controller blocking or no
  explicit JS calls is not proof of no native traffic. Narrow proxy/VPN capture
  and Android inspection can inform this, but TLS/caching/provider activity and
  capture coverage limit conclusions.

## Official references

- https://developers.google.com/admob/android/privacy
- https://developers.google.com/admob/android/privacy/release-notes

No build, push, message/policy publication or external configuration operation
is performed by these tests or this handoff.

## Runtime log evidence — 2026-11-05

Log file: `artifacts/consent-runtime-20261105-113957.log`

Tested APK: `application-70cd5af6-0dfd-4901-89be-47b731fa6f70.apk`  
EAS build: `consent-eea-test`, version `1.0.0 (48)`, commit `7e67226`

### Established

- The APK packages the intended Beluga Fit Consent Test AdMob App ID:
  `ca-app-pub-5534915161634783~8443553999`.
- The APK manifest sets `DELAY_APP_MEASUREMENT_INIT=true`.
- `react-native-google-mobile-ads@15.8.3` declares GMA `24.6.0` and UMP `3.2.0`
  and injects those versions into its Android dependency configuration.
- Static DEX inspection found GMA classes and UMP consent API/internal classes.
- Runtime logs show UMP form loading completed with `status=ok`.
- Runtime logs show `IABTCFgdprApplies=1` and a dismissal status of
  `CONSENT_SIGNAL_SUFFICIENT`.
- Runtime logs show Google Mobile Ads recognized the emulator as a test device:
  `This request is sent from a test device.`
- Runtime logs show GMA Dynamite module version `263500502`.

### Still unverified

- Final Gradle-resolved GMA/UMP versions in the EAS build; the EAS log did not
  include a dependency-resolution report.
- True geographic location; `gdprApplies=1` is runtime consent-state evidence,
  not independent geographic proof.
- Complete native traffic suppression or production compliance.
- Whether the observed warnings affect banner rendering or ad loading.

### Non-blocking observations

- GMA logged a Firebase integration warning.
- React Native logged missing generated setters for ad view-manager classes.
- Google’s remote ad SDK reported an SDK-age warning.

These observations do not by themselves establish a consent-flow failure.