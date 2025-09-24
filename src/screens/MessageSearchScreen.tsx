import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Alert
} from 'react-native';
import {
  Text,
  Searchbar,
  Card,
  Avatar,
  Chip,
  IconButton,
  ActivityIndicator,
  Menu,
  Button,
  Divider
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { messagingService, Message, Conversation } from '../services/messagingService';
import { RootStackNavigationProp } from '../types/navigation';

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
  highlight: '#FFD54F'
};

interface MessageSearchScreenProps {
  navigation: RootStackNavigationProp<'MessageSearch'>;
  route?: {
    params?: {
      conversationId?: string;
      initialQuery?: string;
    };
  };
}

interface SearchResult extends Message {
  conversationTitle: string;
  participantName: string;
  participantAvatar?: string;
  highlightedContent: string;
}

interface SearchFilters {
  messageType: 'all' | 'text' | 'image' | 'file' | 'campaign_reference';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  sender: 'all' | 'me' | 'others';
  conversationId?: string;
}

const MessageSearchScreen: React.FC<MessageSearchScreenProps> = ({ navigation, route }) => {
  const { user } = useAuth();
  const { conversationId, initialQuery } = route?.params || {};

  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);
  
  const [filters, setFilters] = useState<SearchFilters>({
    messageType: 'all',
    dateRange: 'all',
    sender: 'all',
    conversationId
  });

  // Load conversations for context
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = messagingService.subscribeToConversations(
      user.uid,
      (newConversations) => {
        setConversations(newConversations);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Perform search when query or filters change
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, filters]);

  const performSearch = useCallback(async () => {
    if (!user?.uid || !searchQuery.trim()) return;

    try {
      setLoading(true);
      
      // Use messagingService to search messages
      const results = await messagingService.searchMessages(
        user.uid,
        searchQuery.trim(),
        filters.conversationId
      );

      // Process results and add conversation context
      const processedResults: SearchResult[] = [];
      
      for (const message of results) {
        // Find conversation for context
        const conversation = conversations.find(c => c.id === message.conversationId);
        if (!conversation) continue;

        // Apply filters
        if (filters.messageType !== 'all' && message.type !== filters.messageType) continue;
        if (filters.sender === 'me' && message.senderId !== user.uid) continue;
        if (filters.sender === 'others' && message.senderId === user.uid) continue;
        
        // Apply date filter
        if (!matchesDateFilter(message.createdAt, filters.dateRange)) continue;

        // Get participant info
        const otherParticipantId = conversation.participants.find(p => p !== user.uid);
        const participantDetails = otherParticipantId 
          ? conversation.participantDetails[otherParticipantId]
          : null;

        processedResults.push({
          ...message,
          conversationTitle: conversation.campaignTitle || participantDetails?.name || 'Unknown',
          participantName: message.senderId === user.uid ? 'You' : (message.senderName || participantDetails?.name || 'Unknown'),
          participantAvatar: message.senderId === user.uid ? user.photoURL : (message.senderAvatar || participantDetails?.avatar),
          highlightedContent: highlightText(message.content || '', searchQuery)
        });
      }

      // Sort by relevance (most recent first for now)
      processedResults.sort((a, b) => {
        const aTime = a.createdAt instanceof Date ? a.createdAt : a.createdAt?.toDate() || new Date(0);
        const bTime = b.createdAt instanceof Date ? b.createdAt : b.createdAt?.toDate() || new Date(0);
        return bTime.getTime() - aTime.getTime();
      });

      setSearchResults(processedResults);
    } catch (error) {
      console.error('Error searching messages:', error);
      Alert.alert('Error', 'Failed to search messages. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.uid, searchQuery, filters, conversations]);

  const matchesDateFilter = (timestamp: any, dateRange: string): boolean => {
    if (dateRange === 'all') return true;
    
    const messageDate = timestamp instanceof Date ? timestamp : timestamp?.toDate();
    if (!messageDate) return false;

    const now = new Date();
    const diff = now.getTime() - messageDate.getTime();
    
    switch (dateRange) {
      case 'today':
        return diff < 24 * 60 * 60 * 1000; // 1 day
      case 'week':
        return diff < 7 * 24 * 60 * 60 * 1000; // 7 days
      case 'month':
        return diff < 30 * 24 * 60 * 60 * 1000; // 30 days
      case 'year':
        return diff < 365 * 24 * 60 * 60 * 1000; // 365 days
      default:
        return true;
    }
  };

  const highlightText = (text: string, query: string): string => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.trim()})`, 'gi');
    return text.replace(regex, '<highlight>$1</highlight>');
  };

  const renderHighlightedText = (highlightedText: string) => {
    const parts = highlightedText.split(/<highlight>|<\/highlight>/);
    return (
      <Text style={styles.messageText}>
        {parts.map((part, index) => (
          <Text
            key={index}
            style={index % 2 === 1 ? styles.highlightedText : undefined}
          >
            {part}
          </Text>
        ))}
      </Text>
    );
  };

  const formatMessageTime = (timestamp: any): string => {
    if (!timestamp) return '';
    
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 24 * 60 * 60 * 1000) { // Less than 24 hours
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 7 * 24 * 60 * 60 * 1000) { // Less than 7 days
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const handleResultPress = (result: SearchResult) => {
    // Navigate to the conversation and highlight the message
    navigation.navigate('Chat', {
      conversationId: result.conversationId,
      participantName: result.conversationTitle,
      participantAvatar: result.participantAvatar,
      highlightMessageId: result.id
    });
  };

  const clearFilters = () => {
    setFilters({
      messageType: 'all',
      dateRange: 'all',
      sender: 'all',
      conversationId: filters.conversationId // Keep conversation filter if searching within conversation
    });
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity onPress={() => handleResultPress(item)}>
      <Card style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <Avatar.Image
            size={40}
            source={{ 
              uri: item.participantAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' 
            }}
          />
          <View style={styles.resultInfo}>
            <Text style={styles.conversationTitle} numberOfLines={1}>
              {item.conversationTitle}
            </Text>
            <Text style={styles.senderName} numberOfLines={1}>
              {item.participantName} • {formatMessageTime(item.createdAt)}
            </Text>
          </View>
          <View style={styles.resultActions}>
            {item.type === 'image' && (
              <MaterialCommunityIcons name="image" size={16} color={colors.muted} />
            )}
            {item.type === 'file' && (
              <MaterialCommunityIcons name="file" size={16} color={colors.muted} />
            )}
            {item.type === 'campaign_reference' && (
              <MaterialCommunityIcons name="briefcase" size={16} color={colors.primary} />
            )}
          </View>
        </View>
        
        <View style={styles.messageContent}>
          {item.type === 'text' ? (
            renderHighlightedText(item.highlightedContent)
          ) : (
            <Text style={styles.messageText}>
              {item.type === 'image' && '📷 Image'}
              {item.type === 'file' && '📎 File'}
              {item.type === 'campaign_reference' && `🎯 ${item.metadata?.campaignTitle || 'Campaign'}`}
            </Text>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderFilterChips = () => (
    <View style={styles.filtersContainer}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[
          { key: 'type', label: filters.messageType === 'all' ? 'All Types' : filters.messageType, active: filters.messageType !== 'all' },
          { key: 'date', label: filters.dateRange === 'all' ? 'All Time' : filters.dateRange, active: filters.dateRange !== 'all' },
          { key: 'sender', label: filters.sender === 'all' ? 'All Senders' : filters.sender === 'me' ? 'From Me' : 'From Others', active: filters.sender !== 'all' }
        ]}
        renderItem={({ item }) => (
          <Chip
            style={[styles.filterChip, item.active && styles.activeFilterChip]}
            textStyle={[styles.filterChipText, item.active && styles.activeFilterChipText]}
            onPress={() => {/* TODO: Show filter modal */}}
          >
            {item.label}
          </Chip>
        )}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.filtersContent}
      />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      {searchQuery.length < 2 ? (
        <>
          <MaterialCommunityIcons name="magnify" size={64} color={colors.muted} />
          <Text style={styles.emptyTitle}>Search Messages</Text>
          <Text style={styles.emptyDescription}>
            {conversationId 
              ? 'Search within this conversation'
              : 'Search across all your conversations'}
          </Text>
          <Text style={styles.emptyHint}>
            Type at least 2 characters to start searching
          </Text>
        </>
      ) : (
        <>
          <MaterialCommunityIcons name="message-alert" size={64} color={colors.muted} />
          <Text style={styles.emptyTitle}>No Messages Found</Text>
          <Text style={styles.emptyDescription}>
            No messages match your search criteria
          </Text>
          <Button mode="outlined" onPress={clearFilters} style={styles.clearFiltersButton}>
            Clear Filters
          </Button>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          iconColor={colors.white}
          onPress={() => navigation.goBack()}
        />
        
        <Text style={styles.headerTitle}>
          {conversationId ? 'Search in Chat' : 'Search Messages'}
        </Text>
        
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="filter-variant"
              iconColor={colors.white}
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              // TODO: Show advanced filters modal
            }}
            title="Advanced Filters"
            leadingIcon="filter"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              clearFilters();
            }}
            title="Clear Filters"
            leadingIcon="filter-remove"
          />
        </Menu>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder={conversationId ? "Search in this conversation..." : "Search all messages..."}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
          loading={loading}
        />
      </View>

      {/* Filters */}
      {renderFilterChips()}

      {/* Results */}
      <View style={styles.resultsContainer}>
        {loading && searchResults.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Searching messages...</Text>
          </View>
        ) : (
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
            contentContainerStyle={searchResults.length === 0 ? styles.emptyContentContainer : styles.resultsContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
        
        {searchResults.length > 0 && (
          <View style={styles.resultsFooter}>
            <Text style={styles.resultsCount}>
              {searchResults.length} message{searchResults.length !== 1 ? 's' : ''} found
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: colors.white,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: colors.background,
  },
  filtersContainer: {
    backgroundColor: colors.white,
    paddingVertical: 8,
  },
  filtersContent: {
    paddingHorizontal: 16,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: colors.background,
  },
  activeFilterChip: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    color: colors.textSecondary,
  },
  activeFilterChipText: {
    color: colors.white,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsContent: {
    padding: 16,
  },
  emptyContentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
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
    marginBottom: 8,
    lineHeight: 20,
  },
  emptyHint: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
  },
  clearFiltersButton: {
    marginTop: 16,
  },
  resultCard: {
    marginBottom: 8,
    padding: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  senderName: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  resultActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageContent: {
    marginLeft: 52,
  },
  messageText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  highlightedText: {
    backgroundColor: colors.highlight,
    fontWeight: '600',
  },
  separator: {
    height: 8,
  },
  resultsFooter: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.muted + '30',
  },
  resultsCount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default MessageSearchScreen;