import LottieView from 'lottie-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet } from 'react-native';

import { getColorScheme } from '@/constants/theme';

// Animation frame constants (total 182 frames at 30fps)
const OPENING_START = 0;
const OPENING_END = 78;
const LOOP_START = 79;
const LOOP_END = 148;

interface LoadingScreenProps {
  onLoadingComplete: () => void;
  isDataReady: boolean;
}

export function LoadingScreen({ onLoadingComplete, isDataReady }: LoadingScreenProps) {
  const lottieRef = useRef<LottieView>(null);
  const [animationPhase, setAnimationPhase] = useState<'opening' | 'loop' | 'complete'>('opening');
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const colorScheme = getColorScheme('ocean');

  const isWeb = Platform.OS === 'web';
  const hasWebLoaded = useRef(false);
  const pendingWebPhase = useRef<'opening' | 'loop' | null>(null);

  // Track if opening animation has finished
  const [openingFinished, setOpeningFinished] = useState(false);

  const playSegment = useCallback((start: number, end: number) => {
    if (!lottieRef.current) return;

    if (isWeb) {
      // Web needs segment + explicit start frame to actually begin playback.
      lottieRef.current.play(start, end);
      lottieRef.current.play(start);
    } else {
      lottieRef.current.play(start, end);
    }
  }, [isWeb]);

  // Start the opening animation
  useEffect(() => {
    if (isWeb) {
      if (hasWebLoaded.current) {
        playSegment(OPENING_START, OPENING_END);
      } else {
        pendingWebPhase.current = 'opening';
      }
      return;
    }

    const timer = setTimeout(() => {
      playSegment(OPENING_START, OPENING_END);
    }, 100);
    return () => clearTimeout(timer);
  }, [isWeb, playSegment]);

  // Handle native animation finish
  const handleAnimationFinish = () => {
    if (animationPhase === 'opening') {
      setOpeningFinished(true);
      if (isDataReady) {
        startTransition();
      } else {
        setAnimationPhase('loop');
      }
    } else if (animationPhase === 'loop') {
      setTimeout(() => {
        playSegment(LOOP_START, LOOP_END);
      }, 50);
    }
  };

  // Play loop animation when phase changes to loop
  useEffect(() => {
    if (animationPhase !== 'loop') return;

    if (isWeb && !hasWebLoaded.current) {
      pendingWebPhase.current = 'loop';
      return;
    }

    const timer = setTimeout(() => {
      playSegment(LOOP_START, LOOP_END);
    }, 50);
    return () => clearTimeout(timer);
  }, [animationPhase, isWeb, playSegment]);

  // When data becomes ready and opening animation is finished, start transition
  useEffect(() => {
    if (isDataReady && openingFinished && animationPhase === 'loop') {
      startTransition();
    }
  }, [isDataReady, openingFinished, animationPhase]);

  const startTransition = () => {
    setAnimationPhase('complete');

    // Calculate target position (top of screen with some padding)
    const screenHeight = 800; // Approximate, will be responsive
    const logoHeight = 150; // Current logo size
    const targetLogoHeight = 60; // Header logo size
    const targetY = -screenHeight / 2 + targetLogoHeight + 40; // Move to top with padding

    // Animate logo shrinking and moving up
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: targetLogoHeight / logoHeight,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: targetY,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Notify parent that loading is complete
      onLoadingComplete();
    });
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, backgroundColor: colorScheme.backgroundPrimary }]}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [
              { scale: scaleAnim },
              { translateY: translateYAnim },
            ],
          },
        ]}
      >
        <LottieView
          ref={lottieRef}
          source={require('@/assets/lottie/anim_full_intersections.json')}
          style={styles.lottie}
          webStyle={styles.lottie}
          autoPlay={false}
          loop={false}
          onAnimationFinish={handleAnimationFinish}
          onAnimationLoaded={() => {
            if (!isWeb) return;
            hasWebLoaded.current = true;
            const phaseToPlay = pendingWebPhase.current ?? animationPhase;
            pendingWebPhase.current = null;
            if (phaseToPlay === 'opening') {
              playSegment(OPENING_START, OPENING_END);
            } else if (phaseToPlay === 'loop') {
              playSegment(LOOP_START, LOOP_END);
            }
          }}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: 300,
    height: 300,
  },
});
