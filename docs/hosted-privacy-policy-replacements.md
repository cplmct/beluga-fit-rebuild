# Complete proposed hosted privacy policy — OWNER REVIEW ONLY

Not published. Proposed complete privacy-policy text for
https://belugafit.tranbtc.com/privacy, based on the hosted policy dated 2026-10-25.
The owner should set the revision date when publishing approved text. The
existing Terms & Conditions are not replaced by this document.

## Begin proposed hosted text

# Privacy Policy

Beluga Fit (“we,” “our,” or “the app”) provides fitness tracking tools. This
Privacy Policy explains how information is collected, used, and shared when you
use our mobile application. Our website may also provide app information,
support, and links to this policy.

## Information you provide

Depending on the features you use, you may provide:

- Account information, such as your name, email address, and optional profile details.
- Fitness information, such as workout logs, exercise performance, goals, body measurements, and preferences.
- Optional notes and other information you choose to record.
- Support information you send when contacting us.

Please avoid including information in notes or support messages that you do not
want us to receive.

## How we use your information

We use information to:

- Create and manage your account.
- Save and display your workouts and progress.
- Provide the features and preferences you select.
- Maintain app reliability and security.
- Respond to support requests.
- Improve the app.

### Advertising and Google AdMob

In Android builds where advertising is enabled, Beluga Fit may request one
non-personalized Google AdMob banner on Home after eligibility and applicable
privacy checks. Non-personalized advertising is not anonymous or consent-free.

Google's SDKs may independently process IP addresses (which may indicate general
location), device and advertising identifiers, app and ad interactions, and
diagnostic information for advertising delivery, reporting, security, and fraud
prevention.

Beluga Fit does not pass workout history, body measurements, injuries, fitness
goals, notes, profile details, names, email addresses, Beluga Fit account IDs, or
the local advertising-age declaration to Google's consent or advertising
services. Google may independently collect device and network information as
described above.

For more information, see the [Google Privacy Policy](https://policies.google.com/privacy)
and [How Google uses information from sites or apps that use its services](https://policies.google.com/technologies/partner-sites).

### Advertising privacy choices

In builds where advertising consent management is enabled, Beluga Fit uses
Google’s User Messaging Platform (UMP) to update consent information and, where
required, present privacy messages. This process communicates with Google and
may occur before any advertisement is requested, including when no advertisement
is ultimately displayed.

Consent information and privacy-choice signals may be stored on your device
and used to determine whether advertisements may be requested. Declining consent
does not prevent access to Beluga Fit’s core workout-tracking features.

Where applicable, you can revisit your choices through the app’s advertising
privacy options. Changing your choices affects subsequent processing but does
not automatically delete information previously collected.

The app performs these UMP operations before explicitly initializing Mobile Ads
or requesting a banner; they may occur before you make a choice. Blocking ad
requests does not mean that all Google SDK communication is blocked.

When UMP requires an advertising privacy-options entry point, signed-in users
with an adult declaration can open Settings → Privacy & Legal → Advertising
privacy options after the app has obtained that requirement. The app suspends
advertising eligibility while opening those options and reassesses it before
requesting another advertisement. The requirement is normally obtained when
visiting eligible Home; the control is not an always-visible preference.
You may also manage advertising-related settings through your device.

Where enabled, the advertising-age declaration is stored locally, separately for
each account, without a time-based expiry. It can be changed in Settings.
Signing out preserves the declaration but clears active advertising eligibility;
another account cannot reuse it. The declaration is not sent to Supabase or to
Google's consent or advertising request APIs.

## Service providers and sharing

We use service providers to support functions such as account authentication,
database hosting, and app operation, including Supabase and Expo. These
providers process information as necessary to perform their services.

Google's consent and advertising services may independently collect and process
information as described above and in Google's privacy documentation.

We do not supply fitness records to advertising services. We may disclose
information when necessary to comply with legal obligations, protect users,
investigate abuse, or protect the security of our services.

## Data security

We use safeguards such as encrypted connections and access controls to help
protect your information. No method of electronic storage or transmission is
completely secure, and we cannot guarantee absolute security.

## Retention and deletion

We retain account and fitness information as needed to provide the service,
subject to applicable legal and security requirements. You may request account
deletion through Settings → Delete Account or by contacting
[Developer@tranbtc.com](mailto:Developer@tranbtc.com). Follow the app's confirmation
and error messages; an unconfirmed request is not proof that deletion succeeded.
We do not promise immediate removal from every system or a fixed backup expiry
period.

Following confirmed account deletion, the app attempts to remove that account's
local advertising-age declaration from this device. If local cleanup fails, the
declaration cannot be reused until cleanup succeeds. This does not erase
declarations on other devices or reset or delete Google's consent records.

Deleting your Beluga Fit account does not
automatically delete information held independently by Google or other
providers. Their retention and deletion practices are governed by their own
policies.

## Your choices and requests

Depending on the features available and applicable law, you may:

- Review or update information in your account.
- Delete information through available app controls.
- Request access to, correction of, or deletion of your personal information.
- Review applicable advertising privacy choices.

Contact [Developer@tranbtc.com](mailto:Developer@tranbtc.com) for assistance.
We may need to verify your identity before completing a request.

## Intended audience

Beluga Fit is intended for adults aged 18 and over. Where enabled, the
advertising-age declaration is a self-declaration, not age or identity
verification, and does not collect a date of birth. Under-18, unanswered, or
unavailable declarations keep advertising off without preventing core workout
tracking. If you believe a child has provided personal information, contact
[Developer@tranbtc.com](mailto:Developer@tranbtc.com) so we can investigate and
take appropriate action.

## Changes to this policy

We may update this policy as the app changes. The revision date identifies the
most recent revision. Where required, we will provide additional notice or
request consent for material changes.

## Contact

For privacy questions or requests:
[Developer@tranbtc.com](mailto:Developer@tranbtc.com)

## End proposed hosted text

## Review notes — NOT proposed hosted-policy text

- Set the hosted revision date only upon owner-approved publication.
- Source inspection verifies app-supplied arguments and explicit call order.
  Native SDK payloads, provider startup, and network behavior are not verified.
- Validate the Home-first privacy-options dependency on device, especially cold
  start into Settings, account changes, and externally changed consent choices.
  No consent behavior has been changed to address this dependency.
- Production/normal preview advertising and the non-TCF path remain disabled.
  Explicit GDPR-applicability 0 is not proof of US location or regional compliance.
- The proposed consent-eea-test profile is not implemented; the owner-reported
  App ID, message association, and test-device setup have not been verified.
- Actual native SDK resolutions, configured partners, processing recipients,
  provider retention/deletion, backup schedules, and international transfer
  details remain unverified. Do not add fixed periods, universal erasure
  guarantees, or transfer safeguards without supporting facts.
- Native declaration deletion and storage-failure/retry behavior still need
  device validation; automated mocked-storage tests are not native evidence.
- A rejected deletion preserves the declaration. Local cleanup does not prove
  server deletion when its outcome is unconfirmed, and failed local cleanup does
  not reverse confirmed server deletion. Pending cleanup blocks declaration reuse.
- Contact links must resolve to mailto:Developer@tranbtc.com, not a project URL.
