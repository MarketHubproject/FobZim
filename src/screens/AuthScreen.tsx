import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Card, TextInput, Button, Divider, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const colors = {
  primary: '#2E7D32',
  secondary: '#4CAF50',
  surface: '#FFFFFF',
  background: '#F5F5F5',
  textPrimary: '#212121',
  textSecondary: '#757575',
  error: '#F44336',
  white: '#FFFFFF',
};

type AuthMode = 'login' | 'signup' | 'creator-setup';

interface CreatorSetupData {
  category: string;
  bio: string;
  location: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  youtube?: string;
}

export default function AuthScreen() {
  const { signIn, signUp, becomeCreator, loading } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });
  const [creatorData, setCreatorData] = useState<CreatorSetupData>({
    category: '',
    bio: '',
    location: '',
    instagram: '',
    twitter: '',
    tiktok: '',
    youtube: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const categories = ['Lifestyle', 'Food', 'Tech', 'Fashion', 'Music', 'Travel', 'Fitness', 'Education'];
  const locations = ['Harare', 'Bulawayo', 'Gweru', 'Victoria Falls', 'Mutare', 'Masvingo', 'Chitungwiza'];

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (mode === 'signup') {
      if (!formData.displayName.trim()) {
        newErrors.push('Display name is required');
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.push('Passwords do not match');
      }
    }

    if (!formData.email.trim()) {
      newErrors.push('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.push('Email is invalid');
    }

    if (!formData.password.trim()) {
      newErrors.push('Password is required');
    } else if (formData.password.length < 6) {
      newErrors.push('Password must be at least 6 characters');
    }

    if (mode === 'creator-setup') {
      if (!creatorData.category) {
        newErrors.push('Category is required');
      }
      if (!creatorData.bio.trim()) {
        newErrors.push('Bio is required');
      }
      if (!creatorData.location) {
        newErrors.push('Location is required');
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (mode === 'login') {
        await signIn(formData.email, formData.password);
      } else if (mode === 'signup') {
        await signUp(formData.email, formData.password, formData.displayName);
        Alert.alert(
          'Account Created! 🎉',
          'Would you like to become a creator and showcase your content?',
          [
            { text: 'Not Now', style: 'cancel' },
            { text: 'Yes, Become Creator', onPress: () => setMode('creator-setup') }
          ]
        );
      } else if (mode === 'creator-setup') {
        const socialHandles: any = {};
        if (creatorData.instagram) socialHandles.instagram = creatorData.instagram;
        if (creatorData.twitter) socialHandles.twitter = creatorData.twitter;
        if (creatorData.tiktok) socialHandles.tiktok = creatorData.tiktok;
        if (creatorData.youtube) socialHandles.youtube = creatorData.youtube;

        await becomeCreator({
          category: creatorData.category,
          bio: creatorData.bio,
          location: creatorData.location,
          socialMediaHandles: Object.keys(socialHandles).length > 0 ? socialHandles : undefined
        });

        Alert.alert(
          'Welcome to the Creator Community! 🌟',
          'You can now apply to brand campaigns and connect with fellow creators.'
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const renderLoginForm = () => (
    <>
      <TextInput
        label="Email"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        mode="outlined"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        left={<TextInput.Icon icon="email-outline" />}
      />

      <TextInput
        label="Password"
        value={formData.password}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
        mode="outlined"
        style={styles.input}
        secureTextEntry={!showPassword}
        left={<TextInput.Icon icon="lock-outline" />}
        right={
          <TextInput.Icon
            icon={showPassword ? 'eye-off' : 'eye'}
            onPress={() => setShowPassword(!showPassword)}
          />
        }
      />

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        Sign In
      </Button>

      <Divider style={styles.divider} />

      <Button
        mode="text"
        onPress={() => setMode('signup')}
        style={styles.textButton}
      >
        Don't have an account? Sign Up
      </Button>
    </>
  );

  const renderSignupForm = () => (
    <>
      <TextInput
        label="Display Name"
        value={formData.displayName}
        onChangeText={(text) => setFormData({ ...formData, displayName: text })}
        mode="outlined"
        style={styles.input}
        left={<TextInput.Icon icon="account-outline" />}
      />

      <TextInput
        label="Email"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        mode="outlined"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        left={<TextInput.Icon icon="email-outline" />}
      />

      <TextInput
        label="Password"
        value={formData.password}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
        mode="outlined"
        style={styles.input}
        secureTextEntry={!showPassword}
        left={<TextInput.Icon icon="lock-outline" />}
        right={
          <TextInput.Icon
            icon={showPassword ? 'eye-off' : 'eye'}
            onPress={() => setShowPassword(!showPassword)}
          />
        }
      />

      <TextInput
        label="Confirm Password"
        value={formData.confirmPassword}
        onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
        mode="outlined"
        style={styles.input}
        secureTextEntry={!showPassword}
        left={<TextInput.Icon icon="lock-check-outline" />}
      />

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        Create Account
      </Button>

      <Divider style={styles.divider} />

      <Button
        mode="text"
        onPress={() => setMode('login')}
        style={styles.textButton}
      >
        Already have an account? Sign In
      </Button>
    </>
  );

  const renderCreatorSetup = () => (
    <>
      <Text style={styles.sectionTitle}>Become a Creator 🌟</Text>
      <Text style={styles.sectionSubtitle}>
        Set up your creator profile to connect with Zimbabwean brands
      </Text>

      <Text style={styles.label}>Category *</Text>
      <View style={styles.chipContainer}>
        {categories.map((category) => (
          <Chip
            key={category}
            selected={creatorData.category === category}
            onPress={() => setCreatorData({ ...creatorData, category })}
            style={[
              styles.chip,
              creatorData.category === category && styles.selectedChip
            ]}
            textStyle={creatorData.category === category ? styles.selectedChipText : styles.chipText}
          >
            {category}
          </Chip>
        ))}
      </View>

      <TextInput
        label="Bio *"
        value={creatorData.bio}
        onChangeText={(text) => setCreatorData({ ...creatorData, bio: text })}
        mode="outlined"
        style={styles.input}
        multiline
        numberOfLines={3}
        placeholder="Tell us about your content and what makes you unique..."
      />

      <Text style={styles.label}>Location *</Text>
      <View style={styles.chipContainer}>
        {locations.map((location) => (
          <Chip
            key={location}
            selected={creatorData.location === location}
            onPress={() => setCreatorData({ ...creatorData, location })}
            style={[
              styles.chip,
              creatorData.location === location && styles.selectedChip
            ]}
            textStyle={creatorData.location === location ? styles.selectedChipText : styles.chipText}
            icon="map-marker"
          >
            {location}
          </Chip>
        ))}
      </View>

      <Text style={styles.label}>Social Media Handles (Optional)</Text>

      <TextInput
        label="Instagram Username"
        value={creatorData.instagram}
        onChangeText={(text) => setCreatorData({ ...creatorData, instagram: text })}
        mode="outlined"
        style={styles.input}
        left={<TextInput.Icon icon="instagram" />}
        placeholder="@username"
      />

      <TextInput
        label="Twitter Username"
        value={creatorData.twitter}
        onChangeText={(text) => setCreatorData({ ...creatorData, twitter: text })}
        mode="outlined"
        style={styles.input}
        left={<TextInput.Icon icon="twitter" />}
        placeholder="@username"
      />

      <TextInput
        label="TikTok Username"
        value={creatorData.tiktok}
        onChangeText={(text) => setCreatorData({ ...creatorData, tiktok: text })}
        mode="outlined"
        style={styles.input}
        left={<TextInput.Icon icon="music-note" />}
        placeholder="@username"
      />

      <TextInput
        label="YouTube Channel"
        value={creatorData.youtube}
        onChangeText={(text) => setCreatorData({ ...creatorData, youtube: text })}
        mode="outlined"
        style={styles.input}
        left={<TextInput.Icon icon="youtube" />}
        placeholder="Channel name or URL"
      />

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        Complete Setup
      </Button>

      <Button
        mode="text"
        onPress={() => setMode('login')}
        style={styles.textButton}
      >
        Skip for now
      </Button>
    </>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.logo}>🇿🇼 ZimBuzz</Text>
          <Text style={styles.subtitle}>
            {mode === 'login' && 'Welcome back to Zimbabwe\'s creator community'}
            {mode === 'signup' && 'Join Zimbabwe\'s creative community'}
            {mode === 'creator-setup' && 'Set up your creator profile'}
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            {errors.length > 0 && (
              <View style={styles.errorContainer}>
                {errors.map((error, index) => (
                  <Text key={index} style={styles.errorText}>
                    • {error}
                  </Text>
                ))}
              </View>
            )}

            {mode === 'login' && renderLoginForm()}
            {mode === 'signup' && renderSignupForm()}
            {mode === 'creator-setup' && renderCreatorSetup()}
          </Card.Content>
        </Card>
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
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  card: {
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginVertical: 8,
    backgroundColor: colors.primary,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  textButton: {
    marginTop: 8,
  },
  divider: {
    marginVertical: 16,
  },
  errorContainer: {
    backgroundColor: colors.error + '20',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 8,
    marginTop: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: colors.background,
  },
  selectedChip: {
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  selectedChipText: {
    fontSize: 12,
    color: colors.white,
  },
});