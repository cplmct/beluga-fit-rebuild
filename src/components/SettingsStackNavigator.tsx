import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SettingsScreen } from './SettingsScreen';
import { LegalScreen } from './LegalScreen';
import { DeleteAccountScreen } from './DeleteAccountScreen';

const Stack = createNativeStackNavigator();

export function SettingsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2563eb',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="Legal"
        component={LegalScreen}
        options={{ title: 'Legal Information' }}
      />
      <Stack.Screen
        name="DeleteAccount"
        component={DeleteAccountScreen}
        options={{
          title: 'Delete Account',
          headerStyle: { backgroundColor: '#ffffff' },
          headerTintColor: '#0f172a',
          headerTitleStyle: { fontWeight: '600', color: '#0f172a' },
        }}
      />
    </Stack.Navigator>
  );
}
