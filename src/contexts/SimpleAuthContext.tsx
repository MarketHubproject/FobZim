import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  isCreator: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const SimpleAuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function SimpleAuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check for stored auth data on app start
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      console.log('Checking auth state...');
      const userData = await AsyncStorage.getItem('simpleUserData');
      
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        console.log('User restored from storage:', parsedUser.username);
      } else {
        console.log('No stored user data found');
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setLoading(false);
      console.log('Auth state check complete');
    }
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      console.log('Attempting sign in for:', email);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock successful login for testing
      const mockUser: User = {
        id: Date.now().toString(),
        username: email.split('@')[0],
        email: email,
        displayName: email.split('@')[0],
        isCreator: false,
      };

      // Store auth data
      await AsyncStorage.setItem('simpleUserData', JSON.stringify(mockUser));
      
      setUser(mockUser);
      console.log('Sign in successful for:', email);
      
    } catch (error) {
      console.error('Sign in error:', error);
      throw new Error('Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string): Promise<void> => {
    try {
      setLoading(true);
      console.log('Attempting sign up for:', email);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock successful registration
      const newUser: User = {
        id: Date.now().toString(),
        username: email.split('@')[0],
        email: email,
        displayName: displayName,
        isCreator: false,
      };

      // Store auth data
      await AsyncStorage.setItem('simpleUserData', JSON.stringify(newUser));
      
      setUser(newUser);
      console.log('Sign up successful for:', email);
      
    } catch (error) {
      console.error('Sign up error:', error);
      throw new Error('Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      console.log('Signing out user...');
      
      // Clear stored auth data
      await AsyncStorage.removeItem('simpleUserData');
      
      setUser(null);
      console.log('User signed out');
      
    } catch (error) {
      console.error('Sign out error:', error);
      throw new Error('Sign out failed');
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  );
}

export function useSimpleAuth(): AuthContextType {
  const context = useContext(SimpleAuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
}