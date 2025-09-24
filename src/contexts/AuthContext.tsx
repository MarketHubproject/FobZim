import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { View, Text } from 'react-native';
import { User } from 'firebase/auth';
import { AuthService, UserProfile, AuthContextType } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          
          // Get user profile from Firestore
          const profile = await AuthService.getUserProfile(firebaseUser.uid);
          if (profile) {
            setUserProfile(profile);
          } else {
            // If profile doesn't exist, create one (shouldn't happen in normal flow)
            console.warn('User profile not found, creating default profile');
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
          setUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setLoading(false);
        setInitializing(false);
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const profile = await AuthService.signIn(email, password);
      setUserProfile(profile);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string): Promise<void> => {
    try {
      setLoading(true);
      const profile = await AuthService.signUp(email, password, displayName);
      setUserProfile(profile);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      await AuthService.signOut();
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!user) throw new Error('No authenticated user');
    
    try {
      await AuthService.updateUserProfile(user.uid, updates);
      
      // Update local state
      if (userProfile) {
        setUserProfile({ ...userProfile, ...updates });
      }
    } catch (error) {
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
      await AuthService.becomeCreator(user.uid, creatorData);
      
      // Update local state
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          isCreator: true,
          ...creatorData
        });
      }
    } catch (error) {
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
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}