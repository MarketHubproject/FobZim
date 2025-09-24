import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
  ScrollView,
  TextInput as RNTextInput,
} from 'react-native';
import {
  Card,
  Button,
  Appbar,
  Chip,
  Avatar,
  Badge,
  Searchbar,
  FAB,
  Modal,
  Portal,
  Divider,
  TextInput,
  RadioButton,
  Checkbox,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const colors = {
  primary: '#2E7D32',
  secondary: '#4CAF50',
  surface: '#FFFFFF',
  background: '#F5F5F5',
  textPrimary: '#212121',
  textSecondary: '#757575',
  muted: '#BDBDBD',
  white: '#FFFFFF',
  border: '#E5E7EB',
  success: '#00C853',
  warning: '#FF9800',
  error: '#F44336',
  accent: '#1976D2',
  gold: '#FFD700',
};

// Mock campaigns data
const mockCampaigns = [
  {
    id: '1',
    title: 'Zimbabwe Tourism Campaign',
    brand: 'Zimbabwe Tourism Authority',
    category: 'Travel',
    description: 'Showcase the beauty of Zimbabwe through engaging travel content. We\'re looking for content creators to highlight our amazing destinations, from Victoria Falls to the Eastern Highlands.',
    budget: { min: 400, max: 600, currency: 'USD' },
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    duration: '2 weeks',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
    logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100',
    applicants: 24,
    maxApplicants: 30,
    isFeatured: true,
    isUrgent: false,
    status: 'active',
    requirements: {
      minFollowers: 5000,
      location: 'Zimbabwe',
      categories: ['Travel', 'Lifestyle'],
      age: '18+',
      languages: ['English'],
    },
    deliverables: [
      '3 Instagram posts showcasing different destinations',
      '5 Instagram stories during the trip',
      '1 YouTube video (minimum 5 minutes)',
      'Cross-platform promotion using #VisitZimbabwe',
    ],
    compensation: {
      type: 'monetary',
      amount: 500,
      additional: ['Free accommodation', 'Transportation covered', 'Meals included'],
    },
    brandInfo: {
      name: 'Zimbabwe Tourism Authority',
      description: 'Official tourism promotion body of Zimbabwe',
      website: 'www.zimbabwetourism.net',
      verified: true,
    },
    tags: ['travel', 'zimbabwe', 'tourism', 'adventure', 'nature'],
    difficulty: 'intermediate',
    responseRate: '95%',
    averageRating: 4.8,
  },
  {
    id: '2',
    title: 'Sustainable Fashion Showcase',
    brand: 'EcoStyle Zimbabwe',
    category: 'Fashion',
    description: 'Promote sustainable fashion practices and showcase eco-friendly clothing brands from Zimbabwe. Perfect for fashion influencers passionate about environmental sustainability.',
    budget: { min: 200, max: 400, currency: 'USD' },
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    duration: '1 week',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
    logo: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=100',
    applicants: 18,
    maxApplicants: 20,
    isFeatured: false,
    isUrgent: true,
    status: 'active',
    requirements: {
      minFollowers: 2000,
      location: 'Any',
      categories: ['Fashion', 'Lifestyle'],
      age: '18+',
      languages: ['English'],
    },
    deliverables: [
      '4 fashion posts featuring sustainable clothing',
      '10 Instagram stories showing styling process',
      'Blog post about sustainable fashion (optional)',
      'Use hashtags #SustainableFashionZW #EcoStyle',
    ],
    compensation: {
      type: 'mixed',
      amount: 300,
      additional: ['Free clothing worth $200', 'Collaboration certificate'],
    },
    brandInfo: {
      name: 'EcoStyle Zimbabwe',
      description: 'Leading sustainable fashion brand in Zimbabwe',
      website: 'www.ecostyle.co.zw',
      verified: false,
    },
    tags: ['fashion', 'sustainable', 'eco-friendly', 'zimbabwe', 'lifestyle'],
    difficulty: 'beginner',
    responseRate: '87%',
    averageRating: 4.3,
  },
  {
    id: '3',
    title: 'Local Food & Culture Campaign',
    brand: 'Taste of Zimbabwe',
    category: 'Food',
    description: 'Celebrate Zimbabwean cuisine and food culture through engaging content. Show the world the rich culinary heritage of Zimbabwe and modern food innovations.',
    budget: { min: 250, max: 450, currency: 'USD' },
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    duration: '10 days',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
    logo: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=100',
    applicants: 12,
    maxApplicants: 25,
    isFeatured: true,
    isUrgent: false,
    status: 'active',
    requirements: {
      minFollowers: 3000,
      location: 'Zimbabwe preferred',
      categories: ['Food', 'Lifestyle', 'Culture'],
      age: '21+',
      languages: ['English', 'Shona'],
    },
    deliverables: [
      '6 food posts with traditional recipes',
      '8 cooking process stories',
      '2 TikTok videos showing food preparation',
      'Cultural context explanations for each dish',
    ],
    compensation: {
      type: 'monetary',
      amount: 350,
      additional: ['Restaurant vouchers worth $100', 'Recipe booklet'],
    },
    brandInfo: {
      name: 'Taste of Zimbabwe',
      description: 'Promoting Zimbabwean culinary culture globally',
      website: 'www.tasteofzimbabwe.com',
      verified: true,
    },
    tags: ['food', 'culture', 'traditional', 'zimbabwe', 'recipes'],
    difficulty: 'intermediate',
    responseRate: '92%',
    averageRating: 4.6,
  },
  {
    id: '4',
    title: 'Tech Innovation Spotlight',
    brand: 'ZimTech Hub',
    category: 'Technology',
    description: 'Showcase Zimbabwe\'s growing tech ecosystem. Highlight innovative startups, tech solutions, and digital transformation stories from Zimbabwe.',
    budget: { min: 300, max: 500, currency: 'USD' },
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    duration: '3 weeks',
    image: 'https://images.unsplash.com/photo-1518707711-e8327e0f7fcd?w=800',
    logo: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=100',
    applicants: 8,
    maxApplicants: 15,
    isFeatured: false,
    isUrgent: false,
    status: 'active',
    requirements: {
      minFollowers: 1000,
      location: 'Any',
      categories: ['Technology', 'Business', 'Innovation'],
      age: '18+',
      languages: ['English'],
    },
    deliverables: [
      '5 posts about tech startups in Zimbabwe',
      '3 LinkedIn articles about tech innovation',
      '2 podcast interviews with tech leaders',
      'Use hashtags #ZimTechHub #TechInnovationZW',
    ],
    compensation: {
      type: 'monetary',
      amount: 400,
      additional: ['Tech conference tickets', 'Networking opportunities'],
    },
    brandInfo: {
      name: 'ZimTech Hub',
      description: 'Leading technology incubator in Zimbabwe',
      website: 'www.zimtechhub.co.zw',
      verified: true,
    },
    tags: ['technology', 'innovation', 'startups', 'zimbabwe', 'business'],
    difficulty: 'advanced',
    responseRate: '89%',
    averageRating: 4.7,
  },
  {
    id: '5',
    title: 'Health & Wellness Campaign',
    brand: 'Wellness Zimbabwe',
    category: 'Health',
    description: 'Promote health and wellness awareness in Zimbabwe. Focus on mental health, fitness, nutrition, and overall wellbeing for young Zimbabweans.',
    budget: { min: 180, max: 350, currency: 'USD' },
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    duration: '2 weeks',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    logo: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=100',
    applicants: 15,
    maxApplicants: 30,
    isFeatured: false,
    isUrgent: false,
    status: 'active',
    requirements: {
      minFollowers: 2500,
      location: 'Zimbabwe',
      categories: ['Health', 'Fitness', 'Lifestyle'],
      age: '21+',
      languages: ['English', 'Shona', 'Ndebele'],
    },
    deliverables: [
      '4 wellness tips posts',
      '6 workout/exercise stories',
      '2 mental health awareness posts',
      'Weekly wellness check-in posts',
    ],
    compensation: {
      type: 'mixed',
      amount: 250,
      additional: ['Wellness products worth $150', 'Gym membership discount'],
    },
    brandInfo: {
      name: 'Wellness Zimbabwe',
      description: 'Promoting healthy living across Zimbabwe',
      website: 'www.wellnesszw.org',
      verified: false,
    },
    tags: ['health', 'wellness', 'fitness', 'mental-health', 'zimbabwe'],
    difficulty: 'beginner',
    responseRate: '94%',
    averageRating: 4.5,
  },
];

const categories = ['All', 'Travel', 'Fashion', 'Food', 'Technology', 'Health', 'Lifestyle', 'Business'];
const sortOptions = [
  { label: 'Most Recent', value: 'recent' },
  { label: 'Highest Budget', value: 'budget' },
  { label: 'Ending Soon', value: 'deadline' },
  { label: 'Most Popular', value: 'popular' },
];

const difficultyLevels = ['All', 'beginner', 'intermediate', 'advanced'];

interface Campaign {
  id: string;
  title: string;
  brand: string;
  category: string;
  description: string;
  budget: { min: number; max: number; currency: string };
  deadline: Date;
  duration: string;
  image: string;
  logo: string;
  applicants: number;
  maxApplicants: number;
  isFeatured: boolean;
  isUrgent: boolean;
  status: string;
  requirements: {
    minFollowers: number;
    location: string;
    categories: string[];
    age: string;
    languages: string[];
  };
  deliverables: string[];
  compensation: {
    type: string;
    amount: number;
    additional: string[];
  };
  brandInfo: {
    name: string;
    description: string;
    website: string;
    verified: boolean;
  };
  tags: string[];
  difficulty: string;
  responseRate: string;
  averageRating: number;
}

interface ApplicationData {
  message: string;
  experience: string;
  whyYou: string;
  availability: string;
  expectedDelivery: string;
  portfolio: string[];
  socialLinks: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    website?: string;
  };
}

