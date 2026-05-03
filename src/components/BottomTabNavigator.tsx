import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeStackNavigator } from './HomeStackNavigator';
import { WorkoutStackNavigator } from './WorkoutStackNavigator';
import { CalendarStackNavigator } from './CalendarStackNavigator';
import { HistoryStackNavigator } from './HistoryStackNavigator';
import { SettingsStackNavigator } from './SettingsStackNavigator';

const Tab = createBottomTabNavigator();

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { active: IoniconsName; inactive: IoniconsName }> = {
  Home:     { active: 'home',      inactive: 'home-outline' },
  Workout:  { active: 'barbell',   inactive: 'barbell-outline' },
  Calendar: { active: 'calendar',  inactive: 'calendar-outline' },
  History:  { active: 'time',      inactive: 'time-outline' },
  Settings: { active: 'settings',  inactive: 'settings-outline' },
};

export function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e2e8f0',
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 2,
        },
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          const name = focused ? icons.active : icons.inactive;
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home"     component={HomeStackNavigator}     options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Workout"  component={WorkoutStackNavigator}  options={{ tabBarLabel: 'Workout' }} />
      <Tab.Screen name="Calendar" component={CalendarStackNavigator} options={{ tabBarLabel: 'Calendar' }} />
      <Tab.Screen name="History"  component={HistoryStackNavigator}  options={{ tabBarLabel: 'History' }} />
      <Tab.Screen name="Settings" component={SettingsStackNavigator} options={{ tabBarLabel: 'Settings' }} />
    </Tab.Navigator>
  );
}
