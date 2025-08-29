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
import { ProcessingResult, MenuProduct } from "@/types/product-model"

interface AddOn {
  addOnName: string
  addOnTypeName: string
  addOnSubTypeName: string
  addOnPrice: number
  priority: number
}

interface ProductVariant {
  variantId: string
  variantName: string
  variantPrice: number
  addOns: AddOn[]
}

interface ExtractedProduct {
  id: string
  productName: string
  productAlternativeName: string
  image: string
  variants: ProductVariant[]
  taxPercentage: number
  isAlcoholicProduct: boolean
}

// Function to map LLM MenuProduct to ExtractedProduct
function mapLLMProductToExtractedProduct(llmProduct: MenuProduct): ExtractedProduct {
  return {
    id: llmProduct.id,
    productName: llmProduct.name,
    productAlternativeName: llmProduct.alternativeName || '',
    image: llmProduct.image || '/placeholder.svg',
    variants: [
      {
        variantId: `${llmProduct.id}-main`,
        variantName: 'Standard',
        variantPrice: llmProduct.price,
        addOns: (llmProduct.addOns || []).map((addon, index) => ({
          addOnName: addon.name,
          addOnTypeName: addon.type,
          addOnSubTypeName: addon.subType || '',
          addOnPrice: addon.price,
          priority: addon.priority,
        })),
      },
    ],
    taxPercentage: 8.5, // Default tax rate
    isAlcoholicProduct: llmProduct.isAlcoholic,
  }
}

export default function MenuReviewPage() {
  const router = useRouter()
  const [editingProduct, setEditingProduct] = useState<ExtractedProduct | null>(null)
  const [editingVariant, setEditingVariant] = useState<{ productId: string; variant: ProductVariant } | null>(null)
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
  const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false)
  const [extractedProducts, setExtractedProducts] = useState<ExtractedProduct[]>([])
  const [llmResult, setLlmResult] = useState<ProcessingResult | null>(null)
  const [originalFileInfo, setOriginalFileInfo] = useState<any>(null)
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
        
        // Map LLM products to extracted products
        const mappedProducts = result.products.map(mapLLMProductToExtractedProduct)
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

  const handleEditVariant = (productId: string, variant: ProductVariant) => {
    setEditingVariant({ productId, variant: { ...variant } })
    setIsVariantDialogOpen(true)
  }

  const handleSaveVariant = () => {
    if (!editingVariant) return

    setExtractedProducts((prev) =>
      prev.map((product) =>
        product.id === editingVariant.productId
          ? {
              ...product,
              variants: product.variants.map((v) =>
                v.variantId === editingVariant.variant.variantId ? editingVariant.variant : v,
              ),
            }
          : product,
      ),
    )
    setIsVariantDialogOpen(false)
    setEditingVariant(null)
  }

  const handleRemoveProduct = (productId: string) => {
    setExtractedProducts((prev) => prev.filter((product) => product.id !== productId))
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

          <div className="grid gap-6">
            {extractedProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{product.productName}</CardTitle>
                        {product.productAlternativeName && (
                          <p className="text-sm text-gray-500">{product.productAlternativeName}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">Tax: {product.taxPercentage}%</Badge>
                      {product.isAlcoholicProduct && <Badge variant="destructive">Alcoholic</Badge>}
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
                    <h4 className="font-medium text-gray-800">Variants & Pricing</h4>
                    {product.variants.map((variant) => (
                      <div key={variant.variantId} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{variant.variantName}</span>
                              <span className="text-lg font-semibold text-green-600">
                                ${variant.variantPrice.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditVariant(product.id, variant)}
                            className="ml-2"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {variant.addOns.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Add-ons</h5>
                            <div className="space-y-2">
                              {variant.addOns.map((addOn, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between text-sm bg-white p-2 rounded border"
                                >
                                  <div>
                                    <span className="font-medium">{addOn.addOnName}</span>
                                    <span className="text-gray-500 ml-2">({addOn.addOnTypeName})</span>
                                  </div>
                                  <span className="text-green-600 font-medium">+${addOn.addOnPrice.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

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
                    value={editingProduct.productName}
                    onChange={(e) => setEditingProduct({ ...editingProduct, productName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alternativeName">Alternative Name</Label>
                  <Input
                    id="alternativeName"
                    value={editingProduct.productAlternativeName}
                    onChange={(e) => setEditingProduct({ ...editingProduct, productAlternativeName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxPercentage">Tax Percentage</Label>
                  <Input
                    id="taxPercentage"
                    type="number"
                    step="0.1"
                    value={editingProduct.taxPercentage}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, taxPercentage: Number.parseFloat(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alcoholic">Alcoholic Product</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id="alcoholic"
                      checked={editingProduct.isAlcoholicProduct}
                      onCheckedChange={(checked) =>
                        setEditingProduct({ ...editingProduct, isAlcoholicProduct: checked })
                      }
                    />
                    <span className="text-sm text-gray-600">{editingProduct.isAlcoholicProduct ? "Yes" : "No"}</span>
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

      {/* Variant Edit Dialog */}
      <Dialog open={isVariantDialogOpen} onOpenChange={setIsVariantDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Variant</DialogTitle>
          </DialogHeader>
          {editingVariant && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="variantName">Variant Name</Label>
                  <Input
                    id="variantName"
                    value={editingVariant.variant.variantName}
                    onChange={(e) =>
                      setEditingVariant({
                        ...editingVariant,
                        variant: { ...editingVariant.variant, variantName: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="variantPrice">Price</Label>
                  <Input
                    id="variantPrice"
                    type="number"
                    step="0.01"
                    value={editingVariant.variant.variantPrice}
                    onChange={(e) =>
                      setEditingVariant({
                        ...editingVariant,
                        variant: { ...editingVariant.variant, variantPrice: Number.parseFloat(e.target.value) },
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Add-ons</Label>
                {editingVariant.variant.addOns.map((addOn, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 p-3 border rounded-lg">
                    <Input
                      placeholder="Add-on name"
                      value={addOn.addOnName}
                      onChange={(e) => {
                        const newAddOns = [...editingVariant.variant.addOns]
                        newAddOns[index] = { ...addOn, addOnName: e.target.value }
                        setEditingVariant({
                          ...editingVariant,
                          variant: { ...editingVariant.variant, addOns: newAddOns },
                        })
                      }}
                    />
                    <Input
                      placeholder="Type"
                      value={addOn.addOnTypeName}
                      onChange={(e) => {
                        const newAddOns = [...editingVariant.variant.addOns]
                        newAddOns[index] = { ...addOn, addOnTypeName: e.target.value }
                        setEditingVariant({
                          ...editingVariant,
                          variant: { ...editingVariant.variant, addOns: newAddOns },
                        })
                      }}
                    />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      value={addOn.addOnPrice}
                      onChange={(e) => {
                        const newAddOns = [...editingVariant.variant.addOns]
                        newAddOns[index] = { ...addOn, addOnPrice: Number.parseFloat(e.target.value) }
                        setEditingVariant({
                          ...editingVariant,
                          variant: { ...editingVariant.variant, addOns: newAddOns },
                        })
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsVariantDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveVariant} className="bg-green-500 hover:bg-green-600">
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
