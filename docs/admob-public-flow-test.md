# Public age/consent flow — sample-only test preparation

## Owner-reported native UI observations

The owner reports the following emulator observations for public-ad-flow-test:

- Under 18 and Prefer not to answer selections are reflected in the UI.
- Declaration controls appear on Home and in Settings.
- Switching accounts does not inherit another account's declaration.
- Switching screens caused no observed crash, freezing or workout issue.
- Choosing 18 or older displayed "Advertisement" above an empty area.
  No banner or consent success was confirmed.

These are owner-reported native UI observations, not agent-performed native
checks. They do not establish SDK-call suppression, consent acceptance, ad
loading, the actual regional outcome or zero native traffic.

## Authorization and configuration

The owner approved Google's UMP/Mobile Ads approach plus a supported Purpose 1
veto where applicable, not a custom worldwide purpose/vendor/legal-basis guarantee.
A successful current-session refresh is mandatory. Adult self-declaration is
approved; a separate default-off advertising preference is not.

`public-ad-flow-test` extends preview (internal Android APK, Node 22) and sets
BELUGA_ADS_MODE=public-flow-test. The installed native config must have exactly
that mode/profile, audienceApproved=false, Google's sample App ID and fixed
banner test ID. Both config-time manifest validation and runtime checks reject
non-sample IDs. Unknown/missing native settings cannot enable this profile.
OTA extras and __DEV__ are not activation inputs.

Normal preview/development, production, the accepted dependency repairs and
Personal Routines are unchanged. Internal rendering remains a separate explicit
Start/Stop session. The public-flow branch never mounts those developer controls.
No native build, live request, push, migration or AdMob/Play setting change was
performed by this implementation.

## Age declaration and ownership

- Home offers 18 or older / Under 18 / Prefer not to answer. This is advertising
  eligibility only, not identity verification or a condition of tracking access.
- Settings always allows reviewing/changing the category in this test profile.
- No DOB, profile-derived age, targeting parameter or separate ad preference.
- Storage is AsyncStorage, not encrypted storage: one versioned value per account,
  with matching owner checked inside the value. No ownerless legacy migration.
  Malformed/unreadable data fails closed with visible feedback.
- Reads, writes and removal are serialized per account. Owner/version checks reject late
  A results after B signs in, including writes and return-to-A reads.
- Changing the declaration invalidates banner eligibility immediately, before
  the write settles. A failed write leaves age unresolved and advertising off.
- App auth-owner transitions reset in-memory state and refresh eligibility.
  Logout does not erase the saved category; only that account can restore it.
  Persistence contains age category/ownership/version, never consent permission.
- Entries have no time-based expiry. Confirmed deletion removes only the deleted
  owner's local entry, before completing the existing local account cleanup.
  Ordinary logout preserves it. No Google UMP reset is involved.
- Deletion starts by immediately invalidating that owner's eligibility and stale
  SDK/storage callbacks. Preflight failure or explicit server rejection preserves
  the entry and restores only the matching owner's normal eligibility checks.
- If removal fails, its owner stays suppressed in memory; the existing durable
  delete-account cleanup marker blocks reads/writes after restart. The failure is
  visible, the marker is not cleared, and local retry does not repeat delete_user
  or touch B's declaration/session. Server success still returns success; local
  failure does not undo server deletion. Unconfirmed server outcomes follow the
  existing local-only retry boundary without claiming server deletion succeeded.
- Removal is queued after outstanding writes, so an old write cannot recreate an
  entry after removal. An already-started native operation cannot be cancelled;
  stale callbacks cannot trigger further integration calls or restore eligibility.
  The cleanup in-memory block lasts for that process; restart still requires
  successful marker cleanup, a readable entry/new explicit declaration and UMP.
- Under-18, unanswered, unknown, pending or failed age state cannot enter this
  integration's UMP, explicit initialization or ad-request path. The separate
  owner-operated internal emulator session is unchanged.

## Current-session UMP and supported Purpose 1 veto

The Android factory calls only existing pinned APIs:

