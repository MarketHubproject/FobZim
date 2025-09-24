import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Divider,
  List,
  Avatar,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CampaignShareModal from '../components/CampaignShareModal';
import CampaignReferenceCard from '../components/CampaignReferenceCard';
import { useEnhancedAuth } from '../contexts/EnhancedAuthContext';

const colors = {
  primary: '#2E7D32',
  secondary: '#4CAF50',
  surface: '#FFFFFF',
  background: '#F5F5F5',
  textPrimary: '#212121',
  textSecondary: '#757575',
  muted: '#BDBDBD',
  white: '#FFFFFF',
  success: '#4CAF50',
  info: '#2196F3',
};

// Mock campaign for demo
const mockCampaign = {
  id: 'demo-campaign',
  title: 'Clean Water Initiative',
  description: 'Bringing clean water to rural communities in Zimbabwe. Help us install new water pumps and purification systems to improve health outcomes for families.',
  category: 'Environment',
  imageUrl: 'https://images.unsplash.com/photo-1541199249251-f713e6145474?w=300',
  targetAmount: 50000,
  currentAmount: 25000,
  location: 'Mashonaland, Zimbabwe',
  participantCount: 156,
  status: 'active' as const,
  endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
};

interface DemoFeaturesScreenProps {
  navigation?: any;
}

