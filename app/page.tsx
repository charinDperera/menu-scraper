"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Upload, Brain, CheckCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useFileParser } from "@/hooks/use-file-parser"
import { useLLMProcess } from "@/hooks/use-llm-process"

export default function HomePage() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [currentStep, setCurrentStep] = useState<'upload' | 'processing' | 'llm-processing' | 'complete'>('upload')
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { parseFile, loading, result, error } = useFileParser()
  const { processMenuData, isProcessing, error: llmError, lastResult } = useLLMProcess()
  
  // Use useEffect to set client state after hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleFileUpload = async (files: FileList | null) => {
    if (!isClient || !files || files.length === 0) return;
    
    const file = files[0]
    setCurrentStep('processing')
    
    try {
      // Use the unified file parser for all supported file types
      const result = await parseFile(file)
      
      // If parsing is successful, proceed to LLM processing
      if (result && result.text) {
        console.log("File parsed successfully:", result.fileType, result.text.length, "characters")
        setCurrentStep('llm-processing')
        
        // Process with LLM
        const llmResult = await processMenuData({
          rawText: result.text,
          sourceFile: file.name,
          fileType: file.type || 'unknown',
        })
        
        if (llmResult) {
          setCurrentStep('complete')
          // Store the result in sessionStorage for the review page
          sessionStorage.setItem('llmProcessingResult', JSON.stringify(llmResult))
          sessionStorage.setItem('originalFileInfo', JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            originalText: result.text
          }))
        }
      }
    } catch (error) {
      console.error('Error parsing file:', error)
      setCurrentStep('upload')
    }
  }

  const handleProceedToReview = () => {
    router.push('/menu-review')
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

  const resetProcess = () => {
    setCurrentStep('upload')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Upload Section */}
          {currentStep === 'upload' && (
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
          )}

          {/* File Parsing Results - Only show on client side */}
          {isClient && currentStep === 'processing' && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Processing file...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* LLM Processing */}
          {isClient && currentStep === 'llm-processing' && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-blue-800 mb-2">AI Processing Menu Data</h3>
                  <p className="text-blue-600 mb-4">Our AI is analyzing your menu and extracting product information...</p>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-blue-600">Processing with AI...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* LLM Processing Results */}
          {isClient && currentStep === 'complete' && lastResult && (
            <Card className="mb-8 border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-green-800 mb-2">
                    AI Processing Complete!
                  </h3>
                  <p className="text-green-600 mb-4">
                    Successfully extracted {lastResult.products.length} products using AI
                  </p>
                  
                  {/* Processing Metadata */}
                  <div className="grid grid-cols-2 gap-4 text-sm mb-6 max-w-md mx-auto">
                    <div className="bg-white p-3 rounded border">
                      <span className="font-medium">Products Found:</span> {lastResult.metadata.totalProducts}
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <span className="font-medium">Processing Time:</span> {lastResult.metadata.processingTime}ms
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <span className="font-medium">Source File:</span> {lastResult.metadata.sourceFile}
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <span className="font-medium">File Type:</span> {lastResult.metadata.fileType}
                    </div>
                  </div>

                  {/* Sample Products Preview */}
                  <div className="bg-white p-4 rounded border max-h-64 overflow-y-auto mb-6">
                    <h4 className="font-medium text-gray-800 mb-3">Sample Products Found:</h4>
                    <div className="space-y-2">
                      {lastResult.products.slice(0, 5).map((product, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium">{product.name}</span>
                          <span className="text-sm text-green-600">${product.price}</span>
                        </div>
                      ))}
                      {lastResult.products.length > 5 && (
                        <p className="text-xs text-gray-500 text-center">
                          ... and {lastResult.products.length - 5} more products
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-center space-x-4">
                    <Button variant="outline" onClick={resetProcess}>
                      Process Another File
                    </Button>
                    <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={handleProceedToReview}>
                      Review & Edit Products
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display - Only show on client side */}
          {isClient && (error || llmError) && (
            <Card className="mb-8 border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-red-600 font-medium">Processing Error</p>
                  <p className="text-red-500 text-sm mt-2">{error || llmError}</p>
                  <Button variant="outline" onClick={resetProcess} className="mt-4">
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 