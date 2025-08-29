import { useState, useCallback } from 'react';
import { Product } from '@/types/product-model';
import { coreApiService, CoreApiProductResponse } from '@/services/core-api-service';

interface UseSaveProductsReturn {
  saveProducts: (products: Product[]) => Promise<CoreApiProductResponse>;
  isSaving: boolean;
  error: string | null;
  lastResult: CoreApiProductResponse | null;
  reset: () => void;
}

export function useSaveProducts(): UseSaveProductsReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<CoreApiProductResponse | null>(null);

  const saveProducts = useCallback(async (products: Product[]): Promise<CoreApiProductResponse> => {
    setIsSaving(true);
    setError(null);

    try {
      const result = await coreApiService.saveProducts(products);
      
      if (result.success) {
        setLastResult(result);
      } else {
        setError(result.error || 'Failed to save products');
      }

      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsSaving(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setLastResult(null);
    setIsSaving(false);
  }, []);

  return {
    saveProducts,
    isSaving,
    error,
    lastResult,
    reset,
  };
} 