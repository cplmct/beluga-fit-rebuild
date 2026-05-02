import React, { useCallback } from 'react';
import { TouchableOpacity, StyleSheet, Text, View, Alert } from 'react-native';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { parseVoiceCommand, getCommandDescription, VoiceCommand } from '../utils/voiceCommandParser';

interface VoiceButtonProps {
  onCommand: (command: VoiceCommand) => void;
  style?: any;
  size?: 'small' | 'medium' | 'large';
  position?: 'inline' | 'floating';
}

export function VoiceButton({
  onCommand,
  style,
  size = 'medium',
  position = 'inline',
}: VoiceButtonProps) {

  const handleTranscript = useCallback((transcript: string) => {
    const command = parseVoiceCommand(transcript);
    const description = getCommandDescription(command);

    if (command.type === 'UNKNOWN') {
      Alert.alert('Command Not Recognized', description);
    } else {
      onCommand(command);
    }
  }, [onCommand]);

  const { isListening, isSupported, error, startListening } = useVoiceRecognition(handleTranscript);

  if (!isSupported) {
    return null;
  }

  const buttonSize = size === 'small' ? 40 : size === 'large' ? 64 : 52;
  const iconSize = size === 'small' ? 18 : size === 'large' ? 28 : 22;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        position === 'floating' && styles.floatingButton,
        { width: buttonSize, height: buttonSize },
        isListening && styles.buttonListening,
        style,
      ]}
      onPress={startListening}
      disabled={isListening}
    >
      {isListening ? (
        <View style={styles.pulseContainer}>
          <View style={[styles.pulse, { width: buttonSize * 0.8, height: buttonSize * 0.8 }]} />
          <Text style={[styles.icon, { fontSize: iconSize }]}>🎤</Text>
        </View>
      ) : (
        <Text style={[styles.icon, { fontSize: iconSize }]}>🎤</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonListening: {
    backgroundColor: '#ef4444',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 999,
  },
  pulseContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulse: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: '#ef4444',
    opacity: 0.4,
  },
  icon: {
    color: '#fff',
  },
});