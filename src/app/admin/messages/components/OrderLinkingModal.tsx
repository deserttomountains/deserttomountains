/**
 * Order Linking Modal Component
 * Allows linking orders to contacts with manual entry and auto-matching
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Package,
  User,
  Phone,
  Mail
} from 'lucide-react';
import { Contact } from '@/lib/messaging/types';
import { Order } from '@/lib/firebase';
import { AuthService } from '@/lib/firebase';

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

interface OrderLinkingModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact;
  onLinkOrders: (orderIds: string[]) => Promise<void>;
}

interface MatchedOrder extends Order {
  matchReason: 'email' | 'phone' | 'both';
}

export default function OrderLinkingModal({ 
  isOpen, 
  onClose, 
  contact,
  onLinkOrders 
}: OrderLinkingModalProps) {
  const [activeTab, setActiveTab] = useState<'manual' | 'auto'>('auto');
  const [isLoading, setIsLoading] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Manual entry state
  const [orderIds, setOrderIds] = useState<string[]>(['']);
  const [orderValidation, setOrderValidation] = useState<Record<string, 'valid' | 'invalid' | 'checking' | null>>({});
  
  // Auto-match state
  const [matchedOrders, setMatchedOrders] = useState<MatchedOrder[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [isSearching, setIsSearching] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setOrderIds(['']);
      setOrderValidation({});
      setMatchedOrders([]);
      setSelectedOrders(new Set());
      setError(null);
      setSuccess(null);
      
      // Auto-search for matching orders
      if (activeTab === 'auto') {
        searchMatchingOrders();
      }
    }
  }, [isOpen, activeTab]);

  // Search for orders matching contact details
  const searchMatchingOrders = async () => {
    setIsSearching(true);
    setError(null);
    
    try {
      const allOrders = await AuthService.getOrders();
      
      // Filter orders with successful payment
      const successfulOrders = allOrders.filter(order => 
        order.paymentStatus === 'completed'
      );
      
      // Find matching orders
      const matches: MatchedOrder[] = [];
      
      for (const order of successfulOrders) {
        let matchReason: 'email' | 'phone' | 'both' | null = null;
        
        // Check email match
        const emailMatch = contact.email && order.customerEmail && 
          contact.email.toLowerCase() === order.customerEmail.toLowerCase();
        
        // Check phone match (normalize phone numbers)
        const normalizePhone = (phone: string) => phone.replace(/\D/g, '');
        const contactPhone = contact.phone ? normalizePhone(contact.phone) : '';
        const contactWhatsApp = contact.channels.whatsapp ? normalizePhone(contact.channels.whatsapp) : '';
        const orderPhone = order.customerPhone ? normalizePhone(order.customerPhone) : '';
        
        const phoneMatch = (contactPhone && contactPhone === orderPhone) || 
                          (contactWhatsApp && contactWhatsApp === orderPhone);
        
        if (emailMatch && phoneMatch) {
          matchReason = 'both';
        } else if (emailMatch) {
          matchReason = 'email';
        } else if (phoneMatch) {
          matchReason = 'phone';
        }
        
        if (matchReason) {
          matches.push({
            ...order,
            matchReason
          });
        }
      }
      
      // Sort by order date (newest first)
      matches.sort((a, b) => safeToDate(b.orderDate).getTime() - safeToDate(a.orderDate).getTime());
      
      setMatchedOrders(matches);
      
      if (matches.length === 0) {
        setError('No matching orders found. Try manual entry or check if the contact details match any orders.');
      }
    } catch (error) {
      console.error('Error searching for matching orders:', error);
      setError('Failed to search for matching orders. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Validate order ID
  const validateOrderId = async (orderId: string, index: number) => {
    if (!orderId.trim()) {
      setOrderValidation(prev => ({ ...prev, [index]: null }));
      return;
    }
    
    setOrderValidation(prev => ({ ...prev, [index]: 'checking' }));
    
    try {
      const orders = await AuthService.getOrders();
      const order = orders.find(o => o.orderId === orderId.trim());
      
      if (order && order.paymentStatus === 'completed') {
        setOrderValidation(prev => ({ ...prev, [index]: 'valid' }));
      } else {
        setOrderValidation(prev => ({ ...prev, [index]: 'invalid' }));
      }
    } catch (error) {
      setOrderValidation(prev => ({ ...prev, [index]: 'invalid' }));
    }
  };

  // Add new order ID input
  const addOrderIdInput = () => {
    setOrderIds(prev => [...prev, '']);
  };

  // Remove order ID input
  const removeOrderIdInput = (index: number) => {
    setOrderIds(prev => prev.filter((_, i) => i !== index));
    setOrderValidation(prev => {
      const newValidation = { ...prev };
      delete newValidation[index];
      return newValidation;
    });
  };

  // Handle order ID change
  const handleOrderIdChange = (index: number, value: string) => {
    setOrderIds(prev => prev.map((id, i) => i === index ? value : id));
    
    // Validate after a short delay
    setTimeout(() => {
      validateOrderId(value, index);
    }, 500);
  };

  // Toggle order selection in auto-match
  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  // Link selected orders
  const handleLinkOrders = async () => {
    setIsLinking(true);
    setError(null);
    setSuccess(null);
    
    try {
      let orderIdsToLink: string[] = [];
      
      if (activeTab === 'manual') {
        // Get valid order IDs from manual entry
        orderIdsToLink = orderIds
          .map((id, index) => ({ id: id.trim(), index }))
          .filter(({ id, index }) => id && orderValidation[index] === 'valid')
          .map(({ id }) => id);
      } else {
        // Get selected orders from auto-match
        orderIdsToLink = Array.from(selectedOrders);
      }
      
      if (orderIdsToLink.length === 0) {
        setError('Please select at least one valid order to link.');
        return;
      }
      
      await onLinkOrders(orderIdsToLink);
      setSuccess(`Successfully linked ${orderIdsToLink.length} order(s) to ${contact.name}`);
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Error linking orders:', error);
      setError('Failed to link orders. Please try again.');
    } finally {
      setIsLinking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-2 pt-16 sm:pt-4 sm:items-center sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Link Orders to Contact</h2>
            <p className="text-sm text-gray-600 mt-1">
              Link orders to <span className="font-medium">{contact.name}</span> for utility templates
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contact Info */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{contact.name}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                {contact.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {contact.email}
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {contact.phone}
                  </div>
                )}
                {contact.channels.whatsapp && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    WhatsApp: {contact.channels.whatsapp}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('auto')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'auto'
                ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] bg-[#F5F2E8]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Search className="w-4 h-4" />
              Auto-Match Orders
            </div>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'manual'
                ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] bg-[#F5F2E8]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              Manual Entry
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'auto' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Matching Orders</h3>
                <button
                  onClick={searchMatchingOrders}
                  disabled={isSearching}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-[#D4AF37] text-white rounded-lg hover:bg-[#8B7A1A] transition-colors disabled:opacity-50"
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  {isSearching ? 'Searching...' : 'Search Again'}
                </button>
              </div>
              
              {isSearching ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37] mx-auto mb-2" />
                  <p className="text-gray-600">Searching for matching orders...</p>
                </div>
              ) : matchedOrders.length > 0 ? (
                <div className="space-y-3">
                  {matchedOrders.map((order) => (
                    <div
                      key={order.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedOrders.has(order.id!)
                          ? 'border-[#D4AF37] bg-[#F5F2E8]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleOrderSelection(order.id!)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedOrders.has(order.id!)}
                            onChange={() => toggleOrderSelection(order.id!)}
                            className="w-4 h-4 text-[#D4AF37] border-gray-300 rounded focus:ring-[#D4AF37]"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-gray-500" />
                              <span className="font-medium text-gray-900">Order #{order.orderId}</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                order.matchReason === 'both' 
                                  ? 'bg-green-100 text-green-800'
                                  : order.matchReason === 'email'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {order.matchReason === 'both' ? 'Email + Phone' : 
                                 order.matchReason === 'email' ? 'Email Match' : 'Phone Match'}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">₹{order.finalAmount}</span> • 
                              {safeToDate(order.orderDate).toLocaleDateString()} • 
                              {order.paymentStatus}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Matching Orders Found</h4>
                  <p className="text-gray-600 mb-4">
                    No orders found matching this contact's email or phone number.
                  </p>
                  <p className="text-sm text-gray-500">
                    Try the manual entry tab to link orders by Order ID.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Enter Order IDs</h3>
                <button
                  onClick={addOrderIdInput}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-[#D4AF37] text-white rounded-lg hover:bg-[#8B7A1A] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Order ID
                </button>
              </div>
              
              <div className="space-y-3">
                {orderIds.map((orderId, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={orderId}
                        onChange={(e) => handleOrderIdChange(index, e.target.value)}
                        placeholder="Enter Order ID (e.g., ORD123456)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                      />
                      {orderValidation[index] === 'checking' && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Validating...
                        </div>
                      )}
                      {orderValidation[index] === 'valid' && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          Valid order found
                        </div>
                      )}
                      {orderValidation[index] === 'invalid' && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                          <AlertCircle className="w-3 h-3" />
                          Order not found or payment not completed
                        </div>
                      )}
                    </div>
                    {orderIds.length > 1 && (
                      <button
                        onClick={() => removeOrderIdInput(index)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          </div>
        )}
        
        {success && (
          <div className="mx-6 mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-4 h-4" />
              {success}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleLinkOrders}
            disabled={isLinking || (activeTab === 'manual' && !orderIds.some((id, index) => id.trim() && orderValidation[index] === 'valid')) || (activeTab === 'auto' && selectedOrders.size === 0)}
            className="flex items-center gap-2 px-6 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#8B7A1A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLinking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {isLinking ? 'Linking...' : 'Link Orders'}
          </button>
        </div>
      </div>
    </div>
  );
}
