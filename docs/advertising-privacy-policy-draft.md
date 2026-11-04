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
injuries or goals to Google's consent or advertising
services. It does not derive advertising audiences or targeting from fitness data.
The local app uses an account identifier only to separate saved declarations on
the device; this local ownership check is not advertising targeting.
Google may independently collect device and network information as described above.

The declaration category is stored locally, separately for each account, and
can be reviewed or changed in Settings. Changing it immediately invalidates
ad eligibility. Signing out clears in-memory eligibility; it does not remove
the account's stored declaration. The same account may restore its category
on this device; another account cannot reuse it. No declaration is sent to
Supabase. No separate "Show ads" preference is included.

Following confirmed account deletion, the app attempts to remove that account's
local advertising-age declaration from this device. If local cleanup fails, the
declaration cannot be reused until cleanup succeeds. This does not erase
declarations on other devices or reset or delete Google's consent records.
There is no time-based expiry for the declaration.

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
requests does not mean that all Google SDK traffic is blocked.

When UMP requires an advertising privacy-options entry point, signed-in users
with an adult declaration can open Settings → Privacy & Legal → Advertising
privacy options after the app has obtained that requirement, normally on eligible
Home. The control is not an always-visible preference. Opening it suspends
advertising eligibility, which is reassessed before another advertisement.

For privacy questions, contact
[Developer@tranbtc.com](mailto:Developer@tranbtc.com).

## Internal implementation and verification notes — not public policy text

Source inspection verifies app-supplied API arguments and explicit call order,
not complete native SDK payloads or network behavior.

Starting deletion invalidates eligibility and outstanding work. A rejected
deletion or failed preflight preserves the declaration. Pending local cleanup
blocks reuse, including after restart. Retrying local cleanup does not repeat
server deletion or remove another account's declaration. An unconfirmed server
outcome is not claimed as successful deletion; failed local cleanup does not
reverse confirmed server deletion. Mocked tests are not native deletion evidence.

The UMP requirement itself does not mean refusal. A successful consent refresh in the current
app session is required; refresh failure blocks requests even if UMP has prior
consent information. Applicable unresolved evidence also blocks requests.
Opening privacy options invalidates eligibility; a new refresh and reassessment
are required before another ad request. Immediate access from Settings after a
cold start has not been established on device and is not promised.

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
