import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Import our contexts
import { AuthProvider } from './src/contexts/AuthContext';
import { NotificationProvider } from './src/contexts/NotificationContext';

// Import screens
import AuthScreen from './src/screens/AuthScreen';
import ConversationsScreen from './src/screens/ConversationsScreen';
import ChatScreen from './src/screens/ChatScreen';
import UserProfileScreen from './src/screens/UserProfileScreen';
import MessageSearchScreen from './src/screens/MessageSearchScreen';
import CampaignDetailScreen from './src/screens/CampaignDetailScreen';

// Import types
import { RootStackParamList, TabParamList } from './src/types/navigation';

// Create navigators
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Colors
const colors = {
  primary: '#2E7D32',
  secondary: '#4CAF50',
  surface: '#FFFFFF',
  background: '#F5F5F5',
  textPrimary: '#212121',
  textSecondary: '#757575',
  muted: '#BDBDBD',
  white: '#FFFFFF'
};

// Simple Home Screen for testing
function HomeScreen() {
  return (
    <View style={styles.screen}>
      <MaterialCommunityIcons name="home" size={64} color={colors.primary} />
      <Text style={styles.title}>Welcome to ZimBuzz! 🇿🇼</Text>
      <Text style={styles.subtitle}>
        Your messaging system is ready for testing.{'\n'}
        Navigate to Messages to test the chat features.
      </Text>
    </View>
  );
}

// Simple placeholder screens
function SearchScreen() {
  return (
    <View style={styles.screen}>
      <MaterialCommunityIcons name="magnify" size={64} color={colors.muted} />
      <Text style={styles.title}>Search</Text>
      <Text style={styles.subtitle}>Search functionality coming soon</Text>
    </View>
  );
}

function NotificationsScreen() {
  return (
    <View style={styles.screen}>
      <MaterialCommunityIcons name="bell" size={64} color={colors.muted} />
      <Text style={styles.title}>Notifications</Text>
      <Text style={styles.subtitle}>Notifications coming soon</Text>
    </View>
  );
}

function ProfileScreen() {
  return (
    <View style={styles.screen}>
      <MaterialCommunityIcons name="account" size={64} color={colors.muted} />
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Profile management coming soon</Text>
    </View>
  );
}

// Tab Navigator
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.background,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="magnify" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={ConversationsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="message" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bell" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Main App Component
export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <AuthProvider>
          <NotificationProvider>
            <NavigationContainer>
              <StatusBar style="auto" />
              <Stack.Navigator
                screenOptions={{
                  headerShown: false,
                }}
              >
                {/* Authentication */}
                <Stack.Screen name="Auth" component={AuthScreen} />
                
                {/* Main App */}
                <Stack.Screen name="Main" component={TabNavigator} />
                
                {/* Chat Screens */}
                <Stack.Screen name="Chat" component={ChatScreen} />
                <Stack.Screen name="MessageSearch" component={MessageSearchScreen} />
                
                {/* Profile Screens */}
                <Stack.Screen name="UserProfile" component={UserProfileScreen} />
                
                {/* Campaign Screens */}
                <Stack.Screen name="CampaignDetail" component={CampaignDetailScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          </NotificationProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});