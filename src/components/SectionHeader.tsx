import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';

import { colors } from '../theme/colors';
import { spacing } from '../theme/tokens';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  onActionPress?: () => void;
  style?: any;
}

export default function SectionHeader({ 
  title, 
  subtitle, 
  actionText, 
  onActionPress, 
  style 
}: SectionHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.textContainer}>
        <Text variant="titleLarge" style={styles.title}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="bodyMedium" style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
      </View>
      
      {actionText && onActionPress && (
        <Button 
          mode="text" 
          onPress={onActionPress}
          textColor={colors.primary}
          style={styles.actionButton}
          labelStyle={styles.actionLabel}
        >
          {actionText}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.xs / 2,
  },
  subtitle: {
    color: colors.textSecondary,
  },
  actionButton: {
    marginRight: -spacing.sm,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});