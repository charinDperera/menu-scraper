"use client"

import { Package, ShoppingCart, Settings, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function Navigation() {
  const router = useRouter()

  return (
    <>
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
            <h1 className="text-2xl font-semibold text-gray-800">Menu Scraper</h1>
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
      </div>
    </>
  )
} 