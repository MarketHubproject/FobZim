import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

export default function TestApp() {
  console.log('🧪 Test App Loading...');
  
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <StatusBar style="auto" />
        <View style={styles.container}>
          <Text style={styles.title}>ZimBuzz Test App</Text>
          <Text style={styles.subtitle}>If you can see this, basic setup works! 🇿🇼</Text>
        </View>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2E7D32',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});