# Consent correction and audience proposal — advertising remains disabled

## Confirmed owner facts

- Intended audience: adults aged 18 and over.
- Google Play target audience: 18 and over only.
- Distribution: worldwide.
- Current app: no age check or date-of-birth requirement.

These classify intended content/users; they do not verify any individual user's
age. `audienceApproved=false`, production disabled and sample identifiers only
are unchanged. No SDK, dependency, age-collection or database changes are made.

## Evidence before any purpose/vendor predicate

Pinned environment: react-native-google-mobile-ads 15.8.3, GMA Android default
24.6.0, UMP default 3.2.0. Neither native resolution nor behavior has been built
or verified. This proposal does not rely on current-SDK-only age APIs.

Sources reviewed for this change:

1. [Google Android legacy SDK ad-serving modes](https://developers.google.com/admob/android/privacy/ad-serving-modes#non-personalized_ads).
2. [Google AdMob TCF integration, NPA requirements and publisher restrictions](https://support.google.com/admob/answer/9760862?hl=en).
3. [Pinned v15.8.3 consent guide](https://github.com/invertase/react-native-google-mobile-ads/blob/v15.8.3/docs/european-user-consent.mdx).
4. [Google UMP GDPR/under-age guidance](https://developers.google.com/admob/android/privacy/gdpr).
5. [Google Android UMP flow](https://developers.google.com/admob/android/privacy).

The pinned guide links the Google ad-serving requirements. Google's live policy
pages are not archived v24.6.0 snapshots; their current requirements must not be
mistaken for proof of a new API being available in this older pinned binary.

For TCF-governed Google NPA, the documented requirements are:

| Purpose | Required basis for Google |
| --- | --- |
| 1 — store/access information on a device | Consent |
| 2 — select basic ads | Established legitimate interest, or consent if CMP restrictions require it |
| 7 — measure ad performance | Same |
| 9 — market research/audience insights | Same |
| 10 — develop/improve products | Same |

Google/vendor permission and applicable publisher restrictions must also be
honored. Purposes 3/4 (personalized advertising) are not NPA prerequisites.
Non-personalized ads can still use device identifiers/storage for frequency
capping, fraud prevention and reporting. `requestNonPersonalizedAdsOnly=true`
limits the requested mode; it grants no permission and is not our refusal policy.
We do not fall back to limited/technical ads after required permission is missing.

## What the pinned API can and cannot establish here

- `requestInfoUpdate`, `loadAndShowConsentFormIfRequired`, `getConsentInfo` and
  `showPrivacyOptionsForm` provide the supported UMP flow.
- `canRequestAds` is UMP readiness aligned with configured messages. OBTAINED
  can follow acceptance or refusal. Neither state is all-purpose acceptance.
- `getUserChoices` is a documented purpose-choice helper. In 15.8.3, a decode
  failure returns a default model with false choices. A false or missing choice
  therefore means permission is not established, not a proven explicit refusal.
- Its booleans do not establish Google's vendor-specific legitimate interests,
  flexible-purpose registration and publisher restrictions. Requiring every
  purpose-consent boolean would also incorrectly reject legitimate-interest
  paths Google documents as valid.
- Documented `getPurposeLegitimateInterests` and `getTCModel` also exist. We are
  not claiming vendor data is categorically inaccessible. But there is no
  documented single Google-NPA-eligibility result, and a reviewed mapping of the
  configured vendor registrations/restrictions and applicable regional messages
  has not been established here. No raw/undocumented consent parsing is added.
- The pinned native `getGdprApplies` returns false when its stored key is absent.
  It cannot distinguish explicit non-applicability from missing data and is no
  longer used as a positive gate.
- The GDPR purpose helper does not provide a validated worldwide/US-state
  refusal/applicability assessment for this app. Actual UMP message configuration
  has not been inspected or changed.

**Result:** no positive purpose/vendor predicate is implemented. After UMP
readiness the controller inspects documented choices only to explain why
permission is unestablished; even all true purpose choices cannot authorize
initialization or a request. An operational assessment would need independently
established applicability, valid current choices, vendor/legal-basis/restriction
evaluation and the app's configured regional messages. This is a missing complete
assessment, not an assertion that every needed bit is unavailable.

## Corrected decision flow

| Signal | UMP stage | Additional app policy |
| --- | --- | --- |
| UNKNOWN / REQUIRED / canRequestAds=false | Not ready; collect an available required form only on a safe surface | No request |
| OBTAINED + canRequestAds=true | Ready, regardless of privacy-options requirement | Assess applicable permissions; currently unestablished |
| NOT_REQUIRED + canRequestAds=true | Ready; not proof that all worldwide requirements are absent | Same |
| Privacy options REQUIRED | Show Settings entry point | Not a refusal or independent ad ban |
| False, absent or unparseable choices | Does not undo UMP readiness | No request; never label this alone as explicit refusal |
| All purpose booleans true | Not complete vendor/legal-basis proof | No request until a complete assessment is approved |

The closed audience gate currently prevents all consent calls/forms as well.
On a future approved configuration, required forms precede banner assessment.
Home focus, foreground, recovery, retained-workout and cleanup guards remain.
Privacy choices invalidate prior eligibility independently of whether the
privacy-options entry point is required. No automatic form is shown on Settings.

## Minimum audience-handling proposal — decision still pending

1. Keep the adult-only content/Play classification accurate, but do not use it
   as a per-user age assertion. Worldwide digital-consent thresholds and child
   treatment rules are not equivalent to a universal under-18 test.
2. For this unverified-age app, retain the disabled audience/request gates until
   the owner approves how unknown age will be handled and that approach has
   received the appropriate policy/legal review. Intended adult content alone
   is insufficient to choose ad treatment for every user.
3. Do not globally set under-age=false, or classify every unknown user as a
   child, simply to activate ads. No new DOB collection, age gate, age-signal
   integration or persistent age data is proposed as an implemented change.
4. The pinned package supports GMA request configuration
   `tagForChildDirectedTreatment` and `tagForUnderAgeOfConsent`, and a separate
   UMP `requestInfoUpdate({tagForUnderAgeOfConsent})` option. UMP's under-age flag
   is not automatically forwarded to GMA requests. No flags are selected here.
   Any future use must reflect actual approved handling, not Supabase inference.
5. Resolve unknown-age treatment, relevant regional requirements and configured
   privacy messages before approving a native configuration. The minimum safe
   implementation today is to leave advertising off, not to add unapproved
   personal-data collection or assume adult status.

## Native caveat and validation

The JS gate controls explicit JS calls only. The native SDK's
MobileAdsInitProvider can run before JS. DELAY_APP_MEASUREMENT_INIT=true,
no explicit JS initialize(), and zero native network traffic are distinct claims.
No zero-traffic/native compatibility claim is made from local tests.
The separately authorized preview checklist remains in admob-home-test-only.md.
