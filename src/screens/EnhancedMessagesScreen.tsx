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
  KeyboardAvoidingView,
  Platform,
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
  IconButton,
  Surface,
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
  online: '#4CAF50',
  away: '#FF9800',
  offline: '#9E9E9E',
  sent: '#E3F2FD',
  received: '#F5F5F5',
};

// Mock conversations data
const mockConversations = [
  {
    id: '1',
    type: 'campaign',
    participant: {
      id: 'brand_1',
      name: 'Zimbabwe Tourism Authority',
      avatar: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150',
      isVerified: true,
      status: 'online',
      role: 'brand',
    },
    lastMessage: {
      id: 'msg_1',
      text: 'Great! We\'re excited about your application. When can you start creating content for Victoria Falls?',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      senderId: 'brand_1',
      isRead: false,
    },
    unreadCount: 2,
    campaign: {
      title: 'Zimbabwe Tourism Campaign',
      status: 'active',
    },
    messages: [
      {
        id: 'msg_1',
        text: 'Hi! I reviewed your application for the Zimbabwe Tourism campaign.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        senderId: 'brand_1',
        type: 'text',
      },
      {
        id: 'msg_2',
        text: 'Your portfolio looks amazing! I love how you capture the essence of travel.',
        timestamp: new Date(Date.now() - 90 * 60 * 1000),
        senderId: 'brand_1',
        type: 'text',
      },
      {
        id: 'msg_3',
        text: 'Thank you so much! I\'m really passionate about showcasing Zimbabwe\'s beauty.',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        senderId: 'me',
        type: 'text',
      },
      {
        id: 'msg_4',
        text: 'Great! We\'re excited about your application. When can you start creating content for Victoria Falls?',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        senderId: 'brand_1',
        type: 'text',
      },
    ],
  },
  {
    id: '2',
    type: 'collaboration',
    participant: {
      id: 'creator_1',
      name: 'Chipo Mukamuri',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b30c1b31?w=150',
      isVerified: false,
      status: 'away',
      role: 'creator',
    },
    lastMessage: {
      id: 'msg_5',
      text: 'Let\'s collaborate on that fashion project! I have some great ideas.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      senderId: 'me',
      isRead: true,
    },
    unreadCount: 0,
    messages: [
      {
        id: 'msg_5',
        text: 'Hey! I saw your work on Instagram. Would you be interested in collaborating on a sustainable fashion project?',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        senderId: 'creator_1',
        type: 'text',
      },
      {
        id: 'msg_6',
        text: 'That sounds amazing! I\'m very passionate about sustainable fashion.',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        senderId: 'me',
        type: 'text',
      },
      {
        id: 'msg_7',
        text: 'Let\'s collaborate on that fashion project! I have some great ideas.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        senderId: 'me',
        type: 'text',
      },
    ],
  },
  {
    id: '3',
    type: 'support',
    participant: {
      id: 'support_1',
      name: 'ZimBuzz Support',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      isVerified: true,
      status: 'online',
      role: 'support',
    },
    lastMessage: {
      id: 'msg_8',
      text: 'Your account verification has been completed! 🎉',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      senderId: 'support_1',
      isRead: true,
    },
    unreadCount: 0,
    messages: [
      {
        id: 'msg_8',
        text: 'Hi! I need help with account verification. I submitted my documents yesterday.',
        timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000),
        senderId: 'me',
        type: 'text',
      },
      {
        id: 'msg_9',
        text: 'Thanks for reaching out! I can see your verification request. Let me check the status.',
        timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000),
        senderId: 'support_1',
        type: 'text',
      },
      {
        id: 'msg_10',
        text: 'Your account verification has been completed! 🎉',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        senderId: 'support_1',
        type: 'text',
      },
    ],
  },
  {
    id: '4',
    type: 'campaign',
    participant: {
      id: 'brand_2',
      name: 'EcoStyle Zimbabwe',
      avatar: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=150',
      isVerified: false,
      status: 'offline',
      role: 'brand',
    },
    lastMessage: {
      id: 'msg_11',
      text: 'We\'d love to work with you on our sustainable fashion campaign.',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      senderId: 'brand_2',
      isRead: true,
    },
    unreadCount: 0,
    campaign: {
      title: 'Sustainable Fashion Showcase',
      status: 'pending',
    },
    messages: [
      {
        id: 'msg_11',
        text: 'We\'d love to work with you on our sustainable fashion campaign.',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        senderId: 'brand_2',
        type: 'text',
      },
    ],
  },
  {
    id: '5',
    type: 'networking',
    participant: {
      id: 'creator_2',
      name: 'Blessing Chitapa',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      isVerified: true,
      status: 'online',
      role: 'creator',
    },
    lastMessage: {
      id: 'msg_12',
      text: 'Thanks for the follow! Love your travel content 📸',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      senderId: 'creator_2',
      isRead: true,
    },
    unreadCount: 0,
    messages: [
      {
        id: 'msg_12',
        text: 'Thanks for the follow! Love your travel content 📸',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        senderId: 'creator_2',
        type: 'text',
      },
    ],
  },
];

