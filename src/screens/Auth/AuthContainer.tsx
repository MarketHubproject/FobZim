import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';

export type AuthMode = 'login' | 'register';

export default function AuthContainer() {
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  const switchToRegister = () => setAuthMode('register');
  const switchToLogin = () => setAuthMode('login');

  return (
    <View style={styles.container}>
      {authMode === 'login' ? (
        <LoginScreen onSwitchToRegister={switchToRegister} />
      ) : (
        <RegisterScreen onSwitchToLogin={switchToLogin} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});