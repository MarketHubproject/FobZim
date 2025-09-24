import React from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableWithoutFeedback,
  Pressable,
  ViewStyle
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/tokens';

interface AnimatedButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  disabled?: boolean;
  hapticFeedback?: boolean;
  scaleIntensity?: number;
}

// Enhanced animated button with haptic feedback
export function AnimatedButton({
  onPress,
  children,
  style,
  disabled = false,
  hapticFeedback = true,
  scaleIntensity = 0.95
}: AnimatedButtonProps) {
  const handlePress = () => {
    if (disabled) return;
    
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={[style, { opacity: disabled ? 0.6 : 1 }]}
    >
      <View>
        {children}
      </View>
    </Pressable>
  );
}

interface PulseButtonProps {
  onPress: () => void;
  icon: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
  pulseDelay?: number;
}

// Floating action button with haptic feedback
export function PulseButton({
  onPress,
  icon,
  size = 24,
  color = colors.surface,
  backgroundColor = colors.primary,
  style,
  pulseDelay = 2000
}: PulseButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onPress();
  };

  return (
    <Pressable onPress={handlePress}>
      <View style={[styles.pulseButton, { backgroundColor }, style]}>
        <MaterialCommunityIcons name={icon as any} size={size} color={color} />
      </View>
    </Pressable>
  );
}

interface RippleButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  rippleColor?: string;
  style?: ViewStyle;
}

// Button with haptic feedback
export function RippleButton({
  onPress,
  children,
  rippleColor = colors.primary + '30',
  style
}: RippleButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={[styles.rippleContainer, style]}>
        {children}
      </View>
    </TouchableWithoutFeedback>
  );
}

interface BouncyIconProps {
  name: string;
  size?: number;
  color?: string;
  bounceOnMount?: boolean;
  bounceIntensity?: number;
  style?: ViewStyle;
}

// Icon with tap feedback
export function BouncyIcon({
  name,
  size = 24,
  color = colors.textPrimary,
  bounceOnMount = true,
  bounceIntensity = 1.3,
  style
}: BouncyIconProps) {
  const bounce = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <TouchableWithoutFeedback onPress={bounce}>
      <View style={[style]}>
        <MaterialCommunityIcons name={name as any} size={size} color={color} />
      </View>
    </TouchableWithoutFeedback>
  );
}

interface ShimmerViewProps {
  children: React.ReactNode;
  duration?: number;
  direction?: 'horizontal' | 'vertical';
  style?: ViewStyle;
}

// Simple loading view
export function ShimmerView({
  children,
  duration = 1500,
  direction = 'horizontal',
  style
}: ShimmerViewProps) {
  return (
    <View style={[styles.shimmerContainer, style]}>
      {children}
    </View>
  );
}

interface HeartLikeAnimationProps {
  onPress: () => void;
  isLiked: boolean;
  size?: number;
  likedColor?: string;
  unlikedColor?: string;
  style?: ViewStyle;
}

// Heart like functionality with haptic feedback
export function HeartLikeAnimation({
  onPress,
  isLiked,
  size = 24,
  likedColor = '#ff6b6b',
  unlikedColor = colors.textSecondary,
  style
}: HeartLikeAnimationProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onPress();
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={[style]}>
        <MaterialCommunityIcons
          name={isLiked ? 'heart' : 'heart-outline'}
          size={size}
          color={isLiked ? likedColor : unlikedColor}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  pulseButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  rippleContainer: {
    overflow: 'hidden',
    borderRadius: radius.md,
  },
  ripple: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    top: '50%',
    left: '50%',
    marginTop: -25,
    marginLeft: -25,
  },
  shimmerContainer: {
    overflow: 'hidden',
  },
});

export default {
  AnimatedButton,
  PulseButton,
  RippleButton,
  BouncyIcon,
  ShimmerView,
  HeartLikeAnimation,
};