import { CoreApiService } from '../services/core-api-service';

// Mock environment variables
const mockEnv = {
  CORE_API_BASE_URL: 'http://127.0.0.1:9091',
  CORE_API_BUSINESS_ID: 'BIZ_a67s3214986ca6',
  CORE_API_AUTH_TOKEN: 'test-token'
};

// Mock fetch globally
global.fetch = jest.fn();

describe('CoreApiService', () => {
  let service: CoreApiService;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock environment variables
    Object.defineProperty(process.env, 'CORE_API_BASE_URL', {
      value: mockEnv.CORE_API_BASE_URL,
      writable: true
    });
    Object.defineProperty(process.env, 'CORE_API_BUSINESS_ID', {
      value: mockEnv.CORE_API_BUSINESS_ID,
      writable: true
    });
    Object.defineProperty(process.env, 'CORE_API_AUTH_TOKEN', {
      value: mockEnv.CORE_API_AUTH_TOKEN,
      writable: true
    });

    service = new CoreApiService();
  });

  describe('saveProducts', () => {
    it('should successfully save products', async () => {
      const mockProducts = [
        {
          name: 'Test Product',
          description: 'Test Description',
          categories: ['Test Category'],
          tags: ['test'],
          images: ['http://example.com/image.jpg'],
          variants: {
            name: 'Size',
            types: [
              {
                name: 'Small',
                price: { amount: 10, currency: 'USD' },
                description: 'Small size'
              }
            ]
          },
          addOns: [
            {
              name: 'Toppings',
              mandatory: false,
              maxSelectionsAllowed: 2,
              types: [
                {
                  name: 'Cheese',
                  description: 'Extra cheese',
                  subTypes: [
                    {
                      name: 'Single',
                      price: { amount: 1, currency: 'USD' },
                      sku: 'CHEESE-001'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ];

      const mockResponse = { success: true, message: 'Products saved' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await service.saveProducts(mockProducts);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Products saved successfully');
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/products/save',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ products: expect.any(Array) })
        }
      );
    });

    it('should handle API errors', async () => {
      const mockProducts = [{ name: 'Test Product' }];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ message: 'Invalid data' })
      });

      const result = await service.saveProducts(mockProducts);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Core API error: 400');
    });

    it('should handle network errors', async () => {
      const mockProducts = [{ name: 'Test Product' }];

      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await service.saveProducts(mockProducts);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('product transformation', () => {
    it('should transform products correctly for core API', async () => {
      const mockProducts = [
        {
          name: 'Test Product',
          description: 'Test Description',
          categories: ['Test Category'],
          tags: ['test'],
          images: ['http://example.com/image.jpg'],
          variants: {
            name: 'Size',
            types: [
              {
                name: 'Small',
                price: { amount: 10, currency: 'USD' },
                description: 'Small size',
                sku: 'SMALL-001'
              }
            ]
          },
          addOns: [
            {
              name: 'Toppings',
              mandatory: false,
              maxSelectionsAllowed: 2,
              types: [
                {
                  name: 'Cheese',
                  description: 'Extra cheese',
                  subTypes: [
                    {
                      name: 'Single',
                      price: { amount: 1, currency: 'USD' },
                      sku: 'CHEESE-001'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      await service.saveProducts(mockProducts);

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);
      
      expect(requestBody.products[0]).toEqual({
        name: 'Test Product',
        description: 'Test Description',
        categories: ['Test Category'],
        tags: ['test'],
        images: ['http://example.com/image.jpg'],
        variants: {
          name: 'Size',
          types: [
            {
              name: 'Small',
              price: {
                currency: { code: 'USD', symbol: '$' },
                amount: 10
              },
              description: 'Small size',
              sku: 'SMALL-001'
            }
          ]
        },
        addOns: [
          {
            name: 'Toppings',
            mandatory: false,
            maxSelectionsAllowed: 2,
            types: [
              {
                name: 'Cheese',
                description: 'Extra cheese',
                subTypes: [
                  {
                    name: 'Single',
                    price: {
                      currency: { code: 'USD', symbol: '$' },
                      amount: 1
                    },
                    sku: 'CHEESE-001'
                  }
                ]
              }
            ]
          }
        ]
      });
    });
  });
}); 