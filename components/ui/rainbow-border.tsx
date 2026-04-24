import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle } from 'react-native';

const RAINBOW_COLORS = [
  '#ff0000', '#ff6600', '#ffcc00', '#00cc00', '#0066ff', '#9900cc', '#ff0000',
] as const;

interface RainbowBorderProps {
  children: React.ReactNode;
  borderRadius?: number;
  borderWidth?: number;
  innerBackground?: string;
  speed?: number;
  style?: ViewStyle;
}

export function RainbowBorder({
  children,
  borderRadius = 20,
  borderWidth = 2,
  innerBackground = '#1a1a2e',
  speed = 3000,
  style,
}: RainbowBorderProps) {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(rotation, {
      toValue: 1,
      duration: speed,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [rotation, speed]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[{ borderRadius, overflow: 'hidden', padding: borderWidth }, style]}>
      <Animated.View
        style={{
          position: 'absolute',
          top: -20,
          left: -20,
          right: -20,
          bottom: -20,
          transform: [{ rotate: spin }],
        }}
      >
        <LinearGradient
          colors={RAINBOW_COLORS}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
      <View style={{ flex: style?.flex ? 1 : undefined, borderRadius: borderRadius - borderWidth, backgroundColor: innerBackground, overflow: 'hidden' }}>
        {children}
      </View>
    </View>
  );
}
