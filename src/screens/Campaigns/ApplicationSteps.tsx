import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  Text,
  TextInput,
  Card,
  Chip,
  Switch,
  Checkbox,
  Divider,
  IconButton,
  Button,
  Surface,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors } from '../../theme/colors';
import { spacing, radius, shadow } from '../../theme/tokens';

// Social Media Platform Component
export const SocialMediaPlatformInput = ({ 
  platform, 
  data, 
  onChange,
  onRemove 
}: {
  platform: string;
  data: any;
  onChange: (data: any) => void;
  onRemove: () => void;
}) => {
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return 'instagram';
      case 'tiktok': return 'music-note';
      case 'youtube': return 'youtube';
      case 'twitter': return 'twitter';
      case 'facebook': return 'facebook';
      default: return 'web';
    }
  };

  const getPlatformFields = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return [
          { key: 'handle', label: 'Instagram Handle', placeholder: '@yourusername' },
          { key: 'followers', label: 'Followers', type: 'numeric' },
          { key: 'engagementRate', label: 'Engagement Rate (%)', type: 'numeric' },
        ];
      case 'tiktok':
        return [
          { key: 'handle', label: 'TikTok Handle', placeholder: '@yourusername' },
          { key: 'followers', label: 'Followers', type: 'numeric' },
          { key: 'avgViews', label: 'Average Views', type: 'numeric' },
        ];
      case 'youtube':
        return [
          { key: 'handle', label: 'Channel Name', placeholder: 'Your Channel Name' },
          { key: 'subscribers', label: 'Subscribers', type: 'numeric' },
          { key: 'avgViews', label: 'Average Views per Video', type: 'numeric' },
        ];
      case 'twitter':
        return [
          { key: 'handle', label: 'Twitter Handle', placeholder: '@yourusername' },
          { key: 'followers', label: 'Followers', type: 'numeric' },
        ];
      default:
        return [
          { key: 'platform', label: 'Platform Name', placeholder: 'Platform name' },
          { key: 'handle', label: 'Username/Handle', placeholder: 'Your username' },
          { key: 'metrics', label: 'Key Metrics', placeholder: '10K followers, 5% engagement' },
        ];
    }
  };

  const fields = getPlatformFields(platform);

  return (
    <Card style={styles.platformCard}>
      <Card.Content>
        <View style={styles.platformHeader}>
          <View style={styles.platformTitle}>
            <MaterialCommunityIcons 
              name={getPlatformIcon(platform) as any} 
              size={24} 
              color={colors.primary} 
            />
            <Text variant="titleMedium" style={styles.platformName}>
              {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </Text>
          </View>
          <IconButton 
            icon="close" 
            size={20} 
            onPress={onRemove}
            iconColor={colors.error}
          />
        </View>

        {fields.map((field) => (
          <TextInput
            key={field.key}
            mode="outlined"
            label={field.label}
            value={data[field.key]?.toString() || ''}
            onChangeText={(value) => onChange({
              ...data,
              [field.key]: field.type === 'numeric' ? parseInt(value) || 0 : value
            })}
            placeholder={field.placeholder}
            style={styles.input}
            keyboardType={field.type === 'numeric' ? 'numeric' : 'default'}
          />
        ))}
      </Card.Content>
    </Card>
  );
};

