import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity,
  FlatList,
  Image
} from 'react-native';
import {
  Card,
  Text,
  Button,
  TextInput,
  Chip,
  ProgressBar,
  IconButton,
  Avatar,
  Divider,
  RadioButton,
  Checkbox,
  List
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

// Colors
const colors = {
  primary: '#2E7D32',
  secondary: '#4CAF50',
  surface: '#FFFFFF',
  background: '#F5F5F5',
  textPrimary: '#212121',
  textSecondary: '#757575',
  muted: '#BDBDBD',
  white: '#FFFFFF',
  error: '#D32F2F',
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3'
};

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  component: React.ReactNode;
}

interface CreatorOnboardingScreenProps {
  navigation?: any;
}

const categories = [
  { id: 'lifestyle', name: 'Lifestyle', icon: 'heart' },
  { id: 'food', name: 'Food & Cooking', icon: 'food' },
  { id: 'tech', name: 'Technology', icon: 'laptop' },
  { id: 'fashion', name: 'Fashion & Beauty', icon: 'tshirt-crew' },
  { id: 'music', name: 'Music & Audio', icon: 'music' },
  { id: 'travel', name: 'Travel', icon: 'airplane' },
  { id: 'fitness', name: 'Health & Fitness', icon: 'dumbbell' },
  { id: 'education', name: 'Education', icon: 'school' },
  { id: 'gaming', name: 'Gaming', icon: 'gamepad-variant' },
  { id: 'business', name: 'Business & Finance', icon: 'briefcase' },
  { id: 'art', name: 'Art & Design', icon: 'palette' },
  { id: 'comedy', name: 'Comedy & Entertainment', icon: 'drama-masks' }
];

const zimbabweLocations = [
  'Harare', 'Bulawayo', 'Gweru', 'Kwekwe', 'Kadoma', 'Masvingo', 
  'Chinhoyi', 'Marondera', 'Bindura', 'Victoria Falls', 'Hwange',
  'Mutare', 'Rusape', 'Chiredzi', 'Kariba', 'Norton'
];

const socialPlatforms = [
  { id: 'instagram', name: 'Instagram', icon: 'instagram', placeholder: '@username' },
  { id: 'tiktok', name: 'TikTok', icon: 'tiktok', placeholder: '@username' },
  { id: 'youtube', name: 'YouTube', icon: 'youtube', placeholder: 'Channel Name or URL' },
  { id: 'facebook', name: 'Facebook', icon: 'facebook', placeholder: 'Page or Profile URL' },
  { id: 'twitter', name: 'Twitter', icon: 'twitter', placeholder: '@username' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'linkedin', placeholder: 'Profile URL' }
];

