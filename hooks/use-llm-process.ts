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
    console.log('🚀 Starting LLM processing in hook...', {
      sourceFile: request.sourceFile,
      fileType: request.fileType,
      textLength: request.rawText.length
    });
    
    setIsProcessing(true);
    setError(null);

    try {
      // Call LLM service directly
      console.log('📞 Calling LLM service...');
      const llmResponse = await llmService.processMenuData(request);
      console.log('📥 LLM service response received:', {
        success: llmResponse.success,
        productsCount: llmResponse.products?.length || 0,
        processingTime: llmResponse.processingTime,
        model: llmResponse.model
      });
      
      if (!llmResponse.success) {
        throw new Error(llmResponse.error || 'LLM processing failed');
      }

      // Create processing metadata
      const metadata: ProcessingMetadata = {
        totalProducts: llmResponse.products.length,
        successfulProducts: llmResponse.products.length,
        failedProducts: 0,
        processingTime: llmResponse.processingTime,
        sourceFile: request.sourceFile,
        fileSize: request.rawText.length,
        fileType: request.fileType || 'unknown',
        timestamp: new Date(),
      };

      // Create the final processing result with all bulk data
      const result: ProcessingResult = {
        success: true,
        products: llmResponse.products,
        categories: llmResponse.categories,
        taxes: llmResponse.taxes,
        addonGroups: llmResponse.addonGroups,
        errors: [],
        metadata,
      };

      console.log('🎉 Final processing result created:', {
        totalProducts: result.products.length,
        totalCategories: result.categories.length,
        totalTaxes: result.taxes.length,
        totalAddonGroups: result.addonGroups.length,
        metadata: result.metadata
      });

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