export default function DemoFeaturesScreen({ navigation }: DemoFeaturesScreenProps) {
  const { user, userProfile } = useEnhancedAuth();
  const [campaignModalVisible, setCampaignModalVisible] = useState(false);
  const [sharedCampaigns, setSharedCampaigns] = useState<any[]>([]);

  const handleShareCampaign = (campaign: any, message?: string) => {
    console.log('Sharing campaign:', campaign.title, 'with message:', message);
    
    // Add to shared campaigns list
    const newSharedCampaign = {
      ...campaign,
      sharedMessage: message,
      sharedAt: new Date(),
      sharedBy: userProfile?.displayName || user?.email || 'You'
    };
    
    setSharedCampaigns(prev => [newSharedCampaign, ...prev]);
    setCampaignModalVisible(false);
    
    Alert.alert(
      'Campaign Shared! 🎯',
      `"${campaign.title}" has been shared successfully!`,
      [{ text: 'Great!', style: 'default' }]
    );
  };

  const handleJoinCampaign = (campaign: any) => {
    Alert.alert(
      'Join Campaign? 🤝',
      `Would you like to join "${campaign.title}"? This will add you as a participant and you can start contributing.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Join', 
          style: 'default',
          onPress: () => {
            Alert.alert('Joined! 🎉', `You've successfully joined "${campaign.title}". You'll receive updates on the campaign progress.`);
          }
        }
      ]
    );
  };

  const handleViewCampaign = (campaign: any) => {
    Alert.alert(
      campaign.title,
      `${campaign.description}\n\nLocation: ${campaign.location}\nParticipants: ${campaign.participantCount}\nStatus: ${campaign.status}`,
      [{ text: 'Got it', style: 'default' }]
    );
  };

  const mockMessages = [
    {
      id: '1',
      text: 'Hey! Check out this amazing campaign I found 👇',
      sender: 'You',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
    },
    {
      id: '2', 
      text: 'This looks great! The clean water initiative is exactly what our community needs. Count me in! 💪',
      sender: 'Demo User',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
    }
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="star" size={64} color={colors.primary} />
        <Text variant="headlineMedium" style={styles.title}>
          Campaign & Messaging Demo 🇿🇼
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Test ZimBuzz's campaign sharing and messaging features
        </Text>
      </View>

      {/* Campaign Sharing Demo */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            📢 Campaign Sharing
          </Text>
          <Text variant="bodyMedium" style={styles.sectionDescription}>
            Share campaigns in conversations with custom messages
          </Text>
          
          <Button
            mode="contained"
            onPress={() => setCampaignModalVisible(true)}
            style={styles.actionButton}
            icon="share"
          >
            Share a Campaign
          </Button>
        </Card.Content>
      </Card>

      {/* Campaign Reference Card Demo */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            🎯 Campaign Reference Card
          </Text>
          <Text variant="bodyMedium" style={styles.sectionDescription}>
            How campaigns appear when shared in messages
          </Text>
          
          <View style={styles.demoContainer}>
            <CampaignReferenceCard
              campaign={mockCampaign}
              onPress={handleViewCampaign}
              onJoinPress={handleJoinCampaign}
              showActions={true}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Message Flow Demo */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            💬 Message Flow Example
          </Text>
          <Text variant="bodyMedium" style={styles.sectionDescription}>
            How campaign sharing looks in a conversation
          </Text>
          
          <View style={styles.messageFlowContainer}>
            {mockMessages.map((message, index) => (
              <View key={message.id} style={[
                styles.messageContainer,
                message.sender === 'You' ? styles.sentMessage : styles.receivedMessage
              ]}>
                <View style={styles.messageHeader}>
                  <Text style={styles.messageSender}>{message.sender}</Text>
                  <Text style={styles.messageTime}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <Text style={styles.messageText}>{message.text}</Text>
                
                {/* Show campaign card in the first message */}
                {index === 0 && (
                  <View style={styles.embeddedCampaign}>
                    <CampaignReferenceCard
                      campaign={mockCampaign}
                      onPress={handleViewCampaign}
                      onJoinPress={handleJoinCampaign}
                      compact={true}
                      showActions={false}
                    />
                  </View>
                )}
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Shared Campaigns History */}
      {sharedCampaigns.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              📋 Recently Shared Campaigns
            </Text>
            <Text variant="bodyMedium" style={styles.sectionDescription}>
              Campaigns you've shared in this session
            </Text>
            
            {sharedCampaigns.map((campaign, index) => (
              <View key={index} style={styles.sharedItem}>
                <View style={styles.sharedHeader}>
                  <MaterialCommunityIcons name="share" size={16} color={colors.success} />
                  <Text style={styles.sharedTitle}>{campaign.title}</Text>
                  <Text style={styles.sharedTime}>
                    {campaign.sharedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                {campaign.sharedMessage && (
                  <Text style={styles.sharedMessage}>
                    ""{campaign.sharedMessage}""
                  </Text>
                )}
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Feature List */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            ✨ Available Features
          </Text>
          
          <List.Item
            title="Campaign Discovery"
            description="Browse and search active campaigns"
            left={props => <List.Icon {...props} icon="magnify" />}
            style={styles.featureItem}
          />
          
          <List.Item
            title="Smart Sharing"
            description="Share campaigns with custom messages"
            left={props => <List.Icon {...props} icon="share-variant" />}
            style={styles.featureItem}
          />
          
          <List.Item
            title="Rich Message Cards"
            description="Beautiful campaign previews in chats"
            left={props => <List.Icon {...props} icon="card-text" />}
            style={styles.featureItem}
          />
          
          <List.Item
            title="Campaign Filters"
            description="Filter by ownership and participation"
            left={props => <List.Icon {...props} icon="filter" />}
            style={styles.featureItem}
          />
          
          <List.Item
            title="Real-time Updates"
            description="Live campaign progress and status"
            left={props => <List.Icon {...props} icon="update" />}
            style={styles.featureItem}
          />
        </Card.Content>
      </Card>

      <View style={styles.spacer} />

      {/* Campaign Share Modal */}
      <CampaignShareModal
        visible={campaignModalVisible}
        onClose={() => setCampaignModalVisible(false)}
        onShareCampaign={handleShareCampaign}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  title: {
    color: colors.primary,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    color: colors.textSecondary,
    marginBottom: 16,
  },
  actionButton: {
    marginTop: 8,
  },
  demoContainer: {
    marginTop: 16,
  },
  messageFlowContainer: {
    marginTop: 16,
  },
  messageContainer: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    maxWidth: '80%',
  },
  sentMessage: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
  },
  receivedMessage: {
    backgroundColor: colors.white,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.muted + '30',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  messageSender: {
    fontWeight: 'bold',
    color: colors.primary,
    fontSize: 12,
  },
  messageTime: {
    color: colors.textSecondary,
    fontSize: 10,
  },
  messageText: {
    color: colors.textPrimary,
    lineHeight: 18,
  },
  embeddedCampaign: {
    marginTop: 8,
  },
  sharedItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.muted + '30',
  },
  sharedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sharedTitle: {
    flex: 1,
    fontWeight: '500',
    marginLeft: 8,
    color: colors.textPrimary,
  },
  sharedTime: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  sharedMessage: {
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginLeft: 24,
  },
  featureItem: {
    paddingVertical: 4,
  },
  spacer: {
    height: 32,
  },
});