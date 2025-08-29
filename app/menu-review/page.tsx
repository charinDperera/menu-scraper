"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Edit2, Trash2, Save, Upload, Brain, Plus, X, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { ProcessingResult, Product, AddOn, AddOnType, AddOnSubType, Price } from "@/types/product-model"

interface OriginalFileInfo {
  fileName: string;
  fileType?: string;
  fileSize: number;
  originalText?: string;
}

// Function to map LLM Product to display format
function mapLLMProductToDisplayProduct(llmProduct: Product): Product {
  return {
    ...llmProduct,
    productId: llmProduct.productId || `product-${Date.now()}-${Math.random()}`,
    name: llmProduct.name || 'Unknown Product',
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
    name: '',
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
    name: '',
    subTypes: [],
  }
}

// Helper function to create a new add-on sub-type
function createNewAddOnSubType(): AddOnSubType {
  return {
    name: '',
    price: { amount: 0, currency: 'USD' },
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
    const storedResult = sessionStorage.getItem('llmProcessingResult')
    const storedFileInfo = sessionStorage.getItem('originalFileInfo')
    
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
        console.error('Error parsing stored data:', error)
        setIsLoading(false)
      }
    } else {
      // No stored data, redirect back to main page
      router.push('/')
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

    setProducts((prev) => prev.map((product) => (product.productId === editingProduct.productId ? editingProduct : product)))
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
    setEditingProduct({
      ...editingProduct,
      addOns: [...(editingProduct.addOns || []), newAddOn]
    })
  }

  const removeAddOn = (addOnIndex: number) => {
    if (!editingProduct) return
    const updatedAddOns = editingProduct.addOns?.filter((_, index) => index !== addOnIndex) || []
    setEditingProduct({
      ...editingProduct,
      addOns: updatedAddOns
    })
  }

  const updateAddOn = (addOnIndex: number, field: keyof AddOn, value: any) => {
    if (!editingProduct) return
    const updatedAddOns = [...(editingProduct.addOns || [])]
    updatedAddOns[addOnIndex] = { ...updatedAddOns[addOnIndex], [field]: value }
    setEditingProduct({
      ...editingProduct,
      addOns: updatedAddOns
    })
  }

  const addAddOnType = (addOnIndex: number) => {
    if (!editingProduct) return
    const newType = createNewAddOnType()
    const updatedAddOns = [...(editingProduct.addOns || [])]
    updatedAddOns[addOnIndex].types = [...(updatedAddOns[addOnIndex].types || []), newType]
    setEditingProduct({
      ...editingProduct,
      addOns: updatedAddOns
    })
  }

  const removeAddOnType = (addOnIndex: number, typeIndex: number) => {
    if (!editingProduct) return
    const updatedAddOns = [...(editingProduct.addOns || [])]
    updatedAddOns[addOnIndex].types = updatedAddOns[addOnIndex].types?.filter((_, index) => index !== typeIndex) || []
    setEditingProduct({
      ...editingProduct,
      addOns: updatedAddOns
    })
  }

  const updateAddOnType = (addOnIndex: number, typeIndex: number, field: keyof AddOnType, value: any) => {
    if (!editingProduct) return
    const updatedAddOns = [...(editingProduct.addOns || [])]
    updatedAddOns[addOnIndex].types![typeIndex] = { ...updatedAddOns[addOnIndex].types![typeIndex], [field]: value }
    setEditingProduct({
      ...editingProduct,
      addOns: updatedAddOns
    })
  }

  const addAddOnSubType = (addOnIndex: number, typeIndex: number) => {
    if (!editingProduct) return
    const newSubType = createNewAddOnSubType()
    const updatedAddOns = [...(editingProduct.addOns || [])]
    updatedAddOns[addOnIndex].types![typeIndex].subTypes = [...(updatedAddOns[addOnIndex].types![typeIndex].subTypes || []), newSubType]
    setEditingProduct({
      ...editingProduct,
      addOns: updatedAddOns
    })
  }

  const removeAddOnSubType = (addOnIndex: number, typeIndex: number, subTypeIndex: number) => {
    if (!editingProduct) return
    const updatedAddOns = [...(editingProduct.addOns || [])]
    updatedAddOns[addOnIndex].types![typeIndex].subTypes = updatedAddOns[addOnIndex].types![typeIndex].subTypes?.filter((_, index) => index !== subTypeIndex) || []
    setEditingProduct({
      ...editingProduct,
      addOns: updatedAddOns
    })
  }

  const updateAddOnSubType = (addOnIndex: number, typeIndex: number, subTypeIndex: number, field: keyof AddOnSubType, value: any) => {
    if (!editingProduct) return
    const updatedAddOns = [...(editingProduct.addOns || [])]
    updatedAddOns[addOnIndex].types![typeIndex].subTypes![subTypeIndex] = { 
      ...updatedAddOns[addOnIndex].types![typeIndex].subTypes![subTypeIndex], 
      [field]: value 
    }
    setEditingProduct({
      ...editingProduct,
      addOns: updatedAddOns
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading extracted products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()} className="text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Upload
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Review Extracted Menu Items</h1>
              <p className="text-sm text-gray-500 mt-1">
                Review and edit the products extracted from your menu before adding them
              </p>
              {llmResult && (
                <div className="flex items-center space-x-2 mt-2">
                  <Brain className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-blue-600">
                    AI processed • {llmResult.metadata.totalProducts} products • {llmResult.metadata.processingTime}ms
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => router.push('/')}>
              Cancel
            </Button>
            <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={handleSaveProducts}>
              <Save className="w-4 h-4 mr-2" />
              Save All Products ({products.length})
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* File Info Summary */}
          {originalFileInfo && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <span><strong>Source:</strong> {originalFileInfo.fileName}</span>
                    <span><strong>Type:</strong> {originalFileInfo.fileType || 'Unknown'}</span>
                    <span><strong>Size:</strong> {Math.round(originalFileInfo.fileSize / 1024)}KB</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-blue-600" />
                    <span>AI Enhanced Extraction</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6">
            {products.map((product) => (
              <Card key={product.productId} className="overflow-hidden">
                <CardHeader className="bg-gray-50 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={product.images?.[0] || product.thumbImages?.[0] || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        {product.alternativeName && (
                          <p className="text-sm text-gray-500">{product.alternativeName}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {product.taxPercentage && (
                        <Badge variant="secondary">Tax: {product.taxPercentage}%</Badge>
                      )}
                      {product.isAlcoholicProduct && <Badge variant="destructive">Alcoholic</Badge>}
                      {product.isFeatured && <Badge variant="secondary">Featured</Badge>}
                      {product.deliverable && <Badge variant="secondary">Delivery</Badge>}
                      <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveProduct(product.productId!)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    {product.description && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Description</h4>
                        <p className="text-gray-600">{product.description}</p>
                      </div>
                    )}

                    {product.categories && product.categories.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Categories</h4>
                        <div className="flex flex-wrap gap-2">
                          {product.categories.map((category, index) => (
                            <Badge key={index} variant="outline">{category}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {product.tags && product.tags.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {product.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {product.addOns && product.addOns.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Add-ons</h4>
                        <div className="space-y-2">
                          {product.addOns.map((addOn, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded border"
                            >
                              <div>
                                <span className="font-medium">{addOn.name}</span>
                                {addOn.mandatory && (
                                  <Badge variant="destructive" className="ml-2">Required</Badge>
                                )}
                              </div>
                              {addOn.types && addOn.types[0]?.subTypes && addOn.types[0].subTypes[0]?.price && (
                                <span className="text-green-600 font-medium">
                                  +${addOn.types[0].subTypes[0].price.amount}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {product.variants && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Variants</h4>
                        <div className="space-y-2">
                          {product.variants.types?.map((variantType, index) => (
                            <div key={index} className="border rounded-lg p-3 bg-gray-50">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{variantType.name}</span>
                                {variantType.price && (
                                  <span className="text-lg font-semibold text-green-600">
                                    ${variantType.price.amount}
                                  </span>
                                )}
                              </div>
                              {variantType.description && (
                                <p className="text-sm text-gray-600 mt-1">{variantType.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-lg mx-auto mb-6 flex items-center justify-center">
                <Upload className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">No products extracted</h3>
              <p className="text-gray-500 mb-6">Please go back and upload a menu file to extract products.</p>
              <Button onClick={() => router.push('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Upload
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Product Edit Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
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
                    value={editingProduct.alternativeName || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, alternativeName: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingProduct.description || ''}
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
                    value={editingProduct.taxPercentage || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, taxPercentage: Number.parseFloat(e.target.value) || undefined })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={editingProduct.priority || ''}
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
                    <span className="text-sm text-gray-600">{editingProduct.isAlcoholicProduct ? "Yes" : "No"}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="featured">Featured Product</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id="featured"
                      checked={editingProduct.isFeatured || false}
                      onCheckedChange={(checked) =>
                        setEditingProduct({ ...editingProduct, isFeatured: checked })
                      }
                    />
                    <span className="text-sm text-gray-600">{editingProduct.isFeatured ? "Yes" : "No"}</span>
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
                      onCheckedChange={(checked) =>
                        setEditingProduct({ ...editingProduct, deliverable: checked })
                      }
                    />
                    <span className="text-sm text-gray-600">{editingProduct.deliverable ? "Yes" : "No"}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="active">Active</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id="active"
                      checked={editingProduct.isActive !== false}
                      onCheckedChange={(checked) =>
                        setEditingProduct({ ...editingProduct, isActive: checked })
                      }
                    />
                    <span className="text-sm text-gray-600">{editingProduct.isActive !== false ? "Yes" : "No"}</span>
                  </div>
                </div>
              </div>

              {/* Add-ons Configuration */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Add-ons Configuration</h3>
                  <Button onClick={addAddOn} size="sm" className="bg-blue-500 hover:bg-blue-600">
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
                            className="text-red-600 hover:text-red-800 p-1 h-6 w-6"
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
                                onChange={(e) => updateAddOn(addOnIndex, 'name', e.target.value)}
                                placeholder="e.g., Toppings, Size, Extras"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Alternative Name</Label>
                              <Input
                                value={addOn.alternativeName || ''}
                                onChange={(e) => updateAddOn(addOnIndex, 'alternativeName', e.target.value)}
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
                                onChange={(e) => updateAddOn(addOnIndex, 'minSelectionsRequired', Number.parseInt(e.target.value) || 0)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Max Selections</Label>
                              <Input
                                type="number"
                                min="1"
                                value={addOn.maxSelectionsAllowed || 1}
                                onChange={(e) => updateAddOn(addOnIndex, 'maxSelectionsAllowed', Number.parseInt(e.target.value) || 1)}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Priority</Label>
                              <Input
                                type="number"
                                value={addOn.priority || 0}
                                onChange={(e) => updateAddOn(addOnIndex, 'priority', Number.parseInt(e.target.value) || 0)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Active</Label>
                              <div className="flex items-center space-x-2 pt-2">
                                <Switch
                                  checked={addOn.isActive !== false}
                                  onCheckedChange={(checked) => updateAddOn(addOnIndex, 'isActive', checked)}
                                />
                                <span className="text-sm text-gray-600">{addOn.isActive !== false ? "Yes" : "No"}</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Mandatory</Label>
                              <div className="flex items-center space-x-2 pt-2">
                                <Switch
                                  checked={addOn.mandatory || false}
                                  onCheckedChange={(checked) => updateAddOn(addOnIndex, 'mandatory', checked)}
                                />
                                <span className="text-sm text-gray-600">{addOn.mandatory ? "Yes" : "No"}</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Multi-Selectable</Label>
                              <div className="flex items-center space-x-2 pt-2">
                                <Switch
                                  checked={addOn.isMultiSelectable || false}
                                  onCheckedChange={(checked) => updateAddOn(addOnIndex, 'isMultiSelectable', checked)}
                                />
                                <span className="text-sm text-gray-600">{addOn.isMultiSelectable ? "Yes" : "No"}</span>
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
                                <div key={typeIndex} className="border rounded-lg p-3 bg-gray-50">
                                  <div className="flex items-center justify-between mb-3">
                                    <span className="font-medium">Type {typeIndex + 1}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeAddOnType(addOnIndex, typeIndex)}
                                      className="text-red-600 hover:text-red-800 p-1 h-6 w-6"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div className="space-y-1">
                                      <Label className="text-sm">Type Name</Label>
                                      <Input
                                        size={1}
                                        value={type.name || ''}
                                        onChange={(e) => updateAddOnType(addOnIndex, typeIndex, 'name', e.target.value)}
                                        placeholder="e.g., Small, Medium, Large"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-sm">Alternative Name</Label>
                                      <Input
                                        size={1}
                                        value={type.alternativeName || ''}
                                        onChange={(e) => updateAddOnType(addOnIndex, typeIndex, 'alternativeName', e.target.value)}
                                        placeholder="Optional alternative name"
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-1 mb-3">
                                    <Label className="text-sm">Description</Label>
                                    <Input
                                      size={1}
                                      value={type.description || ''}
                                      onChange={(e) => updateAddOnType(addOnIndex, typeIndex, 'description', e.target.value)}
                                      placeholder="Optional description"
                                    />
                                  </div>

                                  {/* Add-on Sub-Types */}
                                  <div className="border-t pt-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <h5 className="text-sm font-medium">Sub-Types</h5>
                                      <Button onClick={() => addAddOnSubType(addOnIndex, typeIndex)} size="sm" variant="ghost">
                                        <Plus className="w-3 h-3 mr-1" />
                                        Add Sub-Type
                                      </Button>
                                    </div>

                                    <div className="space-y-2">
                                      {type.subTypes?.map((subType, subTypeIndex) => (
                                        <div key={subTypeIndex} className="border rounded p-2 bg-white">
                                          <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium">Sub-Type {subTypeIndex + 1}</span>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => removeAddOnSubType(addOnIndex, typeIndex, subTypeIndex)}
                                              className="text-red-600 hover:text-red-800 p-1 h-4 w-4"
                                            >
                                              <X className="w-3 h-3" />
                                            </Button>
                                          </div>

                                          <div className="grid grid-cols-2 gap-2 mb-2">
                                            <div className="space-y-1">
                                              <Label className="text-xs">Name</Label>
                                              <Input
                                                size={1}
                                                value={subType.name || ''}
                                                onChange={(e) => updateAddOnSubType(addOnIndex, typeIndex, subTypeIndex, 'name', e.target.value)}
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
                                                onChange={(e) => updateAddOnSubType(addOnIndex, typeIndex, subTypeIndex, 'price', { 
                                                  amount: Number.parseFloat(e.target.value) || 0, 
                                                  currency: 'USD' 
                                                })}
                                                placeholder="0.00"
                                              />
                                            </div>
                                          </div>

                                          <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                              <Label className="text-xs">SKU</Label>
                                              <Input
                                                size={1}
                                                value={subType.sku || ''}
                                                onChange={(e) => updateAddOnSubType(addOnIndex, typeIndex, subTypeIndex, 'sku', e.target.value)}
                                                placeholder="Optional SKU"
                                              />
                                            </div>
                                            <div className="space-y-1">
                                              <Label className="text-xs">Default Selection</Label>
                                              <div className="flex items-center space-x-2 pt-1">
                                                <Switch
                                                  checked={subType.defaultSelection || false}
                                                  onCheckedChange={(checked) => updateAddOnSubType(addOnIndex, typeIndex, subTypeIndex, 'defaultSelection', checked)}
                                                />
                                                <span className="text-xs text-gray-600">{subType.defaultSelection ? "Yes" : "No"}</span>
                                              </div>
                                            </div>
                                          </div>

                                          <div className="space-y-1 mt-2">
                                            <Label className="text-xs">Description</Label>
                                            <Input
                                              size={1}
                                              value={subType.description || ''}
                                              onChange={(e) => updateAddOnSubType(addOnIndex, typeIndex, subTypeIndex, 'description', e.target.value)}
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
                <Button onClick={handleSaveProduct} className="bg-green-500 hover:bg-green-600">
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
