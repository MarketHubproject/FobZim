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
  SegmentedButtons,
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
};

// Mock creators data
const mockCreators = [
  {
    id: '1',
    name: 'Tanaka Moyo',
    username: '@tanaka_creates',
    category: 'Lifestyle',
    location: 'Harare, Zimbabwe',
    followers: '25.5K',
    following: '1.2K',
    posts: '487',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    coverImage: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
    isVerified: true,
    isOnline: true,
    growth: '+12%',
    engagement: '4.2%',
    bio: 'Lifestyle content creator sharing the beauty of Zimbabwe 🇿🇼 | Travel • Food • Culture',
    tags: ['Travel', 'Food', 'Culture', 'Photography'],
    recentWork: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200',
      'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=200',
    ],
    collaborations: 15,
    rating: 4.8,
    responseTime: '< 2 hours',
    languages: ['English', 'Shona'],
  },
  {
    id: '2',
    name: 'Chipo Mukamuri',
    username: '@chipo_fashion',
    category: 'Fashion',
    location: 'Bulawayo, Zimbabwe',
    followers: '18.2K',
    following: '890',
    posts: '324',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b30c1b31?w=150',
    coverImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
    isVerified: false,
    isOnline: false,
    growth: '+8%',
    engagement: '5.1%',
    bio: 'Fashion designer & content creator promoting African fashion ✨ | Sustainable Fashion Advocate',
    tags: ['Fashion', 'Design', 'Sustainable', 'African'],
    recentWork: [
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200',
    ],
    collaborations: 8,
    rating: 4.6,
    responseTime: '< 4 hours',
    languages: ['English', 'Ndebele'],
  },
  {
    id: '3',
    name: 'Blessing Chitapa',
    username: '@blessing_travels',
    category: 'Travel',
    location: 'Victoria Falls, Zimbabwe',
    followers: '32.1K',
    following: '2.1K',
    posts: '612',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    coverImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
    isVerified: true,
    isOnline: true,
    growth: '+15%',
    engagement: '6.3%',
    bio: 'Travel content creator showcasing Zimbabwe\'s hidden gems 🌍 | Adventure • Nature • Culture',
    tags: ['Travel', 'Adventure', 'Nature', 'Tourism'],
    recentWork: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200',
      'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=200',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200',
    ],
    collaborations: 22,
    rating: 4.9,
    responseTime: '< 1 hour',
    languages: ['English', 'Shona', 'Ndebele'],
  },
  {
    id: '4',
    name: 'Rumbi Nhongo',
    username: '@rumbi_tech',
    category: 'Tech',
    location: 'Harare, Zimbabwe',
    followers: '14.8K',
    following: '567',
    posts: '289',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    coverImage: 'https://images.unsplash.com/photo-1518707711-e8327e0f7fcd?w=800',
    isVerified: true,
    isOnline: false,
    growth: '+20%',
    engagement: '7.2%',
    bio: 'Tech entrepreneur & content creator 👩‍💻 | AI • Web3 • Digital Innovation in Africa',
    tags: ['Tech', 'AI', 'Innovation', 'Entrepreneurship'],
    recentWork: [
      'https://images.unsplash.com/photo-1518707711-e8327e0f7fcd?w=200',
      'https://images.unsplash.com/photo-1563513446-b2b9ee53b0dc?w=200',
      'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=200',
    ],
    collaborations: 11,
    rating: 4.7,
    responseTime: '< 3 hours',
    languages: ['English'],
  },
  {
    id: '5',
    name: 'Takunda Zimba',
    username: '@takunda_food',
    category: 'Food',
    location: 'Mutare, Zimbabwe',
    followers: '21.3K',
    following: '1.5K',
    posts: '445',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    coverImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
    isVerified: false,
    isOnline: true,
    growth: '+11%',
    engagement: '5.8%',
    bio: 'Chef & food content creator celebrating Zimbabwean cuisine 🍽️ | Traditional Recipes • Food Culture',
    tags: ['Food', 'Cooking', 'Traditional', 'Culture'],
    recentWork: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200',
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200',
    ],
    collaborations: 18,
    rating: 4.5,
    responseTime: '< 5 hours',
    languages: ['English', 'Shona'],
  },
];

