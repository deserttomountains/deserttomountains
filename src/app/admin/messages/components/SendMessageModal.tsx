/**
 * Send Message Modal Component
 * Allows sending individual messages to contacts with template selection and variable input
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, Send, MessageSquare, AlertCircle, CheckCircle, Info, Loader2 } from 'lucide-react';
import { Contact } from '@/lib/messaging/types';
import { getAvailableTemplates, WhatsAppTemplate } from '@/lib/messaging/templates';
import { getVariableConfigs, validateVariableValue, formatVariableValue } from '@/lib/messaging/template-variables';
import TemplateVariableInput from './TemplateVariableInput';

interface SendMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
  onSend: (messageData: SendMessageData) => Promise<void>;
}

export interface SendMessageData {
  contactId: string;
  channel: 'whatsapp' | 'instagram' | 'email';
  template?: {
    name: string;
    variables: Record<string, string>;
  };
  text?: string;
}

export default function SendMessageModal({
  isOpen,
  onClose,
  contact,
  onSend
}: SendMessageModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  const [customMessage, setCustomMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<'whatsapp' | 'instagram' | 'email'>('whatsapp');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string>('');
  
  const templates = getAvailableTemplates();
  const selectedTemplateData = templates.find(t => t.name === selectedTemplate);

  // Reset form when modal opens/closes or contact changes
  useEffect(() => {
    if (isOpen && contact) {
      setSelectedTemplate('');
      setTemplateVariables({});
      setCustomMessage('');
      setError(null);
      setPreview('');
      
      // Set default channel based on contact's available channels
      if (contact.channels.whatsapp) {
        setSelectedChannel('whatsapp');
      } else if (contact.channels.instagram) {
        setSelectedChannel('instagram');
      } else if (contact.channels.email) {
        setSelectedChannel('email');
      }
    }
  }, [isOpen, contact]);

  // Update template variables when template changes
  useEffect(() => {
    if (selectedTemplateData) {
      const vars: Record<string, string> = {};
      selectedTemplateData.requiredVars.forEach(varName => {
        vars[varName] = '';
      });
      setTemplateVariables(vars);
    } else {
      setTemplateVariables({});
    }
  }, [selectedTemplateData]);

  // Generate preview when template or variables change
  useEffect(() => {
    if (selectedTemplateData && Object.keys(templateVariables).length > 0) {
      let previewText = selectedTemplateData.description;
      
      // Replace variables in preview
      selectedTemplateData.requiredVars.forEach(varName => {
        const value = templateVariables[varName] || `{{${varName}}}`;
        previewText = previewText.replace(new RegExp(`{{${varName}}}`, 'g'), value);
      });
      
      setPreview(previewText);
    } else if (customMessage) {
      setPreview(customMessage);
    } else {
      setPreview('');
    }
  }, [selectedTemplateData, templateVariables, customMessage]);

  const handleTemplateChange = (templateName: string) => {
    setSelectedTemplate(templateName);
    setCustomMessage(''); // Clear custom message when template is selected
  };

  const handleVariableChange = (variableName: string, value: string) => {
    setTemplateVariables(prev => ({
      ...prev,
      [variableName]: value
    }));
  };

  const handleCustomMessageChange = (value: string) => {
    setCustomMessage(value);
    setSelectedTemplate(''); // Clear template when custom message is entered
  };

  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!selectedTemplate && !customMessage.trim()) {
      errors.push('Please select a template or enter a custom message');
    }

    if (selectedTemplate && selectedTemplateData) {
      // Validate template variables
      selectedTemplateData.requiredVars.forEach(varName => {
        const value = templateVariables[varName];
        const validation = validateVariableValue(varName, value || '');
        
        if (!validation.isValid) {
          errors.push(validation.error || `${varName} is invalid`);
        }
      });
    }

    if (customMessage && customMessage.length > 1000) {
      errors.push('Custom message must be 1000 characters or less');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const handleSend = async () => {
    if (!contact) return;

    const validation = validateForm();
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const messageData: SendMessageData = {
        contactId: contact.id,
        channel: selectedChannel,
        ...(selectedTemplate && selectedTemplateData ? {
          template: {
            name: selectedTemplate,
            variables: templateVariables
          }
        } : {
          text: customMessage
        })
      };

      await onSend(messageData);
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableChannels = () => {
    if (!contact) return [];
    
    const channels: Array<{ value: 'whatsapp' | 'instagram' | 'email'; label: string; available: boolean }> = [
      { value: 'whatsapp', label: 'WhatsApp', available: !!contact.channels.whatsapp },
      { value: 'instagram', label: 'Instagram', available: !!contact.channels.instagram },
      { value: 'email', label: 'Email', available: !!contact.channels.email }
    ];
    
    return channels.filter(ch => ch.available);
  };

  if (!isOpen || !contact) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#D4AF37] rounded-lg">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Send Message</h2>
              <p className="text-sm text-gray-500">to {contact.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Channel Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Send via
            </label>
            <div className="flex gap-2">
              {getAvailableChannels().map((channel) => (
                <button
                  key={channel.value}
                  onClick={() => setSelectedChannel(channel.value)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedChannel === channel.value
                      ? 'bg-[#D4AF37] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {channel.label}
                </button>
              ))}
            </div>
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose Template (Optional)
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            >
              <option value="">Select a template</option>
              {templates.map((template) => (
                <option key={template.name} value={template.name}>
                  {template.description}
                </option>
              ))}
            </select>
          </div>

          {/* Template Variables */}
          {selectedTemplateData && selectedTemplateData.requiredVars.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Template Variables</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedTemplateData.requiredVars.map((varName) => {
                  const variableConfig = getVariableConfigs([varName])[0];
                  
                  if (variableConfig) {
                    return (
                      <TemplateVariableInput
                        key={varName}
                        variable={variableConfig}
                        value={templateVariables[varName] || ''}
                        onChange={(value) => handleVariableChange(varName, value)}
                      />
                    );
                  } else {
                    // Fallback for unknown variables
                    return (
                      <div key={varName}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {varName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </label>
                        <input
                          type="text"
                          value={templateVariables[varName] || ''}
                          onChange={(e) => handleVariableChange(varName, e.target.value)}
                          placeholder={`Enter ${varName}`}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                        />
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          )}

          {/* Custom Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or Enter Custom Message
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => handleCustomMessageChange(e.target.value)}
              placeholder="Type your message here..."
              rows={4}
              maxLength={1000}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] resize-none"
            />
            <div className="text-xs text-gray-500 mt-1">
              {customMessage.length}/1000 characters
            </div>
          </div>

          {/* Preview */}
          {preview && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Preview
              </label>
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-start gap-2">
                  <div className="p-1 bg-[#D4AF37] rounded-full">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{preview}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={isLoading || (!selectedTemplate && !customMessage.trim())}
            className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-white rounded-md hover:bg-[#8B7A1A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Message
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

