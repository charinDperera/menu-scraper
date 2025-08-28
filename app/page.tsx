"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { usePDFParse } from "@/hooks/use-pdf-parse"

export default function HomePage() {
  const [isDragOver, setIsDragOver] = useState(false)
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { parsePDF, isParsing, result, error } = usePDFParse()
  
  // Ensure we're on the client side
  const isClient = typeof window !== 'undefined'

  const handleFileUpload = async (files: FileList | null) => {
    if (!isClient) return;
    
    if (files && files.length > 0) {
      const file = files[0]
      
      // Check if it's a PDF file
      if (file.type === 'application/pdf') {
        try {
          await parsePDF(file)
        } catch (error) {
          console.error('Error parsing PDF:', error)
        }
      } else {
        // For non-PDF files, keep existing behavior
        console.log("Uploading file:", file.name)
        router.push("/menu-review")
      }
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
                <p className="text-gray-500 mb-4">
                  {isClient ? "Supports PDF, JPG, PNG files up to 10MB" : "Supports JPG, PNG files up to 10MB"}
                </p>
                
                {/* Hidden file input that gets triggered by the drop zone click */}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept={isClient ? ".pdf,.jpg,.jpeg,.png" : ".jpg,.jpeg,.png"}
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
              </div>
            </CardContent>
          </Card>

          {/* PDF Parsing Results - Only show on client side */}
          {isClient && isParsing && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Parsing PDF...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display - Only show on client side */}
          {isClient && error && (
            <Card className="mb-8 border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-red-600 font-medium">PDF Parsing Error</p>
                  <p className="text-red-500 text-sm mt-2">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Display - Only show on client side */}
          {isClient && result && (
            <Card className="mb-8 border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-medium text-green-800 mb-2">PDF Parsed Successfully!</h3>
                  <p className="text-green-600">Pages: {result.pages}</p>
                  {result.info && Object.keys(result.info).length > 0 && (
                    <p className="text-green-600 text-sm mt-1">
                      {result.info.title && `Title: ${result.info.title}`}
                      {result.info.author && ` • Author: ${result.info.author}`}
                    </p>
                  )}
                </div>
                <div className="bg-white p-4 rounded border max-h-64 overflow-y-auto">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{result.text}</p>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Check browser console for full extracted text
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 