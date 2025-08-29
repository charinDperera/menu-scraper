"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Edit2, Trash2, Save, Upload, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"
import { ProcessingResult, Product } from "@/types/product-model"

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

export default function MenuReviewPage() {
  const router = useRouter()
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [llmResult, setLlmResult] = useState<ProcessingResult | null>(null)
  const [originalFileInfo, setOriginalFileInfo] = useState<OriginalFileInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-6">
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
                <Input
                  id="description"
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
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
