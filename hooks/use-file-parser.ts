import { useState, useCallback } from 'react';
import { usePDFParse } from './use-pdf-parse';
import { useImageParse } from './use-image-parse';
import { FileUtils, FileValidationResult } from '@/services/file-utils';

export interface FileParseResult {
  text: string | null;
  data: any; // raw structured output from parser
  loading: boolean;
  error: string | null;
  fileType: 'pdf' | 'image' | 'unsupported';
  metadata?: {
    fileName: string;
    fileSize: number;
    mimeType: string;
    processingTime?: number;
  };
}

export function useFileParser() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<FileParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Use the individual parser hooks
  const pdfParser = usePDFParse();
  const imageParser = useImageParse();

  const parseFile = useCallback(async (file: File) => {
    // Ensure we're on the client side
    if (typeof window === 'undefined') {
      throw new Error('File parsing is only available in the browser');
    }

    try {
      setIsProcessing(true);
      setError(null);
      setResult(null);

      const startTime = performance.now();
      
      // Validate file before parsing
      const validation = FileUtils.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error || 'File validation failed');
      }

      // Detect file type and route to appropriate parser
      let parseResult: any;
      const fileType = validation.fileType;

      if (fileType === 'pdf') {
        parseResult = await pdfParser.parsePDF(file);
      } else if (fileType === 'image') {
        parseResult = await imageParser.parseImage(file);
      } else {
        throw new Error(`Unsupported file type: ${validation.mimeType}. Supported types: PDF, JPG, PNG, GIF, BMP, WebP, TIFF`);
      }

      const processingTime = performance.now() - startTime;

      // Create unified result
      const unifiedResult: FileParseResult = {
        text: parseResult.text || null,
        data: parseResult,
        loading: false,
        error: null,
        fileType,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          processingTime
        }
      };

      setResult(unifiedResult);
      
      // Log the unified result
      console.log('File parsing completed:', {
        fileType,
        fileName: file.name,
        textLength: unifiedResult.text?.length || 0,
        processingTime: `${processingTime.toFixed(2)}ms`
      });
      
      return unifiedResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse file';
      setError(errorMessage);
      console.error('File parsing error:', errorMessage);
      
      // Create error result
      const errorResult: FileParseResult = {
        text: null,
        data: null,
        loading: false,
        error: errorMessage,
        fileType: 'unsupported',
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type
        }
      };
      
      setResult(errorResult);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [pdfParser, imageParser]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsProcessing(false);
    pdfParser.reset();
    imageParser.reset();
  }, [pdfParser, imageParser]);

  // Get current loading state (either from unified state or individual parsers)
  const loading = isProcessing || pdfParser.isParsing || imageParser.isParsing;

  // Get current error state
  const currentError = error || pdfParser.error || imageParser.error;

  return {
    parseFile,
    loading,
    result,
    error: currentError,
    reset,
    // Expose individual parser states for granular control if needed
    pdfState: {
      isParsing: pdfParser.isParsing,
      result: pdfParser.result,
      error: pdfParser.error
    },
    imageState: {
      isParsing: imageParser.isParsing,
      result: imageParser.result,
      error: imageParser.error
    }
  };
} 