import { NextRequest, NextResponse } from 'next/server';
import { apptizerService } from '@/services/apptizer-service';
import { BulkUploadRequest } from '@/types/product-model';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body: BulkUploadRequest = await request.json();
    
    // Validate that we have the required environment variables
    if (!process.env.BUSINESS_ID) {
      return NextResponse.json(
        { error: 'BUSINESS_ID environment variable is not set' },
        { status: 500 }
      );
    }

    // Make the API call to Apptizer (equivalent to your curl command)
    const response = await apptizerService.uploadBulkProducts(body);
    
    return NextResponse.json({
      success: true,
      message: 'Products uploaded successfully',
      data: response.data,
      status: response.status
    });
    
  } catch (error) {
    console.error('Bulk upload failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to upload products',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Example of getting products (GET request)
    const response = await apptizerService.getProducts();
    
    return NextResponse.json({
      success: true,
      data: response.data,
      status: response.status
    });
    
  } catch (error) {
    console.error('Failed to get products:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get products',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 