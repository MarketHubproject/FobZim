import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions
} from 'react-native';
import {
  Text,
  IconButton,
  Card,
  Divider
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Message } from '../services/messagingService';

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
  overlay: 'rgba(0, 0, 0, 0.5)'
};

interface MessageOptionsModalProps {
  visible: boolean;
  message: Message | null;
  onClose: () => void;
  onReply: (message: Message) => void;
  onForward: (message: Message) => void;
  onCopy: (message: Message) => void;
  onDelete: (message: Message) => void;
  onStar: (message: Message) => void;
  onInfo: (message: Message) => void;
  isOwnMessage: boolean;
}

const MessageOptionsModal: React.FC<MessageOptionsModalProps> = ({
  visible,
  message,
  onClose,
  onReply,
  onForward,
  onCopy,
  onDelete,
  onStar,
  onInfo,
  isOwnMessage
}) => {
  if (!message) return null;

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  const options = [
    {
      icon: 'reply' as const,
      title: 'Reply',
      onPress: () => handleAction(() => onReply(message)),
      visible: message.type !== 'system'
    },
    {
      icon: 'share' as const,
      title: 'Forward',
      onPress: () => handleAction(() => onForward(message)),
      visible: message.type !== 'system'
    },
    {
      icon: 'content-copy' as const,
      title: 'Copy Text',
      onPress: () => handleAction(() => onCopy(message)),
      visible: message.content && message.type !== 'system'
    },
    {
      icon: 'star-outline' as const,
      title: 'Star',
      onPress: () => handleAction(() => onStar(message)),
      visible: true
    },
    {
      icon: 'information-outline' as const,
      title: 'Info',
      onPress: () => handleAction(() => onInfo(message)),
      visible: true
    },
    {
      icon: 'delete-outline' as const,
      title: 'Delete',
      onPress: () => handleAction(() => onDelete(message)),
      visible: isOwnMessage || message.type === 'system',
      destructive: true
    }
  ];

  const visibleOptions = options.filter(option => option.visible);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity activeOpacity={1}>
            <Card style={styles.optionsCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.headerTitle}>Message Options</Text>
                <IconButton
                  icon="close"
                  size={20}
                  iconColor={colors.textSecondary}
                  onPress={onClose}
                />
              </View>
              
              <Divider />
              
              <View style={styles.messagePreview}>
                <Text style={styles.previewText} numberOfLines={3}>
                  {message.content}
                </Text>
                <Text style={styles.previewTime}>
                  {formatMessageTime(message.createdAt)}
                </Text>
              </View>
              
              <Divider />
              
              <View style={styles.optionsList}>
                {visibleOptions.map((option, index) => (
                  <TouchableOpacity
                    key={option.title}
                    style={[
                      styles.optionItem,
                      option.destructive && styles.destructiveOption
                    ]}
                    onPress={option.onPress}
                  >
                    <MaterialCommunityIcons
                      name={option.icon}
                      size={24}
                      color={option.destructive ? colors.error : colors.primary}
                    />
                    <Text style={[
                      styles.optionText,
                      option.destructive && styles.destructiveText
                    ]}>
                      {option.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    maxWidth: 400,
  },
  optionsCard: {
    backgroundColor: colors.white,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 20,
    paddingRight: 8,
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  messagePreview: {
    padding: 20,
    backgroundColor: colors.background,
  },
  previewText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: 8,
  },
  previewTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  optionsList: {
    paddingVertical: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  destructiveOption: {
    backgroundColor: colors.error + '10',
  },
  optionText: {
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 16,
    fontWeight: '500',
  },
  destructiveText: {
    color: colors.error,
  },
});

export default MessageOptionsModal;