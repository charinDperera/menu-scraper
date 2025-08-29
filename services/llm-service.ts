import { ProcessingResult, BulkProduct, BulkCategory, BulkTax, BulkAddonGroup, BulkVariant } from '@/types/product-model';

export interface LLMProcessingRequest {
  rawText: string;
  sourceFile: string;
  fileType: string;
}

export interface LLMProcessingResponse {
  success: boolean;
  products: BulkProduct[];
  categories: BulkCategory[];
  taxes: BulkTax[];
  addonGroups: BulkAddonGroup[];
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

You are an expert menu data processor. Your task is to analyze raw text extracted from menu images or PDFs and convert it into structured, normalized menu data that matches the complete product model specification.

## Input
You will receive raw text extracted from menu documents. This text may contain:
- Menu items with names, descriptions, and prices
- Product variants (sizes, preparation methods, etc.)
- Add-ons and customization options
- Category headers and section dividers
- Special offers, notes, or disclaimers
- Pricing variations and modifiers

## Output Requirements
Transform the raw text into a structured JSON format with the following structure:

\`\`\`json
{
  "products": [
    {
      "name": "string",
      "alternativeName": "string (optional)",
      "description": "string (optional)",
      "price": "number",
      "categoryNames": ["string array"],
      "variant": {
        "variantName": "string",
        "variantTypes": [
          {
            "name": "string",
            "alternativeName": "string (optional)",
            "price": "number",
            "description": "string (optional)",
            "displaySku": "string (optional)"
          }
        ],
        "variantAlternativeName": "string (optional)"
      },
      "addonGroupNames": ["string array"],
      "taxPercentage": "number",
      "taxNames": ["string array"],
      "images": ["string array"],
      "thumbnailImages": ["string array"],
      "isActive": "boolean (default: true)",
      "isActiveForKiosk": "boolean (default: true)",
      "isActiveForOrderAhead": "boolean (default: true)",
      "isActiveForWebstore": "boolean (default: true)",
      "isActiveForDigitalDining": "boolean (default: true)",
      "isActiveForPOSRegister": "boolean (default: true)",
      "videoUrls": ["string array]",
      "rating": "number (default: 0)",
      "tags": ["string array]"
    }
  ],
  "categories": [
    {
      "name": "string",
      "isActive": "boolean (default: true)",
      "isActiveForKiosk": "boolean (default: true)",
      "isActiveForOrderAhead": "boolean (default: true)",
      "isActiveForWebstore": "boolean (default: true)",
      "isActiveForDigitalDining": "boolean (default: true)",
      "isActiveForPOSRegister": "boolean (default: true)",
      "imageUrl": "string (optional)",
      "parentCategoryName": "string (optional)",
      "description": "string (optional)"
    }
  ],
  "taxes": [
    {
      "name": "string",
      "taxLevel": "string",
      "rate": "number"
    }
  ],
  "addonGroups": [
    {
      "name": "string",
      "alternativeName": "string (optional)",
      "description": "string (optional)",
      "isActive": "boolean (default: true)",
      "isMultiSelectable": "boolean (default: false)",
      "minSelectionsRequired": "number (default: 0)",
      "maxSelectionsAllowed": "number (default: 1)",
      "imageUrl": "string (optional)",
      "addonTypes": [
        {
          "name": "string",
          "alternativeName": "string (optional)",
          "price": "number",
          "isActive": "boolean (default: true)",
          "isDefaultSelected": "boolean (default: false)",
          "imageUrl": "string (optional)",
          "description": "string (optional)",
          "displaySku": "string (optional)",
          "thirdPartyAddonId": "string (optional)"
        }
      ]
    }
  ]
}
\`\`\`

## Processing Rules

### 1. **Product Names & Descriptions**
- Extract clear, concise product names
- Remove unnecessary marketing words like "Fresh", "Homemade", "Delicious" unless they're part of the actual product name
- Extract key ingredients, preparation methods, or distinctive features in descriptions
- Keep descriptions concise and informative

### 2. **Pricing & Variants**
- Extract numerical prices only (remove currency symbols)
- Handle price ranges (e.g., "$12-15" → use average or lowest price)
- **Variants**: Identify different sizes, preparation methods, or styles of the same product
  - Examples: "Small/Large", "Grilled/Fried", "Spicy/Mild"
  - Each variant should have its own price and availability

### 3. **Add-ons & Customizations**
- **Add-ons**: Identify optional extras, toppings, or modifications
  - Examples: "Extra cheese +$2", "Add bacon +$3", "Choose sauce: BBQ, Ranch, Honey Mustard"
  - Set appropriate pricing and availability
  - Mark as required if the menu indicates mandatory choices

### 4. **Categories & Organization**
- Group similar items into logical categories
- Use standard category names when possible (Appetizers, Main Courses, Desserts, Beverages, etc.)
- Create subcategories for better organization
- Maintain consistent naming conventions

### 5. **Special Attributes**
- **Alcoholic**: Set appropriate flags for beer, wine, cocktails, spirits
- **Allergens**: Detect common allergens (nuts, dairy, gluten, shellfish, soy, eggs, etc.)
- **Dietary**: Note restrictions (vegetarian, vegan, gluten-free, dairy-free, etc.)
- **Spice Level**: Assign based on menu descriptions
- **Preparation Time**: Estimate based on complexity or menu notes

### 6. **Data Quality & Validation**
- Only include items that are clearly menu products
- Skip headers, footers, and non-menu content
- Handle missing data gracefully (use appropriate defaults)
- Maintain consistency in naming and categorization
- Flag uncertain data appropriately

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

      console.log('🔍 LLM Processing Request:', {
        sourceFile: request.sourceFile,
        fileType: request.fileType,
        textLength: request.rawText.length,
        textPreview: request.rawText.substring(0, 200) + '...'
      });

      const response = await this.callOpenAI(systemPrompt, userPrompt);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to get response from OpenAI');
      }

      console.log('📡 Raw LLM Response:', response.data);
      console.log('📡 Raw LLM Response Length:', response.data.length);
      
      // Check if response was truncated
      if (response.data.includes('"taxName') || response.data.includes('"taxNames') && !response.data.includes('"taxNames":')) {
        console.warn('⚠️ Response appears to be truncated - some data may be incomplete');
      }

      const parsedData = this.parseLLMResponse(response.data);
      
      console.log('✅ Parsed LLM Data:', {
        products: parsedData.products?.length || 0,
        categories: parsedData.categories?.length || 0,
        taxes: parsedData.taxes?.length || 0,
        addonGroups: parsedData.addonGroups?.length || 0,
        sampleProducts: parsedData.products?.slice(0, 2) || [],
        sampleCategories: parsedData.categories?.slice(0, 2) || []
      });
      
      // Log if we're using salvaged data
      if (parsedData.products.length > 0 && (parsedData.categories.length === 0 && parsedData.taxes.length === 0 && parsedData.addonGroups.length === 0)) {
        console.log('⚠️ Using salvaged partial data - some menu items may be missing or incomplete');
      }
      
      const processingTime = Date.now() - startTime;

      return {
        success: true,
        products: parsedData.products || [],
        categories: parsedData.categories || [],
        taxes: parsedData.taxes || [],
        addonGroups: parsedData.addonGroups || [],
        processingTime,
        model: this.model,
        confidence: 0.85, // Default confidence score
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      console.error('❌ LLM Processing Error:', {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        stack: error instanceof Error ? error.stack : undefined,
        processingTime,
        model: this.model
      });
      
      return {
        success: false,
        products: [],
        categories: [],
        taxes: [],
        addonGroups: [],
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
          max_tokens: 16000, // Increased from 4000 to handle larger menus
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      console.log('📡 OpenAI API Response:', {
        status: response.status,
        model: data.model,
        usage: data.usage,
        finishReason: data.choices?.[0]?.finish_reason
      });
      
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

  private parseLLMResponse(responseText: string): { 
    products: BulkProduct[]; 
    categories: BulkCategory[]; 
    taxes: BulkTax[]; 
    addonGroups: BulkAddonGroup[]; 
  } {
    try {
      console.log('🧹 Cleaning LLM response text...');
      console.log('📝 Original response text:', responseText);
      
      // Clean the response text - remove any markdown formatting
      const cleanText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      console.log('🧹 Cleaned text:', cleanText);
      
      // Check if response appears to be truncated
      if (this.isResponseTruncated(cleanText)) {
        console.warn('⚠️ Response appears to be truncated, attempting to salvage partial data...');
        const salvagedData = this.salvagePartialResponse(cleanText);
        if (salvagedData) {
          console.log('✅ Successfully salvaged partial data from truncated response');
          return salvagedData;
        }
      }
      
      console.log('🔍 Attempting to parse JSON...');
      const parsed = JSON.parse(cleanText);
      console.log('✅ JSON parsed successfully:', parsed);
      
      // Validate and transform the parsed data
      console.log('🔧 Validating and transforming data...');
      const products = this.validateAndTransformProducts(parsed.products || []);
      const categories = this.validateAndTransformCategories(parsed.categories || []);
      const taxes = this.validateAndTransformTaxes(parsed.taxes || []);
      const addonGroups = this.validateAndTransformAddonGroups(parsed.addonGroups || []);
      
      console.log('🎯 Final transformed data counts:', {
        products: products.length,
        categories: categories.length,
        taxes: taxes.length,
        addonGroups: addonGroups.length
      });
      
      return { products, categories, taxes, addonGroups };
    } catch (error) {
      console.error('❌ Error parsing LLM response:', error);
      console.error('❌ Response text that failed to parse:', responseText);
      
      // Try to salvage partial data even if JSON parsing fails
      console.log('🔄 Attempting to salvage data from failed response...');
      const salvagedData = this.salvagePartialResponse(responseText);
      if (salvagedData) {
        console.log('✅ Successfully salvaged partial data despite parsing failure');
        return salvagedData;
      }
      
      throw new Error(`Failed to parse LLM response: ${error}`);
    }
  }

  private validateAndTransformProducts(rawProducts: any[]): BulkProduct[] {
    return rawProducts.map((product, index) => ({
      name: product.name || 'Unknown Product',
      alternativeName: product.alternativeName,
      description: product.description,
      price: this.parsePrice(product.price),
      categoryNames: Array.isArray(product.categoryNames) ? product.categoryNames : ['Uncategorized'],
      variant: product.variant ? this.validateAndTransformVariant(product.variant) : undefined,
      addonGroupNames: Array.isArray(product.addonGroupNames) ? product.addonGroupNames : [],
      taxPercentage: typeof product.taxPercentage === 'number' ? product.taxPercentage : 0,
      taxNames: Array.isArray(product.taxNames) ? product.taxNames : [],
      images: Array.isArray(product.images) ? product.images : [],
      thumbnailImages: Array.isArray(product.thumbnailImages) ? product.thumbnailImages : [],
      isActive: product.isActive !== false,
      isActiveForKiosk: product.isActiveForKiosk !== false,
      isActiveForOrderAhead: product.isActiveForOrderAhead !== false,
      isActiveForWebstore: product.isActiveForWebstore !== false,
      isActiveForDigitalDining: product.isActiveForDigitalDining !== false,
      isActiveForPOSRegister: product.isActiveForPOSRegister !== false,
      videoUrls: Array.isArray(product.videoUrls) ? product.videoUrls : [],
      rating: typeof product.rating === 'number' ? product.rating : 0,
      tags: Array.isArray(product.tags) ? product.tags : [],
      displaySku: product.displaySku,
    }));
  }

  private validateAndTransformVariant(variant: any): BulkVariant {
    return {
      variantName: variant.variantName || 'Default Variant',
      variantTypes: Array.isArray(variant.variantTypes) 
        ? variant.variantTypes.map((type: any) => ({
            name: type.name || 'Unknown Type',
            alternativeName: type.alternativeName,
            price: this.parsePrice(type.price),
            description: type.description,
            displaySku: type.displaySku,
          }))
        : [],
      variantAlternativeName: variant.variantAlternativeName,
    };
  }

  private validateAndTransformCategories(rawCategories: any[]): BulkCategory[] {
    return rawCategories.map((category, index) => ({
      name: category.name || 'Unknown Category',
      isActive: category.isActive !== false,
      isActiveForKiosk: category.isActiveForKiosk !== false,
      isActiveForOrderAhead: category.isActiveForOrderAhead !== false,
      isActiveForWebstore: category.isActiveForWebstore !== false,
      isActiveForDigitalDining: category.isActiveForDigitalDining !== false,
      isActiveForPOSRegister: category.isActiveForPOSRegister !== false,
      imageUrl: category.imageUrl,
      parentCategoryName: category.parentCategoryName,
      description: category.description,
    }));
  }

  private validateAndTransformTaxes(rawTaxes: any[]): BulkTax[] {
    return rawTaxes.map((tax) => ({
      name: tax.name || 'Unknown Tax',
      taxLevel: tax.taxLevel || 'standard',
      rate: typeof tax.rate === 'number' ? tax.rate : 0,
    }));
  }

  private validateAndTransformAddonGroups(rawAddonGroups: any[]): BulkAddonGroup[] {
    return rawAddonGroups.map((group) => ({
      name: group.name || 'Unknown Addon Group',
      alternativeName: group.alternativeName,
      description: group.description,
      isActive: group.isActive !== false,
      isMultiSelectable: group.isMultiSelectable === true,
      minSelectionsRequired: typeof group.minSelectionsRequired === 'number' ? group.minSelectionsRequired : 0,
      maxSelectionsAllowed: typeof group.maxSelectionsAllowed === 'number' ? group.maxSelectionsAllowed : 1,
      imageUrl: group.imageUrl,
      addonTypes: Array.isArray(group.addonTypes) 
        ? group.addonTypes.map((addon: any) => ({
            name: addon.name || 'Unknown Addon',
            alternativeName: addon.alternativeName,
            price: this.parsePrice(addon.price),
            isActive: addon.isActive !== false,
            isDefaultSelected: addon.isDefaultSelected === true,
            imageUrl: addon.imageUrl,
            description: addon.description,
            displaySku: addon.displaySku,
            thirdPartyAddonId: addon.thirdPartyAddonId,
          }))
        : [],
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

  private isResponseTruncated(text: string): boolean {
    // Check for common signs of truncation
    const lastChar = text.trim().slice(-1);
    const hasUnclosedQuotes = (text.match(/"/g) || []).length % 2 !== 0;
    const hasUnclosedBrackets = (text.match(/\{/g) || []).length !== (text.match(/\}/g) || []).length;
    const hasUnclosedSquareBrackets = (text.match(/\[/g) || []).length !== (text.match(/\]/g) || []).length;
    const endsWithComma = text.trim().endsWith(',');
    const endsWithIncompleteString = text.trim().endsWith('"') && !text.trim().endsWith('",');
    
    return hasUnclosedQuotes || hasUnclosedBrackets || hasUnclosedSquareBrackets || 
           endsWithComma || endsWithIncompleteString || lastChar === ',';
  }

  private salvagePartialResponse(text: string): { 
    products: BulkProduct[]; 
    categories: BulkCategory[]; 
    taxes: BulkTax[]; 
    addonGroups: BulkAddonGroup[]; 
  } | null {
    try {
      console.log('🔄 Attempting to salvage partial response...');
      
      // Try to find complete product objects
      const productMatches = text.match(/\{[^}]*"name"\s*:\s*"[^"]*"[^}]*\}/g) || [];
      const products: BulkProduct[] = [];
      
      for (const match of productMatches) {
        try {
          // Try to complete the object by adding missing closing braces
          let completedMatch = match;
          let braceCount = (match.match(/\{/g) || []).length;
          let closeBraceCount = (match.match(/\}/g) || []).length;
          
          // Add missing closing braces
          while (braceCount > closeBraceCount) {
            completedMatch += '}';
            closeBraceCount++;
          }
          
          // Try to parse the completed product
          const productData = JSON.parse(completedMatch);
          if (productData.name) {
            const product = this.validateAndTransformProducts([productData])[0];
            if (product) {
              products.push(product);
            }
          }
        } catch (e) {
          console.warn('⚠️ Failed to salvage product:', match, e);
        }
      }
      
      console.log(`🔄 Salvaged ${products.length} products from truncated response`);
      
      // Return salvaged data (even if incomplete)
      return {
        products,
        categories: [],
        taxes: [],
        addonGroups: []
      };
      
    } catch (error) {
      console.error('❌ Failed to salvage partial response:', error);
      return null;
    }
  }
}

// Export singleton instance
export const llmService = new LLMService(); 