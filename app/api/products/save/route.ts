import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/types/product-model';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { products } = body;

    // Validate request body
    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Products array is required and must not be empty' 
        },
        { status: 400 }
      );
    }

    // Validate each product has required fields
    for (const product of products) {
      if (!product.name || typeof product.name !== 'string') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Each product must have a valid name' 
          },
          { status: 400 }
        );
      }
    }

    // Get environment variables for core API
    const baseUrl = process.env.CORE_API_BASE_URL || 'http://127.0.0.1:9091';
    const businessId = process.env.CORE_API_BUSINESS_ID || 'BIZ_a67s3214986ca6';
    const authToken = process.env.CORE_API_AUTH_TOKEN || '';

    if (!baseUrl || !businessId || !authToken) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Core API configuration is incomplete' 
        },
        { status: 500 }
      );
    }

    // Transform products to match the core API format
    const transformedProducts = transformProductsForCoreApi(products);

    // Call the core API directly from the server
    const response = await fetch(`${baseUrl}/mgmt/merchants/businesses/${businessId}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        products: transformedProducts
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Core API error: ${response.status} - ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Products saved successfully',
      data,
    });

  } catch (error) {
    console.error('Error saving products:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save products to core API' 
      },
      { status: 500 }
    );
  }
}

// Helper function to transform products for core API
function transformProductsForCoreApi(products: Product[]): any[] {
  return products.map(product => ({
    name: product.name,
    description: product.description,
    categories: product.categories || [],
    tags: product.tags || [],
    images: product.images || [],
    variants: transformVariants(product.variants),
    addOns: transformAddOns(product.addOns),
  }));
}

function transformVariants(variants?: any): any {
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

function transformAddOns(addOns?: any[]): any[] {
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