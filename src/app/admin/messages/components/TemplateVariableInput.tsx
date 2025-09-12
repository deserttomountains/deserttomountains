/**
 * Enhanced Template Variable Input Component
 * Provides smart input fields based on variable type with validation
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { TemplateVariable, validateVariableValue, formatVariableValue } from '@/lib/messaging/template-variables';

interface TemplateVariableInputProps {
  variable: TemplateVariable;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function TemplateVariableInput({
  variable,
  value,
  onChange,
  className = ''
}: TemplateVariableInputProps) {
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Validate value when it changes
  useEffect(() => {
    const validation = validateVariableValue(variable.name, value);
    setIsValid(validation.isValid);
    setError(validation.error || null);
  }, [variable.name, value]);

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
  };

  const handleSelectOption = (optionValue: string) => {
    onChange(optionValue);
    setShowOptions(false);
  };

  const handleDateChange = (dateValue: string) => {
    onChange(dateValue);
    setShowDatePicker(false);
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getMinDate = () => {
    if (variable.validation?.min) {
      return new Date(variable.validation.min).toISOString().split('T')[0];
    }
    return getTodayDate();
  };

  const renderInput = () => {
    switch (variable.type) {
      case 'select':
        const selectedOption = variable.options?.find(opt => opt.value === value);
        return (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowOptions(!showOptions)}
              className={`w-full px-3 py-2 border rounded-md text-left focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isValid ? 'border-gray-300' : 'border-red-300'
              } ${className}`}
            >
              <div className="flex items-center justify-between">
                <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
                  {selectedOption ? selectedOption.label : `Select ${variable.label}`}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </button>
            
            {showOptions && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                {variable.options?.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelectOption(option.value)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{option.label}</div>
                      {option.description && (
                        <div className="text-sm text-gray-500">{option.description}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case 'date':
        return (
          <div className="relative">
            <input
              type="date"
              value={value}
              onChange={(e) => handleInputChange(e.target.value)}
              min={getMinDate()}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isValid ? 'border-gray-300' : 'border-red-300'
              } ${className}`}
            />
            <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        );

      case 'number':
      case 'currency':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            min={variable.validation?.min}
            max={variable.validation?.max}
            step={variable.type === 'currency' ? '0.01' : '1'}
            placeholder={variable.placeholder}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isValid ? 'border-gray-300' : 'border-red-300'
            } ${className}`}
          />
        );

      case 'email':
        return (
          <input
            type="email"
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={variable.placeholder}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isValid ? 'border-gray-300' : 'border-red-300'
            } ${className}`}
          />
        );

      case 'phone':
        return (
          <input
            type="tel"
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={variable.placeholder}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isValid ? 'border-gray-300' : 'border-red-300'
            } ${className}`}
          />
        );

      case 'url':
        return (
          <input
            type="url"
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={variable.placeholder}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isValid ? 'border-gray-300' : 'border-red-300'
            } ${className}`}
          />
        );

      default: // text
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={variable.placeholder}
            maxLength={variable.validation?.maxLength}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isValid ? 'border-gray-300' : 'border-red-300'
            } ${className}`}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700">
        {variable.label}
        {variable.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Description */}
      {variable.description && (
        <p className="text-sm text-gray-500 flex items-center">
          <Info className="w-4 h-4 mr-1" />
          {variable.description}
        </p>
      )}

      {/* Input */}
      {renderInput()}

      {/* Validation Status */}
      {value && (
        <div className="flex items-center text-sm">
          {isValid ? (
            <div className="flex items-center text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              Valid
            </div>
          ) : (
            <div className="flex items-center text-red-600">
              <AlertCircle className="w-4 h-4 mr-1" />
              {error}
            </div>
          )}
        </div>
      )}

      {/* Examples */}
      {variable.examples && variable.examples.length > 0 && (
        <div className="text-sm text-gray-500">
          <span className="font-medium">Examples:</span>{' '}
          {variable.examples.join(', ')}
        </div>
      )}

      {/* Character count for text inputs */}
      {variable.type === 'text' && variable.validation?.maxLength && (
        <div className="text-xs text-gray-400 text-right">
          {value.length}/{variable.validation.maxLength}
        </div>
      )}
    </div>
  );
}

