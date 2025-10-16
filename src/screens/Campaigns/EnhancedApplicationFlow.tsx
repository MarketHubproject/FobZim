import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  BackHandler,
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
  Switch,
  RadioButton,
  Checkbox,
  Portal,
  Modal,
  FAB,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { colors } from '../../theme/colors';
import { spacing, radius, shadow } from '../../theme/tokens';
import ImagePickerComponent from '../../components/form/ImagePicker';
import { useAppStore } from '../../store/simpleStore';
import {
  renderSocialMediaStep,
  renderCampaignUnderstandingStep,
  renderFinalReviewStep,
} from './ApplicationSteps';

// Enhanced Types
interface EnhancedApplicationFormData {
  // Step 1: Basic Information
  personalPitch: string;
  whyPerfectFit: string;
  availability: string;
  preferredStartDate: string;
  
  // Step 2: Portfolio & Work Samples
  portfolioImages: string[];
  portfolioVideos: string[];
  portfolioDocuments: string[];
  recentWorkDescription: string;
  relevantExperience: string;
  
  // Step 3: Rates & Requirements
  proposedRate: number;
  rateJustification: string;
  deliverables: string[];
  timeline: string;
  additionalServices: string[];
  
  // Step 4: Social Media & Analytics
  socialPlatforms: {
    instagram?: { handle: string; followers: number; engagementRate: number };
    tiktok?: { handle: string; followers: number; avgViews: number };
    youtube?: { handle: string; subscribers: number; avgViews: number };
    twitter?: { handle: string; followers: number };
    other?: { platform: string; handle: string; metrics: string };
  };
  
  // Step 5: Campaign Understanding
  campaignGoalUnderstanding: string;
  targetAudienceMatch: string;
  contentStrategy: string;
  uniqueApproach: string;
  
  // Step 6: Legal & Final Details
  hasWorkExamples: boolean;
  canMeetDeadlines: boolean;
  agreesToTerms: boolean;
  exclusivityAgreement: boolean;
  revisionRounds: number;
  usageRights: string;
}

interface ApplicationStep {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  completed: boolean;
  optional?: boolean;
}

interface RouteParams {
  campaignId: string;
  campaignTitle: string;
  campaignBudget: number;
  campaignRequirements?: string[];
  brandName: string;
}