1. requestInfoUpdate(), once successfully per process/account/declaration epoch.
   An unsuccessful update cannot fall back to a previous canRequestAds value.
   A visible manual Retry is provided; there is no automatic retry loop.
2. loadAndShowConsentFormIfRequired(), only on safe focused foreground Home.
3. getConsentInfo(); require canRequestAds=true before initialization/request.
4. getGdprApplies() reads IABTCF_gdprApplies. Only true is accepted as positive
   TCF evidence. False includes missing native storage, so it is unresolved,
   not proof that GDPR/TCF does not apply. NOT_REQUIRED plus a positive TCF flag
   is treated as inconsistent and also blocked.
5. getPurposeConsents() reads IABTCF_PurposeConsents. Require a nonempty binary
   vector of at most 24 bits and Purpose 1 (first character) = 1. Missing,
   nonbinary/unsupported vectors block; a zero first bit vetoes the request.
   Purposes 3/4 do not participate in this veto.
6. Configure only emulator test devices, initialize, then mount one fixed sample
   banner with requestNonPersonalizedAdsOnly=true.

UMP is the status authority. Its own persisted consent data is not replaced with
an application cache, generated TC string, decoder or invented expiry period.
No getUserChoices fallback, purpose/vendor/LI evaluator or new native bridge.
The bit-vector validation and no-refresh-error fallback are extra app safeguards,
not claims that Google requires those exact application policies.
This does not independently validate the entire TC string or all lawful bases.

Settings shows privacy options whenever UMP reports REQUIRED for the eligible
adult owner, even if the banner is blocked. REQUIRED is not a refusal signal.
The controller invalidates/removes the banner and yields a frame before opening
the native privacy form. It then requires a new refresh and fresh evidence on
Home. Declaration changes, owner changes and stale lifecycle callbacks cannot
reuse the previous result.

## US behavior: documented mechanism, currently blocked request path

Pinned react-native-google-mobile-ads 15.8.3 selects Android GMA 24.6.0 and UMP
3.2.0 by default. Actual Gradle resolutions still require APK inspection.
The pinned AdsConsent.ts accepts REGULATED_US_STATE and OTHER test geography
values; Google documents regulated-US debugging for UMP >=3.1.0.
The current profile has no supported test-only geography selector or consent-reset
UI/configuration. Calls pass no debug geography and never invoke AdsConsent.reset.
Library support for test APIs does not mean the profile exposes those controls.

Google documents that UMP stores IABGPP_GppSID and IABGPP_HDR_GppString, and
Mobile Ads respects the GPP signals. This requires the applicable US messages
and choices to be configured correctly; NPA alone is not an opt-out mechanism.
No custom GPP parser, gad_rdp override, forced fallback or blanket
"US opt-out means no banner" rule is implemented.

However, this wrapper exposes no presence-aware non-TCF/applicability result.
Its false GDPR result is ambiguous. The public flow therefore stops before
initialization/banner requests in those cases, regardless of US choice.
This is unresolved evidence blocking, not a country allowlist or proof of
native GPP opt-out handling. US request-path support is NOT claimed complete.
Do not enable it by equating false or NOT_REQUIRED with explicit non-applicability.

Sources:
- https://developers.google.com/admob/android/privacy
- https://developers.google.com/admob/android/privacy/gdpr#how_to_read_consent_choices
- https://developers.google.com/admob/android/privacy/us-iab-support
- https://developers.google.com/admob/android/privacy/us-states
- Installed wrapper src/AdsConsent.ts and Android
  ReactNativeGoogleMobileAdsConsentModule.java; package.json sdkVersions.

## Lifecycle and verification

Home uses existing focus, AppState, retained workout/draft-read, recovery,
cleanup and discard-confirmation gates. The banner is removed when unsafe or
unmounted. Async work checks owner/generation/surface safety after every await.
Native requests/forms already in flight cannot be cancelled by these JS gates;
an initialized SDK cannot be shut down by withdrawing a declaration.
MobileAdsInitProvider can execute before JS: no zero-native-traffic claim.

