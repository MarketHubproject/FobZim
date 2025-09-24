import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  Dimensions,
  Platform,
  TouchableOpacity,
  Linking,
  Image,
  ImageBackground,
  StatusBar,
  Share
} from 'react-native';
import {
  Card,
  Text,
  Button,
  Avatar,
  IconButton,
  Chip,
  Divider,
  Badge,
  FAB,
  Portal,
  Modal,
  TextInput,
  Switch,
  List,
  Dialog,
  Surface,
  ProgressBar,
  Searchbar,
  Menu,
  RadioButton
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

// Color Themes
const colorThemes = {
  default: {
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
    info: '#2196F3',
    accent: '#1976D2',
    gold: '#FFD700',
    gradientStart: '#2E7D32',
    gradientEnd: '#4CAF50'
  },
  dark: {
    primary: '#4CAF50',
    secondary: '#81C784',
    surface: '#1E1E1E',
    background: '#121212',
    textPrimary: '#FFFFFF',
    textSecondary: '#B3B3B3',
    muted: '#666666',
    white: '#FFFFFF',
    error: '#F44336',
    success: '#4CAF50',
    warning: '#FF9800',
    info: '#2196F3',
    accent: '#64B5F6',
    gold: '#FFD700',
    gradientStart: '#2E7D32',
    gradientEnd: '#4CAF50'
  },
  professional: {
    primary: '#1565C0',
    secondary: '#1976D2',
    surface: '#FFFFFF',
    background: '#F8F9FA',
    textPrimary: '#212121',
    textSecondary: '#6C757D',
    muted: '#ADB5BD',
    white: '#FFFFFF',
    error: '#DC3545',
    success: '#28A745',
    warning: '#FFC107',
    info: '#17A2B8',
    accent: '#6F42C1',
    gold: '#FFD700',
    gradientStart: '#1565C0',
    gradientEnd: '#1976D2'
  },
  vibrant: {
    primary: '#E91E63',
    secondary: '#F48FB1',
    surface: '#FFFFFF',
    background: '#FFF0F5',
    textPrimary: '#212121',
    textSecondary: '#757575',
    muted: '#BDBDBD',
    white: '#FFFFFF',
    error: '#F44336',
    success: '#4CAF50',
    warning: '#FF9800',
    info: '#2196F3',
    accent: '#9C27B0',
    gold: '#FFD700',
    gradientStart: '#E91E63',
    gradientEnd: '#F48FB1'
  }
};

// Enhanced Profile Data Structures
const profileLayoutOptions = [
  { id: 'default', name: 'Classic View', icon: 'view-dashboard' },
  { id: 'compact', name: 'Compact View', icon: 'view-list' },
  { id: 'showcase', name: 'Showcase View', icon: 'view-grid' },
  { id: 'professional', name: 'Professional View', icon: 'briefcase' }
];

const coverImageOptions = [
  { id: 'gradient', name: 'Gradient', preview: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400' },
  { id: 'nature', name: 'Nature', preview: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400' },
  { id: 'city', name: 'City', preview: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400' },
  { id: 'abstract', name: 'Abstract', preview: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400' },
  { id: 'minimal', name: 'Minimal', preview: 'https://images.unsplash.com/photo-1557683304-673a23048d34?w=400' },
  { id: 'custom', name: 'Custom Upload', preview: null }
];

const skillCategories = [
  'Content Creation', 'Photography', 'Videography', 'Writing', 'Design',
  'Marketing', 'Social Media', 'Analytics', 'Communication', 'Leadership'
];

const certificationTypes = [
  { id: 'google_ads', name: 'Google Ads Certified', icon: 'google' },
  { id: 'facebook_blueprint', name: 'Facebook Blueprint', icon: 'facebook' },
  { id: 'instagram_certified', name: 'Instagram Certified', icon: 'instagram' },
  { id: 'youtube_creator', name: 'YouTube Creator', icon: 'youtube' },
  { id: 'tiktok_certified', name: 'TikTok Certified', icon: 'music-note' }
];

// Enhanced Mock Profile Data
const enhancedProfileData = {
  id: 'user_123',
  displayName: 'Tendai Mukamuri',
  username: '@tendai_creates',
  email: 'tendai@example.com',
  bio: 'Travel & lifestyle content creator showcasing the beauty of Zimbabwe 🇿🇼 | Brand partnerships welcome',
  location: 'Harare, Zimbabwe',
  phone: '+263 77 123 4567',
  website: 'www.tendaicreates.com',
  joinDate: 'March 2023',
  isVerified: true,
  isCreator: true,
  profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b30c1b31?w=300',
  coverImage: 'https://images.unsplash.com/photo-1586276393851-8cb65d96ebb2?w=800',
  
  // Professional Details
  jobTitle: 'Content Creator & Brand Influencer',
  company: 'Freelance',
  experience: '3+ years',
  languages: ['English', 'Shona', 'Ndebele'],
  
  // Statistics
  stats: {
    followers: 15240,
    following: 892,
    posts: 247,
    campaigns: 47,
    completedCampaigns: 42,
    totalEarnings: 12450,
    rating: 4.8,
    profileViews: 5420,
    responseTime: '2 hours',
    successRate: 89
  },
  
  // Skills & Expertise
  skills: [
    { name: 'Content Creation', level: 95, verified: true },
    { name: 'Photography', level: 88, verified: true },
    { name: 'Social Media Marketing', level: 92, verified: false },
    { name: 'Brand Partnerships', level: 85, verified: true },
    { name: 'Video Editing', level: 78, verified: false }
  ],
  
  // Social Media Links
  socialMedia: {
    instagram: '@tendai_creates',
    tiktok: '@tendaicreates',
    youtube: 'Tendai Creates',
    twitter: '@tendai_creates',
    linkedin: 'tendai-mukamuri'
  },
  
  // Certifications
  certifications: [
    { id: 'instagram_certified', earnedDate: '2023-08-15', expires: '2024-08-15' },
    { id: 'google_ads', earnedDate: '2023-06-20', expires: '2024-06-20' }
  ],
  
  // Portfolio & Showcase Data
  portfolio: {
    featuredWork: [
      {
        id: 'work_1',
        title: 'Victoria Falls Adventure Campaign',
        brand: 'Zimbabwe Tourism Authority',
        category: 'Travel & Tourism',
        type: 'Campaign',
        date: '2023-11-15',
        description: 'Multi-platform campaign showcasing Victoria Falls as adventure capital of Africa',
        mediaType: 'mixed',
        thumbnailImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
        images: [
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
          'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800',
          'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800'
        ],
        metrics: {
          reach: 125000,
          engagement: 8.5,
          likes: 12500,
          shares: 850,
          comments: 420
        },
        tags: ['travel', 'adventure', 'waterfall', 'zimbabwe'],
        rating: 4.9,
        featured: true
      },
      {
        id: 'work_2',
        title: 'Sustainable Fashion Showcase',
        brand: 'EcoStyle Zimbabwe',
        category: 'Fashion & Lifestyle',
        type: 'Collaboration',
        date: '2023-10-22',
        description: 'Promoting eco-friendly fashion brands and sustainable style choices',
        mediaType: 'photo',
        thumbnailImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400',
        images: [
          'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800'
        ],
        metrics: {
          reach: 85000,
          engagement: 12.3,
          likes: 8200,
          shares: 340,
          comments: 290
        },
        tags: ['fashion', 'sustainable', 'style', 'ecofriendly'],
        rating: 4.7,
        featured: true
      },
      {
        id: 'work_3',
        title: 'Traditional Cuisine Documentary',
        brand: 'ZimCuisine Co.',
        category: 'Food & Culture',
        type: 'Video Content',
        date: '2023-09-18',
        description: 'Documentary-style content featuring traditional Zimbabwean dishes and cooking methods',
        mediaType: 'video',
        thumbnailImage: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
        videoUrl: 'https://example.com/video/cuisine-doc',
        duration: '12:45',
        metrics: {
          reach: 95000,
          engagement: 15.2,
          views: 45000,
          likes: 5800,
          shares: 920,
          comments: 650
        },
        tags: ['food', 'culture', 'traditional', 'cooking'],
        rating: 4.8,
        featured: true
      },
      {
        id: 'work_4',
        title: 'Tech Startup Feature',
        brand: 'Innovation Hub Zimbabwe',
        category: 'Technology & Innovation',
        type: 'Interview Series',
        date: '2023-08-30',
        description: 'Interview series highlighting emerging tech entrepreneurs in Zimbabwe',
        mediaType: 'video',
        thumbnailImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400',
        videoUrl: 'https://example.com/video/tech-interviews',
        duration: '25:30',
        metrics: {
          reach: 68000,
          engagement: 9.8,
          views: 28000,
          likes: 3200,
          shares: 240,
          comments: 180
        },
        tags: ['technology', 'startup', 'innovation', 'interview'],
        rating: 4.6,
        featured: false
      },
      {
        id: 'work_5',
        title: 'Cultural Heritage Project',
        brand: 'Zimbabwe Heritage Foundation',
        category: 'Culture & History',
        type: 'Photo Series',
        date: '2023-07-12',
        description: 'Photo documentation of Great Zimbabwe ruins and cultural significance',
        mediaType: 'photo',
        thumbnailImage: 'https://images.unsplash.com/photo-1517650862521-d580d5348145?w=400',
        images: [
          'https://images.unsplash.com/photo-1517650862521-d580d5348145?w=800',
          'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800',
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'
        ],
        metrics: {
          reach: 110000,
          engagement: 11.7,
          likes: 9800,
          shares: 560,
          comments: 380
        },
        tags: ['culture', 'heritage', 'history', 'photography'],
        rating: 4.9,
        featured: false
      }
    ],
    categories: [
      { id: 'travel', name: 'Travel & Tourism', count: 12, color: '#2196F3' },
      { id: 'fashion', name: 'Fashion & Lifestyle', count: 8, color: '#E91E63' },
      { id: 'food', name: 'Food & Culture', count: 6, color: '#FF9800' },
      { id: 'technology', name: 'Technology', count: 4, color: '#9C27B0' },
      { id: 'culture', name: 'Culture & Heritage', count: 7, color: '#4CAF50' }
    ],
    achievements: [
      { id: 'featured_creator', name: 'Featured Creator', date: '2023-11-01', description: 'Featured on ZimBuzz homepage' },
      { id: 'viral_content', name: 'Viral Content', date: '2023-10-15', description: 'Content reached over 100K people' },
      { id: 'brand_ambassador', name: 'Brand Ambassador', date: '2023-09-20', description: 'Official brand partnership with 3+ companies' }
    ],
    testimonials: [
      {
        id: 'test_1',
        author: 'Sarah Mutindi',
        company: 'Zimbabwe Tourism Authority',
        role: 'Marketing Director',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b30c1b31?w=150',
        rating: 5,
        text: 'Tendai\'s work on our Victoria Falls campaign exceeded all expectations. Professional, creative, and delivered outstanding results.',
        date: '2023-11-20'
      },
      {
        id: 'test_2',
        author: 'Michael Chikwana',
        company: 'EcoStyle Zimbabwe',
        role: 'Brand Manager',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        rating: 5,
        text: 'Amazing collaboration! Tendai perfectly captured our brand values and sustainable fashion message.',
        date: '2023-10-28'
      },
      {
        id: 'test_3',
        author: 'Grace Mungoshi',
        company: 'ZimCuisine Co.',
        role: 'Founder',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        rating: 4,
        text: 'Great storytelling skills and excellent attention to cultural details. Highly recommended!',
        date: '2023-09-25'
      }
    ]
  },
  
  // Preferences
  preferences: {
    theme: 'default',
    layout: 'default',
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      showEarnings: true,
      allowMessages: true
    },
    notifications: {
      push: true,
      email: true,
      campaigns: true,
      follows: true,
      messages: true
    },
    portfolio: {
      showFeaturedWork: true,
      showMetrics: true,
      showTestimonials: true,
      portfolioLayout: 'grid',
      itemsPerRow: 2
    }
  }
};

interface ProfileScreenProps {}

const ProfileScreen: React.FC<ProfileScreenProps> = () => {
  const { user, userProfile, updateUserProfile, logout } = useAuth();
  
  // State Management
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentTheme, setCurrentTheme] = useState('default');
  const [profileData, setProfileData] = useState(enhancedProfileData);
  
  // Modal States
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [customizationModalVisible, setCustomizationModalVisible] = useState(false);
  const [skillsModalVisible, setSkillsModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [coverImageModalVisible, setCoverImageModalVisible] = useState(false);
  const [portfolioModalVisible, setPortfolioModalVisible] = useState(false);
  const [portfolioItemModalVisible, setPortfolioItemModalVisible] = useState(false);
  const [testimonialsModalVisible, setTestimonialsModalVisible] = useState(false);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  
  // Portfolio States
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState(null);
  const [portfolioFilter, setPortfolioFilter] = useState('all');
  const [portfolioLayout, setPortfolioLayout] = useState('grid');
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    displayName: profileData.displayName,
    bio: profileData.bio,
    location: profileData.location,
    phone: profileData.phone,
    website: profileData.website,
    jobTitle: profileData.jobTitle,
    company: profileData.company,
    experience: profileData.experience
  });

  // Customization states
  const [customizations, setCustomizations] = useState({
    theme: profileData.preferences.theme,
    layout: profileData.preferences.layout,
    coverImage: 'nature',
    showStats: true,
    showSkills: true,
    showCertifications: true,
    showPortfolio: true,
    showTestimonials: true,
    portfolioLayout: profileData.preferences.portfolio.portfolioLayout,
    itemsPerRow: profileData.preferences.portfolio.itemsPerRow
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState(profileData.preferences.privacy);

  // Get current theme colors
  const colors = colorThemes[currentTheme as keyof typeof colorThemes];

  // Enhanced Handlers
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh delay and data update
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleSaveProfile = useCallback(async () => {
    try {
      // Update profile data
      setProfileData(prev => ({
        ...prev,
        ...editForm
      }));
      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  }, [editForm]);

  const handleThemeChange = useCallback((theme: string) => {
    setCurrentTheme(theme);
    setCustomizations(prev => ({ ...prev, theme }));
    setProfileData(prev => ({
      ...prev,
      preferences: { ...prev.preferences, theme }
    }));
  }, []);

  const handleLayoutChange = useCallback((layout: string) => {
    setCustomizations(prev => ({ ...prev, layout }));
    setProfileData(prev => ({
      ...prev,
      preferences: { ...prev.preferences, layout }
    }));
  }, []);

  const handlePrivacyUpdate = useCallback((setting: string, value: boolean) => {
    setPrivacySettings(prev => ({ ...prev, [setting]: value }));
    setProfileData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        privacy: { ...prev.preferences.privacy, [setting]: value }
      }
    }));
  }, []);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Check out ${profileData.displayName}'s profile on ZimBuzz! ${profileData.username}`,
        url: `https://zimbuzz.com/profile/${profileData.username}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share profile');
    }
  }, [profileData]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setLogoutDialogVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  }, [logout]);

  const openExternalLink = useCallback((url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open link');
    });
  }, []);

  const openSocialMedia = useCallback((platform: string, handle: string) => {
    const urls = {
      instagram: `https://instagram.com/${handle.replace('@', '')}`,
      tiktok: `https://tiktok.com/@${handle.replace('@', '')}`,
      youtube: `https://youtube.com/c/${handle.replace('@', '')}`,
      twitter: `https://twitter.com/${handle.replace('@', '')}`,
      linkedin: `https://linkedin.com/in/${handle.replace('@', '')}`
    };
    
    const url = urls[platform as keyof typeof urls];
    if (url) {
      openExternalLink(url);
    }
  }, [openExternalLink]);

  // Portfolio Handlers
  const handlePortfolioItemPress = useCallback((item: any) => {
    setSelectedPortfolioItem(item);
    setPortfolioItemModalVisible(true);
  }, []);

  const handlePortfolioFilterChange = useCallback((filter: string) => {
    setPortfolioFilter(filter);
  }, []);

  const handlePortfolioLayoutChange = useCallback((layout: string) => {
    setPortfolioLayout(layout);
    setCustomizations(prev => ({ ...prev, portfolioLayout: layout }));
  }, []);

  const getFilteredPortfolioItems = useCallback(() => {
    if (portfolioFilter === 'all') {
      return profileData.portfolio.featuredWork;
    }
    return profileData.portfolio.featuredWork.filter(item => 
      item.category.toLowerCase().includes(portfolioFilter.toLowerCase()) ||
      item.type.toLowerCase().includes(portfolioFilter.toLowerCase())
    );
  }, [profileData.portfolio.featuredWork, portfolioFilter]);

  // Enhanced Render Functions
  const renderProfileHeader = () => {
    const selectedCoverImage = coverImageOptions.find(opt => opt.id === customizations.coverImage);
    
    return (
      <View style={[styles.headerContainer, { backgroundColor: colors.surface }]}>
        {/* Cover Image */}
        <View style={styles.coverImageContainer}>
          <ImageBackground
            source={{ uri: selectedCoverImage?.preview || profileData.coverImage }}
            style={styles.coverImage}
            resizeMode="cover"
          >
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.4)']}
              style={styles.coverGradient}
            />
            
            {/* Cover Action Buttons */}
            <View style={styles.coverActions}>
              <IconButton
                icon="camera"
                iconColor={colors.white}
                style={[styles.coverActionButton, { backgroundColor: colors.primary }]}
                onPress={() => setCoverImageModalVisible(true)}
              />
              <IconButton
                icon="palette"
                iconColor={colors.white}
                style={[styles.coverActionButton, { backgroundColor: colors.primary }]}
                onPress={() => setCustomizationModalVisible(true)}
              />
            </View>
          </ImageBackground>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfoContainer}>
          <View style={styles.avatarContainer}>
            <Avatar.Image
              source={{ uri: profileData.profileImage }}
              size={100}
              style={styles.profileAvatar}
            />
            {profileData.isVerified && (
              <View style={[styles.verifiedBadge, { backgroundColor: colors.primary }]}>
                <MaterialCommunityIcons name="check-decagram" size={24} color={colors.white} />
              </View>
            )}
            <TouchableOpacity style={[styles.avatarEditButton, { backgroundColor: colors.primary }]}>
              <MaterialCommunityIcons name="camera" size={16} color={colors.white} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.profileName, { color: colors.textPrimary }]}>{profileData.displayName}</Text>
          <Text style={[styles.profileUsername, { color: colors.textSecondary }]}>{profileData.username}</Text>
          
          {profileData.jobTitle && (
            <Text style={[styles.jobTitle, { color: colors.primary }]}>{profileData.jobTitle}</Text>
          )}
          
          <Text style={[styles.profileBio, { color: colors.textPrimary }]}>{profileData.bio}</Text>
          
          <View style={styles.profileMeta}>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="map-marker" size={16} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>{profileData.location}</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="calendar" size={16} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>Joined {profileData.joinDate}</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="star" size={16} color={colors.gold} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>{profileData.stats.rating} rating</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              onPress={() => setEditModalVisible(true)}
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              contentStyle={styles.actionButtonContent}
            >
              Edit Profile
            </Button>
            <Button
              mode="outlined"
              onPress={handleShare}
              style={[styles.actionButton, { borderColor: colors.primary }]}
              contentStyle={styles.actionButtonContent}
              textColor={colors.primary}
            >
              Share
            </Button>
          </View>
        </View>
      </View>
    );
  };

  const renderStatsRow = () => (
    customizations.showStats && (
      <Surface style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
        <TouchableOpacity style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{profileData.stats.followers.toLocaleString()}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Followers</Text>
        </TouchableOpacity>
        <Divider style={styles.statDivider} />
        <TouchableOpacity style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{profileData.stats.following.toLocaleString()}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Following</Text>
        </TouchableOpacity>
        <Divider style={styles.statDivider} />
        <TouchableOpacity style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{profileData.stats.completedCampaigns}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Campaigns</Text>
        </TouchableOpacity>
        <Divider style={styles.statDivider} />
        <TouchableOpacity style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.success }]}>${profileData.stats.totalEarnings.toLocaleString()}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Earned</Text>
        </TouchableOpacity>
      </Surface>
    )
  );

  const renderSkillsSection = () => (
    customizations.showSkills && (
      <Card style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="star-circle" size={24} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Skills & Expertise</Text>
            <TouchableOpacity onPress={() => setSkillsModalVisible(true)}>
              <MaterialCommunityIcons name="pencil" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          {profileData.skills.map((skill, index) => (
            <View key={index} style={styles.skillItem}>
              <View style={styles.skillHeader}>
                <Text style={[styles.skillName, { color: colors.textPrimary }]}>{skill.name}</Text>
                <View style={styles.skillMeta}>
                  {skill.verified && (
                    <MaterialCommunityIcons name="check-circle" size={16} color={colors.success} />
                  )}
                  <Text style={[styles.skillLevel, { color: colors.primary }]}>{skill.level}%</Text>
                </View>
              </View>
              <ProgressBar
                progress={skill.level / 100}
                color={colors.primary}
                style={styles.skillProgressBar}
              />
            </View>
          ))}
        </Card.Content>
      </Card>
    )
  );

  const renderCertificationsSection = () => (
    customizations.showCertifications && profileData.certifications.length > 0 && (
      <Card style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="certificate" size={24} color={colors.gold} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Certifications</Text>
          </View>
          
          {profileData.certifications.map((cert, index) => {
            const certType = certificationTypes.find(type => type.id === cert.id);
            return (
              <View key={index} style={styles.certificationItem}>
                <MaterialCommunityIcons
                  name={certType?.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                  size={24}
                  color={colors.primary}
                />
                <View style={styles.certificationContent}>
                  <Text style={[styles.certificationName, { color: colors.textPrimary }]}>{certType?.name}</Text>
                  <Text style={[styles.certificationDate, { color: colors.textSecondary }]}>Expires: {cert.expires}</Text>
                </View>
                <MaterialCommunityIcons name="check-circle" size={20} color={colors.success} />
              </View>
            );
          })}
        </Card.Content>
      </Card>
    )
  );

  const renderSocialMediaSection = () => (
    <Card style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="share-variant" size={24} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Social Media</Text>
        </View>
        
        {Object.entries(profileData.socialMedia).map(([platform, handle]) => (
          <TouchableOpacity
            key={platform}
            style={styles.socialMediaItem}
            onPress={() => openSocialMedia(platform, handle)}
          >
            <MaterialCommunityIcons
              name={platform as keyof typeof MaterialCommunityIcons.glyphMap}
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.socialMediaHandle, { color: colors.textPrimary }]}>{handle}</Text>
            <MaterialCommunityIcons name="open-in-new" size={16} color={colors.muted} />
          </TouchableOpacity>
        ))}
      </Card.Content>
    </Card>
  );

  const renderPortfolioSection = () => (
    customizations.showPortfolio && (
      <Card style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="briefcase" size={24} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Featured Work</Text>
            <TouchableOpacity onPress={() => setPortfolioModalVisible(true)}>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {/* Portfolio Categories */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            <TouchableOpacity
              style={[
                styles.categoryChip,
                { backgroundColor: portfolioFilter === 'all' ? colors.primary : colors.surface },
                { borderColor: colors.primary }
              ]}
              onPress={() => handlePortfolioFilterChange('all')}
            >
              <Text style={[
                styles.categoryChipText,
                { color: portfolioFilter === 'all' ? colors.white : colors.primary }
              ]}>All Work</Text>
            </TouchableOpacity>
            {profileData.portfolio.categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: portfolioFilter === category.id ? category.color : colors.surface,
                    borderColor: category.color
                  }
                ]}
                onPress={() => handlePortfolioFilterChange(category.id)}
              >
                <Text style={[
                  styles.categoryChipText,
                  { color: portfolioFilter === category.id ? colors.white : category.color }
                ]}>({category.count})</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Portfolio Grid */}
          <View style={styles.portfolioGrid}>
            {getFilteredPortfolioItems().slice(0, 4).map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.portfolioItem,
                  { width: portfolioLayout === 'grid' ? '48%' : '100%' }
                ]}
                onPress={() => handlePortfolioItemPress(item)}
              >
                <View style={styles.portfolioItemImage}>
                  <Image
                    source={{ uri: item.thumbnailImage }}
                    style={styles.portfolioThumbnail}
                    resizeMode="cover"
                  />
                  {item.mediaType === 'video' && (
                    <View style={[styles.mediaTypeIcon, { backgroundColor: colors.primary }]}>
                      <MaterialCommunityIcons name="play" size={16} color={colors.white} />
                    </View>
                  )}
                  {item.featured && (
                    <View style={[styles.featuredBadge, { backgroundColor: colors.warning }]}>
                      <MaterialCommunityIcons name="star" size={12} color={colors.white} />
                    </View>
                  )}
                </View>
                
                <View style={styles.portfolioItemContent}>
                  <Text style={[styles.portfolioItemTitle, { color: colors.textPrimary }]} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={[styles.portfolioItemBrand, { color: colors.primary }]} numberOfLines={1}>
                    {item.brand}
                  </Text>
                  
                  <View style={styles.portfolioItemMeta}>
                    <View style={styles.portfolioItemMetrics}>
                      <MaterialCommunityIcons name="eye" size={14} color={colors.textSecondary} />
                      <Text style={[styles.metricText, { color: colors.textSecondary }]}>
                        {item.metrics.reach > 1000 ? `${(item.metrics.reach / 1000).toFixed(0)}K` : item.metrics.reach}
                      </Text>
                    </View>
                    <View style={styles.portfolioItemRating}>
                      <MaterialCommunityIcons name="star" size={14} color={colors.gold} />
                      <Text style={[styles.metricText, { color: colors.textSecondary }]}>{item.rating}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Card.Content>
      </Card>
    )
  );

  const renderTestimonialsSection = () => (
    customizations.showTestimonials && profileData.portfolio.testimonials.length > 0 && (
      <Card style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="comment-quote" size={24} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Client Testimonials</Text>
            <TouchableOpacity onPress={() => setTestimonialsModalVisible(true)}>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {profileData.portfolio.testimonials.slice(0, 3).map((testimonial) => (
              <View key={testimonial.id} style={styles.testimonialCard}>
                <View style={styles.testimonialHeader}>
                  <Avatar.Image source={{ uri: testimonial.avatar }} size={40} />
                  <View style={styles.testimonialAuthor}>
                    <Text style={[styles.testimonialName, { color: colors.textPrimary }]}>
                      {testimonial.author}
                    </Text>
                    <Text style={[styles.testimonialRole, { color: colors.textSecondary }]}>
                      {testimonial.role} at {testimonial.company}
                    </Text>
                  </View>
                  <View style={styles.testimonialRating}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <MaterialCommunityIcons key={i} name="star" size={12} color={colors.gold} />
                    ))}
                  </View>
                </View>
                <Text style={[styles.testimonialText, { color: colors.textPrimary }]} numberOfLines={4}>
                  "{testimonial.text}"
                </Text>
                <Text style={[styles.testimonialDate, { color: colors.textSecondary }]}>
                  {new Date(testimonial.date).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </ScrollView>
        </Card.Content>
      </Card>
    )
  );

  // Show loading or error states if needed
  if (!profileData) {
    return (
      <SafeAreaView style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <MaterialCommunityIcons name="account-circle" size={64} color={colors.muted} />
        <Text style={[styles.centerTitle, { color: colors.textPrimary }]}>Profile not found</Text>
        <Button mode="contained" onPress={onRefresh} style={styles.button}>
          Reload
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={currentTheme === 'dark' ? 'light-content' : 'dark-content'} />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Profile Header */}
        {renderProfileHeader()}
        
        {/* Stats Row */}
        {renderStatsRow()}
        
        {/* Skills Section */}
        {renderSkillsSection()}
        
        {/* Certifications Section */}
        {renderCertificationsSection()}
        
        {/* Social Media Section */}
        {renderSocialMediaSection()}
        
        {/* Portfolio Section */}
        {renderPortfolioSection()}
        
        {/* Testimonials Section */}
        {renderTestimonialsSection()}
        
        {/* Quick Actions */}
        <Card style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="flash" size={24} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quick Actions</Text>
            </View>
            
            <List.Item
              title="Privacy Settings"
              description="Manage who can see your profile"
              left={() => <MaterialCommunityIcons name="shield-account" size={24} color={colors.primary} />}
              right={() => <MaterialCommunityIcons name="chevron-right" size={24} color={colors.muted} />}
              onPress={() => setPrivacyModalVisible(true)}
              style={styles.listItem}
            />
            
            <List.Item
              title="Customization"
              description="Personalize your profile appearance"
              left={() => <MaterialCommunityIcons name="palette" size={24} color={colors.primary} />}
              right={() => <MaterialCommunityIcons name="chevron-right" size={24} color={colors.muted} />}
              onPress={() => setCustomizationModalVisible(true)}
              style={styles.listItem}
            />
            
            <List.Item
              title="Help & Support"
              description="Get help with your account"
              left={() => <MaterialCommunityIcons name="help-circle" size={24} color={colors.primary} />}
              right={() => <MaterialCommunityIcons name="chevron-right" size={24} color={colors.muted} />}
              onPress={() => openExternalLink('mailto:support@zimbuzz.com')}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>
        
        {/* Account Section */}
        <Card style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="account" size={24} color={colors.error} />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Account</Text>
            </View>
            
            <List.Item
              title="Sign Out"
              description="Sign out of your account"
              titleStyle={{ color: colors.error }}
              left={() => <MaterialCommunityIcons name="logout" size={24} color={colors.error} />}
              onPress={() => setLogoutDialogVisible(true)}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="qrcode"
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => Alert.alert('QR Code', 'Show profile QR code for easy sharing')}
      />
    </SafeAreaView>

      {/* Modals */}
      <Portal>
        {/* Edit Profile Modal */}
        <Modal
          visible={editModalVisible}
          onDismiss={() => setEditModalVisible(false)}
          contentContainerStyle={[styles.modalContent, { backgroundColor: colors.surface }]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Edit Profile</Text>
            <IconButton
              icon="close"
              onPress={() => setEditModalVisible(false)}
              iconColor={colors.textSecondary}
            />
          </View>
          
          <ScrollView style={styles.modalBody}>
            <TextInput
              label="Display Name"
              value={editForm.displayName}
              onChangeText={(text) => setEditForm({ ...editForm, displayName: text })}
              style={styles.modalInput}
              mode="outlined"
            />
            
            <TextInput
              label="Bio"
              value={editForm.bio}
              onChangeText={(text) => setEditForm({ ...editForm, bio: text })}
              style={styles.modalInput}
              mode="outlined"
              multiline
              numberOfLines={3}
            />
            
            <TextInput
              label="Job Title"
              value={editForm.jobTitle}
              onChangeText={(text) => setEditForm({ ...editForm, jobTitle: text })}
              style={styles.modalInput}
              mode="outlined"
            />
            
            <TextInput
              label="Location"
              value={editForm.location}
              onChangeText={(text) => setEditForm({ ...editForm, location: text })}
              style={styles.modalInput}
              mode="outlined"
            />
            
            <TextInput
              label="Website"
              value={editForm.website}
              onChangeText={(text) => setEditForm({ ...editForm, website: text })}
              style={styles.modalInput}
              mode="outlined"
            />
          </ScrollView>
          
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setEditModalVisible(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSaveProfile}
              style={styles.modalButton}
              buttonColor={colors.primary}
            >
              Save Changes
            </Button>
          </View>
        </Modal>
        
        {/* Customization Modal */}
        <Modal
          visible={customizationModalVisible}
          onDismiss={() => setCustomizationModalVisible(false)}
          contentContainerStyle={[styles.modalContent, { backgroundColor: colors.surface }]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Customize Profile</Text>
            <IconButton
              icon="close"
              onPress={() => setCustomizationModalVisible(false)}
              iconColor={colors.textSecondary}
            />
          </View>
          
          <ScrollView style={styles.modalBody}>
            <Text style={[styles.settingsSectionTitle, { color: colors.primary }]}>Theme</Text>
            {Object.entries(colorThemes).map(([themeKey, theme]) => (
              <TouchableOpacity
                key={themeKey}
                style={styles.themeOption}
                onPress={() => handleThemeChange(themeKey)}
              >
                <View style={[styles.themePreview, { backgroundColor: theme.primary }]} />
                <Text style={[styles.themeLabel, { color: colors.textPrimary }]}>
                  {themeKey.charAt(0).toUpperCase() + themeKey.slice(1)}
                </Text>
                {currentTheme === themeKey && (
                  <MaterialCommunityIcons name="check" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
            
            <Text style={[styles.settingsSectionTitle, { color: colors.primary }]}>Display Options</Text>
            
            <List.Item
              title="Show Statistics"
              description="Display follower and campaign stats"
              right={() => (
                <Switch
                  value={customizations.showStats}
                  onValueChange={(value) => setCustomizations({ ...customizations, showStats: value })}
                  color={colors.primary}
                />
              )}
            />
            
            <List.Item
              title="Show Skills"
              description="Display skills and expertise section"
              right={() => (
                <Switch
                  value={customizations.showSkills}
                  onValueChange={(value) => setCustomizations({ ...customizations, showSkills: value })}
                  color={colors.primary}
                />
              )}
            />
            
            <List.Item
              title="Show Portfolio"
              description="Display featured work and portfolio"
              right={() => (
                <Switch
                  value={customizations.showPortfolio}
                  onValueChange={(value) => setCustomizations({ ...customizations, showPortfolio: value })}
                  color={colors.primary}
                />
              )}
            />
            
            <List.Item
              title="Show Testimonials"
              description="Display client testimonials"
              right={() => (
                <Switch
                  value={customizations.showTestimonials}
                  onValueChange={(value) => setCustomizations({ ...customizations, showTestimonials: value })}
                  color={colors.primary}
                />
              )}
            />
          </ScrollView>
        </Modal>
        
        {/* Portfolio Gallery Modal */}
        <Modal
          visible={portfolioModalVisible}
          onDismiss={() => setPortfolioModalVisible(false)}
          contentContainerStyle={[styles.portfolioModalContent, { backgroundColor: colors.surface }]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Portfolio Gallery</Text>
            <IconButton
              icon="close"
              onPress={() => setPortfolioModalVisible(false)}
              iconColor={colors.textSecondary}
            />
          </View>
          
          <ScrollView style={styles.portfolioModalBody}>
            {/* Portfolio Categories */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.portfolioModalCategories}>
              <TouchableOpacity
                style={[
                  styles.portfolioModalCategoryChip,
                  { backgroundColor: portfolioFilter === 'all' ? colors.primary : colors.background }
                ]}
                onPress={() => handlePortfolioFilterChange('all')}
              >
                <Text style={[
                  styles.portfolioModalCategoryText,
                  { color: portfolioFilter === 'all' ? colors.white : colors.textPrimary }
                ]}>All Work</Text>
              </TouchableOpacity>
              {profileData.portfolio.categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.portfolioModalCategoryChip,
                    { backgroundColor: portfolioFilter === category.id ? category.color : colors.background }
                  ]}
                  onPress={() => handlePortfolioFilterChange(category.id)}
                >
                  <Text style={[
                    styles.portfolioModalCategoryText,
                    { color: portfolioFilter === category.id ? colors.white : colors.textPrimary }
                  ]}>{category.name} ({category.count})</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {/* Portfolio Grid */}
            <View style={styles.portfolioModalGrid}>
              {getFilteredPortfolioItems().map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.portfolioModalItem}
                  onPress={() => {
                    setPortfolioModalVisible(false);
                    handlePortfolioItemPress(item);
                  }}
                >
                  <View style={styles.portfolioModalItemImage}>
                    <Image
                      source={{ uri: item.thumbnailImage }}
                      style={styles.portfolioModalThumbnail}
                      resizeMode="cover"
                    />
                    {item.mediaType === 'video' && (
                      <View style={[styles.portfolioModalMediaIcon, { backgroundColor: colors.primary }]}>
                        <MaterialCommunityIcons name="play" size={20} color={colors.white} />
                      </View>
                    )}
                    {item.featured && (
                      <View style={[styles.portfolioModalFeaturedBadge, { backgroundColor: colors.warning }]}>
                        <MaterialCommunityIcons name="star" size={16} color={colors.white} />
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.portfolioModalItemContent}>
                    <Text style={[styles.portfolioModalItemTitle, { color: colors.textPrimary }]} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={[styles.portfolioModalItemBrand, { color: colors.primary }]} numberOfLines={1}>
                      {item.brand}
                    </Text>
                    <Text style={[styles.portfolioModalItemDate, { color: colors.textSecondary }]}>
                      {new Date(item.date).toLocaleDateString()}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Modal>
      </Portal>

        {/* Logout Confirmation Dialog */}
        <Dialog visible={logoutDialogVisible} onDismiss={() => setLogoutDialogVisible(false)}>
          <Dialog.Title style={{ color: colors.textPrimary }}>Sign Out</Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: colors.textSecondary }}>Are you sure you want to sign out of your account?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLogoutDialogVisible(false)} textColor={colors.textSecondary}>Cancel</Button>
            <Button onPress={handleLogout} textColor={colors.error}>Sign Out</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  // Enhanced Profile Styles
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  centerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 20,
  },
  button: {
    marginTop: 16,
  },
  
  // Header Styles
  headerContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  coverImageContainer: {
    height: 200,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  coverActions: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  coverActionButton: {
    elevation: 2,
  },
  profileInfoContainer: {
    padding: 20,
    paddingTop: 0,
  },
  avatarContainer: {
    position: 'relative',
    alignSelf: 'center',
    marginTop: -50,
    marginBottom: 16,
  },
  profileAvatar: {
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    borderRadius: 12,
    padding: 2,
    elevation: 2,
  },
  avatarEditButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  profileBio: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  profileMeta: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonContent: {
    height: 48,
  },
  // Stats Styles
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    paddingVertical: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: '60%',
    alignSelf: 'center',
  },
  
  // Section Styles
  sectionCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  
  // Skills Styles
  skillItem: {
    marginBottom: 16,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  skillName: {
    fontSize: 14,
    fontWeight: '600',
  },
  skillMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skillLevel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  skillProgressBar: {
    height: 6,
    borderRadius: 3,
  },
  
  // Certifications Styles
  certificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  certificationContent: {
    flex: 1,
  },
  certificationName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  certificationDate: {
    fontSize: 12,
  },
  
  // Social Media Styles
  socialMediaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  socialMediaHandle: {
    fontSize: 16,
    flex: 1,
  },
  
  // List Item Styles
  listItem: {
    paddingVertical: 8,
  },
  
  // Portfolio Styles
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesScroll: {
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  portfolioItem: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    marginBottom: 16,
  },
  portfolioItemImage: {
    position: 'relative',
  },
  portfolioThumbnail: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  mediaTypeIcon: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  portfolioItemContent: {
    padding: 12,
  },
  portfolioItemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    lineHeight: 18,
  },
  portfolioItemBrand: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  portfolioItemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  portfolioItemMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  portfolioItemRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    fontSize: 12,
  },
  
  // Testimonials Styles
  testimonialCard: {
    width: 280,
    padding: 16,
    marginRight: 16,
    borderRadius: 12,
    elevation: 1,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  testimonialAuthor: {
    flex: 1,
  },
  testimonialName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  testimonialRole: {
    fontSize: 12,
  },
  testimonialRating: {
    flexDirection: 'row',
    gap: 2,
  },
  testimonialText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  testimonialDate: {
    fontSize: 11,
    textAlign: 'right',
  },
  
  // Portfolio Modal Styles
  portfolioModalContent: {
    margin: 20,
    borderRadius: 16,
    maxHeight: '90%',
  },
  portfolioModalBody: {
    paddingHorizontal: 20,
    maxHeight: '80%',
  },
  portfolioModalCategories: {
    marginBottom: 20,
  },
  portfolioModalCategoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  portfolioModalCategoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  portfolioModalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  portfolioModalItem: {
    width: '47%',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    marginBottom: 16,
  },
  portfolioModalItemImage: {
    position: 'relative',
  },
  portfolioModalThumbnail: {
    width: '100%',
    height: 140,
  },
  portfolioModalMediaIcon: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  portfolioModalFeaturedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  portfolioModalItemContent: {
    padding: 12,
  },
  portfolioModalItemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    lineHeight: 18,
  },
  portfolioModalItemBrand: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  portfolioModalItemDate: {
    fontSize: 11,
  },
  // Modal Styles
  modalContent: {
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    paddingHorizontal: 20,
    maxHeight: '60%',
  },
  modalInput: {
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 16,
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  
  // Customization Styles
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 12,
  },
  themePreview: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  themeLabel: {
    fontSize: 16,
    flex: 1,
  },
  settingsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
  },
  
  // FAB and Misc Styles
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  bottomSpacer: {
    height: 80,
  },
  },
});

export default ProfileScreen;