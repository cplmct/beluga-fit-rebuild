# Beluga Fit advertising privacy wording — DRAFT, NOT PUBLISHED

This is proposed wording for review before a future advertising-enabled release.
It does not change the in-app or hosted policy and does not describe advertising
as currently enabled.

## Intended audience

Beluga Fit is intended for adults aged 18 and over. Its Google Play target
audience is 18 and over only, and it is distributed worldwide.

The current app does not require an age check or date of birth. Its adult
audience classification does not verify the age of an individual user.
Appropriate treatment of unknown-age users remains unresolved. Advertising
remains disabled while this decision and the required permission assessment
are outstanding.

## Proposed future advertising disclosure

If enabled in a future release, the Android app would display one Google AdMob
banner on Home. Only non-personalized advertising would be requested after the
approved audience and applicable permission checks. Non-personalized advertising
is not anonymous or consent-free: Google may process device/network information,
identifiers and diagnostic/interaction information for delivery, reporting,
frequency capping, security and fraud prevention.

Beluga Fit does not pass account identifiers, profile data, workout history,
measurements, injuries or goals to its advertising module. It does not derive
advertising audiences, keywords or age-treatment flags from fitness/account data.

Where applicable, Google's UMP consent flow would collect choices before
permitted advertising. Advertising privacy options would be available in
Settings when UMP requires the entry point. That requirement itself does not
mean a user refused advertising. Requests would remain blocked where required
permission is declined or cannot be established. A stored consent-status value
alone would not be treated as acceptance of every purpose.

## Still required before publication or activation

- Approve unknown-age and regional audience handling without assuming every
  user is an adult; do not claim an age check exists.
- Establish a complete applicable-purpose/vendor/refusal assessment and verify
  the actual regional consent-message configuration.
- Verify native startup/network behavior and exact SDK processing/disclosures.
- Reconcile the full policy, retention facts and Play Data safety declarations.

This draft is not a legal-compliance guarantee. No policy, consent message,
Play declaration or AdMob setting has been published or changed.
