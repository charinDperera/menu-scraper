import { ApptizerApiDemo } from '@/components/demo/apptizer-api-demo';

export default function ApptizerDemoPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Apptizer API Integration Demo</h1>
        <p className="text-gray-600 mb-8">
          This page demonstrates how to use the Apptizer service to make API calls equivalent to your curl command.
          The service automatically handles the X-Merchant-Id header and businessId from environment variables.
        </p>
        
        <ApptizerApiDemo />
      </div>
    </div>
  );
} 