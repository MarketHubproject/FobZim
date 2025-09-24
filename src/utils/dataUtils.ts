import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'userPreferences',
  CACHED_DATA: 'cachedData',
  APP_VERSION: 'appVersion'
} as const;

// Data validation utilities
export const validateCreatorData = (creator: any): boolean => {
  return creator && 
         typeof creator.id === 'string' &&
         typeof creator.name === 'string' &&
         typeof creator.username === 'string' &&
         typeof creator.followers === 'number' &&
         typeof creator.isVerified === 'boolean';
};

export const validateCampaignData = (campaign: any): boolean => {
  return campaign && 
         typeof campaign.id === 'string' &&
         typeof campaign.title === 'string' &&
         typeof campaign.brand === 'string' &&
         typeof campaign.budget === 'string' &&
         Array.isArray(campaign.requirements);
};

export const validateTipData = (tip: any): boolean => {
  return tip && 
         typeof tip.id === 'string' &&
         typeof tip.title === 'string' &&
         typeof tip.content === 'string' &&
         typeof tip.author === 'string' &&
         typeof tip.likes === 'number';
};

// Data caching utilities
export const cacheData = async (key: string, data: any, ttl: number = 24 * 60 * 60 * 1000): Promise<void> => {
  try {
    const cacheItem = {
      data,
      timestamp: Date.now(),
      ttl
    };
    await AsyncStorage.setItem(key, JSON.stringify(cacheItem));
  } catch (error) {
    console.error(`Failed to cache data for key ${key}:`, error);
  }
};

export const getCachedData = async <T>(key: string): Promise<T | null> => {
  try {
    const cachedItem = await AsyncStorage.getItem(key);
    if (!cachedItem) return null;

    const { data, timestamp, ttl } = JSON.parse(cachedItem);
    const now = Date.now();

    if (now - timestamp > ttl) {
      // Cache expired, remove it
      await AsyncStorage.removeItem(key);
      return null;
    }

    return data as T;
  } catch (error) {
    console.error(`Failed to retrieve cached data for key ${key}:`, error);
    return null;
  }
};

// User preferences utilities
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notificationsEnabled: boolean;
  preferredCategories: string[];
  language: string;
  autoRefresh: boolean;
}

export const getDefaultPreferences = (): UserPreferences => ({
  theme: 'light',
  notificationsEnabled: true,
  preferredCategories: [],
  language: 'en',
  autoRefresh: true
});

export const saveUserPreferences = async (preferences: Partial<UserPreferences>): Promise<void> => {
  try {
    const currentPreferences = await getUserPreferences();
    const updatedPreferences = { ...currentPreferences, ...preferences };
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updatedPreferences));
  } catch (error) {
    console.error('Failed to save user preferences:', error);
  }
};

export const getUserPreferences = async (): Promise<UserPreferences> => {
  try {
    const preferencesString = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    if (preferencesString) {
      const preferences = JSON.parse(preferencesString);
      return { ...getDefaultPreferences(), ...preferences };
    }
    return getDefaultPreferences();
  } catch (error) {
    console.error('Failed to retrieve user preferences:', error);
    return getDefaultPreferences();
  }
};

// App version and migration utilities
export const checkAppVersion = async (): Promise<{ isFirstLaunch: boolean; needsMigration: boolean }> => {
  try {
    const currentVersion = '1.0.0'; // Should come from package.json or constants
    const storedVersion = await AsyncStorage.getItem(STORAGE_KEYS.APP_VERSION);
    
    if (!storedVersion) {
      // First launch
      await AsyncStorage.setItem(STORAGE_KEYS.APP_VERSION, currentVersion);
      return { isFirstLaunch: true, needsMigration: false };
    }
    
    if (storedVersion !== currentVersion) {
      // Version changed, might need migration
      await AsyncStorage.setItem(STORAGE_KEYS.APP_VERSION, currentVersion);
      return { isFirstLaunch: false, needsMigration: true };
    }
    
    return { isFirstLaunch: false, needsMigration: false };
  } catch (error) {
    console.error('Failed to check app version:', error);
    return { isFirstLaunch: false, needsMigration: false };
  }
};

// Clean up old data
export const cleanupOldData = async (): Promise<void> => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const keysToCheck = allKeys.filter(key => key.startsWith('cached_'));
    
    for (const key of keysToCheck) {
      const cachedData = await getCachedData(key);
      if (!cachedData) {
        // Data was expired and removed by getCachedData
        continue;
      }
    }
  } catch (error) {
    console.error('Failed to cleanup old data:', error);
  }
};

// Performance monitoring utilities
export const measurePerformance = async <T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> => {
  const startTime = performance.now();
  
  try {
    const result = await operation();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`[Performance] ${operationName} took ${duration.toFixed(2)}ms`);
    
    // Log slow operations
    if (duration > 1000) {
      console.warn(`[Performance] Slow operation detected: ${operationName} took ${duration.toFixed(2)}ms`);
    }
    
    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.error(`[Performance] ${operationName} failed after ${duration.toFixed(2)}ms:`, error);
    throw error;
  }
};

// Debounce utility for search and user input
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>): void => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Memory optimization utilities
export const optimizeImageUri = (uri: string, width: number = 300): string => {
  if (uri.includes('unsplash.com')) {
    return `${uri}&w=${width}&q=75&fm=webp`;
  }
  return uri;
};

export const memoizeFunction = <T extends (...args: any[]) => any>(
  func: T,
  getKey?: (...args: Parameters<T>) => string
): T => {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = func(...args);
    cache.set(key, result);
    
    // Limit cache size to prevent memory leaks
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  }) as T;
};