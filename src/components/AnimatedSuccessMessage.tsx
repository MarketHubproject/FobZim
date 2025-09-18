import React, { useRef, useEffect } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/tokens';
import { createSuccessAnimation, createFadeAnimation, ANIMATION_DURATION } from '../utils/animations';

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

  useEffect(() => {
    if (visible) {
      // Reset values
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      slideAnim.setValue(-50);

      // Start entrance animation
      Animated.parallel([
        createFadeAnimation(fadeAnim, 1, ANIMATION_DURATION.FAST),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: ANIMATION_DURATION.NORMAL,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(100),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: ANIMATION_DURATION.NORMAL,
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
        <Animated.View style={styles.content}>
          <MaterialCommunityIcons
            name={icon}
            size={24}
            color={colors.success}
            style={styles.icon}
          />
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