// Social Media Step
export const renderSocialMediaStep = (
  formData: any, 
  updateFormData: (data: any) => void,
  errors: any
) => {
  const [availablePlatforms] = useState([
    'Instagram', 'TikTok', 'YouTube', 'Twitter', 'Facebook', 'LinkedIn', 'Other'
  ]);

  const addPlatform = (platform: string) => {
    const platformKey = platform.toLowerCase();
    updateFormData({
      socialPlatforms: {
        ...formData.socialPlatforms,
        [platformKey]: {}
      }
    });
  };

  const updatePlatform = (platform: string, data: any) => {
    updateFormData({
      socialPlatforms: {
        ...formData.socialPlatforms,
        [platform]: data
      }
    });
  };

  const removePlatform = (platform: string) => {
    const newPlatforms = { ...formData.socialPlatforms };
    delete newPlatforms[platform];
    updateFormData({ socialPlatforms: newPlatforms });
  };

  const addedPlatforms = Object.keys(formData.socialPlatforms);
  const remainingPlatforms = availablePlatforms.filter(
    p => !addedPlatforms.includes(p.toLowerCase())
  );

  return (
    <View style={styles.stepContent}>
      <Text variant="headlineMedium" style={styles.stepHeader}>
        Your social presence 📱
      </Text>
      <Text variant="bodyMedium" style={styles.stepDescription}>
        Add your social media accounts to showcase your reach and engagement
      </Text>

      {errors.socialPlatforms && (
        <Text style={styles.errorText}>{errors.socialPlatforms}</Text>
      )}

      {/* Added Platforms */}
      {addedPlatforms.map((platform) => (
        <SocialMediaPlatformInput
          key={platform}
          platform={platform}
          data={formData.socialPlatforms[platform]}
          onChange={(data) => updatePlatform(platform, data)}
          onRemove={() => removePlatform(platform)}
        />
      ))}

      {/* Add Platform Chips */}
      {remainingPlatforms.length > 0 && (
        <Card style={styles.inputCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Add Social Media Platform
            </Text>
            <View style={styles.chipContainer}>
              {remainingPlatforms.map((platform) => (
                <Chip
                  key={platform}
                  mode="outlined"
                  onPress={() => addPlatform(platform)}
                  style={styles.platformChip}
                  icon={() => (
                    <MaterialCommunityIcons 
                      name={platform === 'Other' ? 'plus' : 'account-plus'} 
                      size={16} 
                      color={colors.primary} 
                    />
                  )}
                >
                  {platform}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Additional Analytics Info */}
      <Card style={styles.inputCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Additional Information
          </Text>
          
          <Text variant="bodyMedium" style={styles.infoText}>
            💡 Pro Tips:
          </Text>
          <Text variant="bodySmall" style={styles.tipText}>
            • Be honest about your metrics - brands value authenticity
          </Text>
          <Text variant="bodySmall" style={styles.tipText}>
            • Include screenshots of your analytics if available
          </Text>
          <Text variant="bodySmall" style={styles.tipText}>
            • Mention any brand collaborations or sponsored content experience
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
};

// Campaign Understanding Step
export const renderCampaignUnderstandingStep = (
  formData: any,
  updateFormData: (data: any) => void,
  errors: any,
  campaignTitle: string,
  brandName: string
) => {
  const [selectedApproaches, setSelectedApproaches] = useState<string[]>([]);

  const contentApproaches = [
    'Behind-the-scenes content',
    'Product unboxing/reviews',
    'Lifestyle integration',
    'Tutorial/educational content',
    'User-generated content campaigns',
    'Storytelling approach',
    'Interactive content (polls, Q&A)',
    'Collaborative content with other creators'
  ];

  const toggleApproach = (approach: string) => {
    const updated = selectedApproaches.includes(approach)
      ? selectedApproaches.filter(a => a !== approach)
      : [...selectedApproaches, approach];
    
    setSelectedApproaches(updated);
    updateFormData({ uniqueApproach: updated.join(', ') });
  };

  return (
    <View style={styles.stepContent}>
      <Text variant="headlineMedium" style={styles.stepHeader}>
        Show your strategy 💡
      </Text>
      <Text variant="bodyMedium" style={styles.stepDescription}>
        Demonstrate your understanding of "{campaignTitle}" and how you'd approach it
      </Text>

      <Card style={styles.inputCard}>
        <Card.Content>
          <TextInput
            mode="outlined"
            label="Campaign Goal Understanding *"
            value={formData.campaignGoalUnderstanding}
            onChangeText={(campaignGoalUnderstanding) => 
              updateFormData({ campaignGoalUnderstanding })
            }
            placeholder={`Based on my research, ${brandName}'s main goal with this campaign is...`}
            error={!!errors.campaignGoalUnderstanding}
            style={styles.input}
            multiline
            numberOfLines={4}
            maxLength={1500}
            right={<TextInput.Affix text={`${formData.campaignGoalUnderstanding.length}/1500`} />}
          />
          {errors.campaignGoalUnderstanding && (
            <Text style={styles.errorText}>{errors.campaignGoalUnderstanding}</Text>
          )}

          <TextInput
            mode="outlined"
            label="Target Audience Match"
            value={formData.targetAudienceMatch}
            onChangeText={(targetAudienceMatch) => updateFormData({ targetAudienceMatch })}
            placeholder="My audience aligns with your target demographic because..."
            style={styles.input}
            multiline
            numberOfLines={3}
            maxLength={1000}
            right={<TextInput.Affix text={`${formData.targetAudienceMatch.length}/1000`} />}
          />

          <TextInput
            mode="outlined"
            label="Content Strategy *"
            value={formData.contentStrategy}
            onChangeText={(contentStrategy) => updateFormData({ contentStrategy })}
            placeholder="My content strategy for this campaign would include..."
            error={!!errors.contentStrategy}
            style={styles.input}
            multiline
            numberOfLines={5}
            maxLength={2000}
            right={<TextInput.Affix text={`${formData.contentStrategy.length}/2000`} />}
          />
          {errors.contentStrategy && (
            <Text style={styles.errorText}>{errors.contentStrategy}</Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.inputCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Content Approaches (Select all that apply)
          </Text>
          <View style={styles.chipContainer}>
            {contentApproaches.map((approach) => (
              <Chip
                key={approach}
                mode={selectedApproaches.includes(approach) ? 'flat' : 'outlined'}
                selected={selectedApproaches.includes(approach)}
                onPress={() => toggleApproach(approach)}
                style={[
                  styles.approachChip,
                  selectedApproaches.includes(approach) && styles.selectedChip
                ]}
              >
                {approach}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.inputCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Research & Preparation
          </Text>
          <Text variant="bodyMedium" style={styles.infoText}>
            Show that you've done your homework:
          </Text>
          <Text variant="bodySmall" style={styles.tipText}>
            • Research {brandName}'s previous campaigns and brand values
          </Text>
          <Text variant="bodySmall" style={styles.tipText}>
            • Understand their target audience and messaging
          </Text>
          <Text variant="bodySmall" style={styles.tipText}>
            • Propose specific content ideas and posting schedules
          </Text>
          <Text variant="bodySmall" style={styles.tipText}>
            • Consider how to measure campaign success
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
};

// Final Review Step
export const renderFinalReviewStep = (
  formData: any,
  updateFormData: (data: any) => void,
  errors: any,
  campaignTitle: string,
  brandName: string,
  campaignBudget: number
) => {
  return (
    <View style={styles.stepContent}>
      <Text variant="headlineMedium" style={styles.stepHeader}>
        Review & Submit 🚀
      </Text>
      <Text variant="bodyMedium" style={styles.stepDescription}>
        Final check before submitting your application to {brandName}
      </Text>

      {/* Application Summary */}
      <Card style={styles.inputCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Application Summary
          </Text>
          
          <View style={styles.summaryRow}>
            <Text variant="bodyMedium" style={styles.summaryLabel}>Campaign:</Text>
            <Text variant="bodyMedium" style={styles.summaryValue}>{campaignTitle}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text variant="bodyMedium" style={styles.summaryLabel}>Brand:</Text>
            <Text variant="bodyMedium" style={styles.summaryValue}>{brandName}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text variant="bodyMedium" style={styles.summaryLabel}>Your Rate:</Text>
            <Text variant="bodyMedium" style={styles.summaryValue}>
              ${formData.proposedRate.toLocaleString()} USD
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text variant="bodyMedium" style={styles.summaryLabel}>Portfolio Items:</Text>
            <Text variant="bodyMedium" style={styles.summaryValue}>
              {formData.portfolioImages.length} images, {formData.portfolioVideos.length} videos
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text variant="bodyMedium" style={styles.summaryLabel}>Social Platforms:</Text>
            <Text variant="bodyMedium" style={styles.summaryValue}>
              {Object.keys(formData.socialPlatforms).length} platforms
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Terms and Agreements */}
      <Card style={styles.inputCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Terms & Agreements
          </Text>

          <View style={styles.checkboxRow}>
            <Checkbox
              status={formData.hasWorkExamples ? 'checked' : 'unchecked'}
              onPress={() => updateFormData({ 
                hasWorkExamples: !formData.hasWorkExamples 
              })}
            />
            <Text variant="bodyMedium" style={styles.checkboxLabel}>
              I have provided authentic work examples and portfolio items
            </Text>
          </View>

          <View style={styles.checkboxRow}>
            <Checkbox
              status={formData.canMeetDeadlines ? 'checked' : 'unchecked'}
              onPress={() => updateFormData({ 
                canMeetDeadlines: !formData.canMeetDeadlines 
              })}
            />
            <Text variant="bodyMedium" style={styles.checkboxLabel}>
              I can meet the project deadlines and deliverables *
            </Text>
          </View>
          {errors.canMeetDeadlines && (
            <Text style={styles.errorText}>{errors.canMeetDeadlines}</Text>
          )}

          <View style={styles.checkboxRow}>
            <Checkbox
              status={formData.exclusivityAgreement ? 'checked' : 'unchecked'}
              onPress={() => updateFormData({ 
                exclusivityAgreement: !formData.exclusivityAgreement 
              })}
            />
            <Text variant="bodyMedium" style={styles.checkboxLabel}>
              I agree to exclusivity terms during the campaign period
            </Text>
          </View>

          <View style={styles.checkboxRow}>
            <Checkbox
              status={formData.agreesToTerms ? 'checked' : 'unchecked'}
              onPress={() => updateFormData({ 
                agreesToTerms: !formData.agreesToTerms 
              })}
            />
            <Text variant="bodyMedium" style={styles.checkboxLabel}>
              I agree to FobZim's Terms of Service and Privacy Policy *
            </Text>
          </View>
          {errors.agreesToTerms && (
            <Text style={styles.errorText}>{errors.agreesToTerms}</Text>
          )}
        </Card.Content>
      </Card>

      {/* Final Note */}
      <Card style={styles.inputCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            What happens next?
          </Text>
          <Text variant="bodyMedium" style={styles.infoText}>
            After submission:
          </Text>
          <Text variant="bodySmall" style={styles.tipText}>
            • {brandName} will review your application within 2-3 business days
          </Text>
          <Text variant="bodySmall" style={styles.tipText}>
            • You'll receive email notifications about status updates
          </Text>
          <Text variant="bodySmall" style={styles.tipText}>
            • If selected, you'll get contract details and next steps
          </Text>
          <Text variant="bodySmall" style={styles.tipText}>
            • You can track your application status in the "My Applications" section
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
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
  platformCard: {
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  platformHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  platformTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformName: {
    marginLeft: spacing.sm,
    color: colors.textPrimary,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  platformChip: {
    marginBottom: spacing.sm,
  },
  approachChip: {
    marginBottom: spacing.sm,
  },
  selectedChip: {
    backgroundColor: colors.primary,
  },
  infoText: {
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  tipText: {
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    marginBottom: spacing.xs,
    lineHeight: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
  },
  summaryLabel: {
    color: colors.textSecondary,
    flex: 1,
  },
  summaryValue: {
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  checkboxLabel: {
    flex: 1,
    marginLeft: spacing.sm,
    color: colors.textPrimary,
    lineHeight: 20,
  },
});