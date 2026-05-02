import { useState } from 'react';
import { Platform } from 'react-native';

export function useVoiceRecognition(onCommand: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSupported = Platform.OS !== 'web';

  const startListening = () => {
    if (!isSupported) {
      setError('Voice recognition is not supported on web platform');
      return;
    }

    setIsListening(true);
    setError(null);
  };

  const stopListening = () => {
    setIsListening(false);
  };

  return {
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
  };
}