const CreatorOnboardingScreen: React.FC<CreatorOnboardingScreenProps> = ({ navigation }) => {
  const { user, updateUserProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    displayName: '',
    bio: '',
    location: '',
    phone: '',
    
    // Step 2: Creator Category
    category: '',
    subcategories: [] as string[],
    
    // Step 3: Content Details
    contentTypes: [] as string[],
    targetAudience: '',
    contentLanguages: [] as string[],
    postingFrequency: '',
    
    // Step 4: Social Media
    socialLinks: {} as Record<string, string>,
    followerRanges: {} as Record<string, string>,
    
    // Step 5: Rates & Preferences
    rates: {
      post: '',
      story: '',
      video: ''
    },
    collaborationTypes: [] as string[],
    preferredBrands: [] as string[],
    
    // Step 6: Verification
    idDocument: null,
    portfolioItems: [] as string[],
    businessRegistration: false,
    taxCompliant: false
  });

  const totalSteps = 6;
  const progress = currentStep / totalSteps;

  const updateFormData = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [currentStep, totalSteps]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [currentStep]);

  const handleSubmit = useCallback(async () => {
    try {
      // Here we would normally submit to Firebase
      // For now, we'll just update the user profile to mark them as a creator
      await updateUserProfile({
        isCreator: true,
        displayName: formData.displayName || user?.displayName,
        bio: formData.bio,
        location: formData.location,
        phone: formData.phone
      });

      Alert.alert(
        'Application Submitted! 🎉',
        'Your creator application has been submitted successfully. Our team will review your application and get back to you within 2-3 business days.',
        [
          {
            text: 'Continue',
            onPress: () => navigation?.goBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    }
  }, [formData, user, updateUserProfile, navigation]);

  const renderPersonalInfoStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Personal Information</Text>
      <Text style={styles.stepDescription}>
        Tell us about yourself to get started
      </Text>

      <TextInput
        label="Display Name"
        value={formData.displayName}
        onChangeText={(text) => updateFormData('displayName', text)}
        style={styles.input}
        mode="outlined"
        placeholder="How should creators know you?"
      />

      <TextInput
        label="Bio"
        value={formData.bio}
        onChangeText={(text) => updateFormData('bio', text)}
        style={styles.input}
        mode="outlined"
        multiline
        numberOfLines={4}
        placeholder="Tell your story in a few sentences..."
      />

      <TextInput
        label="Location"
        value={formData.location}
        onChangeText={(text) => updateFormData('location', text)}
        style={styles.input}
        mode="outlined"
        placeholder="Where are you based?"
        right={
          <TextInput.Icon
            icon="chevron-down"
            onPress={() => {/* TODO: Show location picker */}}
          />
        }
      />

      <TextInput
        label="Phone Number"
        value={formData.phone}
        onChangeText={(text) => updateFormData('phone', text)}
        style={styles.input}
        mode="outlined"
        keyboardType="phone-pad"
        placeholder="+263..."
      />
    </View>
  );

  const renderCategoryStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Content Category</Text>
      <Text style={styles.stepDescription}>
        What type of content do you create?
      </Text>

      <View style={styles.categoriesGrid}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryCard,
              formData.category === category.id && styles.selectedCategoryCard
            ]}
            onPress={() => updateFormData('category', category.id)}
          >
            <MaterialCommunityIcons
              name={category.icon as any}
              size={32}
              color={formData.category === category.id ? colors.white : colors.primary}
            />
            <Text style={[
              styles.categoryText,
              formData.category === category.id && styles.selectedCategoryText
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {formData.category && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content Languages</Text>
          <View style={styles.chipContainer}>
            {['English', 'Shona', 'Ndebele'].map((language) => (
              <Chip
                key={language}
                selected={formData.contentLanguages.includes(language)}
                onPress={() => {
                  const languages = formData.contentLanguages.includes(language)
                    ? formData.contentLanguages.filter(l => l !== language)
                    : [...formData.contentLanguages, language];
                  updateFormData('contentLanguages', languages);
                }}
                style={styles.chip}
              >
                {language}
              </Chip>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const renderContentDetailsStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Content Details</Text>
      <Text style={styles.stepDescription}>
        Help us understand your content style
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Content Types</Text>
        <View style={styles.chipContainer}>
          {['Photos', 'Videos', 'Stories', 'Reels', 'Live Streams', 'Tutorials', 'Reviews'].map((type) => (
            <Chip
              key={type}
              selected={formData.contentTypes.includes(type)}
              onPress={() => {
                const types = formData.contentTypes.includes(type)
                  ? formData.contentTypes.filter(t => t !== type)
                  : [...formData.contentTypes, type];
                updateFormData('contentTypes', types);
              }}
              style={styles.chip}
            >
              {type}
            </Chip>
          ))}
        </View>
      </View>

      <TextInput
        label="Target Audience"
        value={formData.targetAudience}
        onChangeText={(text) => updateFormData('targetAudience', text)}
        style={styles.input}
        mode="outlined"
        placeholder="e.g., Young professionals in Zimbabwe"
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Posting Frequency</Text>
        <RadioButton.Group
          onValueChange={(value) => updateFormData('postingFrequency', value)}
          value={formData.postingFrequency}
        >
          {[
            { label: 'Daily', value: 'daily' },
            { label: '3-5 times per week', value: '3-5' },
            { label: '1-2 times per week', value: '1-2' },
            { label: 'Few times per month', value: 'monthly' }
          ].map((option) => (
            <View key={option.value} style={styles.radioOption}>
              <RadioButton value={option.value} />
              <Text style={styles.radioLabel}>{option.label}</Text>
            </View>
          ))}
        </RadioButton.Group>
      </View>
    </View>
  );

  const renderSocialMediaStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Social Media Presence</Text>
      <Text style={styles.stepDescription}>
        Connect your social media accounts
      </Text>

      {socialPlatforms.map((platform) => (
        <View key={platform.id} style={styles.socialPlatform}>
          <View style={styles.socialPlatformHeader}>
            <MaterialCommunityIcons
              name={platform.icon as any}
              size={24}
              color={colors.primary}
            />
            <Text style={styles.socialPlatformName}>{platform.name}</Text>
          </View>
          
          <TextInput
            label="Username/Handle"
            value={formData.socialLinks[platform.id] || ''}
            onChangeText={(text) => updateFormData('socialLinks', {
              ...formData.socialLinks,
              [platform.id]: text
            })}
            style={styles.socialInput}
            mode="outlined"
            placeholder={platform.placeholder}
            dense
          />

          <View style={styles.followerRangeContainer}>
            <Text style={styles.followerRangeLabel}>Follower Count:</Text>
            <View style={styles.chipContainer}>
              {['<1K', '1K-5K', '5K-10K', '10K-50K', '50K+'].map((range) => (
                <Chip
                  key={range}
                  selected={formData.followerRanges[platform.id] === range}
                  onPress={() => updateFormData('followerRanges', {
                    ...formData.followerRanges,
                    [platform.id]: range
                  })}
                  style={[styles.chip, styles.smallChip]}
                >
                  {range}
                </Chip>
              ))}
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderRatesStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Collaboration Rates</Text>
      <Text style={styles.stepDescription}>
        Set your preferred rates (in USD)
      </Text>

      <View style={styles.ratesContainer}>
        <TextInput
          label="Post Rate"
          value={formData.rates.post}
          onChangeText={(text) => updateFormData('rates', {
            ...formData.rates,
            post: text
          })}
          style={styles.rateInput}
          mode="outlined"
          keyboardType="numeric"
          left={<TextInput.Icon icon="currency-usd" />}
          placeholder="50"
        />

        <TextInput
          label="Story Rate"
          value={formData.rates.story}
          onChangeText={(text) => updateFormData('rates', {
            ...formData.rates,
            story: text
          })}
          style={styles.rateInput}
          mode="outlined"
          keyboardType="numeric"
          left={<TextInput.Icon icon="currency-usd" />}
          placeholder="20"
        />

        <TextInput
          label="Video Rate"
          value={formData.rates.video}
          onChangeText={(text) => updateFormData('rates', {
            ...formData.rates,
            video: text
          })}
          style={styles.rateInput}
          mode="outlined"
          keyboardType="numeric"
          left={<TextInput.Icon icon="currency-usd" />}
          placeholder="100"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Collaboration Types</Text>
        <View style={styles.chipContainer}>
          {['Sponsored Posts', 'Product Reviews', 'Brand Ambassador', 'Event Coverage', 'Giveaways'].map((type) => (
            <Chip
              key={type}
              selected={formData.collaborationTypes.includes(type)}
              onPress={() => {
                const types = formData.collaborationTypes.includes(type)
                  ? formData.collaborationTypes.filter(t => t !== type)
                  : [...formData.collaborationTypes, type];
                updateFormData('collaborationTypes', types);
              }}
              style={styles.chip}
            >
              {type}
            </Chip>
          ))}
        </View>
      </View>
    </View>
  );

  const renderVerificationStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Verification & Documents</Text>
      <Text style={styles.stepDescription}>
        Help us verify your identity and credentials
      </Text>

      <Card style={styles.uploadCard}>
        <Card.Content>
          <View style={styles.uploadSection}>
            <MaterialCommunityIcons name="id-card" size={48} color={colors.muted} />
            <Text style={styles.uploadTitle}>Identity Document</Text>
            <Text style={styles.uploadDescription}>
              Upload a copy of your national ID or passport
            </Text>
            <Button 
              mode="outlined" 
              icon="camera"
              onPress={() => {/* TODO: Implement image picker */}}
            >
              Upload Document
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.uploadCard}>
        <Card.Content>
          <View style={styles.uploadSection}>
            <MaterialCommunityIcons name="image-multiple" size={48} color={colors.muted} />
            <Text style={styles.uploadTitle}>Portfolio Samples</Text>
            <Text style={styles.uploadDescription}>
              Upload 3-5 examples of your best content
            </Text>
            <Button 
              mode="outlined" 
              icon="image-plus"
              onPress={() => {/* TODO: Implement image picker */}}
            >
              Add Portfolio Items
            </Button>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.checkboxSection}>
        <View style={styles.checkboxRow}>
          <Checkbox
            status={formData.businessRegistration ? 'checked' : 'unchecked'}
            onPress={() => updateFormData('businessRegistration', !formData.businessRegistration)}
          />
          <Text style={styles.checkboxText}>
            I have a registered business (optional)
          </Text>
        </View>

        <View style={styles.checkboxRow}>
          <Checkbox
            status={formData.taxCompliant ? 'checked' : 'unchecked'}
            onPress={() => updateFormData('taxCompliant', !formData.taxCompliant)}
          />
          <Text style={styles.checkboxText}>
            I am tax compliant and understand my obligations
          </Text>
        </View>
      </View>

      <Card style={styles.infoCard}>
        <Card.Content>
          <View style={styles.infoHeader}>
            <MaterialCommunityIcons name="information" size={24} color={colors.info} />
            <Text style={styles.infoTitle}>What happens next?</Text>
          </View>
          <Text style={styles.infoText}>
            • Our team will review your application within 2-3 business days{'\n'}
            • You'll receive an email notification about the status{'\n'}
            • Once approved, you can start applying to campaigns{'\n'}
            • Our support team is here to help you get started
          </Text>
        </Card.Content>
      </Card>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderPersonalInfoStep();
      case 2:
        return renderCategoryStep();
      case 3:
        return renderContentDetailsStep();
      case 4:
        return renderSocialMediaStep();
      case 5:
        return renderRatesStep();
      case 6:
        return renderVerificationStep();
      default:
        return renderPersonalInfoStep();
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.displayName.trim() && formData.bio.trim() && formData.location.trim();
      case 2:
        return formData.category && formData.contentLanguages.length > 0;
      case 3:
        return formData.contentTypes.length > 0 && formData.postingFrequency;
      case 4:
        return Object.values(formData.socialLinks).some(link => link.trim() !== '');
      case 5:
        return formData.rates.post || formData.rates.story || formData.rates.video;
      case 6:
        return formData.taxCompliant;
      default:
        return false;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <IconButton
            icon="arrow-left"
            onPress={() => {
              if (currentStep > 1) {
                prevStep();
              } else {
                navigation?.goBack();
              }
            }}
          />
          <Text style={styles.headerTitle}>Become a Creator</Text>
          <View style={styles.headerRight}>
            <Text style={styles.stepIndicator}>
              {currentStep}/{totalSteps}
            </Text>
          </View>
        </View>
        
        <ProgressBar progress={progress} color={colors.primary} style={styles.progressBar} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {renderCurrentStep()}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerButtons}>
          {currentStep > 1 && (
            <Button
              mode="outlined"
              onPress={prevStep}
              style={styles.footerButton}
              contentStyle={styles.buttonContent}
            >
              Previous
            </Button>
          )}
          
          <Button
            mode="contained"
            onPress={currentStep === totalSteps ? handleSubmit : nextStep}
            style={[styles.footerButton, styles.primaryButton]}
            contentStyle={styles.buttonContent}
            disabled={!isStepValid()}
          >
            {currentStep === totalSteps ? 'Submit Application' : 'Next'}
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.white,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  headerRight: {
    minWidth: 48,
    alignItems: 'flex-end',
  },
  stepIndicator: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  progressBar: {
    margin: 16,
    height: 4,
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  stepContainer: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  input: {
    marginBottom: 16,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryCard: {
    width: (width - 60) / 2,
    aspectRatio: 1.2,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.muted + '40',
  },
  selectedCategoryCard: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    color: colors.textPrimary,
  },
  selectedCategoryText: {
    color: colors.white,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginRight: 0,
    marginBottom: 0,
  },
  smallChip: {
    height: 28,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioLabel: {
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 8,
  },
  socialPlatform: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
  },
  socialPlatformHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  socialPlatformName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 8,
  },
  socialInput: {
    marginBottom: 12,
  },
  followerRangeContainer: {
    marginTop: 8,
  },
  followerRangeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  ratesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  rateInput: {
    flex: 1,
  },
  uploadCard: {
    marginBottom: 16,
    elevation: 1,
  },
  uploadSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 12,
    marginBottom: 4,
  },
  uploadDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  checkboxSection: {
    marginVertical: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkboxText: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: colors.info + '10',
    borderColor: colors.info + '40',
    borderWidth: 1,
    marginTop: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    backgroundColor: colors.white,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default CreatorOnboardingScreen;