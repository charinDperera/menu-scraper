# Core API Integration

This document describes the integration with the core API for saving processed menu products to the database.

## Overview

The core API integration allows the menu scraper to save extracted and reviewed products directly to the database through the core management API.

## Configuration

### Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Core API Configuration (Server-side only)
CORE_API_BASE_URL=http://127.0.0.1:9091
CORE_API_BUSINESS_ID=BIZ_a67s3214986ca6
CORE_API_AUTH_TOKEN=your_auth_token_here
```

### Configuration Details

- **NEXT_PUBLIC_CORE_API_BASE_URL**: The base URL of the core API server
- **NEXT_PUBLIC_CORE_API_BUSINESS_ID**: The business ID for the merchant
- **NEXT_PUBLIC_CORE_API_AUTH_TOKEN**: The JWT token for authentication

## Architecture

### 1. Core API Service (`services/core-api-service.ts`)

The service is now a simple wrapper that calls the BFF route:

- **Client Interface**: Provides a clean interface for components
- **BFF Integration**: Routes requests through the Next.js API layer
- **Error Handling**: Manages client-side errors and responses
- **State Management**: Integrates with React hooks for UI state

### 2. Custom Hook (`hooks/use-save-products.ts`)

Provides React state management for the save operation:

- **Loading States**: Tracks save operation progress
- **Error Handling**: Manages and displays error messages
- **Success Feedback**: Provides success confirmation
- **State Reset**: Clears previous operation results

### 3. BFF API Route (`app/api/products/save/route.ts`)

Server-side validation and processing:

- **Request Validation**: Ensures required fields are present
- **Data Sanitization**: Cleans and validates product data
- **Service Integration**: Calls the core API service
- **Response Formatting**: Returns consistent API responses

## API Endpoint

### Save Products

**Endpoint**: `POST /api/products/save`

**Request Body**:
```json
{
  "products": [
    {
      "name": "Product Name",
      "description": "Product Description",
      "categories": ["Category1", "Category2"],
      "tags": ["tag1", "tag2"],
      "images": ["http://example.com/image.jpg"],
      "variants": {
        "name": "Size",
        "types": [
          {
            "name": "Small",
            "price": {
              "amount": 10.00,
              "currency": "USD"
            },
            "description": "Small size option"
          }
        ]
      },
      "addOns": [
        {
          "name": "Toppings",
          "mandatory": false,
          "maxSelectionsAllowed": 2,
          "types": [
            {
              "name": "Cheese",
              "description": "Extra cheese",
              "subTypes": [
                {
                  "name": "Single",
                  "price": {
                    "amount": 1.00,
                    "currency": "USD"
                  },
                  "sku": "CHEESE-001"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Products saved successfully",
  "data": { ... }
}
```

## Data Transformation

### Product Model Mapping

The service automatically transforms internal product models to match the core API format:

1. **Basic Fields**: name, description, categories, tags, images
2. **Variants**: Size options with pricing and descriptions
3. **Add-ons**: Toppings and extras with pricing tiers
4. **Currency Standardization**: Converts to USD with proper currency object format

### Example Transformation

**Input (Internal Model)**:
```typescript
{
  name: "Pizza",
  variants: {
    types: [
      {
        name: "Large",
        price: { amount: 15, currency: "USD" }
      }
    ]
  }
}
```

**Output (Core API Format)**:
```json
{
  "name": "Pizza",
  "variants": {
    "name": "Size",
    "types": [
      {
        "name": "Large",
        "price": {
          "currency": {
            "code": "USD",
            "symbol": "$"
          },
          "amount": 15
        }
      }
    ]
  }
}
```

## Error Handling

### Common Error Scenarios

1. **Network Errors**: Connection failures, timeouts
2. **Authentication Errors**: Invalid or expired tokens
3. **Validation Errors**: Missing required fields
4. **API Errors**: Server-side processing failures

### Error Response Format

```json
{
  "success": false,
  "error": "Detailed error message"
}
```

## Usage Example

### In React Components

```typescript
import { useSaveProducts } from '@/hooks/use-save-products';

function ProductReviewPage() {
  const { saveProducts, isSaving, error, lastResult } = useSaveProducts();

  const handleSave = async () => {
    const result = await saveProducts(products);
    
    if (result.success) {
      // Handle success
      console.log('Products saved successfully');
    } else {
      // Handle error
      console.error('Failed to save:', result.error);
    }
  };

  return (
    <button 
      onClick={handleSave} 
      disabled={isSaving}
    >
      {isSaving ? 'Saving...' : 'Save Products'}
    </button>
  );
}
```

### Direct Service Usage

```typescript
import { coreApiService } from '@/services/core-api-service';

const result = await coreApiService.saveProducts(products);
```

## Testing

### Unit Tests

Run the test suite to verify functionality:

```bash
npm test core-api-service
```

### Test Coverage

The test suite covers:
- Successful product saves
- Error handling scenarios
- Data transformation accuracy
- API communication patterns

## Security Considerations

1. **Environment Variables**: Store sensitive configuration in `.env.local`
2. **Token Management**: Ensure JWT tokens are valid and not expired
3. **Input Validation**: Validate all product data before sending to API
4. **Error Logging**: Log errors without exposing sensitive information

## Troubleshooting

### Common Issues

1. **Configuration Errors**: Check environment variables are set correctly
2. **Authentication Failures**: Verify JWT token is valid and not expired
3. **Network Issues**: Ensure core API server is accessible
4. **Data Format Errors**: Validate product data structure

### Debug Steps

1. Check browser console for error messages
2. Verify environment variables in `.env.local`
3. Test core API endpoint directly with curl
4. Review network tab for failed requests

## Future Enhancements

1. **Retry Logic**: Implement automatic retry for failed requests
2. **Batch Processing**: Support for large product sets
3. **Progress Tracking**: Real-time save progress updates
4. **Offline Support**: Queue saves when offline
5. **Rate Limiting**: Respect API rate limits 