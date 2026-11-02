# Android applicability reader — bounded public test only

## Scope and contract

One app-owned native method:

`readGdprApplicability(): Promise<'missing' | 'not-applicable' | 'applicable' | 'invalid'>`

The Java reader takes one snapshot of application-default SharedPreferences.
Only `IABTCF_gdprApplies` is inspected. Only Java Integer zero/one are accepted;
strings, booleans, other numeric types/integers and null are invalid. A missing
key is missing. Exceptions become fixed `applicability-read-failed`, with no raw
exception text, cause or preference values returned.

Android's snapshot API internally copies the preferences map; no unrelated
entry is inspected, logged, returned or persisted by this reader.
There are no preference writes, fixture APIs, consent resets, TC/GPP decoders,
advertising identifiers, dependency changes or SDK calls in the bridge.

The TS wrapper additionally fails closed when the module is absent, returning
a fixed `applicability-unavailable` error. Unexpected native return values become
invalid, never truthy permission. Diagnostics allowlist the four states and
fixed reasons/errors. `unread` means no current result, not a fifth native result.

## Reproducible registration and architecture

- Project: Expo SDK 53, React Native 0.79.6; resolved app config has no explicit
  global/Android `newArchEnabled` override. No architecture setting is changed.
- The official SDK 53 bare Android template defaults to `newArchEnabled=true`,
  uses `ReactNativeHostWrapper` / `DefaultReactNativeHost`, and obtains packages
  with `val packages = PackageList(this).packages` before `return packages`.
- The installed RN 0.79.6 `ReactPackageTurboModuleManagerDelegate` contains
  legacy ReactPackage handling under its New Architecture interop. The
  app-owned ReactContextBaseJavaModule uses that existing mechanism; no
  codegen/dependency/architecture change is introduced.
- `plugins/withGdprApplicability.js` registers the package immediately after that
  package-list statement and copies exactly three Java sources from
  `native/advertising/` into generated Android app sources. It is idempotent and
  rejects unrecognized/ambiguous registration layouts or non-Kotlin sources.
- The plugin runs only for exact sample-ID `public-ad-flow-test` /
  `public-flow-test`, audienceApproved=false. Other profiles receive no bridge
  mods. Internal-rendering/preview/production settings and behavior are unchanged.
- Generated Android files are ignored by this repository. Retained source
  files deliberately do not live inside an ignored `android/` directory.
  Use a clean, profile-specific prebuild/native project for later native testing,
  not a reused generated tree from a different profile.

Verification here is config/source inspection plus synthetic prebuild callback
tests based on the SDK 53 package-list layout. No actual project prebuild,
Gradle compilation or device interop validation was performed. Native
compatibility is NOT established by mocked/synthetic tests.

Sources:
- https://raw.githubusercontent.com/expo/expo/sdk-53/templates/expo-template-bare-minimum/android/app/src/main/java/com/helloworld/MainApplication.kt
- https://raw.githubusercontent.com/expo/expo/sdk-53/templates/expo-template-bare-minimum/android/gradle.properties
- Installed RN: ReactAndroid/src/main/java/com/facebook/react/ReactPackageTurboModuleManagerDelegate.java
- https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/IAB%20Tech%20Lab%20-%20CMP%20API%20v2.md#in-app-details

## Controller and evidence limits

The public test controller reads only after successful current-session UMP
refresh, required-form completion and current consent-info retrieval with
canRequestAds=true. UMP remains status authority.

- Missing: blocked / applicability-unresolved.
- Invalid: blocked / applicability-invalid.
- Explicit zero: blocked / non-tcf-blocked; diagnostic not-applicable.
- Explicit one: continue existing OBTAINED, Purpose 1 and all safety guards.
- Unavailable/read failure: failed, fixed error; no initialization/banner.
- Refresh failure: do not read or fall back to persisted applicability.
- Account, declaration and flow generation changes discard in-flight reads;
  suspension/retry invalidates the diagnostic result.

A read after a successful refresh is not proof the key was rewritten during
that refresh. This key has no timestamp, account binding or refresh provenance.
No custom cache, timestamp, expiry period or regional permission is invented.
Zero is not proof of US location, applicable US state, US consent/opt-out
handling, or satisfaction of other regional obligations. Non-TCF remains closed.

## Test coverage and native handoff

Executed JS checks cover the wrapper's four results, malformed outputs,
missing/unreadable module, sanitized native rejection, profile isolation,
registration idempotency/rejection and actual plugin callbacks copying only the
three shipping sources into a temporary synthetic Android directory.
Controller/UI mocks cover all four results, blocked zero, unavailable bridge,
required call ordering, refresh failure with would-be persisted zero/one,
stale account/declaration/flow/deletion callbacks, no ineligible slot and
sanitized diagnostics. These checks do not execute Java, Android or UMP.

Standalone Java fixtures are confined to
`scripts/native-tests/GdprApplicabilityReaderTest.java`, never copied into the
app. They cover missing, Integer 0/1, strings, booleans, wrong numbers/types,
null, single snapshot count and sanitized read failure. A JDK is not available
in this workspace, so they have NOT been compiled or executed.

On an approved host with a JDK, the proposed fixture command is:

```
node scripts/test-gdpr-applicability.js --native-fixtures
```

This compiles only the pure Java reader/harness in a temporary directory; it
does not build an APK or verify Android SharedPreferences/React Native wiring.
The command fails if the JDK is missing, compilation fails or fixtures fail.

Still needed, with separate build authorization:
1. Inspect generated MainApplication registration, copied sources and actual
   newArchEnabled/Hermes settings without altering them.
2. Compile and install public-ad-flow-test; verify NativeModules resolution
   under that build's architecture. Older APKs must fail closed as unavailable.
3. Run Android-only test-harness fixtures for real SharedPreferences
   absence/integer/wrong-type/read-failure paths, without shipping fixture APIs
   or modifying UMP-managed values on real-user installations.
4. Verify safe-surface behavior, account/declaration changes during reads and
   absence of label/slot for blocked states. Observe network separately; JS
   suppression is not proof of zero native SDK traffic.
5. Positive TCF acceptance/refusal still requires separately approved
   owner-controlled App ID, published assigned message and supported UMP
   test-device setup. No IDs, geography/reset controls or messages changed here.

No builds, live requests, pushes, policy/message publications, database changes,
AdMob/Play changes or Personal Routines changes are authorized by this slice.
