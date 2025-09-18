import { Platform } from 'react-native';

// Simple encryption utility using base64 and basic obfuscation
// Note: For production use, consider using react-native-crypto or similar robust encryption libraries

class EncryptionManager {
  private readonly key: string = 'ZimBuzz2024Key'; // In production, use a more secure key generation method
  private readonly isWeb = Platform.OS === 'web';

  // Simple XOR encryption with base64 encoding
  encrypt(data: string): string {
    try {
      if (!data) return data;

      // XOR encryption
      let encrypted = '';
      for (let i = 0; i < data.length; i++) {
        const dataChar = data.charCodeAt(i);
        const keyChar = this.key.charCodeAt(i % this.key.length);
        encrypted += String.fromCharCode(dataChar ^ keyChar);
      }

      // Base64 encode the result
      if (this.isWeb) {
        return btoa(encrypted);
      } else {
        // For React Native, use manual base64 encoding
        return this.base64Encode(encrypted);
      }
    } catch (error) {
      console.warn('Encryption failed:', error);
      return data; // Return original data if encryption fails
    }
  }

  // Simple XOR decryption with base64 decoding
  decrypt(encryptedData: string): string {
    try {
      if (!encryptedData) return encryptedData;

      // Base64 decode first
      let decoded: string;
      if (this.isWeb) {
        decoded = atob(encryptedData);
      } else {
        decoded = this.base64Decode(encryptedData);
      }

      // XOR decryption
      let decrypted = '';
      for (let i = 0; i < decoded.length; i++) {
        const encryptedChar = decoded.charCodeAt(i);
        const keyChar = this.key.charCodeAt(i % this.key.length);
        decrypted += String.fromCharCode(encryptedChar ^ keyChar);
      }

      return decrypted;
    } catch (error) {
      console.warn('Decryption failed:', error);
      return encryptedData; // Return original data if decryption fails
    }
  }

  // Encrypt an object
  encryptObject(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'string') {
      return this.encrypt(obj);
    }
    
    if (typeof obj === 'object') {
      if (Array.isArray(obj)) {
        return obj.map(item => this.encryptObject(item));
      }
      
      const encrypted: any = {};
      for (const [key, value] of Object.entries(obj)) {
        encrypted[key] = this.encryptObject(value);
      }
      return encrypted;
    }
    
    return obj; // Numbers, booleans, etc. remain unchanged
  }

  // Decrypt an object
  decryptObject(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'string') {
      return this.decrypt(obj);
    }
    
    if (typeof obj === 'object') {
      if (Array.isArray(obj)) {
        return obj.map(item => this.decryptObject(item));
      }
      
      const decrypted: any = {};
      for (const [key, value] of Object.entries(obj)) {
        decrypted[key] = this.decryptObject(value);
      }
      return decrypted;
    }
    
    return obj; // Numbers, booleans, etc. remain unchanged
  }

  // Hash a string using simple algorithm (for non-cryptographic purposes)
  hash(data: string): string {
    let hash = 0;
    if (data.length === 0) return hash.toString();
    
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  // Generate a simple checksum for data integrity
  generateChecksum(data: string): string {
    return this.hash(data + this.key);
  }

  // Verify data integrity
  verifyChecksum(data: string, checksum: string): boolean {
    return this.generateChecksum(data) === checksum;
  }

  // Manual base64 encoding for React Native
  private base64Encode(str: string): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    let i = 0;
    
    while (i < str.length) {
      const octet1 = str.charCodeAt(i++);
      const octet2 = i < str.length ? str.charCodeAt(i++) : 0;
      const octet3 = i < str.length ? str.charCodeAt(i++) : 0;
      
      const bitmap = (octet1 << 16) | (octet2 << 8) | octet3;
      
      result += chars.charAt((bitmap >> 18) & 63);
      result += chars.charAt((bitmap >> 12) & 63);
      result += i - 2 < str.length ? chars.charAt((bitmap >> 6) & 63) : '=';
      result += i - 1 < str.length ? chars.charAt(bitmap & 63) : '=';
    }
    
    return result;
  }

  // Manual base64 decoding for React Native
  private base64Decode(str: string): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    let i = 0;
    
    str = str.replace(/[^A-Za-z0-9+/]/g, '');
    
    while (i < str.length) {
      const encoded1 = chars.indexOf(str.charAt(i++));
      const encoded2 = chars.indexOf(str.charAt(i++));
      const encoded3 = chars.indexOf(str.charAt(i++));
      const encoded4 = chars.indexOf(str.charAt(i++));
      
      const bitmap = (encoded1 << 18) | (encoded2 << 12) | (encoded3 << 6) | encoded4;
      
      result += String.fromCharCode((bitmap >> 16) & 255);
      if (encoded3 !== 64) result += String.fromCharCode((bitmap >> 8) & 255);
      if (encoded4 !== 64) result += String.fromCharCode(bitmap & 255);
    }
    
    return result;
  }

  // Check if encryption is available and working
  testEncryption(): boolean {
    try {
      const testData = 'Hello, ZimBuzz!';
      const encrypted = this.encrypt(testData);
      const decrypted = this.decrypt(encrypted);
      return testData === decrypted;
    } catch (error) {
      console.warn('Encryption test failed:', error);
      return false;
    }
  }

  // Get encryption status
  getStatus(): {
    available: boolean;
    algorithm: string;
    keyLength: number;
    platform: string;
  } {
    return {
      available: this.testEncryption(),
      algorithm: 'XOR + Base64',
      keyLength: this.key.length,
      platform: this.isWeb ? 'web' : 'mobile',
    };
  }
}

export const encryptionManager = new EncryptionManager();

// Utility functions for selective encryption
export const encryptSensitiveFields = (data: any, sensitiveFields: string[]): any => {
  if (!data || typeof data !== 'object') return data;
  
  const result = { ...data };
  
  for (const field of sensitiveFields) {
    if (result[field] !== undefined) {
      result[field] = encryptionManager.encrypt(JSON.stringify(result[field]));
    }
  }
  
  return result;
};

export const decryptSensitiveFields = (data: any, sensitiveFields: string[]): any => {
  if (!data || typeof data !== 'object') return data;
  
  const result = { ...data };
  
  for (const field of sensitiveFields) {
    if (result[field] !== undefined && typeof result[field] === 'string') {
      try {
        const decrypted = encryptionManager.decrypt(result[field]);
        result[field] = JSON.parse(decrypted);
      } catch (error) {
        console.warn(`Failed to decrypt field ${field}:`, error);
        // Keep original value if decryption fails
      }
    }
  }
  
  return result;
};