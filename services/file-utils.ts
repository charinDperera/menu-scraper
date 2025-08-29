export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  fileType: 'pdf' | 'image' | 'unsupported';
  mimeType: string;
  extension: string;
}

export class FileUtils {
  /**
   * Get file extension from filename
   * @param filename - Name of the file
   * @returns File extension without the dot
   */
  static getFileExtension(filename: string): string {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
  }

  /**
   * Get file extension with dot
   * @param filename - Name of the file
   * @returns File extension with the dot
   */
  static getFileExtensionWithDot(filename: string): string {
    const ext = this.getFileExtension(filename);
    return ext ? `.${ext}` : '';
  }

  /**
   * Detect file type based on MIME type and extension
   * @param file - File object to analyze
   * @returns FileValidationResult with type information
   */
  static detectFileType(file: File): FileValidationResult {
    const mimeType = file.type;
    const extension = this.getFileExtension(file.name);
    
    // Check PDF files
    if (mimeType === 'application/pdf' || extension === 'pdf') {
      return {
        isValid: true,
        fileType: 'pdf',
        mimeType,
        extension
      };
    }
    
    // Check image files
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'tif'];
    const isImageMime = mimeType.startsWith('image/');
    const isImageExtension = imageExtensions.includes(extension);
    
    if (isImageMime || isImageExtension) {
      return {
        isValid: true,
        fileType: 'image',
        mimeType,
        extension
      };
    }
    
    return {
      isValid: false,
      error: `Unsupported file type: ${mimeType || extension}`,
      fileType: 'unsupported',
      mimeType,
      extension
    };
  }

  /**
   * Validate file for parsing
   * @param file - File object to validate
   * @returns FileValidationResult with validation status
   */
  static validateFile(file: File): FileValidationResult {
    // Basic file checks
    if (!file) {
      return {
        isValid: false,
        error: 'No file provided',
        fileType: 'unsupported',
        mimeType: '',
        extension: ''
      };
    }

    if (file.size === 0) {
      return {
        isValid: false,
        error: 'File is empty',
        fileType: 'unsupported',
        mimeType: file.type,
        extension: this.getFileExtension(file.name)
      };
    }

    // Check file size limits
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size exceeds limit of ${Math.round(maxSize / (1024 * 1024))}MB`,
        fileType: 'unsupported',
        mimeType: file.type,
        extension: this.getFileExtension(file.name)
      };
    }

    // Detect and validate file type
    const typeResult = this.detectFileType(file);
    
    if (!typeResult.isValid) {
      return typeResult;
    }

    // Additional validation based on file type
    if (typeResult.fileType === 'image') {
      // Image-specific validation
      const imageMaxSize = 10 * 1024 * 1024; // 10MB for images
      if (file.size > imageMaxSize) {
        return {
          ...typeResult,
          isValid: false,
          error: `Image file size must be less than ${Math.round(imageMaxSize / (1024 * 1024))}MB`
        };
      }
    }

    return typeResult;
  }

  /**
   * Format file size for display
   * @param bytes - File size in bytes
   * @returns Formatted file size string
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get supported file types for display
   * @returns Object with supported file types and extensions
   */
  static getSupportedFileTypes() {
    return {
      pdf: {
        mimeTypes: ['application/pdf'],
        extensions: ['.pdf'],
        description: 'PDF Documents'
      },
      images: {
        mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/tiff'],
        extensions: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff'],
        description: 'Image Files (JPG, PNG, GIF, BMP, WebP, TIFF)'
      }
    };
  }

  /**
   * Create a file input accept attribute string
   * @returns String suitable for HTML file input accept attribute
   */
  static getAcceptString(): string {
    const types = this.getSupportedFileTypes();
    return [
      ...types.pdf.mimeTypes,
      ...types.images.mimeTypes,
      ...types.pdf.extensions,
      ...types.images.extensions
    ].join(',');
  }
} 