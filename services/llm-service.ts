import { ProcessingResult, Product } from '@/types/product-model';

export interface LLMProcessingRequest {
  rawText: string;
  sourceFile: string;
  fileType: string;
}

export interface LLMProcessingResponse {
  success: boolean;
  products: Product[];
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
- **Nutritional information (calories, fat, protein, carbs, etc.)**
- **Allergen information and dietary restrictions**
- **Preparation methods and cooking instructions**
- **Ingredient lists and sourcing information**
- **Portion sizes and serving information**

## Output Requirements
Transform the raw text into a structured JSON format with the following structure:

\`\`\`json
{
  "products": [
    {
      "name": "string",
      "description": "string (optional)",
      "categories": ["string array (optional)"],
      "rating": "number (optional)",
      "taxPercentage": "number (optional)",
      "commentsCount": "number (optional)",
      "tags": ["string array (optional)"],
      "additionalInfo": [
        {
          "name": "string",
          "description": "string"
        }
      ],
      "images": ["string array (optional)"],
      "thumbImages": ["string array (optional)"],
      "videoUrls": ["string array (optional)"],
      "deliverable": "boolean (optional)",
      "variants": {
        "name": "string (optional)",
        "alternativeName": "string (optional)",
        "types": [
          {
            "name": "string (optional)",
            "alternativeName": "string (optional)",
            "sku": "string (optional)",
            "price": {
              "amount": "number (optional)",
              "currency": "string (optional)"
            },
            "description": "string (optional)"
          }
        ]
      },
      "addOns": [
        {
          "name": "string",
          "alternativeName": "string (optional)",
          "mandatory": "boolean (optional)",
          "minSelectionsRequired": "number (optional)",
          "maxSelectionsAllowed": "number (optional)",
          "priority": "number (optional)",
          "image": "string (optional)",
          "isActive": "boolean (optional)",
          "isMultiSelectable": "boolean (optional)"
        }
      ],
      "isActive": "boolean (optional)",
      "isAlcoholicProduct": "boolean (optional)",
      "isFeatured": "boolean (optional)",
      "nutritionalInfo": {
        "description": "string (optional)",
        "nutritionalElements": [
          {
            "name": "string (optional)",
            "value": "string (optional)"
          }
        ]
      }
    }
  ]
}
\`\`\`

## Processing Rules

1. **Product Names**: Extract clear, concise product names. Remove unnecessary words like "Fresh", "Homemade", etc. unless they're part of the actual product name.

2. **Variants and Pricing**: 
   - **When size options exist** (e.g., Small, Medium, Large): Create separate variant types with appropriate names and prices
   - **When no size options exist**: Set variant name to "[base]" and variant type name to "[base]"
   - Extract numerical prices only, remove currency symbols
   - Handle price ranges (e.g., "$12-15" → create separate variants or use average)
   - Default currency is USD
   - **Do not set stock quantities or isAutoRestockEnabled unless explicitly provided** - leave these as default values

3. **Categories**: 
   - Extract category information as simple strings in the categories array
   - Use standard category names when possible (Appetizers, Main Courses, Desserts, Beverages, etc.)
   - Don't create complex category hierarchies for this POC

4. **Descriptions**: 
   - Extract key ingredients or preparation methods
   - Keep descriptions concise and informative
   - Remove marketing language unless it describes the actual dish
   - **IMPORTANT**: Look for nutritional information, allergens, and other structured data that might be embedded in descriptions

5. **Nutritional Information Extraction**:
   - **Calories**: Look for patterns like "350 cal", "350 calories", "350 kcal"
   - **Macronutrients**: Extract fat, protein, carbs when available (e.g., "12g protein", "25g fat")
   - **Micronutrients**: Extract vitamins, minerals when mentioned
   - **Serving Information**: Look for portion sizes, weights, dimensions
   - **Allergen Information**: Extract common allergens (nuts, dairy, gluten, etc.)
   - **Dietary Restrictions**: Identify vegetarian, vegan, gluten-free, etc.

6. **Add-ons and Variants Detection**:
   - **Look beyond obvious pricing structures** for add-on information
   - **Scan descriptions and surrounding text** for:
     - Topping options (e.g., "Add mushrooms +$2", "Extra cheese available")
     - Size variations (e.g., "Available in 6", 8", 12" sizes")
     - Preparation options (e.g., "Well done, medium, rare")
     - Sauce choices (e.g., "Choose from: BBQ, Ranch, Honey Mustard")
   - **Create add-on groups** when multiple options are available for the same category

7. **Special Attributes**:
   - Identify alcoholic beverages (set isAlcoholicProduct: true)
   - Note if items are deliverable
   - Identify featured or special items
   - Set isActive to true by default
   - **All active fields default to true**: isActive, activeForKiosk, activeForOrderAhead, activeForOrderAheadWebstore, activeForDigitalDining, activeForPOSRegister
   - **Only set these fields to false if explicitly mentioned** in the menu text (e.g., "not available for delivery", "kiosk disabled", etc.)

8. **Data Quality**:
   - Only include items that are clearly menu products
   - Skip headers, footers, and non-menu content
   - Maintain consistency in naming conventions
   - Handle missing data gracefully (use null/undefined for optional fields)
   - **Extract ALL available information** - don't limit yourself to just obvious fields

## Advanced Extraction Guidelines

1. **Scan Entire Menu Context**: Don't just look at individual product lines - scan surrounding text for:
   - Add-on menus or topping lists
   - Size charts or portion guides
   - Nutritional information tables
   - Allergen disclaimers
   - Preparation instructions

2. **Pattern Recognition**: Look for common patterns:
   - "Add [item] +$[price]"
   - "Available in [size1], [size2], [size3]"
   - "[number] cal", "[number] calories", "[number] kcal"
   - "Contains: [allergen1], [allergen2]"
   - "Gluten-free", "Vegan", "Vegetarian"

3. **Contextual Information**: Use category headers and section dividers to:
   - Infer product categories
   - Understand pricing structures
   - Identify add-on availability
   - Determine dietary restrictions

4. **Data Completeness**: Strive to extract as much structured information as possible:
   - If nutritional info exists, extract it
   - If add-ons are mentioned, create proper add-on structures
   - If variants exist, create proper variant structures
   - If allergens are mentioned, extract them
   - If preparation methods are described, include them

Remember: **Extract ALL available information** - don't just focus on basic product details. Look for nutritional data, allergens, add-ons, variants, and other structured information that might be embedded in descriptions or scattered throughout the menu text.

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
        processingTime,
        model: this.model,
        confidence: 0.85, // Default confidence score
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        products: [],
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

  private parseLLMResponse(responseText: string): { products: Product[] } {
    try {
      // Clean the response text - remove any markdown formatting
      const cleanText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsed = JSON.parse(cleanText);
      
      // Validate and transform the parsed data
      const products = this.validateAndTransformProducts(parsed.products || []);
      
      return { products };
    } catch (error) {
      throw new Error(`Failed to parse LLM response: ${error}`);
    }
  }

  private validateAndTransformProducts(rawProducts: any[]): Product[] {
    return rawProducts.map((product, index) => ({
      productId: product.productId || `product-${Date.now()}-${index}`,
      name: product.name || 'Unknown Product',
      alternativeName: product.alternativeName,
      description: product.description,
      categories: Array.isArray(product.categories) ? product.categories : [],
      categoriesList: Array.isArray(product.categoriesList) ? product.categoriesList : [],
      rating: typeof product.rating === 'number' ? product.rating : undefined,
      taxPercentage: typeof product.taxPercentage === 'number' ? product.taxPercentage : undefined,
      commentsCount: typeof product.commentsCount === 'number' ? product.commentsCount : undefined,
      tags: Array.isArray(product.tags) ? product.tags : [],
      additionalInfo: Array.isArray(product.additionalInfo) ? product.additionalInfo : [],
      images: Array.isArray(product.images) ? product.images : [],
      thumbImages: Array.isArray(product.thumbImages) ? product.thumbImages : [],
      videoUrls: Array.isArray(product.videoUrls) ? product.videoUrls : [],
      deliverable: product.deliverable === true,
      variants: product.variants,
      addOns: Array.isArray(product.addOns) ? product.addOns : [],
      isActive: product.isActive !== false, // Default to true
      activeForKiosk: product.activeForKiosk !== false, // Default to true
      activeForOrderAhead: product.activeForOrderAhead !== false, // Default to true
      activeForOrderAheadWebstore: product.activeForOrderAheadWebstore !== false, // Default to true
      activeForDigitalDining: product.activeForDigitalDining !== false, // Default to true
      activeForPOSRegister: product.activeForPOSRegister !== false, // Default to true
      createdDate: product.createdDate || new Date().toISOString(),
      priority: typeof product.priority === 'number' ? product.priority : undefined,
      taxes: Array.isArray(product.taxes) ? product.taxes : [],
      isAlcoholicProduct: product.isAlcoholicProduct === true,
      isFeatured: product.isFeatured === true,
      nutritionalInfo: product.nutritionalInfo,
      displayDeviceIds: Array.isArray(product.displayDeviceIds) ? product.displayDeviceIds : [],
      isAutoRestockEnabled: product.isAutoRestockEnabled,
    }));
  }
}

// Export singleton instance
export const llmService = new LLMService(); 