/**
 * Contact Creation Modal Component
 * Handles creating new contacts with all required fields
 */

"use client";

import { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Instagram, 
  Mail,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Contact } from '@/lib/messaging/types';
import { 
  CONTACT_STATUS_OPTIONS
} from '@/lib/messaging/constants';

interface CreateContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export default function CreateContactModal({ 
  isOpen, 
  onClose, 
  onSubmit 
}: CreateContactModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    email: '',
    phone: '',
    alternatePhone: '',
    channels: {
      whatsapp: '',
      instagram: '',
      email: ''
    },
    tags: [],
    groups: [],
    status: 'active',
    source: 'manual',
    metadata: {
      customFields: {},
      notes: ''
    }
  });

  const [customFields, setCustomFields] = useState<Array<{ key: string; value: string }>>([]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        alternatePhone: '',
        channels: {
          whatsapp: '',
          instagram: '',
          email: ''
        },
        tags: [],
        groups: [],
        status: 'active',
        source: 'manual',
        metadata: {
          customFields: {},
          notes: ''
        }
      });
      setCustomFields([]);
      setSubmitError(null);
    }
  }, [isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleChannelChange = (channel: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: value
      }
    }));
  };


  const handleAddCustomField = () => {
    setCustomFields(prev => [...prev, { key: '', value: '' }]);
  };

  const handleCustomFieldChange = (index: number, field: 'key' | 'value', value: string) => {
    setCustomFields(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleRemoveCustomField = (index: number) => {
    setCustomFields(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return 'Contact name is required';
    }
    
    const hasValidChannel = Object.values(formData.channels).some(value => value.trim());
    if (!hasValidChannel) {
      return 'At least one contact channel is required';
    }
    
    // Validate email format if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'Please enter a valid email address';
    }
    
    // Validate phone format if provided
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      return 'Please enter a valid phone number';
    }
    
    // Validate alternate phone format if provided
    if (formData.alternatePhone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.alternatePhone.replace(/\s/g, ''))) {
      return 'Please enter a valid alternate phone number';
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
      // Build custom fields object
      const customFieldsObj: Record<string, any> = {};
      customFields.forEach(field => {
        if (field.key.trim() && field.value.trim()) {
          customFieldsObj[field.key.trim()] = field.value.trim();
        }
      });

      // Clean up empty channel values
      const cleanedChannels: any = {};
      Object.entries(formData.channels).forEach(([key, value]) => {
        if (value.trim()) {
          cleanedChannels[key] = value.trim();
        }
      });

      const contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'> = {
        ...formData,
        channels: cleanedChannels,
        metadata: {
          ...formData.metadata,
          customFields: customFieldsObj
        }
      };
      
      await onSubmit(contactData);
      onClose();
    } catch (error) {
      console.error('Error creating contact:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to create contact');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-2 pt-16 sm:pt-4 sm:items-center sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[calc(100vh-4rem)] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#D4AF37] bg-gradient-to-r from-[#F5F2E8] to-[#F0EAD6]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-xl flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-[#5E4E06] truncate">Add New Contact</h3>
              <p className="text-xs sm:text-sm text-[#8B7A1A] truncate">Create a new contact for your campaigns</p>
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

          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Basic Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  placeholder="Enter full name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                >
                  {CONTACT_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {CONTACT_STATUS_OPTIONS.find(opt => opt.value === formData.status)?.description}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    Phone Number
                  </div>
                </label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  placeholder="+1234567890"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-600" />
                    Alternate Phone Number
                  </div>
                </label>
                <input
                  type="tel"
                  value={formData.alternatePhone || ''}
                  onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  placeholder="+1234567890"
                />
              </div>
            </div>
          </div>

          {/* Contact Channels */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Contact Channels</h4>
            <p className="text-sm text-gray-600">At least one channel is required</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-green-600" />
                    WhatsApp Number
                  </div>
                </label>
                <input
                  type="tel"
                  value={formData.channels.whatsapp || ''}
                  onChange={(e) => handleChannelChange('whatsapp', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  placeholder="+1234567890"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-pink-600" />
                    Instagram Handle
                  </div>
                </label>
                <input
                  type="text"
                  value={formData.channels.instagram || ''}
                  onChange={(e) => handleChannelChange('instagram', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  placeholder="@username"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    Email Address
                  </div>
                </label>
                <input
                  type="email"
                  value={formData.channels.email || ''}
                  onChange={(e) => handleChannelChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>
            </div>
          </div>


          {/* Custom Fields */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-900">Custom Fields</h4>
              <button
                type="button"
                onClick={handleAddCustomField}
                className="text-sm text-[#D4AF37] hover:text-[#8B7A1A] font-medium"
              >
                + Add Field
              </button>
            </div>
            
            {customFields.map((field, index) => (
              <div key={index} className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={field.key}
                  onChange={(e) => handleCustomFieldChange(index, 'key', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  placeholder="Field name"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    placeholder="Field value"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomField(index)}
                    className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Notes</h4>
            
            <textarea
              value={formData.metadata.notes || ''}
              onChange={(e) => handleInputChange('metadata', { ...formData.metadata, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
              rows={3}
              placeholder="Add any additional notes about this contact..."
            />
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
                <span>Create Contact</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
