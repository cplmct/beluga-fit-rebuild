import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SettingsScreen } from './SettingsScreen';
import { LegalScreen } from './LegalScreen';
import { DeleteAccountScreen } from './DeleteAccountScreen';
import { PrivacyPolicyScreen } from './PrivacyPolicyScreen';
import { TermsOfUseScreen } from './TermsOfUseScreen';
import { SupportScreen } from './SupportScreen';

const Stack = createNativeStackNavigator();

const sharedHeaderOptions = {
  headerStyle: { backgroundColor: '#2563eb' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '600' as const },
};

const lightHeaderOptions = {
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
        name="Legal"
        component={LegalScreen}
        options={{ title: 'Privacy & Legal' }}
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
        name="DeleteAccount"
        component={DeleteAccountScreen}
        options={{ title: 'Delete Account', ...lightHeaderOptions }}
      />
    </Stack.Navigator>
  );
}
