import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Alert, Platform } from 'react-native';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db } from '../config/firebase';

// Types
interface ImageUploadOptions {
  mediaTypes?: ImagePicker.MediaTypeOptions;
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  fileName?: string;
}

interface ImageUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

class ImageUploadService {
  private storage = getStorage();
  
  /**
   * Request camera and media library permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS !== 'web') {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
          Alert.alert(
            'Permissions Required',
            'ZimBuzz needs camera and photo library access to upload images. Please enable these permissions in your device settings.',
            [{ text: 'OK' }]
          );
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  /**
   * Pick image from camera
   */
  async pickImageFromCamera(options: ImageUploadOptions = {}): Promise<ImagePicker.ImagePickerResult | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const defaultOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: options.mediaTypes || ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options.allowsEditing !== undefined ? options.allowsEditing : true,
        aspect: options.aspect || [1, 1],
        quality: options.quality || 0.8,
        maxWidth: options.maxWidth || 1024,
        maxHeight: options.maxHeight || 1024,
      };

      const result = await ImagePicker.launchCameraAsync(defaultOptions);
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result;
      }
      
      return null;
    } catch (error) {
      console.error('Error picking image from camera:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
      return null;
    }
  }

  /**
   * Pick image from photo library
   */
  async pickImageFromLibrary(options: ImageUploadOptions = {}): Promise<ImagePicker.ImagePickerResult | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const defaultOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: options.mediaTypes || ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options.allowsEditing !== undefined ? options.allowsEditing : true,
        aspect: options.aspect || [1, 1],
        quality: options.quality || 0.8,
        maxWidth: options.maxWidth || 1024,
        maxHeight: options.maxHeight || 1024,
      };

      const result = await ImagePicker.launchImageLibraryAsync(defaultOptions);
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result;
      }
      
      return null;
    } catch (error) {
      console.error('Error picking image from library:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
      return null;
    }
  }

  /**
   * Show image picker action sheet
   */
  async showImagePicker(options: ImageUploadOptions = {}): Promise<ImagePicker.ImagePickerResult | null> {
    return new Promise((resolve) => {
      Alert.alert(
        'Select Image',
        'Choose how you want to select an image',
        [
          {
            text: 'Camera',
            onPress: async () => {
              const result = await this.pickImageFromCamera(options);
              resolve(result);
            }
          },
          {
            text: 'Photo Library',
            onPress: async () => {
              const result = await this.pickImageFromLibrary(options);
              resolve(result);
            }
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(null)
          }
        ]
      );
    });
  }

  /**
   * Pick multiple images from library
   */
  async pickMultipleImages(options: ImageUploadOptions = {}): Promise<ImagePicker.ImagePickerResult | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const defaultOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: options.mediaTypes || ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: options.quality || 0.8,
        maxWidth: options.maxWidth || 1024,
        maxHeight: options.maxHeight || 1024,
      };

      const result = await ImagePicker.launchImageLibraryAsync(defaultOptions);
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result;
      }
      
      return null;
    } catch (error) {
      console.error('Error picking multiple images:', error);
      Alert.alert('Error', 'Failed to select images. Please try again.');
      return null;
    }
  }

  /**
   * Compress image before upload
   */
  private async compressImage(uri: string, quality: number = 0.8): Promise<string> {
    try {
      if (Platform.OS === 'web') {
        return uri; // Web doesn't need compression in the same way
      }

      const manipResult = await ImagePicker.ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1024 } }], // Resize to max width of 1024
        {
          compress: quality,
          format: ImagePicker.ImageManipulator.SaveFormat.JPEG,
        }
      );

      return manipResult.uri;
    } catch (error) {
      console.error('Error compressing image:', error);
      return uri; // Return original if compression fails
    }
  }

  /**
   * Generate unique filename
   */
  private generateFileName(prefix: string, extension: string = 'jpg'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${prefix}_${timestamp}_${random}.${extension}`;
  }

  /**
   * Upload image to Firebase Storage
   */
  async uploadImageToFirebase(
    uri: string,
    folder: string = 'images',
    fileName?: string,
    onProgress?: (progress: ImageUploadProgress) => void
  ): Promise<UploadResult> {
    try {
      // Compress image before upload
      const compressedUri = await this.compressImage(uri);
      
      // Generate filename if not provided
      const finalFileName = fileName || this.generateFileName(folder);
      const storageRef = ref(this.storage, `${folder}/${finalFileName}`);

      // Convert URI to blob for upload
      const response = await fetch(compressedUri);
      const blob = await response.blob();

      // Upload with progress tracking
      const uploadTask = uploadBytes(storageRef, blob);
      
      // Wait for upload completion
      await uploadTask;
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      return {
        success: true,
        url: downloadURL,
        fileName: finalFileName
      };
    } catch (error) {
      console.error('Error uploading image to Firebase:', error);
      return {
        success: false,
        error: 'Failed to upload image. Please check your internet connection and try again.'
      };
    }
  }

  /**
   * Upload image with mock storage (for demo purposes)
   */
  async uploadImageMock(uri: string, folder: string = 'images'): Promise<UploadResult> {
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock URL
      const fileName = this.generateFileName(folder);
      const mockUrl = `https://storage.mock.com/${folder}/${fileName}`;
      
      return {
        success: true,
        url: mockUrl,
        fileName
      };
    } catch (error) {
      return {
        success: false,
        error: 'Mock upload failed'
      };
    }
  }

  /**
   * Delete image from Firebase Storage
   */
  async deleteImage(imageUrl: string): Promise<boolean> {
    try {
      const storageRef = ref(this.storage, imageUrl);
      await deleteObject(storageRef);
      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }

  /**
   * Upload avatar image
   */
  async uploadAvatar(userId: string, options: ImageUploadOptions = {}): Promise<UploadResult> {
    try {
      const imageResult = await this.showImagePicker({
        ...options,
        aspect: [1, 1],
        allowsEditing: true
      });

      if (!imageResult || imageResult.canceled || !imageResult.assets[0]) {
        return { success: false, error: 'No image selected' };
      }

      const uri = imageResult.assets[0].uri;
      const fileName = `avatar_${userId}`;
      
      return await this.uploadImageToFirebase(uri, 'avatars', fileName);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return { success: false, error: 'Failed to upload avatar' };
    }
  }

  /**
   * Upload portfolio images
   */
  async uploadPortfolioImages(creatorId: string): Promise<UploadResult[]> {
    try {
      const imageResult = await this.pickMultipleImages({
        quality: 0.9,
        maxWidth: 1200,
        maxHeight: 1200
      });

      if (!imageResult || imageResult.canceled || !imageResult.assets) {
        return [{ success: false, error: 'No images selected' }];
      }

      const uploadPromises = imageResult.assets.map(async (asset, index) => {
        const fileName = `portfolio_${creatorId}_${index + 1}`;
        return await this.uploadImageToFirebase(asset.uri, 'portfolio', fileName);
      });

      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error('Error uploading portfolio images:', error);
      return [{ success: false, error: 'Failed to upload portfolio images' }];
    }
  }

  /**
   * Upload campaign deliverable
   */
  async uploadCampaignDeliverable(campaignId: string, creatorId: string): Promise<UploadResult> {
    try {
      const imageResult = await this.showImagePicker({
        quality: 0.9,
        maxWidth: 1200,
        maxHeight: 1200
      });

      if (!imageResult || imageResult.canceled || !imageResult.assets[0]) {
        return { success: false, error: 'No image selected' };
      }

      const uri = imageResult.assets[0].uri;
      const fileName = `deliverable_${campaignId}_${creatorId}`;
      
      return await this.uploadImageToFirebase(uri, 'deliverables', fileName);
    } catch (error) {
      console.error('Error uploading campaign deliverable:', error);
      return { success: false, error: 'Failed to upload deliverable' };
    }
  }

  /**
   * Upload verification document
   */
  async uploadVerificationDocument(userId: string, documentType: string = 'id'): Promise<UploadResult> {
    try {
      const imageResult = await this.showImagePicker({
        quality: 1.0, // Higher quality for documents
        allowsEditing: false
      });

      if (!imageResult || imageResult.canceled || !imageResult.assets[0]) {
        return { success: false, error: 'No document selected' };
      }

      const uri = imageResult.assets[0].uri;
      const fileName = `verification_${documentType}_${userId}`;
      
      return await this.uploadImageToFirebase(uri, 'verification', fileName);
    } catch (error) {
      console.error('Error uploading verification document:', error);
      return { success: false, error: 'Failed to upload document' };
    }
  }

  /**
   * Get image info from URI
   */
  async getImageInfo(uri: string): Promise<any> {
    try {
      if (Platform.OS === 'web') {
        return { uri, width: 0, height: 0 };
      }
      
      return await FileSystem.getInfoAsync(uri);
    } catch (error) {
      console.error('Error getting image info:', error);
      return null;
    }
  }

  /**
   * Validate image file
   */
  validateImage(asset: ImagePicker.ImagePickerAsset, maxSizeMB: number = 5): { valid: boolean; error?: string } {
    // Check file size
    if (asset.fileSize && asset.fileSize > maxSizeMB * 1024 * 1024) {
      return {
        valid: false,
        error: `Image size must be less than ${maxSizeMB}MB`
      };
    }

    // Check image type
    if (asset.type && !asset.type.startsWith('image/')) {
      return {
        valid: false,
        error: 'Please select a valid image file'
      };
    }

    return { valid: true };
  }
}

// Create singleton instance
export const imageUploadService = new ImageUploadService();

// Export types
export type { ImageUploadOptions, UploadResult, ImageUploadProgress };

// Export helper functions
export const showImagePickerAlert = (
  onCamera: () => void,
  onLibrary: () => void,
  onCancel?: () => void
) => {
  Alert.alert(
    'Select Image',
    'Choose how you want to select an image',
    [
      {
        text: 'Camera',
        onPress: onCamera
      },
      {
        text: 'Photo Library',
        onPress: onLibrary
      },
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: onCancel
      }
    ]
  );
};

export default imageUploadService;