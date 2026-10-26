# Android Home banner: disabled test-only preparation

## Scope and baseline

The accepted baseline already contains Node 22, tar 7.5.21, shell-quote 1.11.0
and the scoped EAS CLI override. Those repairs are separate from this feature.
The existing agent notes `.agents/memory/MEMORY.md` and
`.agents/memory/scoped-npm-overrides.md` are not advertising deliverables and
have not been changed by this implementation.

Personal Routines is untouched. No database changes, live advertising, mediation,
other placements, policy publication or native builds are part of this work.

## Versions and remaining compatibility checks

Exact dependency: react-native-google-mobile-ads 15.8.3. Its package.json and
android/build.gradle select Google Mobile Ads 24.6.0 and UMP 3.2.0.
The installed Expo 53.0.27, RN 0.79.6, React 19 and Supabase resolutions are
unchanged. Kotlin remains 2.1.0, minSdk 24, compile/targetSdk 36. Release shrinking
stays enabled; the version-documented UMP keep rule is added.

Source: https://github.com/invertase/react-native-google-mobile-ads/tree/v15.8.3
Google lifecycle: https://developers.google.com/admob/android/deprecation
The reviewed timetable lists 24.x deprecation June 30, 2027 and sunset June 30,
2028. Recheck before release. No native compatibility claim is made.

## Why no requests occur

`audienceApproved` is **false** in the embedded native configuration. No SDK
import, UMP network request, Mobile Ads initialization or banner request is
made through this integration while that gate is false.

No age flags or age assumptions have been invented. Before any real test-device
requests, separately review the audience, UMP messages and any necessary audience
handling. Rebuilding an APK alone does not approve or open the gate.

The controller calls documented requestInfoUpdate/getConsentInfo,
loadAndShowConsentFormIfRequired and showPrivacyOptionsForm APIs only after
the configuration/audience gate opens. Refresh is once per process at app launch;
forms are deferred to focused, foreground Home (or explicitly tapped Settings).
Home blocks forms for retained workouts, recovery and account cleanup.

`OBTAINED` and `canRequestAds` are not proof of affirmative purpose/vendor
consent. In this first implementation, all REQUIRED/OBTAINED/UNKNOWN cases,
required privacy-option regions, and unknown GDPR applicability remain
**banner-disabled**, including users who accepted a regulated-region form.
The supported high-level APIs do not establish every necessary vendor/purpose
permission for our conservative policy. Only explicit NOT_REQUIRED, GDPR false,
privacy-options NOT_REQUIRED and canRequestAds true pass the consent predicate.
Do not weaken this to an OBTAINED or NPA-only check.

The SDK's non-personalized request flag is set on the sole banner, but is never
used as permission. Decline/unknown/error/no-fill does not block fitness access.
Privacy options are displayed in Settings only when UMP reports REQUIRED.

## Build/OTA/platform protection

Development and preview profiles explicitly select test mode. Production and
unknown profiles are disabled. Invalid modes fail configuration validation.
Only Google's sample IDs exist in executable configuration. Android runtime
reads ExponentConstants' installed `app.config` asset, not OTA/expoConfig extras.
An unknown/missing native asset is disabled. Changes to the audience gate require
a reviewed native rebuild. There is no executable live-ID mode.

The Android-only manifest plugin installs the sample App ID and delayed
measurement metadata, equivalent to the pinned library's Android settings.
It registers no iOS mods. react-native.config.js disables iOS autolinking;
non-Android UI/runtime files never import the ad library.

Future live identifiers, **documentation only, never activated**:
- Android App ID: ca-app-pub-5534915161634783~7684377807
- Home banner: ca-app-pub-5534915161634783/2005509866

## Data isolation and placement

The module imports no Supabase/auth client. It accepts only a sensitive-flow
blocking boolean, never identity or fitness fields. No targeting extras, keywords,
custom audiences, location, account identifiers or fitness data are supplied.
Google may separately process device/network information if enabled in the future.

One fixed non-collapsible 320x50 banner is placed after Body in Home's scroll
content, with 32dp separation above/below and fixed reserved height. A container
narrower than 320dp does not render a banner. No-fill preserves slot dimensions
and triggers no JS retry loop. No banner or SDK requests are initiated on another
screen; navigation/background immediately removes the banner component.

## Separately authorized native preview checklist

1. Review audience and consent-message prerequisites. Keep the gate false until
   approved. First disabled-gate build can test native linkage/startup only.
2. After separate build authorization, use the preview profile for an APK.
   No native build was started by this implementation.
3. Inspect generated/merged AndroidManifest.xml for sample APPLICATION_ID,
   DELAY_APP_MEASUREMENT_INIT=true, merged AD_ID/other SDK permissions, and no
   live identifiers. Inspect generated app.config asset: preview=test,
   audienceApproved=false. Verify production embeds disabled.
4. Inspect generated proguard-rules.pro and test a shrunk release APK for UMP
   and Banner native classes. Verify actual Gradle GMA/UMP resolutions, RN
   architecture, Kotlin compilation and iOS exclusion. Do not override SDKs
   or disable shrinking to force success.
5. On a device, verify zero UMP/ad requests with the gate closed. After a separate
   approved audience change, use only test inventory and appropriately configured
   UMP test geography/devices. Verify declined/unknown/regulated cases remain off.
6. Test Home focus, background/foreground, rapid navigation, retained draft,
   workout save, recovery, account cleanup, logout/account switch, no-fill,
   offline failures, Settings privacy changes, narrow screens and large fonts.
   Verify no overlay, shift or navigation obstruction.

