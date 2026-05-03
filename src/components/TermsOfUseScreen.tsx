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

export function TermsOfUseScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Terms of Use</Text>
      <Text style={styles.meta}>Last updated: {LAST_UPDATED}</Text>

      <Body>
        Please read these Terms of Use carefully before using Beluga Fit. By creating an account or using the app, you agree to be bound by these terms.
      </Body>

      <Section title="1. Acceptance of Terms">
        <Body>
          By downloading, installing, or using Beluga Fit, you agree to these Terms of Use and our Privacy Policy. If you do not agree, do not use the app.
        </Body>
      </Section>

      <Section title="2. Description of Service">
        <Body>
          Beluga Fit is a fitness tracking application that allows you to:
        </Body>
        <Bullet>Create and manage a personal account</Bullet>
        <Bullet>Browse and follow pre-built workout plans</Bullet>
        <Bullet>Log and review your workout history</Bullet>
        <Bullet>Track body measurements over time</Bullet>
        <Bullet>Monitor your fitness progress</Bullet>
        <Body>
          The app is intended for personal, non-commercial use only.
        </Body>
      </Section>

      <Section title="3. Account Responsibilities">
        <Body>
          You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to:
        </Body>
        <Bullet>Provide accurate information when creating your account</Bullet>
        <Bullet>Keep your password secure and not share it with others</Bullet>
        <Bullet>Notify us immediately if you suspect unauthorized access to your account</Bullet>
        <Bullet>Not create accounts on behalf of others without their consent</Bullet>
        <Body>
          We reserve the right to suspend or terminate accounts that violate these terms.
        </Body>
      </Section>

      <Section title="4. Health and Fitness Disclaimer">
        <Body>
          Beluga Fit provides workout plans and fitness tracking tools for informational and personal use only. The content within the app does not constitute medical advice, diagnosis, or treatment.
        </Body>
        <Body>
          Before beginning any exercise program, consult with a qualified healthcare professional, especially if you have any pre-existing medical conditions, injuries, or health concerns. You use Beluga Fit at your own risk.
        </Body>
        <Body>
          [PLACEHOLDER — review this disclaimer with a legal professional before publishing if required in your jurisdiction.]
        </Body>
      </Section>

      <Section title="5. Acceptable Use">
        <Body>
          You agree not to:
        </Body>
        <Bullet>Use the app for any unlawful purpose</Bullet>
        <Bullet>Attempt to access other users' accounts or data</Bullet>
        <Bullet>Reverse engineer, decompile, or modify the app</Bullet>
        <Bullet>Transmit any harmful, offensive, or disruptive content through the app</Bullet>
        <Bullet>Use the app in any way that could damage, disable, or impair our servers or services</Bullet>
      </Section>

      <Section title="6. Data and Content">
        <Body>
          You own the fitness data and content you enter into Beluga Fit, including workout logs, body measurements, and profile information. By using the app, you grant us a limited license to store and process this data solely for the purpose of providing the service to you.
        </Body>
        <Body>
          You may delete your account and all associated data at any time through the app.
        </Body>
      </Section>

      <Section title="7. Availability and Changes">
        <Body>
          We strive to keep Beluga Fit available and up to date, but we do not guarantee uninterrupted access. We reserve the right to modify, suspend, or discontinue the app or any of its features at any time, with or without notice.
        </Body>
        <Body>
          We may update these Terms of Use from time to time. Continued use of the app after changes are posted constitutes your acceptance of the revised terms.
        </Body>
      </Section>

      <Section title="8. Limitation of Liability">
        <Body>
          To the maximum extent permitted by applicable law, Beluga Fit and its developers are not liable for any indirect, incidental, special, or consequential damages arising from your use of the app, including but not limited to personal injury, data loss, or loss of fitness progress data.
        </Body>
        <Body>
          [PLACEHOLDER — review with a legal professional before publishing.]
        </Body>
      </Section>

      <Section title="9. Governing Law">
        <Body>
          [PLACEHOLDER — specify the governing jurisdiction and applicable law before publishing, e.g., "These terms are governed by the laws of the Province of [X], Canada."]
        </Body>
      </Section>

      <Section title="10. Contact">
        <Body>
          If you have questions about these Terms of Use, please contact us:
        </Body>
        <Body>
          Email: developer@tranbtc.com{'\n'}
          [PLACEHOLDER — add mailing address if required before publishing.]
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
