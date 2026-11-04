import React from 'react';
import { View, Text, ScrollView, StyleSheet, Linking } from 'react-native';

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

function Section({ title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return <Text style={styles.body}>{children}</Text>;
}

function ContactEmail() {
  return (
    <Text accessibilityRole="link"
      onPress={() => { void Linking.openURL('mailto:Developer@tranbtc.com'); }}>
      Developer@tranbtc.com
    </Text>
  );
}

function Bullet({ children }: { children: string }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bullet} />
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

export function PrivacyPolicyScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Privacy Policy</Text>
      <Text style={styles.meta}>Policy draft — not published</Text>

      <Body>
        This Privacy Policy explains how Beluga Fit ("we", "our", or "us") collects, uses, and protects your information when you use our mobile application. By using Beluga Fit, you agree to the practices described here.
      </Body>

      <Section title="1. Information We Collect">
        <Body>
          We collect the following information to provide and improve the Beluga Fit service:
        </Body>
        <Bullet>Account information — your email address and password (stored securely via Supabase Auth)</Bullet>
        <Bullet>Profile information — name, age, gender, height, and weight that you optionally provide</Bullet>
        <Bullet>Workout history — records of workout sessions you log, including exercises, sets, reps, and duration</Bullet>
        <Bullet>Body measurements — measurement entries you record over time for progress tracking</Bullet>
        <Bullet>Workout plan data — any workout plans or templates you create or save</Bullet>
        <Body>
          Beluga Fit does not ask for payment information, contacts, or precise device location for fitness tracking. Where advertising or consent management is enabled, Google may independently process device and network information as described below.
        </Body>
      </Section>

      <Section title="2. How We Use Your Information">
        <Body>
          Your information is used solely to deliver the Beluga Fit service:
        </Body>
        <Bullet>To create and manage your account</Bullet>
        <Bullet>To store and sync your workout history and body measurements across sessions</Bullet>
        <Bullet>To display your progress and history within the app</Bullet>
        <Bullet>To allow you to manage and delete your data at any time</Bullet>
        <Body>
          We do not supply your fitness records or Beluga Fit account identifiers to advertising services. Google's consent and advertising services may independently process device and network information as described below.
        </Body>
      </Section>

      <Section title="3. Data Storage and Security">
        <Body>
          We use Supabase for account authentication and database hosting, with encrypted connections and access controls, including authenticated sessions and row-level security. No method of storage or transmission is completely secure.
        </Body>
        <Body>
          We implement reasonable technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
        </Body>
      </Section>

      <Section title="4. Data Retention and Deletion">
        <Body>
          We retain account and fitness information as needed to provide the service, subject to applicable legal and security requirements. You may request account deletion through Settings then Delete Account, or contact <ContactEmail />. Follow the app's confirmation and error messages; an unconfirmed request is not proof that deletion succeeded.
        </Body>
        <Body>
          Confirmed account deletion is not reversed by a later device-cleanup failure. We do not promise immediate removal from every system or a fixed backup expiry period. Deleting your Beluga Fit account does not automatically delete information held independently by Google or other providers; their retention and deletion practices are governed by their own policies.
        </Body>
      </Section>

      <Section title="5. Your Privacy Rights">
        <Body>
          Depending on your location, you may have the following rights regarding your personal data:
        </Body>
        <Bullet>The right to access the data we hold about you</Bullet>
        <Bullet>The right to correct inaccurate information</Bullet>
        <Bullet>The right to request deletion of your data</Bullet>
        <Bullet>The right to withdraw consent at any time</Bullet>
        <Body>
          To exercise any of these rights, contact us at the address below. We will respond within a reasonable timeframe.
        </Body>
      </Section>

      <Section title="6. Third-Party Services">
        <Body>
          Beluga Fit uses the following third-party services to operate:
        </Body>
        <Bullet>Supabase — database and authentication (supabase.com/privacy)</Bullet>
        <Bullet>Expo / React Native — app framework and build infrastructure (expo.dev/privacy)</Bullet>
        <Bullet>Google UMP and AdMob — consent management and advertising in builds where enabled (policies.google.com/privacy; policies.google.com/technologies/partner-sites)</Bullet>
        <Body>
          These services have their own privacy policies. Google may independently process information as described below and in its privacy documentation.
        </Body>
      </Section>

      <Section title="7. Advertising and Privacy Choices">
        <Body>
          In Android builds where advertising is enabled, Beluga Fit may request one non-personalized Google AdMob banner on Home after eligibility and applicable privacy checks. Non-personalized does not mean anonymous or consent-free. Google may process IP addresses, device identifiers, ad interactions, and diagnostic information for delivery, reporting, security, and fraud prevention.
        </Body>
        <Body>
          In builds where advertising consent management is enabled, Beluga Fit uses Google's User Messaging Platform (UMP) to update consent information and, where required, present privacy messages. This process communicates with Google and may occur before any advertisement is requested, including when no advertisement is ultimately displayed.
        </Body>
        <Body>
          Consent information and privacy-choice signals may be stored on your device and used to determine whether advertisements may be requested. Declining consent does not prevent access to Beluga Fit's core workout-tracking features.
        </Body>
        <Body>
          Where applicable, you can revisit your choices through the app's advertising privacy options. Changing your choices affects subsequent processing but does not automatically delete information previously collected.
        </Body>
        <Body>
          The app performs these UMP operations before explicitly initializing Mobile Ads or requesting a banner; they may occur before you make a choice. Blocking ad requests does not mean that all Google SDK traffic is blocked.
        </Body>
        <Body>
          Beluga Fit does not pass workout history, body measurements, injuries, goals, notes, profile details, names, email addresses, Beluga Fit account IDs, or the local advertising-age declaration to Google's consent or advertising services. Google may independently collect device and network information as described above.
        </Body>
        <Body>
          Where Google UMP requires privacy options, signed-in users with an adult declaration can open Settings then Privacy & Legal then Advertising privacy options after the app has obtained that requirement, normally on eligible Home. This is not an always-visible preference. The app suspends advertising eligibility while opening those options and reassesses it before requesting another ad.
        </Body>
        <Body>
          Where the advertising-age declaration is enabled, it is a self-declaration, not age or identity verification. It is stored locally for each account without a time-based expiry and can be changed in Settings. Signing out preserves that account's declaration but clears active advertising eligibility. Another account cannot reuse it.
        </Body>
        <Body>
          Following confirmed account deletion, the app attempts to remove that account's declaration from this device. If local cleanup fails, the declaration cannot be reused until cleanup succeeds. This does not erase declarations on other devices or reset or delete Google's consent records.
        </Body>
      </Section>

      <Section title="8. Intended Audience">
        <Body>
          Beluga Fit is intended for adults aged 18 and over. The advertising declaration does not verify age or identity or collect a date of birth. Under-18, unanswered, or unavailable declarations keep advertising off without preventing core workout tracking. If you believe a child has provided personal information, contact us so we can investigate and take appropriate action.
        </Body>
      </Section>

      <Section title="9. Changes to This Policy">
        <Body>
          We may update this Privacy Policy from time to time. When we do, we will update the date at the top of this page. Continued use of the app after changes constitutes acceptance of the revised policy.
        </Body>
      </Section>

      <Section title="10. Contact">
        <Body>
          If you have questions or concerns about this Privacy Policy, please contact us:
        </Body>
        <Body>
          Email: <ContactEmail />
        </Body>
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fc',
  },
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 20,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 18,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 10,
  },
  body: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
    marginBottom: 10,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingLeft: 4,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#2563eb',
    marginTop: 8,
    marginRight: 10,
    flexShrink: 0,
  },
  bulletText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
    flex: 1,
  },
});
