import React from 'react';
import { View, Text, ScrollView, StyleSheet, useColorScheme, TouchableOpacity, Linking } from 'react-native';

export default function LegalScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const openPrivacyPolicy = () => {
    Linking.openURL('https://belugafit.tranbtc.com/privacy');
  };

  const openTermsOfService = () => {
    Linking.openURL('https://belugafit.tranbtc.com/terms-of-service');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1f2937' : '#f9fafb',
    },
    contentContainer: {
      padding: 20,
    },
    mainTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: isDark ? '#f9fafb' : '#111827',
      marginBottom: 16,
      lineHeight: 36,
    },
    introText: {
      fontSize: 16,
      color: isDark ? '#d1d5db' : '#4b5563',
      lineHeight: 24,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: isDark ? '#f3f4f6' : '#1f2937',
      marginTop: 24,
      marginBottom: 12,
      lineHeight: 28,
    },
    bodyText: {
      fontSize: 16,
      color: isDark ? '#d1d5db' : '#4b5563',
      lineHeight: 24,
      marginBottom: 12,
    },
    arrow: {
      fontSize: 16,
      color: isDark ? '#9ca3af' : '#6b7280',
      marginLeft: 4,
    },
    bulletList: {
      marginLeft: 8,
      marginBottom: 12,
    },
    bulletItem: {
      fontSize: 16,
      color: isDark ? '#d1d5db' : '#4b5563',
      lineHeight: 24,
      marginBottom: 8,
    },
    contactEmail: {
      fontSize: 16,
      color: isDark ? '#60a5fa' : '#3b82f6',
      lineHeight: 24,
      marginTop: 8,
      fontWeight: '500',
    },
    linkButton: {
      backgroundColor: isDark ? '#374151' : '#ffffff',
      padding: 16,
      borderRadius: 8,
      marginTop: 12,
      borderWidth: 1,
      borderColor: isDark ? '#4b5563' : '#e5e7eb',
    },
    linkButtonText: {
      fontSize: 16,
      color: isDark ? '#60a5fa' : '#3b82f6',
      fontWeight: '500',
      textAlign: 'center',
    },
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.mainTitle}>Legal Information</Text>

      <Text style={styles.introText}>
        Welcome to Beluga Fit. This page provides quick access to our key legal documents and explains how we protect your data and your rights as a user.
      </Text>

      <Text style={styles.sectionTitle}>Privacy Policy</Text>
      <Text style={styles.bodyText}>
        We explain what information we collect, how we use it, and your rights under Canadian and U.S. privacy laws.
      </Text>
      <TouchableOpacity style={styles.linkButton} onPress={openPrivacyPolicy}>
        <Text style={styles.linkButtonText}>View Privacy Policy</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Terms of Service</Text>
      <Text style={styles.bodyText}>
        These terms describe how you may use Beluga Fit, your responsibilities, and important disclaimers.
      </Text>
      <TouchableOpacity style={styles.linkButton} onPress={openTermsOfService}>
        <Text style={styles.linkButtonText}>View Terms of Service</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Your Privacy Rights</Text>
      <Text style={styles.bodyText}>
        Depending on where you live, you may have rights such as:
      </Text>
      <View style={styles.bulletList}>
        <Text style={styles.bulletItem}>- Accessing your personal data</Text>
        <Text style={styles.bulletItem}>- Requesting corrections</Text>
        <Text style={styles.bulletItem}>- Requesting deletion</Text>
        <Text style={styles.bulletItem}>- Withdrawing consent</Text>
        <Text style={styles.bulletItem}>- Requesting information about how your data is used</Text>
      </View>
      <Text style={styles.bodyText}>
        To exercise any of these rights, contact us at:
      </Text>
      <Text style={styles.bodyText}>[your email here]</Text>

      <Text style={styles.sectionTitle}>Data Security</Text>
      <Text style={styles.bodyText}>
        We use industry-standard security measures, including encrypted communication and secure authentication, to protect your information.
      </Text>

      <Text style={styles.sectionTitle}>Contact</Text>
      <Text style={styles.bodyText}>
        If you have questions about your privacy or these terms, reach out anytime:
      </Text>
      <Text style={styles.contactEmail}>developer@tranbtc.com</Text>
    </ScrollView>
  );
}
