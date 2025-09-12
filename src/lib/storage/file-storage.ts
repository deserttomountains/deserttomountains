/**
 * File Storage Utility
 * Handles file uploads, validation, and storage strategies
 */

export interface FileUploadResult {
  success: boolean;
  url?: string;
  error?: string;
  fileId?: string;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
}

// File size limits
export const FILE_LIMITS = {
  MAX_IMAGE_SIZE: 2 * 1024 * 1024, // 2MB
  MAX_VIDEO_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_DOCUMENT_SIZE: 5 * 1024 * 1024, // 5MB
} as const;

// Allowed file types
export const ALLOWED_TYPES = {
  IMAGES: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ],
  VIDEOS: [
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/quicktime'
  ],
  DOCUMENTS: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
} as const;

export class FileStorageService {
  private static instance: FileStorageService;
  private storageStrategy: 'firebase' | 'local' | 'cloudinary' | 'aws-s3';

  constructor(strategy: 'firebase' | 'local' | 'cloudinary' | 'aws-s3' = 'local') {
    this.storageStrategy = strategy;
  }

  static getInstance(strategy?: 'firebase' | 'local' | 'cloudinary' | 'aws-s3'): FileStorageService {
    if (!FileStorageService.instance) {
      FileStorageService.instance = new FileStorageService(strategy);
    }
    return FileStorageService.instance;
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File): FileValidationResult {
    const errors: string[] = [];

    // Check file type
    const allAllowedTypes: string[] = [
      ...ALLOWED_TYPES.IMAGES,
      ...ALLOWED_TYPES.VIDEOS,
      ...ALLOWED_TYPES.DOCUMENTS
    ];

    if (!allAllowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not supported`);
    }

    // Check file size based on type
    if (ALLOWED_TYPES.IMAGES.includes(file.type as any)) {
      if (file.size > FILE_LIMITS.MAX_IMAGE_SIZE) {
        errors.push(`Image size must be less than ${FILE_LIMITS.MAX_IMAGE_SIZE / (1024 * 1024)}MB`);
      }
    } else if (ALLOWED_TYPES.VIDEOS.includes(file.type as any)) {
      if (file.size > FILE_LIMITS.MAX_VIDEO_SIZE) {
        errors.push(`Video size must be less than ${FILE_LIMITS.MAX_VIDEO_SIZE / (1024 * 1024)}MB`);
      }
    } else if (ALLOWED_TYPES.DOCUMENTS.includes(file.type as any)) {
      if (file.size > FILE_LIMITS.MAX_DOCUMENT_SIZE) {
        errors.push(`Document size must be less than ${FILE_LIMITS.MAX_DOCUMENT_SIZE / (1024 * 1024)}MB`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Upload file using the configured strategy
   */
  async uploadFile(file: File, path?: string): Promise<FileUploadResult> {
    const validation = this.validateFile(file);
    
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', ')
      };
    }

    switch (this.storageStrategy) {
      case 'firebase':
        return this.uploadToFirebase(file, path);
      case 'cloudinary':
        return this.uploadToCloudinary(file, path);
      case 'aws-s3':
        return this.uploadToS3(file, path);
      case 'local':
      default:
        return this.uploadLocally(file);
    }
  }

  /**
   * Upload to Firebase Storage (Recommended for production)
   */
  private async uploadToFirebase(file: File, path?: string): Promise<FileUploadResult> {
    try {
      const { storage } = await import('@/lib/firebase') as { storage: any };
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      
      if (!storage) {
        throw new Error('Firebase Storage not initialized');
      }

      // Generate unique file ID
      const fileId = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const fileExtension = file.name.split('.').pop() || '';
      const fileName = `${fileId}.${fileExtension}`;
      
      // Create storage reference
      const storagePath = path || `templates/media/${fileName}`;
      const storageRef = ref(storage, storagePath);
      
      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        success: true,
        url: downloadURL,
        fileId
      };
    } catch (error) {
      console.error('Firebase upload error:', error);
      return {
        success: false,
        error: `Firebase upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Upload to Cloudinary (Alternative cloud storage)
   */
  private async uploadToCloudinary(file: File, path?: string): Promise<FileUploadResult> {
    try {
      // TODO: Implement Cloudinary upload
      console.log('Cloudinary upload not implemented yet');
      return {
        success: false,
        error: 'Cloudinary upload not implemented yet'
      };
    } catch (error) {
      return {
        success: false,
        error: `Cloudinary upload failed: ${error}`
      };
    }
  }

  /**
   * Upload to AWS S3 (Enterprise solution)
   */
  private async uploadToS3(file: File, path?: string): Promise<FileUploadResult> {
    try {
      // TODO: Implement AWS S3 upload
      console.log('AWS S3 upload not implemented yet');
      return {
        success: false,
        error: 'AWS S3 upload not implemented yet'
      };
    } catch (error) {
      return {
        success: false,
        error: `AWS S3 upload failed: ${error}`
      };
    }
  }

  /**
   * Convert file to base64 for local storage (Development only)
   */
  private async uploadLocally(file: File): Promise<FileUploadResult> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const base64Url = reader.result as string;
        const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        resolve({
          success: true,
          url: base64Url,
          fileId
        });
      };
      
      reader.onerror = () => {
        resolve({
          success: false,
          error: 'Failed to read file'
        });
      };
      
      reader.readAsDataURL(file);
    });
  }

  /**
   * Delete file from storage
   */
  async deleteFile(fileId: string): Promise<boolean> {
    try {
      switch (this.storageStrategy) {
        case 'firebase':
          return this.deleteFromFirebase(fileId);
        case 'cloudinary':
          return this.deleteFromCloudinary(fileId);
        case 'aws-s3':
          return this.deleteFromS3(fileId);
        case 'local':
        default:
          // For local/base64 storage, we can't actually delete the file
          // as it's stored in the database
          console.log(`Local file deletion not implemented for: ${fileId}`);
          return true;
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  /**
   * Get file URL from storage
   */
  async getFileUrl(fileId: string): Promise<string | null> {
    try {
      switch (this.storageStrategy) {
        case 'firebase':
          return this.getFirebaseUrl(fileId);
        case 'cloudinary':
          return this.getCloudinaryUrl(fileId);
        case 'aws-s3':
          return this.getS3Url(fileId);
        case 'local':
        default:
          // For local/base64 storage, the URL is the base64 data itself
          console.log(`Local file URL retrieval not implemented for: ${fileId}`);
          return null;
      }
    } catch (error) {
      console.error('Error getting file URL:', error);
      return null;
    }
  }

  /**
   * Delete from Firebase Storage
   */
  private async deleteFromFirebase(fileId: string): Promise<boolean> {
    try {
      const { storage } = await import('@/lib/firebase') as { storage: any };
      const { ref, deleteObject } = await import('firebase/storage');
      
      if (!storage) {
        throw new Error('Firebase Storage not initialized');
      }

      const storageRef = ref(storage, `templates/media/${fileId}`);
      await deleteObject(storageRef);
      return true;
    } catch (error) {
      console.error('Firebase delete error:', error);
      return false;
    }
  }

  /**
   * Get URL from Firebase Storage
   */
  private async getFirebaseUrl(fileId: string): Promise<string | null> {
    try {
      const { storage } = await import('@/lib/firebase') as { storage: any };
      const { ref, getDownloadURL } = await import('firebase/storage');
      
      if (!storage) {
        throw new Error('Firebase Storage not initialized');
      }

      const storageRef = ref(storage, `templates/media/${fileId}`);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error('Firebase URL retrieval error:', error);
      return null;
    }
  }

  /**
   * Delete from Cloudinary
   */
  private async deleteFromCloudinary(fileId: string): Promise<boolean> {
    try {
      // TODO: Implement Cloudinary deletion
      console.log('Cloudinary deletion not implemented yet');
      return true;
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      return false;
    }
  }

  /**
   * Get URL from Cloudinary
   */
  private async getCloudinaryUrl(fileId: string): Promise<string | null> {
    try {
      // TODO: Implement Cloudinary URL retrieval
      console.log('Cloudinary URL retrieval not implemented yet');
      return null;
    } catch (error) {
      console.error('Cloudinary URL retrieval error:', error);
      return null;
    }
  }

  /**
   * Delete from AWS S3
   */
  private async deleteFromS3(fileId: string): Promise<boolean> {
    try {
      // TODO: Implement AWS S3 deletion
      console.log('AWS S3 deletion not implemented yet');
      return true;
    } catch (error) {
      console.error('AWS S3 delete error:', error);
      return false;
    }
  }

  /**
   * Get URL from AWS S3
   */
  private async getS3Url(fileId: string): Promise<string | null> {
    try {
      // TODO: Implement AWS S3 URL retrieval
      console.log('AWS S3 URL retrieval not implemented yet');
      return null;
    } catch (error) {
      console.error('AWS S3 URL retrieval error:', error);
      return null;
    }
  }
}

// Export singleton instance with Local Storage as default for development
// Switch to 'firebase' after deploying storage rules
export const fileStorage = FileStorageService.getInstance('local');
