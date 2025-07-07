'use client';

import React, { useState, useEffect } from 'react';
import { Hash, Search, Loader2, CheckCircle, XCircle } from 'lucide-react';
import addressService from '@/services/addressService';

interface PincodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onAddressFill?: (address: { state: string; city: string; postOffices?: Array<{name: string, branchType: string, deliveryStatus: string, block: string}> }) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
}

const PincodeInput: React.FC<PincodeInputProps> = ({
  value,
  onChange,
  onAddressFill,
  placeholder = "Enter pincode",
  label = "Pincode *",
  required = false,
  error
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [addressData, setAddressData] = useState<any>(null);

  const handlePincodeChange = (newValue: string) => {
    onChange(newValue);
    setIsValid(null);
    setAddressData(null);
    
    // Auto-fetch address when pincode is 6 digits
    if (newValue.length === 6 && /^\d{6}$/.test(newValue)) {
      fetchAddressByPincode(newValue);
    }
  };

  // Auto-fill city when pincode data is fetched
  useEffect(() => {
    if (addressData && isValid && onAddressFill) {
      onAddressFill({
        state: addressData.state,
        city: addressData.district,
        postOffices: addressData.postOffices
      });
    }
  }, [addressData, isValid, onAddressFill]);

  const fetchAddressByPincode = async (pincode: string) => {
    setIsLoading(true);
    try {
      const data = await addressService.getAddressByPincode(pincode);
      if (data) {
        setAddressData(data);
        setIsValid(true);
      } else {
        setIsValid(false);
      }
    } catch (error) {
      console.error('Failed to fetch address by pincode:', error);
      setIsValid(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSearch = () => {
    if (value.length === 6 && /^\d{6}$/.test(value)) {
      fetchAddressByPincode(value);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-[#8B7A1A] mb-3">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={(e) => handlePincodeChange(e.target.value)}
            maxLength={6}
            className={`
              w-full pl-10 pr-12 py-3 rounded-xl border-2 transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-0
              ${error 
                ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                : isValid === true
                ? 'border-green-300 focus:ring-green-500/20 focus:border-green-500'
                : isValid === false
                ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                : 'border-[#D4AF37] focus:ring-[#8B7A1A]/20 focus:border-[#8B7A1A] hover:border-[#8B7A1A]'
              }
              placeholder:text-[#8B7A1A] placeholder:font-medium bg-white/90 backdrop-blur-sm text-[#5E4E06] font-medium text-base
            `}
            placeholder={placeholder}
          />
          <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#8B7A1A]" />
          
          {/* Search Button */}
          {value.length === 6 && !isLoading && (
            <button
              type="button"
              onClick={handleManualSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-[#8B7A1A] hover:text-[#5E4E06] transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>
          )}
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-4 h-4 text-[#8B7A1A] animate-spin" />
            </div>
          )}
          
          {/* Validation Icons */}
          {!isLoading && value.length === 6 && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isValid === true && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              {isValid === false && (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Address Preview */}
      {addressData && isValid && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-800">Address Found</span>
          </div>
          <div className="text-sm text-green-700">
            <p><strong>District:</strong> {addressData.district}</p>
            <p><strong>State:</strong> {addressData.state}</p>
            <p><strong>Post Office:</strong> {addressData.postOffice}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {/* Invalid Pincode Message */}
      {isValid === false && value.length === 6 && (
        <p className="text-sm text-red-600">Invalid pincode. Please check and try again.</p>
      )}
    </div>
  );
};

export default PincodeInput; 