import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  console.log('App is starting...');
  
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <View style={styles.container}>
          <StatusBar style="auto" />
          <Text style={styles.title}>ZimBuzz Test App 🇿🇼</Text>
          <Text style={styles.subtitle}>If you can see this, the app is working!</Text>
        </View>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
});