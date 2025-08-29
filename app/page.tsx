"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Upload } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useFileParser } from "@/hooks/use-file-parser"

export default function HomePage() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { parseFile, loading, result, error } = useFileParser()
  
  // Use useEffect to set client state after hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleFileUpload = async (files: FileList | null) => {
    if (!isClient || !files || files.length === 0) return;
    
    const file = files[0]
    
    try {
      // Use the unified file parser for all supported file types
      const result = await parseFile(file)
      
      // If parsing is successful, we can proceed to menu review
      if (result && result.text) {
        console.log("File parsed successfully:", result.fileType, result.text.length, "characters")
        // You can add logic here to process the extracted text
        // For now, we'll show the results on the same page
      }
    } catch (error) {
      console.error('Error parsing file:', error)
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
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver
                    ? "border-green-400 bg-green-50"
                    : "border-gray-300 hover:border-green-400 hover:bg-green-50"
                } ${isClient ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                onDrop={isClient ? handleDrop : undefined}
                onDragOver={isClient ? handleDragOver : undefined}
                onDragLeave={isClient ? handleDragLeave : undefined}
                onClick={isClient ? handleZoneClick : undefined}
              >
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Drop your menu file here, or click to browse</h3>
                <p className="text-gray-500 mb-4">Supports PDF (50MB), JPG, PNG, GIF, BMP, WebP, TIFF (10MB) files</p>
                
                {/* Hidden file input that gets triggered by the drop zone click */}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,.tiff"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
              </div>
            </CardContent>
          </Card>

          {/* File Parsing Results - Only show on client side */}
          {isClient && loading && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Processing file...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display - Only show on client side */}
          {isClient && error && (
            <Card className="mb-8 border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-red-600 font-medium">File Processing Error</p>
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
                  <h3 className="text-lg font-medium text-green-800 mb-2">
                    {result.fileType === 'pdf' ? 'PDF' : 'Image'} Processed Successfully!
                  </h3>
                  <p className="text-green-600">
                    {result.fileType === 'pdf' ? `Pages: ${result.data?.pages || 'Unknown'}` : `Confidence: ${result.data?.confidence || 'Unknown'}%`}
                  </p>
                  {result.metadata && (
                    <p className="text-green-600 text-sm mt-1">
                      File: {result.metadata.fileName} • Size: {Math.round(result.metadata.fileSize / 1024)}KB
                      {result.metadata.processingTime && ` • Time: ${result.metadata.processingTime.toFixed(2)}ms`}
                    </p>
                  )}
                </div>
                <div className="bg-white p-4 rounded border max-h-64 overflow-y-auto">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{result.text}</p>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {result.text ? `${result.text.length} characters extracted` : 'No text extracted'}
                  {result.fileType === 'image' && result.data?.confidence && ` • OCR Confidence: ${result.data.confidence.toFixed(1)}%`}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 