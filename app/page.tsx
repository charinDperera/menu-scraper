"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [isDragOver, setIsDragOver] = useState(false)
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0]
      // In a real app, you'd upload the file and process it
      console.log("Uploading file:", file.name)
      // Navigate to review page with file data
      router.push("/menu-review")
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

  const handleZoneClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                  isDragOver
                    ? "border-green-400 bg-green-50"
                    : "border-gray-300 hover:border-green-400 hover:bg-green-50"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={handleZoneClick}
              >
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Drop your menu file here, or click to browse</h3>
                <p className="text-gray-500 mb-4">Supports PDF, JPG, PNG files up to 10MB</p>
                
                {/* Hidden file input that gets triggered by the drop zone click */}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 