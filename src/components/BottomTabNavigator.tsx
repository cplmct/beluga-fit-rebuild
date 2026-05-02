import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeStackNavigator } from './HomeStackNavigator';
import { WorkoutStackNavigator } from './WorkoutStackNavigator';
import { CalendarStackNavigator } from './CalendarStackNavigator';
import { HistoryStackNavigator } from './HistoryStackNavigator';
import { SettingsStackNavigator } from './SettingsStackNavigator';

const Tab = createBottomTabNavigator();

export function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#6b7280',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#3b82f6',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Workout"
        component={WorkoutStackNavigator}
        options={{
          tabBarLabel: 'Workout',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarStackNavigator}
        options={{
          tabBarLabel: 'Calendar',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryStackNavigator}
        options={{
          tabBarLabel: 'History',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{
          tabBarLabel: 'Settings',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}
