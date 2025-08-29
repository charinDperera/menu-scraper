// Simplified Product Model for Menu Scraper POC

export interface CreateProducts {
  products: Product[];
}

export interface Product {
  productId?: string;
  name: string;
  alternativeName?: string;
  description?: string;
  categories?: string[];
  categoriesList?: Category[];
  rating?: number;
  taxPercentage?: number;
  commentsCount?: number;
  tags?: string[];
  additionalInfo?: ProductAdditionalInfo[];
  images?: string[];
  thumbImages?: string[];
  videoUrls?: string[];
  deliverable?: boolean;
  variants?: Variant;
  addOns?: AddOn[];
  isActive?: boolean;
  activeForKiosk?: boolean;
  activeForOrderAhead?: boolean;
  activeForOrderAheadWebstore?: boolean;
  activeForDigitalDining?: boolean;
  activeForPOSRegister?: boolean;
  createdDate?: string;
  priority?: number;
  taxes?: TaxItem[];
  isAlcoholicProduct?: boolean;
  isFeatured?: boolean;
  nutritionalInfo?: NutritionalInfo;
  displayDeviceIds?: string[];
  isAutoRestockEnabled?: boolean;
}

export interface Category {
  categoryId?: string;
  name: string;
  itemsCount?: number;
  image?: string;
  priority?: number;
  isActive?: boolean;
  activeForKiosk?: boolean;
  activeForOrderAhead?: boolean;
  activeForOrderAheadWebstore?: boolean;
  activeForDigitalDining?: boolean;
  activeForPOSRegister?: boolean;
  createdDate?: string;
  businessId?: string;
  product?: Product;
  parentCategoryId?: string;
  description?: string;
  additionalInfo?: AdditionalInfo[];
  displayDeviceIds?: string[];
  visibilityGroups?: DurationVisibility[];
}

export interface NutritionalInfo {
  description?: string;
  nutritionalElements?: NutritionalElement[];
}

export interface NutritionalElement {
  name?: string;
  value?: string;
}

export interface TaxItem {
  id?: string;
  name: string;
  taxLevel: string;
  rate: string;
  restrictedCollectionMethods?: string[];
  dependsOnTaxIds?: string[];
  isIncludedInPrice?: boolean;
  isDefault?: boolean;
}

export interface AddOn {
  groupId?: string;
  name: string;
  types?: AddOnType[];
  mandatory?: boolean;
  minSelectionsRequired?: number;
  maxSelectionsAllowed?: number;
  priority?: number;
  image?: string;
  isActive?: boolean;
  isMultiSelectable?: boolean;
  alternativeName?: string;
}

export interface AddOnType {
  name?: string;
  alternativeName?: string;
  description?: string;
  subTypes?: AddOnSubType[];
  image?: string;
}

export interface AddOnSubType {
  name?: string;
  alternativeName?: string;
  sku?: string;
  price?: Price;
  description?: string;
  defaultSelection?: boolean;
  displaySku?: string;
  image?: string;
  isActive?: boolean;
  thirdPartyAddonId?: string;
}

export interface Variant {
  name?: string;
  alternativeName?: string;
  types?: VariantType[];
}

export interface VariantType {
  name?: string;
  alternativeName?: string;
  sku?: string;
  price?: Price;
  description?: string;
  durationGroupPrices?: DurationGroup[];
  promotionalPrice?: PromotionalPrice;
  disabledGroups?: DurationGroup[];
  displaySku?: string;
  inventoryDetails?: Stocks;
}

export interface ProductAdditionalInfo {
  name?: string;
  description?: string;
}

export interface AdditionalInfo {
  name?: string;
  description?: string;
}

export interface Price {
  amount?: number;
  currency?: string;
}

export interface DurationGroup {
  id?: string;
  name?: string;
  price?: Price;
}

export interface PromotionalPrice {
  price?: Price;
  validFrom?: string;
  validTo?: string;
}

export interface Stocks {
  quantity?: number;
  lowStockThreshold?: number;
}

export interface DurationVisibility {
  id?: string;
  name?: string;
  isVisible?: boolean;
}

// Processing Result for the POC
export interface ProcessingResult {
  success: boolean;
  products: Product[];
  metadata: ProcessingMetadata;
}

export interface ProcessingMetadata {
  totalProducts: number;
  processingTime: number;
  sourceFile: string;
  fileType: string;
  timestamp: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
} 
