import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  IconButton,
  Divider,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
// Mock enhanced auth for now
const useEnhancedAuth = () => ({
  signIn: async (email: string, password: string) => {
    console.log('Mock sign in:', email);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (email === 'demo@zimbuzz.com' && password === 'demo123') {
      return { success: true };
    }
    throw new Error('Invalid credentials');
  },
  loading: false
});

const colors = {
  primary: '#2E7D32',
  secondary: '#4CAF50',
  surface: '#FFFFFF',
  background: '#F5F5F5',
  textPrimary: '#212121',
  textSecondary: '#757575',
  error: '#D32F2F',
  white: '#FFFFFF'
};

interface LoginScreenProps {
  onSwitchToRegister: () => void;
}

export default function LoginScreen({ onSwitchToRegister }: LoginScreenProps) {
  console.log('✅ LoginScreen loaded - Latest Build [v1.2.1] - ' + new Date().toLocaleTimeString());
  
  const { signIn, loading } = useEnhancedAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: '',
    };

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await signIn(formData.email, formData.password);
      // Navigation will be handled automatically by auth state change
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'An error occurred during login');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDemoLogin = async () => {
    setFormData({
      email: 'demo@zimbuzz.com',
      password: 'demo123',
    });
    
    try {
      await signIn('demo@zimbuzz.com', 'demo123');
    } catch (error: any) {
      Alert.alert('Demo Login Failed', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="account-circle"
            size={80}
            color={colors.primary}
          />
          <Text variant="headlineMedium" style={styles.title}>
            Welcome to ZimBuzz
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Connect with Zimbabwe's rising creators 🇿🇼
          </Text>
        </View>

        {/* Login Form */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Text variant="titleLarge" style={styles.formTitle}>
              Sign In
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                mode="outlined"
                label="Email Address"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={!!errors.email}
                left={<TextInput.Icon icon="email" />}
                style={styles.input}
              />
              {errors.email ? (
                <Text variant="bodySmall" style={styles.errorText}>
                  {errors.email}
                </Text>
              ) : null}
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                mode="outlined"
                label="Password"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry={!showPassword}
                autoComplete="password"
                error={!!errors.password}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                style={styles.input}
              />
              {errors.password ? (
                <Text variant="bodySmall" style={styles.errorText}>
                  {errors.password}
                </Text>
              ) : null}
            </View>

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.loginButton}
              contentStyle={styles.buttonContent}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>

            <Divider style={styles.divider} />

            <Button
              mode="outlined"
              onPress={handleDemoLogin}
              disabled={loading}
              style={styles.demoButton}
              contentStyle={styles.buttonContent}
            >
              Try Demo Account
            </Button>

            <View style={styles.forgotPassword}>
              <Button mode="text" onPress={() => Alert.alert('Coming Soon', 'Password reset feature coming soon!')}>
                Forgot Password?
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Register Link */}
        <View style={styles.registerLink}>
          <Text variant="bodyMedium" style={styles.registerText}>
            Don't have an account?{' '}
          </Text>
          <Button
            mode="text"
            onPress={onSwitchToRegister}
            disabled={loading}
            style={styles.registerButton}
          >
            Sign Up
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    color: colors.primary,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  card: {
    elevation: 4,
    backgroundColor: colors.surface,
    marginBottom: 24,
  },
  cardContent: {
    padding: 24,
  },
  formTitle: {
    color: colors.textPrimary,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.surface,
  },
  errorText: {
    color: colors.error,
    marginTop: 4,
    marginLeft: 12,
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  divider: {
    marginVertical: 16,
  },
  demoButton: {
    borderColor: colors.secondary,
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 8,
  },
  registerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  registerText: {
    color: colors.textSecondary,
  },
  registerButton: {
    marginLeft: -8,
  },
});