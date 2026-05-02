import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SettingsScreen } from './SettingsScreen';
import { LegalScreen } from './LegalScreen';

const Stack = createNativeStackNavigator();

export function SettingsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#3b82f6',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
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
    </Stack.Navigator>
  );
}
