import { ApiClient } from '@/lib/api-client';
import { BulkUploadRequest } from '@/types/product-model';

class ApptizerService {
  private apiClient: ApiClient;
  private businessId: string;

  constructor() {
    // Get configuration from environment variables
    const baseURL = process.env.APPTIZER_API_BASE_URL || 'http://dev.apptizer.io:9091';
    const merchantId = process.env.X_MERCHANT_ID || 'test5org1';
    this.businessId = process.env.BUSINESS_ID || '';

    if (!this.businessId) {
      throw new Error('BUSINESS_ID environment variable is required');
    }

    this.apiClient = new ApiClient({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'X-Merchant-Id': merchantId,
      },
    });
  }

  /**
   * Upload bulk products to Apptizer API
   * This is the equivalent of the curl command:
   * curl --location 'http://dev.apptizer.io:9091/mgmt/internal/businesses/{businessId}/products/bulk-upload' \
   * --header 'Content-Type: application/json' \
   * --header 'X-Merchant-Id: test5org1' \
   * --data '{...}'
   */
  async uploadBulkProducts(bulkRequest: BulkUploadRequest) {
    const endpoint = `/mgmt/internal/businesses/${this.businessId}/products/bulk-upload`;
    
    try {
      const response = await this.apiClient.post(endpoint, bulkRequest);
      return response;
    } catch (error) {
      console.error('Failed to upload bulk products:', error);
      throw error;
    }
  }

  /**
   * Get products from Apptizer API
   */
  async getProducts() {
    const endpoint = `/mgmt/internal/businesses/${this.businessId}/products`;
    
    try {
      const response = await this.apiClient.get(endpoint);
      return response;
    } catch (error) {
      console.error('Failed to get products:', error);
      throw error;
    }
  }

  /**
   * Update products in Apptizer API
   */
  async updateProducts(bulkRequest: BulkUploadRequest) {
    const endpoint = `/mgmt/internal/businesses/${this.businessId}/products`;
    
    try {
      const response = await this.apiClient.put(endpoint, bulkRequest);
      return response;
    } catch (error) {
      console.error('Failed to update products:', error);
      throw error;
    }
  }

  /**
   * Delete products from Apptizer API
   */
  async deleteProducts() {
    const endpoint = `/mgmt/internal/businesses/${this.businessId}/products`;
    
    try {
      const response = await this.apiClient.delete(endpoint);
      return response;
    } catch (error) {
      console.error('Failed to delete products:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const apptizerService = new ApptizerService();
export { ApptizerService }; 