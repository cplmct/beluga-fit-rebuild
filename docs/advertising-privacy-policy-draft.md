# Beluga Fit advertising privacy wording — DRAFT, NOT PUBLISHED

This is proposed wording for review before a future advertising-enabled release.
It does not change the in-app or hosted policy and does not describe advertising
as currently enabled.

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

Beluga Fit does not pass account identifiers, the age declaration, profile data,
workout history, measurements, injuries or goals to Google's consent or ad-request
APIs. It does not derive advertising audiences or targeting from fitness data.
The local app uses an account identifier only to separate saved declarations on
the device; this local ownership check is not advertising targeting.

The declaration category is stored locally, separately for each account, and
can be reviewed or changed in Settings. Changing it immediately invalidates
ad eligibility. Signing out clears in-memory eligibility; it does not remove
the account's stored declaration. The same account may restore its category
on this device; another account cannot reuse it. No declaration is sent to
Supabase. No separate "Show ads" preference is included.

After confirmed account deletion, the app removes only that account's declaration
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

Where applicable, Google's UMP consent flow would collect choices before
permitted advertising. Advertising privacy options would be available in
Settings when UMP requires the entry point. That requirement itself does not
mean a user refused advertising. A successful consent refresh in the current
app session is required; refresh failure blocks requests even if UMP has prior
consent information. Applicable unresolved evidence also blocks requests.

Google's documented UMP/Mobile Ads approach remains the consent-status authority.
Where TCF applicability is established, an additional supported Purpose 1
(device storage/access) check can veto a request. Declining personalization
alone is not treated as declining non-personalized ads. This is not a complete
worldwide purpose/vendor/legal-basis refusal engine, and no promise is made
that every US opt-out suppresses every banner.

Applicable US choices are intended to be handled through Google's supported
UMP/GPP configuration and Mobile Ads behavior, not a custom GPP parser or an
assumption that requesting NPA satisfies opt-outs. The current test implementation
cannot reliably establish non-TCF applicability through the pinned wrapper, so
that request path remains blocked, including unresolved US cases. No explicit
restricted-data-processing fallback or additional ad mode is added.

These controls govern this integration's JS calls. They do not establish that
native SDK providers send no traffic before a declaration or after eligibility
is withdrawn. That behavior still requires native inspection.

## Still required before publication or activation

- Verify the actual regional consent-message configuration and SDK behavior;
  resolve blocked applicability cases without inventing evidence.
- Verify native startup/network behavior and exact SDK processing/disclosures.
- Confirm Google's actual provider processing purposes, recipients, retention,
  deletion mechanisms and any international transfers for the intended release.
- Review the absence of time-based declaration expiry and the limits of
  device-local deletion; verify native removal and failure/retry behavior.
- Reconcile local declaration handling with the full account-deletion wording.
- Reconcile the full policy, retention facts and Play Data safety declarations.

This draft is not a legal-compliance guarantee. No policy, consent message,
Play declaration or AdMob setting has been published or changed.
