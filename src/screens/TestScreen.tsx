import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function TestScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.text}>
        App is Working! 🎉
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        This is a minimal test screen to verify the app loads correctly.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  text: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
  },
});