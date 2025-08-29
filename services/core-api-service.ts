import { Product, CreateProducts, ApiResponse } from '@/types/product-model';

export interface CoreApiProductRequest {
  products: Product[];
}

export interface CoreApiProductResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

export class CoreApiService {
  constructor() {
    // This service is now a simple wrapper for the BFF route
  }

  async saveProducts(products: Product[]): Promise<CoreApiProductResponse> {
    try {
      // Transform products to match the core API format
      const transformedProducts = this.transformProductsForCoreApi(products);
      
      // Use the BFF route instead of calling external API directly
      const response = await fetch('/api/products/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: transformedProducts
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API error: ${response.status} - ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        message: 'Products saved successfully',
        data,
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save products',
      };
    }
  }

  private transformProductsForCoreApi(products: Product[]): any[] {
    return products.map(product => ({
      name: product.name,
      description: product.description,
      categories: product.categories || [],
      tags: product.tags || [],
      images: product.images || [],
      variants: this.transformVariants(product.variants),
      addOns: this.transformAddOns(product.addOns),
    }));
  }

  private transformVariants(variants?: any): any {
    if (!variants || !variants.types || variants.types.length === 0) {
      return undefined;
    }

    return {
      name: variants.name || 'Size',
      types: variants.types.map((type: any) => ({
        name: type.name,
        price: {
          currency: {
            code: 'USD',
            symbol: '$'
          },
          amount: type.price?.amount || 0
        },
        description: type.description,
        sku: type.sku
      }))
    };
  }

  private transformAddOns(addOns?: any[]): any[] {
    if (!addOns || addOns.length === 0) {
      return [];
    }

    return addOns.map(addOn => ({
      name: addOn.name,
      mandatory: addOn.mandatory || false,
      maxSelectionsAllowed: addOn.maxSelectionsAllowed || 1,
      types: addOn.types?.map((type: any) => ({
        name: type.name,
        description: type.description,
        subTypes: type.subTypes?.map((subType: any) => ({
          name: subType.name,
          price: {
            currency: {
              code: 'USD',
              symbol: '$'
            },
            amount: subType.price?.amount || 0
          },
          sku: subType.sku
        })) || []
      })) || []
    }));
  }
}

// Export singleton instance
export const coreApiService = new CoreApiService(); 