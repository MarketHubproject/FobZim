import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  Dimensions,
  Platform,
  TouchableOpacity,
  Linking
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
  Dialog
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

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
  info: '#2196F3'
};

interface ProfileScreenProps {}

const ProfileScreen: React.FC<ProfileScreenProps> = () => {
  const { user, userProfile, updateUserProfile, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    displayName: userProfile?.displayName || '',
    bio: userProfile?.bio || '',
    location: userProfile?.location || '',
    phone: userProfile?.phone || '',
    website: '',
    instagram: '',
    tiktok: '',
    youtube: ''
  });

  // Settings state
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    campaignNotifications: true,
    followNotifications: true,
    darkMode: false,
    privateProfile: false
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleSaveProfile = useCallback(async () => {
    try {
      await updateUserProfile({
        displayName: editForm.displayName,
        bio: editForm.bio,
        location: editForm.location,
        phone: editForm.phone
      });
      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  }, [editForm, updateUserProfile]);

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

  // Mock data for demonstration
  const mockStats = {
    followers: 1250,
    following: 324,
    posts: 89,
    campaigns: 12,
    totalEarnings: 25000
  };

  const mockRecentActivity = [
    { type: 'campaign', title: 'Applied to EcoCash Campaign', date: '2 hours ago', icon: 'briefcase' },
    { type: 'follow', title: 'New follower: @jane_doe', date: '1 day ago', icon: 'account-plus' },
    { type: 'tip', title: 'Received a tip: $5', date: '3 days ago', icon: 'currency-usd' },
    { type: 'post', title: 'Posted new content', date: '5 days ago', icon: 'image' }
  ];

  if (!user || !userProfile) {
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons name="account-circle" size={64} color={colors.muted} />
        <Text style={styles.centerTitle}>Profile not found</Text>
        <Button mode="contained" onPress={() => {}} style={styles.button}>
          Reload
        </Button>
      </View>
    );
  }

  const isCreator = userProfile.isCreator;

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header Section */}
        <Card style={styles.headerCard} elevation={2}>
          <Card.Content style={styles.headerContent}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <Avatar.Image
                  size={80}
                  source={{ uri: userProfile.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' }}
                />
                {userProfile.isVerified && (
                  <Badge
                    style={styles.verifiedBadge}
                    size={24}
                  >
                    <MaterialCommunityIcons name="check-decagram" size={16} color={colors.white} />
                  </Badge>
                )}
              </View>
              
              <View style={styles.profileInfo}>
                <View style={styles.nameContainer}>
                  <Text style={styles.profileName}>{userProfile.displayName}</Text>
                  {isCreator && (
                    <Chip
                      icon="star"
                      mode="outlined"
                      compact
                      style={styles.creatorChip}
                      textStyle={styles.creatorChipText}
                    >
                      Creator
                    </Chip>
                  )}
                </View>
                <Text style={styles.profileEmail}>{user.email}</Text>
                {userProfile.bio && (
                  <Text style={styles.profileBio}>{userProfile.bio}</Text>
                )}
                {userProfile.location && (
                  <View style={styles.locationContainer}>
                    <MaterialCommunityIcons name="map-marker" size={16} color={colors.muted} />
                    <Text style={styles.locationText}>{userProfile.location}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Stats Row */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{mockStats.followers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{mockStats.following}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
              {isCreator && (
                <>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{mockStats.campaigns}</Text>
                    <Text style={styles.statLabel}>Campaigns</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>${mockStats.totalEarnings}</Text>
                    <Text style={styles.statLabel}>Earned</Text>
                  </View>
                </>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <Button
            mode="contained"
            icon="pencil"
            onPress={() => setEditModalVisible(true)}
            style={[styles.actionButton, styles.primaryButton]}
            contentStyle={styles.buttonContent}
          >
            Edit Profile
          </Button>
          {!isCreator && (
            <Button
              mode="outlined"
              icon="star"
              onPress={() => {/* TODO: Implement creator application */}}
              style={[styles.actionButton, styles.outlinedButton]}
              contentStyle={styles.buttonContent}
            >
              Become Creator
            </Button>
          )}
        </View>

        {/* Quick Actions */}
        <Card style={styles.card} elevation={1}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <List.Item
              title="Settings & Privacy"
              description="Manage your account settings"
              left={(props) => <List.Icon {...props} icon="cog" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => setSettingsVisible(true)}
            />
            <Divider />
            <List.Item
              title="Help & Support"
              description="Get help with your account"
              left={(props) => <List.Icon {...props} icon="help-circle" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => openExternalLink('mailto:support@zimbuzz.com')}
            />
            <Divider />
            <List.Item
              title="About ZimBuzz"
              description="Learn more about our platform"
              left={(props) => <List.Icon {...props} icon="information" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {/* TODO: Implement about screen */}}
            />
          </Card.Content>
        </Card>

        {/* Recent Activity */}
        <Card style={styles.card} elevation={1}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {mockRecentActivity.map((activity, index) => (
              <View key={index}>
                <List.Item
                  title={activity.title}
                  description={activity.date}
                  left={(props) => <List.Icon {...props} icon={activity.icon} />}
                />
                {index < mockRecentActivity.length - 1 && <Divider />}
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Danger Zone */}
        <Card style={styles.card} elevation={1}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Account</Text>
            <List.Item
              title="Sign Out"
              description="Sign out of your account"
              titleStyle={{ color: colors.error }}
              left={(props) => <List.Icon {...props} icon="logout" color={colors.error} />}
              onPress={() => setLogoutDialogVisible(true)}
            />
          </Card.Content>
        </Card>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Floating Action Button for Creators */}
      {isCreator && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => {/* TODO: Implement quick actions menu */}}
        />
      )}

      {/* Edit Profile Modal */}
      <Portal>
        <Modal
          visible={editModalVisible}
          onDismiss={() => setEditModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <ScrollView>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            
            <TextInput
              label="Display Name"
              value={editForm.displayName}
              onChangeText={(text) => setEditForm({ ...editForm, displayName: text })}
              style={styles.input}
              mode="outlined"
            />
            
            <TextInput
              label="Bio"
              value={editForm.bio}
              onChangeText={(text) => setEditForm({ ...editForm, bio: text })}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
            />
            
            <TextInput
              label="Location"
              value={editForm.location}
              onChangeText={(text) => setEditForm({ ...editForm, location: text })}
              style={styles.input}
              mode="outlined"
            />
            
            <TextInput
              label="Phone Number"
              value={editForm.phone}
              onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
              style={styles.input}
              mode="outlined"
              keyboardType="phone-pad"
            />
            
            <View style={styles.modalButtons}>
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
              >
                Save
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Settings Modal */}
      <Portal>
        <Modal
          visible={settingsVisible}
          onDismiss={() => setSettingsVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <ScrollView>
            <Text style={styles.modalTitle}>Settings</Text>
            
            <Text style={styles.settingsSectionTitle}>Notifications</Text>
            
            <List.Item
              title="Push Notifications"
              description="Receive push notifications"
              right={() => (
                <Switch
                  value={settings.pushNotifications}
                  onValueChange={(value) => setSettings({ ...settings, pushNotifications: value })}
                />
              )}
            />
            
            <List.Item
              title="Email Notifications"
              description="Receive email notifications"
              right={() => (
                <Switch
                  value={settings.emailNotifications}
                  onValueChange={(value) => setSettings({ ...settings, emailNotifications: value })}
                />
              )}
            />
            
            <Divider />
            
            <Text style={styles.settingsSectionTitle}>Privacy</Text>
            
            <List.Item
              title="Private Profile"
              description="Make your profile private"
              right={() => (
                <Switch
                  value={settings.privateProfile}
                  onValueChange={(value) => setSettings({ ...settings, privateProfile: value })}
                />
              )}
            />
            
            <View style={styles.modalButtons}>
              <Button
                mode="contained"
                onPress={() => setSettingsVisible(false)}
                style={styles.fullWidthButton}
              >
                Done
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Logout Confirmation Dialog */}
      <Portal>
        <Dialog visible={logoutDialogVisible} onDismiss={() => setLogoutDialogVisible(false)}>
          <Dialog.Title>Sign Out</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to sign out of your account?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLogoutDialogVisible(false)}>Cancel</Button>
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
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  centerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 12,
    marginBottom: 20,
  },
  headerCard: {
    margin: 16,
    backgroundColor: colors.white,
  },
  headerContent: {
    paddingVertical: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  verifiedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.success,
  },
  profileInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginRight: 8,
  },
  creatorChip: {
    height: 24,
  },
  creatorChipText: {
    fontSize: 12,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  profileBio: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: colors.muted,
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.muted + '20',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  outlinedButton: {
    borderColor: colors.primary,
  },
  buttonContent: {
    paddingVertical: 4,
  },
  card: {
    margin: 16,
    marginTop: 0,
    backgroundColor: colors.white,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  modal: {
    backgroundColor: colors.white,
    margin: 20,
    padding: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    minWidth: 80,
  },
  fullWidthButton: {
    width: '100%',
  },
  settingsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  bottomSpacer: {
    height: 80,
  },
  button: {
    marginTop: 16,
  },
});

export default ProfileScreen;