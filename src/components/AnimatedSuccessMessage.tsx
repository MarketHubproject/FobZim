import React, { useRef, useEffect } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/tokens';
import { createSuccessAnimation, createFadeAnimation, ANIMATION_DURATION, EASING } from '../utils/animations';

interface AnimatedSuccessMessageProps {
  message: string;
  visible: boolean;
  onDismiss?: () => void;
  icon?: string;
}

export default function AnimatedSuccessMessage({
  message,
  visible,
  onDismiss,
  icon = 'check-circle'
}: AnimatedSuccessMessageProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const iconRotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset values
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      slideAnim.setValue(-50);

      // Enhanced entrance animation
      Animated.sequence([
        // Slide and fade in
        Animated.parallel([
          createFadeAnimation(fadeAnim, 1, ANIMATION_DURATION.NORMAL),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: ANIMATION_DURATION.NORMAL,
            easing: EASING.EASE_OUT,
            useNativeDriver: true,
          }),
        ]),
        // Bounce scale effect
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: ANIMATION_DURATION.FAST,
          easing: EASING.BOUNCE,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: ANIMATION_DURATION.FAST,
          easing: EASING.EASE_OUT,
          useNativeDriver: true,
        }),
        // Icon rotation and gentle bounce
        Animated.parallel([
          Animated.timing(iconRotateAnim, {
            toValue: 1,
            duration: ANIMATION_DURATION.SLOW,
            easing: EASING.EASE_OUT,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: ANIMATION_DURATION.NORMAL,
            easing: EASING.EASE_IN_OUT,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Auto-dismiss after 3 seconds
      const dismissTimer = setTimeout(() => {
        if (onDismiss) {
          // Exit animation
          Animated.parallel([
            createFadeAnimation(fadeAnim, 0, ANIMATION_DURATION.FAST),
            Animated.timing(slideAnim, {
              toValue: -50,
              duration: ANIMATION_DURATION.FAST,
              useNativeDriver: true,
            }),
          ]).start(() => {
            onDismiss();
          });
        }
      }, 3000);

      return () => clearTimeout(dismissTimer);
    }
  }, [visible, message, onDismiss]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <Card style={styles.card} elevation={8}>
        <Animated.View style={[
          styles.content,
          {
            transform: [{
              scale: bounceAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [1, 1.02, 1]
              })
            }]
          }
        ]}>
          <Animated.View style={{
            transform: [{
              rotate: iconRotateAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg']
              })
            }],
            marginRight: spacing.sm
          }}>
            <MaterialCommunityIcons
              name={icon}
              size={24}
              color={colors.success}
            />
          </Animated.View>
          <Text variant="bodyMedium" style={styles.message}>
            {message}
          </Text>
        </Animated.View>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: spacing.md,
    right: spacing.md,
    zIndex: 1000,
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
    shadowColor: colors.success,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingVertical: spacing.sm,
  },
  icon: {
    marginRight: spacing.sm,
  },
  message: {
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
});