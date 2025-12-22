import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { getColorScheme } from '@/constants/theme';

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

  // Track if opening animation has finished
  const [openingFinished, setOpeningFinished] = useState(false);

  useEffect(() => {
    // Start the opening animation
    const timer = setTimeout(() => {
      if (lottieRef.current) {
        lottieRef.current.play(0, 78);
        setTimeout(() => {
          lottieRef.current?.play();
        }, 50);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleAnimationFinish = () => {
    if (animationPhase === 'opening') {
      setOpeningFinished(true);

      // If data is ready, start transition immediately
      // Otherwise, go to loop animation
      if (isDataReady) {
        startTransition();
      } else {
        setAnimationPhase('loop');
      }
    } else if (animationPhase === 'loop') {
      // Keep looping until data is ready
      setTimeout(() => {
        if (lottieRef.current) {
          lottieRef.current.play(79, 148);
          setTimeout(() => {
            lottieRef.current?.play();
          }, 50);
        }
      }, 50);
    }
  };

  // When data becomes ready and opening animation is finished, start transition
  useEffect(() => {
    if (isDataReady && openingFinished && animationPhase === 'loop') {
      startTransition();
    }
  }, [isDataReady, openingFinished, animationPhase]);

  // Play loop animation when phase changes to loop
  useEffect(() => {
    if (animationPhase === 'loop') {
      const timer = setTimeout(() => {
        if (lottieRef.current) {
          lottieRef.current.play(79, 148);
          setTimeout(() => {
            lottieRef.current?.play();
          }, 50);
        }
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [animationPhase]);

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
          autoPlay={false}
          loop={false}
          onAnimationFinish={handleAnimationFinish}
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
