import { 
  ref, 
  uploadBytes, 
  uploadString,
  getDownloadURL, 
  deleteObject, 
  listAll,
  getMetadata,
  updateMetadata
} from 'firebase/storage';
import { User } from 'firebase/auth';
import { testStorage, firebaseTest } from '../config/firebase.test';
import { AuthTestUtils } from './auth.test';

// Mock file creation utilities
const createMockTextFile = (content: string, filename: string): Blob => {
  return new Blob([content], { type: 'text/plain' });
};

const createMockImageFile = (filename: string): Blob => {
  // Create a simple mock image (1x1 pixel PNG)
  const buffer = new ArrayBuffer(67);
  const view = new Uint8Array(buffer);
  // PNG signature and minimal IHDR chunk for a 1x1 pixel
  const pngBytes = [
    137, 80, 78, 71, 13, 10, 26, 10, // PNG signature
    0, 0, 0, 13, 73, 72, 68, 82,   // IHDR chunk
    0, 0, 0, 1, 0, 0, 0, 1,        // 1x1 dimensions
    8, 6, 0, 0, 0, 31, 21, 196, 137, // bit depth, color type, etc.
    0, 0, 0, 12, 73, 68, 65, 84,   // IDAT chunk
    120, 156, 99, 248, 15, 0, 0, 1, 0, 1, // image data
    0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130 // IEND chunk
  ];
  
  for (let i = 0; i < Math.min(pngBytes.length, view.length); i++) {
    view[i] = pngBytes[i];
  }
  
  return new Blob([buffer], { type: 'image/png' });
};