Previously, Home rendered the label and 86dp slot whenever an adult declaration
was loaded, regardless of consent readiness or failure. Only the native creative
checked readiness. The owner's blank area is consistent with that UI behavior,
but it cannot identify which consent/error branch occurred on the emulator.

The exact sample-only public-flow branch now displays sanitized TEST status:
view state, controller phase, fixed reason and allowlisted error code. It never
formats account identifiers, declaration categories, consent strings or raw SDK
messages/codes. This display is absent from normal preview, production, web/iOS
and the separate internal-rendering branch.

Controller phases distinguish blocked, refreshing, awaiting-form, checking,
initializing, eligible, loading, loaded and failed. Awaiting-form means the
required-form/privacy-form API is pending, not proof a form is on screen.
Eligible means checks/initialization finished, not that a banner loaded.
Loading starts when the eligible native banner mounts; loaded requires its
onAdLoaded callback. Those callbacks are guarded against stale account/lifecycle
generations. A native loaded callback still does not prove an impression.

The label/slot is hidden before eligibility, on deliberate ineligibility
(including unknown applicability and Purpose 1 veto), unsafe surfaces and
insufficient width. The zero-height measuring wrapper and concise status do not
reserve banner space. An eligible load reserves 86dp; a subsequent no-fill/error
removes the creative but keeps that reservation and shows failed status.
An explicit retry starts another eligibility check; suspension/withdrawal hides
the slot. There is no automatic retry. Width under 320dp never mounts the banner.
Tracking and navigation controls remain independent of all advertising errors.

A newly built/installed APK would be needed for the ordinary local native test
workflow to see this status display. No APK was built by this change, and no
outcome is inferred for the already tested binary.

Local mocked tests:
```
node scripts/test-public-ad-flow.js
node scripts/test-advertising.js
node scripts/test-internal-test-ads.js
npm run type-check
```

The public suite covers age choices, pending/failing/foreign/corrupt storage,
logout/owner changes and late reads/writes, refresh failure without cached
permission fallback, UMP denial, Purpose 1 permission/refusal/malformed evidence,
personalization-only refusal, privacy options/withdrawal/reassessment, async
cancellation, sample/profile isolation and mounted lifecycle/no-fill behavior.
The US fixture intentionally remains blocked; it does not simulate passing
native GPP compliance. All SDK, storage and native views are mocked.

### Smallest next native test — separate build authorization required

1. Build/install this profile only after authorization. Inspect embedded sample
   config, actual GMA/UMP resolutions, manifest/providers and shrinking.
2. With only the sample App ID, no owner AdMob message setup is needed to test
   the negative gates: unknown/minor/prefer-not states, Settings changes,
   account switching, adult refresh failure/ambiguous applicability and absence
   of developer controls. Observe calls/traffic rather than assuming silence.
3. To test actual TCF Purpose 1 acceptance/refusal, a valid UMP message must be
   available for the configured App ID. Do not assume Google's sample App ID
   supplies it. Existing supported EEA/test-device debug options can be reviewed
   for a separately approved test setup; they are not forced in this profile.
4. An owner-created UNPUBLISHED message draft is review material only: UMP
   cannot serve it merely because it exists. The owner cannot attach their
   messages to Google's sample App ID. If Google's test setup cannot provide
   the needed message, stop. A dedicated owner test-app App ID and publishing
   test messages would need separate approval because the current authorization
   requires sample identifiers and forbids message publication/settings changes.
5. Deletion checks: remove A only after confirmation, preserve B and logout
   retention, reject preflight/server failure without erasing the declaration,
   simulate local removal failure and restart, then retry local cleanup without
   a second server deletion. Compare explicit JS-call observation against native
   startup/network behavior; do not equate those claims.
6. Future US native testing should cover regulated-US and OTHER test geography,
   opt-out changes, stored GPP signals and Mobile Ads behavior. Until
   applicability is resolved through an approved supported route, verify the
   current blocking behavior; do not bypass it to request an ad.

Current owner-reported internal-rendering results are in
admob-internal-rendering.md. They do not establish this new flow, physical-device,
US/TCF production-consent, provider traffic or public-release validation.
