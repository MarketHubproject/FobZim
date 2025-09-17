import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import RootNavigator from './src/navigation/RootNavigator';
import { paperTheme } from './src/theme/paperTheme';
import { colors } from './src/theme/colors';
import { useIsHydrated } from './src/store/useAppStore';

// Loading screen component
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Loading ZimBuzz...</Text>
    </View>
  );
}

export default function App() {
  const isHydrated = useIsHydrated();

  // Show loading screen until store is hydrated
  if (!isHydrated) {
    return (
      <SafeAreaProvider>
        <PaperProvider theme={paperTheme}>
          <LoadingScreen />
          <StatusBar style="light" backgroundColor={colors.primary} />
        </PaperProvider>
      </SafeAreaProvider>
    );
  }

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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
