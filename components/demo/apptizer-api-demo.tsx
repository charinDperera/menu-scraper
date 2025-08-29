"use client";

import { useState } from 'react';
import { useApptizerApi } from '@/hooks/use-apptizer-api';
import { BulkUploadRequest } from '@/types/product-model';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ApptizerApiDemo() {
  const { uploadProducts, getProducts, isLoading, error, clearError } = useApptizerApi();
  const [result, setResult] = useState<any>(null);

  // Sample data for testing
  const sampleBulkRequest: BulkUploadRequest = {
    products: [
      {
        name: "Margherita Pizza",
        description: "Classic tomato and mozzarella pizza",
        price: 12.99,
        categoryNames: ["Pizza"],
        addonGroupNames: ["Toppings"],
        taxPercentage: 8.5,
        taxNames: ["Sales Tax"],
        images: [],
        thumbnailImages: [],
        isActive: true,
        isActiveForKiosk: true,
        isActiveForOrderAhead: true,
        isActiveForWebstore: true,
        isActiveForDigitalDining: true,
        isActiveForPOSRegister: true,
        videoUrls: [],
        rating: 4.5,
        tags: ["vegetarian", "classic"]
      }
    ],
    categories: [
      {
        name: "Pizza",
        isActive: true,
        isActiveForKiosk: true,
        isActiveForOrderAhead: true,
        isActiveForWebstore: true,
        isActiveForDigitalDining: true,
        isActiveForPOSRegister: true,
        description: "Italian pizza varieties"
      }
    ],
    taxes: [
      {
        name: "Sales Tax",
        taxLevel: "state",
        rate: 8.5
      }
    ],
    addonGroups: [
      {
        name: "Toppings",
        description: "Additional pizza toppings",
        isActive: true,
        isMultiSelectable: true,
        minSelectionsRequired: 0,
        maxSelectionsAllowed: 5,
        addonTypes: [
          {
            name: "Extra Cheese",
            price: 1.50,
            isActive: true,
            isDefaultSelected: false
          }
        ]
      }
    ]
  };

  const handleUpload = async () => {
    try {
      clearError();
      const response = await uploadProducts(sampleBulkRequest);
      setResult(response);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleGetProducts = async () => {
    try {
      clearError();
      const response = await getProducts();
      setResult(response);
    } catch (err) {
      console.error('Get products failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Apptizer API Demo</CardTitle>
          <CardDescription>
            This demonstrates the equivalent of your curl command using the Apptizer service
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={handleUpload} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Uploading...' : 'Upload Sample Products'}
            </Button>
            
            <Button 
              onClick={handleGetProducts} 
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading ? 'Loading...' : 'Get Products'}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="space-y-2">
              <Label>API Response:</Label>
              <Textarea
                value={JSON.stringify(result, null, 2)}
                readOnly
                rows={10}
                className="font-mono text-sm"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Curl Equivalent</CardTitle>
          <CardDescription>
            This is what the service is doing behind the scenes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-4 rounded-lg">
            <code className="text-sm">
              curl --location 'http://dev.apptizer.io:9091/mgmt/internal/businesses/&#123;businessId&#125;/products/bulk-upload' \<br/>
              --header 'Content-Type: application/json' \<br/>
              --header 'X-Merchant-Id: test5org1' \<br/>
              --data '{JSON.stringify(sampleBulkRequest, null, 2)}'
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 