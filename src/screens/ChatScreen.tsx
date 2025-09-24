import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  Dimensions,
  Keyboard,
  Clipboard,
  Image
} from 'react-native';
import {
  Text,
  TextInput,
  IconButton,
  Avatar,
  Card,
  Menu,
  ActivityIndicator,
  Button
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEnhancedAuth } from '../contexts/EnhancedAuthContext';
import { messagingService, Message, Conversation } from '../services/messagingService';
import { imageUploadService } from '../services/imageUploadService';
import MessageOptionsModal from '../components/MessageOptionsModal';
import TypingIndicator from '../components/TypingIndicator';
import ImageViewerModal from '../components/ImageViewerModal';
import CampaignShareModal from '../components/CampaignShareModal';
import CampaignReferenceCard from '../components/CampaignReferenceCard';
import { ChatScreenNavigationProp, ChatScreenRouteProp } from '../types/navigation';

const { width, height } = Dimensions.get('window');

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
  sent: '#DCF8C6',
  received: '#FFFFFF',
  system: '#E1F5FE'
};

interface ChatScreenProps {
  route: ChatScreenRouteProp;
  navigation: ChatScreenNavigationProp;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ route, navigation }) => {
  const { user } = useEnhancedAuth();
  const { conversationId, participantName, participantAvatar, participantId, campaignId, campaignTitle } = route.params;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string>('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [messageOptionsVisible, setMessageOptionsVisible] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string>('');
  const [campaignShareVisible, setCampaignShareVisible] = useState(false);
  const [sendingCampaign, setSendingCampaign] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Subscribe to real-time messages
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = messagingService.subscribeToMessages(
      conversationId,
      (newMessages) => {
        setMessages(newMessages);
        setLoading(false);
        
        // Scroll to bottom when new message arrives
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    return () => unsubscribe();
  }, [conversationId]);

  // Get conversation details
  useEffect(() => {
    if (!conversationId) return;

    const loadConversation = async () => {
      const conv = await messagingService.getConversation(conversationId);
      setConversation(conv);
    };

    loadConversation();
  }, [conversationId]);

  // Mark messages as read when screen is focused
  useEffect(() => {
    const unsubscribe = navigation?.addListener('focus', () => {
      if (user?.uid && conversationId) {
        messagingService.markMessagesAsRead(conversationId, user.uid);
      }
    });

    return unsubscribe;
  }, [navigation, user?.uid, conversationId]);

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || !conversationId || !user?.uid || sending) return;

    const messageText = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      if (replyToMessage) {
        await messagingService.sendMessage(
          conversationId, 
          user.uid, 
          messageText, 
          'text',
          null,
          replyToMessage.id
        );
        setReplyToMessage(null);
      } else {
        await messagingService.sendMessage(conversationId, user.uid, messageText);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
      setInputText(messageText);
    } finally {
      setSending(false);
    }
  }, [inputText, conversationId, user?.uid, sending, replyToMessage]);

  const handleSendImage = useCallback(async () => {
    if (!conversationId || !user?.uid) return;

    try {
      const result = await imageUploadService.showImagePicker({
        allowsEditing: true,
        quality: 0.8
      });

      if (result && !result.canceled && result.assets[0]) {
        setSending(true);
        // For demo, we'll just send a text message indicating image
        await messagingService.sendMessage(
          conversationId, 
          user.uid, 
          '📷 Image shared', 
          'image',
          { imageUrl: result.assets[0].uri }
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send image');
    } finally {
      setSending(false);
    }
  }, [conversationId, user?.uid]);

  const handleInputChange = useCallback((text: string) => {
    setInputText(text);

    // Handle typing indicator (simplified)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (text.length > 0) {
      // In a real implementation, you would update typing status here
      // messagingService.updateTypingStatus(conversationId, user?.uid, true);
      
      typingTimeoutRef.current = setTimeout(() => {
        // messagingService.updateTypingStatus(conversationId, user?.uid, false);
      }, 1000);
    }
  }, [conversationId, user?.uid]);

  const formatMessageTime = (timestamp: any): string => {
    if (!timestamp) return '';
    
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwnMessage = item.senderId === user?.uid;
    const previousMessage = index > 0 ? messages[index - 1] : null;
    const showAvatar = !isOwnMessage && (!previousMessage || previousMessage.senderId !== item.senderId);
    
    const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
    const showTime = !nextMessage || 
                    nextMessage.senderId !== item.senderId ||
                    (new Date(nextMessage.createdAt as any).getTime() - new Date(item.createdAt as any).getTime()) > 60000; // 1 minute

    return (
      <View style={[styles.messageContainer, isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer]}>
        {!isOwnMessage && (
          <View style={styles.avatarContainer}>
            {showAvatar ? (
              <Avatar.Image
                size={32}
                source={{ 
                  uri: participantAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' 
                }}
              />
            ) : (
              <View style={styles.avatarSpacer} />
            )}
          </View>
        )}
        
        <View style={[styles.messageWrapper, isOwnMessage ? styles.ownMessageWrapper : styles.otherMessageWrapper]}>
          {item.type === 'system' ? (
            <View style={styles.systemMessage}>
              <Text style={styles.systemMessageText}>{item.content}</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.messageBubble,
                isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
              ]}
              onLongPress={() => {
                setSelectedMessage(item);
                setMessageOptionsVisible(true);
              }}
            >
              {item.replyTo && (
                <View style={styles.replyContainer}>
                  <Text style={styles.replyText}>Reply to message</Text>
                </View>
              )}
              
              {item.type === 'image' && (
                <TouchableOpacity 
                  style={styles.imageMessageContainer}
                  onPress={() => {
                    if (item.metadata?.imageUrl) {
                      setSelectedImageUri(item.metadata.imageUrl);
                      setImageViewerVisible(true);
                    }
                  }}
                >
                  {item.metadata?.imageUrl ? (
                    <View style={styles.imageMessageWrapper}>
                      <Image 
                        source={{ uri: item.metadata.imageUrl }}
                        style={styles.messageImage}
                        resizeMode="cover"
                      />
                      <View style={styles.imageOverlay}>
                        <MaterialCommunityIcons name="eye" size={20} color={colors.white} />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <MaterialCommunityIcons name="image" size={24} color={colors.muted} />
                      <Text style={styles.imageText}>Image</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
              
              {item.type === 'campaign_reference' && item.metadata?.campaignData && (
                <CampaignReferenceCard
                  campaign={item.metadata.campaignData}
                  compact={true}
                  showActions={false}
                  onPress={(campaign) => {
                    // Navigate to campaign detail
                    navigation.navigate('CampaignDetail', {
                      campaignId: campaign.id
                    });
                  }}
                />
              )}
              
              {item.type === 'campaign_reference' && !item.metadata?.campaignData && (
                <View style={styles.campaignReference}>
                  <MaterialCommunityIcons name="briefcase" size={20} color={colors.primary} />
                  <Text style={styles.campaignReferenceText}>
                    🎯 {item.metadata?.campaignTitle || 'Campaign'}
                  </Text>
                </View>
              )}
              
              <Text style={[
                styles.messageText,
                isOwnMessage ? styles.ownMessageText : styles.otherMessageText
              ]}>
                {item.content}
              </Text>
              
              <View style={styles.messageFooter}>
                <Text style={[
                  styles.messageTime,
                  isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime
                ]}>
                  {formatMessageTime(item.createdAt)}
                </Text>
                
                {isOwnMessage && (
                  <View style={styles.messageStatus}>
                    {item.status === 'sending' && (
                      <MaterialCommunityIcons name="clock-outline" size={12} color={colors.muted} />
                    )}
                    {item.status === 'sent' && (
                      <MaterialCommunityIcons name="check" size={12} color={colors.muted} />
                    )}
                    {item.status === 'delivered' && (
                      <MaterialCommunityIcons name="check-all" size={12} color={colors.muted} />
                    )}
                    {item.status === 'read' && (
                      <MaterialCommunityIcons name="check-all" size={12} color={colors.primary} />
                    )}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
          
          {showTime && !isOwnMessage && (
            <Text style={styles.messageTimestamp}>
              {formatMessageTime(item.createdAt)}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <MaterialCommunityIcons name="arrow-left" size={24} color={colors.white} />
      </TouchableOpacity>
      
      <View style={styles.headerInfo}>
        <Avatar.Image
          size={40}
          source={{ 
            uri: participantAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' 
          }}
        />
        <View style={styles.headerText}>
          <Text style={styles.headerName}>{participantName || 'Unknown'}</Text>
          {(campaignTitle || conversation?.campaignTitle) && (
            <Text style={styles.headerCampaign}>🎯 {campaignTitle || conversation?.campaignTitle}</Text>
          )}
          {isTyping && (
            <Text style={styles.typingIndicator}>{typingUser} is typing...</Text>
          )}
        </View>
      </View>

      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <IconButton
            icon="dots-vertical"
            iconColor={colors.white}
            onPress={() => setMenuVisible(true)}
          />
        }
      >
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            // TODO: View profile
          }}
          title="View Profile"
          leadingIcon="account"
        />
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            navigation.navigate('MessageSearch', {
              conversationId,
              initialQuery: ''
            });
          }}
          title="Search"
          leadingIcon="magnify"
        />
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            // TODO: Clear chat
          }}
          title="Clear Chat"
          leadingIcon="delete"
        />
      </Menu>
    </View>
  );

  const renderInputBar = () => (
    <View style={styles.inputContainer}>
      {replyToMessage && (
        <View style={styles.replyPreview}>
          <View style={styles.replyPreviewContent}>
            <MaterialCommunityIcons name="reply" size={18} color={colors.primary} />
            <View style={styles.replyPreviewTextContainer}>
              <Text style={styles.replyPreviewSender}>
                Replying to {replyToMessage.senderId === user?.uid ? 'yourself' : participantName}
              </Text>
              <Text style={styles.replyPreviewText} numberOfLines={1}>
                {replyToMessage.content}
              </Text>
            </View>
          </View>
          <IconButton
            icon="close"
            size={20}
            onPress={() => setReplyToMessage(null)}
            iconColor={colors.textSecondary}
          />
        </View>
      )}
      <View style={styles.inputRow}>
        <View style={styles.inputActions}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={handleSendImage}
            disabled={sending}
          >
            <MaterialCommunityIcons name="camera" size={24} color={colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.attachButton}
            onPress={() => setCampaignShareVisible(true)}
            disabled={sending}
          >
            <MaterialCommunityIcons name="briefcase" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={handleInputChange}
          placeholder="Type a message..."
          multiline
          maxLength={1000}
          mode="outlined"
          dense
          disabled={sending}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || sending) && styles.sendButtonDisabled
          ]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <MaterialCommunityIcons name="send" size={20} color={colors.white} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="message-outline" size={64} color={colors.muted} />
      <Text style={styles.emptyTitle}>Start the conversation!</Text>
      <Text style={styles.emptyDescription}>
        Send a message to {participantName} to get started
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  // Message action handlers
  const handleReplyMessage = useCallback((message: Message) => {
    setReplyToMessage(message);
  }, []);

  const handleForwardMessage = useCallback((message: Message) => {
    // TODO: Implement forwarding - this would typically navigate to a contact selection screen
    Alert.alert('Forward', 'Forwarding will be implemented in a future update');
  }, []);

  const handleCopyMessage = useCallback((message: Message) => {
    Clipboard.setString(message.content || '');
    Alert.alert('Copied', 'Message copied to clipboard');
  }, []);

  const handleDeleteMessage = useCallback((message: Message) => {
    Alert.alert(
      'Delete Message', 
      'Are you sure you want to delete this message?', 
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              if (user?.uid) {
                await messagingService.deleteMessage(message.id, user.uid);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete message');
            }
          }
        }
      ]
    );
  }, [conversationId, user?.uid]);

  const handleStarMessage = useCallback((message: Message) => {
    // TODO: Implement starring messages
    Alert.alert('Star', 'Message starring will be implemented in a future update');
  }, []);

  const handleMessageInfo = useCallback((message: Message) => {
    // TODO: Show message info (timestamp, delivery status, etc.)
    const messageTime = message.createdAt instanceof Date 
      ? message.createdAt 
      : message.createdAt?.toDate() || new Date();

    Alert.alert(
      'Message Info',
      `Sent: ${messageTime.toLocaleString()}\nStatus: ${message.status || 'Unknown'}`
    );
  }, []);

  const handleShareCampaign = useCallback(async (campaign: any, customMessage?: string) => {
    if (!conversationId || !user?.uid) return;

    try {
      setSendingCampaign(true);
      
      const messageContent = customMessage || `Check out this campaign: ${campaign.title}`;
      
      await messagingService.sendMessage(
        conversationId,
        user.uid,
        messageContent,
        'campaign_reference',
        {
          campaignId: campaign.id,
          campaignTitle: campaign.title,
          campaignData: campaign // Include full campaign data for rich preview
        }
      );
      
      Alert.alert('Success', 'Campaign shared successfully!');
    } catch (error) {
      console.error('Error sharing campaign:', error);
      Alert.alert('Error', 'Failed to share campaign. Please try again.');
    } finally {
      setSendingCampaign(false);
    }
  }, [conversationId, user?.uid]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {renderHeader()}
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        inverted={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={() => (
          <TypingIndicator
            visible={isTyping}
            typingUser={typingUser || participantName}
          />
        )}
      />
      
      {renderInputBar()}

      <MessageOptionsModal
        visible={messageOptionsVisible}
        message={selectedMessage}
        onClose={() => setMessageOptionsVisible(false)}
        onReply={handleReplyMessage}
        onForward={handleForwardMessage}
        onCopy={handleCopyMessage}
        onDelete={handleDeleteMessage}
        onStar={handleStarMessage}
        onInfo={handleMessageInfo}
        isOwnMessage={selectedMessage?.senderId === user?.uid}
      />

      <ImageViewerModal
        visible={imageViewerVisible}
        imageUri={selectedImageUri}
        onClose={() => setImageViewerVisible(false)}
        title="Shared Image"
      />

      <CampaignShareModal
        visible={campaignShareVisible}
        onClose={() => setCampaignShareVisible(false)}
        onShareCampaign={handleShareCampaign}
        loading={sendingCampaign}
      />
    </KeyboardAvoidingView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 12,
    paddingHorizontal: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
  },
  headerCampaign: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.8,
  },
  typingIndicator: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.8,
    fontStyle: 'italic',
  },
  messagesList: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messagesContent: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 40,
    alignItems: 'center',
  },
  avatarSpacer: {
    width: 32,
    height: 32,
  },
  messageWrapper: {
    maxWidth: '80%',
    marginHorizontal: 8,
  },
  ownMessageWrapper: {
    alignItems: 'flex-end',
  },
  otherMessageWrapper: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    minWidth: 60,
  },
  ownMessageBubble: {
    backgroundColor: colors.sent,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: colors.received,
    borderBottomLeftRadius: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  systemMessage: {
    alignSelf: 'center',
    backgroundColor: colors.system,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginVertical: 4,
  },
  systemMessageText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  replyContainer: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    paddingLeft: 8,
    marginBottom: 4,
  },
  replyText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  imageMessageContainer: {
    marginBottom: 4,
  },
  imageMessageWrapper: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  imageOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 4,
  },
  imagePlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
  },
  imageText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.textSecondary,
  },
  campaignReference: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  campaignReferenceText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  ownMessageText: {
    color: colors.textPrimary,
  },
  otherMessageText: {
    color: colors.textPrimary,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
    marginRight: 4,
  },
  ownMessageTime: {
    color: colors.textSecondary,
  },
  otherMessageTime: {
    color: colors.muted,
  },
  messageStatus: {
    marginLeft: 4,
  },
  messageTimestamp: {
    fontSize: 11,
    color: colors.muted,
    alignSelf: 'center',
    marginTop: 2,
  },
  inputContainer: {
    backgroundColor: colors.white,
    paddingVertical: 8,
    paddingHorizontal: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  textInput: {
    flex: 1,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  sendButtonDisabled: {
    backgroundColor: colors.muted,
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  replyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    paddingLeft: 8,
    paddingRight: 4,
    paddingVertical: 8,
    marginHorizontal: 8,
    marginTop: 8,
    borderRadius: 4,
  },
  replyPreviewContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyPreviewTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  replyPreviewSender: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  replyPreviewText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});

export default ChatScreen;