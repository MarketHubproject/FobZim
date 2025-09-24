import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
// import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/tokens';

// Import screens
import HomeScreen from '../screens/Home/HomeScreen';
import CreatorsScreen from '../screens/Creators/CreatorsScreen';
import TrendsScreen from '../screens/Trends/TrendsScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import MessagesScreen from '../screens/MessagesScreen';
import CampaignsStack from './CampaignsStack';

export type RootTabParamList = {
  Home: undefined;
  Creators: undefined;
  Campaigns: undefined;
  Messages: undefined;
  Trends: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

// Enhanced tab icon with haptic feedback
function AnimatedTabIcon({ 
  name, 
  focused, 
  color, 
  size 
}: {
  name: keyof typeof MaterialCommunityIcons.glyphMap;
  focused: boolean;
  color: string;
  size: number;
}) {
  // React.useEffect(() => {
  //   if (focused) {
  //     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  //   }
  // }, [focused]);

  return (
    <View style={[styles.iconContainer, { opacity: focused ? 1 : 0.7 }]}>
      <MaterialCommunityIcons 
        name={name} 
        size={focused ? size + 2 : size} 
        color={color} 
      />
      {focused && (
        <View style={[styles.indicator, { backgroundColor: color }]} />
      )}
    </View>
  );
}

export default function RootNavigator() {
  console.log('🏠 RootNavigator rendering...');
  
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
            case 'Trends':
              iconName = focused ? 'trending-up' : 'trending-up';
              break;
            case 'Profile':
              iconName = focused ? 'account-circle' : 'account-circle-outline';
              break;
            default:
              iconName = 'help-circle-outline';
          }

          return (
            <AnimatedTabIcon
              name={iconName}
              focused={focused}
              color={color}
              size={size}
            />
          );
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          paddingTop: 8,
          paddingBottom: 8,
          height: 65,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3.84,
          borderRadius: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        // Screen transition animations
        animationEnabled: true,
        animation: 'slide_from_right',
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'FobZim' }}
      />
      <Tab.Screen 
        name="Creators" 
        component={CreatorsScreen}
        options={{ title: 'Creators' }}
      />
      <Tab.Screen 
        name="Campaigns" 
        component={CampaignsStack}
        options={{ 
          title: 'Campaigns',
          headerShown: false, // CampaignsStack will handle its own headers
        }}
      />
      <Tab.Screen 
        name="Messages" 
        component={MessagesScreen}
        options={{ title: 'Messages' }}
      />
      <Tab.Screen 
        name="Trends" 
        component={TrendsScreen}
        options={{ title: 'Trends' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
  },
  indicator: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
