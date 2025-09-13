/**
 * Variable Suggestions Component
 * Provides Quick Insert functionality for template variables
 */

'use client';

import React from 'react';
import { 
  Lightbulb, 
  Copy
} from 'lucide-react';
import { 
  getMarketingVariables,
  getVariableConfig
} from '@/lib/messaging/template-variables';

interface VariableSuggestionsProps {
  templateText: string;
  providedVariables: Record<string, string>;
  onVariableSelect: (variable: string) => void;
  category: 'MARKETING'; // Only Marketing templates are created by admins
  className?: string;
}

export default function VariableSuggestions({
  templateText,
  providedVariables,
  onVariableSelect,
  category,
  className = ''
}: VariableSuggestionsProps) {

  // Handle variable selection
  const handleVariableSelect = (variableName: string) => {
    onVariableSelect(variableName);
  };

  // Copy variable to clipboard
  const copyVariable = (variable: string) => {
    navigator.clipboard.writeText(`{{${variable}}}`);
  };

  // Get marketing variables only (admins can only create Marketing templates)
  const marketingVariables = getMarketingVariables();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Quick Insert Header */}
      <div className="flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-[#D4AF37]" />
        <h3 className="text-lg font-semibold text-gray-900">Quick Insert Variables</h3>
      </div>

      {/* Marketing Variables Only */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          Marketing Variables (Customer-related)
        </h4>
        <div className="flex flex-wrap gap-2">
          {marketingVariables.map((variable) => (
            <div key={variable.name} className="flex items-center gap-1">
              <button
                onClick={() => handleVariableSelect(variable.name)}
                className="text-xs px-3 py-1 bg-[#F5F2E8] text-[#8B7A1A] rounded border border-[#D4AF37] hover:bg-[#D4AF37] hover:text-white transition-all duration-300"
                title={variable.description}
              >
                {variable.label}
              </button>
              <button
                onClick={() => copyVariable(variable.name)}
                className="text-xs p-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                title="Copy variable"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Use these variables for promotional messages and marketing campaigns.
        </p>
      </div>


      {/* Variable Usage Guide */}
      <div className="bg-[#F5F2E8] border border-[#D4AF37] rounded-lg p-4">
        <h4 className="font-medium text-[#8B7A1A] mb-2">How to Use Variables</h4>
        <div className="text-sm text-[#8B7A1A] space-y-1">
          <p>• Click any variable button to insert it into your template</p>
          <p>• Variables will appear as <code className="bg-white px-1 rounded">{'{{variable_name}}'}</code></p>
          <p>• Marketing variables: Promotional messages and campaigns</p>
          <p>• All templates created here are Marketing templates</p>
        </div>
      </div>
    </div>
  );
}