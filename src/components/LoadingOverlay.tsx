import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';

import { colors } from '../theme/colors';
import { spacing } from '../theme/tokens';

interface LoadingOverlayProps {
  message?: string;
  visible?: boolean;
}

export default function LoadingOverlay({ 
  message = "Loading...", 
  visible = true 
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text variant="bodyLarge" style={styles.message}>
          {message}
        </Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          🇿🇼 FobZim
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 200,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  message: {
    color: colors.textPrimary,
    marginTop: spacing.md,
    textAlign: 'center',
    fontWeight: '500',
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});