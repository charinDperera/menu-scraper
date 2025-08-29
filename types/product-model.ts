// Bulk Upload Product Model for Menu Scraper System

export interface BulkUploadRequest {
  products: BulkProduct[];
  categories: BulkCategory[];
  taxes: BulkTax[];
  addonGroups: BulkAddonGroup[];
}

export interface BulkProduct {
  name: string;
  alternativeName?: string;
  description?: string;
  price: number;
  categoryNames: string[];
  variant?: BulkVariant;
  addonGroupNames: string[];
  taxPercentage: number;
  taxNames: string[];
  images: string[];
  thumbnailImages: string[];
  isActive: boolean;
  isActiveForKiosk: boolean;
  isActiveForOrderAhead: boolean;
  isActiveForWebstore: boolean;
  isActiveForDigitalDining: boolean;
  isActiveForPOSRegister: boolean;
  videoUrls: string[];
  rating: number;
  tags: string[];
  displaySku?: string;
}

export interface BulkVariant {
  variantName: string;
  variantTypes: BulkVariantType[];
  variantAlternativeName?: string;
}

export interface BulkVariantType {
  name: string;
  alternativeName?: string;
  price: number;
  description?: string;
  displaySku?: string;
}

export interface BulkCategory {
  name: string;
  isActive: boolean;
  isActiveForKiosk: boolean;
  isActiveForOrderAhead: boolean;
  isActiveForWebstore: boolean;
  isActiveForDigitalDining: boolean;
  isActiveForPOSRegister: boolean;
  imageUrl?: string;
  parentCategoryName?: string;
  description?: string;
}

export interface BulkTax {
  name: string;
  taxLevel: string;
  rate: number;
}

export interface BulkAddonGroup {
  name: string;
  alternativeName?: string;
  description?: string;
  isActive: boolean;
  isMultiSelectable: boolean;
  minSelectionsRequired: number;
  maxSelectionsAllowed: number;
  imageUrl?: string;
  addonTypes: BulkAddonType[];
}

export interface BulkAddonType {
  name: string;
  alternativeName?: string;
  price: number;
  isActive: boolean;
  isDefaultSelected: boolean;
  imageUrl?: string;
  description?: string;
  displaySku?: string;
  thirdPartyAddonId?: string;
}

// Legacy types for backward compatibility (can be removed later)
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
  preparationTime?: number;
  spiceLevel?: number;
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

// Processing and API types
export interface ScrapedProductData {
  rawText: string;
  extractedData: Partial<BulkProduct>;
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
  products: BulkProduct[];
  categories: BulkCategory[];
  taxes: BulkTax[];
  addonGroups: BulkAddonGroup[];
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
  categoryNames: string[];
  description?: string;
  isActive: boolean;
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