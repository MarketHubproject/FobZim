import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PaperProvider, Button } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { EnhancedAuthProvider, useEnhancedAuth } from './src/contexts/EnhancedAuthContext';

// Import auth container for fallback
import AuthContainer from './src/screens/Auth/AuthContainer';

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

// Using RootNavigator with all screens properly configured

// Import our enhanced screens
import RootNavigator from './src/navigation/RootNavigator';
import MessagesScreen from './src/screens/MessagesScreen';

function TabNavigator() {
  console.log('📱 Loading TabNavigator...');
  
  try {
    console.log('🔄 About to render RootNavigator');
    // Use our enhanced navigation structure
    return <RootNavigator />;
  } catch (error) {
    console.error('⚠️ Error in TabNavigator:', error);
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>Error loading app</Text>
        <Text style={styles.subtitle}>{String(error)}</Text>
      </View>
    );
  }
}

// Main navigation component with auth logic
function AppNavigator() {
  // TEMPORARY: Bypass authentication for testing
  // TODO: Re-enable authentication when Firebase is properly configured
  console.log('🚀 AppNavigator loading - going directly to main app');
  
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  console.log('🇿🇼 ZimBuzz App Starting - Authentication Bypassed for Testing!');
  console.log('App with Authentication is starting...');
  
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <StatusBar style="auto" />
        <AppNavigator />
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
