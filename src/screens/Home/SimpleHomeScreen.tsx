import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, Animated } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/tokens';
import { useAppStore } from '../../store/simpleStore';

export default function SimpleHomeScreen() {
  const [successMessage, setSuccessMessage] = useState('');
  const { savedTips, saveTip, removeSavedTip } = useAppStore();
  
  // Animation for success message
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  // Rotate through different tips
  const tips = [
    "Build authentic connections with your audience by sharing your creative process behind the scenes!",
    "Consistency is key - post regularly to keep your audience engaged and coming back for more.",
    "Collaborate with other Zimbabwean creators to expand your reach and learn new techniques.",
    "Use trending hashtags relevant to Zimbabwe to increase your content's discoverability.",
    "Engage with your comments and messages - community building is essential for growth."
  ];
  
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const dailyTip = tips[currentTipIndex];
  const isTipSaved = savedTips.includes(dailyTip);
  
  // Animate success message when it appears
  useEffect(() => {
    if (successMessage) {
      // Reset animation values
      slideAnim.setValue(-100);
      opacityAnim.setValue(0);
      
      // Slide in animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Auto hide with slide out
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setSuccessMessage('');
        });
      }, 2500);
      
      return () => clearTimeout(timer);
    }
  }, [successMessage, slideAnim, opacityAnim]);
  
  const handleSaveTip = () => {
    if (isTipSaved) {
      removeSavedTip(dailyTip);
      setSuccessMessage('💡 Tip removed from saved!');
    } else {
      saveTip(dailyTip);
      setSuccessMessage('💡 Tip saved to your collection!');
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text variant="headlineMedium" style={styles.greeting}>
          Welcome to FobZim! 🇿🇼
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Discover Zimbabwe's rising content creators
        </Text>
      </View>

      {/* Simple Daily Tip */}
      <Card style={styles.tipCard} elevation={2}>
        <View style={styles.tipContent}>
          <View style={styles.tipHeader}>
            <MaterialCommunityIcons 
              name="lightbulb" 
              size={24} 
              color={colors.secondary} 
            />
            <Text variant="titleMedium" style={styles.tipTitle}>
              Creator Tip of the Day
            </Text>
          </View>
          <Text variant="bodyMedium" style={styles.tipText}>
            {dailyTip}
          </Text>
          <View style={styles.tipActions}>
            <Button
              mode={isTipSaved ? 'contained' : 'outlined'}
              style={styles.saveTipButton}
              icon={isTipSaved ? 'bookmark' : 'bookmark-outline'}
              onPress={handleSaveTip}
            >
              {isTipSaved ? 'Saved ✓' : 'Save Tip'}
            </Button>
          </View>
          <View style={styles.tipNavigation}>
            <Button
              mode="text"
              icon="chevron-left"
              onPress={() => setCurrentTipIndex(prev => prev === 0 ? tips.length - 1 : prev - 1)}
              style={styles.tipNavButton}
            >
              Previous
            </Button>
            <Text variant="bodySmall" style={styles.tipCounter}>
              {currentTipIndex + 1} of {tips.length}
            </Text>
            <Button
              mode="text"
              icon="chevron-right"
              contentStyle={{ flexDirection: 'row-reverse' }}
              onPress={() => setCurrentTipIndex(prev => prev === tips.length - 1 ? 0 : prev + 1)}
              style={styles.tipNavButton}
            >
              Next
            </Button>
          </View>
        </View>
      </Card>

      {/* Success Message */}
      {successMessage && (
        <Animated.View
          style={[
            styles.successMessageContainer,
            {
              transform: [{ translateY: slideAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <Card style={styles.successCard} elevation={4}>
            <View style={styles.successContent}>
              <MaterialCommunityIcons 
                name="check-circle" 
                size={20} 
                color={colors.success} 
              />
              <Text variant="bodyMedium" style={styles.successText}>
                {successMessage}
              </Text>
            </View>
          </Card>
        </Animated.View>
      )}

      {/* Quick Stats */}
      <View style={styles.statsSection}>
        <Text variant="titleLarge" style={styles.statsTitle}>
          Platform Overview
        </Text>
        
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <MaterialCommunityIcons name="account-star" size={32} color={colors.primary} />
              <Text variant="headlineSmall" style={styles.statNumber}>500+</Text>
              <Text variant="bodySmall" style={styles.statLabel}>Active Creators</Text>
            </View>
          </Card>
          
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <MaterialCommunityIcons name="trending-up" size={32} color={colors.secondary} />
              <Text variant="headlineSmall" style={styles.statNumber}>50+</Text>
              <Text variant="bodySmall" style={styles.statLabel}>Daily Trends</Text>
            </View>
          </Card>
          
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <MaterialCommunityIcons name="briefcase" size={32} color={colors.accent} />
              <Text variant="headlineSmall" style={styles.statNumber}>25</Text>
              <Text variant="bodySmall" style={styles.statLabel}>Brand Campaigns</Text>
            </View>
          </Card>
        </View>
      </View>

      {/* Call to Action */}
      <Card style={styles.ctaCard} elevation={2}>
        <View style={styles.ctaContent}>
          <Text variant="titleMedium" style={styles.ctaTitle}>
            Ready to explore? 🚀
          </Text>
          <Text variant="bodyMedium" style={styles.ctaText}>
            Browse creators, discover trends, and find collaboration opportunities
          </Text>
          <View style={styles.ctaButtons}>
            <Button
              mode="contained"
              style={styles.ctaButton}
              icon="account-search"
            >
              Explore Creators
            </Button>
            <Button
              mode="outlined"
              style={styles.ctaButton}
              icon="trending-up"
            >
              View Trends
            </Button>
          </View>
        </View>
      </Card>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  welcomeSection: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  greeting: {
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tipCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: radius.md,
  },
  tipContent: {
    padding: spacing.md,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tipTitle: {
    color: colors.textPrimary,
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
  tipText: {
    color: colors.textSecondary,
    lineHeight: 22,
  },
  tipActions: {
    marginTop: spacing.md,
    alignItems: 'flex-start',
  },
  saveTipButton: {
    borderColor: colors.primary,
  },
  statsSection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  statsTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
  },
  statContent: {
    padding: spacing.md,
    alignItems: 'center',
  },
  statNumber: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  statLabel: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  ctaCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: radius.md,
  },
  ctaContent: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  ctaTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  ctaText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  ctaButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  ctaButton: {
    minWidth: 120,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
  successCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  successContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  successText: {
    color: colors.textPrimary,
    marginLeft: spacing.sm,
    fontWeight: '600',
    flex: 1,
  },
  tipNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tipNavButton: {
    minWidth: 80,
  },
  tipCounter: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});