export default function EnhancedCampaignsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'list'
  const [savedCampaigns, setSavedCampaigns] = useState<string[]>([]);
  const [appliedCampaigns, setAppliedCampaigns] = useState<string[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [applicationModalVisible, setApplicationModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Application form state
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    message: '',
    experience: '',
    whyYou: '',
    availability: 'Immediately',
    expectedDelivery: '1 week',
    portfolio: [],
    socialLinks: {},
  });

  // Filter and sort campaigns
  const filteredCampaigns = useMemo(() => {
    let filtered = mockCampaigns;

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(campaign => campaign.category === selectedCategory);
    }

    // Apply difficulty filter
    if (selectedDifficulty !== 'All') {
      filtered = filtered.filter(campaign => campaign.difficulty === selectedDifficulty);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(campaign =>
        campaign.title.toLowerCase().includes(query) ||
        campaign.brand.toLowerCase().includes(query) ||
        campaign.description.toLowerCase().includes(query) ||
        campaign.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'budget':
          return b.budget.max - a.budget.max;
        case 'deadline':
          return a.deadline.getTime() - b.deadline.getTime();
        case 'popular':
          return b.applicants - a.applicants;
        case 'recent':
        default:
          return b.deadline.getTime() - a.deadline.getTime();
      }
    });

    // Prioritize featured and urgent campaigns
    filtered.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      if (a.isUrgent && !b.isUrgent) return -1;
      if (!a.isUrgent && b.isUrgent) return 1;
      return 0;
    });

    return filtered;
  }, [searchQuery, selectedCategory, selectedDifficulty, sortBy]);

  const handleSaveCampaign = (campaignId: string) => {
    if (savedCampaigns.includes(campaignId)) {
      setSavedCampaigns(prev => prev.filter(id => id !== campaignId));
      Alert.alert('Success', 'Campaign removed from saved items');
    } else {
      setSavedCampaigns(prev => [...prev, campaignId]);
      Alert.alert('Success', 'Campaign saved successfully!');
    }
  };

  const handleCampaignPress = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setModalVisible(true);
  };

  const handleApplyPress = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setApplicationModalVisible(true);
  };

  const handleSubmitApplication = async () => {
    if (!selectedCampaign) return;

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setAppliedCampaigns(prev => [...prev, selectedCampaign.id]);
      setApplicationModalVisible(false);
      setModalVisible(false);
      setLoading(false);
      
      // Reset form
      setApplicationData({
        message: '',
        experience: '',
        whyYou: '',
        availability: 'Immediately',
        expectedDelivery: '1 week',
        portfolio: [],
        socialLinks: {},
      });

      Alert.alert(
        'Application Submitted! 🎉',
        `Your application for "${selectedCampaign.title}" has been submitted successfully. The brand will review it within 24-48 hours.`,
        [
          {
            text: 'View Application',
            onPress: () => Alert.alert('Application Status', 'Status: Under Review\nSubmitted: Just now')
          },
          { text: 'OK', style: 'default' }
        ]
      );
    }, 2000);
  };

  const getDaysLeft = (deadline: Date) => {
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getApplicationPercentage = (applicants: number, maxApplicants: number) => {
    return Math.round((applicants / maxApplicants) * 100);
  };

  const renderCampaignCard = ({ item }: { item: Campaign }) => {
    const daysLeft = getDaysLeft(item.deadline);
    const applicationPercentage = getApplicationPercentage(item.applicants, item.maxApplicants);
    const hasApplied = appliedCampaigns.includes(item.id);
    const isSaved = savedCampaigns.includes(item.id);

    return (
      <TouchableOpacity
        style={styles.campaignCard}
        onPress={() => handleCampaignPress(item)}
      >
        <Card style={[styles.card, item.isFeatured && styles.featuredCard]}>
          {/* Campaign Image */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.image }} style={styles.campaignImage} />
            
            {/* Badges */}
            <View style={styles.badgeContainer}>
              {item.isFeatured && (
                <View style={styles.featuredBadge}>
                  <MaterialCommunityIcons name="star" size={12} color={colors.white} />
                  <Text style={styles.badgeText}>FEATURED</Text>
                </View>
              )}
              {item.isUrgent && (
                <View style={styles.urgentBadge}>
                  <MaterialCommunityIcons name="clock-fast" size={12} color={colors.white} />
                  <Text style={styles.badgeText}>URGENT</Text>
                </View>
              )}
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={styles.saveIcon}
              onPress={() => handleSaveCampaign(item.id)}
            >
              <MaterialCommunityIcons
                name={isSaved ? "bookmark" : "bookmark-outline"}
                size={24}
                color={isSaved ? colors.primary : colors.white}
              />
            </TouchableOpacity>
          </View>

          <Card.Content style={styles.cardContent}>
            {/* Header */}
            <View style={styles.campaignHeader}>
              <Avatar.Image source={{ uri: item.logo }} size={40} style={styles.brandLogo} />
              <View style={styles.campaignInfo}>
                <Text style={styles.campaignTitle} numberOfLines={2}>{item.title}</Text>
                <View style={styles.brandRow}>
                  <Text style={styles.brandName}>{item.brand}</Text>
                  {item.brandInfo.verified && (
                    <MaterialCommunityIcons name="check-circle" size={16} color={colors.primary} />
                  )}
                </View>
              </View>
            </View>

            {/* Meta Information */}
            <View style={styles.metaContainer}>
              <View style={styles.metaRow}>
                <MaterialCommunityIcons name="currency-usd" size={16} color={colors.success} />
                <Text style={styles.budgetText}>
                  ${item.budget.min}-${item.budget.max} {item.budget.currency}
                </Text>
              </View>
              
              <View style={styles.metaRow}>
                <MaterialCommunityIcons 
                  name="clock-outline" 
                  size={16} 
                  color={daysLeft <= 2 ? colors.error : colors.warning} 
                />
                <Text style={[
                  styles.deadlineText, 
                  { color: daysLeft <= 2 ? colors.error : colors.warning }
                ]}>
                  {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <MaterialCommunityIcons name="account-group" size={16} color={colors.accent} />
                <Text style={styles.applicantsText}>
                  {item.applicants}/{item.maxApplicants} applied
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${applicationPercentage}%`,
                      backgroundColor: applicationPercentage > 80 ? colors.error : colors.primary
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{applicationPercentage}% filled</Text>
            </View>

            {/* Category and Difficulty */}
            <View style={styles.tagsRow}>
              <Chip style={styles.categoryChip} textStyle={styles.chipText}>
                {item.category}
              </Chip>
              <Chip 
                style={[
                  styles.difficultyChip,
                  { backgroundColor: 
                    item.difficulty === 'beginner' ? colors.success :
                    item.difficulty === 'intermediate' ? colors.warning : colors.error
                  }
                ]} 
                textStyle={[styles.chipText, { color: colors.white }]}
              >
                {item.difficulty}
              </Chip>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <Button
                mode={hasApplied ? "outlined" : "contained"}
                onPress={() => hasApplied ? 
                  Alert.alert('Already Applied', 'You have already applied to this campaign') :
                  handleApplyPress(item)
                }
                style={[styles.applyButton, hasApplied && styles.appliedButton]}
                buttonColor={hasApplied ? 'transparent' : colors.primary}
                textColor={hasApplied ? colors.primary : colors.white}
                labelStyle={styles.buttonLabel}
                disabled={hasApplied || applicationPercentage >= 100}
              >
                {hasApplied ? 'Applied ✓' : 'Apply Now'}
              </Button>
              
              <Button
                mode="outlined"
                onPress={() => handleCampaignPress(item)}
                style={styles.detailsButton}
                textColor={colors.primary}
                labelStyle={styles.buttonLabel}
              >
                Details
              </Button>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderCampaignModal = () => {
    if (!selectedCampaign) return null;

    const daysLeft = getDaysLeft(selectedCampaign.deadline);
    const hasApplied = appliedCampaigns.includes(selectedCampaign.id);

    return (
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Campaign Image */}
            <Image source={{ uri: selectedCampaign.image }} style={styles.modalImage} />

            {/* Content */}
            <View style={styles.modalBody}>
              {/* Title and Brand */}
              <View style={styles.modalTitleSection}>
                <Avatar.Image source={{ uri: selectedCampaign.logo }} size={60} />
                <View style={styles.modalTitleInfo}>
                  <Text style={styles.modalTitle}>{selectedCampaign.title}</Text>
                  <View style={styles.modalBrandRow}>
                    <Text style={styles.modalBrand}>{selectedCampaign.brand}</Text>
                    {selectedCampaign.brandInfo.verified && (
                      <MaterialCommunityIcons name="check-circle" size={18} color={colors.primary} />
                    )}
                  </View>
                  <Text style={styles.modalCategory}>{selectedCampaign.category}</Text>
                </View>
              </View>

              {/* Key Metrics */}
              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <MaterialCommunityIcons name="currency-usd" size={24} color={colors.success} />
                  <Text style={styles.metricValue}>
                    ${selectedCampaign.budget.min}-${selectedCampaign.budget.max}
                  </Text>
                  <Text style={styles.metricLabel}>Budget</Text>
                </View>
                
                <View style={styles.metricItem}>
                  <MaterialCommunityIcons name="clock-outline" size={24} color={colors.warning} />
                  <Text style={styles.metricValue}>{daysLeft} days</Text>
                  <Text style={styles.metricLabel}>Time Left</Text>
                </View>
                
                <View style={styles.metricItem}>
                  <MaterialCommunityIcons name="account-group" size={24} color={colors.accent} />
                  <Text style={styles.metricValue}>
                    {selectedCampaign.applicants}/{selectedCampaign.maxApplicants}
                  </Text>
                  <Text style={styles.metricLabel}>Applied</Text>
                </View>

                <View style={styles.metricItem}>
                  <MaterialCommunityIcons name="star" size={24} color={colors.gold} />
                  <Text style={styles.metricValue}>{selectedCampaign.averageRating}</Text>
                  <Text style={styles.metricLabel}>Rating</Text>
                </View>
              </View>

              {/* Description */}
              <Text style={styles.sectionTitle}>Campaign Description</Text>
              <Text style={styles.description}>{selectedCampaign.description}</Text>

              {/* Requirements */}
              <Text style={styles.sectionTitle}>Requirements</Text>
              <View style={styles.requirementsList}>
                <View style={styles.requirementItem}>
                  <MaterialCommunityIcons name="account-group" size={18} color={colors.primary} />
                  <Text style={styles.requirementText}>
                    Minimum {selectedCampaign.requirements.minFollowers.toLocaleString()} followers
                  </Text>
                </View>
                <View style={styles.requirementItem}>
                  <MaterialCommunityIcons name="map-marker" size={18} color={colors.primary} />
                  <Text style={styles.requirementText}>Location: {selectedCampaign.requirements.location}</Text>
                </View>
                <View style={styles.requirementItem}>
                  <MaterialCommunityIcons name="cake" size={18} color={colors.primary} />
                  <Text style={styles.requirementText}>Age: {selectedCampaign.requirements.age}</Text>
                </View>
                <View style={styles.requirementItem}>
                  <MaterialCommunityIcons name="translate" size={18} color={colors.primary} />
                  <Text style={styles.requirementText}>
                    Languages: {selectedCampaign.requirements.languages.join(', ')}
                  </Text>
                </View>
              </View>

              {/* Deliverables */}
              <Text style={styles.sectionTitle}>Deliverables</Text>
              <View style={styles.deliverablesList}>
                {selectedCampaign.deliverables.map((deliverable, index) => (
                  <View key={index} style={styles.deliverableItem}>
                    <MaterialCommunityIcons name="check-circle-outline" size={18} color={colors.success} />
                    <Text style={styles.deliverableText}>{deliverable}</Text>
                  </View>
                ))}
              </View>

              {/* Compensation */}
              <Text style={styles.sectionTitle}>Compensation</Text>
              <View style={styles.compensationContainer}>
                <View style={styles.compensationMain}>
                  <MaterialCommunityIcons name="currency-usd" size={24} color={colors.success} />
                  <Text style={styles.compensationAmount}>${selectedCampaign.compensation.amount}</Text>
                  <Text style={styles.compensationType}>
                    {selectedCampaign.compensation.type === 'mixed' ? 'Cash + Benefits' : 'Cash Payment'}
                  </Text>
                </View>
                {selectedCampaign.compensation.additional.length > 0 && (
                  <View style={styles.additionalBenefits}>
                    <Text style={styles.benefitsTitle}>Additional Benefits:</Text>
                    {selectedCampaign.compensation.additional.map((benefit, index) => (
                      <Text key={index} style={styles.benefitItem}>• {benefit}</Text>
                    ))}
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => handleSaveCampaign(selectedCampaign.id)}
                  style={[styles.modalActionButton, { marginRight: 8 }]}
                  textColor={colors.primary}
                >
                  {savedCampaigns.includes(selectedCampaign.id) ? 'Saved ✓' : 'Save'}
                </Button>
                
                <Button
                  mode="contained"
                  onPress={() => {
                    setModalVisible(false);
                    handleApplyPress(selectedCampaign);
                  }}
                  style={styles.modalActionButton}
                  buttonColor={colors.primary}
                  disabled={hasApplied}
                >
                  {hasApplied ? 'Applied ✓' : 'Apply Now'}
                </Button>
              </View>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    );
  };

  const renderApplicationModal = () => {
    if (!selectedCampaign) return null;

    return (
      <Portal>
        <Modal
          visible={applicationModalVisible}
          onDismiss={() => setApplicationModalVisible(false)}
          contentContainerStyle={styles.applicationModalContent}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.applicationModalHeader}>
              <Text style={styles.applicationModalTitle}>
                Apply to {selectedCampaign.title}
              </Text>
              <TouchableOpacity
                onPress={() => setApplicationModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Divider />

            <View style={styles.applicationForm}>
              {/* Cover Letter */}
              <TextInput
                label="Cover Letter *"
                value={applicationData.message}
                onChangeText={(text) => setApplicationData(prev => ({ ...prev, message: text }))}
                multiline
                numberOfLines={4}
                style={styles.textInput}
                placeholder="Tell us why you're perfect for this campaign..."
              />

              {/* Experience */}
              <TextInput
                label="Relevant Experience *"
                value={applicationData.experience}
                onChangeText={(text) => setApplicationData(prev => ({ ...prev, experience: text }))}
                multiline
                numberOfLines={3}
                style={styles.textInput}
                placeholder="Describe your relevant experience and past campaigns..."
              />

              {/* Why You */}
              <TextInput
                label="Why should we choose you? *"
                value={applicationData.whyYou}
                onChangeText={(text) => setApplicationData(prev => ({ ...prev, whyYou: text }))}
                multiline
                numberOfLines={3}
                style={styles.textInput}
                placeholder="What makes you unique for this campaign?"
              />

              {/* Availability */}
              <Text style={styles.formSectionTitle}>Availability</Text>
              <RadioButton.Group
                onValueChange={value => setApplicationData(prev => ({ ...prev, availability: value }))}
                value={applicationData.availability}
              >
                <View style={styles.radioOption}>
                  <RadioButton value="Immediately" />
                  <Text style={styles.radioLabel}>Immediately</Text>
                </View>
                <View style={styles.radioOption}>
                  <RadioButton value="Within 1 week" />
                  <Text style={styles.radioLabel}>Within 1 week</Text>
                </View>
                <View style={styles.radioOption}>
                  <RadioButton value="Within 2 weeks" />
                  <Text style={styles.radioLabel}>Within 2 weeks</Text>
                </View>
              </RadioButton.Group>

              {/* Expected Delivery */}
              <Text style={styles.formSectionTitle}>Expected Delivery Time</Text>
              <RadioButton.Group
                onValueChange={value => setApplicationData(prev => ({ ...prev, expectedDelivery: value }))}
                value={applicationData.expectedDelivery}
              >
                <View style={styles.radioOption}>
                  <RadioButton value="3-5 days" />
                  <Text style={styles.radioLabel}>3-5 days</Text>
                </View>
                <View style={styles.radioOption}>
                  <RadioButton value="1 week" />
                  <Text style={styles.radioLabel}>1 week</Text>
                </View>
                <View style={styles.radioOption}>
                  <RadioButton value="2 weeks" />
                  <Text style={styles.radioLabel}>2 weeks</Text>
                </View>
              </RadioButton.Group>

              {/* Social Links */}
              <Text style={styles.formSectionTitle}>Social Media Links</Text>
              <TextInput
                label="Instagram Handle"
                value={applicationData.socialLinks.instagram || ''}
                onChangeText={(text) => setApplicationData(prev => ({ 
                  ...prev, 
                  socialLinks: { ...prev.socialLinks, instagram: text }
                }))}
                style={styles.textInput}
                placeholder="@your_instagram"
              />

              <TextInput
                label="TikTok Handle"
                value={applicationData.socialLinks.tiktok || ''}
                onChangeText={(text) => setApplicationData(prev => ({ 
                  ...prev, 
                  socialLinks: { ...prev.socialLinks, tiktok: text }
                }))}
                style={styles.textInput}
                placeholder="@your_tiktok"
              />

              <TextInput
                label="Website/Portfolio"
                value={applicationData.socialLinks.website || ''}
                onChangeText={(text) => setApplicationData(prev => ({ 
                  ...prev, 
                  socialLinks: { ...prev.socialLinks, website: text }
                }))}
                style={styles.textInput}
                placeholder="https://your-website.com"
              />

              {/* Submit Button */}
              <Button
                mode="contained"
                onPress={handleSubmitApplication}
                style={styles.submitButton}
                buttonColor={colors.primary}
                loading={loading}
                disabled={loading || !applicationData.message || !applicationData.experience || !applicationData.whyYou}
              >
                {loading ? 'Submitting Application...' : 'Submit Application'}
              </Button>

              <Text style={styles.formNote}>
                * Required fields. Your application will be reviewed within 24-48 hours.
              </Text>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="Campaigns" titleStyle={styles.headerTitle} />
        <Appbar.Action
          icon={viewMode === 'card' ? 'view-list' : 'view-grid'}
          iconColor={colors.white}
          onPress={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
        />
        <Appbar.Action
          icon="filter-variant"
          iconColor={colors.white}
          onPress={() => Alert.alert('Filters', 'Advanced filters coming soon')}
        />
      </Appbar.Header>

      <View style={styles.content}>
        {/* Search Bar */}
        <Searchbar
          placeholder="Search campaigns..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
        />

        {/* Filter Section */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {/* Categories */}
          {categories.map((category) => (
            <Chip
              key={category}
              selected={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
              style={[
                styles.filterChip,
                selectedCategory === category && styles.selectedFilterChip
              ]}
              textStyle={[
                styles.filterChipText,
                selectedCategory === category && styles.selectedFilterChipText
              ]}
            >
              {category}
            </Chip>
          ))}
        </ScrollView>

        {/* Difficulty and Sort */}
        <View style={styles.controlsRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.difficultyContainer}>
            {difficultyLevels.map((difficulty) => (
              <Chip
                key={difficulty}
                selected={selectedDifficulty === difficulty}
                onPress={() => setSelectedDifficulty(difficulty)}
                style={[
                  styles.difficultyChip,
                  selectedDifficulty === difficulty && styles.selectedDifficultyChip
                ]}
                textStyle={[
                  styles.difficultyChipText,
                  selectedDifficulty === difficulty && styles.selectedDifficultyChipText
                ]}
              >
                {difficulty}
              </Chip>
            ))}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortContainer}>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setSortBy(option.value)}
                style={[
                  styles.sortOption,
                  sortBy === option.value && styles.selectedSortOption
                ]}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    sortBy === option.value && styles.selectedSortOptionText
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Results Count */}
        <Text style={styles.resultsCount}>
          {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''} found
        </Text>

        {/* Campaigns List */}
        <FlatList
          data={filteredCampaigns}
          renderItem={renderCampaignCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Campaign Detail Modal */}
      {renderCampaignModal()}

      {/* Application Modal */}
      {renderApplicationModal()}

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => Alert.alert('Create Campaign', 'Post your own campaign for creators!')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    elevation: 4,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  searchBar: {
    margin: 16,
    marginBottom: 12,
    elevation: 2,
  },
  searchInput: {
    fontSize: 16,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: colors.surface,
  },
  selectedFilterChip: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    color: colors.textPrimary,
    fontSize: 12,
  },
  selectedFilterChipText: {
    color: colors.white,
  },
  controlsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  difficultyContainer: {
    flex: 1,
    marginRight: 12,
  },
  difficultyChip: {
    marginRight: 8,
    backgroundColor: colors.surface,
  },
  selectedDifficultyChip: {
    backgroundColor: colors.secondary,
  },
  difficultyChipText: {
    color: colors.textPrimary,
    fontSize: 10,
  },
  selectedDifficultyChipText: {
    color: colors.white,
  },
  sortContainer: {
    flex: 1,
  },
  sortOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginRight: 8,
  },
  selectedSortOption: {
    backgroundColor: colors.accent,
  },
  sortOptionText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  selectedSortOptionText: {
    color: colors.white,
    fontWeight: '600',
  },
  resultsCount: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    fontSize: 14,
    color: colors.textSecondary,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  campaignCard: {
    marginBottom: 16,
  },
  card: {
    elevation: 3,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  featuredCard: {
    borderColor: colors.gold,
    borderWidth: 2,
  },
  imageContainer: {
    position: 'relative',
  },
  campaignImage: {
    height: 180,
    width: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  badgeContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
  },
  featuredBadge: {
    backgroundColor: colors.gold,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  urgentBadge: {
    backgroundColor: colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  saveIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  cardContent: {
    padding: 16,
  },
  campaignHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  brandLogo: {
    marginRight: 12,
  },
  campaignInfo: {
    flex: 1,
  },
  campaignTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginRight: 6,
  },
  metaContainer: {
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  budgetText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  deadlineText: {
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '600',
  },
  applicantsText: {
    fontSize: 14,
    color: colors.accent,
    marginLeft: 6,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  tagsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  categoryChip: {
    backgroundColor: colors.background,
    marginRight: 8,
  },
  difficultyChip: {
    marginRight: 8,
  },
  chipText: {
    fontSize: 11,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  applyButton: {
    flex: 1,
  },
  appliedButton: {
    backgroundColor: 'transparent',
  },
  detailsButton: {
    flex: 1,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal Styles
  modalContent: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginVertical: 30,
    borderRadius: 12,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    paddingBottom: 8,
  },
  closeButton: {
    padding: 4,
  },
  modalImage: {
    height: 200,
    width: '100%',
  },
  modalBody: {
    padding: 20,
  },
  modalTitleSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalTitleInfo: {
    flex: 1,
    marginLeft: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  modalBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalBrand: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    marginRight: 6,
  },
  modalCategory: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
    marginTop: 8,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 20,
  },
  requirementsList: {
    marginBottom: 20,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: 12,
    flex: 1,
  },
  deliverablesList: {
    marginBottom: 20,
  },
  deliverableItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  deliverableText: {
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  compensationContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  compensationMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  compensationAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.success,
    marginLeft: 12,
  },
  compensationType: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 12,
  },
  additionalBenefits: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  benefitItem: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  modalActionButton: {
    flex: 1,
  },
  // Application Modal Styles
  applicationModalContent: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 12,
    maxHeight: '95%',
  },
  applicationModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  applicationModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    flex: 1,
  },
  applicationForm: {
    padding: 20,
  },
  textInput: {
    marginBottom: 16,
    backgroundColor: colors.surface,
  },
  formSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 8,
    marginBottom: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioLabel: {
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: 8,
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 16,
    paddingVertical: 4,
  },
  formNote: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
});