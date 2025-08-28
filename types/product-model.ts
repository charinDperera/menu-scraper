// Core Product Model for Menu Scraper System

export interface MenuProduct {
  id: string;
  name: string;
  alternativeName?: string;
  description?: string;
  price: number;
  currency: string;
  category: string;
  subcategory?: string;
  image?: string;
  isAvailable: boolean;
  isAlcoholic: boolean;
  allergens?: string[];
  dietaryInfo?: string[];
  preparationTime?: number; // in minutes
  spiceLevel?: number; // 1-5 scale
  servingSize?: string;
  calories?: number;
  ingredients?: string[];
  variants?: ProductVariant[];
  addOns?: AddOn[];
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  name: string;
  alternativeName?: string;
  price: number;
  isAvailable: boolean;
  description?: string;
  image?: string;
  attributes?: Record<string, string | number | boolean>;
}

export interface AddOn {
  id: string;
  name: string;
  alternativeName?: string;
  type: string;
  subType?: string;
  price: number;
  isAvailable: boolean;
  isRequired: boolean;
  maxQuantity?: number;
  priority: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  alternativeName?: string;
  description?: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
  parentCategoryId?: string;
  subcategories?: MenuCategory[];
}

export interface MenuSection {
  id: string;
  name: string;
  description?: string;
  products: MenuProduct[];
  sortOrder: number;
  isVisible: boolean;
}

export interface Menu {
  id: string;
  name: string;
  description?: string;
  restaurantId: string;
  restaurantName: string;
  sections: MenuSection[];
  categories: MenuCategory[];
  currency: string;
  language: string;
  version: string;
  isActive: boolean;
  validFrom: Date;
  validTo?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScrapedProductData {
  rawText: string;
  extractedData: Partial<MenuProduct>;
  confidence: number;
  source: 'ocr' | 'ai' | 'manual';
  processingMetadata: {
    processingTime: number;
    model: string;
    version: string;
    timestamp: Date;
  };
}

export interface ProcessingResult {
  success: boolean;
  products: MenuProduct[];
  errors: ProcessingError[];
  metadata: ProcessingMetadata;
}

export interface ProcessingError {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  productId?: string;
  rawData?: string;
}

export interface ProcessingMetadata {
  totalProducts: number;
  successfulProducts: number;
  failedProducts: number;
  processingTime: number;
  sourceFile: string;
  fileSize: number;
  fileType: string;
  timestamp: Date;
}

// Utility types for form handling and validation
export interface ProductFormData {
  name: string;
  price: string;
  category: string;
  description?: string;
  isAvailable: boolean;
  isAlcoholic: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
} 