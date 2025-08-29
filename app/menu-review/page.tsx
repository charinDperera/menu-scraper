"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Save,
  Upload,
  Brain,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  Star,
  Clock,
  DollarSign,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import type { ProcessingResult, Product, AddOn, AddOnType, AddOnSubType } from "@/types/product-model"

interface OriginalFileInfo {
  fileName: string
  fileType?: string
  fileSize: number
  originalText?: string
}

// Function to map LLM Product to display format
function mapLLMProductToDisplayProduct(llmProduct: Product): Product {
  return {
    ...llmProduct,
    productId: llmProduct.productId || `product-${Date.now()}-${Math.random()}`,
    name: llmProduct.name || "Unknown Product",
    isActive: llmProduct.isActive !== false, // Default to true
    isAlcoholicProduct: llmProduct.isAlcoholicProduct === true,
    deliverable: llmProduct.deliverable === true,
    isFeatured: llmProduct.isFeatured === true,
  }
}

// Helper function to create a new add-on
function createNewAddOn(): AddOn {
  return {
    groupId: `addon-${Date.now()}-${Math.random()}`,
    name: "",
    types: [],
    mandatory: false,
    minSelectionsRequired: 0,
    maxSelectionsAllowed: 1,
    priority: 0,
    isActive: true,
    isMultiSelectable: false,
  }
}

// Helper function to create a new add-on type
function createNewAddOnType(): AddOnType {
  return {
    name: "",
    subTypes: [],
  }
}

// Helper function to create a new add-on sub-type
function createNewAddOnSubType(): AddOnSubType {
  return {
    name: "",
    price: { amount: 0, currency: "USD" },
    defaultSelection: false,
    isActive: true,
  }
}

