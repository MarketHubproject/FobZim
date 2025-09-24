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
  Appbar,
  Text,
  Button,
  Card,
  TextInput,
  Chip,
  ProgressBar,
  Surface,
  IconButton,
  Divider,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../contexts/AuthContext';
import { CampaignService } from '../services/CampaignService';
import ImagePickerComponent from '../components/form/ImagePicker';
import LocationSelector from '../components/form/LocationSelector';
import {
  CampaignCategory,
  CampaignLocation,
  CampaignReward,
  CAMPAIGN_CATEGORIES_LABELS,
} from '../types/campaign';

const colors = {
  primary: '#2E7D32',
  secondary: '#4CAF50',
  surface: '#FFFFFF',
  background: '#F5F5F5',
  textPrimary: '#212121',
  textSecondary: '#757575',
  muted: '#BDBDBD',
  error: '#F44336',
  zimbabwe: '#FFCC02',
  white: '#FFFFFF',
};

interface FormData {
  title: string;
  briefDescription: string;
  detailedDescription: string;
  category: CampaignCategory | null;
  location: CampaignLocation | null;
  images: string[];
  rewards: CampaignReward[];
  applicationDeadline: Date;
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  requirements: string[];
  tags: string[];
}

interface FormErrors {
  title?: string;
  briefDescription?: string;
  detailedDescription?: string;
  category?: string;
  location?: string;
  images?: string;
  rewards?: string;
  applicationDeadline?: string;
  budget?: string;
}

const STEPS = [
  { id: 'basics', title: 'Campaign Basics', icon: 'information-outline' },
  { id: 'details', title: 'Description & Media', icon: 'file-document-edit-outline' },
  { id: 'requirements', title: 'Requirements & Rewards', icon: 'star-outline' },
  { id: 'review', title: 'Review & Publish', icon: 'check-circle-outline' },
];

const CampaignCreateScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [newRequirement, setNewRequirement] = useState('');
  const [newTag, setNewTag] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    briefDescription: '',
    detailedDescription: '',
    category: null,
    location: null,
    images: [],
    rewards: [],
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    budget: {
      min: 0,
      max: 0,
      currency: 'USD',
    },
    requirements: [],
    tags: [],
  });

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear related errors
    const newErrors = { ...errors };
    Object.keys(updates).forEach(key => {
      if (key in newErrors) {
        delete newErrors[key as keyof FormErrors];
      }
    });
    setErrors(newErrors);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};
    
    switch (step) {
      case 0: // Basics
        if (!formData.title.trim()) {
          newErrors.title = 'Campaign title is required';
        } else if (formData.title.length < 10) {
          newErrors.title = 'Title must be at least 10 characters';
        }
        
        if (!formData.briefDescription.trim()) {
          newErrors.briefDescription = 'Brief description is required';
        } else if (formData.briefDescription.length < 50) {
          newErrors.briefDescription = 'Brief description must be at least 50 characters';
        }
        
        if (!formData.category) {
          newErrors.category = 'Please select a category';
        }
        break;
        
      case 1: // Details
        if (!formData.detailedDescription.trim()) {
          newErrors.detailedDescription = 'Detailed description is required';
        } else if (formData.detailedDescription.length < 100) {
          newErrors.detailedDescription = 'Detailed description must be at least 100 characters';
        }
        
        if (formData.images.length === 0) {
          newErrors.images = 'At least one image is required';
        }
        break;
        
      case 2: // Requirements & Rewards
        if (formData.rewards.length === 0) {
          newErrors.rewards = 'At least one reward must be specified';
        }
        
        if (formData.applicationDeadline <= new Date()) {
          newErrors.applicationDeadline = 'Deadline must be in the future';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const addRequirement = () => {
    if (newRequirement.trim() && !formData.requirements.includes(newRequirement.trim())) {
      updateFormData({
        requirements: [...formData.requirements, newRequirement.trim()]
      });
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    updateFormData({
      requirements: formData.requirements.filter((_, i) => i !== index)
    });
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      updateFormData({
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    updateFormData({
      tags: formData.tags.filter((_, i) => i !== index)
    });
  };

  const addReward = () => {
    const newReward: CampaignReward = {
      id: Date.now().toString(),
      type: 'monetary',
      description: 'Payment for campaign completion',
      value: 0,
    };
    
    updateFormData({
      rewards: [...formData.rewards, newReward]
    });
  };

  const updateReward = (index: number, reward: CampaignReward) => {
    const newRewards = [...formData.rewards];
    newRewards[index] = reward;
    updateFormData({ rewards: newRewards });
  };

  const removeReward = (index: number) => {
    updateFormData({
      rewards: formData.rewards.filter((_, i) => i !== index)
    });
  };

  const submitCampaign = async () => {
    if (!validateStep(currentStep) || !user) return;
    
    setLoading(true);
    try {
      const campaignData = {
        ...formData,
        creatorId: user.uid,
        creator: {
          id: user.uid,
          displayName: user.displayName || 'Anonymous',
          photoURL: user.photoURL,
          email: user.email,
          isVerified: false, // This would come from user profile
        },
        status: 'draft' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        isFeatured: false,
        metrics: {
          views: 0,
          applications: 0,
          shares: 0,
          saves: 0,
        },
      };

      const campaignId = await CampaignService.createCampaign(campaignData);
      
      Alert.alert(
        'Success!',
        'Your campaign has been created successfully. You can publish it when ready.',
        [
          {
            text: 'View Campaign',
            onPress: () => navigation.navigate('CampaignDetail' as never, { campaignId } as never),
          },
          {
            text: 'Create Another',
            onPress: () => {
              setCurrentStep(0);
              setFormData({
                title: '',
                briefDescription: '',
                detailedDescription: '',
                category: null,
                location: null,
                images: [],
                rewards: [],
                applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                budget: { min: 0, max: 0, currency: 'USD' },
                requirements: [],
                tags: [],
              });
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create campaign. Please try again.');
      console.error('Campaign creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <Surface style={styles.stepIndicator} elevation={2}>
      <ProgressBar 
        progress={(currentStep + 1) / STEPS.length} 
        color={colors.primary}
        style={styles.progressBar}
      />
      <View style={styles.stepsContainer}>
        {STEPS.map((step, index) => (
          <View key={step.id} style={styles.stepItem}>
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

  const renderBasicsStep = () => (
    <View style={styles.stepContent}>
      <Text variant="headlineSmall" style={styles.stepTitle}>
        Campaign Basics
      </Text>
      <Text variant="bodyMedium" style={styles.stepSubtitle}>
        Let's start with the essential information about your campaign
      </Text>

      <TextInput
        mode="outlined"
        label="Campaign Title *"
        value={formData.title}
        onChangeText={(title) => updateFormData({ title })}
        placeholder="What's your campaign about?"
        error={!!errors.title}
        style={styles.input}
        maxLength={100}
        right={<TextInput.Affix text={`${formData.title.length}/100`} />}
      />
      {errors.title && (
        <Text style={styles.errorText}>{errors.title}</Text>
      )}

      <TextInput
        mode="outlined"
        label="Brief Description *"
        value={formData.briefDescription}
        onChangeText={(briefDescription) => updateFormData({ briefDescription })}
        placeholder="Summarize your campaign in 1-2 sentences"
        error={!!errors.briefDescription}
        style={styles.input}
        multiline
        numberOfLines={3}
        maxLength={300}
        right={<TextInput.Affix text={`${formData.briefDescription.length}/300`} />}
      />
      {errors.briefDescription && (
        <Text style={styles.errorText}>{errors.briefDescription}</Text>
      )}

      {/* Category Selection */}
      <View style={styles.fieldContainer}>
        <Text variant="titleMedium" style={styles.fieldLabel}>
          Campaign Category *
        </Text>
        <Text variant="bodySmall" style={styles.fieldSubtitle}>
          Choose the category that best describes your campaign
        </Text>
        
        <View style={styles.categoryGrid}>
          {Object.entries(CAMPAIGN_CATEGORIES_LABELS).map(([key, label]) => (
            <Chip
              key={key}
              mode={formData.category === key ? 'flat' : 'outlined'}
              selected={formData.category === key}
              onPress={() => updateFormData({ category: key as CampaignCategory })}
              style={[
                styles.categoryChip,
                formData.category === key && styles.categoryChipSelected,
              ]}
              textStyle={[
                styles.categoryChipText,
                formData.category === key && styles.categoryChipTextSelected,
              ]}
            >
              {label}
            </Chip>
          ))}
        </View>
        {errors.category && (
          <Text style={styles.errorText}>{errors.category}</Text>
        )}
      </View>

      <LocationSelector
        location={formData.location}
        onLocationChange={(location) => updateFormData({ location })}
        error={errors.location}
      />
    </View>
  );

  const renderDetailsStep = () => (
    <View style={styles.stepContent}>
      <Text variant="headlineSmall" style={styles.stepTitle}>
        Description & Media
      </Text>
      <Text variant="bodyMedium" style={styles.stepSubtitle}>
        Provide detailed information and visual content for your campaign
      </Text>

      <TextInput
        mode="outlined"
        label="Detailed Description *"
        value={formData.detailedDescription}
        onChangeText={(detailedDescription) => updateFormData({ detailedDescription })}
        placeholder="Provide a comprehensive description of your campaign..."
        error={!!errors.detailedDescription}
        style={styles.input}
        multiline
        numberOfLines={8}
        maxLength={2000}
        right={<TextInput.Affix text={`${formData.detailedDescription.length}/2000`} />}
      />
      {errors.detailedDescription && (
        <Text style={styles.errorText}>{errors.detailedDescription}</Text>
      )}

      <ImagePickerComponent
        images={formData.images}
        onImagesChange={(images) => updateFormData({ images })}
        error={errors.images}
        required
      />

      {/* Tags */}
      <View style={styles.fieldContainer}>
        <Text variant="titleMedium" style={styles.fieldLabel}>
          Tags
        </Text>
        <Text variant="bodySmall" style={styles.fieldSubtitle}>
          Add relevant tags to help creators find your campaign
        </Text>
        
        <View style={styles.addTagContainer}>
          <TextInput
            mode="outlined"
            placeholder="Add a tag"
            value={newTag}
            onChangeText={setNewTag}
            style={styles.tagInput}
            onSubmitEditing={addTag}
          />
          <Button
            mode="contained"
            onPress={addTag}
            disabled={!newTag.trim()}
            style={styles.addTagButton}
          >
            Add
          </Button>
        </View>

        {formData.tags.length > 0 && (
          <View style={styles.tagsList}>
            {formData.tags.map((tag, index) => (
              <Chip
                key={index}
                mode="flat"
                onClose={() => removeTag(index)}
                style={styles.tagChip}
              >
                {tag}
              </Chip>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  const renderRequirementsStep = () => (
    <View style={styles.stepContent}>
      <Text variant="headlineSmall" style={styles.stepTitle}>
        Requirements & Rewards
      </Text>
      <Text variant="bodyMedium" style={styles.stepSubtitle}>
        Define what you need and what you're offering
      </Text>

      {/* Application Deadline */}
      <View style={styles.fieldContainer}>
        <Text variant="titleMedium" style={styles.fieldLabel}>
          Application Deadline *
        </Text>
        <Text variant="bodySmall" style={styles.fieldSubtitle}>
          When should creators apply by?
        </Text>
        
        <Card style={styles.deadlineCard} mode="outlined">
          <Card.Content style={styles.deadlineContent}>
            <View style={styles.deadlineInfo}>
              <MaterialCommunityIcons
                name="calendar-clock"
                size={24}
                color={colors.primary}
              />
              <View style={styles.deadlineText}>
                <Text variant="bodyLarge" style={styles.deadlineDate}>
                  {formData.applicationDeadline.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
                <Text variant="bodySmall" style={styles.deadlineTime}>
                  {formData.applicationDeadline.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
            <Button
              mode="outlined"
              onPress={() => {
                // In a real app, you'd open a date/time picker
                Alert.alert('Date Picker', 'Date picker functionality would go here');
              }}
            >
              Change
            </Button>
          </Card.Content>
        </Card>
        {errors.applicationDeadline && (
          <Text style={styles.errorText}>{errors.applicationDeadline}</Text>
        )}
      </View>

      {/* Requirements */}
      <View style={styles.fieldContainer}>
        <Text variant="titleMedium" style={styles.fieldLabel}>
          Requirements
        </Text>
        <Text variant="bodySmall" style={styles.fieldSubtitle}>
          What skills or qualifications do creators need?
        </Text>
        
        <View style={styles.addRequirementContainer}>
          <TextInput
            mode="outlined"
            placeholder="Add a requirement"
            value={newRequirement}
            onChangeText={setNewRequirement}
            style={styles.requirementInput}
            onSubmitEditing={addRequirement}
          />
          <Button
            mode="contained"
            onPress={addRequirement}
            disabled={!newRequirement.trim()}
            style={styles.addRequirementButton}
          >
            Add
          </Button>
        </View>

        {formData.requirements.length > 0 && (
          <View style={styles.requirementsList}>
            {formData.requirements.map((requirement, index) => (
              <Card key={index} style={styles.requirementCard} mode="outlined">
                <Card.Content style={styles.requirementContent}>
                  <View style={styles.requirementText}>
                    <MaterialCommunityIcons
                      name="check-circle-outline"
                      size={16}
                      color={colors.primary}
                    />
                    <Text variant="bodyMedium" style={styles.requirementLabel}>
                      {requirement}
                    </Text>
                  </View>
                  <IconButton
                    icon="close"
                    size={16}
                    onPress={() => removeRequirement(index)}
                  />
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
      </View>

      {/* Rewards */}
      <View style={styles.fieldContainer}>
        <View style={styles.rewardsHeader}>
          <View>
            <Text variant="titleMedium" style={styles.fieldLabel}>
              Rewards *
            </Text>
            <Text variant="bodySmall" style={styles.fieldSubtitle}>
              What will creators receive for their work?
            </Text>
          </View>
          <Button
            mode="outlined"
            icon="plus"
            onPress={addReward}
            compact
          >
            Add Reward
          </Button>
        </View>

        {formData.rewards.map((reward, index) => (
          <Card key={reward.id} style={styles.rewardCard} mode="outlined">
            <Card.Content>
              <View style={styles.rewardHeader}>
                <Text variant="titleSmall">Reward {index + 1}</Text>
                <IconButton
                  icon="close"
                  size={16}
                  onPress={() => removeReward(index)}
                />
              </View>
              
              <TextInput
                mode="outlined"
                label="Description"
                value={reward.description}
                onChangeText={(description) => 
                  updateReward(index, { ...reward, description })
                }
                placeholder="Describe what creators will receive"
                style={styles.rewardInput}
                multiline
              />
              
              {reward.type === 'monetary' && (
                <TextInput
                  mode="outlined"
                  label="Value (USD)"
                  value={reward.value?.toString() || ''}
                  onChangeText={(value) => 
                    updateReward(index, { ...reward, value: parseFloat(value) || 0 })
                  }
                  placeholder="0"
                  keyboardType="numeric"
                  style={styles.rewardInput}
                  left={<TextInput.Icon icon="currency-usd" />}
                />
              )}
            </Card.Content>
          </Card>
        ))}
        
        {errors.rewards && (
          <Text style={styles.errorText}>{errors.rewards}</Text>
        )}
      </View>
    </View>
  );

  const renderReviewStep = () => (
    <View style={styles.stepContent}>
      <Text variant="headlineSmall" style={styles.stepTitle}>
        Review & Publish
      </Text>
      <Text variant="bodyMedium" style={styles.stepSubtitle}>
        Review your campaign details before publishing
      </Text>

      <Card style={styles.reviewCard} mode="outlined">
        <Card.Content>
          <Text variant="titleLarge" style={styles.reviewTitle}>
            {formData.title}
          </Text>
          
          <View style={styles.reviewMeta}>
            <Chip 
              mode="flat" 
              style={styles.reviewCategory}
              textStyle={styles.reviewCategoryText}
            >
              {formData.category ? CAMPAIGN_CATEGORIES_LABELS[formData.category] : 'No Category'}
            </Chip>
            
            {formData.location && (
              <View style={styles.reviewLocation}>
                <MaterialCommunityIcons
                  name={formData.location.isRemote ? "earth" : "map-marker"}
                  size={14}
                  color={colors.textSecondary}
                />
                <Text variant="bodySmall" style={styles.reviewLocationText}>
                  {formData.location.isRemote ? 'Remote' : 
                    formData.location.city && formData.location.country !== 'Zimbabwe' ?
                    `${formData.location.city}, ${formData.location.country}` :
                    formData.location.city}
                </Text>
              </View>
            )}
          </View>

          <Text variant="bodyMedium" style={styles.reviewDescription}>
            {formData.briefDescription}
          </Text>

          <Divider style={styles.reviewDivider} />

          <View style={styles.reviewStats}>
            <View style={styles.reviewStat}>
              <Text variant="bodySmall" style={styles.reviewStatLabel}>Images</Text>
              <Text variant="titleSmall" style={styles.reviewStatValue}>
                {formData.images.length}
              </Text>
            </View>
            
            <View style={styles.reviewStat}>
              <Text variant="bodySmall" style={styles.reviewStatLabel}>Requirements</Text>
              <Text variant="titleSmall" style={styles.reviewStatValue}>
                {formData.requirements.length}
              </Text>
            </View>
            
            <View style={styles.reviewStat}>
              <Text variant="bodySmall" style={styles.reviewStatLabel}>Rewards</Text>
              <Text variant="titleSmall" style={styles.reviewStatValue}>
                {formData.rewards.length}
              </Text>
            </View>
            
            <View style={styles.reviewStat}>
              <Text variant="bodySmall" style={styles.reviewStatLabel}>Deadline</Text>
              <Text variant="titleSmall" style={styles.reviewStatValue}>
                {Math.ceil((formData.applicationDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Surface style={styles.publishNote} elevation={0}>
        <MaterialCommunityIcons
          name="information-outline"
          size={20}
          color={colors.primary}
        />
        <Text variant="bodySmall" style={styles.publishNoteText}>
          Your campaign will be saved as a draft. You can publish it immediately 
          or review and edit it later from your dashboard.
        </Text>
      </Surface>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return renderBasicsStep();
      case 1: return renderDetailsStep();
      case 2: return renderRequirementsStep();
      case 3: return renderReviewStep();
      default: return renderBasicsStep();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Create Campaign" />
        <Appbar.Action
          icon="help-circle"
          onPress={() => Alert.alert('Help', 'Campaign creation help would go here')}
        />
      </Appbar.Header>

      {renderStepIndicator()}

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderStepContent()}
        </ScrollView>

        {/* Navigation Buttons */}
        <Surface style={styles.navigation} elevation={4}>
          <View style={styles.navigationButtons}>
            {currentStep > 0 && (
              <Button
                mode="outlined"
                onPress={prevStep}
                icon="chevron-left"
                style={styles.navButton}
                contentStyle={styles.navButtonContent}
              >
                Previous
              </Button>
            )}
            
            <View style={styles.navButtonSpacer} />
            
            {currentStep < STEPS.length - 1 ? (
              <Button
                mode="contained"
                onPress={nextStep}
                icon="chevron-right"
                style={[styles.navButton, styles.navButtonPrimary]}
                contentStyle={[styles.navButtonContent, styles.navButtonContentReverse]}
                buttonColor={colors.primary}
              >
                Next
              </Button>
            ) : (
              <Button
                mode="contained"
                onPress={submitCampaign}
                loading={loading}
                icon="check"
                style={[styles.navButton, styles.navButtonPrimary]}
                contentStyle={[styles.navButtonContent, styles.navButtonContentReverse]}
                buttonColor={colors.primary}
              >
                Create Campaign
              </Button>
            )}
          </View>
        </Surface>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    elevation: 2,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  stepIndicator: {
    backgroundColor: colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  progressBar: {
    height: 4,
    marginBottom: 16,
    borderRadius: 2,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: colors.primary,
  },
  stepCircleCurrent: {
    backgroundColor: colors.zimbabwe,
  },
  stepText: {
    color: colors.muted,
    textAlign: 'center',
    fontSize: 11,
  },
  stepTextActive: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
  stepContent: {
    padding: 20,
  },
  stepTitle: {
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stepSubtitle: {
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  fieldSubtitle: {
    color: colors.textSecondary,
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  categoryChip: {
    margin: 4,
    borderColor: colors.primary,
  },
  categoryChipSelected: {
    backgroundColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 12,
  },
  categoryChipTextSelected: {
    color: colors.white,
  },
  addTagContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    marginRight: 8,
  },
  addTagButton: {
    backgroundColor: colors.primary,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagChip: {
    margin: 4,
    backgroundColor: colors.background,
  },
  deadlineCard: {
    borderColor: colors.primary,
  },
  deadlineContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deadlineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deadlineText: {
    marginLeft: 12,
  },
  deadlineDate: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
  deadlineTime: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  addRequirementContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  requirementInput: {
    flex: 1,
    marginRight: 8,
  },
  addRequirementButton: {
    backgroundColor: colors.primary,
  },
  requirementsList: {
    marginTop: 8,
  },
  requirementCard: {
    marginBottom: 8,
    borderColor: colors.background,
  },
  requirementContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  requirementText: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  requirementLabel: {
    marginLeft: 8,
    color: colors.textPrimary,
  },
  rewardsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  rewardCard: {
    marginBottom: 16,
    borderColor: colors.primary,
  },
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rewardInput: {
    marginBottom: 12,
  },
  reviewCard: {
    borderColor: colors.primary,
    marginBottom: 20,
  },
  reviewTitle: {
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewCategory: {
    backgroundColor: colors.primary,
    marginRight: 12,
  },
  reviewCategoryText: {
    color: colors.white,
    fontSize: 11,
  },
  reviewLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewLocationText: {
    color: colors.textSecondary,
    marginLeft: 4,
  },
  reviewDescription: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
  reviewDivider: {
    marginVertical: 16,
  },
  reviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  reviewStat: {
    alignItems: 'center',
  },
  reviewStatLabel: {
    color: colors.textSecondary,
    marginBottom: 4,
  },
  reviewStatValue: {
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  publishNote: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  publishNoteText: {
    color: colors.textSecondary,
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
  navigation: {
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.background,
  },
  navigationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    flex: 1,
  },
  navButtonPrimary: {
    backgroundColor: colors.primary,
  },
  navButtonSpacer: {
    width: 16,
  },
  navButtonContent: {
    flexDirection: 'row',
  },
  navButtonContentReverse: {
    flexDirection: 'row-reverse',
  },
});

export default CampaignCreateScreen;