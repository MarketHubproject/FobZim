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
  Checkbox,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
// Mock enhanced auth for now
const useEnhancedAuth = () => ({
  signUp: async (email: string, password: string, displayName: string) => {
    console.log('Mock sign up:', email, displayName);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { success: true };
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

interface RegisterScreenProps {
  onSwitchToLogin: () => void;
}

export default function RegisterScreen({ onSwitchToLogin }: RegisterScreenProps) {
  console.log('✅ RegisterScreen loaded - Latest Build [v1.2.1] - ' + new Date().toLocaleTimeString());
  
  const { signUp, loading } = useEnhancedAuth();
  
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const validateForm = () => {
    const newErrors = {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
    };

    // Display name validation
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    } else if (formData.displayName.trim().length < 2) {
      newErrors.displayName = 'Display name must be at least 2 characters';
    }

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
    } else if (!/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Password must contain both uppercase and lowercase letters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '') && agreeToTerms;
  };

  const handleRegister = async () => {
    if (!agreeToTerms) {
      Alert.alert('Terms Required', 'Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    if (!validateForm()) return;

    try {
      await signUp(formData.email, formData.password, formData.displayName.trim());
      // Navigation will be handled automatically by auth state change
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'An error occurred during registration');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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
            name="account-plus"
            size={80}
            color={colors.primary}
          />
          <Text variant="headlineMedium" style={styles.title}>
            Join ZimBuzz
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Create your account and connect with Zimbabwe's creators 🇿🇼
          </Text>
        </View>

        {/* Register Form */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Text variant="titleLarge" style={styles.formTitle}>
              Create Account
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                mode="outlined"
                label="Display Name"
                value={formData.displayName}
                onChangeText={(value) => handleInputChange('displayName', value)}
                autoCapitalize="words"
                autoComplete="name"
                error={!!errors.displayName}
                left={<TextInput.Icon icon="account" />}
                style={styles.input}
              />
              {errors.displayName ? (
                <Text variant="bodySmall" style={styles.errorText}>
                  {errors.displayName}
                </Text>
              ) : null}
            </View>

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
                autoComplete="password-new"
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

            <View style={styles.inputContainer}>
              <TextInput
                mode="outlined"
                label="Confirm Password"
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                secureTextEntry={!showConfirmPassword}
                autoComplete="password-new"
                error={!!errors.confirmPassword}
                left={<TextInput.Icon icon="lock-check" />}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
                style={styles.input}
              />
              {errors.confirmPassword ? (
                <Text variant="bodySmall" style={styles.errorText}>
                  {errors.confirmPassword}
                </Text>
              ) : null}
            </View>

            {/* Terms and Conditions */}
            <View style={styles.checkboxContainer}>
              <Checkbox
                status={agreeToTerms ? 'checked' : 'unchecked'}
                onPress={() => setAgreeToTerms(!agreeToTerms)}
              />
              <View style={styles.termsTextContainer}>
                <Text variant="bodySmall" style={styles.termsText}>
                  I agree to the{' '}
                  <Text
                    style={styles.linkText}
                    onPress={() => Alert.alert('Terms of Service', 'Terms of Service coming soon!')}
                  >
                    Terms of Service
                  </Text>
                  {' '}and{' '}
                  <Text
                    style={styles.linkText}
                    onPress={() => Alert.alert('Privacy Policy', 'Privacy Policy coming soon!')}
                  >
                    Privacy Policy
                  </Text>
                </Text>
              </View>
            </View>

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              disabled={loading || !agreeToTerms}
              style={[
                styles.registerButton,
                (!agreeToTerms) && styles.disabledButton
              ]}
              contentStyle={styles.buttonContent}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Card.Content>
        </Card>

        {/* Login Link */}
        <View style={styles.loginLink}>
          <Text variant="bodyMedium" style={styles.loginText}>
            Already have an account?{' '}
          </Text>
          <Button
            mode="text"
            onPress={onSwitchToLogin}
            disabled={loading}
            style={styles.loginButton}
          >
            Sign In
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  termsTextContainer: {
    flex: 1,
    marginLeft: 8,
    marginTop: 8,
  },
  termsText: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
  linkText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  registerButton: {
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  loginLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  loginText: {
    color: colors.textSecondary,
  },
  loginButton: {
    marginLeft: -8,
  },
});