const categories = ['All', 'Lifestyle', 'Fashion', 'Travel', 'Tech', 'Food', 'Beauty', 'Sports'];
const sortOptions = [
  { label: 'Most Followers', value: 'followers' },
  { label: 'Highest Engagement', value: 'engagement' },
  { label: 'Most Recent', value: 'recent' },
  { label: 'Best Rating', value: 'rating' },
];

interface Creator {
  id: string;
  name: string;
  username: string;
  category: string;
  location: string;
  followers: string;
  following: string;
  posts: string;
  avatar: string;
  coverImage: string;
  isVerified: boolean;
  isOnline: boolean;
  growth: string;
  engagement: string;
  bio: string;
  tags: string[];
  recentWork: string[];
  collaborations: number;
  rating: number;
  responseTime: string;
  languages: string[];
}

export default function EnhancedCreatorsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('followers');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [followedCreators, setFollowedCreators] = useState<string[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filter and sort creators
  const filteredCreators = useMemo(() => {
    let filtered = mockCreators;

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(creator => creator.category === selectedCategory);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(creator =>
        creator.name.toLowerCase().includes(query) ||
        creator.username.toLowerCase().includes(query) ||
        creator.bio.toLowerCase().includes(query) ||
        creator.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'followers':
          const aFollowers = parseFloat(a.followers.replace('K', '')) * 1000;
          const bFollowers = parseFloat(b.followers.replace('K', '')) * 1000;
          return bFollowers - aFollowers;
        case 'engagement':
          return parseFloat(b.engagement) - parseFloat(a.engagement);
        case 'rating':
          return b.rating - a.rating;
        case 'recent':
          return parseInt(b.posts) - parseInt(a.posts);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, sortBy]);

  const handleFollowCreator = (creatorId: string) => {
    if (followedCreators.includes(creatorId)) {
      setFollowedCreators(prev => prev.filter(id => id !== creatorId));
      Alert.alert('Success', 'Unfollowed creator');
    } else {
      setFollowedCreators(prev => [...prev, creatorId]);
      Alert.alert('Success', 'Now following creator!');
    }
  };

  const handleCreatorPress = (creator: Creator) => {
    setSelectedCreator(creator);
    setModalVisible(true);
  };

  const handleCollaborate = (creator: Creator) => {
    setModalVisible(false);
    Alert.alert(
      'Start Collaboration',
      `Would you like to send a collaboration request to ${creator.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Request',
          onPress: () => Alert.alert('Success', 'Collaboration request sent!')
        },
      ]
    );
  };

  const renderCreatorCard = ({ item }: { item: Creator }) => (
    <TouchableOpacity
      style={[
        styles.creatorCard,
        viewMode === 'list' ? styles.listCard : styles.gridCard
      ]}
      onPress={() => handleCreatorPress(item)}
    >
      <Card style={styles.card}>
        {/* Cover Image */}
        <Image source={{ uri: item.coverImage }} style={styles.coverImage} />
        
        {/* Online Status */}
        {item.isOnline && (
          <View style={styles.onlineIndicator}>
            <View style={styles.onlineDot} />
          </View>
        )}

        <Card.Content style={styles.cardContent}>
          {/* Avatar and Basic Info */}
          <View style={styles.creatorHeader}>
            <Avatar.Image
              source={{ uri: item.avatar }}
              size={50}
              style={styles.avatar}
            />
            {item.isVerified && (
              <View style={styles.verifiedBadge}>
                <MaterialCommunityIcons name="check-circle" size={16} color={colors.primary} />
              </View>
            )}
            
            <View style={styles.creatorInfo}>
              <Text style={styles.creatorName}>{item.name}</Text>
              <Text style={styles.username}>{item.username}</Text>
              <Text style={styles.location}>{item.location}</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{item.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{item.engagement}</Text>
              <Text style={styles.statLabel}>Engagement</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{item.rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>

          {/* Category and Growth */}
          <View style={styles.metaRow}>
            <Chip
              mode="outlined"
              textStyle={styles.chipText}
              style={styles.categoryChip}
            >
              {item.category}
            </Chip>
            <Text style={styles.growthText}>{item.growth} growth</Text>
          </View>

          {/* Follow Button */}
          <Button
            mode={followedCreators.includes(item.id) ? 'outlined' : 'contained'}
            onPress={() => handleFollowCreator(item.id)}
            style={styles.followButton}
            buttonColor={followedCreators.includes(item.id) ? 'transparent' : colors.primary}
            textColor={followedCreators.includes(item.id) ? colors.primary : colors.white}
            labelStyle={styles.followButtonLabel}
          >
            {followedCreators.includes(item.id) ? 'Following' : 'Follow'}
          </Button>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderCreatorModal = () => {
    if (!selectedCreator) return null;

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

            {/* Cover Image */}
            <Image source={{ uri: selectedCreator.coverImage }} style={styles.modalCoverImage} />

            {/* Profile Section */}
            <View style={styles.modalProfileSection}>
              <Avatar.Image
                source={{ uri: selectedCreator.avatar }}
                size={80}
                style={styles.modalAvatar}
              />
              {selectedCreator.isVerified && (
                <View style={styles.modalVerifiedBadge}>
                  <MaterialCommunityIcons name="check-circle" size={20} color={colors.primary} />
                </View>
              )}
              
              <Text style={styles.modalCreatorName}>{selectedCreator.name}</Text>
              <Text style={styles.modalUsername}>{selectedCreator.username}</Text>
              <Text style={styles.modalBio}>{selectedCreator.bio}</Text>

              {/* Stats */}
              <View style={styles.modalStatsRow}>
                <View style={styles.modalStatItem}>
                  <Text style={styles.modalStatValue}>{selectedCreator.followers}</Text>
                  <Text style={styles.modalStatLabel}>Followers</Text>
                </View>
                <View style={styles.modalStatItem}>
                  <Text style={styles.modalStatValue}>{selectedCreator.following}</Text>
                  <Text style={styles.modalStatLabel}>Following</Text>
                </View>
                <View style={styles.modalStatItem}>
                  <Text style={styles.modalStatValue}>{selectedCreator.posts}</Text>
                  <Text style={styles.modalStatLabel}>Posts</Text>
                </View>
              </View>

              {/* Tags */}
              <View style={styles.tagsContainer}>
                {selectedCreator.tags.map((tag, index) => (
                  <Chip key={index} style={styles.tag} textStyle={styles.tagText}>
                    {tag}
                  </Chip>
                ))}
              </View>

              {/* Professional Info */}
              <Divider style={styles.divider} />
              
              <View style={styles.professionalInfo}>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="star" size={20} color={colors.warning} />
                  <Text style={styles.infoText}>Rating: {selectedCreator.rating}/5</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="clock" size={20} color={colors.accent} />
                  <Text style={styles.infoText}>Response: {selectedCreator.responseTime}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="handshake" size={20} color={colors.success} />
                  <Text style={styles.infoText}>Collaborations: {selectedCreator.collaborations}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="translate" size={20} color={colors.primary} />
                  <Text style={styles.infoText}>Languages: {selectedCreator.languages.join(', ')}</Text>
                </View>
              </View>

              {/* Recent Work */}
              <Divider style={styles.divider} />
              
              <Text style={styles.sectionTitle}>Recent Work</Text>
              <View style={styles.recentWork}>
                {selectedCreator.recentWork.map((work, index) => (
                  <Image key={index} source={{ uri: work }} style={styles.workImage} />
                ))}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <Button
                  mode={followedCreators.includes(selectedCreator.id) ? 'outlined' : 'contained'}
                  onPress={() => handleFollowCreator(selectedCreator.id)}
                  style={[styles.actionButton, { marginRight: 8 }]}
                  buttonColor={followedCreators.includes(selectedCreator.id) ? 'transparent' : colors.primary}
                >
                  {followedCreators.includes(selectedCreator.id) ? 'Following' : 'Follow'}
                </Button>
                <Button
                  mode="contained"
                  onPress={() => handleCollaborate(selectedCreator)}
                  style={styles.actionButton}
                  buttonColor={colors.secondary}
                >
                  Collaborate
                </Button>
              </View>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="Creators" titleStyle={styles.headerTitle} />
        <Appbar.Action
          icon={viewMode === 'grid' ? 'view-list' : 'view-grid'}
          iconColor={colors.white}
          onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
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
          placeholder="Search creators..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
        />

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map((category) => (
            <Chip
              key={category}
              selected={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.selectedCategoryChip
              ]}
              textStyle={[
                styles.categoryChipText,
                selectedCategory === category && styles.selectedCategoryChipText
              ]}
            >
              {category}
            </Chip>
          ))}
        </ScrollView>

        {/* Sort Options */}
        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
          {filteredCreators.length} creator{filteredCreators.length !== 1 ? 's' : ''} found
        </Text>

        {/* Creators List */}
        <FlatList
          data={filteredCreators}
          renderItem={renderCreatorCard}
          keyExtractor={(item) => item.id}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode} // Force re-render when view mode changes
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Creator Detail Modal */}
      {renderCreatorModal()}

      {/* Floating Action Button */}
      <FAB
        icon="account-plus"
        style={styles.fab}
        onPress={() => Alert.alert('Become a Creator', 'Join our creator program!')}
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
  categoryContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  categoryChip: {
    marginRight: 8,
    backgroundColor: colors.surface,
  },
  selectedCategoryChip: {
    backgroundColor: colors.primary,
  },
  categoryChipText: {
    color: colors.textPrimary,
  },
  selectedCategoryChipText: {
    color: colors.white,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  sortLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 12,
    fontWeight: '600',
  },
  sortOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginRight: 8,
  },
  selectedSortOption: {
    backgroundColor: colors.secondary,
  },
  sortOptionText: {
    fontSize: 12,
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
    paddingHorizontal: 8,
    paddingBottom: 100,
  },
  creatorCard: {
    flex: 1,
    margin: 8,
  },
  gridCard: {
    maxWidth: (width - 48) / 2,
  },
  listCard: {
    maxWidth: width - 32,
  },
  card: {
    elevation: 3,
    backgroundColor: colors.surface,
  },
  coverImage: {
    height: 80,
    width: '100%',
  },
  onlineIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.white,
  },
  cardContent: {
    padding: 12,
  },
  creatorHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    marginBottom: 8,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 30,
    right: 10,
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 2,
  },
  creatorInfo: {
    alignItems: 'center',
  },
  creatorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  username: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  location: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chipText: {
    fontSize: 10,
  },
  growthText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
  },
  followButton: {
    marginTop: 8,
  },
  followButtonLabel: {
    fontSize: 12,
  },
  // Modal Styles
  modalContent: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginVertical: 50,
    borderRadius: 12,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
  },
  closeButton: {
    padding: 4,
  },
  modalCoverImage: {
    height: 150,
    width: '100%',
    marginBottom: -40,
  },
  modalProfileSection: {
    padding: 20,
    alignItems: 'center',
  },
  modalAvatar: {
    marginBottom: 12,
    borderWidth: 4,
    borderColor: colors.white,
  },
  modalVerifiedBadge: {
    position: 'absolute',
    top: 50,
    right: 120,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 2,
  },
  modalCreatorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  modalUsername: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  modalBio: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  modalStatItem: {
    alignItems: 'center',
  },
  modalStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  modalStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  tag: {
    margin: 4,
    backgroundColor: colors.background,
  },
  tagText: {
    fontSize: 12,
  },
  divider: {
    width: '100%',
    marginVertical: 20,
  },
  professionalInfo: {
    width: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  recentWork: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  workImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    width: '100%',
  },
  actionButton: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
});