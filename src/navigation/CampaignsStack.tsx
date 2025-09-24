import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';

// Import screens
import CampaignsScreen from '../screens/Campaigns/CampaignsScreen';
import ApplyFormScreen from '../screens/Campaigns/ApplyFormScreen';
import CampaignCreateScreen from '../screens/CampaignCreateScreen';
import CampaignDetailScreen from '../screens/CampaignDetailScreen';

export type CampaignsStackParamList = {
  CampaignsList: undefined;
  ApplyForm: { campaignId: string; campaignTitle: string };
  CreateCampaign: undefined;
  CampaignDetail: { campaignId: string };
};

const Stack = createNativeStackNavigator<CampaignsStackParamList>();

export default function CampaignsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        animation: 'slide_from_right',
        animationDuration: 300,
      }}
    >
      <Stack.Screen 
        name="CampaignsList" 
        component={CampaignsScreen}
        options={{ 
          title: 'Brand Campaigns',
          animation: 'fade',
        }}
      />
      <Stack.Screen
        name="ApplyForm"
        component={ApplyFormScreen}
        options={({ route }) => ({ 
          title: `Apply to ${route.params.campaignTitle}`,
          presentation: 'modal',
          headerShown: true,
          animation: 'slide_from_bottom',
          gestureEnabled: true,
          gestureDirection: 'vertical',
        })}
      />
      <Stack.Screen
        name="CreateCampaign"
        component={CampaignCreateScreen}
        options={{ 
          title: 'Create Campaign',
          headerShown: true,
          animation: 'slide_from_right',
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="CampaignDetail"
        component={CampaignDetailScreen}
        options={{ 
          title: 'Campaign Details',
          headerShown: true,
          animation: 'slide_from_right',
          gestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
}
