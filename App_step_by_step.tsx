import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

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

// Simple test screens
function HomeScreen() {
  return (
    <View style={styles.screen}>
      <MaterialCommunityIcons name="home" size={64} color={colors.primary} />
      <Text style={styles.title}>Home Screen Works! 🏠</Text>
      <Text style={styles.subtitle}>Navigation is functioning</Text>
    </View>
  );
}

function MessagesScreen() {
  return (
    <View style={styles.screen}>
      <MaterialCommunityIcons name="message" size={64} color={colors.primary} />
      <Text style={styles.title}>Messages Screen 💬</Text>
      <Text style={styles.subtitle}>This is where our chat system will go</Text>
    </View>
  );
}

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
        component={MessagesScreen}
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

export default function App() {
  console.log('App with Navigation is starting...');
  
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={TabNavigator} />
          </Stack.Navigator>
        </NavigationContainer>
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
  },
});