import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

interface RestTimerRouteParams {
  initialSeconds?: number;
  triggerKey?: string;
  nextExerciseName?: string;
  exerciseCompleted?: boolean;
  completedSetLabel?: string;
}

export function RestTimerScreen({ route, navigation }: any) {
  const params = route?.params as RestTimerRouteParams | undefined;
  const initialSeconds = params?.initialSeconds ?? 60;
  const triggerKey = params?.triggerKey;
  const nextExerciseName = params?.nextExerciseName;
  const exerciseCompleted = params?.exerciseCompleted ?? false;
  const completedSetLabel = params?.completedSetLabel;
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true); // auto-start when navigated from checklist
  const [isComplete, setIsComplete] = useState(false);
  const [initialTime, setInitialTime] = useState(initialSeconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // A completed set sends a unique trigger key. Reset the single workout-level
  // timer whenever a new key arrives instead of creating per-exercise timers.
  useEffect(() => {
    if (!triggerKey) return;
    const nextInitialTime = params?.initialSeconds ?? 60;
    setInitialTime(nextInitialTime);
    setTimeLeft(nextInitialTime);
    setIsComplete(false);
    setIsRunning(true);
  }, [triggerKey]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsComplete(true);
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
    setIsComplete(false);
    setTimeLeft(initialTime);
  };

  const setPresetTime = (seconds: number) => {
    setIsRunning(false);
    setIsComplete(false);
    setTimeLeft(seconds);
    setInitialTime(seconds);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = initialTime > 0 ? timeLeft / initialTime : 0;
  const completeMessage = exerciseCompleted
    ? nextExerciseName
      ? `Exercise complete — ready for ${nextExerciseName}?`
      : 'All exercises complete — ready to finish your workout?'
    : 'Rest complete — ready for your next set?';
  const continueLabel = exerciseCompleted && nextExerciseName
    ? 'Next Exercise'
    : 'Continue Workout';

  return (
    <View style={styles.container}>
      {!!completedSetLabel && (
        <Text style={styles.completedSetLabel}>{completedSetLabel} complete</Text>
      )}
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
        {isComplete ? (
          <View style={styles.completeBlock}>
            <Text style={styles.completeMessage}>
              {completeMessage}
            </Text>
            <TouchableOpacity
              style={[styles.button, styles.continueButton]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonText}>{continueLabel}</Text>
            </TouchableOpacity>
          </View>
        ) : !isRunning ? (
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
              30 sec
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
              60 sec
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
              90 sec
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.presetButton, initialTime === 120 && styles.presetButtonActive]}
            onPress={() => setPresetTime(120)}
          >
            <Text
              style={[
                styles.presetButtonText,
                initialTime === 120 && styles.presetButtonTextActive,
              ]}
            >
              2 min
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
  completedSetLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
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
    alignItems: 'center',
  },
  completeBlock: {
    alignItems: 'center',
    gap: 12,
  },
  completeMessage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
    textAlign: 'center',
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
  continueButton: {
    backgroundColor: '#10b981',
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
