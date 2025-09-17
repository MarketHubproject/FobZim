import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens (we'll create these later)
import CampaignsScreen from '../screens/Campaigns/CampaignsScreen';
import ApplyFormScreen from '../screens/Campaigns/ApplyFormScreen';

export type CampaignsStackParamList = {
  CampaignsList: undefined;
  ApplyForm: { campaignId: string; campaignTitle: string };
};

const Stack = createNativeStackNavigator<CampaignsStackParamList>();

export default function CampaignsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="CampaignsList" 
        component={CampaignsScreen}
        options={{ title: 'Brand Campaigns' }}
      />
      <Stack.Screen
        name="ApplyForm"
        component={ApplyFormScreen}
        options={({ route }) => ({ 
          title: `Apply to ${route.params.campaignTitle}`,
          presentation: 'modal',
          headerShown: true,
        })}
      />
    </Stack.Navigator>
  );
}