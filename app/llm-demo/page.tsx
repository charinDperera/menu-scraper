import { LLMProcessorDemo } from '@/components/demo/llm-processor-demo'

export default function LLMDemoPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            LLM Menu Processor Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the power of AI-driven menu data extraction. Upload a menu file or paste text 
            to see how our LLM processes and structures menu information automatically.
          </p>
        </div>
        
        <LLMProcessorDemo />
        
        <div className="mt-12 p-6 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold text-blue-900 mb-3">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-2 font-semibold">
                1
              </div>
              <p>Upload a menu file (PDF, JPG, PNG) or paste text directly</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-2 font-semibold">
                2
              </div>
              <p>Our AI processes the text using advanced language models</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-2 font-semibold">
                3
              </div>
              <p>Get structured menu data with products, categories, and metadata</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 