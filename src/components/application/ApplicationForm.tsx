import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  Modal,
  Portal,
  Text,
  Button,
  Card,
  TextInput,
  IconButton,
  Surface,
  Divider,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ImagePickerComponent from '../form/ImagePicker';
import { CampaignApplication, Portfolio } from '../../types/campaign';

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

interface ApplicationFormProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (application: Omit<CampaignApplication, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  campaignId: string;
  campaignTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhoto?: string;
}

interface FormData {
  message: string;
  experience: string;
  whyYou: string;
  availability: string;
  expectedDelivery: string;
  portfolio: Portfolio[];
  socialLinks: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    twitter?: string;
    website?: string;
  };
  agreeToTerms: boolean;
}

interface FormErrors {
  message?: string;
  experience?: string;
  whyYou?: string;
  availability?: string;
  expectedDelivery?: string;
  portfolio?: string;
  agreeToTerms?: string;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({
  visible,
  onDismiss,
  onSubmit,
  campaignId,
  campaignTitle,
  userId,
  userName,
  userEmail,
  userPhoto,
}) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormData>({
    message: '',
    experience: '',
    whyYou: '',
    availability: '',
    expectedDelivery: '',
    portfolio: [],
    socialLinks: {},
    agreeToTerms: false,
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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.message.trim()) {
      newErrors.message = 'Cover letter is required';
    } else if (formData.message.length < 50) {
      newErrors.message = 'Cover letter must be at least 50 characters';
    }

    if (!formData.experience.trim()) {
      newErrors.experience = 'Experience description is required';
    } else if (formData.experience.length < 30) {
      newErrors.experience = 'Experience description must be at least 30 characters';
    }

    if (!formData.whyYou.trim()) {
      newErrors.whyYou = 'Please explain why you\'re a good fit';
    } else if (formData.whyYou.length < 30) {
      newErrors.whyYou = 'Explanation must be at least 30 characters';
    }

    if (!formData.availability.trim()) {
      newErrors.availability = 'Availability information is required';
    }

    if (!formData.expectedDelivery.trim()) {
      newErrors.expectedDelivery = 'Expected delivery timeline is required';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const application: Omit<CampaignApplication, 'id' | 'createdAt' | 'updatedAt'> = {
        campaignId,
        creatorId: userId,
        creatorName: userName,
        creatorEmail: userEmail,
        creatorPhoto: userPhoto,
        status: 'pending',
        message: formData.message,
        experience: formData.experience,
        whyYou: formData.whyYou,
        availability: formData.availability,
        expectedDelivery: formData.expectedDelivery,
        portfolio: formData.portfolio,
        socialLinks: formData.socialLinks,
      };

      await onSubmit(application);
      
      // Reset form
      setFormData({
        message: '',
        experience: '',
        whyYou: '',
        availability: '',
        expectedDelivery: '',
        portfolio: [],
        socialLinks: {},
        agreeToTerms: false,
      });
      setErrors({});
      onDismiss();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addPortfolioItem = () => {
    const newItem: Portfolio = {
      id: Date.now().toString(),
      type: 'image',
      title: '',
      description: '',
      url: '',
      thumbnailUrl: '',
    };
    
    updateFormData({
      portfolio: [...formData.portfolio, newItem]
    });
  };

  const updatePortfolioItem = (index: number, item: Portfolio) => {
    const newPortfolio = [...formData.portfolio];
    newPortfolio[index] = item;
    updateFormData({ portfolio: newPortfolio });
  };

  const removePortfolioItem = (index: number) => {
    updateFormData({
      portfolio: formData.portfolio.filter((_, i) => i !== index)
    });
  };

  const updateSocialLink = (platform: keyof FormData['socialLinks'], value: string) => {
    updateFormData({
      socialLinks: {
        ...formData.socialLinks,
        [platform]: value.trim() || undefined,
      }
    });
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Card style={styles.formCard}>
            {/* Header */}
            <Surface style={styles.header} elevation={2}>
              <View style={styles.headerContent}>
                <View style={styles.headerText}>
                  <Text variant="headlineSmall" style={styles.headerTitle}>
                    Apply to Campaign
                  </Text>
                  <Text variant="bodyMedium" style={styles.headerSubtitle}>
                    {campaignTitle}
                  </Text>
                </View>
                <IconButton
                  icon="close"
                  onPress={onDismiss}
                  style={styles.closeButton}
                />
              </View>
            </Surface>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Cover Letter */}
              <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Cover Letter *
                </Text>
                <Text variant="bodySmall" style={styles.sectionSubtitle}>
                  Introduce yourself and explain your interest in this campaign
                </Text>
                
                <TextInput
                  mode="outlined"
                  placeholder="Dear Campaign Creator,..."
                  value={formData.message}
                  onChangeText={(message) => updateFormData({ message })}
                  error={!!errors.message}
                  style={styles.input}
                  multiline
                  numberOfLines={6}
                  maxLength={1000}
                  right={<TextInput.Affix text={`${formData.message.length}/1000`} />}
                />
                {errors.message && (
                  <Text style={styles.errorText}>{errors.message}</Text>
                )}
              </View>

              <Divider style={styles.divider} />

              {/* Experience */}
              <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Relevant Experience *
                </Text>
                <Text variant="bodySmall" style={styles.sectionSubtitle}>
                  Describe your relevant skills and past projects
                </Text>
                
                <TextInput
                  mode="outlined"
                  placeholder="I have experience in..."
                  value={formData.experience}
                  onChangeText={(experience) => updateFormData({ experience })}
                  error={!!errors.experience}
                  style={styles.input}
                  multiline
                  numberOfLines={4}
                  maxLength={800}
                  right={<TextInput.Affix text={`${formData.experience.length}/800`} />}
                />
                {errors.experience && (
                  <Text style={styles.errorText}>{errors.experience}</Text>
                )}
              </View>

              <Divider style={styles.divider} />

              {/* Why You */}
              <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Why You? *
                </Text>
                <Text variant="bodySmall" style={styles.sectionSubtitle}>
                  What makes you the perfect fit for this campaign?
                </Text>
                
                <TextInput
                  mode="outlined"
                  placeholder="I'm the perfect fit because..."
                  value={formData.whyYou}
                  onChangeText={(whyYou) => updateFormData({ whyYou })}
                  error={!!errors.whyYou}
                  style={styles.input}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                  right={<TextInput.Affix text={`${formData.whyYou.length}/500`} />}
                />
                {errors.whyYou && (
                  <Text style={styles.errorText}>{errors.whyYou}</Text>
                )}
              </View>

              <Divider style={styles.divider} />

              {/* Timeline */}
              <View style={styles.section}>
                <View style={styles.timelineRow}>
                  <View style={styles.timelineField}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                      Availability *
                    </Text>
                    <Text variant="bodySmall" style={styles.sectionSubtitle}>
                      When can you start?
                    </Text>
                    
                    <TextInput
                      mode="outlined"
                      placeholder="Immediately / Next week / etc."
                      value={formData.availability}
                      onChangeText={(availability) => updateFormData({ availability })}
                      error={!!errors.availability}
                      style={styles.input}
                    />
                    {errors.availability && (
                      <Text style={styles.errorText}>{errors.availability}</Text>
                    )}
                  </View>

                  <View style={styles.timelineField}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                      Delivery Time *
                    </Text>
                    <Text variant="bodySmall" style={styles.sectionSubtitle}>
                      Expected completion
                    </Text>
                    
                    <TextInput
                      mode="outlined"
                      placeholder="1 week / 2-3 weeks / etc."
                      value={formData.expectedDelivery}
                      onChangeText={(expectedDelivery) => updateFormData({ expectedDelivery })}
                      error={!!errors.expectedDelivery}
                      style={styles.input}
                    />
                    {errors.expectedDelivery && (
                      <Text style={styles.errorText}>{errors.expectedDelivery}</Text>
                    )}
                  </View>
                </View>
              </View>

              <Divider style={styles.divider} />

              {/* Portfolio */}
              <View style={styles.section}>
                <View style={styles.portfolioHeader}>
                  <View>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                      Portfolio Samples
                    </Text>
                    <Text variant="bodySmall" style={styles.sectionSubtitle}>
                      Show your best work (optional but recommended)
                    </Text>
                  </View>
                  <Button
                    mode="outlined"
                    icon="plus"
                    onPress={addPortfolioItem}
                    compact
                  >
                    Add Item
                  </Button>
                </View>

                {formData.portfolio.map((item, index) => (
                  <Card key={item.id} style={styles.portfolioCard} mode="outlined">
                    <Card.Content>
                      <View style={styles.portfolioItemHeader}>
                        <Text variant="titleSmall">Portfolio Item {index + 1}</Text>
                        <IconButton
                          icon="close"
                          size={16}
                          onPress={() => removePortfolioItem(index)}
                        />
                      </View>
                      
                      <TextInput
                        mode="outlined"
                        label="Title"
                        value={item.title}
                        onChangeText={(title) => 
                          updatePortfolioItem(index, { ...item, title })
                        }
                        placeholder="Project or work title"
                        style={styles.portfolioInput}
                      />
                      
                      <TextInput
                        mode="outlined"
                        label="Description"
                        value={item.description}
                        onChangeText={(description) => 
                          updatePortfolioItem(index, { ...item, description })
                        }
                        placeholder="Brief description of the work"
                        style={styles.portfolioInput}
                        multiline
                        numberOfLines={2}
                      />
                      
                      <TextInput
                        mode="outlined"
                        label="URL (optional)"
                        value={item.url}
                        onChangeText={(url) => 
                          updatePortfolioItem(index, { ...item, url })
                        }
                        placeholder="Link to your work"
                        style={styles.portfolioInput}
                        keyboardType="url"
                      />
                    </Card.Content>
                  </Card>
                ))}

                {errors.portfolio && (
                  <Text style={styles.errorText}>{errors.portfolio}</Text>
                )}
              </View>

              <Divider style={styles.divider} />

              {/* Social Links */}
              <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Social Media Links (Optional)
                </Text>
                <Text variant="bodySmall" style={styles.sectionSubtitle}>
                  Help the creator see your online presence
                </Text>

                <View style={styles.socialLinksGrid}>
                  <View style={styles.socialLinkField}>
                    <TextInput
                      mode="outlined"
                      label="Instagram"
                      value={formData.socialLinks.instagram || ''}
                      onChangeText={(value) => updateSocialLink('instagram', value)}
                      placeholder="@username"
                      style={styles.socialInput}
                      left={<TextInput.Icon icon="instagram" />}
                    />
                  </View>

                  <View style={styles.socialLinkField}>
                    <TextInput
                      mode="outlined"
                      label="TikTok"
                      value={formData.socialLinks.tiktok || ''}
                      onChangeText={(value) => updateSocialLink('tiktok', value)}
                      placeholder="@username"
                      style={styles.socialInput}
                      left={<TextInput.Icon icon="music-note" />}
                    />
                  </View>

                  <View style={styles.socialLinkField}>
                    <TextInput
                      mode="outlined"
                      label="YouTube"
                      value={formData.socialLinks.youtube || ''}
                      onChangeText={(value) => updateSocialLink('youtube', value)}
                      placeholder="Channel URL"
                      style={styles.socialInput}
                      left={<TextInput.Icon icon="youtube" />}
                    />
                  </View>

                  <View style={styles.socialLinkField}>
                    <TextInput
                      mode="outlined"
                      label="Website"
                      value={formData.socialLinks.website || ''}
                      onChangeText={(value) => updateSocialLink('website', value)}
                      placeholder="your-website.com"
                      style={styles.socialInput}
                      left={<TextInput.Icon icon="web" />}
                    />
                  </View>
                </View>
              </View>

              <Divider style={styles.divider} />

              {/* Terms Agreement */}
              <View style={styles.section}>
                <Surface style={styles.termsContainer} elevation={0}>
                  <View style={styles.termsRow}>
                    <IconButton
                      icon={formData.agreeToTerms ? "checkbox-marked" : "checkbox-blank-outline"}
                      onPress={() => updateFormData({ agreeToTerms: !formData.agreeToTerms })}
                      iconColor={formData.agreeToTerms ? colors.primary : colors.muted}
                    />
                    <View style={styles.termsText}>
                      <Text variant="bodyMedium" style={styles.termsLabel}>
                        I agree to the campaign terms and conditions
                      </Text>
                      <Text variant="bodySmall" style={styles.termsSubtext}>
                        By applying, you agree to deliver quality work according to the campaign requirements.
                      </Text>
                    </View>
                  </View>
                  {errors.agreeToTerms && (
                    <Text style={[styles.errorText, styles.termsError]}>{errors.agreeToTerms}</Text>
                  )}
                </Surface>
              </View>
            </ScrollView>

            {/* Submit Button */}
            <Surface style={styles.footer} elevation={4}>
              <View style={styles.footerButtons}>
                <Button
                  mode="outlined"
                  onPress={onDismiss}
                  style={styles.cancelButton}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={loading}
                  style={styles.submitButton}
                  buttonColor={colors.primary}
                  icon="send"
                >
                  Submit Application
                </Button>
              </View>
            </Surface>
          </Card>
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  keyboardAvoid: {
    flex: 1,
    maxHeight: '90%',
  },
  formCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    color: colors.white,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: colors.white,
    opacity: 0.9,
    marginTop: 4,
  },
  closeButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  divider: {
    marginVertical: 8,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineField: {
    flex: 1,
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  portfolioCard: {
    marginBottom: 16,
    borderColor: colors.primary,
  },
  portfolioItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  portfolioInput: {
    marginBottom: 12,
  },
  socialLinksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  socialLinkField: {
    flex: 1,
    minWidth: '45%',
  },
  socialInput: {
    marginBottom: 8,
  },
  termsContainer: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  termsText: {
    flex: 1,
    marginLeft: 8,
  },
  termsLabel: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
  termsSubtext: {
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  termsError: {
    marginTop: 8,
    marginLeft: 48,
  },
  footer: {
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.background,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderColor: colors.muted,
  },
  submitButton: {
    flex: 2,
  },
});

export default ApplicationForm;