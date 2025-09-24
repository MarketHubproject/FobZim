import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors } from './src/theme/colors';

// Simple screen components
function HomeScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Home Screen</Text>
      <Text style={styles.subtitle}>Welcome to ZimBuzz!</Text>
    </View>
  );
}

function CreatorsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Creators Screen</Text>
      <Text style={styles.subtitle}>Discover creators from Zimbabwe</Text>
    </View>
  );
}

function CampaignsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Campaigns Screen</Text>
      <Text style={styles.subtitle}>Brand opportunities</Text>
    </View>
  );
}

function TrendsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Trends Screen</Text>
      <Text style={styles.subtitle}>Trending content</Text>
    </View>
  );
}

function ProfileScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Profile Screen</Text>
      <Text style={styles.subtitle}>Your profile</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
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
                  case 'Trends':
                    iconName = focused ? 'trending-up' : 'trending-up';
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
              headerStyle: {
                backgroundColor: colors.primary,
              },
              headerTintColor: colors.white,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            })}
          >
            <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'FobZim' }} />
            <Tab.Screen name="Creators" component={CreatorsScreen} />
            <Tab.Screen name="Campaigns" component={CampaignsScreen} />
            <Tab.Screen name="Trends" component={TrendsScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
          </Tab.Navigator>
          <StatusBar style="light" backgroundColor={colors.primary} />
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
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.primary,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});