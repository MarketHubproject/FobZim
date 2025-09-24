import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Chip,
  Surface,
  ProgressBar,
  Divider,
  IconButton,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/tokens';
import ImagePickerComponent from '../../components/form/ImagePicker';

interface ApplicationFormData {
  message: string;
  portfolio: string[];
  creatorRate: number;
  socialLinks: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    twitter?: string;
  };
  previousWork: string;
  availability: string;
}

interface RouteParams {
  campaignId: string;
  campaignTitle: string;
}

export default function ApplyFormScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { campaignId, campaignTitle } = route.params as RouteParams;
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ApplicationFormData>({
    message: '',
    portfolio: [],
    creatorRate: 0,
    socialLinks: {},
    previousWork: '',
    availability: '',
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    { title: 'Personal Pitch', icon: 'message-text-outline' },
    { title: 'Portfolio & Rate', icon: 'briefcase-outline' },
    { title: 'Social & Experience', icon: 'account-network-outline' },
    { title: 'Submit Application', icon: 'send-outline' },
  ];
  
  const updateFormData = (updates: Partial<ApplicationFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear related errors
    const newErrors = { ...errors };
    Object.keys(updates).forEach(key => {
      if (key in newErrors) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
  };
  
  const validateStep = (step: number): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    switch (step) {
      case 0: // Personal Pitch
        if (!formData.message.trim()) {
          newErrors.message = 'Please tell us why you\'re perfect for this campaign';
        } else if (formData.message.length < 50) {
          newErrors.message = 'Your message should be at least 50 characters long';
        }
        break;
        
      case 1: // Portfolio & Rate
        if (formData.portfolio.length === 0) {
          newErrors.portfolio = 'Please add at least one portfolio item';
        }
        if (formData.creatorRate <= 0) {
          newErrors.creatorRate = 'Please specify your rate for this campaign';
        }
        break;
        
      case 2: // Social & Experience
        if (!formData.socialLinks.instagram && !formData.socialLinks.tiktok && 
            !formData.socialLinks.youtube && !formData.socialLinks.twitter) {
          newErrors.socialLinks = 'Please add at least one social media profile';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };
  
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };
  
  const submitApplication = async () => {
    if (!validateStep(currentStep)) return;
    
    setLoading(true);
    try {
      // In a real app, this would submit to the backend
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      Alert.alert(
        'Application Submitted! 🎉',
        `Your application for "${campaignTitle}" has been submitted successfully. You'll hear back within 48 hours.`,
        [
          {
            text: 'View My Applications',
            onPress: () => navigation.navigate('Profile' as never),
          },
          {
            text: 'Browse More Campaigns',
            onPress: () => navigation.navigate('CampaignsList' as never),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const renderStepIndicator = () => (
    <Surface style={styles.stepIndicator} elevation={2}>
      <ProgressBar 
        progress={(currentStep + 1) / steps.length} 
        color={colors.primary}
        style={styles.progressBar}
      />
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <View key={index} style={styles.stepItem}>
            <View 
              style={[
                styles.stepCircle,
                index <= currentStep && styles.stepCircleActive,
                index === currentStep && styles.stepCircleCurrent,
              ]}
            >
              <MaterialCommunityIcons
                name={step.icon as any}
                size={16}
                color={index <= currentStep ? colors.white : colors.muted}
              />
            </View>
            <Text 
              variant="bodySmall" 
              style={[
                styles.stepText,
                index <= currentStep && styles.stepTextActive,
              ]}
            >
              {step.title}
            </Text>
          </View>
        ))}
      </View>
    </Surface>
  );
  
  const renderPersonalPitchStep = () => (
    <View style={styles.stepContent}>
      <Text variant="headlineSmall" style={styles.stepTitle}>
        Why are you perfect for this campaign?
      </Text>
      <Text variant="bodyMedium" style={styles.stepSubtitle}>
        Tell the brand about yourself and why you're the right creator for "{campaignTitle}"
      </Text>
      
      <TextInput
        mode="outlined"
        label="Your Pitch *"
        value={formData.message}
        onChangeText={(message) => updateFormData({ message })}
        placeholder="Hi! I'm excited about this campaign because..."
        error={!!errors.message}
        style={styles.input}
        multiline
        numberOfLines={8}
        maxLength={1000}
        right={<TextInput.Affix text={`${formData.message.length}/1000`} />}
      />
      {errors.message && (
        <Text style={styles.errorText}>{errors.message}</Text>
      )}
      
      <TextInput
        mode="outlined"
        label="Availability"
        value={formData.availability}
        onChangeText={(availability) => updateFormData({ availability })}
        placeholder="When can you start and complete this campaign?"
        style={styles.input}
        multiline
        numberOfLines={2}
      />
    </View>
  );
  
  const renderPortfolioRateStep = () => (
    <View style={styles.stepContent}>
      <Text variant="headlineSmall" style={styles.stepTitle}>
        Portfolio & Rate
      </Text>
      <Text variant="bodyMedium" style={styles.stepSubtitle}>
        Show your best work and let us know your rate
      </Text>
      
      <ImagePickerComponent
        images={formData.portfolio}
        onImagesChange={(portfolio) => updateFormData({ portfolio })}
        label="Portfolio Images *"
        required
        error={errors.portfolio}
        maxImages={6}
      />
      
      <TextInput
        mode="outlined"
        label="Your Rate (USD) *"
        value={formData.creatorRate > 0 ? formData.creatorRate.toString() : ''}
        onChangeText={(rate) => updateFormData({ creatorRate: parseInt(rate) || 0 })}
        placeholder="What do you charge for this type of campaign?"
        error={!!errors.creatorRate}
        style={styles.input}
        keyboardType="numeric"
        left={<TextInput.Icon icon="currency-usd" />}
      />
      {errors.creatorRate && (
        <Text style={styles.errorText}>{errors.creatorRate}</Text>
      )}
      
      <TextInput
        mode="outlined"
        label="Previous Relevant Work"
        value={formData.previousWork}
        onChangeText={(previousWork) => updateFormData({ previousWork })}
        placeholder="Describe similar campaigns or projects you've worked on..."
        style={styles.input}
        multiline
        numberOfLines={4}
      />
    </View>
  );
  
  const renderSocialExperienceStep = () => (
    <View style={styles.stepContent}>
      <Text variant="headlineSmall" style={styles.stepTitle}>
        Social Media Profiles
      </Text>
      <Text variant="bodyMedium" style={styles.stepSubtitle}>
        Add your social media profiles so brands can see your work
      </Text>
      
      <TextInput
        mode="outlined"
        label="Instagram Profile"
        value={formData.socialLinks.instagram || ''}
        onChangeText={(instagram) => updateFormData({ 
          socialLinks: { ...formData.socialLinks, instagram }
        })}
        placeholder="@yourusername or full URL"
        style={styles.input}
        left={<TextInput.Icon icon="instagram" />}
      />
      
      <TextInput
        mode="outlined"
        label="TikTok Profile"
        value={formData.socialLinks.tiktok || ''}
        onChangeText={(tiktok) => updateFormData({ 
          socialLinks: { ...formData.socialLinks, tiktok }
        })}
        placeholder="@yourusername or full URL"
        style={styles.input}
        left={<TextInput.Icon icon="music" />}
      />
      
      <TextInput
        mode="outlined"
        label="YouTube Channel"
        value={formData.socialLinks.youtube || ''}
        onChangeText={(youtube) => updateFormData({ 
          socialLinks: { ...formData.socialLinks, youtube }
        })}
        placeholder="Channel name or full URL"
        style={styles.input}
        left={<TextInput.Icon icon="youtube" />}
      />
      
      <TextInput
        mode="outlined"
        label="Twitter/X Profile"
        value={formData.socialLinks.twitter || ''}
        onChangeText={(twitter) => updateFormData({ 
          socialLinks: { ...formData.socialLinks, twitter }
        })}
        placeholder="@yourusername or full URL"
        style={styles.input}
        left={<TextInput.Icon icon="twitter" />}
      />
      
      {errors.socialLinks && (
        <Text style={styles.errorText}>{errors.socialLinks}</Text>
      )}
    </View>
  );
  
  const renderSubmitStep = () => (
    <View style={styles.stepContent}>
      <Text variant="headlineSmall" style={styles.stepTitle}>
        Review & Submit
      </Text>
      <Text variant="bodyMedium" style={styles.stepSubtitle}>
        Review your application before submitting
      </Text>
      
      <Card style={styles.reviewCard} mode="outlined">
        <Card.Content>
          <View style={styles.reviewRow}>
            <MaterialCommunityIcons name="message-text" size={20} color={colors.primary} />
            <Text variant="bodyMedium" style={styles.reviewLabel}>Message:</Text>
            <Text variant="bodySmall" style={styles.reviewValue}>
              {formData.message.substring(0, 100)}...
            </Text>
          </View>
          
          <Divider style={styles.reviewDivider} />
          
          <View style={styles.reviewRow}>
            <MaterialCommunityIcons name="currency-usd" size={20} color={colors.primary} />
            <Text variant="bodyMedium" style={styles.reviewLabel}>Your Rate:</Text>
            <Text variant="bodyMedium" style={styles.reviewValue}>
              ${formData.creatorRate}
            </Text>
          </View>
          
          <Divider style={styles.reviewDivider} />
          
          <View style={styles.reviewRow}>
            <MaterialCommunityIcons name="image-multiple" size={20} color={colors.primary} />
            <Text variant="bodyMedium" style={styles.reviewLabel}>Portfolio:</Text>
            <Text variant="bodyMedium" style={styles.reviewValue}>
              {formData.portfolio.length} images
            </Text>
          </View>
          
          <Divider style={styles.reviewDivider} />
          
          <View style={styles.reviewRow}>
            <MaterialCommunityIcons name="account-network" size={20} color={colors.primary} />
            <Text variant="bodyMedium" style={styles.reviewLabel}>Social Profiles:</Text>
            <Text variant="bodyMedium" style={styles.reviewValue}>
              {Object.values(formData.socialLinks).filter(Boolean).length} platforms
            </Text>
          </View>
        </Card.Content>
      </Card>
      
      <Text variant="bodySmall" style={styles.disclaimer}>
        By submitting this application, you agree to our terms of service and confirm that all information provided is accurate.
      </Text>
    </View>
  );
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return renderPersonalPitchStep();
      case 1: return renderPortfolioRateStep();
      case 2: return renderSocialExperienceStep();
      case 3: return renderSubmitStep();
      default: return null;
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {renderStepIndicator()}
        
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderStepContent()}
        </ScrollView>
        
        <Surface style={styles.navigationBar} elevation={4}>
          <View style={styles.navigationButtons}>
            {currentStep > 0 && (
              <Button
                mode="outlined"
                onPress={prevStep}
                style={styles.navButton}
                icon="chevron-left"
              >
                Previous
              </Button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <Button
                mode="contained"
                onPress={nextStep}
                style={[styles.navButton, styles.nextButton]}
                icon="chevron-right"
                contentStyle={styles.nextButtonContent}
              >
                Next
              </Button>
            ) : (
              <Button
                mode="contained"
                onPress={submitApplication}
                style={[styles.navButton, styles.submitButton]}
                loading={loading}
                disabled={loading}
                icon="send"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            )}
          </View>
        </Surface>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  stepIndicator: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: spacing.md,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.muted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  stepCircleActive: {
    backgroundColor: colors.primary,
  },
  stepCircleCurrent: {
    backgroundColor: colors.secondary,
  },
  stepText: {
    fontSize: 10,
    color: colors.muted,
    textAlign: 'center',
  },
  stepTextActive: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  stepContent: {
    padding: spacing.lg,
  },
  stepTitle: {
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  stepSubtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  input: {
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    marginLeft: spacing.sm,
  },
  reviewCard: {
    marginBottom: spacing.lg,
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  reviewLabel: {
    marginLeft: spacing.sm,
    flex: 1,
    fontWeight: '500',
  },
  reviewValue: {
    flex: 2,
    textAlign: 'right',
  },
  reviewDivider: {
    marginVertical: spacing.xs,
  },
  disclaimer: {
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  navigationBar: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    minWidth: 100,
  },
  nextButton: {
    backgroundColor: colors.primary,
  },
  nextButtonContent: {
    flexDirection: 'row-reverse',
  },
  submitButton: {
    backgroundColor: colors.secondary,
    flex: 1,
    marginLeft: spacing.md,
  },
});
