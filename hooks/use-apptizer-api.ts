import { useState } from 'react';
import { BulkUploadRequest } from '@/types/product-model';

interface UseApptizerApiReturn {
  uploadProducts: (data: BulkUploadRequest) => Promise<any>;
  getProducts: () => Promise<any>;
  updateProducts: (data: BulkUploadRequest) => Promise<any>;
  deleteProducts: () => Promise<any>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useApptizerApi(): UseApptizerApiReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const makeRequest = async (endpoint: string, options: RequestInit = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/bulk-upload${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadProducts = async (data: BulkUploadRequest) => {
    return makeRequest('', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  };

  const getProducts = async () => {
    return makeRequest('', {
      method: 'GET',
    });
  };

  const updateProducts = async (data: BulkUploadRequest) => {
    return makeRequest('', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  };

  const deleteProducts = async () => {
    return makeRequest('', {
      method: 'DELETE',
    });
  };

  return {
    uploadProducts,
    getProducts,
    updateProducts,
    deleteProducts,
    isLoading,
    error,
    clearError,
  };
} 