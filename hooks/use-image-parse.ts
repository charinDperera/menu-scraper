import { useState, useCallback } from 'react';
import { ImageService, ImageParseResult } from '@/services/image-service';

export function useImageParse() {
  const [isParsing, setIsParsing] = useState(false);
  const [result, setResult] = useState<ImageParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parseImage = useCallback(async (file: File) => {
    // Ensure we're on the client side
    if (typeof window === 'undefined') {
      throw new Error('Image parsing is only available in the browser');
    }

    try {
      setIsParsing(true);
      setError(null);
      setResult(null);

      const parseResult = await ImageService.parseFile(file);
      setResult(parseResult);
      
      // Log the extracted text as requested
      console.log('Extracted text:', parseResult.text);
      console.log('Confidence:', parseResult.confidence);
      console.log('Language:', parseResult.language);
      console.log('Text blocks:', parseResult.blocks.length);
      console.log('Info:', parseResult.info);
      
      return parseResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse image';
      setError(errorMessage);
      console.error('Image parsing error:', errorMessage);
      throw err;
    } finally {
      setIsParsing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsParsing(false);
  }, []);

  return {
    parseImage,
    isParsing,
    result,
    error,
    reset
  };
} 