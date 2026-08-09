import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';

// ── Coaching tips (30 total) ──────────────────────────────────────────────────
const TIPS: string[] = [
  // Nutrition (8)
  'Protein within 30 minutes of your workout helps muscle recovery.',
  'Staying hydrated improves performance by up to 25%.',
  'Aim for 0.7–1g of protein per pound of bodyweight daily.',
  'Eating complex carbs before training gives sustained energy.',
  'A handful of nuts is a perfect pre-workout snack.',
  'Sleep is when your muscles actually grow — prioritize 7–9 hours.',
  'Creatine is one of the most researched and effective supplements.',
  'Meal prepping on Sundays makes healthy eating effortless all week.',
  // Training technique (8)
  'Focus on form first — weight second. Injury sets you back months.',
  'Progressive overload — adding a little more each week — is the key to gains.',
  'Compound movements like squats and deadlifts build the most muscle.',
  'Rest 60–90 seconds between sets for hypertrophy goals.',
  'Warming up for 5 minutes prevents injury and improves performance.',
  'Mind-muscle connection — really feel the muscle working — increases activation.',
  'Tempo training: slow the eccentric phase to maximize time under tension.',
  'Supersets save time and keep your heart rate elevated.',
  // Recovery (7)
  'Muscle soreness means you worked hard — soreness for days means you overdid it.',
  'Foam rolling before bed speeds up next-day recovery.',
  'Active recovery — light walking or yoga — beats total rest days.',
  'Ice baths reduce inflammation after intense training sessions.',
  'Magnesium before bed improves sleep quality and muscle recovery.',
  'Your muscles repair overnight — consistent sleep is non-negotiable.',
  'Stretching after a workout while muscles are warm prevents tightness.',
  // Motivation (7)
  'Every expert was once a beginner. Show up today.',
  "You don't have to be great to start, but you have to start to be great.",
  "The only bad workout is the one that didn't happen.",
  'Consistency over intensity — small daily actions beat occasional heroics.',
  'Your future self is watching. Make them proud.',
  'Discipline is choosing what you want most over what you want now.',
  'The gym is 20% physical and 80% mental. Train both.',
];

interface LaunchScreenProps {
  shouldFade: boolean;
  onDismissed: () => void;
}

export function LaunchScreen({ shouldFade, onDismissed }: LaunchScreenProps) {
  const opacity    = useRef(new Animated.Value(1)).current;
  const tipOpacity = useRef(new Animated.Value(0)).current;
  // Selected once on mount — stable across any re-renders
  const tip        = useRef(TIPS[Math.floor(Math.random() * TIPS.length)]).current;

  // Unchanged: fade out the whole screen (including tip) when shouldFade fires
  useEffect(() => {
    if (shouldFade) {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start(() => {
        onDismissed();
      });
    }
  }, [shouldFade]);

  // New: fade the tip in after 600ms over 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(tipOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[styles.container, { opacity }]}
      pointerEvents={shouldFade ? 'none' : 'box-only'}
    >
      <Image
        source={require('../../assets/splash.png')}
        style={styles.image}
        resizeMode="contain"
        fadeDuration={0}
      />
      <Animated.View style={[styles.tipContainer, { opacity: tipOpacity }]}>
        <View style={styles.divider} />
        <View style={styles.pill}>
          <Text style={styles.label}>TODAY'S TIP</Text>
          <Text style={styles.tipText} numberOfLines={2}>{tip}</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#091722',
    zIndex: 9999,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  tipContainer: {
    position: 'absolute',
    bottom: 60,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginBottom: 12,
  },
  pill: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  label: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
});