export default function MenuReviewPage() {
  const router = useRouter()
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [llmResult, setLlmResult] = useState<ProcessingResult | null>(null)
  const [originalFileInfo, setOriginalFileInfo] = useState<OriginalFileInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedAddOns, setExpandedAddOns] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Load LLM processing results from sessionStorage
    const storedResult = sessionStorage.getItem("llmProcessingResult")
    const storedFileInfo = sessionStorage.getItem("originalFileInfo")

    if (storedResult && storedFileInfo) {
      try {
        const result = JSON.parse(storedResult)
        const fileInfo = JSON.parse(storedFileInfo)

        setLlmResult(result)
        setOriginalFileInfo(fileInfo)

        // Map LLM products to display products
        const mappedProducts = result.products.map(mapLLMProductToDisplayProduct)
        setProducts(mappedProducts)

        setIsLoading(false)
      } catch (error) {
        console.error("Error parsing stored data:", error)
        setIsLoading(false)
      }
    } else {
      // No stored data, redirect back to main page
      router.push("/")
    }
  }, [router])

  const handleSaveProducts = () => {
    console.log("Saving products:", products)
    // Here you would typically send the data to your API
    // For now, we'll just redirect back with success
    router.push("/?success=true")
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct({ ...product })
    setIsProductDialogOpen(true)
  }

  const handleSaveProduct = () => {
    if (!editingProduct) return

    setProducts((prev) =>
      prev.map((product) => (product.productId === editingProduct.productId ? editingProduct : product)),
    )
    setIsProductDialogOpen(false)
    setEditingProduct(null)
  }

  const handleRemoveProduct = (productId: string) => {
    setProducts((prev) => prev.filter((product) => product.productId !== productId))
  }

  // Add-on management functions
  const addAddOn = () => {
    if (!editingProduct) return
    const newAddOn = createNewAddOn()
    // Auto-expand new add-ons
    setExpandedAddOns(prev => new Set([...prev, newAddOn.groupId!]))
    setEditingProduct({
      ...editingProduct,
      addOns: [...(editingProduct.addOns || []), newAddOn],
    })
  }

  const removeAddOn = (addOnIndex: number) => {
    if (!editingProduct) return
    const updatedAddOns = editingProduct.addOns?.filter((_, index) => index !== addOnIndex) || []
    setEditingProduct({
      ...editingProduct,
      addOns: updatedAddOns,
    })
  }

  const updateAddOn = (addOnIndex: number, field: keyof AddOn, value: any) => {
    if (!editingProduct) return
    const updatedAddOns = [...(editingProduct.addOns || [])]
    updatedAddOns[addOnIndex] = { ...updatedAddOns[addOnIndex], [field]: value }
    setEditingProduct({
      ...editingProduct,
      addOns: updatedAddOns,
    })
  }

  const addAddOnType = (addOnIndex: number) => {
    if (!editingProduct) return
    const newType = createNewAddOnType()
    const updatedAddOns = [...(editingProduct.addOns || [])]
    updatedAddOns[addOnIndex].types = [...(updatedAddOns[addOnIndex].types || []), newType]
    setEditingProduct({
      ...editingProduct,
      addOns: updatedAddOns,
    })
  }

  const removeAddOnType = (addOnIndex: number, typeIndex: number) => {
    if (!editingProduct) return
    const updatedAddOns = [...(editingProduct.addOns || [])]
    updatedAddOns[addOnIndex].types = updatedAddOns[addOnIndex].types?.filter((_, index) => index !== typeIndex) || []
    setEditingProduct({
      ...editingProduct,
      addOns: updatedAddOns,
    })
  }

  const updateAddOnType = (addOnIndex: number, typeIndex: number, field: keyof AddOnType, value: any) => {
    if (!editingProduct) return
    const updatedAddOns = [...(editingProduct.addOns || [])]
    updatedAddOns[addOnIndex].types![typeIndex] = { ...updatedAddOns[addOnIndex].types![typeIndex], [field]: value }
    setEditingProduct({
      ...editingProduct,
      addOns: updatedAddOns,
    })
  }

  const addAddOnSubType = (addOnIndex: number, typeIndex: number) => {
    if (!editingProduct) return
    const newSubType = createNewAddOnSubType()
    const updatedAddOns = [...(editingProduct.addOns || [])]
    updatedAddOns[addOnIndex].types![typeIndex].subTypes = [
      ...(updatedAddOns[addOnIndex].types![typeIndex].subTypes || []),
      newSubType,
    ]
    setEditingProduct({
      ...editingProduct,
      addOns: updatedAddOns,
    })
  }

  const removeAddOnSubType = (addOnIndex: number, typeIndex: number, subTypeIndex: number) => {
    if (!editingProduct) return
    const updatedAddOns = [...(editingProduct.addOns || [])]
    updatedAddOns[addOnIndex].types![typeIndex].subTypes =
      updatedAddOns[addOnIndex].types![typeIndex].subTypes?.filter((_, index) => index !== subTypeIndex) || []
    setEditingProduct({
      ...editingProduct,
      addOns: updatedAddOns,
    })
  }

  const updateAddOnSubType = (
    addOnIndex: number,
    typeIndex: number,
    subTypeIndex: number,
    field: keyof AddOnSubType,
    value: any,
  ) => {
    if (!editingProduct) return
    const updatedAddOns = [...(editingProduct.addOns || [])]
    updatedAddOns[addOnIndex].types![typeIndex].subTypes![subTypeIndex] = {
      ...updatedAddOns[addOnIndex].types![typeIndex].subTypes![subTypeIndex],
      [field]: value,
    }
    setEditingProduct({
      ...editingProduct,
      addOns: updatedAddOns,
    })
  }

  const toggleAddOnExpansion = (addOnId: string) => {
    const newExpanded = new Set(expandedAddOns)
    if (newExpanded.has(addOnId)) {
      newExpanded.delete(addOnId)
    } else {
      newExpanded.add(addOnId)
    }
    setExpandedAddOns(newExpanded)
  }

  // Variant management functions
  const addVariant = () => {
    if (!editingProduct) return
    const newVariant = {
      name: '',
      description: '',
      price: { amount: 0, currency: 'USD' },
      sku: '',
    }
    setEditingProduct({
      ...editingProduct,
      variants: {
        ...editingProduct.variants,
        types: [...(editingProduct.variants?.types || []), newVariant]
      }
    })
  }

  const removeVariant = (variantIndex: number) => {
    if (!editingProduct) return
    const updatedVariants = editingProduct.variants?.types?.filter((_, index) => index !== variantIndex) || []
    setEditingProduct({
      ...editingProduct,
      variants: {
        ...editingProduct.variants,
        types: updatedVariants
      }
    })
  }

  const updateVariant = (variantIndex: number, field: string, value: any) => {
    if (!editingProduct) return
    const updatedVariants = [...(editingProduct.variants?.types || [])]
    updatedVariants[variantIndex] = { ...updatedVariants[variantIndex], [field]: value }
    setEditingProduct({
      ...editingProduct,
      variants: {
        ...editingProduct.variants,
        types: updatedVariants
      }
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
            <Brain className="w-6 h-6 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Processing Menu Items</h3>
            <p className="text-muted-foreground">AI is extracting and organizing your menu data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Upload
              </Button>
              <div className="space-y-1">
                <h1 className="text-3xl font-bold text-foreground text-balance">Review Extracted Menu Items</h1>
                <p className="text-muted-foreground text-pretty">
                  Review and edit the products extracted from your menu before adding them to your system
                </p>
                {llmResult && (
                  <div className="flex items-center space-x-3 mt-3">
                    <div className="flex items-center space-x-2 px-3 py-1.5 bg-primary/10 rounded-full">
                      <Brain className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-primary">AI Enhanced</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{llmResult.metadata.processingTime}ms</span>
                      </span>
                      <span>{llmResult.metadata.totalProducts} products extracted</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => router.push("/")} className="hover:bg-muted">
                Cancel
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={handleSaveProducts}
              >
                <Save className="w-4 h-4 mr-2" />
                Save All Products ({products.length})
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {originalFileInfo && (
          <Card className="mb-8 border-border shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-foreground">Source:</span>
                    <span className="text-muted-foreground">{originalFileInfo.fileName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-foreground">Type:</span>
                    <Badge variant="secondary">{originalFileInfo.fileType || "Unknown"}</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-foreground">Size:</span>
                    <span className="text-muted-foreground">{Math.round(originalFileInfo.fileSize / 1024)}KB</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-accent/10 rounded-full">
                  <Brain className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium text-accent">AI Enhanced Extraction</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6">
          {products.map((product) => (
            <Card
              key={product.productId}
              className="overflow-hidden border-border shadow-sm hover:shadow-lg transition-all duration-300 group"
            >
              <CardHeader className="bg-card border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative w-20 h-20 bg-muted rounded-xl overflow-hidden shadow-sm">
                      <img
                        src={
                          product.images?.[0] ||
                          product.thumbImages?.[0] ||
                          "/placeholder.svg?height=80&width=80&query=food item"
                        }
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {product.isFeatured && (
                        <div className="absolute top-2 right-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-xl font-bold text-foreground text-balance">{product.name}</CardTitle>
                      {product.alternativeName && (
                        <p className="text-sm text-muted-foreground">{product.alternativeName}</p>
                      )}
                      {product.variants?.types?.[0]?.price && (
                        <div className="flex items-center space-x-1 text-lg font-semibold text-primary">
                          <DollarSign className="w-4 h-4" />
                          <span>{product.variants.types[0].price.amount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {product.taxPercentage && (
                      <Badge variant="outline" className="border-muted-foreground/20">
                        Tax: {product.taxPercentage}%
                      </Badge>
                    )}
                    {product.isAlcoholicProduct && <Badge variant="destructive">Alcoholic</Badge>}
                    {product.isFeatured && (
                      <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">Featured</Badge>
                    )}
                    {product.deliverable && (
                      <Badge className="bg-primary/10 text-primary border-primary/20">Delivery</Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                      className="hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveProduct(product.productId!)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {product.description && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Description</h4>
                    <p className="text-muted-foreground leading-relaxed text-pretty">{product.description}</p>
                  </div>
                )}

                {product.categories && product.categories.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.categories.map((category, index) => (
                        <Badge key={index} variant="outline" className="hover:bg-muted transition-colors">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {product.tags && product.tags.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="hover:bg-secondary/80 transition-colors">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {product.addOns && product.addOns.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">Add-ons</h4>
                    <div className="space-y-3">
                      {product.addOns.map((addOn, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors"
                        >
                          <div className="space-y-1">
                            <span className="font-medium text-foreground">{addOn.name}</span>
                            {addOn.mandatory && (
                              <Badge variant="destructive" className="ml-2">
                                Required
                              </Badge>
                            )}
                          </div>
                          {addOn.types && addOn.types[0]?.subTypes && addOn.types[0].subTypes[0]?.price && (
                            <div className="flex items-center space-x-1 text-primary font-semibold">
                              <Plus className="w-3 h-3" />
                              <DollarSign className="w-3 h-3" />
                              <span>{addOn.types[0].subTypes[0].price.amount}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {product.variants && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">Variants</h4>
                    <div className="space-y-3">
                      {product.variants.types?.map((variantType, index) => (
                        <div
                          key={index}
                          className="border border-border rounded-lg p-4 bg-card hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-foreground">{variantType.name}</span>
                            {variantType.price && (
                              <div className="flex items-center space-x-1 text-lg font-bold text-primary">
                                <DollarSign className="w-4 h-4" />
                                <span>{variantType.price.amount}</span>
                              </div>
                            )}
                          </div>
                          {variantType.description && (
                            <p className="text-sm text-muted-foreground mt-2 text-pretty">{variantType.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-muted rounded-2xl mx-auto mb-8 flex items-center justify-center shadow-sm">
              <Upload className="w-16 h-16 text-muted-foreground" />
            </div>
            <div className="space-y-4 max-w-md mx-auto">
              <h3 className="text-2xl font-bold text-foreground text-balance">No products extracted</h3>
              <p className="text-muted-foreground text-pretty">
                It looks like we couldn't extract any menu items from your file. Please try uploading a different menu
                file with clear product information.
              </p>
              <Button onClick={() => router.push("/")} className="mt-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Upload
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Product Edit Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Product</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-6">
              {/* Basic Product Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alternativeName">Alternative Name</Label>
                  <Input
                    id="alternativeName"
                    value={editingProduct.alternativeName || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, alternativeName: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingProduct.description || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxPercentage">Tax Percentage</Label>
                  <Input
                    id="taxPercentage"
                    type="number"
                    step="0.1"
                    value={editingProduct.taxPercentage || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        taxPercentage: Number.parseFloat(e.target.value) || undefined,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={editingProduct.priority || ""}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, priority: Number.parseInt(e.target.value) || undefined })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="alcoholic">Alcoholic Product</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id="alcoholic"
                      checked={editingProduct.isAlcoholicProduct || false}
                      onCheckedChange={(checked) =>
                        setEditingProduct({ ...editingProduct, isAlcoholicProduct: checked })
                      }
                    />
                    <span className="text-sm text-muted-foreground">
                      {editingProduct.isAlcoholicProduct ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="featured">Featured Product</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id="featured"
                      checked={editingProduct.isFeatured || false}
                      onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, isFeatured: checked })}
                    />
                    <span className="text-sm text-muted-foreground">{editingProduct.isFeatured ? "Yes" : "No"}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliverable">Deliverable</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id="deliverable"
                      checked={editingProduct.deliverable || false}
                      onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, deliverable: checked })}
                    />
                    <span className="text-sm text-muted-foreground">{editingProduct.deliverable ? "Yes" : "No"}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="active">Active</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id="active"
                      checked={editingProduct.isActive !== false}
                      onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, isActive: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {editingProduct.isActive !== false ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Variants Configuration */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Variants Configuration</h3>
                  <Button onClick={addVariant} size="sm" className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Variant
                  </Button>
                </div>

                <div className="space-y-4">
                  {editingProduct.variants?.types?.map((variant, variantIndex) => (
                    <Card key={variantIndex} className="border border-border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium">Variant {variantIndex + 1}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVariant(variantIndex)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 p-1 h-6 w-6"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div className="space-y-2">
                            <Label className="text-sm">Variant Name</Label>
                            <Input
                              size={1}
                              value={variant.name || ''}
                              onChange={(e) => updateVariant(variantIndex, 'name', e.target.value)}
                              placeholder="e.g., Small, Medium, Large"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Price</Label>
                            <Input
                              size={1}
                              type="number"
                              step="0.01"
                              min="0"
                              value={variant.price?.amount || 0}
                              onChange={(e) => updateVariant(variantIndex, 'price', { 
                                amount: Number.parseFloat(e.target.value) || 0, 
                                currency: 'USD' 
                              })}
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm">SKU</Label>
                          <Input
                            size={1}
                            value={variant.sku || ''}
                            onChange={(e) => updateVariant(variantIndex, 'sku', e.target.value)}
                            placeholder="Optional SKU"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm">Description</Label>
                          <Input
                            size={1}
                            value={variant.description || ''}
                            onChange={(e) => updateVariant(variantIndex, 'description', e.target.value)}
                            placeholder="Optional description"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Add-ons Configuration */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Add-ons Configuration</h3>
                  <Button onClick={addAddOn} size="sm" className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Add-on Group
                  </Button>
                </div>

                <div className="space-y-4">
                  {editingProduct.addOns?.map((addOn, addOnIndex) => (
                    <Card key={addOn.groupId} className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleAddOnExpansion(addOn.groupId!)}
                              className="p-1 h-6 w-6"
                            >
                              {expandedAddOns.has(addOn.groupId!) ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </Button>
                            <span className="font-medium">Add-on Group {addOnIndex + 1}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAddOn(addOnIndex)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 p-1 h-6 w-6"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>

                      {expandedAddOns.has(addOn.groupId!) && (
                        <CardContent className="space-y-4">
                          {/* Add-on Group Details */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Group Name</Label>
                              <Input
                                value={addOn.name}
                                onChange={(e) => updateAddOn(addOnIndex, "name", e.target.value)}
                                placeholder="e.g., Toppings, Size, Extras"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Alternative Name</Label>
                              <Input
                                value={addOn.alternativeName || ""}
                                onChange={(e) => updateAddOn(addOnIndex, "alternativeName", e.target.value)}
                                placeholder="Optional alternative name"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Min Selections</Label>
                              <Input
                                type="number"
                                min="0"
                                value={addOn.minSelectionsRequired || 0}
                                onChange={(e) =>
                                  updateAddOn(addOnIndex, "minSelectionsRequired", Number.parseInt(e.target.value) || 0)
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Max Selections</Label>
                              <Input
                                type="number"
                                min="1"
                                value={addOn.maxSelectionsAllowed || 1}
                                onChange={(e) =>
                                  updateAddOn(addOnIndex, "maxSelectionsAllowed", Number.parseInt(e.target.value) || 1)
                                }
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Priority</Label>
                              <Input
                                type="number"
                                value={addOn.priority || 0}
                                onChange={(e) =>
                                  updateAddOn(addOnIndex, "priority", Number.parseInt(e.target.value) || 0)
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Active</Label>
                              <div className="flex items-center space-x-2 pt-2">
                                <Switch
                                  checked={addOn.isActive !== false}
                                  onCheckedChange={(checked) => updateAddOn(addOnIndex, "isActive", checked)}
                                />
                                <span className="text-sm text-muted-foreground">
                                  {addOn.isActive !== false ? "Yes" : "No"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Mandatory</Label>
                              <div className="flex items-center space-x-2 pt-2">
                                <Switch
                                  checked={addOn.mandatory || false}
                                  onCheckedChange={(checked) => updateAddOn(addOnIndex, "mandatory", checked)}
                                />
                                <span className="text-sm text-muted-foreground">{addOn.mandatory ? "Yes" : "No"}</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Multi-Selectable</Label>
                              <div className="flex items-center space-x-2 pt-2">
                                <Switch
                                  checked={addOn.isMultiSelectable || false}
                                  onCheckedChange={(checked) => updateAddOn(addOnIndex, "isMultiSelectable", checked)}
                                />
                                <span className="text-sm text-muted-foreground">
                                  {addOn.isMultiSelectable ? "Yes" : "No"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Add-on Types */}
                          <div className="border-t pt-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium">Add-on Types</h4>
                              <Button onClick={() => addAddOnType(addOnIndex)} size="sm" variant="outline">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Type
                              </Button>
                            </div>

                            <div className="space-y-3">
                              {addOn.types?.map((type, typeIndex) => (
                                <div key={typeIndex} className="border rounded-lg p-3 bg-muted/50">
                                  <div className="flex items-center justify-between mb-3">
                                    <span className="font-medium">Type {typeIndex + 1}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeAddOnType(addOnIndex, typeIndex)}
                                      className="text-destructive hover:text-destructive hover:bg-destructive/10 p-1 h-6 w-6"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div className="space-y-1">
                                      <Label className="text-sm">Type Name</Label>
                                      <Input
                                        size={1}
                                        value={type.name || ""}
                                        onChange={(e) => updateAddOnType(addOnIndex, typeIndex, "name", e.target.value)}
                                        placeholder="e.g., Small, Medium, Large"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-sm">Alternative Name</Label>
                                      <Input
                                        size={1}
                                        value={type.alternativeName || ""}
                                        onChange={(e) =>
                                          updateAddOnType(addOnIndex, typeIndex, "alternativeName", e.target.value)
                                        }
                                        placeholder="Optional alternative name"
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-1 mb-3">
                                    <Label className="text-sm">Description</Label>
                                    <Input
                                      size={1}
                                      value={type.description || ""}
                                      onChange={(e) =>
                                        updateAddOnType(addOnIndex, typeIndex, "description", e.target.value)
                                      }
                                      placeholder="Optional description"
                                    />
                                  </div>

                                  {/* Add-on Sub-Types */}
                                  <div className="border-t pt-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <h5 className="text-sm font-medium">Sub-Types</h5>
                                      <Button
                                        onClick={() => addAddOnSubType(addOnIndex, typeIndex)}
                                        size="sm"
                                        variant="ghost"
                                      >
                                        <Plus className="w-3 h-3 mr-1" />
                                        Add Sub-Type
                                      </Button>
                                    </div>

                                    <div className="space-y-2">
                                      {type.subTypes?.map((subType, subTypeIndex) => (
                                        <div key={subTypeIndex} className="border rounded p-2 bg-card">
                                          <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium">Sub-Type {subTypeIndex + 1}</span>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => removeAddOnSubType(addOnIndex, typeIndex, subTypeIndex)}
                                              className="text-destructive hover:text-destructive hover:bg-destructive/10 p-1 h-4 w-4"
                                            >
                                              <X className="w-3 h-3" />
                                            </Button>
                                          </div>

                                          <div className="grid grid-cols-2 gap-2 mb-2">
                                            <div className="space-y-1">
                                              <Label className="text-xs">Name</Label>
                                              <Input
                                                size={1}
                                                value={subType.name || ""}
                                                onChange={(e) =>
                                                  updateAddOnSubType(
                                                    addOnIndex,
                                                    typeIndex,
                                                    subTypeIndex,
                                                    "name",
                                                    e.target.value,
                                                  )
                                                }
                                                placeholder="e.g., Extra Cheese"
                                              />
                                            </div>
                                            <div className="space-y-1">
                                              <Label className="text-xs">Price</Label>
                                              <Input
                                                size={1}
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={subType.price?.amount || 0}
                                                onChange={(e) =>
                                                  updateAddOnSubType(addOnIndex, typeIndex, subTypeIndex, "price", {
                                                    amount: Number.parseFloat(e.target.value) || 0,
                                                    currency: "USD",
                                                  })
                                                }
                                                placeholder="0.00"
                                              />
                                            </div>
                                          </div>

                                          <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                              <Label className="text-xs">SKU</Label>
                                              <Input
                                                size={1}
                                                value={subType.sku || ""}
                                                onChange={(e) =>
                                                  updateAddOnSubType(
                                                    addOnIndex,
                                                    typeIndex,
                                                    subTypeIndex,
                                                    "sku",
                                                    e.target.value,
                                                  )
                                                }
                                                placeholder="Optional SKU"
                                              />
                                            </div>
                                            <div className="space-y-1">
                                              <Label className="text-xs">Default Selection</Label>
                                              <div className="flex items-center space-x-2 pt-1">
                                                <Switch
                                                  checked={subType.defaultSelection || false}
                                                  onCheckedChange={(checked) =>
                                                    updateAddOnSubType(
                                                      addOnIndex,
                                                      typeIndex,
                                                      subTypeIndex,
                                                      "defaultSelection",
                                                      checked,
                                                    )
                                                  }
                                                />
                                                <span className="text-xs text-muted-foreground">
                                                  {subType.defaultSelection ? "Yes" : "No"}
                                                </span>
                                              </div>
                                            </div>
                                          </div>

                                          <div className="space-y-1 mt-2">
                                            <Label className="text-xs">Description</Label>
                                            <Input
                                              size={1}
                                              value={subType.description || ""}
                                              onChange={(e) =>
                                                updateAddOnSubType(
                                                  addOnIndex,
                                                  typeIndex,
                                                  subTypeIndex,
                                                  "description",
                                                  e.target.value,
                                                )
                                              }
                                              placeholder="Optional description"
                                            />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 border-t pt-6">
                <Button variant="outline" onClick={() => setIsProductDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProduct} className="bg-primary hover:bg-primary/90">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
