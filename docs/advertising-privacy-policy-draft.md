# Beluga Fit advertising privacy wording — DRAFT, NOT PUBLISHED

This is proposed wording for review before a future advertising-enabled release.
This document is not the hosted policy. The in-app wording has been aligned
with the qualified behavior below; the hosted replacement text is in
`docs/hosted-privacy-policy-replacements.md` for owner review only.
Neither document describes production advertising as currently enabled.

## Intended audience

Beluga Fit is intended for adults aged 18 and over. Its Google Play target
audience is 18 and over only, and it is distributed worldwide.

The approved advertising design asks users to self-declare "18 or older",
"Under 18", or "Prefer not to answer". This controls advertising eligibility,
not access to workout tracking. It does not verify identity or age, collect a
date of birth, or derive advertising age from fitness/profile information.
Under-18, unanswered, unknown and unavailable choices keep advertising off.

This design is implemented only in a separate sample-only test configuration.
Normal preview and production advertising remain disabled. Do not describe this
test implementation as an already-enabled public advertising service.

## Proposed future advertising disclosure

If enabled in a future release, the Android app would display one Google AdMob
banner on Home. Only non-personalized advertising would be requested after the
approved audience and applicable permission checks. Non-personalized advertising
is not anonymous or consent-free: Google may process device/network information,
identifiers and diagnostic/interaction information for delivery, reporting,
frequency capping, security and fraud prevention.

Beluga Fit does not pass Beluga Fit account identifiers, the age declaration,
profile details, names, email addresses, notes, workout history, measurements,
injuries or goals to Google's consent or ad-request
APIs. It does not derive advertising audiences or targeting from fitness data.
The local app uses an account identifier only to separate saved declarations on
the device; this local ownership check is not advertising targeting.
This finding concerns verified app-supplied API arguments, not a complete
inspection of native SDK payloads or network behavior.

The declaration category is stored locally, separately for each account, and
can be reviewed or changed in Settings. Changing it immediately invalidates
ad eligibility. Signing out clears in-memory eligibility; it does not remove
the account's stored declaration. The same account may restore its category
on this device; another account cannot reuse it. No declaration is sent to
Supabase. No separate "Show ads" preference is included.

After confirmed account deletion, the app attempts to remove only that account's declaration
from this device as part of local account cleanup. Starting deletion immediately
invalidates the account's in-memory advertising eligibility and outstanding work.
An explicit server rejection or a failed deletion preflight preserves the saved
declaration; normal eligibility checks must run again before advertising.

If local removal fails, the declaration may remain physically stored. The app
reports incomplete local cleanup and keeps the existing durable cleanup marker,
which blocks reading or overwriting that account's declaration, including after
restart. Retry local cleanup removes the entry without repeating server deletion
or removing another account's declaration. A confirmed server deletion is not
reversed by a device-storage failure. If the server outcome is unconfirmed, the
existing local-cleanup retry also removes the declaration without claiming the
server deletion succeeded. Google UMP consent is not reset by account cleanup.

There is no time-based expiry. This describes app-managed local entry removal on
the device performing cleanup, not forensic erasure or a remote wipe of other
devices. These boundaries have automated mocked-storage/account tests; native
device deletion behavior still requires inspection.

In builds where advertising consent management is enabled, Beluga Fit uses
Google's User Messaging Platform (UMP) to update consent information and, where
required, present privacy messages. This process communicates with Google and
may occur before any advertisement is requested, including when no advertisement
is ultimately displayed.

Consent information and privacy-choice signals may be stored on your device
and used to determine whether advertisements may be requested. Declining consent
does not prevent access to Beluga Fit's core workout-tracking features.

Where applicable, you can revisit your choices through the app's advertising
privacy options. Changing your choices affects subsequent processing but does
not automatically delete information previously collected.

The app performs these UMP operations before explicitly initializing Mobile Ads
or requesting a banner; they may occur before a user makes a choice. Blocking ad
requests does not mean that all Google SDK traffic is blocked. Source inspection
establishes the app's call order, not observed native network traffic.

Advertising privacy options are implemented at Settings → Privacy & Legal →
Advertising privacy options for the matching signed-in account with an adult
declaration after UMP reports the entry point REQUIRED. That requirement itself does not
mean a user refused advertising. A successful consent refresh in the current
app session is required; refresh failure blocks requests even if UMP has prior
consent information. Applicable unresolved evidence also blocks requests.
Opening privacy options invalidates eligibility; a new refresh and reassessment
are required before another ad request. The requirement is normally first
obtained on eligible Home; immediate access from Settings after a cold start
has not been established on device and is not promised.

Google's documented UMP/Mobile Ads approach remains the consent-status authority.
Where TCF applicability is established, an additional supported Purpose 1
(device storage/access) check can veto a request. Declining personalization
alone is not treated as declining non-personalized ads. This is not a complete
worldwide purpose/vendor/legal-basis refusal engine, and no promise is made
that every US opt-out suppresses every banner.

Applicable US choices are intended to be handled through Google's supported
UMP/GPP configuration and Mobile Ads behavior, not a custom GPP parser or an
assumption that requesting NPA satisfies opt-outs. The read-only Android bridge
distinguishes missing, invalid, explicit 0, and explicit 1 applicability values.
Explicit 0 means only that the stored GDPR-applicability flag is not applicable;
it does not establish location or that other regional requirements are satisfied.
The non-TCF request path remains deliberately blocked, including unresolved US
cases. No explicit
restricted-data-processing fallback or additional ad mode is added.

These controls govern this integration's JS calls. They do not establish that
native SDK providers send no traffic before a declaration or after eligibility
is withdrawn. That behavior still requires native inspection.

## Still required before publication or activation

- Verify the actual regional consent-message configuration and SDK behavior;
  resolve blocked applicability cases without inventing evidence.
- Verify native startup/network behavior and exact SDK processing/disclosures.
- Validate the Home-first privacy-options dependency on device, including cold
  start directly into Settings, account changes, and choices changed externally.
- The proposed consent-eea-test profile is not implemented. The owner-reported
  dedicated App ID and its message association/test-device setup remain unverified.
- Confirm Google's actual provider processing purposes, recipients, retention,
  deletion mechanisms and any international transfers for the intended release.
- Review the absence of time-based declaration expiry and the limits of
  device-local deletion; verify native removal and failure/retry behavior.
- Validate native local-deletion behavior. No immediate-everywhere deletion,
  fixed backup expiry, Google deletion, or cross-device wipe is promised.
- Review the proposed hosted replacements and reconcile Play Data safety
  declarations; repository wording changes do not update the hosted policy.

This draft is not a legal-compliance guarantee. No policy, consent message,
Play declaration or AdMob setting has been published or changed by this update.
