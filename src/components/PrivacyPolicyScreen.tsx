import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const LAST_UPDATED = 'January 1, 2025';

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

function Body({ children }: { children: string }) {
  return <Text style={styles.body}>{children}</Text>;
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
      <Text style={styles.meta}>Last updated: {LAST_UPDATED}</Text>

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
          We do not collect payment information, location data, contacts, or any information unrelated to your fitness activity.
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
          We do not sell your personal information to third parties. We do not use your data for advertising or marketing purposes.
        </Body>
      </Section>

      <Section title="3. Data Storage and Security">
        <Body>
          Your data is stored securely using Supabase, a cloud database provider that uses industry-standard encryption for data in transit and at rest. Access to your data is protected by authenticated sessions and row-level security policies that ensure only you can access your records.
        </Body>
        <Body>
          [PLACEHOLDER — add any additional hosting or infrastructure details here before publishing.]
        </Body>
      </Section>

      <Section title="4. Data Retention and Deletion">
        <Body>
          Your data is retained for as long as your account is active. You may delete your account and all associated data at any time directly within the app by navigating to Settings → Delete Account. Deletion is permanent and cannot be reversed.
        </Body>
        <Body>
          Data deleted through the app is removed from our database immediately. Backup retention periods may apply. [PLACEHOLDER — confirm backup policy before publishing.]
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
        <Bullet>Expo / React Native — app framework and build infrastructure</Bullet>
        <Body>
          [PLACEHOLDER — add any additional third-party services used before publishing.]
        </Body>
      </Section>

      <Section title="7. Children's Privacy">
        <Body>
          Beluga Fit is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us so we can remove it.
        </Body>
      </Section>

      <Section title="8. Changes to This Policy">
        <Body>
          We may update this Privacy Policy from time to time. When we do, we will update the date at the top of this page. Continued use of the app after changes constitutes acceptance of the revised policy.
        </Body>
      </Section>

      <Section title="9. Contact">
        <Body>
          If you have questions or concerns about this Privacy Policy, please contact us:
        </Body>
        <Body>
          Email: developer@tranbtc.com{'\n'}
          [PLACEHOLDER — add mailing address if required by applicable law before publishing.]
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
