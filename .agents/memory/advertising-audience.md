---
name: Advertising audience facts
description: Owner-confirmed adult audience, worldwide distribution and the limits of that classification.
---

The owner confirms:
- Intended audience: adults aged 18 and over.
- Google Play target audience: 18 and over only.
- Distribution: worldwide.
- No identity/age verification or date-of-birth requirement.

These facts do not verify that every user is an adult. Do not infer per-user
age-treatment flags from the adult target audience or account/fitness data.

**Why:** the owner explicitly confirmed these facts and distinguished intended
audience from verified individual age.

**How to apply:** use them for audience and policy discussions; keep unknown-age
handling explicit rather than assuming age verification or adding collection.

Owner-operated internal emulator sample-banner sessions must remain separate
from real-user audience and consent approval. Test IDs are not a privacy exemption;
do not open the real-user gate or invent consent to make a test banner render.

**Why:** the owner explicitly requested independent rendering validation while
keeping normal preview and production advertising closed.

**How to apply:** preserve that separation in future advertising changes; native
rendering success does not establish production consent or zero SDK traffic.

The owner specifies one Home banner, with core tracking remaining free.
Internal developer test controls must not appear in the public release.
Non-personalized advertising is the proposed initial configuration, not an
approved activation.

**Why:** the owner stated these product and release constraints.

**How to apply:** keep public advertising proposals within that scope; do not
treat internal testing success as authorization to enable real-user advertising.

The owner approved a sample-only public-flow test using Google's UMP/Mobile Ads
approach and a supported Purpose 1 veto, not a custom worldwide legal-basis
guarantee. A successful current-session refresh is required; unresolved evidence
or refresh failure blocks requests. US choices should use supported Google
handling, not a blanket no-banner rule after every US opt-out.

The approved advertising-only self-declaration is 18 or older / Under 18 /
Prefer not to answer. Minor, unanswered and unknown states get no advertising;
tracking remains available. Do not collect DOB, infer age from fitness/profile
data, share the declaration as targeting, or add a separate default-off Show ads
preference. Keep choices account-isolated and changeable in Settings.

**Why:** the owner explicitly approved this narrower product package while
withholding live-production activation and dependency/native-adapter approval.

**How to apply:** preserve these boundaries in further advertising work; a
successful test is not approval for live identifiers or production advertising.
