import { useEffect } from 'react';
import { useAppStore } from '../store/simpleStore';
import { analyticsManager } from '../utils/analytics';

export const useAppInitialization = () => {
  const { loadFromStorage, enableAutoSave, isHydrated } = useAppStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize analytics first
        await analyticsManager.initialize();
        
        // Load saved data
        await loadFromStorage();
        
        // Enable auto-save after successful hydration
        // Wait a bit to ensure the app is fully loaded
        setTimeout(() => {
          enableAutoSave();
        }, 2000); // 2 second delay
        
        console.log('App initialization completed');
      } catch (error) {
        console.warn('App initialization failed:', error);
      }
    };

    // Only run initialization once
    if (!isHydrated) {
      initializeApp();
    }
  }, [loadFromStorage, enableAutoSave, isHydrated]);

  return { isHydrated };
};