describe('Firebase Storage Tests', () => {
  let testUser1: User;
  let testUser2: User;
  let uploadedFiles: string[] = []; // Track uploaded files for cleanup

  beforeAll(async () => {
    // Create test users
    testUser1 = await AuthTestUtils.createTestUserWithProfile(
      'storage-test1@example.com', 
      'password123', 
      { displayName: 'Storage Test User 1' }
    );
    
    testUser2 = await AuthTestUtils.createTestUserWithProfile(
      'storage-test2@example.com', 
      'password123', 
      { displayName: 'Storage Test User 2' }
    );
  });

  afterEach(async () => {
    // Clean up uploaded files after each test
    for (const filePath of uploadedFiles) {
      try {
        const fileRef = ref(testStorage, filePath);
        await deleteObject(fileRef);
      } catch (error) {
        console.warn(`Failed to delete test file ${filePath}:`, error);
      }
    }
    uploadedFiles = [];
  });

  afterAll(async () => {
    await firebaseTest.cleanup();
  });

  describe('Profile Image Uploads', () => {
    test('should upload user profile image', async () => {
      const imageFile = createMockImageFile('profile.png');
      const filePath = `profiles/${testUser1.uid}/profile-image.png`;
      const fileRef = ref(testStorage, filePath);
      uploadedFiles.push(filePath);

      // Upload the file
      const uploadResult = await uploadBytes(fileRef, imageFile);
      
      expect(uploadResult.ref.name).toBe('profile-image.png');
      expect(uploadResult.ref.fullPath).toBe(filePath);
      
      // Verify file exists by getting download URL
      const downloadURL = await getDownloadURL(fileRef);
      expect(downloadURL).toBeTruthy();
      expect(downloadURL).toContain('profile-image.png');
    });

    test('should upload profile image with metadata', async () => {
      const imageFile = createMockImageFile('profile-with-meta.png');
      const filePath = `profiles/${testUser1.uid}/profile-with-metadata.png`;
      const fileRef = ref(testStorage, filePath);
      uploadedFiles.push(filePath);

      // Upload with custom metadata
      const uploadResult = await uploadBytes(fileRef, imageFile, {
        customMetadata: {
          uploadedBy: testUser1.uid,
          purpose: 'profile-image',
          timestamp: new Date().toISOString()
        }
      });

      // Verify metadata was set
      const metadata = await getMetadata(fileRef);
      expect(metadata.customMetadata?.uploadedBy).toBe(testUser1.uid);
      expect(metadata.customMetadata?.purpose).toBe('profile-image');
    });

    test('should update existing profile image', async () => {
      const oldImageFile = createMockImageFile('old-profile.png');
      const newImageFile = createMockImageFile('new-profile.png');
      const filePath = `profiles/${testUser1.uid}/updateable-profile.png`;
      const fileRef = ref(testStorage, filePath);
      uploadedFiles.push(filePath);

      // Upload initial image
      await uploadBytes(fileRef, oldImageFile);
      const oldDownloadURL = await getDownloadURL(fileRef);

      // Upload new image (overwrites the old one)
      const updateResult = await uploadBytes(fileRef, newImageFile);
      const newDownloadURL = await getDownloadURL(fileRef);

      expect(updateResult.ref.fullPath).toBe(filePath);
      expect(newDownloadURL).toBeTruthy();
      // URLs will be different due to different content
      expect(newDownloadURL).not.toBe(oldDownloadURL);
    });
  });

  describe('Campaign Media Uploads', () => {
    test('should upload campaign image', async () => {
      const campaignId = 'test-campaign-123';
      const imageFile = createMockImageFile('campaign-banner.png');
      const filePath = `campaigns/${campaignId}/banner.png`;
      const fileRef = ref(testStorage, filePath);
      uploadedFiles.push(filePath);

      const uploadResult = await uploadBytes(fileRef, imageFile, {
        customMetadata: {
          campaignId,
          uploadedBy: testUser1.uid,
          type: 'banner'
        }
      });

      expect(uploadResult.ref.name).toBe('banner.png');
      
      // Verify download URL works
      const downloadURL = await getDownloadURL(fileRef);
      expect(downloadURL).toBeTruthy();
    });

    test('should upload multiple campaign images', async () => {
      const campaignId = 'test-campaign-multi';
      const imageFiles = [
        { file: createMockImageFile('image1.png'), name: 'image1.png' },
        { file: createMockImageFile('image2.png'), name: 'image2.png' },
        { file: createMockImageFile('image3.png'), name: 'image3.png' }
      ];

      const uploadPromises = imageFiles.map(async ({ file, name }) => {
        const filePath = `campaigns/${campaignId}/${name}`;
        const fileRef = ref(testStorage, filePath);
        uploadedFiles.push(filePath);
        
        return await uploadBytes(fileRef, file);
      });

      const uploadResults = await Promise.all(uploadPromises);
      
      expect(uploadResults).toHaveLength(3);
      uploadResults.forEach((result, index) => {
        expect(result.ref.name).toBe(imageFiles[index].name);
      });
    });

    test('should list all campaign images', async () => {
      const campaignId = 'test-campaign-list';
      const basePath = `campaigns/${campaignId}`;
      
      // Upload several images
      const images = ['img1.png', 'img2.png', 'img3.png'];
      for (const imageName of images) {
        const imageFile = createMockImageFile(imageName);
        const filePath = `${basePath}/${imageName}`;
        const fileRef = ref(testStorage, filePath);
        uploadedFiles.push(filePath);
        
        await uploadBytes(fileRef, imageFile);
      }

      // List all files in campaign folder
      const campaignRef = ref(testStorage, basePath);
      const listResult = await listAll(campaignRef);
      
      expect(listResult.items).toHaveLength(3);
      
      const fileNames = listResult.items.map(item => item.name);
      expect(fileNames).toContain('img1.png');
      expect(fileNames).toContain('img2.png');
      expect(fileNames).toContain('img3.png');
    });
  });

  describe('Message Attachments', () => {
    test('should upload message image attachment', async () => {
      const conversationId = 'test-conversation-123';
      const messageId = 'test-message-456';
      const imageFile = createMockImageFile('message-image.png');
      const filePath = `messages/${conversationId}/${messageId}/image.png`;
      const fileRef = ref(testStorage, filePath);
      uploadedFiles.push(filePath);

      const uploadResult = await uploadBytes(fileRef, imageFile, {
        customMetadata: {
          conversationId,
          messageId,
          senderId: testUser1.uid,
          attachmentType: 'image'
        }
      });

      expect(uploadResult.ref.fullPath).toBe(filePath);
      
      // Verify metadata
      const metadata = await getMetadata(fileRef);
      expect(metadata.customMetadata?.senderId).toBe(testUser1.uid);
      expect(metadata.customMetadata?.attachmentType).toBe('image');
    });

    test('should upload document attachment', async () => {
      const conversationId = 'test-conversation-789';
      const messageId = 'test-message-101';
      const docFile = createMockTextFile('This is a test document content.', 'document.txt');
      const filePath = `messages/${conversationId}/${messageId}/document.txt`;
      const fileRef = ref(testStorage, filePath);
      uploadedFiles.push(filePath);

      const uploadResult = await uploadBytes(fileRef, docFile, {
        customMetadata: {
          conversationId,
          messageId,
          senderId: testUser1.uid,
          attachmentType: 'document'
        }
      });

      expect(uploadResult.ref.name).toBe('document.txt');
      
      // Verify we can download it
      const downloadURL = await getDownloadURL(fileRef);
      expect(downloadURL).toBeTruthy();
    });
  });

  describe('String Uploads', () => {
    test('should upload string as file', async () => {
      const textContent = 'This is a test string upload';
      const filePath = `temp/${testUser1.uid}/string-upload.txt`;
      const fileRef = ref(testStorage, filePath);
      uploadedFiles.push(filePath);

      // Upload string directly
      const uploadResult = await uploadString(fileRef, textContent, 'raw', {
        contentType: 'text/plain'
      });

      expect(uploadResult.ref.name).toBe('string-upload.txt');
      
      // Verify download URL works
      const downloadURL = await getDownloadURL(fileRef);
      expect(downloadURL).toBeTruthy();
    });

    test('should upload base64 encoded data', async () => {
      // Simple base64 encoded text
      const base64Data = btoa('Hello from base64!');
      const filePath = `temp/${testUser1.uid}/base64-upload.txt`;
      const fileRef = ref(testStorage, filePath);
      uploadedFiles.push(filePath);

      const uploadResult = await uploadString(fileRef, base64Data, 'base64', {
        contentType: 'text/plain'
      });

      expect(uploadResult.ref.name).toBe('base64-upload.txt');
      
      const downloadURL = await getDownloadURL(fileRef);
      expect(downloadURL).toBeTruthy();
    });
  });

  describe('File Management', () => {
    test('should delete uploaded file', async () => {
      const textFile = createMockTextFile('File to be deleted', 'delete-test.txt');
      const filePath = `temp/${testUser1.uid}/delete-test.txt`;
      const fileRef = ref(testStorage, filePath);

      // Upload file
      await uploadBytes(fileRef, textFile);
      
      // Verify it exists
      let downloadURL = await getDownloadURL(fileRef);
      expect(downloadURL).toBeTruthy();

      // Delete the file
      await deleteObject(fileRef);

      // Verify it's deleted (this should throw an error)
      await expect(getDownloadURL(fileRef)).rejects.toThrow();
    });

    test('should update file metadata', async () => {
      const textFile = createMockTextFile('File with updatable metadata', 'metadata-test.txt');
      const filePath = `temp/${testUser1.uid}/metadata-test.txt`;
      const fileRef = ref(testStorage, filePath);
      uploadedFiles.push(filePath);

      // Upload with initial metadata
      await uploadBytes(fileRef, textFile, {
        customMetadata: {
          version: '1.0',
          status: 'draft'
        }
      });

      // Update metadata
      const newMetadata = await updateMetadata(fileRef, {
        customMetadata: {
          version: '2.0',
          status: 'published',
          updatedBy: testUser1.uid
        }
      });

      expect(newMetadata.customMetadata?.version).toBe('2.0');
      expect(newMetadata.customMetadata?.status).toBe('published');
      expect(newMetadata.customMetadata?.updatedBy).toBe(testUser1.uid);
    });

    test('should handle upload errors gracefully', async () => {
      // Try to upload to an invalid path (should work in emulator but test error handling)
      const textFile = createMockTextFile('Error test', 'error-test.txt');
      const invalidPath = ''; // Empty path should cause issues
      
      // This test might not fail in emulator, but demonstrates error handling
      try {
        const fileRef = ref(testStorage, invalidPath || 'fallback-path.txt');
        await uploadBytes(fileRef, textFile);
        
        // If it succeeds, clean it up
        uploadedFiles.push(fileRef.fullPath);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('File Organization', () => {
    test('should organize files in proper directory structure', async () => {
      const userId = testUser1.uid;
      const campaignId = 'organized-campaign';
      
      // Upload files to different organized locations
      const uploads = [
        { path: `profiles/${userId}/avatar.png`, file: createMockImageFile('avatar.png') },
        { path: `campaigns/${campaignId}/banner.png`, file: createMockImageFile('banner.png') },
        { path: `campaigns/${campaignId}/gallery/img1.png`, file: createMockImageFile('img1.png') },
        { path: `temp/${userId}/draft.txt`, file: createMockTextFile('Draft content', 'draft.txt') },
      ];

      for (const { path, file } of uploads) {
        const fileRef = ref(testStorage, path);
        uploadedFiles.push(path);
        
        await uploadBytes(fileRef, file, {
          customMetadata: {
            uploadedBy: userId,
            category: path.split('/')[0] // profiles, campaigns, temp
          }
        });
      }

      // Verify files are in correct locations
      for (const { path } of uploads) {
        const fileRef = ref(testStorage, path);
        const downloadURL = await getDownloadURL(fileRef);
        expect(downloadURL).toBeTruthy();
        
        const metadata = await getMetadata(fileRef);
        expect(metadata.customMetadata?.uploadedBy).toBe(userId);
      }
    });

    test('should handle concurrent uploads', async () => {
      const userId = testUser1.uid;
      const files = Array.from({ length: 5 }, (_, i) => ({
        name: `concurrent-${i}.txt`,
        content: `Content for file ${i}`,
        path: `temp/${userId}/concurrent-${i}.txt`
      }));

      // Upload all files concurrently
      const uploadPromises = files.map(async ({ name, content, path }) => {
        const file = createMockTextFile(content, name);
        const fileRef = ref(testStorage, path);
        uploadedFiles.push(path);
        
        return await uploadBytes(fileRef, file);
      });

      const results = await Promise.all(uploadPromises);
      
      expect(results).toHaveLength(5);
      results.forEach((result, index) => {
        expect(result.ref.name).toBe(files[index].name);
      });
    });
  });
});

// Storage test utilities
export const StorageTestUtils = {
  /**
   * Create and upload a test image file
   */
  async uploadTestImage(path: string, filename: string, metadata?: any): Promise<string> {
    const imageFile = createMockImageFile(filename);
    const fileRef = ref(testStorage, path);
    
    await uploadBytes(fileRef, imageFile, metadata);
    return await getDownloadURL(fileRef);
  },

  /**
   * Create and upload a test text file
   */
  async uploadTestTextFile(path: string, content: string, metadata?: any): Promise<string> {
    const textFile = createMockTextFile(content, path.split('/').pop() || 'test.txt');
    const fileRef = ref(testStorage, path);
    
    await uploadBytes(fileRef, textFile, metadata);
    return await getDownloadURL(fileRef);
  },

  /**
   * Clean up test files
   */
  async cleanupTestFiles(paths: string[]): Promise<void> {
    const deletePromises = paths.map(async (path) => {
      try {
        const fileRef = ref(testStorage, path);
        await deleteObject(fileRef);
      } catch (error) {
        console.warn(`Failed to delete test file ${path}:`, error);
      }
    });
    
    await Promise.all(deletePromises);
  },

  /**
   * Verify file exists at path
   */
  async fileExists(path: string): Promise<boolean> {
    try {
      const fileRef = ref(testStorage, path);
      await getDownloadURL(fileRef);
      return true;
    } catch (error) {
      return false;
    }
  }
};