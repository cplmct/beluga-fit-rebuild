import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet } from 'react-native';

interface LaunchScreenProps {
  shouldFade: boolean;
  onDismissed: () => void;
}

export function LaunchScreen({ shouldFade, onDismissed }: LaunchScreenProps) {
  const opacity = useRef(new Animated.Value(1)).current;

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

  return (
    <Animated.View
      style={[styles.container, { opacity }]}
      pointerEvents={shouldFade ? 'none' : 'box-only'}
    >
      <Image
        source={require('../../assets/splash.png')}
        style={styles.image}
        resizeMode="cover"
        fadeDuration={0}
      />
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
    width: '100%',
    height: '100%',
  },
});
