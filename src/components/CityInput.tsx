'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline';

interface CityInputProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{value: string, label: string}>;
  placeholder: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  onPincodeFill?: (city: string) => void;
}

const CityInput: React.FC<CityInputProps> = ({
  value,
  onChange,
  options,
  placeholder,
  label,
  required = false,
  disabled = false,
  error,
  onPincodeFill
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update input value when prop changes (e.g., from pincode autofill)
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setIsTyping(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsTyping(true);
    setSearchTerm(newValue);
    
    // Update parent component with the typed value
    onChange(newValue);
    
    // Show dropdown if there are matching options
    if (newValue.length > 0 && options.some(opt => 
      opt.label.toLowerCase().includes(newValue.toLowerCase())
    )) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleSelect = (option: {value: string, label: string}) => {
    setInputValue(option.label);
    // When selecting from dropdown, use the label as the value
    onChange(option.label);
    setIsOpen(false);
    setSearchTerm('');
    setIsTyping(false);
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm('');
        setIsTyping(false);
        // Focus the input when opening dropdown
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
  };

  const handleInputFocus = () => {
    if (inputValue.length > 0 && options.some(opt => 
      opt.label.toLowerCase().includes(inputValue.toLowerCase())
    )) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    // Don't close immediately to allow clicking on dropdown items
    setTimeout(() => {
      setIsTyping(false);
    }, 200);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-sm font-semibold text-[#8B7A1A] mb-3">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            disabled={disabled}
            className={`
              w-full pl-12 pr-12 py-4 rounded-2xl border-2 transition-all duration-300
              focus:outline-none focus:ring-4 focus:ring-offset-0
              ${error 
                ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                : 'border-[#D4AF37] focus:ring-[#8B7A1A]/20 focus:border-[#8B7A1A] hover:border-[#8B7A1A]'
              }
              ${disabled ? 'bg-gray-50/90 cursor-not-allowed opacity-60' : 'hover:shadow-xl cursor-text bg-white/90 backdrop-blur-sm'}
              placeholder:text-[#8B7A1A] placeholder:font-medium text-[#5E4E06] font-medium text-base
            `}
            placeholder={placeholder}
          />
          <MapPinIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8B7A1A]" />
          
          {/* Dropdown Toggle Button */}
          <button
            type="button"
            onClick={handleToggle}
            disabled={disabled}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-[#8B7A1A] hover:text-[#5E4E06] transition-colors cursor-pointer"
          >
            <ChevronDownIcon 
              className={`h-5 w-5 transition-transform duration-300 ${
                isOpen ? 'rotate-180' : ''
              }`} 
            />
          </button>
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-sm border-2 border-[#D4AF37] rounded-2xl shadow-2xl max-h-80 overflow-hidden">
            {/* Search Header */}
            <div className="p-4 border-b border-[#D4AF37]/30">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8B7A1A]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search cities..."
                  className="w-full pl-12 pr-4 py-3 text-base border-2 border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B7A1A]/20 focus:border-[#8B7A1A] bg-white/80 text-[#5E4E06] placeholder:text-[#8B7A1A]"
                  autoFocus
                />
              </div>
            </div>

            {/* Options List */}
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              {filteredOptions.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#F5F2E8] flex items-center justify-center">
                    <MapPinIcon className="w-8 h-8 text-[#8B7A1A]" />
                  </div>
                  <p className="text-[#8B7A1A] font-medium">No cities found</p>
                  <p className="text-sm text-[#8B7A1A]/70 mt-1">
                    {searchTerm.length > 0 
                      ? "Try a different search term or type your city name"
                      : "Start typing to search cities"
                    }
                  </p>
                  {searchTerm.length > 0 && (
                    <div className="mt-4 p-3 bg-[#F5F2E8] rounded-xl">
                      <p className="text-sm text-[#8B7A1A]">
                        You can manually type "{searchTerm}" if it's not in our list
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-2">
                  {/* Show "Type manually" option if user is typing something not in list */}
                  {searchTerm.length > 0 && !filteredOptions.some(opt => 
                    opt.label.toLowerCase() === searchTerm.toLowerCase()
                  ) && (
                    <button
                      type="button"
                      onClick={() => handleSelect({ value: searchTerm, label: searchTerm })}
                      className="w-full px-6 py-4 text-left text-base transition-all duration-200 hover:bg-[#F5F2E8] hover:shadow-sm border-b border-[#D4AF37]/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#5E4E06]"></div>
                        <span className="text-[#5E4E06] font-medium">
                          Use "{searchTerm}" (type manually)
                        </span>
                      </div>
                    </button>
                  )}
                  
                  {filteredOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option)}
                      className={`
                        w-full px-6 py-4 text-left text-base transition-all duration-200 hover:bg-[#F5F2E8] hover:shadow-sm
                        ${option.value === value 
                          ? 'bg-gradient-to-r from-[#5E4E06]/10 to-[#8B7A1A]/10 text-[#5E4E06] font-semibold border-r-4 border-[#5E4E06]' 
                          : 'text-[#5E4E06] hover:text-[#8B7A1A]'
                        }
                      `}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>
      )}
      
      {/* Help text */}
      <p className="mt-2 text-xs text-[#8B7A1A]/70">
        You can select from the list or type your city name manually
      </p>
    </div>
  );
};

export default CityInput; 