import { ProcessingResult, MenuProduct, MenuCategory } from '@/types/product-model';

export interface LLMProcessingRequest {
  rawText: string;
  sourceFile: string;
  fileType: string;
}

export interface LLMProcessingResponse {
  success: boolean;
  products: MenuProduct[];
  categories: MenuCategory[];
  processingTime: number;
  model: string;
  confidence: number;
  error?: string;
}

export class LLMService {
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private metaPrompt: string | null = null;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
    this.baseUrl = process.env.NEXT_PUBLIC_OPENAI_API_BASE_URL || 'https://api.openai.com/v1';
    this.model = process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-4o-mini';
    
    if (!this.apiKey) {
      throw new Error('NEXT_PUBLIC_OPENAI_API_KEY environment variable is required');
    }
  }

  private async loadMetaPrompt(): Promise<string> {
    if (this.metaPrompt) {
      return this.metaPrompt;
    }

    try {
      const response = await fetch('/prompts/meta-prompt.md');
      if (!response.ok) {
        throw new Error(`Failed to load meta prompt: ${response.status}`);
      }
      this.metaPrompt = await response.text();
      return this.metaPrompt;
    } catch (error) {
      // Fallback to embedded prompt if file loading fails
      console.warn('Failed to load meta prompt file, using fallback:', error);
      this.metaPrompt = this.getFallbackPrompt();
      return this.metaPrompt;
    }
  }

  private getFallbackPrompt(): string {
    return `# Menu Data Processing Meta Prompt

You are an expert menu data processor. Your task is to analyze raw text extracted from menu images or PDFs and convert it into structured, normalized menu data.

## Input
You will receive raw text extracted from menu documents. This text may contain:
- Menu items with names, descriptions, and prices
- Category headers and section dividers
- Special offers, notes, or disclaimers
- Pricing variations and add-ons

## Output Requirements
Transform the raw text into a structured JSON format with the following structure:

\`\`\`json
{
  "products": [
    {
      "name": "string",
      "description": "string (optional)",
      "price": "number",
      "currency": "string (default: USD)",
      "category": "string",
      "subcategory": "string (optional)",
      "isAvailable": "boolean",
      "isAlcoholic": "boolean",
      "allergens": ["string array (optional)"],
      "dietaryInfo": ["string array (optional)"],
      "ingredients": ["string array (optional)"],
      "tags": ["string array (optional)"]
    }
  ],
  "categories": [
    {
      "name": "string",
      "description": "string (optional)"
    }
  ]
}
\`\`\`

## Processing Rules

1. **Product Names**: Extract clear, concise product names. Remove unnecessary words like "Fresh", "Homemade", etc. unless they're part of the actual product name.

2. **Prices**: 
   - Extract numerical prices only
   - Handle price ranges (e.g., "$12-15" → use average or lowest price)
   - Remove currency symbols and convert to numbers
   - Default currency is USD

3. **Categories**: 
   - Group similar items into logical categories
   - Use standard category names when possible (Appetizers, Main Courses, Desserts, Beverages, etc.)
   - Create subcategories for better organization

4. **Descriptions**: 
   - Extract key ingredients or preparation methods
   - Keep descriptions concise and informative
   - Remove marketing language unless it describes the actual dish

5. **Special Attributes**:
   - Identify alcoholic beverages (set isAlcoholic: true)
   - Detect common allergens (nuts, dairy, gluten, shellfish, etc.)
   - Note dietary restrictions (vegetarian, vegan, gluten-free, etc.)

6. **Data Quality**:
   - Only include items that are clearly menu products
   - Skip headers, footers, and non-menu content
   - Maintain consistency in naming conventions
   - Handle missing data gracefully (use null/undefined for optional fields)

Return only the JSON response, no additional text or explanations.`;
  }

  async processMenuData(request: LLMProcessingRequest): Promise<LLMProcessingResponse> {
    const startTime = Date.now();

    try {
      const systemPrompt = await this.loadMetaPrompt();
      const userPrompt = `Please process the following menu text and return a valid JSON response according to the specified format:

Raw Text:
${request.rawText}

Source File: ${request.sourceFile}
File Type: ${request.fileType}

Return only the JSON response, no additional text or explanations.`;

      const response = await this.callOpenAI(systemPrompt, userPrompt);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to get response from OpenAI');
      }

      const parsedData = this.parseLLMResponse(response.data);
      
      const processingTime = Date.now() - startTime;

      return {
        success: true,
        products: parsedData.products || [],
        categories: parsedData.categories || [],
        processingTime,
        model: this.model,
        confidence: 0.85, // Default confidence score
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        products: [],
        categories: [],
        processingTime,
        model: this.model,
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private async callOpenAI(systemPrompt: string, userPrompt: string) {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: userPrompt,
            },
          ],
          temperature: 0.1, // Low temperature for consistent, structured output
          max_tokens: 4000,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      return {
        success: true,
        data: content,
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to call OpenAI API',
      };
    }
  }

  private parseLLMResponse(responseText: string): { products: MenuProduct[]; categories: MenuCategory[] } {
    try {
      // Clean the response text - remove any markdown formatting
      const cleanText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsed = JSON.parse(cleanText);
      
      // Validate and transform the parsed data
      const products = this.validateAndTransformProducts(parsed.products || []);
      const categories = this.validateAndTransformCategories(parsed.categories || []);
      
      return { products, categories };
    } catch (error) {
      throw new Error(`Failed to parse LLM response: ${error}`);
    }
  }

  private validateAndTransformProducts(rawProducts: any[]): MenuProduct[] {
    return rawProducts.map((product, index) => ({
      id: product.id || `product-${Date.now()}-${index}`,
      name: product.name || 'Unknown Product',
      alternativeName: product.alternativeName,
      description: product.description,
      price: this.parsePrice(product.price),
      currency: product.currency || 'USD',
      category: product.category || 'Uncategorized',
      subcategory: product.subcategory,
      image: product.image,
      isAvailable: product.isAvailable !== false, // Default to true
      isAlcoholic: product.isAlcoholic === true,
      allergens: Array.isArray(product.allergens) ? product.allergens : [],
      dietaryInfo: Array.isArray(product.dietaryInfo) ? product.dietaryInfo : [],
      preparationTime: product.preparationTime,
      spiceLevel: product.spiceLevel,
      servingSize: product.servingSize,
      calories: product.calories,
      ingredients: Array.isArray(product.ingredients) ? product.ingredients : [],
      variants: product.variants || [],
      addOns: product.addOns || [],
      tags: Array.isArray(product.tags) ? product.tags : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  private validateAndTransformCategories(rawCategories: any[]): MenuCategory[] {
    return rawCategories.map((category, index) => ({
      id: category.id || `category-${Date.now()}-${index}`,
      name: category.name || 'Unknown Category',
      alternativeName: category.alternativeName,
      description: category.description,
      image: category.image,
      sortOrder: category.sortOrder || index,
      isActive: category.isActive !== false, // Default to true
      parentCategoryId: category.parentCategoryId,
      subcategories: category.subcategories || [],
    }));
  }

  private parsePrice(price: any): number {
    if (typeof price === 'number') return price;
    if (typeof price === 'string') {
      // Remove currency symbols and non-numeric characters
      const cleanPrice = price.replace(/[^\d.-]/g, '');
      const parsed = parseFloat(cleanPrice);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }
}

// Export singleton instance
export const llmService = new LLMService(); 