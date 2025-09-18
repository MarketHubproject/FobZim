import React, { useRef, useEffect } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { createButtonPressAnimation, ANIMATION_DURATION } from '../utils/animations';

interface AnimatedButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  mode?: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal';
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: any;
  labelStyle?: any;
  contentStyle?: any;
  compact?: boolean;
  uppercase?: boolean;
}

export default function AnimatedButton({ 
  onPress, 
  children, 
  style,
  ...buttonProps 
}: AnimatedButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { pressIn, pressOut } = createButtonPressAnimation(scaleAnim, onPress);

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Button
        {...buttonProps}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={styles.button}
      >
        {children}
      </Button>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    // Add any additional button styling here
  },
});