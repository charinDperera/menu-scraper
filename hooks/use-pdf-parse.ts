import { useState, useCallback } from 'react';
import { PDFService, PDFParseResult } from '@/services/pdf-service';

export function usePDFParse() {
  const [isParsing, setIsParsing] = useState(false);
  const [result, setResult] = useState<PDFParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parsePDF = useCallback(async (file: File) => {
    // Ensure we're on the client side
    if (typeof window === 'undefined') {
      throw new Error('PDF parsing is only available in the browser');
    }

    try {
      setIsParsing(true);
      setError(null);
      setResult(null);

      const parseResult = await PDFService.parseFile(file);
      setResult(parseResult);
      
      // Log the extracted text as requested
      console.log('Extracted text:', parseResult.text);
      console.log('Pages:', parseResult.pages);
      console.log('Info:', parseResult.info);
      
      return parseResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse PDF';
      setError(errorMessage);
      console.error('PDF parsing error:', errorMessage);
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
    parsePDF,
    isParsing,
    result,
    error,
    reset
  };
} 