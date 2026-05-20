import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SettingsScreen } from './SettingsScreen';
import { ProfileScreen } from './ProfileScreen';
import { DeleteAccountScreen } from './DeleteAccountScreen';
import { PrivacyPolicyScreen } from './PrivacyPolicyScreen';
import { TermsOfUseScreen } from './TermsOfUseScreen';
import { SupportScreen } from './SupportScreen';
import { NotificationSettingsScreen } from './NotificationSettingsScreen';
import { OnboardingSettingsWrapper } from './OnboardingSettingsWrapper';

const Stack = createNativeStackNavigator();

const sharedHeaderOptions = {
  statusBarTranslucent: true,
  statusBarColor: 'transparent' as const,
  statusBarStyle: 'light' as const,
  headerStyle: { backgroundColor: '#2563eb' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '600' as const },
};

const lightHeaderOptions = {
  statusBarStyle: 'dark' as const,
  headerStyle: { backgroundColor: '#ffffff' },
  headerTintColor: '#0f172a',
  headerTitleStyle: { fontWeight: '600' as const, color: '#0f172a' },
};

export function SettingsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={sharedHeaderOptions}>
      <Stack.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'My Profile', ...lightHeaderOptions }}
      />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{ title: 'Daily Reminders', ...sharedHeaderOptions }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{ title: 'Privacy Policy', ...sharedHeaderOptions }}
      />
      <Stack.Screen
        name="TermsOfUse"
        component={TermsOfUseScreen}
        options={{ title: 'Terms of Use', ...sharedHeaderOptions }}
      />
      <Stack.Screen
        name="Support"
        component={SupportScreen}
        options={{ title: 'Support & Contact', ...sharedHeaderOptions }}
      />
      <Stack.Screen
        name="GettingStarted"
        component={OnboardingSettingsWrapper}
        options={{ title: 'Getting Started', headerShown: false }}
      />
      <Stack.Screen
        name="DeleteAccount"
        component={DeleteAccountScreen}
        options={{ title: 'Delete Account', ...lightHeaderOptions }}
      />
    </Stack.Navigator>
  );
}
