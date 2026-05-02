import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export function RestTimerScreen() {
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [initialTime, setInitialTime] = useState(60);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            triggerVibration();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const triggerVibration = () => {
    if (Platform.OS !== 'web' && Haptics) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleStart = () => {
    if (timeLeft > 0) {
      setIsRunning(true);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(initialTime);
  };

  const setPresetTime = (seconds: number) => {
    setIsRunning(false);
    setTimeLeft(seconds);
    setInitialTime(seconds);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = timeLeft / initialTime;

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <View style={[styles.progressCircle, { opacity: 0.2 }]} />
        <View
          style={[
            styles.progressCircle,
            styles.progressFill,
            { transform: [{ scale: progress }] },
          ]}
        />
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
      </View>

      <View style={styles.controlsContainer}>
        {!isRunning ? (
          <TouchableOpacity style={[styles.button, styles.startButton]} onPress={handleStart}>
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.button, styles.pauseButton]} onPress={handlePause}>
            <Text style={styles.buttonText}>Pause</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={handleReset}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.presetsContainer}>
        <Text style={styles.presetsTitle}>Quick Set</Text>
        <View style={styles.presetsRow}>
          <TouchableOpacity
            style={[styles.presetButton, initialTime === 30 && styles.presetButtonActive]}
            onPress={() => setPresetTime(30)}
          >
            <Text
              style={[
                styles.presetButtonText,
                initialTime === 30 && styles.presetButtonTextActive,
              ]}
            >
              30s
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.presetButton, initialTime === 60 && styles.presetButtonActive]}
            onPress={() => setPresetTime(60)}
          >
            <Text
              style={[
                styles.presetButtonText,
                initialTime === 60 && styles.presetButtonTextActive,
              ]}
            >
              60s
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.presetButton, initialTime === 90 && styles.presetButtonActive]}
            onPress={() => setPresetTime(90)}
          >
            <Text
              style={[
                styles.presetButtonText,
                initialTime === 90 && styles.presetButtonTextActive,
              ]}
            >
              90s
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  timerContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 40,
  },
  progressCircle: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#3b82f6',
  },
  progressFill: {
    opacity: 1,
  },
  timerText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#fff',
    zIndex: 1,
  },
  controlsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginVertical: 20,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#10b981',
  },
  pauseButton: {
    backgroundColor: '#f59e0b',
  },
  resetButton: {
    backgroundColor: '#6b7280',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  presetsContainer: {
    width: '100%',
    marginTop: 20,
  },
  presetsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  presetButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    minWidth: 80,
    alignItems: 'center',
  },
  presetButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  presetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  presetButtonTextActive: {
    color: '#fff',
  },
});
