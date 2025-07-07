'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Option {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  searchable?: boolean;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder,
  label,
  required = false,
  disabled = false,
  error,
  searchable = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);

  const filteredOptions = searchable 
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: Option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm('');
      }
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-sm font-semibold text-[#8B7A1A] mb-3">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={`
            w-full px-4 py-4 text-left bg-white/90 backdrop-blur-sm border-2 rounded-2xl shadow-lg
            focus:outline-none focus:ring-4 focus:ring-offset-0 transition-all duration-300
            ${error 
              ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
              : 'border-[#D4AF37] focus:ring-[#8B7A1A]/20 focus:border-[#8B7A1A] hover:border-[#8B7A1A]'
            }
            ${disabled ? 'bg-gray-50/90 cursor-not-allowed opacity-60' : 'hover:shadow-xl cursor-pointer'}
          `}
        >
          <span className={`block truncate text-base ${selectedOption ? 'text-[#5E4E06] font-medium' : 'text-[#8B7A1A]'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-4">
            <ChevronDownIcon 
              className={`h-5 w-5 text-[#8B7A1A] transition-transform duration-300 ${
                isOpen ? 'rotate-180' : ''
              }`} 
            />
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-sm border-2 border-[#D4AF37] rounded-2xl shadow-2xl max-h-80 overflow-hidden">
            {searchable && (
              <div className="p-4 border-b border-[#D4AF37]/30">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8B7A1A]" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-12 pr-4 py-3 text-base border-2 border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B7A1A]/20 focus:border-[#8B7A1A] bg-white/80 text-[#5E4E06] placeholder:text-[#8B7A1A]"
                    autoFocus
                  />
                </div>
              </div>
            )}

            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              {filteredOptions.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#F5F2E8] flex items-center justify-center">
                    <MagnifyingGlassIcon className="w-8 h-8 text-[#8B7A1A]" />
                  </div>
                  <p className="text-[#8B7A1A] font-medium">No options found</p>
                  <p className="text-sm text-[#8B7A1A]/70 mt-1">Try a different search term</p>
                </div>
              ) : (
                <div className="py-2">
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
    </div>
  );
};

export default CustomDropdown; 