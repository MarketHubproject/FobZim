import React, { useState } from 'react';
import { View } from 'react-native';
import { Creator } from '../data/types';
import CreatorProfileScreen from '../screens/Creators/CreatorProfileScreen';

interface CreatorNavigationWrapperProps {
  children: (openProfile: (creator: Creator) => void) => React.ReactNode;
}

export default function CreatorNavigationWrapper({ children }: CreatorNavigationWrapperProps) {
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);

  const openProfile = (creator: Creator) => {
    setSelectedCreator(creator);
  };

  const closeProfile = () => {
    setSelectedCreator(null);
  };

  if (selectedCreator) {
    return (
      <View style={{ flex: 1 }}>
        <CreatorProfileScreen 
          creator={selectedCreator} 
          onBack={closeProfile}
        />
      </View>
    );
  }

  return <>{children(openProfile)}</>;
}