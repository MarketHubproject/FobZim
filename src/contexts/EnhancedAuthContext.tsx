import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { View, Text } from 'react-native';
import { User } from 'firebase/auth';
import { AuthService, UserProfile, AuthContextType } from '../services/authService';

const EnhancedAuthContext = createContext<AuthContextType | undefined>(undefined);

export function useEnhancedAuth() {
  const context = useContext(EnhancedAuthContext);
  if (context === undefined) {
    throw new Error('useEnhancedAuth must be used within an EnhancedAuthProvider');
  }
  return context;
}

interface EnhancedAuthProviderProps {
  children: ReactNode;
}

export function EnhancedAuthProvider({ children }: EnhancedAuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    console.log('EnhancedAuth: Setting up auth state listener...');
    
    const unsubscribe = AuthService.onAuthStateChanged(async (firebaseUser) => {
      try {
        console.log('EnhancedAuth: Auth state changed:', firebaseUser?.email || 'null');
        
        if (firebaseUser) {
          setUser(firebaseUser);
          
          // Get user profile from service
          const profile = await AuthService.getUserProfile(firebaseUser.uid);
          if (profile) {
            setUserProfile(profile);
            console.log('EnhancedAuth: Profile loaded:', profile.displayName);
          } else {
            // If profile doesn't exist, create one (shouldn't happen in normal flow)
            console.warn('EnhancedAuth: User profile not found, creating default profile');
            const defaultProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Anonymous',
              photoURL: firebaseUser.photoURL,
              isCreator: false,
              createdAt: new Date(),
              updatedAt: new Date(),
              followersCount: 0,
              followingCount: 0,
              campaignsCompleted: 0,
              isVerified: false
            };
            setUserProfile(defaultProfile);
          }
        } else {
          console.log('EnhancedAuth: User signed out');
          setUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('EnhancedAuth: Error loading user profile:', error);
        // Set user but not profile in case of error
        setUser(firebaseUser);
        setUserProfile(null);
      } finally {
        setLoading(false);
        setInitializing(false);
      }
    });

    return () => {
      console.log('EnhancedAuth: Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      console.log('EnhancedAuth: Attempting sign in for:', email);
      
      const profile = await AuthService.signIn(email, password);
      setUserProfile(profile);
      
      console.log('EnhancedAuth: Sign in successful');
    } catch (error) {
      console.error('EnhancedAuth: Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string): Promise<void> => {
    try {
      setLoading(true);
      console.log('EnhancedAuth: Attempting sign up for:', email);
      
      const profile = await AuthService.signUp(email, password, displayName);
      setUserProfile(profile);
      
      console.log('EnhancedAuth: Sign up successful');
    } catch (error) {
      console.error('EnhancedAuth: Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      console.log('EnhancedAuth: Signing out user...');
      
      await AuthService.signOut();
      setUser(null);
      setUserProfile(null);
      
      console.log('EnhancedAuth: Sign out successful');
    } catch (error) {
      console.error('EnhancedAuth: Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!user) throw new Error('No authenticated user');
    
    try {
      console.log('EnhancedAuth: Updating profile for:', user.email);
      
      await AuthService.updateUserProfile(user.uid, updates);
      
      // Update local state
      if (userProfile) {
        const updatedProfile = { ...userProfile, ...updates, updatedAt: new Date() };
        setUserProfile(updatedProfile);
        console.log('EnhancedAuth: Profile updated successfully');
      }
    } catch (error) {
      console.error('EnhancedAuth: Update profile error:', error);
      throw error;
    }
  };

  const becomeCreator = async (creatorData: {
    category: string;
    bio: string;
    location: string;
    socialMediaHandles?: UserProfile['socialMediaHandles'];
  }): Promise<void> => {
    if (!user) throw new Error('No authenticated user');
    
    try {
      console.log('EnhancedAuth: Becoming creator for:', user.email);
      
      await AuthService.becomeCreator(user.uid, creatorData);
      
      // Update local state
      if (userProfile) {
        const updatedProfile = {
          ...userProfile,
          isCreator: true,
          ...creatorData,
          updatedAt: new Date()
        };
        setUserProfile(updatedProfile);
        console.log('EnhancedAuth: Became creator successfully');
      }
    } catch (error) {
      console.error('EnhancedAuth: Become creator error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading: loading || initializing,
    signIn,
    signUp,
    signOut,
    updateProfile,
    becomeCreator
  };

  // Show loading screen while initializing
  if (initializing) {
    return (
      <View style={{ 
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5'
      }}>
        <Text style={{ fontSize: 32, marginBottom: 20 }}>🇿🇼</Text>
        <Text style={{ fontSize: 16, color: '#757575' }}>Loading ZimBuzz...</Text>
      </View>
    );
  }

  return (
    <EnhancedAuthContext.Provider value={value}>
      {children}
    </EnhancedAuthContext.Provider>
  );
}