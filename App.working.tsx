import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PaperProvider, Card, Button, Appbar } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const Tab = createBottomTabNavigator();

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
};

// Simple Home Screen
function HomeScreen() {
  console.log('🏠 HomeScreen rendering...');
  
  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={{ backgroundColor: colors.primary }}>
        <Appbar.Content title="FobZim" titleStyle={{ color: colors.white }} />
      </Appbar.Header>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>Welcome to FobZim! 🇿🇼</Text>
          <Text style={styles.subtitle}>Discover Zimbabwe's rising content creators</Text>
        </View>
        
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Featured Campaign</Text>
            <Text style={styles.cardText}>
              Join our Zimbabwe Tourism Campaign and showcase the beauty of our country!
            </Text>
            <Button 
              mode="contained" 
              style={styles.button}
              buttonColor={colors.primary}
              onPress={() => console.log('Apply pressed')}
            >
              Apply Now
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Trending Creators</Text>
            <Text style={styles.cardText}>
              Check out the most popular creators from Zimbabwe making waves in social media.
            </Text>
            <Button 
              mode="outlined" 
              style={styles.button}
              textColor={colors.primary}
              onPress={() => console.log('Explore pressed')}
            >
              Explore Creators
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

// Simple Creators Screen
function CreatorsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={{ backgroundColor: colors.primary }}>
        <Appbar.Content title="Creators" titleStyle={{ color: colors.white }} />
      </Appbar.Header>
      
      <View style={styles.centerContent}>
        <MaterialCommunityIcons name="account-star" size={64} color={colors.primary} />
        <Text style={styles.title}>Creators Hub</Text>
        <Text style={styles.subtitle}>Discover talented creators from Zimbabwe</Text>
      </View>
    </SafeAreaView>
  );
}

// Simple Campaigns Screen
function CampaignsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={{ backgroundColor: colors.primary }}>
        <Appbar.Content title="Campaigns" titleStyle={{ color: colors.white }} />
      </Appbar.Header>
      
      <View style={styles.centerContent}>
        <MaterialCommunityIcons name="briefcase" size={64} color={colors.primary} />
        <Text style={styles.title}>Brand Campaigns</Text>
        <Text style={styles.subtitle}>Find opportunities to collaborate with brands</Text>
      </View>
    </SafeAreaView>
  );
}

// Simple Messages Screen
function MessagesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={{ backgroundColor: colors.primary }}>
        <Appbar.Content title="Messages" titleStyle={{ color: colors.white }} />
      </Appbar.Header>
      
      <View style={styles.centerContent}>
        <MaterialCommunityIcons name="message" size={64} color={colors.primary} />
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>Connect with other creators and brands</Text>
      </View>
    </SafeAreaView>
  );
}

// Simple Profile Screen
function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={{ backgroundColor: colors.primary }}>
        <Appbar.Content title="Profile" titleStyle={{ color: colors.white }} />
      </Appbar.Header>
      
      <View style={styles.centerContent}>
        <MaterialCommunityIcons name="account-circle" size={64} color={colors.primary} />
        <Text style={styles.title}>Your Profile</Text>
        <Text style={styles.subtitle}>Manage your creator profile and settings</Text>
        
        <Button 
          mode="contained" 
          style={[styles.button, { marginTop: 20 }]}
          buttonColor={colors.primary}
          onPress={() => console.log('Edit profile pressed')}
        >
          Edit Profile
        </Button>
      </View>
    </SafeAreaView>
  );
}

// Main Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Creators':
              iconName = focused ? 'account-star' : 'account-star-outline';
              break;
            case 'Campaigns':
              iconName = focused ? 'briefcase' : 'briefcase-outline';
              break;
            case 'Messages':
              iconName = focused ? 'message' : 'message-outline';
              break;
            case 'Profile':
              iconName = focused ? 'account-circle' : 'account-circle-outline';
              break;
            default:
              iconName = 'help-circle-outline';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          paddingTop: 8,
          paddingBottom: 8,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Creators" component={CreatorsScreen} />
      <Tab.Screen name="Campaigns" component={CampaignsScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  console.log('🇿🇼 ZimBuzz App Starting Successfully!');
  
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <StatusBar style="auto" />
        <NavigationContainer>
          <MainTabs />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
    backgroundColor: colors.surface,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});