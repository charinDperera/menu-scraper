"use client"

import type React from "react"

import { useState } from "react"
import { Upload, FileImage, FileText, Plus, Settings, Package, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function ProductsPage() {
  const [isDragOver, setIsDragOver] = useState(false)
  const router = useRouter()

  const handleFileUpload = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0]
      // In a real app, you'd upload the file and process it
      console.log("Uploading file:", file.name)
      // Navigate to review page with file data
      router.push("/products/menu-review")
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileUpload(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-500 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-xl font-bold">Applova</div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-sm">🔔</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-full"></div>
              <span className="text-sm">CHARIN@GETAPPLOVA.COM</span>
            </div>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Manage Products</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
              <span>Product Converter</span>
              <span>•</span>
              <span>Total Products</span>
              <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs">0</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-500">
              <Package className="w-5 h-5" />
              <span>Products</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-500">
              <ShoppingCart className="w-5 h-5" />
              <span>Sales Orders</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-500">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b px-6">
        <div className="flex space-x-8">
          <button className="flex items-center space-x-2 py-4 border-b-2 border-green-500 text-green-600">
            <Package className="w-4 h-4" />
            <span>Products</span>
          </button>
          <button className="flex items-center space-x-2 py-4 text-gray-500 hover:text-gray-700">
            <span>Categories</span>
          </button>
          <button className="flex items-center space-x-2 py-4 text-gray-500 hover:text-gray-700">
            <span>Add-On Groups</span>
          </button>
          <button className="flex items-center space-x-2 py-4 text-gray-500 hover:text-gray-700">
            <span>Taxes</span>
          </button>
        </div>
        <div className="flex justify-end pb-4">
          <Button className="bg-green-500 hover:bg-green-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add New Product
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Upload Section */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Upload Your Menu</h2>
                <p className="text-gray-600">Upload a PDF or image of your menu to automatically extract products</p>
              </div>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver
                    ? "border-green-400 bg-green-50"
                    : "border-gray-300 hover:border-green-400 hover:bg-green-50"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Drop your menu file here, or click to browse</h3>
                <p className="text-gray-500 mb-4">Supports PDF, JPG, PNG files up to 10MB</p>
                <div className="flex justify-center space-x-4">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(e.target.files)}
                    />
                    <Button
                      variant="outline"
                      className="border-green-500 text-green-600 hover:bg-green-50 bg-transparent"
                    >
                      <FileImage className="w-4 h-4 mr-2" />
                      Choose Image
                    </Button>
                  </label>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf"
                      onChange={(e) => handleFileUpload(e.target.files)}
                    />
                    <Button
                      variant="outline"
                      className="border-green-500 text-green-600 hover:bg-green-50 bg-transparent"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Choose PDF
                    </Button>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Empty State */}
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-lg mx-auto mb-6 flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">You Have Not Added Any Products Yet</h3>
            <p className="text-gray-500 mb-6">Your product items will be listed here, once they are added.</p>
            <div className="flex justify-center space-x-4">
              <Button className="bg-green-500 hover:bg-green-600 text-white">Add Your First Product</Button>
              <span className="text-gray-400 self-center">OR</span>
              <Button className="bg-green-500 hover:bg-green-600 text-white">Import Products via Excel</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
