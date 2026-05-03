import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { OnboardingScreen } from './OnboardingScreen';

export function OnboardingSettingsWrapper() {
  const navigation = useNavigation();

  return (
    <OnboardingScreen
      fromSettings
      onComplete={() => {
        navigation.goBack();
      }}
    />
  );
}
