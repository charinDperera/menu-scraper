# File Parser System

A comprehensive client-side file parsing system for Next.js that supports both PDF and image files with OCR capabilities.

## Features

- **PDF Parsing**: Extract text from PDF files using pdfjs-dist
- **Image OCR**: Extract text from images using Tesseract.js
- **Unified Interface**: Single hook for all file types
- **Client-Side Only**: No server calls required
- **Drag & Drop Support**: Modern file upload experience
- **Error Handling**: Comprehensive error handling and validation
- **Performance Optimized**: Lazy loading and resource management

## Architecture

### Services Layer

The system is built around three core services:

1. **PDFService** (`services/pdf-service.ts`)
   - Handles PDF file parsing
   - Uses pdfjs-dist for text extraction
   - Supports metadata extraction

2. **ImageService** (`services/image-service.ts`)
   - Handles image file OCR
   - Uses Tesseract.js for text recognition
   - Supports multiple image formats

3. **FileUtils** (`services/file-utils.ts`)
   - File type detection and validation
   - File size and format validation
   - Utility functions for file handling

### Hooks Layer

Three React hooks provide the interface:

1. **usePDFParse** (`hooks/use-pdf-parse.ts`)
   - PDF-specific parsing logic
   - Loading states and error handling

2. **useImageParse** (`hooks/use-image-parse.ts`)
   - Image-specific parsing logic
   - OCR processing states

3. **useFileParser** (`hooks/use-file-parser.ts`)
   - Unified interface for all file types
   - Automatic routing to appropriate parser
   - Consistent result format

## Usage

### Basic Usage

```tsx
import { useFileParser } from '@/hooks/use-file-parser';

function MyComponent() {
  const { parseFile, loading, result, error } = useFileParser();

  const handleFileUpload = async (file: File) => {
    try {
      const result = await parseFile(file);
      console.log('Extracted text:', result.text);
    } catch (err) {
      console.error('Parsing failed:', err);
    }
  };

  return (
    <div>
      {/* Your UI here */}
    </div>
  );
}
```

### Individual Parser Usage

```tsx
import { usePDFParse, useImageParse } from '@/hooks';

function MyComponent() {
  const pdfParser = usePDFParse();
  const imageParser = useImageParse();

  const handlePDF = async (file: File) => {
    const result = await pdfParser.parsePDF(file);
    // Handle PDF result
  };

  const handleImage = async (file: File) => {
    const result = await imageParser.parseImage(file);
    // Handle image result
  };
}
```

### File Validation

```tsx
import { FileUtils } from '@/services';

const validation = FileUtils.validateFile(file);
if (validation.isValid) {
  // File is valid for parsing
  console.log('File type:', validation.fileType);
} else {
  console.error('Validation error:', validation.error);
}
```

## Supported File Types

### PDF Files
- **Format**: `.pdf`
- **MIME Type**: `application/pdf`
- **Max Size**: 50MB
- **Features**: Text extraction, page count, metadata

### Image Files
- **Formats**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.webp`, `.tiff`
- **MIME Types**: `image/*`
- **Max Size**: 10MB
- **Features**: OCR text extraction, confidence scores, text blocks

## Result Format

### Unified Result Structure

```typescript
interface FileParseResult {
  text: string | null;           // Extracted text content
  data: any;                     // Raw parser output
  loading: boolean;              // Processing state
  error: string | null;          // Error message if any
  fileType: 'pdf' | 'image';    // Detected file type
  metadata?: {                   // File metadata
    fileName: string;
    fileSize: number;
    mimeType: string;
    processingTime?: number;
  };
}
```

### PDF-Specific Result

```typescript
interface PDFParseResult {
  text: string;
  pages: number;
  info?: any;
}
```

### Image-Specific Result

```typescript
interface ImageParseResult {
  text: string;
  confidence: number;
  language: string;
  blocks: TextBlock[];
  info?: any;
}
```

## Performance Considerations

### Lazy Loading
- Tesseract.js and pdfjs-dist are imported only when needed
- Reduces initial bundle size

### Resource Management
- OCR workers are properly terminated after use
- Memory leaks are prevented

### File Size Limits
- PDFs: 50MB max
- Images: 10MB max
- Prevents browser freezing on large files

## Error Handling

### Validation Errors
- File type not supported
- File size exceeds limits
- Empty files

### Processing Errors
- Corrupted files
- OCR processing failures
- PDF parsing errors

### Graceful Fallbacks
- Detailed error messages
- Error states in UI
- Reset functionality

## Browser Compatibility

### Required Features
- File API support
- ArrayBuffer support
- Web Workers (for OCR)

### Supported Browsers
- Chrome 67+
- Firefox 60+
- Safari 11.1+
- Edge 79+

## Development

### Adding New File Types

1. Create a new service class
2. Implement the parsing logic
3. Add file type detection in `FileUtils`
4. Create a corresponding hook
5. Update `useFileParser` to route to the new parser

### Example: Adding DOCX Support

```typescript
// services/docx-service.ts
export class DOCXService {
  static async parseFile(file: File): Promise<DOCXParseResult> {
    // Implementation
  }
}

// hooks/use-docx-parse.ts
export function useDOCXParse() {
  // Hook implementation
}

// Update FileUtils.detectFileType()
// Update useFileParser routing
```

## Testing

### Unit Tests
- Test individual services
- Test hooks in isolation
- Mock file objects

### Integration Tests
- Test file type routing
- Test error handling
- Test performance with various file sizes

## Dependencies

### Core Dependencies
- `tesseract.js`: Image OCR processing
- `pdfjs-dist`: PDF text extraction

### Development Dependencies
- `@types/node`: TypeScript definitions
- `typescript`: Type checking

## Troubleshooting

### Common Issues

1. **OCR Not Working**
   - Check browser console for errors
   - Ensure file is a supported image format
   - Check file size limits

2. **PDF Parsing Fails**
   - Verify PDF is not corrupted
   - Check if PDF contains text (not just images)
   - Ensure pdf.worker.min.mjs is accessible

3. **Performance Issues**
   - Reduce file size
   - Check browser memory usage
   - Consider implementing progress indicators

### Debug Mode

Enable detailed logging:

```typescript
// In development
console.log('File parsing details:', {
  fileType: file.type,
  fileSize: file.size,
  fileName: file.name
});
```

## License

This system is part of the Menu Scraper project and follows the same licensing terms. 