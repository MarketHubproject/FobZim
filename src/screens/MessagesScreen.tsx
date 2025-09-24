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

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  read: boolean;
  type: 'text' | 'image' | 'campaign_reference';
}

interface Conversation {
  id: string;
  participants: string[];
  participantDetails: {
    [key: string]: {
      name: string;
      avatar?: string;
      isOnline?: boolean;
    };
  };
  lastMessage?: Message;
  unreadCount: { [key: string]: number };
  updatedAt: Date;
  type: 'direct' | 'campaign';
  campaignTitle?: string;
  campaignId?: string;
}

// Mock conversations data
const mockConversations: Conversation[] = [
  {
    id: '1',
    participants: ['user1', 'tafa_zw'],
    participantDetails: {
      tafa_zw: {
        name: 'Tafadzwa Mukamuri',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616c0763e85',
        isOnline: true
      }
    },
    lastMessage: {
      id: 'msg1',
      senderId: 'tafa_zw',
      content: 'Hey! Just saw your campaign application. Looks great! 🎉',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: false,
      type: 'text'
    },
    unreadCount: { user1: 2 },
    updatedAt: new Date(Date.now() - 30 * 60 * 1000),
    type: 'campaign',
    campaignTitle: 'Tourism Zimbabwe Campaign'
  },
  {
    id: '2',
    participants: ['user1', 'chipo_zw'],
    participantDetails: {
      chipo_zw: {
        name: 'Chipo Musarurwa',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
        isOnline: false
      }
    },
    lastMessage: {
      id: 'msg2',
      senderId: 'user1',
      content: 'Thanks for the collaboration opportunity! When do we start?',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: true,
      type: 'text'
    },
    unreadCount: { user1: 0 },
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: 'direct'
  },
  {
    id: '3',
    participants: ['user1', 'brand_nike'],
    participantDetails: {
      brand_nike: {
        name: 'Nike Zimbabwe',
        avatar: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
        isOnline: true
      }
    },
    lastMessage: {
      id: 'msg3',
      senderId: 'brand_nike',
      content: 'Congratulations! You have been selected for our Air Jordan campaign 🏆',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      read: false,
      type: 'text'
    },
    unreadCount: { user1: 1 },
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    type: 'campaign',
    campaignTitle: 'Air Jordan Launch Campaign'
  },
  {
    id: '4',
    participants: ['user1', 'kuda_music'],
    participantDetails: {
      kuda_music: {
        name: 'Kuda Mahachi',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
        isOnline: false
      }
    },
    lastMessage: {
      id: 'msg4',
      senderId: 'kuda_music',
      content: '📷 Check out this behind-the-scenes shot!',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
      type: 'image'
    },
    unreadCount: { user1: 0 },
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    type: 'direct'
  }
];

