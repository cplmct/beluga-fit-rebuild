import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Slide = {
  key: string;
  title: string;
  subtitle?: string;
  bullets?: string[];
  showLogo?: boolean;
};

const SLIDES: Slide[] = [
  {
    key: 'welcome',
    title: 'Welcome to Beluga Fit',
    subtitle: 'Structured training plans designed to help you reach your goals.',
    showLogo: true,
  },
  {
    key: 'how',
    title: 'How it works',
    bullets: [
      'Choose a plan based on your goals',
      'Track your workouts and body progress',
      'Stay on track with daily reminders',
    ],
  },
  {
    key: 'journey',
    title: 'Start your journey',
    bullets: [
      'Pick your first training plan to get started',
      'Plans for weight loss, muscle gain, strength, and more',
      'All plans are structured and progress week by week',
    ],
  },
  {
    key: 'ready',
    title: "You're all set",
    subtitle: "Let's find a plan that fits your goals.",
  },
];

type Props = {
  onComplete: (goToPlans?: boolean) => void;
  fromSettings?: boolean;
};

export function OnboardingScreen({ onComplete, fromSettings = false }: Props) {
  const listRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const goToSlide = useCallback((index: number) => {
    listRef.current?.scrollToIndex({ index, animated: true });
    setActiveIndex(index);
  }, []);

  const handleContinue = useCallback(() => {
    if (activeIndex < SLIDES.length - 1) {
      goToSlide(activeIndex + 1);
    }
  }, [activeIndex, goToSlide]);

  const handleSkip = useCallback(() => {
    onComplete(false);
  }, [onComplete]);

  const handleFindPlan = useCallback(() => {
    onComplete(true);
  }, [onComplete]);

  const handleDone = useCallback(() => {
    onComplete(false);
  }, [onComplete]);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<{ index?: number }> }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const isLastSlide = activeIndex === SLIDES.length - 1;

  const renderSlide = ({ item, index }: { item: Slide; index: number }) => (
    <View style={styles.slide}>
      {item.showLogo && (
        <View style={styles.logoWrap}>
          <View style={styles.logoMark}>
            <Text style={styles.logoLetter}>B</Text>
          </View>
          <Text style={styles.brandName}>Beluga Fit</Text>
        </View>
      )}

      {index === SLIDES.length - 1 && (
        <View style={styles.readyBadge}>
          <Text style={styles.readyBadgeText}>Ready</Text>
        </View>
      )}

      <Text style={styles.slideTitle}>{item.title}</Text>

      {item.subtitle ? (
        <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
      ) : null}

      {item.bullets ? (
        <View style={styles.bulletList}>
          {item.bullets.map((b, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>{b}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f8fc" />

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>

        {!isLastSlide && !fromSettings ? (
          <TouchableOpacity onPress={handleSkip} activeOpacity={0.65} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.skipPlaceholder} />
        )}
      </View>

      {/* ── Slides ── */}
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        style={styles.list}
      />

      {/* ── Bottom actions ── */}
      <View style={styles.bottomBar}>
        <Text style={styles.progressLabel}>
          {activeIndex + 1} of {SLIDES.length}
        </Text>

        {fromSettings ? (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={isLastSlide ? handleDone : handleContinue}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryButtonText}>
              {isLastSlide ? 'Done' : 'Continue'}
            </Text>
          </TouchableOpacity>
        ) : isLastSlide ? (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleFindPlan}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryButtonText}>Find a Plan</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleContinue}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f7f8fc',
  },

  // ── Top bar ──
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 16 : 12,
    paddingBottom: 8,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e2e8f0',
  },
  dotActive: {
    backgroundColor: '#2563eb',
    width: 24,
  },
  skipText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  skipPlaceholder: {
    width: 36,
  },

  // ── List ──
  list: {
    flex: 1,
  },

  // ── Slide ──
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 24,
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoMark: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  logoLetter: {
    fontSize: 34,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  brandName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  readyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 20,
  },
  readyBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563eb',
    letterSpacing: 0.2,
  },
  slideTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.7,
    lineHeight: 36,
    marginBottom: 16,
  },
  slideSubtitle: {
    fontSize: 17,
    color: '#475569',
    lineHeight: 26,
    fontWeight: '400',
  },

  // ── Bullets ──
  bulletList: {
    marginTop: 8,
    gap: 18,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  bulletDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563eb',
    marginTop: 6,
    flexShrink: 0,
  },
  bulletText: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
    flex: 1,
    fontWeight: '400',
  },

  // ── Bottom bar ──
  bottomBar: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'android' ? 24 : 16,
    gap: 14,
  },
  progressLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
