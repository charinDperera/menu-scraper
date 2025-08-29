"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useLLMProcess } from '@/hooks/use-llm-process'
import { useFileParser } from '@/hooks/use-file-parser'
import { BulkProduct, BulkCategory, BulkTax, BulkAddonGroup } from '@/types/product-model'

export function LLMProcessorDemo() {
  const [rawText, setRawText] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  const { parseFile, isParsing, parsedText, error: parseError } = useFileParser()
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

            {/* Comprehensive Data Summary */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Categories:</span> {lastResult.categories?.length || 0}
              </div>
              <div>
                <span className="font-medium">Taxes:</span> {lastResult.taxes?.length || 0}
              </div>
              <div>
                <span className="font-medium">Add-on Groups:</span> {lastResult.addonGroups?.length || 0}
              </div>
              <div>
                <span className="font-medium">Total Items:</span> {lastResult.metadata.totalProducts + (lastResult.categories?.length || 0) + (lastResult.taxes?.length || 0) + (lastResult.addonGroups?.length || 0)}
              </div>
            </div>

            {/* Categories */}
            {lastResult.categories && lastResult.categories.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {lastResult.categories.map((category, index) => (
                    <Badge key={index} variant="secondary">
                      {category.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Taxes */}
            {lastResult.taxes && lastResult.taxes.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Taxes</h4>
                <div className="flex flex-wrap gap-2">
                  {lastResult.taxes.map((tax, index) => (
                    <Badge key={index} variant="outline">
                      {tax.name} ({tax.rate}%)
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Add-on Groups */}
            {lastResult.addonGroups && lastResult.addonGroups.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Add-on Groups</h4>
                <div className="flex flex-wrap gap-2">
                  {lastResult.addonGroups.map((group, index) => (
                    <Badge key={index} variant="secondary">
                      {group.name} ({group.addonTypes?.length || 0} options)
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Products */}
            <div>
              <h4 className="font-medium mb-2">Products</h4>
              <div className="space-y-3">
                {lastResult.products.map((product, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium">{product.name}</h5>
                      <span className="text-lg font-semibold text-green-600">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                    {product.description && (
                      <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {product.categoryNames?.map((category, i) => (
                        <Badge key={i} variant="outline">{category}</Badge>
                      ))}
                      {product.variant && (
                        <Badge variant="secondary">
                          {product.variant.variantTypes.length} variants
                        </Badge>
                      )}
                      {product.addonGroupNames && product.addonGroupNames.length > 0 && (
                        <Badge variant="secondary">
                          {product.addonGroupNames.length} add-on groups
                        </Badge>
                      )}
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