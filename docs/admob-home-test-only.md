# Android Home banner: disabled test-only preparation

Normal development/preview and production remain closed as described below.
A separate owner-operated emulator rendering mode is documented in
[admob-internal-rendering.md](admob-internal-rendering.md). Its explicit Start
flow does not approve or enable the real-user consent controller. Statements
below about no integration requests apply to the ordinary closed-gate path,
not an explicitly started internal test session.

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

The owner confirms adults 18+ as the intended audience and Google Play target
audience, with worldwide distribution. The app has no age check or DOB
requirement. These facts do not verify every user's age. No age flags have been
selected. Audience handling remains unresolved; rebuilding an APK alone does not
approve or open the gate. See admob-consent-and-audience.md.

The controller calls documented requestInfoUpdate/getConsentInfo,
loadAndShowConsentFormIfRequired and showPrivacyOptionsForm APIs only after
the configuration/audience gate opens. Refresh is once per process at app launch;
forms are deferred to focused, foreground Home (or explicitly tapped Settings).
Home blocks forms for retained workouts, recovery and account cleanup.

`OBTAINED` and `NOT_REQUIRED`, with canRequestAds=true, pass the UMP readiness
stage. Privacy-options REQUIRED controls the Settings entry point and is not a
refusal signal. Available required forms can precede permission assessment on a
safe Home surface, but the closed audience gate currently prevents all UMP calls.

The additional NPA permission assessment remains **disabled for every request**:
documented getUserChoices results alone do not establish the full Google/vendor,
legal-basis, restriction and worldwide-applicability decision. False choices
can also reflect decoder fallback, not a proven refusal. No positive
purpose/vendor predicate is invented, and getGdprApplies is no longer used.
See admob-consent-and-audience.md for the authoritative requirements and limits.

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
5. Inspect native providers, especially MobileAdsInitProvider. Delayed app
   measurement and no explicit JS initialize() are not proof of zero native
   traffic. Capture cold-start traffic before JS and correlate process/logcat
   timing. After separately approved audience and permission changes, use only
   test inventory and appropriate UMP test geography/devices. Required permissions
   that are declined or unestablished must still block requests.
6. Test Home focus, background/foreground, rapid navigation, retained draft,
   workout save, recovery, account cleanup, logout/account switch, no-fill,
   offline failures, Settings privacy changes, narrow screens and large fonts.
   Verify no overlay, shift or navigation obstruction.

