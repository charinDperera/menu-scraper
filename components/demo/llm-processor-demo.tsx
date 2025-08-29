"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useLLMProcess } from '@/hooks/use-llm-process'
import { useFileParser } from '@/hooks/use-file-parser'

export function LLMProcessorDemo() {
  const [rawText, setRawText] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  const { parseFile, loading: isParsing, error: parseError } = useFileParser()
  const { processMenuData, isProcessing, error: processError, lastResult } = useLLMProcess()

  const handleFileUpload = async (file: File) => {
    setSelectedFile(file)
    const result = await parseFile(file)
    if (result?.text) {
      setRawText(result.text)
    }
  }

  const handleProcessWithLLM = async () => {
    if (!rawText.trim() || !selectedFile) return

    await processMenuData({
      rawText: rawText.trim(),
      sourceFile: selectedFile.name,
      fileType: selectedFile.type || 'unknown',
    })
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRawText(e.target.value)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>LLM Menu Processor Demo</CardTitle>
          <CardDescription>
            Upload a menu file or paste text to process with AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <label htmlFor="file-upload" className="text-sm font-medium">
              Upload Menu File
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileInputChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {selectedFile && (
              <p className="text-sm text-gray-600">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {/* Raw Text Input */}
          <div className="space-y-2">
            <label htmlFor="raw-text" className="text-sm font-medium">
              Raw Menu Text
            </label>
            <Textarea
              id="raw-text"
              placeholder="Paste menu text here or upload a file to extract text..."
              value={rawText}
              onChange={handleTextChange}
              rows={8}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              {rawText.length} characters
            </p>
          </div>

          {/* Process Button */}
          <Button
            onClick={handleProcessWithLLM}
            disabled={!rawText.trim() || isProcessing || isParsing}
            className="w-full"
          >
            {isProcessing ? 'Processing with AI...' : 'Process with LLM'}
          </Button>

          {/* Error Display */}
          {(parseError || processError) && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">
                {parseError || processError}
              </p>
            </div>
          )}

          {/* Loading States */}
          {(isParsing || isProcessing) && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-600">
                {isParsing ? 'Extracting text from file...' : 'Processing with AI...'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Display */}
      {lastResult && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Results</CardTitle>
            <CardDescription>
              AI-processed menu data with {lastResult.products.length} products
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Processing Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Total Products:</span> {lastResult.metadata.totalProducts}
              </div>
              <div>
                <span className="font-medium">Processing Time:</span> {lastResult.metadata.processingTime}ms
              </div>
              <div>
                <span className="font-medium">Source File:</span> {lastResult.metadata.sourceFile}
              </div>
              <div>
                <span className="font-medium">File Type:</span> {lastResult.metadata.fileType}
              </div>
            </div>

            {/* Products */}
            <div>
              <h4 className="font-medium mb-2">Products</h4>
              <div className="space-y-3">
                {lastResult.products.map((product, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium">{product.name}</h5>
                      {product.taxPercentage && (
                        <span className="text-sm text-gray-600">
                          Tax: {product.taxPercentage}%
                        </span>
                      )}
                    </div>
                    {product.description && (
                      <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {product.categories && product.categories.map((category, i) => (
                        <Badge key={i} variant="outline">{category}</Badge>
                      ))}
                      {product.isAlcoholicProduct && <Badge variant="destructive">Alcoholic</Badge>}
                      {product.isFeatured && <Badge variant="secondary">Featured</Badge>}
                      {product.deliverable && <Badge variant="secondary">Delivery</Badge>}
                      {product.tags && product.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 