interface Conversation {
  id: string;
  type: 'campaign' | 'collaboration' | 'support' | 'networking';
  participant: {
    id: string;
    name: string;
    avatar: string;
    isVerified: boolean;
    status: 'online' | 'away' | 'offline';
    role: 'brand' | 'creator' | 'support';
  };
  lastMessage: {
    id: string;
    text: string;
    timestamp: Date;
    senderId: string;
    isRead: boolean;
  };
  unreadCount: number;
  campaign?: {
    title: string;
    status: string;
  };
  messages: Message[];
}

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  senderId: string;
  type: 'text' | 'image' | 'file';
}

const conversationFilters = ['All', 'Campaigns', 'Creators', 'Support', 'Unread'];

export default function EnhancedMessagesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Filter conversations based on search and filter
  const filteredConversations = useMemo(() => {
    let filtered = mockConversations;

    // Apply filter
    if (selectedFilter !== 'All') {
      switch (selectedFilter) {
        case 'Campaigns':
          filtered = filtered.filter(conv => conv.type === 'campaign');
          break;
        case 'Creators':
          filtered = filtered.filter(conv => conv.participant.role === 'creator');
          break;
        case 'Support':
          filtered = filtered.filter(conv => conv.type === 'support');
          break;
        case 'Unread':
          filtered = filtered.filter(conv => conv.unreadCount > 0);
          break;
      }
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(conv =>
        conv.participant.name.toLowerCase().includes(query) ||
        conv.lastMessage.text.toLowerCase().includes(query) ||
        (conv.campaign && conv.campaign.title.toLowerCase().includes(query))
      );
    }

    // Sort by last message timestamp
    filtered.sort((a, b) => b.lastMessage.timestamp.getTime() - a.lastMessage.timestamp.getTime());

    return filtered;
  }, [searchQuery, selectedFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return colors.online;
      case 'away': return colors.away;
      default: return colors.offline;
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  const getConversationTypeIcon = (type: string) => {
    switch (type) {
      case 'campaign': return 'briefcase';
      case 'collaboration': return 'account-group';
      case 'support': return 'help-circle';
      case 'networking': return 'account-network';
      default: return 'message';
    }
  };

  const handleConversationPress = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setChatModalVisible(true);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    // Simulate sending message
    const message: Message = {
      id: `msg_${Date.now()}`,
      text: newMessage,
      timestamp: new Date(),
      senderId: 'me',
      type: 'text',
    };

    // Add to conversation (in real app, this would be an API call)
    selectedConversation.messages.push(message);
    setNewMessage('');

    // Simulate typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      // Simulate response (in real app, this would come from server)
      if (Math.random() > 0.5) {
        const response: Message = {
          id: `msg_${Date.now() + 1}`,
          text: 'Thanks for your message! I\'ll get back to you soon.',
          timestamp: new Date(),
          senderId: selectedConversation.participant.id,
          type: 'text',
        };
        selectedConversation.messages.push(response);
      }
    }, 2000);
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => handleConversationPress(item)}
    >
      <View style={styles.conversationContent}>
        {/* Avatar with Status */}
        <View style={styles.avatarContainer}>
          <Avatar.Image source={{ uri: item.participant.avatar }} size={50} />
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: getStatusColor(item.participant.status) }
            ]}
          />
          {item.participant.isVerified && (
            <View style={styles.verifiedBadge}>
              <MaterialCommunityIcons name="check-circle" size={16} color={colors.primary} />
            </View>
          )}
        </View>

        {/* Conversation Info */}
        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <View style={styles.titleRow}>
              <Text style={[
                styles.participantName,
                { fontWeight: item.unreadCount > 0 ? 'bold' : '600' }
              ]}>
                {item.participant.name}
              </Text>
              <MaterialCommunityIcons
                name={getConversationTypeIcon(item.type)}
                size={16}
                color={colors.textSecondary}
                style={styles.typeIcon}
              />
            </View>
            <Text style={styles.timestamp}>{formatTime(item.lastMessage.timestamp)}</Text>
          </View>

          {/* Campaign Info */}
          {item.campaign && (
            <Text style={styles.campaignTitle} numberOfLines={1}>
              📋 {item.campaign.title}
            </Text>
          )}

          {/* Last Message */}
          <Text
            style={[
              styles.lastMessage,
              { fontWeight: item.unreadCount > 0 ? '600' : 'normal' }
            ]}
            numberOfLines={2}
          >
            {item.lastMessage.text}
          </Text>
        </View>

        {/* Status Indicators */}
        <View style={styles.statusContainer}>
          {item.unreadCount > 0 && (
            <Badge size={20} style={styles.unreadBadge}>
              {item.unreadCount > 9 ? '9+' : item.unreadCount}
            </Badge>
          )}
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.muted} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMe = item.senderId === 'me';
    const nextMessage = selectedConversation?.messages[index + 1];
    const showAvatar = !nextMessage || nextMessage.senderId !== item.senderId;

    return (
      <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.theirMessage]}>
        {!isMe && showAvatar && (
          <Avatar.Image
            source={{ uri: selectedConversation?.participant.avatar }}
            size={32}
            style={styles.messageAvatar}
          />
        )}
        <View style={[
          styles.messageBubble,
          isMe ? styles.myMessageBubble : styles.theirMessageBubble,
          !isMe && !showAvatar && { marginLeft: 40 }
        ]}>
          <Text style={[
            styles.messageText,
            { color: isMe ? colors.primary : colors.textPrimary }
          ]}>
            {item.text}
          </Text>
          <Text style={styles.messageTime}>{formatTime(item.timestamp)}</Text>
        </View>
      </View>
    );
  };

  const renderChatModal = () => {
    if (!selectedConversation) return null;

    return (
      <Portal>
        <Modal
          visible={chatModalVisible}
          onDismiss={() => setChatModalVisible(false)}
          contentContainerStyle={styles.chatModalContent}
        >
          <SafeAreaView style={styles.chatContainer}>
            {/* Chat Header */}
            <Surface style={styles.chatHeader}>
              <TouchableOpacity
                onPress={() => setChatModalVisible(false)}
                style={styles.backButton}
              >
                <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
              </TouchableOpacity>

              <View style={styles.chatHeaderInfo}>
                <Avatar.Image
                  source={{ uri: selectedConversation.participant.avatar }}
                  size={40}
                />
                <View style={styles.chatHeaderText}>
                  <Text style={styles.chatHeaderName}>{selectedConversation.participant.name}</Text>
                  <View style={styles.chatHeaderStatus}>
                    <View
                      style={[
                        styles.chatStatusDot,
                        { backgroundColor: getStatusColor(selectedConversation.participant.status) }
                      ]}
                    />
                    <Text style={styles.chatStatusText}>
                      {selectedConversation.participant.status === 'online' ? 'Online' :
                       selectedConversation.participant.status === 'away' ? 'Away' : 'Offline'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.chatHeaderActions}>
                <IconButton
                  icon="phone"
                  size={20}
                  onPress={() => Alert.alert('Voice Call', 'Voice calling feature coming soon!')}
                />
                <IconButton
                  icon="video"
                  size={20}
                  onPress={() => Alert.alert('Video Call', 'Video calling feature coming soon!')}
                />
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  onPress={() => Alert.alert('Options', 'More options coming soon!')}
                />
              </View>
            </Surface>

            {/* Messages List */}
            <FlatList
              data={selectedConversation.messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              style={styles.messagesList}
              contentContainerStyle={styles.messagesContainer}
              inverted={false}
              showsVerticalScrollIndicator={false}
            />

            {/* Typing Indicator */}
            {isTyping && (
              <View style={styles.typingContainer}>
                <Avatar.Image
                  source={{ uri: selectedConversation.participant.avatar }}
                  size={24}
                  style={styles.typingAvatar}
                />
                <View style={styles.typingBubble}>
                  <Text style={styles.typingText}>Typing...</Text>
                </View>
              </View>
            )}

            {/* Message Input */}
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
            >
              <Surface style={styles.messageInput}>
                <IconButton
                  icon="attachment"
                  size={20}
                  onPress={() => Alert.alert('Attachment', 'File attachment feature coming soon!')}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChangeText={setNewMessage}
                  multiline
                  maxLength={500}
                  mode="outlined"
                />
                <IconButton
                  icon="send"
                  size={20}
                  iconColor={newMessage.trim() ? colors.primary : colors.muted}
                  onPress={handleSendMessage}
                  disabled={!newMessage.trim()}
                />
              </Surface>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Modal>
      </Portal>
    );
  };

  const totalUnreadCount = filteredConversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content
          title={`Messages${totalUnreadCount > 0 ? ` (${totalUnreadCount})` : ''}`}
          titleStyle={styles.headerTitle}
        />
        <Appbar.Action
          icon="account-plus"
          iconColor={colors.white}
          onPress={() => Alert.alert('New Conversation', 'Start a new conversation with creators or brands!')}
        />
        <Appbar.Action
          icon="dots-vertical"
          iconColor={colors.white}
          onPress={() => Alert.alert('More Options', 'Message settings and options coming soon!')}
        />
      </Appbar.Header>

      <View style={styles.content}>
        {/* Search Bar */}
        <Searchbar
          placeholder="Search messages, people..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
        />

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {conversationFilters.map((filter) => (
            <Chip
              key={filter}
              selected={selectedFilter === filter}
              onPress={() => setSelectedFilter(filter)}
              style={[
                styles.filterChip,
                selectedFilter === filter && styles.selectedFilterChip
              ]}
              textStyle={[
                styles.filterChipText,
                selectedFilter === filter && styles.selectedFilterChipText
              ]}
            >
              {filter}
              {filter === 'Unread' && totalUnreadCount > 0 && ` (${totalUnreadCount})`}
            </Chip>
          ))}
        </ScrollView>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => Alert.alert('Start Campaign Chat', 'Contact brands about campaigns')}
          >
            <MaterialCommunityIcons name="briefcase" size={24} color={colors.primary} />
            <Text style={styles.quickActionText}>Campaign Chat</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => Alert.alert('Find Collaborators', 'Connect with other creators')}
          >
            <MaterialCommunityIcons name="account-group" size={24} color={colors.secondary} />
            <Text style={styles.quickActionText}>Collaborations</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => Alert.alert('Get Support', 'Contact ZimBuzz support team')}
          >
            <MaterialCommunityIcons name="help-circle" size={24} color={colors.accent} />
            <Text style={styles.quickActionText}>Support</Text>
          </TouchableOpacity>
        </View>

        {/* Results Count */}
        <Text style={styles.resultsCount}>
          {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
          {totalUnreadCount > 0 && ` · ${totalUnreadCount} unread`}
        </Text>

        {/* Conversations List */}
        <FlatList
          data={filteredConversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id}
          style={styles.conversationsList}
          contentContainerStyle={styles.conversationsContainer}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <Divider style={styles.conversationSeparator} />}
        />

        {/* Empty State */}
        {filteredConversations.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="message-outline" size={64} color={colors.muted} />
            <Text style={styles.emptyStateTitle}>No conversations found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'Try adjusting your search terms' : 'Start connecting with creators and brands!'}
            </Text>
          </View>
        )}
      </View>

      {/* Chat Modal */}
      {renderChatModal()}

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => Alert.alert('New Message', 'Start a conversation with a creator or brand!')}
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
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
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
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  quickAction: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
  },
  quickActionText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  resultsCount: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    fontSize: 14,
    color: colors.textSecondary,
  },
  conversationsList: {
    flex: 1,
  },
  conversationsContainer: {
    paddingBottom: 100,
  },
  conversationItem: {
    backgroundColor: colors.surface,
  },
  conversationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  verifiedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 2,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
  },
  typeIcon: {
    marginLeft: 4,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  campaignTitle: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '600',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  statusContainer: {
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    marginBottom: 4,
  },
  conversationSeparator: {
    marginLeft: 78,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  // Chat Modal Styles
  chatModalContent: {
    flex: 1,
    backgroundColor: colors.surface,
    margin: 0,
  },
  chatContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    elevation: 2,
    backgroundColor: colors.surface,
  },
  backButton: {
    marginRight: 8,
  },
  chatHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  chatHeaderName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  chatHeaderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  chatStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  chatStatusText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  chatHeaderActions: {
    flexDirection: 'row',
  },
  messagesList: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messagesContainer: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 8,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  theirMessage: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  messageAvatar: {
    marginRight: 8,
    marginTop: 4,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  myMessageBubble: {
    backgroundColor: colors.primary,
    marginLeft: 50,
  },
  theirMessageBubble: {
    backgroundColor: colors.surface,
    marginRight: 50,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
    opacity: 0.7,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
  },
  typingAvatar: {
    marginRight: 8,
  },
  typingBubble: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  typingText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  messageInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 8,
    elevation: 4,
    backgroundColor: colors.surface,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    marginHorizontal: 8,
    backgroundColor: colors.background,
  },
});