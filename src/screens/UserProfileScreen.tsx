import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  RefreshControl
} from 'react-native';
import {
  Text,
  Card,
  Avatar,
  IconButton,
  Button,
  Chip,
  Divider,
  ActivityIndicator,
  Menu,
  TextInput
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { imageUploadService } from '../services/imageUploadService';
import { userService } from '../services/userService';
import { messagingService } from '../services/messagingService';
import { UserProfileNavigationProp, UserProfileRouteProp } from '../types/navigation';

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
  accent: '#FF5722'
};

interface UserProfileScreenProps {
  route: UserProfileRouteProp;
  navigation: UserProfileNavigationProp;
}

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  location?: string;
  website?: string;
  phoneNumber?: string;
  joinedDate: Date;
  isOnline: boolean;
  lastSeen?: Date;
  campaignCount: number;
  messageCount: number;
  followers: number;
  following: number;
  isFollowing?: boolean;
  isBlocked?: boolean;
  privacy: {
    profileVisible: boolean;
    showEmail: boolean;
    showPhone: boolean;
    allowMessages: boolean;
  };
}

const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ route, navigation }) => {
  const { user: currentUser } = useAuth();
  const { userId } = route.params;
  const isOwnProfile = userId === currentUser?.uid;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    displayName: '',
    bio: '',
    location: '',
    website: ''
  });

  // Load user profile
  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from userService
      const mockProfile: UserProfile = {
        uid: userId,
        displayName: userId === currentUser?.uid ? (currentUser?.displayName || 'You') : 'John Doe',
        email: userId === currentUser?.uid ? (currentUser?.email || '') : 'john@example.com',
        photoURL: userId === currentUser?.uid ? currentUser?.photoURL : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        bio: 'Passionate about sustainable business and community development. Always looking for innovative ways to make a positive impact.',
        location: 'Harare, Zimbabwe',
        website: 'https://example.com',
        phoneNumber: '+263 77 123 4567',
        joinedDate: new Date('2023-01-15'),
        isOnline: Math.random() > 0.5,
        lastSeen: new Date(Date.now() - Math.random() * 86400000),
        campaignCount: Math.floor(Math.random() * 20) + 5,
        messageCount: Math.floor(Math.random() * 500) + 100,
        followers: Math.floor(Math.random() * 1000) + 50,
        following: Math.floor(Math.random() * 500) + 25,
        isFollowing: !isOwnProfile && Math.random() > 0.5,
        isBlocked: false,
        privacy: {
          profileVisible: true,
          showEmail: isOwnProfile,
          showPhone: isOwnProfile,
          allowMessages: true
        }
      };

      setProfile(mockProfile);
      setEditForm({
        displayName: mockProfile.displayName,
        bio: mockProfile.bio || '',
        location: mockProfile.location || '',
        website: mockProfile.website || ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUserProfile();
    setRefreshing(false);
  }, []);

  const handleAvatarPress = async () => {
    if (!isOwnProfile) return;

    try {
      const result = await imageUploadService.showImagePicker({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8
      });

      if (result && !result.canceled && result.assets[0]) {
        setUploading(true);
        // In a real app, upload the image and update the profile
        setTimeout(() => {
          if (profile) {
            setProfile({
              ...profile,
              photoURL: result.assets[0].uri
            });
          }
          setUploading(false);
          Alert.alert('Success', 'Profile photo updated!');
        }, 2000);
      }
    } catch (error) {
      setUploading(false);
      Alert.alert('Error', 'Failed to update profile photo');
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      setLoading(true);
      // In a real app, update the profile via userService
      const updatedProfile = {
        ...profile,
        ...editForm
      };
      
      setProfile(updatedProfile);
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!profile || !currentUser?.uid) return;

    try {
      const conversationId = await messagingService.createConversation(
        currentUser.uid,
        profile.uid,
        {
          name: profile.displayName,
          avatar: profile.photoURL,
          lastSeen: profile.lastSeen || new Date()
        }
      );

      navigation.navigate('Chat', {
        conversationId,
        participantName: profile.displayName,
        participantAvatar: profile.photoURL,
        participantId: profile.uid
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to start conversation');
    }
  };

  const handleFollow = async () => {
    if (!profile) return;

    // Toggle follow status
    const newFollowStatus = !profile.isFollowing;
    setProfile({
      ...profile,
      isFollowing: newFollowStatus,
      followers: profile.followers + (newFollowStatus ? 1 : -1)
    });

    Alert.alert(
      'Success', 
      newFollowStatus ? 'You are now following this user' : 'You have unfollowed this user'
    );
  };

  const handleBlock = async () => {
    if (!profile) return;

    Alert.alert(
      'Block User',
      'Are you sure you want to block this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: () => {
            setProfile({ ...profile, isBlocked: true });
            Alert.alert('User Blocked', 'This user has been blocked');
          }
        }
      ]
    );
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatLastSeen = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 5) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const renderProfileHeader = () => (
    <Card style={styles.headerCard}>
      <View style={styles.headerContent}>
        <TouchableOpacity onPress={handleAvatarPress} disabled={!isOwnProfile}>
          <View style={styles.avatarContainer}>
            <Avatar.Image
              size={100}
              source={{ uri: profile?.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' }}
            />
            {isOwnProfile && (
              <View style={styles.avatarOverlay}>
                {uploading ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <MaterialCommunityIcons name="camera" size={20} color={colors.white} />
                )}
              </View>
            )}
            {!isOwnProfile && profile?.isOnline && (
              <View style={styles.onlineIndicator} />
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.displayName}>{profile?.displayName}</Text>
          
          {!isOwnProfile && profile?.lastSeen && !profile.isOnline && (
            <Text style={styles.lastSeen}>
              Last seen {formatLastSeen(profile.lastSeen)}
            </Text>
          )}
          
          {!isOwnProfile && profile?.isOnline && (
            <Chip icon="circle" style={styles.onlineChip} textStyle={styles.onlineText}>
              Online
            </Chip>
          )}

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile?.campaignCount}</Text>
              <Text style={styles.statLabel}>Campaigns</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile?.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile?.following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actionButtons}>
        {isOwnProfile ? (
          <Button
            mode="contained"
            onPress={() => setEditing(!editing)}
            style={styles.actionButton}
            icon={editing ? "close" : "pencil"}
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </Button>
        ) : (
          <>
            <Button
              mode="contained"
              onPress={handleSendMessage}
              style={[styles.actionButton, { flex: 1 }]}
              icon="message"
            >
              Message
            </Button>
            
            <Button
              mode={profile?.isFollowing ? "outlined" : "contained"}
              onPress={handleFollow}
              style={[styles.actionButton, { flex: 1, marginLeft: 8 }]}
              icon={profile?.isFollowing ? "account-minus" : "account-plus"}
            >
              {profile?.isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
          </>
        )}
      </View>
    </Card>
  );

  const renderProfileInfo = () => (
    <Card style={styles.infoCard}>
      <Text style={styles.sectionTitle}>About</Text>
      
      {editing ? (
        <View style={styles.editForm}>
          <TextInput
            label="Display Name"
            value={editForm.displayName}
            onChangeText={(text) => setEditForm({ ...editForm, displayName: text })}
            style={styles.editInput}
            mode="outlined"
          />
          
          <TextInput
            label="Bio"
            value={editForm.bio}
            onChangeText={(text) => setEditForm({ ...editForm, bio: text })}
            style={styles.editInput}
            mode="outlined"
            multiline
            numberOfLines={3}
          />
          
          <TextInput
            label="Location"
            value={editForm.location}
            onChangeText={(text) => setEditForm({ ...editForm, location: text })}
            style={styles.editInput}
            mode="outlined"
          />
          
          <TextInput
            label="Website"
            value={editForm.website}
            onChangeText={(text) => setEditForm({ ...editForm, website: text })}
            style={styles.editInput}
            mode="outlined"
          />
          
          <Button
            mode="contained"
            onPress={handleSaveProfile}
            style={styles.saveButton}
            loading={loading}
          >
            Save Changes
          </Button>
        </View>
      ) : (
        <View style={styles.infoContent}>
          {profile?.bio && (
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="text" size={20} color={colors.textSecondary} />
              <Text style={styles.infoText}>{profile.bio}</Text>
            </View>
          )}
          
          {profile?.location && (
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="map-marker" size={20} color={colors.textSecondary} />
              <Text style={styles.infoText}>{profile.location}</Text>
            </View>
          )}
          
          {profile?.website && (
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="web" size={20} color={colors.textSecondary} />
              <Text style={[styles.infoText, styles.link]}>{profile.website}</Text>
            </View>
          )}
          
          {profile?.privacy.showEmail && profile?.email && (
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="email" size={20} color={colors.textSecondary} />
              <Text style={styles.infoText}>{profile.email}</Text>
            </View>
          )}
          
          {profile?.privacy.showPhone && profile?.phoneNumber && (
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="phone" size={20} color={colors.textSecondary} />
              <Text style={styles.infoText}>{profile.phoneNumber}</Text>
            </View>
          )}
          
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="calendar" size={20} color={colors.textSecondary} />
            <Text style={styles.infoText}>
              Joined {formatDate(profile?.joinedDate || new Date())}
            </Text>
          </View>
        </View>
      )}
    </Card>
  );

  if (loading && !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="account-alert" size={64} color={colors.muted} />
        <Text style={styles.errorTitle}>Profile Not Found</Text>
        <Text style={styles.errorDescription}>
          The user profile you're looking for doesn't exist or has been removed.
        </Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }

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
          {isOwnProfile ? 'Your Profile' : profile.displayName}
        </Text>
        
        {!isOwnProfile && (
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
                handleBlock();
              }}
              title="Block User"
              leadingIcon="block-helper"
            />
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                Alert.alert('Report', 'Report functionality coming soon');
              }}
              title="Report"
              leadingIcon="flag"
            />
          </Menu>
        )}
        
        {isOwnProfile && (
          <IconButton
            icon="cog"
            iconColor={colors.white}
            onPress={() => navigation.navigate('Settings')}
          />
        )}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderProfileHeader()}
        {renderProfileInfo()}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
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
  content: {
    flex: 1,
    padding: 16,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.background,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  headerCard: {
    marginBottom: 16,
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.white,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 20,
  },
  displayName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  lastSeen: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  onlineChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.success + '20',
    marginBottom: 12,
  },
  onlineText: {
    color: colors.success,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    flex: 1,
  },
  infoCard: {
    marginBottom: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  infoContent: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  link: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  editForm: {
    gap: 16,
  },
  editInput: {
    backgroundColor: colors.surface,
  },
  saveButton: {
    marginTop: 8,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default UserProfileScreen;