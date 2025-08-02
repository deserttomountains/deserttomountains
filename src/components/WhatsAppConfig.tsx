'use client';

import { useState } from 'react';
import { Settings, CheckCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import whatsappBusinessClientService from '@/services/whatsappBusinessClientService';

interface WhatsAppConfigProps {
  onConfigUpdate?: () => void;
}

export default function WhatsAppConfig({ onConfigUpdate }: WhatsAppConfigProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  
  const [config, setConfig] = useState({
    accessToken: '',
    phoneNumberId: '',
    businessAccountId: '',
    webhookVerifyToken: '',
    apiVersion: 'v18.0'
  });

  const handleInputChange = (field: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      // Update the service configuration
      await whatsappBusinessClientService.updateConfig(config);
      
      // Test the connection
      const status = await whatsappBusinessClientService.getStatus();
      
      if (status.connected) {
        setTestResult({
          success: true,
          message: 'WhatsApp Business API connected successfully!'
        });
        onConfigUpdate?.();
      } else {
        setTestResult({
          success: false,
          message: 'Connection failed. Please check your credentials.'
        });
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || 'Connection test failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openMetaDeveloperConsole = () => {
    window.open('https://developers.facebook.com/apps/', '_blank');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <Settings className="w-4 h-4" />
        Configure WhatsApp
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">WhatsApp Business API Configuration</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-600 mt-2">
                Configure your WhatsApp Business API credentials to enable messaging functionality.
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Setup Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Setup Instructions</h3>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Go to <button onClick={openMetaDeveloperConsole} className="text-blue-600 underline flex items-center gap-1">Meta Developer Console <ExternalLink className="w-3 h-3" /></button></li>
                  <li>2. Create a new app or use existing one</li>
                  <li>3. Add WhatsApp Business API product</li>
                  <li>4. Configure phone number and get credentials</li>
                  <li>5. Enter the credentials below</li>
                </ol>
              </div>

              {/* Configuration Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Access Token *
                  </label>
                  <input
                    type="password"
                    value={config.accessToken}
                    onChange={(e) => handleInputChange('accessToken', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your WhatsApp Business API access token"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number ID *
                  </label>
                  <input
                    type="text"
                    value={config.phoneNumberId}
                    onChange={(e) => handleInputChange('phoneNumberId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your phone number ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Account ID *
                  </label>
                  <input
                    type="text"
                    value={config.businessAccountId}
                    onChange={(e) => handleInputChange('businessAccountId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your business account ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Webhook Verify Token
                  </label>
                  <input
                    type="text"
                    value={config.webhookVerifyToken}
                    onChange={(e) => handleInputChange('webhookVerifyToken', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter webhook verify token (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Version
                  </label>
                  <input
                    type="text"
                    value={config.apiVersion}
                    onChange={(e) => handleInputChange('apiVersion', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="v18.0"
                  />
                </div>
              </div>

              {/* Test Result */}
              {testResult && (
                <div className={`p-4 rounded-lg ${
                  testResult.success 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {testResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className={testResult.success ? 'text-green-800' : 'text-red-800'}>
                      {testResult.message}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleTestConnection}
                  disabled={isLoading || !config.accessToken || !config.phoneNumberId}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Test Connection
                </button>
                
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 