export default function EnhancedApplicationFlow() {
  const route = useRoute();
  const navigation = useNavigation();
  const { campaignId, campaignTitle, campaignBudget, campaignRequirements, brandName } = route.params as RouteParams;
  
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showExitModal, setShowExitModal] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const [formData, setFormData] = useState<EnhancedApplicationFormData>({
    personalPitch: '',
    whyPerfectFit: '',
    availability: '',
    preferredStartDate: '',
    portfolioImages: [],
    portfolioVideos: [],
    portfolioDocuments: [],
    recentWorkDescription: '',
    relevantExperience: '',
    proposedRate: 0,
    rateJustification: '',
    deliverables: [],
    timeline: '',
    additionalServices: [],
    socialPlatforms: {},
    campaignGoalUnderstanding: '',
    targetAudienceMatch: '',
    contentStrategy: '',
    uniqueApproach: '',
    hasWorkExamples: false,
    canMeetDeadlines: false,
    agreesToTerms: false,
    exclusivityAgreement: false,
    revisionRounds: 2,
    usageRights: '1-year',
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [stepValidation, setStepValidation] = useState<{[key: number]: boolean}>({});
  
  const steps: ApplicationStep[] = [
    {
      id: 'basic-info',
      title: 'Personal Pitch',
      subtitle: 'Tell us why you\'re perfect',
      icon: 'account-heart',
      completed: false,
    },
    {
      id: 'portfolio',
      title: 'Portfolio & Work',
      subtitle: 'Show your best work',
      icon: 'briefcase-variant',
      completed: false,
    },
    {
      id: 'rates-requirements',
      title: 'Rates & Deliverables',
      subtitle: 'Define your terms',
      icon: 'currency-usd',
      completed: false,
    },
    {
      id: 'social-analytics',
      title: 'Social Media',
      subtitle: 'Your platform presence',
      icon: 'instagram',
      completed: false,
    },
    {
      id: 'campaign-understanding',
      title: 'Campaign Strategy',
      subtitle: 'Show your understanding',
      icon: 'lightbulb-on',
      completed: false,
    },
    {
      id: 'final-review',
      title: 'Review & Submit',
      subtitle: 'Final check before sending',
      icon: 'send-check',
      completed: false,
    },
  ];

  // Auto-save functionality
  useEffect(() => {
    const autoSave = async () => {
      try {
        const draftKey = `campaign_application_draft_${campaignId}`;
        await AsyncStorage.setItem(draftKey, JSON.stringify({
          formData,
          currentStep,
          lastSaved: new Date().toISOString(),
        }));
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    };

    const timeoutId = setTimeout(autoSave, 2000); // Auto-save after 2 seconds of inactivity
    return () => clearTimeout(timeoutId);
  }, [formData, currentStep, campaignId]);

  // Load saved draft on mount
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const draftKey = `campaign_application_draft_${campaignId}`;
        const savedData = await AsyncStorage.getItem(draftKey);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          setFormData(parsed.formData);
          setCurrentStep(parsed.currentStep);
          setLastSaved(new Date(parsed.lastSaved));
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    };

    loadDraft();
  }, [campaignId]);

  // Handle back button
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (currentStep > 0) {
          setCurrentStep(prev => prev - 1);
          return true;
        } else {
          setShowExitModal(true);
          return true;
        }
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [currentStep])
  );

  // Animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep]);

  const updateFormData = (updates: Partial<EnhancedApplicationFormData>) => {
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
    let isValid = true;

    switch (step) {
      case 0: // Basic Information
        if (!formData.personalPitch.trim() || formData.personalPitch.length < 100) {
          newErrors.personalPitch = 'Personal pitch must be at least 100 characters';
          isValid = false;
        }
        if (!formData.whyPerfectFit.trim() || formData.whyPerfectFit.length < 50) {
          newErrors.whyPerfectFit = 'Please explain why you\'re perfect (min 50 chars)';
          isValid = false;
        }
        break;

      case 1: // Portfolio & Work
        if (formData.portfolioImages.length === 0 && formData.portfolioVideos.length === 0) {
          newErrors.portfolio = 'Please add at least one portfolio item';
          isValid = false;
        }
        if (!formData.relevantExperience.trim()) {
          newErrors.relevantExperience = 'Please describe your relevant experience';
          isValid = false;
        }
        break;

      case 2: // Rates & Requirements
        if (formData.proposedRate <= 0) {
          newErrors.proposedRate = 'Please specify your proposed rate';
          isValid = false;
        }
        if (!formData.rateJustification.trim()) {
          newErrors.rateJustification = 'Please justify your proposed rate';
          isValid = false;
        }
        break;

      case 3: // Social Analytics
        if (Object.keys(formData.socialPlatforms).length === 0) {
          newErrors.socialPlatforms = 'Please add at least one social media platform';
          isValid = false;
        }
        break;

      case 4: // Campaign Understanding
        if (!formData.campaignGoalUnderstanding.trim()) {
          newErrors.campaignGoalUnderstanding = 'Please explain your understanding of campaign goals';
          isValid = false;
        }
        if (!formData.contentStrategy.trim()) {
          newErrors.contentStrategy = 'Please outline your content strategy';
          isValid = false;
        }
        break;

      case 5: // Final Review
        if (!formData.agreesToTerms) {
          newErrors.agreesToTerms = 'You must agree to terms and conditions';
          isValid = false;
        }
        if (!formData.canMeetDeadlines) {
          newErrors.canMeetDeadlines = 'Please confirm you can meet the deadlines';
          isValid = false;
        }
        break;
    }

    setErrors(newErrors);
    setStepValidation(prev => ({ ...prev, [step]: isValid }));
    return isValid;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const saveDraft = async () => {
    setSavingDraft(true);
    try {
      const draftKey = `campaign_application_draft_${campaignId}`;
      await AsyncStorage.setItem(draftKey, JSON.stringify({
        formData,
        currentStep,
        lastSaved: new Date().toISOString(),
      }));
      setLastSaved(new Date());
      Alert.alert('Draft Saved', 'Your application has been saved as a draft.');
    } catch (error) {
      Alert.alert('Error', 'Failed to save draft. Please try again.');
    } finally {
      setSavingDraft(false);
    }
  };

  const submitApplication = async () => {
    if (!validateStep(currentStep)) return;

    Alert.alert(
      'Submit Application?',
      `Are you sure you want to submit your application for "${campaignTitle}"? You won't be able to edit it afterward.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Submit', 
          onPress: async () => {
            setLoading(true);
            try {
              // Simulate API call
              await new Promise(resolve => setTimeout(resolve, 3000));
              
              // Clear draft
              const draftKey = `campaign_application_draft_${campaignId}`;
              await AsyncStorage.removeItem(draftKey);
              
              Alert.alert(
                'Application Submitted! 🎉',
                `Your application for "${campaignTitle}" has been submitted successfully. ${brandName} will review it and get back to you within 2-3 business days.`,
                [
                  {
                    text: 'View Application Status',
                    onPress: () => navigation.navigate('ApplicationHistory' as never),
                  },
                  {
                    text: 'Browse More Campaigns',
                    onPress: () => navigation.navigate('Campaigns' as never),
                  },
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to submit application. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        },
      ]
    );
  };

  const renderProgressIndicator = () => (
    <Surface style={styles.progressContainer} elevation={2}>
      <View style={styles.progressHeader}>
        <Text variant="titleMedium" style={styles.progressTitle}>
          Step {currentStep + 1} of {steps.length}
        </Text>
        {lastSaved && (
          <Text variant="bodySmall" style={styles.lastSaved}>
            Last saved: {lastSaved.toLocaleTimeString()}
          </Text>
        )}
      </View>
      
      <ProgressBar 
        progress={(currentStep + 1) / steps.length} 
        color={colors.primary}
        style={styles.progressBar}
      />
      
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <View key={step.id} style={styles.stepIndicator}>
            <View 
              style={[
                styles.stepCircle,
                index < currentStep && styles.stepCompleted,
                index === currentStep && styles.stepCurrent,
                stepValidation[index] && styles.stepValid,
              ]}
            >
              <MaterialCommunityIcons
                name={
                  index < currentStep && stepValidation[index] 
                    ? 'check' 
                    : step.icon as any
                }
                size={index === currentStep ? 20 : 16}
                color={
                  index < currentStep && stepValidation[index]
                    ? colors.white
                    : index === currentStep 
                      ? colors.primary
                      : colors.muted
                }
              />
            </View>
            <Text 
              variant="bodySmall" 
              style={[
                styles.stepTitle,
                index <= currentStep && styles.stepTitleActive
              ]}
            >
              {step.title}
            </Text>
          </View>
        ))}
      </View>
    </Surface>
  );

  const renderBasicInfoStep = () => (
    <View style={styles.stepContent}>
      <Text variant="headlineMedium" style={styles.stepHeader}>
        Tell us about yourself 👋
      </Text>
      <Text variant="bodyMedium" style={styles.stepDescription}>
        Help {brandName} understand why you're perfect for "{campaignTitle}"
      </Text>

      <Card style={styles.inputCard}>
        <Card.Content>
          <TextInput
            mode="outlined"
            label="Personal Pitch *"
            value={formData.personalPitch}
            onChangeText={(personalPitch) => updateFormData({ personalPitch })}
            placeholder="Hi! I'm excited about this campaign because..."
            error={!!errors.personalPitch}
            style={styles.input}
            multiline
            numberOfLines={6}
            maxLength={2000}
            right={<TextInput.Affix text={`${formData.personalPitch.length}/2000`} />}
          />
          {errors.personalPitch && (
            <Text style={styles.errorText}>{errors.personalPitch}</Text>
          )}

          <TextInput
            mode="outlined"
            label="Why You're Perfect for This Campaign *"
            value={formData.whyPerfectFit}
            onChangeText={(whyPerfectFit) => updateFormData({ whyPerfectFit })}
            placeholder="I'm perfect for this campaign because..."
            error={!!errors.whyPerfectFit}
            style={styles.input}
            multiline
            numberOfLines={4}
            maxLength={1000}
            right={<TextInput.Affix text={`${formData.whyPerfectFit.length}/1000`} />}
          />
          {errors.whyPerfectFit && (
            <Text style={styles.errorText}>{errors.whyPerfectFit}</Text>
          )}

          <TextInput
            mode="outlined"
            label="Availability"
            value={formData.availability}
            onChangeText={(availability) => updateFormData({ availability })}
            placeholder="I'm available to start immediately and work 20 hours/week"
            style={styles.input}
            multiline
            numberOfLines={2}
          />

          <TextInput
            mode="outlined"
            label="Preferred Start Date"
            value={formData.preferredStartDate}
            onChangeText={(preferredStartDate) => updateFormData({ preferredStartDate })}
            placeholder="January 15, 2025"
            style={styles.input}
            left={<TextInput.Icon icon="calendar" />}
          />
        </Card.Content>
      </Card>
    </View>
  );

  const renderPortfolioStep = () => (
    <View style={styles.stepContent}>
      <Text variant="headlineMedium" style={styles.stepHeader}>
        Showcase your work 📸
      </Text>
      <Text variant="bodyMedium" style={styles.stepDescription}>
        Upload your best work that's relevant to this campaign
      </Text>

      <Card style={styles.inputCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Portfolio Images
          </Text>
          <ImagePickerComponent
            images={formData.portfolioImages}
            onImagesChange={(portfolioImages) => updateFormData({ portfolioImages })}
            label="Add portfolio images *"
            maxImages={8}
            error={errors.portfolio}
          />

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Recent Work Description *
          </Text>
          <TextInput
            mode="outlined"
            label="Describe your recent relevant work"
            value={formData.recentWorkDescription}
            onChangeText={(recentWorkDescription) => updateFormData({ recentWorkDescription })}
            placeholder="In my recent campaign for XYZ Brand..."
            style={styles.input}
            multiline
            numberOfLines={4}
            maxLength={1500}
            right={<TextInput.Affix text={`${formData.recentWorkDescription.length}/1500`} />}
          />

          <TextInput
            mode="outlined"
            label="Relevant Experience *"
            value={formData.relevantExperience}
            onChangeText={(relevantExperience) => updateFormData({ relevantExperience })}
            placeholder="I have 3 years of experience in fashion content creation..."
            error={!!errors.relevantExperience}
            style={styles.input}
            multiline
            numberOfLines={4}
            maxLength={1500}
            right={<TextInput.Affix text={`${formData.relevantExperience.length}/1500`} />}
          />
          {errors.relevantExperience && (
            <Text style={styles.errorText}>{errors.relevantExperience}</Text>
          )}
        </Card.Content>
      </Card>
    </View>
  );

  const renderRatesStep = () => (
    <View style={styles.stepContent}>
      <Text variant="headlineMedium" style={styles.stepHeader}>
        Your rates & terms 💰
      </Text>
      <Text variant="bodyMedium" style={styles.stepDescription}>
        Campaign budget: ${campaignBudget.toLocaleString()} USD
      </Text>

      <Card style={styles.inputCard}>
        <Card.Content>
          <TextInput
            mode="outlined"
            label="Your Proposed Rate (USD) *"
            value={formData.proposedRate > 0 ? formData.proposedRate.toString() : ''}
            onChangeText={(rate) => updateFormData({ proposedRate: parseInt(rate) || 0 })}
            placeholder="Enter your rate for this campaign"
            error={!!errors.proposedRate}
            style={styles.input}
            keyboardType="numeric"
            left={<TextInput.Icon icon="currency-usd" />}
            right={
              campaignBudget > 0 ? (
                <TextInput.Affix 
                  text={`${((formData.proposedRate / campaignBudget) * 100).toFixed(0)}% of budget`} 
                />
              ) : null
            }
          />
          {errors.proposedRate && (
            <Text style={styles.errorText}>{errors.proposedRate}</Text>
          )}

          <TextInput
            mode="outlined"
            label="Rate Justification *"
            value={formData.rateJustification}
            onChangeText={(rateJustification) => updateFormData({ rateJustification })}
            placeholder="My rate reflects my experience level, deliverables included..."
            error={!!errors.rateJustification}
            style={styles.input}
            multiline
            numberOfLines={3}
            maxLength={800}
            right={<TextInput.Affix text={`${formData.rateJustification.length}/800`} />}
          />
          {errors.rateJustification && (
            <Text style={styles.errorText}>{errors.rateJustification}</Text>
          )}

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Project Timeline
          </Text>
          <TextInput
            mode="outlined"
            label="Estimated Timeline"
            value={formData.timeline}
            onChangeText={(timeline) => updateFormData({ timeline })}
            placeholder="2 weeks for content creation, 1 week for revisions"
            style={styles.input}
            multiline
            numberOfLines={2}
          />

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Usage Rights & Revisions
          </Text>
          <View style={styles.optionsRow}>
            <View style={styles.optionItem}>
              <Text variant="bodyMedium">Usage Rights Duration:</Text>
              <RadioButton.Group
                onValueChange={(usageRights) => updateFormData({ usageRights })}
                value={formData.usageRights}
              >
                <View style={styles.radioOption}>
                  <RadioButton value="6-months" />
                  <Text>6 months</Text>
                </View>
                <View style={styles.radioOption}>
                  <RadioButton value="1-year" />
                  <Text>1 year</Text>
                </View>
                <View style={styles.radioOption}>
                  <RadioButton value="unlimited" />
                  <Text>Unlimited</Text>
                </View>
              </RadioButton.Group>
            </View>

            <View style={styles.optionItem}>
              <Text variant="bodyMedium">Included Revision Rounds:</Text>
              <View style={styles.revisionCounter}>
                <IconButton
                  icon="minus"
                  size={20}
                  onPress={() => updateFormData({ 
                    revisionRounds: Math.max(1, formData.revisionRounds - 1) 
                  })}
                />
                <Text variant="titleLarge">{formData.revisionRounds}</Text>
                <IconButton
                  icon="plus"
                  size={20}
                  onPress={() => updateFormData({ 
                    revisionRounds: Math.min(5, formData.revisionRounds + 1) 
                  })}
                />
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderBasicInfoStep();
      case 1: return renderPortfolioStep();
      case 2: return renderRatesStep();
      case 3: return renderSocialMediaStep(formData, updateFormData, errors);
      case 4: return renderCampaignUnderstandingStep(
        formData, 
        updateFormData, 
        errors, 
        campaignTitle, 
        brandName
      );
      case 5: return renderFinalReviewStep(
        formData, 
        updateFormData, 
        errors, 
        campaignTitle, 
        brandName, 
        campaignBudget
      );
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {renderProgressIndicator()}
        
        <Animated.View style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{
              translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0]
              })
            }]
          }
        ]}>
          <ScrollView 
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {renderCurrentStep()}
          </ScrollView>
        </Animated.View>
        
        {/* Navigation Bar */}
        <Surface style={styles.navigationBar} elevation={4}>
          <View style={styles.navigationContent}>
            <Button
              mode="outlined"
              onPress={saveDraft}
              loading={savingDraft}
              icon="content-save"
              style={styles.draftButton}
            >
              Save Draft
            </Button>
            
            <View style={styles.navigationButtons}>
              {currentStep > 0 && (
                <Button
                  mode="outlined"
                  onPress={prevStep}
                  icon="chevron-left"
                  style={styles.navButton}
                >
                  Previous
                </Button>
              )}
              
              {currentStep < steps.length - 1 ? (
                <Button
                  mode="contained"
                  onPress={nextStep}
                  icon="chevron-right"
                  style={[styles.navButton, styles.nextButton]}
                  contentStyle={styles.nextButtonContent}
                >
                  Next
                </Button>
              ) : (
                <Button
                  mode="contained"
                  onPress={submitApplication}
                  loading={loading}
                  disabled={loading}
                  icon="send"
                  style={[styles.navButton, styles.submitButton]}
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </Button>
              )}
            </View>
          </View>
        </Surface>

        {/* Exit Modal */}
        <Portal>
          <Modal 
            visible={showExitModal} 
            onDismiss={() => setShowExitModal(false)}
            contentContainerStyle={styles.exitModal}
          >
            <Text variant="headlineSmall" style={styles.exitModalTitle}>
              Exit Application?
            </Text>
            <Text variant="bodyMedium" style={styles.exitModalText}>
              Your progress will be automatically saved as a draft. You can continue later.
            </Text>
            <View style={styles.exitModalButtons}>
              <Button
                mode="outlined"
                onPress={() => setShowExitModal(false)}
                style={styles.exitModalButton}
              >
                Continue Application
              </Button>
              <Button
                mode="contained"
                onPress={() => navigation.goBack()}
                style={styles.exitModalButton}
              >
                Save & Exit
              </Button>
            </View>
          </Modal>
        </Portal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressContainer: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  lastSaved: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: spacing.md,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepIndicator: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  stepCompleted: {
    backgroundColor: colors.primary,
  },
  stepCurrent: {
    backgroundColor: colors.secondary,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  stepValid: {
    backgroundColor: colors.success,
  },
  stepTitle: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 12,
  },
  stepTitleActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
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
  stepHeader: {
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  stepDescription: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  inputCard: {
    marginBottom: spacing.md,
    ...shadow.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
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
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  optionItem: {
    flex: 1,
    marginRight: spacing.md,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  revisionCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  navigationBar: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  navigationContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  draftButton: {
    borderColor: colors.textSecondary,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
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
    backgroundColor: colors.success,
  },
  exitModal: {
    backgroundColor: colors.surface,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
  exitModalTitle: {
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  exitModalText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  exitModalButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  exitModalButton: {
    flex: 1,
  },
});