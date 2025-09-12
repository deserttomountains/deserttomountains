/**
 * Template Preview Component
 * Shows real-time preview of template with variable substitution
 */

'use client';

import React from 'react';
import { Eye, MessageSquare, Smartphone, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { WhatsAppTemplate } from '@/lib/messaging/templates';
import { formatVariableValue } from '@/lib/messaging/template-variables';
import { validateTemplateVariables } from '@/lib/messaging/variable-validation';

interface TemplatePreviewProps {
  template: WhatsAppTemplate;
  variables: Record<string, string>;
  className?: string;
  showValidation?: boolean;
  showVariableStatus?: boolean;
  showWhatsAppStyle?: boolean;
  onVariableClick?: (variable: string) => void;
}

export default function TemplatePreview({
  template,
  variables,
  className = '',
  showValidation = true,
  showVariableStatus = true,
  showWhatsAppStyle = true,
  onVariableClick
}: TemplatePreviewProps) {
  
  // Generate preview content by substituting variables
  const generatePreviewContent = () => {
    let content = template.description;
    
    // Find all variables in the template (not just required ones)
    const allVariables = content.match(/\{\{([^}]+)\}\}/g) || [];
    const uniqueVariables = [...new Set(allVariables.map(match => match.slice(2, -2).trim()))];
    
    // Replace variables with actual values or placeholders
    uniqueVariables.forEach(varName => {
      const value = variables[varName];
      const placeholder = `{{${varName}}}`;
      
      if (value && value.trim()) {
        // Use formatted value if available
        const formattedValue = formatVariableValue(varName, value);
        content = content.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), formattedValue);
      } else {
        // Show placeholder in a different style
        content = content.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), `[${varName}]`);
      }
    });
    
    return content;
  };

  // Generate clickable variable content for interactive preview
  const generateInteractiveContent = () => {
    let content = template.description;
    
    // Find all variables in the template
    const allVariables = content.match(/\{\{([^}]+)\}\}/g) || [];
    const uniqueVariables = [...new Set(allVariables.map(match => match.slice(2, -2).trim()))];
    
    // Replace variables with clickable elements
    uniqueVariables.forEach(varName => {
      const value = variables[varName];
      const placeholder = `{{${varName}}}`;
      
      if (value && value.trim()) {
        const formattedValue = formatVariableValue(varName, value);
        const clickableElement = onVariableClick 
          ? `<span class="variable-value cursor-pointer hover:bg-blue-100 px-1 rounded" data-variable="${varName}">${formattedValue}</span>`
          : formattedValue;
        content = content.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), clickableElement);
      } else {
        const clickableElement = onVariableClick
          ? `<span class="variable-placeholder cursor-pointer hover:bg-yellow-100 px-1 rounded bg-yellow-50 text-yellow-700" data-variable="${varName}">[${varName}]</span>`
          : `[${varName}]`;
        content = content.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), clickableElement);
      }
    });
    
    return content;
  };

  const previewContent = generatePreviewContent();
  const interactiveContent = generateInteractiveContent();
  const hasAllVariables = template.requiredVars.every(varName => 
    variables[varName] && variables[varName].trim()
  );

  // Validate template variables
  const validationResult = validateTemplateVariables(template.description, variables);

  // Handle variable clicks
  const handleVariableClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const variable = target.getAttribute('data-variable');
    if (variable && onVariableClick) {
      onVariableClick(variable);
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Eye className="w-5 h-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Template Preview</h3>
        </div>
        <div className="flex items-center gap-3">
          {/* Validation Status */}
          <div className="flex items-center gap-1 text-sm">
            {validationResult.errors.length > 0 ? (
              <>
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-red-600">{validationResult.errors.length} errors</span>
              </>
            ) : validationResult.warnings.length > 0 ? (
              <>
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <span className="text-yellow-600">{validationResult.warnings.length} warnings</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-green-600">Valid</span>
              </>
            )}
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <Smartphone className="w-4 h-4 mr-1" />
            WhatsApp
          </div>
        </div>
      </div>

      {/* Template Info */}
      <div className="mb-4 p-3 bg-gray-50 rounded-md">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">{template.name}</h4>
            <p className="text-sm text-gray-600 capitalize">{template.category}</p>
          </div>
          <div className="text-sm text-gray-500">
            {template.language.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Preview Message */}
      <div className="relative">
        {showWhatsAppStyle ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  {onVariableClick ? (
                    <div 
                      className="text-sm text-gray-900 whitespace-pre-wrap"
                      onClick={handleVariableClick}
                      dangerouslySetInnerHTML={{ __html: interactiveContent }}
                    />
                  ) : (
                    <div className="text-sm text-gray-900 whitespace-pre-wrap">
                      {previewContent}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              {onVariableClick ? (
                <div 
                  className="text-sm text-gray-900 whitespace-pre-wrap"
                  onClick={handleVariableClick}
                  dangerouslySetInnerHTML={{ __html: interactiveContent }}
                />
              ) : (
                <div className="text-sm text-gray-900 whitespace-pre-wrap">
                  {previewContent}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Missing Variables Warning */}
        {!hasAllVariables && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-start">
              <div className="w-5 h-5 text-yellow-600 mr-2 mt-0.5">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Missing Variables</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Some variables are not filled. Complete all required fields to see the full preview.
                </p>
                <div className="mt-2">
                  <div className="text-sm text-yellow-700">
                    Missing: {template.requiredVars.filter(varName => !variables[varName]?.trim()).join(', ')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Validation Details */}
      {showValidation && (validationResult.errors.length > 0 || validationResult.warnings.length > 0) && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Validation Details</h4>
          
          {validationResult.errors.length > 0 && (
            <div className="mb-3">
              <h5 className="text-sm font-medium text-red-800 mb-1">Errors:</h5>
              <ul className="text-sm text-red-700 space-y-1">
                {validationResult.errors.map((error, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertTriangle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {validationResult.warnings.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-yellow-800 mb-1">Warnings:</h5>
              <ul className="text-sm text-yellow-700 space-y-1">
                {validationResult.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertTriangle className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Variable Status */}
      {showVariableStatus && (
        <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Variable Status</h4>
        <div className="space-y-1">
          {template.requiredVars.map(varName => {
            const value = variables[varName];
            const isFilled = value && value.trim();
            return (
              <div key={varName} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{varName}</span>
                <div className="flex items-center">
                  {isFilled ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-green-600">Filled</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                      <span className="text-gray-500">Empty</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        </div>
      )}
    </div>
  );
}

