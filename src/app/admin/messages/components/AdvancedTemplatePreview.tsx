/**
 * Advanced Template Preview Component
 * Provides comprehensive template preview with multiple view modes and features
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  MessageSquare, 
  Smartphone, 
  Monitor, 
  Tablet,
  Copy,
  Download,
  Share2,
  Settings,
  Maximize2,
  Minimize2,
  RotateCcw,
  Play,
  Pause
} from 'lucide-react';
import { WhatsAppTemplate } from '@/lib/messaging/templates';
import { formatVariableValue } from '@/lib/messaging/template-variables';
import { validateTemplateVariables } from '@/lib/messaging/variable-validation';
import TemplatePreview from './TemplatePreview';

interface AdvancedTemplatePreviewProps {
  template: WhatsAppTemplate;
  variables: Record<string, string>;
  className?: string;
  onVariableClick?: (variable: string) => void;
  onCopy?: (content: string) => void;
  onExport?: (format: 'text' | 'html' | 'json') => void;
}

type ViewMode = 'mobile' | 'tablet' | 'desktop';
type PreviewMode = 'whatsapp' | 'plain' | 'html';

export default function AdvancedTemplatePreview({
  template,
  variables,
  className = '',
  onVariableClick,
  onCopy,
  onExport
}: AdvancedTemplatePreviewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('mobile');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('whatsapp');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  // Generate different preview formats
  const generatePreviewContent = (mode: PreviewMode) => {
    let content = template.description;
    
    // Find all variables in the template
    const allVariables = content.match(/\{\{([^}]+)\}\}/g) || [];
    const uniqueVariables = [...new Set(allVariables.map(match => match.slice(2, -2).trim()))];
    
    // Replace variables with actual values or placeholders
    uniqueVariables.forEach(varName => {
      const value = variables[varName];
      const placeholder = `{{${varName}}}`;
      
      if (value && value.trim()) {
        const formattedValue = formatVariableValue(varName, value);
        content = content.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), formattedValue);
      } else {
        content = content.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), `[${varName}]`);
      }
    });
    
    return content;
  };

  const generateHTMLContent = () => {
    const content = generatePreviewContent('html');
    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
        <div style="background: #e7f3ff; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <div style="width: 32px; height: 32px; background: #25d366; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
            </div>
            <div style="font-weight: 600; color: #333;">WhatsApp</div>
          </div>
          <div style="background: white; border-radius: 8px; padding: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
            <div style="font-size: 14px; line-height: 1.4; color: #333; white-space: pre-wrap;">${content}</div>
          </div>
          <div style="font-size: 11px; color: #999; margin-top: 8px;">${new Date().toLocaleTimeString()}</div>
        </div>
      </div>
    `;
  };

  const generateJSONContent = () => {
    return JSON.stringify({
      template: {
        name: template.name,
        category: template.category,
        language: template.language,
        content: generatePreviewContent('plain')
      },
      variables: variables,
      generatedAt: new Date().toISOString()
    }, null, 2);
  };

  // Auto-refresh functionality
  useEffect(() => {
    if (isAutoRefresh) {
      const interval = setInterval(() => {
        // Force re-render by updating a dummy state
        setRefreshInterval(prev => prev);
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [isAutoRefresh, refreshInterval]);

  // Copy to clipboard
  const handleCopy = () => {
    const content = generatePreviewContent('plain');
    navigator.clipboard.writeText(content);
    onCopy?.(content);
  };

  // Export functionality
  const handleExport = (format: 'text' | 'html' | 'json') => {
    let content = '';
    let mimeType = '';
    let filename = '';

    switch (format) {
      case 'text':
        content = generatePreviewContent('plain');
        mimeType = 'text/plain';
        filename = `${template.name}_preview.txt`;
        break;
      case 'html':
        content = generateHTMLContent();
        mimeType = 'text/html';
        filename = `${template.name}_preview.html`;
        break;
      case 'json':
        content = generateJSONContent();
        mimeType = 'application/json';
        filename = `${template.name}_preview.json`;
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onExport?.(format);
  };

  // Get container classes based on view mode
  const getContainerClasses = () => {
    const baseClasses = "transition-all duration-300";
    
    switch (viewMode) {
      case 'mobile':
        return `${baseClasses} max-w-sm mx-auto`;
      case 'tablet':
        return `${baseClasses} max-w-2xl mx-auto`;
      case 'desktop':
        return `${baseClasses} max-w-4xl mx-auto`;
      default:
        return baseClasses;
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${isFullscreen ? 'fixed inset-0 z-50 p-4' : ''} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Eye className="w-5 h-5 text-[#D4AF37]" />
          <h3 className="text-lg font-semibold text-gray-900">Advanced Preview</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('mobile')}
              className={`p-2 rounded ${viewMode === 'mobile' ? 'bg-white shadow-sm' : ''}`}
              title="Mobile View"
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('tablet')}
              className={`p-2 rounded ${viewMode === 'tablet' ? 'bg-white shadow-sm' : ''}`}
              title="Tablet View"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('desktop')}
              className={`p-2 rounded ${viewMode === 'desktop' ? 'bg-white shadow-sm' : ''}`}
              title="Desktop View"
            >
              <Monitor className="w-4 h-4" />
            </button>
          </div>

          {/* Preview Mode Toggle */}
          <select
            value={previewMode}
            onChange={(e) => setPreviewMode(e.target.value as PreviewMode)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
          >
            <option value="whatsapp">WhatsApp Style</option>
            <option value="plain">Plain Text</option>
            <option value="html">HTML Preview</option>
          </select>

          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            className={`p-2 rounded ${isAutoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
            title="Auto Refresh"
          >
            {isAutoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="p-4">
        <div className={getContainerClasses()}>
          {previewMode === 'html' ? (
            <div 
              className="border border-gray-200 rounded-lg overflow-hidden"
              dangerouslySetInnerHTML={{ __html: generateHTMLContent() }}
            />
          ) : (
            <TemplatePreview
              template={template}
              variables={variables}
              showValidation={false}
              showVariableStatus={false}
              showWhatsAppStyle={previewMode === 'whatsapp'}
              onVariableClick={onVariableClick}
            />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 bg-[#F5F2E8] text-[#8B7A1A] rounded-md hover:bg-[#D4AF37] hover:text-white transition-all duration-300"
          >
            <Copy className="w-4 h-4" />
            Copy Text
          </button>
          
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-2 bg-[#F5F2E8] text-[#8B7A1A] rounded-md hover:bg-[#D4AF37] hover:text-white transition-all duration-300">
              <Download className="w-4 h-4" />
              Export
            </button>
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <button
                onClick={() => handleExport('text')}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                Export as Text
              </button>
              <button
                onClick={() => handleExport('html')}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                Export as HTML
              </button>
              <button
                onClick={() => handleExport('json')}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                Export as JSON
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Auto Refresh:</span>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
            disabled={!isAutoRefresh}
          >
            <option value={1000}>1s</option>
            <option value={2000}>2s</option>
            <option value={5000}>5s</option>
            <option value={10000}>10s</option>
          </select>
        </div>
      </div>
    </div>
  );
}

