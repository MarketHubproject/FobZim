import { Animated, Easing } from 'react-native';

// Animation timing constants
export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 800,
};

// Easing functions
export const EASING = {
  EASE_OUT: Easing.out(Easing.quad),
  EASE_IN: Easing.in(Easing.quad),
  EASE_IN_OUT: Easing.inOut(Easing.quad),
  BOUNCE: Easing.bounce,
  SPRING: Easing.elastic(1.3),
};

// Animation utility functions
export const createScaleAnimation = (
  animatedValue: Animated.Value,
  toValue: number,
  duration: number = ANIMATION_DURATION.FAST,
  easing: Easing.EasingFunction = EASING.EASE_OUT
) => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    easing,
    useNativeDriver: true,
  });
};

export const createFadeAnimation = (
  animatedValue: Animated.Value,
  toValue: number,
  duration: number = ANIMATION_DURATION.NORMAL,
  easing: Easing.EasingFunction = EASING.EASE_IN_OUT
) => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    easing,
    useNativeDriver: true,
  });
};

export const createSlideAnimation = (
  animatedValue: Animated.Value,
  toValue: number,
  duration: number = ANIMATION_DURATION.NORMAL,
  easing: Easing.EasingFunction = EASING.EASE_OUT
) => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    easing,
    useNativeDriver: true,
  });
};

// Button press animation
export const createButtonPressAnimation = (
  scaleValue: Animated.Value,
  onPress?: () => void
) => {
  const pressIn = () => {
    createScaleAnimation(scaleValue, 0.95, ANIMATION_DURATION.FAST).start();
  };

  const pressOut = () => {
    createScaleAnimation(scaleValue, 1, ANIMATION_DURATION.FAST).start(() => {
      if (onPress) onPress();
    });
  };

  return { pressIn, pressOut };
};

// Stagger animation for lists
export const createStaggerAnimation = (
  animatedValues: Animated.Value[],
  staggerDelay: number = 100
) => {
  return Animated.stagger(
    staggerDelay,
    animatedValues.map((value) =>
      createFadeAnimation(value, 1, ANIMATION_DURATION.NORMAL)
    )
  );
};

// Loading pulse animation
export const createPulseAnimation = (animatedValue: Animated.Value) => {
  return Animated.loop(
    Animated.sequence([
      createFadeAnimation(animatedValue, 0.3, ANIMATION_DURATION.SLOW),
      createFadeAnimation(animatedValue, 1, ANIMATION_DURATION.SLOW),
    ])
  );
};

// Success animation
export const createSuccessAnimation = (
  scaleValue: Animated.Value,
  fadeValue: Animated.Value
) => {
  return Animated.sequence([
    // Scale up
    createScaleAnimation(scaleValue, 1.1, ANIMATION_DURATION.FAST, EASING.BOUNCE),
    // Scale back to normal
    createScaleAnimation(scaleValue, 1, ANIMATION_DURATION.FAST),
    // Hold for a moment
    Animated.delay(1500),
    // Fade out
    createFadeAnimation(fadeValue, 0, ANIMATION_DURATION.NORMAL),
  ]);
};