"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Edit2, Trash2, Save, Upload, Brain, Tag, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { ProcessingResult, BulkProduct, BulkCategory, BulkTax, BulkAddonGroup } from "@/types/product-model"

interface ExtractedProduct extends BulkProduct {
  id: string; // Add an id for React keys
}

// Function to map LLM BulkProduct to ExtractedProduct with generated ID
function mapLLMProductToExtractedProduct(llmProduct: BulkProduct, index: number): ExtractedProduct {
  return {
    ...llmProduct,
    id: `product-${Date.now()}-${index}`,
  }
}

export default function MenuReviewPage() {
  const router = useRouter()
  const [editingProduct, setEditingProduct] = useState<ExtractedProduct | null>(null)
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
  const [extractedProducts, setExtractedProducts] = useState<ExtractedProduct[]>([])
  const [llmResult, setLlmResult] = useState<ProcessingResult | null>(null)
  const [originalFileInfo, setOriginalFileInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'products' | 'categories' | 'taxes' | 'addons'>('products')

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
        
        // Map LLM products to extracted products
        const mappedProducts = result.products.map((product: BulkProduct, index: number) => 
          mapLLMProductToExtractedProduct(product, index)
        )
        setExtractedProducts(mappedProducts)
        
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
    console.log("Saving products:", extractedProducts)
    // Here you would typically send the data to your API
    // For now, we'll just redirect back with success
    router.push("/?success=true")
  }

  const handleEditProduct = (product: ExtractedProduct) => {
    setEditingProduct({ ...product })
    setIsProductDialogOpen(true)
  }

  const handleSaveProduct = () => {
    if (!editingProduct) return

    setExtractedProducts((prev) => prev.map((product) => (product.id === editingProduct.id ? editingProduct : product)))
    setIsProductDialogOpen(false)
    setEditingProduct(null)
  }

  const handleRemoveProduct = (productId: string) => {
    setExtractedProducts((prev) => prev.filter((product) => product.id !== productId))
  }

  const getProductImage = (product: ExtractedProduct) => {
    if (product.images && product.images.length > 0) return product.images[0]
    if (product.thumbnailImages && product.thumbnailImages.length > 0) return product.thumbnailImages[0]
    return '/placeholder.svg'
  }

  const getAvailabilityBadges = (product: ExtractedProduct) => {
    const badges = []
    if (!product.isActive) badges.push(<Badge key="inactive" variant="destructive">Inactive</Badge>)
    if (!product.isActiveForKiosk) badges.push(<Badge key="kiosk" variant="secondary">No Kiosk</Badge>)
    if (!product.isActiveForWebstore) badges.push(<Badge key="webstore" variant="secondary">No Web</Badge>)
    return badges
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
              Save All Products ({extractedProducts.length})
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

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 border">
            <Button
              variant={selectedTab === 'products' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedTab('products')}
            >
              Products ({llmResult?.products?.length || 0})
            </Button>
            <Button
              variant={selectedTab === 'categories' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedTab('categories')}
            >
              Categories ({llmResult?.categories?.length || 0})
            </Button>
            <Button
              variant={selectedTab === 'taxes' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedTab('taxes')}
            >
              Taxes ({llmResult?.taxes?.length || 0})
            </Button>
            <Button
              variant={selectedTab === 'addons' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedTab('addons')}
            >
              Add-on Groups ({llmResult?.addonGroups?.length || 0})
            </Button>
          </div>

          {/* Products Tab */}
          {selectedTab === 'products' && (
            <div className="grid gap-6">
              {extractedProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <CardHeader className="bg-gray-50 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={getProductImage(product)}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                          {product.alternativeName && (
                            <p className="text-sm text-gray-500">{product.alternativeName}</p>
                          )}
                          {product.description && (
                            <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">${product.price.toFixed(2)}</Badge>
                        {product.taxPercentage > 0 && (
                          <Badge variant="outline">Tax: {product.taxPercentage}%</Badge>
                        )}
                        {getAvailabilityBadges(product)}
                        <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveProduct(product.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Categories */}
                      {product.categoryNames && product.categoryNames.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                            <Tag className="w-4 h-4 mr-2" />
                            Categories
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {product.categoryNames.map((category, index) => (
                              <Badge key={index} variant="outline">{category}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Variants */}
                      {product.variant && (
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">Variants: {product.variant.variantName}</h4>
                          <div className="space-y-2">
                            {product.variant.variantTypes.map((variantType, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <span className="font-medium">{variantType.name}</span>
                                  {variantType.description && (
                                    <span className="text-sm text-gray-500 ml-2">({variantType.description})</span>
                                  )}
                                </div>
                                <span className="text-lg font-semibold text-green-600">
                                  ${variantType.price.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Add-on Groups */}
                      {product.addonGroupNames && product.addonGroupNames.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">Add-on Groups</h4>
                          <div className="flex flex-wrap gap-2">
                            {product.addonGroupNames.map((addonGroup, index) => (
                              <Badge key={index} variant="secondary">{addonGroup}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {product.tags && product.tags.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {product.tags.map((tag, index) => (
                              <Badge key={index} variant="outline">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Images */}
                      {(product.images?.length > 0 || product.thumbnailImages?.length > 0) && (
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                            <ImageIcon className="w-4 h-4 mr-2" />
                            Images
                          </h4>
                          <div className="flex space-x-2">
                            {product.images?.map((image, index) => (
                              <div key={index} className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                                <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                            {product.thumbnailImages?.map((image, index) => (
                              <div key={`thumb-${index}`} className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                                <img src={image} alt={`${product.name} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {extractedProducts.length === 0 && (
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
          )}

          {/* Categories Tab */}
          {selectedTab === 'categories' && (
            <div className="grid gap-4">
              {llmResult?.categories?.map((category, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        {category.description && <p className="text-sm text-gray-500">{category.description}</p>}
                        {category.parentCategoryName && (
                          <p className="text-xs text-gray-400">Parent: {category.parentCategoryName}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Badge variant={category.isActive ? "default" : "secondary"}>
                          {category.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant={category.isActiveForWebstore ? "outline" : "secondary"}>
                          {category.isActiveForWebstore ? "Web" : "No Web"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Taxes Tab */}
          {selectedTab === 'taxes' && (
            <div className="grid gap-4">
              {llmResult?.taxes?.map((tax, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{tax.name}</h3>
                        <p className="text-sm text-gray-500">Level: {tax.taxLevel}</p>
                      </div>
                      <Badge variant="outline">{tax.rate}%</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Add-ons Tab */}
          {selectedTab === 'addons' && (
            <div className="grid gap-4">
              {llmResult?.addonGroups?.map((group, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{group.name}</h3>
                          {group.description && <p className="text-sm text-gray-500">{group.description}</p>}
                        </div>
                        <div className="flex space-x-2">
                          <Badge variant={group.isActive ? "default" : "secondary"}>
                            {group.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant={group.isMultiSelectable ? "outline" : "secondary"}>
                            {group.isMultiSelectable ? "Multi" : "Single"}
                          </Badge>
                        </div>
                      </div>
                      
                      {group.addonTypes && group.addonTypes.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Add-on Types:</h4>
                          <div className="space-y-2">
                            {group.addonTypes.map((addon, addonIndex) => (
                              <div key={addonIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span className="text-sm">{addon.name}</span>
                                <span className="text-sm font-medium">${addon.price.toFixed(2)}</span>
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
              {/* Basic Information */}
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
                  <Label htmlFor="price">Base Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number.parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxPercentage">Tax Percentage</Label>
                  <Input
                    id="taxPercentage"
                    type="number"
                    step="0.1"
                    value={editingProduct.taxPercentage}
                    onChange={(e) => setEditingProduct({ ...editingProduct, taxPercentage: Number.parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <Label htmlFor="categories">Categories (comma-separated)</Label>
                <Input
                  id="categories"
                  value={editingProduct.categoryNames.join(', ')}
                  onChange={(e) => setEditingProduct({ 
                    ...editingProduct, 
                    categoryNames: e.target.value.split(',').map(cat => cat.trim()).filter(cat => cat)
                  })}
                  placeholder="Appetizers, Starters"
                />
              </div>

              {/* Availability Flags */}
              <div className="space-y-4">
                <Label>Availability Settings</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={editingProduct.isActive}
                      onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, isActive: checked })}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActiveForKiosk"
                      checked={editingProduct.isActiveForKiosk}
                      onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, isActiveForKiosk: checked })}
                    />
                    <Label htmlFor="isActiveForKiosk">Available for Kiosk</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActiveForWebstore"
                      checked={editingProduct.isActiveForWebstore}
                      onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, isActiveForWebstore: checked })}
                    />
                    <Label htmlFor="isActiveForWebstore">Available for Webstore</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActiveForOrderAhead"
                      checked={editingProduct.isActiveForOrderAhead}
                      onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, isActiveForOrderAhead: checked })}
                    />
                    <Label htmlFor="isActiveForOrderAhead">Available for Order Ahead</Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
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