import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Dimensions
} from 'react-native';
import {
  Card,
  Text,
  IconButton,
  Searchbar,
  Chip,
  FAB,
  Menu,
  Avatar,
  Badge,
  ActivityIndicator,
  Button
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { messagingService, Conversation, ConversationFilter } from '../services/messagingService';
import { ConversationListNavigationProp } from '../types/navigation';

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
  info: '#2196F3',
  unread: '#E3F2FD'
};

interface ConversationsScreenProps {
  navigation: ConversationListNavigationProp;
}

const ConversationsScreen: React.FC<ConversationsScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'campaigns'>('all');
  const [menuVisible, setMenuVisible] = useState(false);

  // Filter options
  const filterOptions = [
    { key: 'all', label: 'All', icon: 'message' },
    { key: 'unread', label: 'Unread', icon: 'message-badge' },
    { key: 'campaigns', label: 'Campaigns', icon: 'briefcase' }
  ];

  // Subscribe to real-time conversations
  useEffect(() => {
    if (!user?.uid) return;

    setLoading(true);
    const unsubscribe = messagingService.subscribeToConversations(
      user.uid,
      (newConversations) => {
        setConversations(newConversations);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Filter conversations based on search and filters
  useEffect(() => {
    let filtered = conversations;

    // Apply search filter
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(conversation => {
        const otherParticipantId = conversation.participants.find(p => p !== user?.uid);
        const otherParticipant = otherParticipantId ? conversation.participantDetails[otherParticipantId] : null;
        
        return (
          otherParticipant?.name.toLowerCase().includes(searchLower) ||
          conversation.lastMessage?.content.toLowerCase().includes(searchLower) ||
          conversation.campaignTitle?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply type filters
    switch (selectedFilter) {
      case 'unread':
        filtered = filtered.filter(conv => (conv.unreadCount[user?.uid || ''] || 0) > 0);
        break;
      case 'campaigns':
        filtered = filtered.filter(conv => conv.type === 'campaign');
        break;
      default:
        break;
    }

    setFilteredConversations(filtered);
  }, [conversations, searchQuery, selectedFilter, user?.uid]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleConversationPress = useCallback((conversation: Conversation) => {
    // Mark messages as read
    if (user?.uid && conversation.unreadCount[user.uid] > 0) {
      messagingService.markMessagesAsRead(conversation.id, user.uid);
    }

    // Get other participant info
    const otherParticipantId = conversation.participants.find(p => p !== user?.uid);

    // Navigate to chat screen
    navigation.navigate('Chat', {
      conversationId: conversation.id,
      participantName: getOtherParticipantName(conversation),
      participantAvatar: getOtherParticipantAvatar(conversation),
      participantId: otherParticipantId,
      campaignId: conversation.campaignId,
      campaignTitle: conversation.campaignTitle
    });
  }, [navigation, user?.uid]);

  const handleNewMessage = useCallback(() => {
    // TODO: Implement new message screen
    Alert.alert('New Message', 'New message feature coming soon!');
  }, []);

  const handleCreateMockConversations = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      await messagingService.createMockConversations(user.uid);
      Alert.alert('Success', 'Demo conversations created!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create demo conversations');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const getOtherParticipantName = (conversation: Conversation): string => {
    const otherParticipantId = conversation.participants.find(p => p !== user?.uid);
    return otherParticipantId ? conversation.participantDetails[otherParticipantId]?.name || 'Unknown' : 'Unknown';
  };

  const getOtherParticipantAvatar = (conversation: Conversation): string | undefined => {
    const otherParticipantId = conversation.participants.find(p => p !== user?.uid);
    return otherParticipantId ? conversation.participantDetails[otherParticipantId]?.avatar : undefined;
  };

  const getConversationSubtitle = (conversation: Conversation): string => {
    if (!conversation.lastMessage) return 'No messages yet';
    
    const isOwnMessage = conversation.lastMessage.senderId === user?.uid;
    const prefix = isOwnMessage ? 'You: ' : '';
    
    let content = conversation.lastMessage.content;
    if (conversation.lastMessage.type === 'image') content = '📷 Image';
    if (conversation.lastMessage.type === 'file') content = '📎 File';
    if (conversation.lastMessage.type === 'campaign_reference') content = '🎯 Campaign';
    
    return `${prefix}${content}`;
  };

  const formatTime = (timestamp: any): string => {
    if (!timestamp) return '';
    
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes < 1 ? 'now' : `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return diffInDays === 1 ? '1d' : `${diffInDays}d`;
    }
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const unreadCount = item.unreadCount[user?.uid || ''] || 0;
    const otherParticipantName = getOtherParticipantName(item);
    const otherParticipantAvatar = getOtherParticipantAvatar(item);

    return (
      <TouchableOpacity onPress={() => handleConversationPress(item)}>
        <Card 
          style={[
            styles.conversationCard,
            unreadCount > 0 && styles.unreadCard
          ]} 
          elevation={unreadCount > 0 ? 2 : 1}
        >
          <Card.Content style={styles.conversationContent}>
            <View style={styles.conversationRow}>
              <View style={styles.avatarContainer}>
                <Avatar.Image
                  size={50}
                  source={{ 
                    uri: otherParticipantAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' 
                  }}
                />
                {unreadCount > 0 && (
                  <Badge style={styles.unreadBadge} size={20}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </View>

              <View style={styles.conversationDetails}>
                <View style={styles.conversationHeader}>
                  <Text style={[styles.participantName, unreadCount > 0 && styles.unreadText]}>
                    {otherParticipantName}
                  </Text>
                  {item.campaignTitle && (
                    <MaterialCommunityIcons name="briefcase" size={16} color={colors.primary} />
                  )}
                  <Text style={styles.timeText}>
                    {formatTime(item.updatedAt)}
                  </Text>
                </View>

                {item.campaignTitle && (
                  <Text style={styles.campaignTitle} numberOfLines={1}>
                    🎯 {item.campaignTitle}
                  </Text>
                )}

                <Text 
                  style={[styles.lastMessage, unreadCount > 0 && styles.unreadMessage]} 
                  numberOfLines={2}
                >
                  {getConversationSubtitle(item)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons 
        name="message-outline" 
        size={64} 
        color={colors.muted} 
      />
      <Text style={styles.emptyTitle}>No conversations yet</Text>
      <Text style={styles.emptyDescription}>
        {selectedFilter === 'unread' 
          ? "You're all caught up with your messages!" 
          : "Start connecting with creators and brands to grow your network"}
      </Text>
      
      {selectedFilter === 'all' && (
        <View style={styles.emptyActions}>
          <Button 
            mode="contained" 
            onPress={handleNewMessage}
            style={styles.emptyButton}
            icon="message-plus"
          >
            Start New Conversation
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={handleCreateMockConversations}
            style={styles.emptyButton}
            icon="flask"
          >
            Create Demo Conversations
          </Button>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading conversations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Searchbar
          placeholder="Search conversations..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={colors.primary}
        />
        
        <View style={styles.filtersContainer}>
          <FlatList
            horizontal
            data={filterOptions}
            keyExtractor={(item) => item.key}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Chip
                selected={selectedFilter === item.key}
                onPress={() => setSelectedFilter(item.key as any)}
                icon={item.icon}
                style={[
                  styles.filterChip,
                  selectedFilter === item.key && styles.selectedChip
                ]}
                textStyle={selectedFilter === item.key ? styles.selectedChipText : styles.chipText}
              >
                {item.label}
              </Chip>
            )}
            contentContainerStyle={styles.filterList}
          />
        </View>
      </View>

      {/* Conversations List */}
      <FlatList
        data={filteredConversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />

      {/* New Message FAB */}
        <View style={styles.fabContainer}>
          <FAB
            icon="magnify"
            style={[styles.fab, styles.searchFab]}
            size="medium"
            onPress={() => navigation?.navigate('MessageSearch', {})}
          />
          <FAB
            icon="plus"
            style={styles.fab}
            onPress={handleNewMessage}
          />
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  headerContainer: {
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchBar: {
    marginBottom: 12,
    elevation: 0,
    backgroundColor: colors.background,
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterList: {
    paddingRight: 16,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: colors.background,
  },
  selectedChip: {
    backgroundColor: colors.primary,
  },
  chipText: {
    color: colors.textSecondary,
  },
  selectedChipText: {
    color: colors.white,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  conversationCard: {
    marginBottom: 12,
    backgroundColor: colors.white,
  },
  unreadCard: {
    backgroundColor: colors.unread,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  conversationContent: {
    paddingVertical: 12,
  },
  conversationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  unreadBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.error,
  },
  conversationDetails: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  participantName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginRight: 8,
  },
  unreadText: {
    fontWeight: '600',
  },
  timeText: {
    fontSize: 12,
    color: colors.muted,
  },
  campaignTitle: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  unreadMessage: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  emptyActions: {
    width: '100%',
    alignItems: 'center',
  },
  emptyButton: {
    marginBottom: 12,
    minWidth: 200,
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    alignItems: 'flex-end',
  },
  fab: {
    marginBottom: 12,
  },
  searchFab: {
    backgroundColor: colors.secondary,
  },
});

export default ConversationsScreen;