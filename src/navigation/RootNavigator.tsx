import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

// Import screens (we'll create these later)
import SimpleHomeScreen from '../screens/Home/SimpleHomeScreen';
import CreatorsScreen from '../screens/Creators/CreatorsScreen';
import TrendsScreen from '../screens/Trends/TrendsScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import CampaignsStack from './CampaignsStack';

export type RootTabParamList = {
  Home: undefined;
  Creators: undefined;
  Campaigns: undefined;
  Trends: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function RootNavigator() {
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
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
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
        component={SimpleHomeScreen}
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