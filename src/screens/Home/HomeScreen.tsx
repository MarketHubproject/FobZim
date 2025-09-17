import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/tokens';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.greeting}>
          Welcome to ZimBuzz! 🇿🇼
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Connecting Zimbabwean creators and brands
        </Text>
        
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Coming Soon:
          </Text>
          <Text variant="bodyMedium" style={styles.feature}>
            • Trending Creators
          </Text>
          <Text variant="bodyMedium" style={styles.feature}>
            • Latest Content
          </Text>
          <Text variant="bodyMedium" style={styles.feature}>
            • Brand Campaigns
          </Text>
          <Text variant="bodyMedium" style={styles.feature}>
            • Creator Tips
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  greeting: {
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  section: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.primary,
    marginBottom: spacing.md,
  },
  feature: {
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
});