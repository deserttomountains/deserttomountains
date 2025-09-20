/**
 * View/Edit Contact Modal Component
 * Handles viewing and editing existing contacts
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
  Loader2,
  Save,
  Package,
  Link
} from 'lucide-react';
import { Contact } from '@/lib/messaging/types';
import { CONTACT_STATUS_OPTIONS } from '@/lib/messaging/constants';
import OrderLinkingModal from './OrderLinkingModal';

// Helper function to safely convert Firestore timestamps to dates
const safeToDate = (dateValue: any): Date => {
  if (!dateValue) return new Date();
  
  // If it's already a Date object
  if (dateValue instanceof Date) return dateValue;
  
  // If it's a Firestore Timestamp
  if (dateValue && typeof dateValue.toDate === 'function') {
    return dateValue.toDate();
  }
  
  // If it's a string or number
  if (typeof dateValue === 'string' || typeof dateValue === 'number') {
    return new Date(dateValue);
  }
  
  // Fallback
  return new Date();
};

interface ViewEditContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
  onUpdate: (contactId: string, contactData: Partial<Contact>) => Promise<void>;
  mode: 'view' | 'edit';
  onModeChange: (mode: 'view' | 'edit') => void;
}

export default function ViewEditContactModal({ 
  isOpen, 
  onClose, 
  contact,
  onUpdate,
  mode,
  onModeChange
}: ViewEditContactModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showOrderLinking, setShowOrderLinking] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Contact>>({});

  // Initialize form data when contact changes
  useEffect(() => {
    if (contact && isOpen) {
      setFormData({
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        alternatePhone: contact.alternatePhone,
        channels: { ...contact.channels },
        status: contact.status,
        metadata: { ...contact.metadata }
      });
    }
  }, [contact, isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({});
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

  const validateForm = (): string | null => {
    if (!formData.name?.trim()) {
      return 'Contact name is required';
    }
    
    const hasValidChannel = Object.values(formData.channels || {}).some(value => value?.trim());
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
    
    if (!contact) return;
    
    const validationError = validateForm();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Clean up empty channel values
      const cleanedChannels: any = {};
      Object.entries(formData.channels || {}).forEach(([key, value]) => {
        if (value?.trim()) {
          cleanedChannels[key] = value.trim();
        }
      });

      const contactData: Partial<Contact> = {
        ...formData,
        channels: cleanedChannels
      };
      
      await onUpdate(contact.id, contactData);
      onModeChange('view');
    } catch (error) {
      console.error('Error updating contact:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to update contact');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle linking orders
  const handleLinkOrders = async (orderIds: string[]) => {
    if (!contact) return;
    
    try {
      const currentLinkedOrders = contact.linkedOrders || [];
      const newLinkedOrders = [...new Set([...currentLinkedOrders, ...orderIds])];
      
      await onUpdate(contact.id, {
        linkedOrders: newLinkedOrders
      });
    } catch (error) {
      console.error('Error linking orders:', error);
      throw error;
    }
  };

  if (!isOpen || !contact) return null;

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
              <h3 className="text-lg sm:text-xl font-bold text-[#5E4E06] truncate">
                {mode === 'view' ? 'View Contact' : 'Edit Contact'}
              </h3>
              <p className="text-xs sm:text-sm text-[#8B7A1A] truncate">
                {mode === 'view' ? 'Contact information' : 'Update contact details'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {mode === 'view' && (
              <button
                onClick={() => onModeChange('edit')}
                className="px-3 py-1 text-sm bg-[#D4AF37] text-white rounded hover:bg-[#8B7A1A] transition-colors"
              >
                Edit
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-2 hover:bg-[#E6DCC0] rounded-lg transition-colors duration-200 flex-shrink-0 touch-manipulation"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-[#8B7A1A]" />
            </button>
          </div>
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
                {mode === 'view' ? (
                  <p className="text-gray-900">{contact.name}</p>
                ) : (
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    placeholder="Enter full name"
                    required
                  />
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                {mode === 'view' ? (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    contact.status === 'active' ? 'bg-green-100 text-green-800' :
                    contact.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                    contact.status === 'unsubscribed' ? 'bg-red-100 text-red-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                  </span>
                ) : (
                  <select
                    value={formData.status || 'active'}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  >
                    {CONTACT_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
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
                {mode === 'view' ? (
                  <p className="text-gray-900">{contact.phone || 'Not provided'}</p>
                ) : (
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    placeholder="+1234567890"
                  />
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-600" />
                    Alternate Phone Number
                  </div>
                </label>
                {mode === 'view' ? (
                  <p className="text-gray-900">{contact.alternatePhone || 'Not provided'}</p>
                ) : (
                  <input
                    type="tel"
                    value={formData.alternatePhone || ''}
                    onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    placeholder="+1234567890"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Contact Channels */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Contact Channels</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-green-600" />
                    WhatsApp Number
                  </div>
                </label>
                {mode === 'view' ? (
                  <p className="text-gray-900">{contact.channels.whatsapp || 'Not provided'}</p>
                ) : (
                  <input
                    type="tel"
                    value={formData.channels?.whatsapp || ''}
                    onChange={(e) => handleChannelChange('whatsapp', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    placeholder="+1234567890"
                  />
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-pink-600" />
                    Instagram Handle
                  </div>
                </label>
                {mode === 'view' ? (
                  <p className="text-gray-900">{contact.channels.instagram || 'Not provided'}</p>
                ) : (
                  <input
                    type="text"
                    value={formData.channels?.instagram || ''}
                    onChange={(e) => handleChannelChange('instagram', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    placeholder="@username"
                  />
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    Email Address
                  </div>
                </label>
                {mode === 'view' ? (
                  <p className="text-gray-900">{contact.channels.email || 'Not provided'}</p>
                ) : (
                  <input
                    type="email"
                    value={formData.channels?.email || ''}
                    onChange={(e) => handleChannelChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    placeholder="email@example.com"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Notes</h4>
            
            {mode === 'view' ? (
              <p className="text-gray-900 whitespace-pre-wrap">
                {contact.metadata?.notes || 'No notes available'}
              </p>
            ) : (
              <textarea
                value={formData.metadata?.notes || ''}
                onChange={(e) => handleInputChange('metadata', { ...formData.metadata, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                rows={3}
                placeholder="Add any additional notes about this contact..."
              />
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Contact Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Source:</span>
                <span className="ml-2 text-gray-600">{contact.source}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Created:</span>
                <span className="ml-2 text-gray-600">{safeToDate(contact.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Last Updated:</span>
                <span className="ml-2 text-gray-600">{safeToDate(contact.updatedAt).toLocaleDateString()}</span>
              </div>
              {contact.lastMessageAt && (
                <div>
                  <span className="font-medium text-gray-700">Last Message:</span>
                  <span className="ml-2 text-gray-600">{safeToDate(contact.lastMessageAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Linked Orders Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-900">Linked Orders</h4>
              <button
                type="button"
                onClick={() => setShowOrderLinking(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-[#D4AF37] text-white rounded-lg hover:bg-[#8B7A1A] transition-colors"
              >
                <Link className="w-4 h-4" />
                Link Orders
              </button>
            </div>
            
            {contact.linkedOrders && contact.linkedOrders.length > 0 ? (
              <div className="space-y-2">
                {contact.linkedOrders.map((orderId, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Package className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-900">Order #{orderId}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No orders linked to this contact</p>
                <p className="text-xs text-gray-500 mt-1">Link orders to enable utility templates</p>
              </div>
            )}
          </div>
        </form>

        {/* Modal Footer */}
        {mode === 'edit' && (
          <div className="flex items-center justify-end space-x-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={() => onModeChange('view')}
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
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Order Linking Modal */}
      <OrderLinkingModal
        isOpen={showOrderLinking}
        onClose={() => setShowOrderLinking(false)}
        contact={contact}
        onLinkOrders={handleLinkOrders}
      />
    </div>
  );
}

