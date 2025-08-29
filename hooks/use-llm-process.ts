import { useState, useCallback } from 'react';
import { LLMProcessingRequest, LLMProcessingResponse } from '@/services/llm-service';
import { ProcessingResult, ProcessingMetadata } from '@/types/product-model';
import { llmService } from '@/services/llm-service';

interface UseLLMProcessReturn {
  processMenuData: (request: LLMProcessingRequest) => Promise<ProcessingResult | null>;
  isProcessing: boolean;
  error: string | null;
  lastResult: ProcessingResult | null;
  reset: () => void;
}

export function useLLMProcess(): UseLLMProcessReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ProcessingResult | null>(null);

  const processMenuData = useCallback(async (request: LLMProcessingRequest): Promise<ProcessingResult | null> => {
    setIsProcessing(true);
    setError(null);

    try {
      // Call LLM service directly
      const llmResponse = await llmService.processMenuData(request);
      
      if (!llmResponse.success) {
        throw new Error(llmResponse.error || 'LLM processing failed');
      }

      // Create processing metadata
      const metadata: ProcessingMetadata = {
        totalProducts: llmResponse.products.length,
        processingTime: llmResponse.processingTime,
        sourceFile: request.sourceFile,
        fileType: request.fileType || 'unknown',
        timestamp: new Date(),
      };

      // Create the final processing result
      const result: ProcessingResult = {
        success: true,
        products: llmResponse.products,
        metadata,
      };

      setLastResult(result);
      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setLastResult(null);
    setIsProcessing(false);
  }, []);

  return {
    processMenuData,
    isProcessing,
    error,
    lastResult,
    reset,
  };
} 