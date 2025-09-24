import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface ImagePickerOptions {
  allowsEditing?: boolean;
  quality?: number;
  allowsMultipleSelection?: boolean;
  mediaTypes?: ImagePicker.MediaTypeOptions;
  aspect?: [number, number];
  maxWidth?: number;
  maxHeight?: number;
}

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: ImageManipulator.SaveFormat;
  compress?: number;
}

export interface ImageUploadOptions {
  folder: string;
  userId: string;
  filename?: string;
  optimize?: boolean;
  onProgress?: (progress: number) => void;
}

export interface CachedImage {
  uri: string;
  localUri: string;
  cachedAt: number;
  size: number;
}

class ImageService {
  private readonly CACHE_DIR = `${FileSystem.cacheDirectory}images/`;
  private readonly CACHE_KEY = 'image_cache_map';
  private readonly MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB
  private readonly MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
  private cacheMap: Map<string, CachedImage> = new Map();

  constructor() {
    this.initializeCache();
  }

  private async initializeCache(): Promise<void> {
    try {
      // Ensure cache directory exists
      const dirInfo = await FileSystem.getInfoAsync(this.CACHE_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.CACHE_DIR, { intermediates: true });
      }

      // Load cache map from storage
      const cacheData = await AsyncStorage.getItem(this.CACHE_KEY);
      if (cacheData) {
        const cacheArray = JSON.parse(cacheData);
        this.cacheMap = new Map(cacheArray);
      }

      // Clean up expired cache items
      await this.cleanupExpiredCache();

      console.log('🖼️ Image cache initialized');
    } catch (error) {
      console.error('❌ Error initializing image cache:', error);
    }
  }

  // Request permissions for image picker
  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS !== 'web') {
        const cameraRollStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        
        if (cameraRollStatus.status !== 'granted' && cameraStatus.status !== 'granted') {
          console.warn('📷 Image picker permissions denied');
          return false;
        }
      }
      
      console.log('✅ Image picker permissions granted');
      return true;
    } catch (error) {
      console.error('❌ Error requesting image permissions:', error);
      return false;
    }
  }

  // Pick image from gallery
  async pickImage(options: ImagePickerOptions = {}): Promise<ImagePicker.ImagePickerResult | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Image picker permissions required');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: options.mediaTypes || ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options.allowsEditing ?? true,
        quality: options.quality ?? 0.8,
        allowsMultipleSelection: options.allowsMultipleSelection ?? false,
        aspect: options.aspect,
      });

      if (!result.canceled) {
        console.log('📸 Image picked successfully');
        return result;
      }

      return null;
    } catch (error) {
      console.error('❌ Error picking image:', error);
      throw error;
    }
  }

  // Take photo with camera
  async takePhoto(options: ImagePickerOptions = {}): Promise<ImagePicker.ImagePickerResult | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Camera permissions required');
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: options.mediaTypes || ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options.allowsEditing ?? true,
        quality: options.quality ?? 0.8,
        aspect: options.aspect,
      });

      if (!result.canceled) {
        console.log('📷 Photo taken successfully');
        return result;
      }

      return null;
    } catch (error) {
      console.error('❌ Error taking photo:', error);
      throw error;
    }
  }

  // Optimize image
  async optimizeImage(
    imageUri: string, 
    options: ImageOptimizationOptions = {}
  ): Promise<string> {
    try {
      const defaultOptions = {
        maxWidth: options.maxWidth || 1200,
        maxHeight: options.maxHeight || 1200,
        quality: options.quality || 0.8,
        format: options.format || ImageManipulator.SaveFormat.JPEG,
        compress: options.compress || 0.8,
      };

      // Get image info to determine if optimization is needed
      const imageInfo = await FileSystem.getInfoAsync(imageUri);
      console.log(`🖼️ Original image size: ${(imageInfo.size || 0) / 1024}KB`);

      const actions: ImageManipulator.Action[] = [];

      // Add resize action if needed
      if (defaultOptions.maxWidth || defaultOptions.maxHeight) {
        actions.push({
          resize: {
            width: defaultOptions.maxWidth,
            height: defaultOptions.maxHeight,
          }
        });
      }

      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        actions,
        {
          compress: defaultOptions.compress,
          format: defaultOptions.format,
        }
      );

      const optimizedInfo = await FileSystem.getInfoAsync(result.uri);
      console.log(`✨ Optimized image size: ${(optimizedInfo.size || 0) / 1024}KB`);

      return result.uri;
    } catch (error) {
      console.error('❌ Error optimizing image:', error);
      throw error;
    }
  }

  // Upload image to Firebase Storage
  async uploadImage(
    imageUri: string, 
    options: ImageUploadOptions
  ): Promise<string> {
    try {
      const { folder, userId, filename, optimize = true } = options;
      
      // Optimize image before upload if requested
      let finalUri = imageUri;
      if (optimize) {
        finalUri = await this.optimizeImage(imageUri);
      }

      // Generate filename if not provided
      const finalFilename = filename || `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      const storagePath = `${folder}/${userId}/${finalFilename}`;

      // Convert image to blob
      const response = await fetch(finalUri);
      const blob = await response.blob();

      // Create storage reference
      const storageRef = ref(storage, storagePath);

      // Upload with progress tracking
      console.log('📤 Uploading image to Firebase Storage...');
      
      // Note: Firebase Web SDK doesn't support progress tracking for uploads
      // For React Native, you might want to use different Firebase SDK
      await uploadBytes(storageRef, blob);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      console.log('✅ Image uploaded successfully:', downloadURL);
      return downloadURL;

    } catch (error) {
      console.error('❌ Error uploading image:', error);
      throw error;
    }
  }

  // Delete image from Firebase Storage
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extract storage path from URL
      const storageRef = ref(storage, imageUrl);
      await deleteObject(storageRef);
      
      console.log('🗑️ Image deleted from storage');
    } catch (error) {
      console.error('❌ Error deleting image:', error);
      throw error;
    }
  }

  // Cache image locally
  async cacheImage(imageUrl: string): Promise<string> {
    try {
      // Check if image is already cached
      if (this.cacheMap.has(imageUrl)) {
        const cached = this.cacheMap.get(imageUrl)!;
        
        // Check if cached file still exists
        const fileInfo = await FileSystem.getInfoAsync(cached.localUri);
        if (fileInfo.exists) {
          console.log('📋 Using cached image:', imageUrl);
          return cached.localUri;
        } else {
          // Remove from cache map if file doesn't exist
          this.cacheMap.delete(imageUrl);
        }
      }

      // Download and cache image
      const filename = this.generateCacheFilename(imageUrl);
      const localUri = `${this.CACHE_DIR}${filename}`;

      console.log('⬇️ Downloading image for cache:', imageUrl);
      
      const downloadResult = await FileSystem.downloadAsync(imageUrl, localUri);
      
      if (downloadResult.status === 200) {
        const fileInfo = await FileSystem.getInfoAsync(localUri);
        
        // Add to cache map
        const cachedImage: CachedImage = {
          uri: imageUrl,
          localUri,
          cachedAt: Date.now(),
          size: fileInfo.size || 0,
        };
        
        this.cacheMap.set(imageUrl, cachedImage);
        await this.saveCacheMap();
        
        console.log('💾 Image cached successfully');
        return localUri;
      } else {
        throw new Error(`Failed to download image: ${downloadResult.status}`);
      }

    } catch (error) {
      console.error('❌ Error caching image:', error);
      // Return original URL if caching fails
      return imageUrl;
    }
  }

  // Get cached image or original URL
  async getCachedImageUri(imageUrl: string): Promise<string> {
    try {
      if (this.cacheMap.has(imageUrl)) {
        const cached = this.cacheMap.get(imageUrl)!;
        const fileInfo = await FileSystem.getInfoAsync(cached.localUri);
        
        if (fileInfo.exists) {
          return cached.localUri;
        } else {
          this.cacheMap.delete(imageUrl);
        }
      }
      
      return imageUrl;
    } catch (error) {
      console.error('❌ Error getting cached image:', error);
      return imageUrl;
    }
  }

  // Clean up expired cache items
  private async cleanupExpiredCache(): Promise<void> {
    try {
      const now = Date.now();
      const expiredKeys: string[] = [];
      let totalSize = 0;

      // Find expired items and calculate total cache size
      for (const [url, cached] of this.cacheMap.entries()) {
        if (now - cached.cachedAt > this.MAX_CACHE_AGE) {
          expiredKeys.push(url);
        } else {
          totalSize += cached.size;
        }
      }

      // Remove expired items
      for (const key of expiredKeys) {
        await this.removeCachedImage(key);
      }

      // Remove oldest items if cache size exceeds limit
      if (totalSize > this.MAX_CACHE_SIZE) {
        const sortedEntries = Array.from(this.cacheMap.entries())
          .sort((a, b) => a[1].cachedAt - b[1].cachedAt);

        for (const [url] of sortedEntries) {
          if (totalSize <= this.MAX_CACHE_SIZE) break;
          
          const cached = this.cacheMap.get(url)!;
          totalSize -= cached.size;
          await this.removeCachedImage(url);
        }
      }

      console.log(`🧹 Cache cleanup completed. ${expiredKeys.length} expired items removed`);
    } catch (error) {
      console.error('❌ Error cleaning up cache:', error);
    }
  }

  // Remove cached image
  private async removeCachedImage(imageUrl: string): Promise<void> {
    try {
      const cached = this.cacheMap.get(imageUrl);
      if (cached) {
        const fileInfo = await FileSystem.getInfoAsync(cached.localUri);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(cached.localUri);
        }
        this.cacheMap.delete(imageUrl);
      }
    } catch (error) {
      console.error('❌ Error removing cached image:', error);
    }
  }

  // Generate cache filename from URL
  private generateCacheFilename(url: string): string {
    // Create a hash-like filename from URL
    const hash = url.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const extension = url.split('.').pop()?.split('?')[0] || 'jpg';
    return `${Math.abs(hash)}.${extension}`;
  }

  // Save cache map to storage
  private async saveCacheMap(): Promise<void> {
    try {
      const cacheArray = Array.from(this.cacheMap.entries());
      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheArray));
    } catch (error) {
      console.error('❌ Error saving cache map:', error);
    }
  }

  // Get cache statistics
  async getCacheStats(): Promise<{
    totalItems: number;
    totalSize: number;
    oldestItem: number;
    newestItem: number;
  }> {
    let totalSize = 0;
    let oldestItem = Date.now();
    let newestItem = 0;

    for (const cached of this.cacheMap.values()) {
      totalSize += cached.size;
      oldestItem = Math.min(oldestItem, cached.cachedAt);
      newestItem = Math.max(newestItem, cached.cachedAt);
    }

    return {
      totalItems: this.cacheMap.size,
      totalSize,
      oldestItem,
      newestItem,
    };
  }

  // Clear all cache
  async clearCache(): Promise<void> {
    try {
      // Delete all cached files
      const dirInfo = await FileSystem.getInfoAsync(this.CACHE_DIR);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(this.CACHE_DIR);
        await FileSystem.makeDirectoryAsync(this.CACHE_DIR, { intermediates: true });
      }

      // Clear cache map
      this.cacheMap.clear();
      await AsyncStorage.removeItem(this.CACHE_KEY);

      console.log('🗑️ All image cache cleared');
    } catch (error) {
      console.error('❌ Error clearing cache:', error);
    }
  }

  // Preload images (cache multiple images in background)
  async preloadImages(imageUrls: string[]): Promise<void> {
    try {
      console.log(`⏳ Preloading ${imageUrls.length} images...`);
      
      const promises = imageUrls.map(url => 
        this.cacheImage(url).catch(error => 
          console.warn(`Failed to preload image ${url}:`, error)
        )
      );

      await Promise.allSettled(promises);
      console.log('✅ Image preloading completed');
    } catch (error) {
      console.error('❌ Error preloading images:', error);
    }
  }

  // Create image thumbnail
  async createThumbnail(
    imageUri: string,
    size: { width: number; height: number } = { width: 200, height: 200 }
  ): Promise<string> {
    try {
      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          {
            resize: {
              width: size.width,
              height: size.height,
            }
          }
        ],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      console.log('🖼️ Thumbnail created');
      return result.uri;
    } catch (error) {
      console.error('❌ Error creating thumbnail:', error);
      throw error;
    }
  }
}

// Export singleton instance
const imageService = new ImageService();
export default imageService;