export default function MessagesScreen() {
  console.log('✅ MessagesScreen loaded - Latest Build [v1.2.1] - ' + new Date().toLocaleTimeString());
  
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>(mockConversations);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'campaigns'>('all');
  const [menuVisible, setMenuVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const currentUserId = 'user1'; // Mock current user

  // Filter options
  const filterOptions = [
    { key: 'all', label: 'All', icon: 'message' },
    { key: 'unread', label: 'Unread', icon: 'message-badge' },
    { key: 'campaigns', label: 'Campaigns', icon: 'briefcase' }
  ];

  // Filter conversations based on search and filters
  useEffect(() => {
    let filtered = conversations;

    // Apply search filter
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(conversation => {
        const otherParticipantId = conversation.participants.find(p => p !== currentUserId);
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
        filtered = filtered.filter(conv => (conv.unreadCount[currentUserId] || 0) > 0);
        break;
      case 'campaigns':
        filtered = filtered.filter(conv => conv.type === 'campaign');
        break;
      default:
        break;
    }

    setFilteredConversations(filtered);
  }, [conversations, searchQuery, selectedFilter]);

  const showSuccessToast = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSuccessMessage('');
    }, 3000);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API refresh
    setTimeout(() => {
      setRefreshing(false);
      showSuccessToast('🔄 Messages refreshed!');
    }, 1500);
  }, []);

  const handleConversationPress = useCallback((conversation: Conversation) => {
    // Mark messages as read
    if (conversation.unreadCount[currentUserId] > 0) {
      const updatedConversations = conversations.map(conv => {
        if (conv.id === conversation.id) {
          return {
            ...conv,
            unreadCount: { ...conv.unreadCount, [currentUserId]: 0 }
          };
        }
        return conv;
      });
      setConversations(updatedConversations);
    }

    // Get other participant info
    const otherParticipantId = conversation.participants.find(p => p !== currentUserId);
    const otherParticipant = otherParticipantId ? conversation.participantDetails[otherParticipantId] : null;

    // Show mock navigation message
    showSuccessToast(`💬 Opening chat with ${otherParticipant?.name || 'Unknown'}`);
  }, [conversations]);

  const handleNewMessage = useCallback(() => {
    showSuccessToast('✨ New message feature coming soon!');
  }, []);

  const handleCreateMockConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: `mock_${Date.now()}`,
      participants: [currentUserId, 'new_user'],
      participantDetails: {
        new_user: {
          name: 'New Creator',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
          isOnline: true
        }
      },
      lastMessage: {
        id: `msg_${Date.now()}`,
        senderId: 'new_user',
        content: 'Hi! I saw your work and would love to collaborate! 🤝',
        timestamp: new Date(),
        read: false,
        type: 'text'
      },
      unreadCount: { [currentUserId]: 1 },
      updatedAt: new Date(),
      type: 'direct'
    };

    setConversations(prev => [newConversation, ...prev]);
    showSuccessToast('🎉 Demo conversation created!');
  }, []);

  const getOtherParticipantName = (conversation: Conversation): string => {
    const otherParticipantId = conversation.participants.find(p => p !== currentUserId);
    return otherParticipantId ? conversation.participantDetails[otherParticipantId]?.name || 'Unknown' : 'Unknown';
  };

  const getOtherParticipantAvatar = (conversation: Conversation): string | undefined => {
    const otherParticipantId = conversation.participants.find(p => p !== currentUserId);
    return otherParticipantId ? conversation.participantDetails[otherParticipantId]?.avatar : undefined;
  };

  const isOtherParticipantOnline = (conversation: Conversation): boolean => {
    const otherParticipantId = conversation.participants.find(p => p !== currentUserId);
    return otherParticipantId ? conversation.participantDetails[otherParticipantId]?.isOnline || false : false;
  };

  const getConversationSubtitle = (conversation: Conversation): string => {
    if (!conversation.lastMessage) return 'No messages yet';
    
    const isOwnMessage = conversation.lastMessage.senderId === currentUserId;
    const prefix = isOwnMessage ? 'You: ' : '';
    
    let content = conversation.lastMessage.content;
    if (conversation.lastMessage.type === 'image') content = '📷 Image';
    if (conversation.lastMessage.type === 'campaign_reference') content = '🎯 Campaign';
    
    return `${prefix}${content}`;
  };

  const formatTime = (timestamp: Date): string => {
    const now = new Date();
    const diffInHours = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
    
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

  const getTotalUnreadCount = () => {
    return conversations.reduce((total, conv) => total + (conv.unreadCount[currentUserId] || 0), 0);
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const unreadCount = item.unreadCount[currentUserId] || 0;
    const otherParticipantName = getOtherParticipantName(item);
    const otherParticipantAvatar = getOtherParticipantAvatar(item);
    const isOnline = isOtherParticipantOnline(item);

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
                {isOnline && (
                  <View style={styles.onlineIndicator} />
                )}
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
            onPress={handleCreateMockConversation}
            style={styles.emptyButton}
            icon="flask"
          >
            Create Demo Conversation
          </Button>
        </View>
      )}
    </View>
  );

  // Success message component
  const SuccessMessage = () => {
    if (!showSuccess) return null;
    
    return (
      <View style={styles.successMessage}>
        <MaterialCommunityIcons name="check-circle" size={20} color={colors.white} />
        <Text style={styles.successText}>{successMessage}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Messages</Text>
          {getTotalUnreadCount() > 0 && (
            <Badge style={styles.headerBadge} size={24}>
              {getTotalUnreadCount() > 99 ? '99+' : getTotalUnreadCount()}
            </Badge>
          )}
        </View>
        
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
                {item.key === 'unread' && getTotalUnreadCount() > 0 && ` (${getTotalUnreadCount()})`}
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
        contentContainerStyle={[
          styles.listContent,
          filteredConversations.length === 0 && styles.emptyListContent
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />

      {/* Success Message */}
      <SuccessMessage />

      {/* New Message FAB */}
      <View style={styles.fabContainer}>
        <FAB
          icon="magnify"
          style={[styles.fab, styles.searchFab]}
          size="small"
          onPress={() => showSuccessToast('🔍 Search feature coming soon!')}
        />
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={handleNewMessage}
          label="New"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerBadge: {
    backgroundColor: colors.error,
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
  emptyListContent: {
    flexGrow: 1,
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
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.white,
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
    backgroundColor: colors.primary,
  },
  searchFab: {
    backgroundColor: colors.secondary,
  },
  successMessage: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 1000,
    backgroundColor: colors.success,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 8,
  },
  successText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
});