import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import RootNavigator from './src/navigation/RootNavigator';
import { paperTheme } from './src/theme/paperTheme';
import { colors } from './src/theme/colors';
// import { useAppInitialization } from './src/hooks/useAppInitialization';

export default function App() {
  // Initialize app with persistence
  // useAppInitialization();
  
  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <NavigationContainer>
          <RootNavigator />
          <StatusBar style="light" backgroundColor={colors.primary} />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

