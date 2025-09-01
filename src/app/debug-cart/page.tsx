"use client";

import { useState, useEffect } from 'react';
import { useCart } from '@/components/CartContext';

export default function DebugCartPage() {
  const { cart } = useCart();
  const [localStorageCart, setLocalStorageCart] = useState<any>(null);
  const [deviceInfo, setDeviceInfo] = useState<any>({});

  useEffect(() => {
    // Get localStorage cart data
    try {
      const stored = localStorage.getItem('cart');
      setLocalStorageCart(stored ? JSON.parse(stored) : null);
    } catch (error) {
      console.error('Error reading localStorage cart:', error);
    }

    // Get device info
    setDeviceInfo({
      userAgent: navigator.userAgent,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      localStorage: typeof localStorage !== 'undefined',
      sessionStorage: typeof sessionStorage !== 'undefined'
    });
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Cart Debug Information</h1>
        
        {/* Device Information */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-3">Device Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(deviceInfo).map(([key, value]) => (
              <div key={key} className="text-sm">
                <span className="font-medium">{key}:</span> {String(value)}
              </div>
            ))}
          </div>
        </div>

        {/* Context Cart */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-3">Context Cart (React State)</h2>
          <div className="mb-2">
            <span className="font-medium">Cart Length:</span> {cart.length}
          </div>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-96">
            {JSON.stringify(cart, null, 2)}
          </pre>
          <button 
            onClick={() => copyToClipboard(JSON.stringify(cart, null, 2))}
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            Copy to Clipboard
          </button>
        </div>

        {/* LocalStorage Cart */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-3">LocalStorage Cart</h2>
          <div className="mb-2">
            <span className="font-medium">Has Data:</span> {localStorageCart ? 'Yes' : 'No'}
          </div>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-96">
            {localStorageCart ? JSON.stringify(localStorageCart, null, 2) : 'No data found'}
          </pre>
          <button 
            onClick={() => copyToClipboard(localStorageCart ? JSON.stringify(localStorageCart, null, 2) : 'No data')}
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            Copy to Clipboard
          </button>
        </div>

        {/* Shades Analysis */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-3">Shades Analysis</h2>
          {cart.map((item, index) => (
            <div key={index} className="mb-4 p-3 border rounded">
              <h3 className="font-medium">{item.name}</h3>
              <div className="text-sm text-gray-600">
                <div>Has shades: {item.shades ? 'Yes' : 'No'}</div>
                <div>Shades length: {item.shades?.length || 0}</div>
                <div>Shades type: {typeof item.shades}</div>
                <div>Is array: {Array.isArray(item.shades) ? 'Yes' : 'No'}</div>
                <div className="mt-2">
                  <span className="font-medium">Shades data:</span>
                  <pre className="bg-gray-100 p-2 rounded text-xs mt-1">
                    {JSON.stringify(item.shades, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Instructions for Client</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Add some sample products to cart with shades</li>
            <li>Refresh this page to see the updated data</li>
            <li>Take screenshots of the information above</li>
            <li>Copy the cart data to clipboard and share it</li>
            <li>Try placing an order and check if shades are saved</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
