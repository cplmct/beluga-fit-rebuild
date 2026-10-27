# Internal Android sample-banner rendering

## Scope and status

The owner reports the previous gate-closed preview APK compiled and passed an
emulator smoke test without observed crashes/errors. That is not evidence that
this new mode, banner rendering, UMP messages or native network behavior passed.
This implementation has not started a native build or made real SDK requests.

Use the new **internal-ad-rendering** EAS profile only for the adult owner's
emulator tests. It extends preview: internal distribution, Android APK, Node
22.0.0, existing release shrinking/keep rules and dependencies unchanged.
Its only environment override is BELUGA_ADS_MODE=internal-test.
Normal preview/development retain their closed audience gate. Production stays
disabled. No Personal Routines, Supabase, policy, billing or dependency changes.

## Configuration and safety boundaries

- Native embedded config must have buildProfile=internal-ad-rendering,
  mode=internal-test, audienceApproved=false and both exact sample IDs.
- Sample Android App ID: ca-app-pub-3940256099942544~3347511713.
- Fixed-size banner test ID: ca-app-pub-3940256099942544/6300978111.
- The manifest plugin rejects non-sample/missing identifiers. The internal
  controller independently checks both IDs and profile/mode at runtime.
  No identifier environment override or live-mode implementation exists.
- Configuration errors fail the build configuration; missing/unknown native
  settings fail closed at runtime. The runtime reads the installed native
  ExponentConstants manifest asset, not OTA extras or __DEV__.
- expo-device's isDevice must be exactly false; physical devices and unknown
  values cannot start this path. This is an emulator guard, not tamper-proof
  hardware attestation, and does not verify the operator's age.
- audienceApproved remains false. The existing real-user permission evaluator
  and Settings privacy-options component are not opened or redefined.
- No account, profile, workout, injury, measurement or goal data enters this
  controller or ad requests. No persistent developer flag is written.

## Explicit session

On safe, focused, foreground Home, scroll below Body. The internal build shows:
**Internal test ads — not production consent validation**.
Read the network/owner warning, then tap **Start test-banner session**.
Mounting the control, opening Home, or launching the app does not call this
controller's UMP or Mobile Ads APIs.

Start lazily loads the SDK, requests updated UMP information, calls the documented
loadAndShowConsentFormIfRequired flow, then re-reads getConsentInfo. Any failure,
UNKNOWN/REQUIRED status or canRequestAds=false blocks rendering. No previous-state
fallback after a UMP error is used. Only after UMP readiness does it configure the
emulator test device, initialize Mobile Ads and render the one sample banner with
requestNonPersonalizedAdsOnly=true. Initialization is reused within the process.

This is Google's UMP readiness flow for an explicit owner test, NOT the disabled
production NPA purpose/vendor/applicability assessment. OBTAINED is not proof of
acceptance of every purpose, and canRequestAds is not a complete legal-basis
evaluation. Neither test inventory nor the NPA flag is a privacy exemption.
No reset(), fabricated statuses/choices, manual consent-storage writes, debug
geography, under-age flags or policy/message changes are added. UMP itself may
normally update its stored information and persist choices made in its forms.

The public sample App ID may not supply a suitable configured message in every
region/environment. A UMP error must remain blocking; do not substitute a live
App ID, fake NOT_REQUIRED or skip the flow to force rendering. If it cannot
complete, report the native error and obtain a separate reviewed test setup.
No real-user consent validity is established by this rendering test.

If UMP requires privacy options, a separate **Test session privacy options**
control appears on Home. Opening it ends the banner session and never restarts
ads automatically. The existing Settings entry point remains independent.
This developer control is not described in public policy.

## Stop, lifecycle and failures

- **Stop test-banner session** removes the banner and invalidates pending work.
- Leaving Home, backgrounding, recovery, account cleanup, retained workouts,
  draft-read errors/pending reads and discard confirmation stop the session.
  Existing account-keyed navigation unmounts Home on logout/account changes.
- Returning/foregrounding requires a fresh Start. Unmount destroys the banner
  view through the library lifecycle. No-fill/network/SDK failure removes the
  banner, preserves its fixed reserved slot, and requires a manual retry.
- A container narrower than 320dp never mounts the creative. The existing
  non-collapsible 320x50 placement and spacing after Body are retained.
- Every async boundary checks cancellation/surface safety before another SDK
  call or banner mount. Stop blocks subsequent integration calls/requests,
  but cannot cancel an already-issued request, dismiss an already-presented
  native consent form, or shut down an initialized process-wide SDK.
  Start remains unavailable until any pending native call settles. There is
  no retry timer; a hung native call may require restarting the app.
- The Android MobileAdsInitProvider can run before JS. Delayed measurement,
  no explicit JS calls at launch and removing an ad view do NOT prove zero
  native SDK traffic before Start or after Stop.

## Verification

Mocked/local commands (no native network or build):

```text
node scripts/test-advertising.js
node scripts/test-internal-test-ads.js
npm run type-check
```

The new suite covers closed normal/production/unknown profiles, wrong/missing
sample IDs, emulator-only eligibility, no calls before Start, required/not-ready
UMP states, SDK failures, duplicate Start, each Stop/async boundary, no-fill,
focus, foreground, workout/recovery/cleanup blocking, narrow layout, privacy
options and unmount. The existing real-user controller tests remain unchanged
except for the new runtime mock and manifest-validation fixture.

Before native testing, separately authorize an internal-ad-rendering APK build.
Do not reuse an older normal-preview APK or change preview/production to enable
the session. After building:

1. Inspect the embedded profile/mode/audience flag/sample IDs and merged manifest
   APPLICATION_ID, delayed-measurement metadata and providers. Confirm actual
   resolved GMA/UMP versions, shrinking and keep rules.
2. Cold launch: no internal JS SDK calls, banner or consent form before Start.
   On the adult-operated emulator, explicitly Start; observe real UMP outcomes.
   Confirm the resulting creative is Google's sample/test ad, never live.
3. Stop during each stage, during loading and after display; test no-fill,
   offline failures, rapid start/stop, foreground/background and navigation.
   Confirm no automatic restart and no stale banner after logout/account switch.
4. Smoke-test Home, workout start/resume/save, recovery, Settings and logout;
   inspect narrow screens/font scaling and separation from frequent controls.
5. Capture traffic from before cold launch through Start/Stop with an app-aware
   VPN capture or instrumented emulator capture, correlated with logcat. Account
   for TLS, Play Services attribution and delayed/background traffic. A finite
   capture or a JS call log does not prove permanent absence of native traffic.

### Sources

- https://developers.google.com/admob/android/test-ads (fixed banner demo ID)
- https://developers.google.com/admob/android/privacy (refresh, required form,
  canRequestAds and privacy options)
- Installed react-native-google-mobile-ads 15.8.3 src/AdsConsent.ts: documented
  wrapper methods; no SDK upgrade is implied by the current Google guide.
- Installed Android banner view manager's onDropViewInstance calls destroy().
