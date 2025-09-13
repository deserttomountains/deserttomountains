/**
 * Simple Template Preview Component
 * Shows real-time preview of template with variable substitution
 */

'use client';

import React from 'react';
import { MessageSquare, Instagram, Smartphone } from 'lucide-react';
import { CreateTemplateRequest } from '@/lib/messaging/template-management';

interface SimpleTemplatePreviewProps {
  template: CreateTemplateRequest;
  variables: Record<string, string>;
  className?: string;
  onVariableClick?: (variable: string) => void;
}

type PreviewStyle = 'whatsapp' | 'instagram' | 'plain';

export default function SimpleTemplatePreview({
  template,
  variables,
  className = '',
  onVariableClick
}: SimpleTemplatePreviewProps) {
  const [previewStyle, setPreviewStyle] = React.useState<PreviewStyle>('whatsapp');

  // Function to get fallback value for missing variables
  const getFallbackValue = (varName: string): string => {
    // Check if this is a customer name variable (numbered or named)
    const isCustomerName = varName === '1' || 
      varName.toLowerCase().includes('customer_name') ||
      varName.toLowerCase().includes('user_name') ||
      varName.toLowerCase().includes('name') ||
      varName.toLowerCase().includes('first_name');
    
    if (isCustomerName) {
      return "Sir/Ma'am";
    }
    
    // For other variables, show the variable name in brackets
    return `[${varName}]`;
  };

  // Generate preview content by substituting variables
  const generatePreviewContent = () => {
    let content = '';
    
    // Get text from all components
    template.components.forEach(component => {
      if (component.type === 'TEXT' && component.text) {
        content += component.text + '\n\n';
      }
    });
    
    // Find all variables in the template
    const allVariables = content.match(/\{\{([^}]+)\}\}/g) || [];
    const uniqueVariables = [...new Set(allVariables.map(match => match.slice(2, -2).trim()))];
    
    // Replace variables with actual values or fallbacks
    uniqueVariables.forEach(varName => {
      const value = variables[varName];
      const placeholder = `{{${varName}}}`;
      
      if (value && value.trim()) {
        content = content.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
      } else {
        // Check if this is a customer name variable and provide fallback
        const fallbackValue = getFallbackValue(varName);
        content = content.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fallbackValue);
      }
    });
    
    return content.trim();
  };

  const previewContent = generatePreviewContent();

  // Get buttons from components
  const getButtons = () => {
    const buttonsComponent = template.components.find(comp => comp.type === 'BUTTONS');
    let buttons = buttonsComponent?.buttons || [];
    
    // For Instagram preview, convert phone number buttons to URL buttons with tel: links
    if (previewStyle === 'instagram') {
      buttons = buttons.map(button => {
        if (button.type === 'PHONE_NUMBER') {
          return {
            ...button,
            type: 'URL' as const,
            url: button.url ? `tel:${button.url}` : `tel:`
          };
        }
        return button;
      });
    }
    
    return buttons;
  };

  // Get media (images/videos) from components
  const getMedia = () => {
    const mediaComponent = template.components.find(comp => comp.mediaUrl && (comp.format === 'IMAGE' || comp.format === 'VIDEO'));
    return mediaComponent ? {
      url: mediaComponent.mediaUrl,
      format: mediaComponent.format,
      fileName: mediaComponent.mediaFileName
    } : null;
  };

  const buttons = getButtons();
  const media = getMedia();

  const renderWhatsAppStyle = () => (
    <div className="bg-[#0b141a] rounded-2xl p-4 max-w-sm mx-auto">
      {/* WhatsApp Header */}
      <div className="flex items-center mb-4 pb-3 border-b border-[#2a3942]">
        <div className="w-10 h-10 bg-[#25d366] rounded-full flex items-center justify-center mr-3">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
        </div>
        <div>
          <div className="font-semibold text-white text-sm">WhatsApp</div>
          <div className="text-xs text-[#8696a0]">online</div>
        </div>
      </div>
      
      {/* Message Bubble */}
      <div className="bg-[#202c33] rounded-lg p-3 mb-3 relative">
        <div className="absolute -left-2 top-3 w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-[#202c33]"></div>
        
        {/* Media (Image/Video) */}
        {media && (
          <div className="mb-3">
            {media.format === 'IMAGE' ? (
              <img
                src={media.url}
                alt={media.fileName || 'Template image'}
                className="w-full max-w-[280px] rounded-lg object-cover"
                style={{ maxHeight: '200px' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : media.format === 'VIDEO' ? (
              <video
                src={media.url}
                className="w-full max-w-[280px] rounded-lg"
                style={{ maxHeight: '200px' }}
                controls
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : null}
          </div>
        )}
        
        <div className="text-sm text-white whitespace-pre-wrap leading-relaxed font-normal">
          {previewContent || 'Enter your template content...'}
        </div>
        
        {buttons.length > 0 && (
          <div className="mt-3 space-y-1">
            {buttons.map((button, index) => (
              <div key={index} className="text-[#53bdeb] text-sm text-center font-medium py-1 border-b border-[#2a3942] last:border-b-0">
                <div className="flex items-center justify-center gap-2">
                  {button.type === 'URL' && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M10.59 13.41c.41.39.41 1.03 0 1.42-.39.39-1.03.39-1.42 0a5.003 5.003 0 0 1 0-7.07l3.54-3.54a5.003 5.003 0 0 1 7.07 0 5.003 5.003 0 0 1 0 7.07l-1.49 1.49c.01-.82-.12-1.64-.4-2.42l.47-.48a2.982 2.982 0 0 0 0-4.24 2.982 2.982 0 0 0-4.24 0l-3.53 3.53a2.982 2.982 0 0 0 0 4.24zm2.82-4.24c.39-.39 1.03-.39 1.42 0a5.003 5.003 0 0 1 0 7.07l-3.54 3.54a5.003 5.003 0 0 1-7.07 0 5.003 5.003 0 0 1 0-7.07l1.49-1.49c-.01.82.12 1.64.4 2.42l-.47.48a2.982 2.982 0 0 0 0 4.24 2.982 2.982 0 0 0 4.24 0l3.53-3.53a2.982 2.982 0 0 0 0-4.24z"/>
                    </svg>
                  )}
                  {button.type === 'PHONE_NUMBER' && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                    </svg>
                  )}
                  <span>{button.text || `Button ${index + 1}`}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex justify-end mt-2">
          <div className="text-xs text-[#8696a0]">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderInstagramStyle = () => (
    <div className="bg-[#1a1a1a] rounded-2xl p-4 max-w-sm mx-auto border border-[#262626]">
      {/* Instagram Header */}
      <div className="flex items-center mb-4 pb-3 border-b border-[#262626]">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-full flex items-center justify-center mr-3">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </div>
        <div>
          <div className="font-semibold text-white text-sm">Instagram</div>
          <div className="text-xs text-[#a8a8a8]">Active now</div>
        </div>
      </div>
      
      {/* Message Content */}
      <div className="bg-[#262626] rounded-lg p-3 mb-3 border border-[#3a3a3a] shadow-sm">
        {/* Media (Image/Video) */}
        {media && (
          <div className="mb-3">
            {media.format === 'IMAGE' ? (
              <img
                src={media.url}
                alt={media.fileName || 'Template image'}
                className="w-full max-w-[280px] rounded-lg object-cover"
                style={{ maxHeight: '200px' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : media.format === 'VIDEO' ? (
              <video
                src={media.url}
                className="w-full max-w-[280px] rounded-lg"
                style={{ maxHeight: '200px' }}
                controls
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : null}
          </div>
        )}
        
        <div className="text-sm text-white whitespace-pre-wrap leading-relaxed font-normal">
          {previewContent || 'Enter your template content...'}
        </div>
        
        {buttons.length > 0 && (
          <div className="mt-3 space-y-1">
            {buttons.map((button, index) => {
              // Check if this is a converted phone button (has tel: URL)
              const isPhoneButton = button.type === 'URL' && button.url?.startsWith('tel:');
              
              return (
                <div key={index} className="text-[#0095f6] text-sm text-center font-medium py-1 border-b border-[#3a3a3a] last:border-b-0">
                  <div className="flex items-center justify-center gap-2">
                    {button.type === 'URL' && !isPhoneButton && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10.59 13.41c.41.39.41 1.03 0 1.42-.39.39-1.03.39-1.42 0a5.003 5.003 0 0 1 0-7.07l3.54-3.54a5.003 5.003 0 0 1 7.07 0 5.003 5.003 0 0 1 0 7.07l-1.49 1.49c.01-.82-.12-1.64-.4-2.42l.47-.48a2.982 2.982 0 0 0 0-4.24 2.982 2.982 0 0 0-4.24 0l-3.53 3.53a2.982 2.982 0 0 0 0 4.24zm2.82-4.24c.39-.39 1.03-.39 1.42 0a5.003 5.003 0 0 1 0 7.07l-3.54 3.54a5.003 5.003 0 0 1-7.07 0 5.003 5.003 0 0 1 0-7.07l1.49-1.49c-.01.82.12 1.64.4 2.42l-.47.48a2.982 2.982 0 0 0 0 4.24 2.982 2.982 0 0 0 4.24 0l3.53-3.53a2.982 2.982 0 0 0 0-4.24z"/>
                      </svg>
                    )}
                    {isPhoneButton && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                      </svg>
                    )}
                    <span>{button.text || `Button ${index + 1}`}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#3a3a3a]">
          <div className="flex items-center space-x-3 text-[#a8a8a8]">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12z"/>
            </svg>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21.99 4c0-1.1-.89-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/>
            </svg>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
            </svg>
          </div>
          <div className="text-xs text-[#a8a8a8]">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPlainText = () => (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 max-w-sm mx-auto">
      <div className="flex items-center mb-4 pb-3 border-b border-gray-200">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
          <Smartphone className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <div className="font-semibold text-gray-800 text-sm">Plain Text</div>
          <div className="text-xs text-gray-500">Template Preview</div>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        {/* Media (Image/Video) */}
        {media && (
          <div className="mb-3">
            {media.format === 'IMAGE' ? (
              <img
                src={media.url}
                alt={media.fileName || 'Template image'}
                className="w-full max-w-[280px] rounded-lg object-cover"
                style={{ maxHeight: '200px' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : media.format === 'VIDEO' ? (
              <video
                src={media.url}
                className="w-full max-w-[280px] rounded-lg"
                style={{ maxHeight: '200px' }}
                controls
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : null}
          </div>
        )}
        
        <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed mb-3">
          {previewContent || 'Enter your template content...'}
        </div>
        
        {buttons.length > 0 && (
          <div className="space-y-1">
            {buttons.map((button, index) => {
              // Check if this is a converted phone button (has tel: URL)
              const isPhoneButton = button.type === 'URL' && button.url?.startsWith('tel:');
              
              return (
                <div key={index} className="text-[#0084ff] text-sm text-center font-medium py-1 border-b border-gray-300 last:border-b-0">
                  <div className="flex items-center justify-center gap-2">
                    {button.type === 'URL' && !isPhoneButton && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10.59 13.41c.41.39.41 1.03 0 1.42-.39.39-1.03.39-1.42 0a5.003 5.003 0 0 1 0-7.07l3.54-3.54a5.003 5.003 0 0 1 7.07 0 5.003 5.003 0 0 1 0 7.07l-1.49 1.49c.01-.82-.12-1.64-.4-2.42l.47-.48a2.982 2.982 0 0 0 0-4.24 2.982 2.982 0 0 0-4.24 0l-3.53 3.53a2.982 2.982 0 0 0 0 4.24zm2.82-4.24c.39-.39 1.03-.39 1.42 0a5.003 5.003 0 0 1 0 7.07l-3.54 3.54a5.003 5.003 0 0 1-7.07 0 5.003 5.003 0 0 1 0-7.07l1.49-1.49c-.01.82.12 1.64.4 2.42l-.47.48a2.982 2.982 0 0 0 0 4.24 2.982 2.982 0 0 0 4.24 0l3.53-3.53a2.982 2.982 0 0 0 0-4.24z"/>
                      </svg>
                    )}
                    {isPhoneButton && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                      </svg>
                    )}
                    <span>{button.text || `Button ${index + 1}`}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
        
        {/* Style Toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setPreviewStyle('whatsapp')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
              previewStyle === 'whatsapp' 
                ? 'bg-white shadow-sm text-gray-900' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            title="WhatsApp Preview"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
          </button>
          <button
            onClick={() => setPreviewStyle('instagram')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
              previewStyle === 'instagram' 
                ? 'bg-white shadow-sm text-gray-900' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            title="Instagram Preview"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </button>
          <button
            onClick={() => setPreviewStyle('plain')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
              previewStyle === 'plain' 
                ? 'bg-white shadow-sm text-gray-900' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            title="Plain Text Preview"
          >
            <Smartphone className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
        {previewStyle === 'whatsapp' && renderWhatsAppStyle()}
        {previewStyle === 'instagram' && renderInstagramStyle()}
        {previewStyle === 'plain' && renderPlainText()}
      </div>
    </div>
  );
}
