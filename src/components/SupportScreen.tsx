import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import Constants from 'expo-constants';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

const SUPPORT_EMAIL = 'developer@tranbtc.com';

type FaqItem = {
  question: string;
  answer: string;
};

const FAQ: FaqItem[] = [
  {
    question: 'How do I log a workout?',
    answer:
      'Go to the Workout tab, select a workout plan or template, and tap Start Workout. You can log sets, reps, and notes for each exercise. Your session is saved automatically when you finish.',
  },
  {
    question: 'How do I track body measurements?',
    answer:
      'Open the Home tab and tap the Body Tracker section. You can add new measurements and view your history over time. All entries are saved to your account.',
  },
  {
    question: 'Can I create my own workout plan?',
    answer:
      'Yes. In the Workout tab you can browse pre-built plans organized by goal and difficulty. Select a plan and follow the structured sessions at your own pace.',
  },
  {
    question: 'How do I view my workout history?',
    answer:
      'Tap the History tab to see a log of all your past sessions. You can tap any session to review the details.',
  },
  {
    question: 'How do I update my profile information?',
    answer:
      'Go to Settings and edit your name, age, gender, height, or weight in the Personal Information section. Tap Save Profile when done.',
  },
  {
    question: 'How do I reset my password?',
    answer:
      'On the login screen, tap "Forgot password?" and enter your email address. You will receive a reset link by email. Check your spam folder if it does not arrive within a few minutes.',
  },
  {
    question: 'How do I delete my account?',
    answer:
      'Go to Settings → Delete Account. You will see a full list of what gets deleted before you confirm. Deletion is immediate and permanent.',
  },
  {
    question: 'Is my data backed up?',
    answer:
      'Yes. Your account data — including workout history, body measurements, and profile information — is stored securely in the cloud and accessible whenever you log in.',
  },
];

function FaqRow({ question, answer }: FaqItem) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <TouchableOpacity
      style={styles.faqRow}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.7}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <Text style={styles.faqChevron}>{expanded ? '−' : '+'}</Text>
      </View>
      {expanded ? <Text style={styles.faqAnswer}>{answer}</Text> : null}
    </TouchableOpacity>
  );
}

export function SupportScreen() {
  const handleEmail = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Beluga Fit Support`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Support & Contact</Text>

      <View style={styles.contactCard}>
        <Text style={styles.contactLabel}>Get in touch</Text>
        <Text style={styles.contactBody}>
          Have a question, found a bug, or want to share feedback? We read every message and typically reply within 1–2 business days.
        </Text>
        <TouchableOpacity style={styles.emailButton} onPress={handleEmail} activeOpacity={0.8}>
          <Text style={styles.emailButtonText}>Email Us</Text>
        </TouchableOpacity>
        <Text style={styles.emailAddress}>{SUPPORT_EMAIL}</Text>
      </View>

      <Text style={styles.faqTitle}>Frequently Asked Questions</Text>

      <View style={styles.faqCard}>
        {FAQ.map((item, index) => (
          <View key={index}>
            <FaqRow question={item.question} answer={item.answer} />
            {index < FAQ.length - 1 ? <View style={styles.divider} /> : null}
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Beluga Fit — Version {APP_VERSION}</Text>
      </View>
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
    marginBottom: 20,
  },
  contactCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  contactLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  contactBody: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 18,
  },
  emailButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 32,
    marginBottom: 12,
  },
  emailButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  emailAddress: {
    fontSize: 13,
    color: '#94a3b8',
  },
  faqTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  faqCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    marginBottom: 24,
  },
  faqRow: {
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    flex: 1,
    paddingRight: 12,
    lineHeight: 21,
  },
  faqChevron: {
    fontSize: 18,
    color: '#2563eb',
    fontWeight: '400',
    lineHeight: 22,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
    marginTop: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 18,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
  },
});
