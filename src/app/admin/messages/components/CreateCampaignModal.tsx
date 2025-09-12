/**
 * Campaign Creation Modal Component
 * Handles creating new campaigns with all required fields
 */

"use client";

import { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  Instagram, 
  Users, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { CreateCampaignRequest } from '@/lib/messaging/types';
import { getAvailableTemplates, WhatsAppTemplate } from '@/lib/messaging/templates';
import { getVariableConfigs } from '@/lib/messaging/template-variables';
import TemplateVariableInput from './TemplateVariableInput';
import TemplatePreview from './TemplatePreview';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (campaign: CreateCampaignRequest) => Promise<void>;
  contacts: Array<{ id: string; name: string; channels: any }>;
}

export default function CreateCampaignModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  contacts 
}: CreateCampaignModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  
  const [formData, setFormData] = useState<CreateCampaignRequest>({
    name: '',
    description: '',
    type: 'marketing',
    channel: 'whatsapp',
    template: {
      name: '',
      content: '',
      variables: [],
      lang: 'en'
    },
    recipients: {
      contactIds: [],
      filters: {}
    },
    scheduledAt: undefined
  });

  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [recipientMode, setRecipientMode] = useState<'contacts' | 'filters'>('contacts');

  // Load templates on mount
  useEffect(() => {
    if (isOpen) {
      setTemplates(getAvailableTemplates());
    }
  }, [isOpen]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        description: '',
        type: 'marketing',
        channel: 'whatsapp',
        template: {
          name: '',
          content: '',
          variables: [],
          lang: 'en'
        },
        recipients: {
          contactIds: [],
          filters: {}
        },
        scheduledAt: undefined
      });
      setSelectedTemplate(null);
      setTemplateVariables({});
      setSelectedContacts([]);
      setRecipientMode('contacts');
      setSubmitError(null);
    }
  }, [isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTemplateSelect = (template: WhatsAppTemplate) => {
    setSelectedTemplate(template);
    setFormData(prev => ({
      ...prev,
      template: {
        name: template.name,
        content: template.description,
        variables: template.requiredVars,
        lang: template.language
      }
    }));
    
    // Initialize template variables
    const vars: Record<string, string> = {};
    template.requiredVars.forEach(varName => {
      vars[varName] = '';
    });
    setTemplateVariables(vars);
  };

  const handleTemplateVariableChange = (varName: string, value: string) => {
    setTemplateVariables(prev => ({
      ...prev,
      [varName]: value
    }));
  };

  const handleContactToggle = (contactId: string) => {
    setSelectedContacts(prev => {
      if (prev.includes(contactId)) {
        return prev.filter(id => id !== contactId);
      } else {
        return [...prev, contactId];
      }
    });
  };

  const handleSelectAllContacts = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(contact => contact.id));
    }
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return 'Campaign name is required';
    }
    
    if (!selectedTemplate) {
      return 'Please select a template';
    }
    
    // Validate template variables
    for (const varName of selectedTemplate.requiredVars) {
      if (!templateVariables[varName]?.trim()) {
        return `Template variable "${varName}" is required`;
      }
    }
    
    if (recipientMode === 'contacts' && selectedContacts.length === 0) {
      return 'Please select at least one contact';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const campaignData: CreateCampaignRequest = {
        ...formData,
        recipients: recipientMode === 'contacts' 
          ? { contactIds: selectedContacts }
          : { filters: {} }, // TODO: Implement filters
        template: {
          ...formData.template,
          content: selectedTemplate?.description || formData.template.content
        }
      };
      
      await onSubmit(campaignData);
      onClose();
    } catch (error) {
      console.error('Error creating campaign:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-2 pt-16 sm:pt-4 sm:items-center sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[calc(100vh-4rem)] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#D4AF37] bg-gradient-to-r from-[#F5F2E8] to-[#F0EAD6]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-xl flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-[#5E4E06] truncate">Create New Campaign</h3>
              <p className="text-xs sm:text-sm text-[#8B7A1A] truncate">Set up your messaging campaign</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[#E6DCC0] rounded-lg transition-colors duration-200 flex-shrink-0 touch-manipulation"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-[#8B7A1A]" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Error Display */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                <p className="text-red-700 text-sm font-medium">{submitError}</p>
              </div>
            </div>
          )}

          {/* Campaign Details */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Campaign Details</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  placeholder="Enter campaign name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                >
                  <option value="marketing">Marketing</option>
                  <option value="announcement">Announcement</option>
                  <option value="followup">Follow-up</option>
                  <option value="support">Support</option>
                  <option value="promotional">Promotional</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                rows={3}
                placeholder="Describe your campaign..."
              />
            </div>
          </div>

          {/* Channel Selection */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Channel Selection</h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'whatsapp', label: 'WhatsApp', icon: Phone, color: 'text-green-600' },
                { value: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-600' },
                { value: 'email', label: 'Email', icon: Mail, color: 'text-blue-600' },
                { value: 'multi', label: 'Multi-Channel', icon: Users, color: 'text-purple-600' }
              ].map(({ value, label, icon: Icon, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleInputChange('channel', value)}
                  className={`p-3 border-2 rounded-lg text-center transition-colors ${
                    formData.channel === value
                      ? 'border-[#D4AF37] bg-[#F5F2E8]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${color}`} />
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Template Selection */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Template Selection</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {templates.map((template) => (
                <button
                  key={template.name}
                  type="button"
                  onClick={() => handleTemplateSelect(template)}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    selectedTemplate?.name === template.name
                      ? 'border-[#D4AF37] bg-[#F5F2E8]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900">{template.name}</h5>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      template.category === 'MARKETING' 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {template.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{template.description}</p>
                  {template.requiredVars.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      Variables: {template.requiredVars.join(', ')}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Template Variables */}
          {selectedTemplate && selectedTemplate.requiredVars.length > 0 && (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-gray-900">Template Variables</h4>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {getVariableConfigs(selectedTemplate.requiredVars).map((variable) => (
                    <TemplateVariableInput
                      key={variable.name}
                      variable={variable}
                      value={templateVariables[variable.name] || ''}
                      onChange={(value) => handleTemplateVariableChange(variable.name, value)}
                    />
                  ))}
                </div>
                
                <div className="lg:sticky lg:top-4">
                  <TemplatePreview
                    template={selectedTemplate}
                    variables={templateVariables}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Recipients */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Recipients</h4>
            
            <div className="flex space-x-4 mb-4">
              <button
                type="button"
                onClick={() => setRecipientMode('contacts')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  recipientMode === 'contacts'
                    ? 'bg-[#D4AF37] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Select Contacts
              </button>
              <button
                type="button"
                onClick={() => setRecipientMode('filters')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  recipientMode === 'filters'
                    ? 'bg-[#D4AF37] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Use Filters
              </button>
            </div>

            {recipientMode === 'contacts' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-gray-900">
                    Select Contacts ({selectedContacts.length} selected)
                  </h5>
                  <button
                    type="button"
                    onClick={handleSelectAllContacts}
                    className="text-sm text-[#D4AF37] hover:text-[#8B7A1A] font-medium"
                  >
                    {selectedContacts.length === contacts.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md">
                  {contacts.map((contact) => (
                    <label
                      key={contact.id}
                      className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => handleContactToggle(contact.id)}
                        className="mr-3 rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{contact.name}</div>
                        <div className="text-sm text-gray-500">
                          {Object.entries(contact.channels)
                            .filter(([_, value]) => value)
                            .map(([channel, value]) => `${channel}: ${value}`)
                            .join(', ')}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {recipientMode === 'filters' && (
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  Filter-based recipient selection will be implemented in Phase 2.
                  For now, please use the "Select Contacts" option.
                </p>
              </div>
            )}
          </div>

          {/* Scheduling */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Scheduling (Optional)</h4>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="schedule"
                checked={!!formData.scheduledAt}
                onChange={(e) => {
                  if (e.target.checked) {
                    // Set to tomorrow at 9 AM
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    tomorrow.setHours(9, 0, 0, 0);
                    handleInputChange('scheduledAt', tomorrow);
                  } else {
                    handleInputChange('scheduledAt', undefined);
                  }
                }}
                className="rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
              />
              <label htmlFor="schedule" className="text-sm font-medium text-gray-700">
                Schedule this campaign
              </label>
            </div>
            
            {formData.scheduledAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledAt.toISOString().slice(0, 16)}
                  onChange={(e) => handleInputChange('scheduledAt', new Date(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                />
              </div>
            )}
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-end space-x-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-[#D4AF37] text-white rounded-md hover:bg-[#8B7A1A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Create Campaign</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
