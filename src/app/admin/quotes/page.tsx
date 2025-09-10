"use client";

import { useState, useEffect, useMemo } from 'react';
import { AuthService, auth, Quote, Lead } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastContext';
import { useAuth } from '@/lib/hooks/useAuth';

import AdminLayout from '../components/AdminLayout';
import { FileText, Plus, Eye, Download, MoreVertical, X, Edit, Trash2, ExternalLink, Search, Filter } from 'lucide-react';
import { downloadQuotePDF, previewQuotePDF } from '@/utils/puppeteerPDFGenerator';

function QuotesPageContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showCreateQuoteModal, setShowCreateQuoteModal] = useState(false);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [quoteMode, setQuoteMode] = useState<'existing' | 'new'>('existing');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [quotesPerPage] = useState(10);
  const [selectedLeadForQuote, setSelectedLeadForQuote] = useState<Lead | null>(null);
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    interest: '',
    source: '',
    addToLeads: true
  });
  const [quoteForm, setQuoteForm] = useState({
    title: '',
    description: '',
    items: [{ productId: '', quantity: 1 }],
    terms: '',
    validUntil: '',
    discount: 0,
    discountType: 'percentage' as 'percentage' | 'amount',
    shippingCharges: 0,
    includeShipping: false,
    paymentLink: '',
    status: 'draft' as Quote['status'],
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerInterest: ''
  });
  
  // Quote viewer modal state
  const [showQuoteViewerModal, setShowQuoteViewerModal] = useState(false);
  const [selectedQuoteForViewer, setSelectedQuoteForViewer] = useState<Quote | null>(null);
  
  // Edit quote modal state
  const [showEditQuoteModal, setShowEditQuoteModal] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [editForm, setEditForm] = useState({
    items: [{ productId: '', quantity: 1 }],
    validUntil: '',
    discount: 0,
    discountType: 'percentage' as 'percentage' | 'amount',
    shippingCharges: 0,
    includeShipping: false,
    paymentLink: '',
    status: 'draft' as Quote['status']
  });
  
  // Delete quote modal state
  const [showDeleteQuoteModal, setShowDeleteQuoteModal] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null);
  const router = useRouter();
  const { showToast } = useToast();

  // Product database for quotes
  const products = [
    // Aura Products
    {
      id: 'aura-natural',
      name: 'Aura Natural Wall Plaster',
      category: 'Aura',
      price: 499,
      unit: 'per 25 Kg pack',
      description: 'Natural gypsum and cow dung based plaster'
    },
    {
      id: 'aura-pigmented',
      name: 'Aura Pigmented Wall Plaster',
      category: 'Aura',
      price: 689,
      unit: 'per 25 Kg pack',
      description: 'Colored natural plaster with custom shades'
    },
    // Dhunee Products
    {
      id: 'dhunee-100',
      name: 'Dhunee Organic Incense - Small',
      category: 'Dhunee',
      price: 249,
      unit: 'per pack',
      description: 'Natural organic incense sticks'
    },
    {
      id: 'dhunee-200',
      name: 'Dhunee Organic Incense - Large',
      category: 'Dhunee',
      price: 400,
      unit: 'per pack',
      description: 'Natural organic incense sticks'
    }
  ];

  // Company details for quotes
  const companyDetails = {
    name: 'Desert to Mountains',
    logo: '/images/logo/logo_hd.png',
    address: 'HNO. 149, KH NO. 122, SHIKARGARH, JODHPUR, RAJASTHAN, 342001',
    phone: '+91 98765 43210',
    email: 'contact@deserttomountains.com',
    gst: '08DVEPB9224H1ZM'
  };

  // Filtered quotes based on selected status and search term
  const filteredQuotes = useMemo(() => {
    let filtered = quotes;
    
    // First filter by status
    if (selectedStatusFilter !== 'all') {
      filtered = filtered.filter(quote => quote.status === selectedStatusFilter);
    }
    
    // Then filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(quote => 
        quote.customerName?.toLowerCase().includes(searchLower) ||
        quote.customerEmail?.toLowerCase().includes(searchLower) ||
        quote.customerPhone?.toLowerCase().includes(searchLower) ||
        quote.quoteNumber?.toLowerCase().includes(searchLower) ||
        quote.customerInterest?.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [quotes, selectedStatusFilter, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredQuotes.length / quotesPerPage);
  const startIndex = (currentPage - 1) * quotesPerPage;
  const endIndex = startIndex + quotesPerPage;
  const currentQuotes = filteredQuotes.slice(startIndex, endIndex);



  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatusFilter]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of quotes list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load user profile and quotes data
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const profile = await AuthService.getUserProfile(user.uid);
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };

    const loadQuotes = async () => {
      try {
        setQuotesLoading(true);
        const [fetchedQuotes, fetchedLeads] = await Promise.all([
          AuthService.getQuotes(),
          AuthService.getLeads()
        ]);
        
        // Ensure all quotes have valid IDs and filter out any invalid ones
        const validQuotes = fetchedQuotes.filter(q => q && q.id && typeof q.id === 'string');
        
        // Add default values for any missing fields
        const quotesWithDefaults = validQuotes.map(quote => ({
          ...quote,
          createdAt: quote.createdAt || new Date(),
          updatedAt: quote.updatedAt || new Date(),
          isExpired: quote.isExpired || false,
          isEditable: quote.isEditable !== undefined ? quote.isEditable : true
        }));
        
        // Remove duplicates based on ID
        const uniqueQuotes = quotesWithDefaults.filter((quote, index, self) =>
          index === self.findIndex(q => q.id === quote.id)
        );
        
        setQuotes(uniqueQuotes);
        setLeads(fetchedLeads);
      } catch (error) {
        console.error('Error loading quotes:', error);
        showToast('Error loading quotes', 'error');
      } finally {
        setQuotesLoading(false);
        setIsLoading(false);
      }
    };

    loadUserProfile();
    loadQuotes();
  }, [showToast]);

  const handleLogout = async () => {
    try {
      await AuthService.signOut();
      router.push('/logout');
      showToast('Logged out successfully', 'success');
    } catch (error) {
      console.error('Error logging out:', error);
      showToast('Error logging out', 'error');
      // Still redirect to logout page even if there's an error
      router.push('/logout');
    }
  };

  const updateQuoteStatus = async (quoteId: string, newStatus: Quote['status']) => {
    try {
      await AuthService.updateQuoteStatus(quoteId, newStatus);
      
      // Update local state
      setQuotes(prev => prev.map(quote =>
        quote.id === quoteId 
          ? { ...quote, status: newStatus, updatedAt: new Date() }
          : quote
      ));
      
      showToast(`Quote status updated to ${newStatus}`, 'success');
    } catch (error) {
      console.error('Error updating quote status:', error);
      showToast('Error updating quote status', 'error');
    }
  };

  // Quote form helper functions
  const addQuoteItem = () => {
    setQuoteForm(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1 }]
    }));
  };

  const removeQuoteItem = (index: number) => {
    setQuoteForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateQuoteItem = (index: number, field: 'productId' | 'quantity', value: string | number) => {
    setQuoteForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculateQuoteTotal = () => {
    const subtotal = quoteForm.items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);

    const discountAmount = quoteForm.discountType === 'percentage' 
      ? (subtotal * quoteForm.discount) / 100 
      : quoteForm.discount;

    const shippingAmount = quoteForm.includeShipping ? quoteForm.shippingCharges : 0;
    const total = subtotal - discountAmount + shippingAmount;

    return { subtotal, discountAmount, shippingAmount, total };
  };

  // Helper functions for total quantity calculations
  const getProductUnitWeight = (product: any) => {
    if (product.category === 'Aura') {
      return '25 Kg';
    } else if (product.category === 'Dhunee') {
      return product.id.includes('100') ? '100 sticks' : '200 sticks';
    }
    return product.unit || '';
  };

  const calculateTotalWeight = (quantity: number, product: any) => {
    if (product.category === 'Aura') {
      const totalKg = quantity * 25;
      return totalKg >= 1000 ? `${(totalKg / 1000).toFixed(1)} Ton` : `${totalKg} Kg`;
    } else if (product.category === 'Dhunee') {
      const stickCount = product.id.includes('100') ? 100 : 200;
      const totalSticks = quantity * stickCount;
      return `${totalSticks} sticks`;
    }
    return `${quantity} ${product.unit || ''}`;
  };

  const handleSaveQuote = async () => {
    try {
      // Validate required fields
      if (quoteMode === 'existing' && !selectedLeadForQuote) {
        showToast('Please select a lead for the quote', 'error');
        return;
      }

      if (quoteMode === 'new' && (!newCustomerForm.name.trim() || !newCustomerForm.interest.trim() || !newCustomerForm.source.trim())) {
        showToast('Please fill in all required fields', 'error');
        return;
      }

      if (!quoteForm.validUntil) {
        showToast('Please select a valid until date', 'error');
        return;
      }

      if (!quoteForm.paymentLink) {
        showToast('Please provide a payment link', 'error');
        return;
      }

      if (quoteForm.items.some(item => !item.productId)) {
        showToast('Please select products for all items', 'error');
        return;
      }

      showToast('Creating quote...', 'info');

      // Prepare customer data
      let customerId = '';
      let leadId = null;

      if (quoteMode === 'existing' && selectedLeadForQuote) {
        // Use existing lead
        customerId = selectedLeadForQuote.id || '';
        leadId = selectedLeadForQuote.id || null;
      } else {
        // Create new customer/lead if checkbox is checked
        if (newCustomerForm.addToLeads) {
          try {
            const newLead = await AuthService.createLead({
              name: newCustomerForm.name,
              email: newCustomerForm.email,
              phone: newCustomerForm.phone,
              source: newCustomerForm.source,
              interest: newCustomerForm.interest,
              status: 'New Lead',
              notes: `Created from quote creation`,
              createdBy: auth.currentUser?.uid || ''
            }, auth.currentUser?.uid || '');
            
            customerId = newLead;
            leadId = newLead;
          } catch (error) {
            console.warn('Failed to create lead:', error);
            // Continue without lead creation
          }
        }
        
        // Generate a customer ID if no lead was created
        if (!customerId) {
          customerId = `customer_${Date.now()}`;
        }
      }

      // Calculate totals
      const { subtotal, total } = calculateQuoteTotal();

      // Prepare quote data
      const quoteData = {
        quoteNumber: `QT-${Date.now()}`,
        leadId,
        customerId,
        customerName: quoteMode === 'existing' ? selectedLeadForQuote?.name || '' : newCustomerForm.name,
        customerEmail: quoteMode === 'existing' ? selectedLeadForQuote?.email || '' : newCustomerForm.email,
        customerPhone: quoteMode === 'existing' ? selectedLeadForQuote?.phone || '' : newCustomerForm.phone,
        customerInterest: quoteMode === 'existing' ? selectedLeadForQuote?.interest || '' : newCustomerForm.interest,
        items: quoteForm.items,
        subtotal,
        discount: quoteForm.discount,
        discountType: quoteForm.discountType,
        shippingCharges: quoteForm.includeShipping ? quoteForm.shippingCharges : 0,
        includeShipping: quoteForm.includeShipping,
        total,
        validUntil: quoteForm.validUntil,
        paymentLink: quoteForm.paymentLink,
        companyDetails,
        status: 'draft' as const,
        quoteType: 'initial' as const,
        isEditable: true,
        createdBy: auth.currentUser?.uid || '',
        isExpired: false
      };

      // Create quote in database
      const quoteId = await AuthService.createQuote(quoteData, auth.currentUser?.uid || '');

      showToast('Quote created successfully!', 'success');

      // Reset form and close modal
      setShowCreateQuoteModal(false);
      setSelectedLeadForQuote(null);
      setQuoteMode('existing');
      setNewCustomerForm({
        name: '',
        email: '',
        phone: '',
        interest: '',
        source: '',
        addToLeads: true
      });
      setQuoteForm({
        title: '',
        description: '',
        items: [{ productId: '', quantity: 1 }],
        terms: '',
        validUntil: '',
        discount: 0,
        discountType: 'percentage',
        shippingCharges: 0,
        includeShipping: false,
        paymentLink: '',
        status: 'draft',
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerInterest: ''
      });

      // Reload quotes to show the new one
      window.location.reload();
    } catch (error) {
      console.error('Error creating quote:', error);
      showToast('Error creating quote', 'error');
    }
  };

  // Quote Viewer Functions
  const openQuoteViewer = (quote: Quote) => {
    setSelectedQuoteForViewer(quote);
    setShowQuoteViewerModal(true);
  };

  // Edit quote function
  const editQuote = (quote: Quote) => {
    setEditingQuote(quote);
    // Pre-fill the form with existing quote data
    setEditForm({
      items: quote.items || [{ productId: '', quantity: 1 }],
      validUntil: quote.validUntil || '',
      discount: quote.discount || 0,
      discountType: quote.discountType || 'percentage',
      shippingCharges: quote.shippingCharges || 0,
      includeShipping: quote.includeShipping || false,
      paymentLink: quote.paymentLink || '',
      status: quote.status || 'draft'
    });
    setShowEditQuoteModal(true);
    showToast(`Editing quote ${quote.quoteNumber}`, 'success');
  };

  // Edit form helper functions
  const addEditQuoteItem = () => {
    setEditForm(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1 }]
    }));
  };

  const removeEditQuoteItem = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateEditQuoteItem = (index: number, field: 'productId' | 'quantity', value: string | number) => {
    setEditForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // Handle quote editing
  const handleEditQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuote?.id) return;
    
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Calculate new totals based on edited items
      const newSubtotal = editForm.items.reduce((total, item) => {
        const product = products.find(p => p.id === item.productId);
        return total + (product?.price || 0) * item.quantity;
      }, 0);

      const newDiscountAmount = editForm.discountType === 'percentage' 
        ? (newSubtotal * editForm.discount) / 100 
        : editForm.discount;

      const newTotal = newSubtotal - newDiscountAmount + (editForm.includeShipping ? editForm.shippingCharges : 0);

      // Update quote data
      const updatedQuoteData = {
        items: editForm.items,
        validUntil: editForm.validUntil,
        discount: editForm.discount,
        discountType: editForm.discountType,
        shippingCharges: editForm.shippingCharges,
        includeShipping: editForm.includeShipping,
        paymentLink: editForm.paymentLink,
        status: editForm.status,
        subtotal: newSubtotal,
        total: newTotal,
        updatedAt: new Date()
      };

      // Update in Firebase
      await AuthService.updateQuote(editingQuote.id, updatedQuoteData);

      // Update local state
      setQuotes(prev => prev.map(quote => 
        quote.id === editingQuote.id 
          ? { ...quote, ...updatedQuoteData }
          : quote
      ));

      // Reset form and close modal
      setEditForm({
        items: [{ productId: '', quantity: 1 }],
        validUntil: '',
        discount: 0,
        discountType: 'percentage',
        shippingCharges: 0,
        includeShipping: false,
        paymentLink: '',
        status: 'draft'
      });
      setShowEditQuoteModal(false);
      setEditingQuote(null);

      showToast('Quote updated successfully!', 'success');

    } catch (error) {
      console.error('Error updating quote:', error);
      showToast('Failed to update quote', 'error');
    }
  };

  // Delete quote function
  const deleteQuote = async (quote: Quote) => {
    if (!quote.id) {
      showToast('Cannot delete quote: No ID found', 'error');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete the quote "${quote.quoteNumber}"?\n\nThis action cannot be undone.`
    );

    if (confirmed) {
      try {
        await AuthService.deleteQuote(quote.id);
        setQuotes(prev => prev.filter(q => q.id !== quote.id));
        showToast('Quote deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting quote:', error);
        showToast('Failed to delete quote', 'error');
      }
    }
  };

  // Helper function to convert dates for display
  const formatDateForDisplay = (dateValue: any): string => {
    try {
      const convertToDate = (dateValue: any): Date => {
        if (dateValue instanceof Date) {
          return dateValue;
        }
        // Handle Firestore Timestamp
        if (dateValue && typeof dateValue === 'object' && dateValue.toDate) {
          return dateValue.toDate();
        }
        // Handle string dates
        if (typeof dateValue === 'string') {
          return new Date(dateValue);
        }
        // Fallback to current date
        return new Date();
      };
      
      const date = convertToDate(dateValue);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  // PDF Generation Functions
  const transformQuoteForPDF = (quote: Quote) => {
    // Convert Firestore Timestamp to JavaScript Date if needed
    const convertToDate = (dateValue: any): Date => {
      if (dateValue instanceof Date) {
        return dateValue;
      }
      // Handle Firestore Timestamp
      if (dateValue && typeof dateValue === 'object' && dateValue.toDate) {
        return dateValue.toDate();
      }
      // Handle string dates
      if (typeof dateValue === 'string') {
        return new Date(dateValue);
      }
      // Fallback to current date
      return new Date();
    };

    return {
      id: quote.id,
      quoteNumber: quote.quoteNumber,
      version: 1, // Default version for PDF generation
      customerName: quote.customerName,
      customerEmail: quote.customerEmail,
      customerPhone: quote.customerPhone,
      customerInterest: quote.customerInterest,
      items: quote.items,
      subtotal: quote.subtotal,
      discount: quote.discount,
      discountType: quote.discountType,
      shippingCharges: quote.shippingCharges,
      includeShipping: quote.includeShipping,
      total: quote.total,
      validUntil: quote.validUntil,
      paymentLink: quote.paymentLink,
      status: quote.status,
      createdAt: convertToDate(quote.createdAt)
    };
  };

  const handleDownloadPDF = async (quote: Quote) => {
    try {
      showToast('Generating PDF...', 'success');
      
      console.log('Starting PDF generation for quote:', quote.quoteNumber);
      console.log('Original createdAt:', quote.createdAt, 'Type:', typeof quote.createdAt);
      
      const transformedQuote = transformQuoteForPDF(quote);
      console.log('Transformed createdAt:', transformedQuote.createdAt, 'Type:', typeof transformedQuote.createdAt);
      
      await downloadQuotePDF(transformedQuote, products, companyDetails);
      showToast('PDF downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      showToast('Failed to download PDF', 'error');
    }
  };

  const handlePreviewPDF = async (quote: Quote) => {
    try {
      showToast('Opening PDF preview...', 'success');
      
      console.log('Preview - Original createdAt:', quote.createdAt, 'Type:', typeof quote.createdAt);
      
      const transformedQuote = transformQuoteForPDF(quote);
      console.log('Preview - Transformed createdAt:', transformedQuote.createdAt, 'Type:', typeof transformedQuote.createdAt);
      
      await previewQuotePDF(transformedQuote, products, companyDetails);
    } catch (error) {
      console.error('Error previewing PDF:', error);
      showToast('Failed to preview PDF', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F6F0] via-[#F5F2E8] to-[#E6DCC0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  return (
    <AdminLayout userProfile={userProfile} onLogout={handleLogout}>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 mt-4 md:mt-0">
        {/* Header */}
        <div className="bg-white rounded-xl border border-[#D4AF37] p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#D4AF37] rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#5E4E06]">Quotes</h2>
                <p className="text-[#8B7A1A] text-xs sm:text-sm">Manage your professional quotes</p>
              </div>
            </div>
            <button 
              onClick={() => setShowCreateQuoteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-lg hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Quote</span>
            </button>
          </div>
        </div>

                 {/* Quote Analytics */}
         {quotes.length > 0 && (
           <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
             <div className="bg-white rounded-xl border border-[#D4AF37] p-4 shadow-sm">
               <div className="text-2xl font-bold text-[#5E4E06]">
                 {selectedStatusFilter === 'all' ? quotes.length : filteredQuotes.length}
               </div>
               <div className="text-sm text-[#8B7A1A]">
                 {selectedStatusFilter === 'all' ? 'Total Quotes' : `${selectedStatusFilter.charAt(0).toUpperCase() + selectedStatusFilter.slice(1)} Quotes`}
               </div>
             </div>
             <div className="bg-white rounded-xl border border-[#D4AF37] p-4 shadow-sm">
               <div className="text-2xl font-bold text-green-600">
                 {filteredQuotes.filter(q => q.status === 'accepted').length}
               </div>
               <div className="text-sm text-[#8B7A1A]">Accepted</div>
             </div>
             <div className="bg-white rounded-xl border border-[#D4AF37] p-4 shadow-sm">
               <div className="text-2xl font-bold text-[#5E4E06]">
                 ₹{filteredQuotes.reduce((sum, q) => sum + q.total, 0).toLocaleString()}
               </div>
               <div className="text-sm text-[#8B7A1A]">Total Value</div>
             </div>
             <div className="bg-white rounded-xl border border-[#D4AF37] p-4 shadow-sm">
               <div className="text-2xl font-bold text-[#5E4E06]">
                 ₹{filteredQuotes.length > 0 ? Math.round(filteredQuotes.reduce((sum, q) => sum + q.total, 0) / filteredQuotes.length).toLocaleString() : 0}
               </div>
               <div className="text-sm text-[#8B7A1A]">Avg Value</div>
             </div>
             <div className="bg-white rounded-xl border border-[#D4AF37] p-4 shadow-sm">
               <div className="text-2xl font-bold text-blue-600">
                 {filteredQuotes.length > 0 ? Math.round((filteredQuotes.filter(q => q.status === 'accepted').length / filteredQuotes.length) * 100) : 0}%
               </div>
               <div className="text-sm text-[#8B7A1A]">Conversion Rate</div>
             </div>
           </div>
         )}

                  {/* Quotes Content */}
         <div className="bg-white rounded-xl border border-[#D4AF37] shadow-sm p-4 sm:p-6">
           {quotesLoading ? (
             <div className="text-center py-16">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
               <p className="text-[#8B7A1A]">Loading quotes...</p>
             </div>
           ) : (
             <div className="space-y-4">
               {/* Search Bar */}
               <div className="bg-white rounded-xl border border-[#D4AF37] shadow-sm p-4 sm:p-6">
                 <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                   <div className="flex-1">
                     <div className="relative">
                       <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B7A1A] w-4 h-4" />
                       <input
                         type="text"
                         placeholder="Search quotes by customer name, email, phone, quote number..."
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         className="w-full pl-10 pr-4 py-2 border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06]"
                       />
                       {searchTerm.trim() && (
                         <button
                           onClick={() => setSearchTerm('')}
                           className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-[#8B7A1A] hover:text-[#5E4E06] transition-colors"
                           title="Clear search"
                         >
                           <X className="w-4 h-4" />
                         </button>
                       )}
                     </div>
                   </div>
                   <div className="flex items-center gap-2 text-sm text-[#8B7A1A]">
                     <Filter className="w-4 h-4" />
                     <span>
                       Showing {startIndex + 1}-{Math.min(endIndex, filteredQuotes.length)} of {filteredQuotes.length} quotes
                     </span>
                   </div>
                 </div>
               </div>

               {/* Quote Status Filter */}
               <div className="space-y-4">
                 <div className="flex flex-wrap gap-2">
                   {['all', 'draft', 'sent', 'accepted', 'rejected', 'expired'].map((status) => (
                     <button
                       key={status}
                       onClick={() => setSelectedStatusFilter(status)}
                       className={`px-3 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                         selectedStatusFilter === status
                           ? 'bg-[#D4AF37] text-white' 
                           : 'bg-[#F5F2E8] text-[#8B7A1A] hover:bg-[#D4AF37] hover:text-white'
                       }`}
                     >
                       {status.charAt(0).toUpperCase() + status.slice(1)} ({quotes.filter(q => status === 'all' || q.status === status).length})
                     </button>
                   ))}
                 </div>
                 
                 {/* Filter Summary */}
                 {selectedStatusFilter !== 'all' && (
                   <div className="flex items-center justify-between p-3 bg-[#F5F2E8] rounded-lg border border-[#D4AF37]">
                     <div className="flex items-center gap-2">
                       <span className="text-sm font-medium text-[#8B7A1A]">Filtered by:</span>
                       <span className="px-2 py-1 bg-[#D4AF37] text-white text-sm font-medium rounded-full">
                         {selectedStatusFilter.charAt(0).toUpperCase() + selectedStatusFilter.slice(1)}
                       </span>
                     </div>
                     <button
                       onClick={() => setSelectedStatusFilter('all')}
                       className="text-sm text-[#8B7A1A] hover:text-[#5E4E06] underline cursor-pointer"
                     >
                       Clear Filter
                     </button>
                   </div>
                 )}
               </div>

               {/* Quotes List or No Data Card */}
               {currentQuotes.length === 0 ? (
                 <div className="border border-[#D4AF37] rounded-lg p-8 text-center">
                   {quotes.length === 0 ? (
                     <>
                       <FileText className="w-16 h-16 text-[#D4AF37] mx-auto mb-4 opacity-60" />
                       <h3 className="text-lg font-semibold text-[#5E4E06] mb-2">
                         No Quotations Yet
                       </h3>
                       <p className="text-[#8B7A1A] mb-4">
                         Create your first professional quote to get started.
                       </p>
                       <button 
                         onClick={() => setShowCreateQuoteModal(true)}
                         className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-lg hover:scale-105 transition-all duration-200 cursor-pointer"
                       >
                         Create Quote
                       </button>
                     </>
                   ) : searchTerm.trim() ? (
                     <>
                       <Search className="w-16 h-16 text-[#8B7A1A] mx-auto mb-4 opacity-60" />
                       <h3 className="text-lg font-semibold text-[#5E4E06] mb-2">
                         No Quotes Found
                       </h3>
                       <p className="text-[#8B7A1A] mb-4">
                         No quotes match your search terms. Try adjusting your search or filters.
                       </p>
                       <div className="flex gap-2 justify-center">
                         <button 
                           onClick={() => setSearchTerm('')}
                           className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#8B7A1A] transition-colors"
                         >
                           Clear Search
                         </button>
                         {selectedStatusFilter !== 'all' && (
                           <button 
                             onClick={() => setSelectedStatusFilter('all')}
                             className="px-4 py-2 bg-[#F5F2E8] text-[#5E4E06] border border-[#D4AF37] rounded-lg hover:bg-[#FFFBEA] transition-colors"
                           >
                             Clear Filter
                           </button>
                         )}
                       </div>
                     </>
                   ) : (
                     <>
                       <FileText className="w-16 h-16 text-[#D4AF37] mx-auto mb-4 opacity-60" />
                       <h3 className="text-lg font-semibold text-[#5E4E06] mb-2">
                         No {selectedStatusFilter.charAt(0).toUpperCase() + selectedStatusFilter.slice(1)} Quotes
                       </h3>
                       <p className="text-[#8B7A1A] mb-4">
                         There are no quotes with status "{selectedStatusFilter.charAt(0).toUpperCase() + selectedStatusFilter.slice(1)}" yet.
                       </p>
                       <button 
                         onClick={() => setShowCreateQuoteModal(true)}
                         className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-lg hover:scale-105 transition-all duration-200 cursor-pointer"
                       >
                         Create Quote
                       </button>
                     </>
                   )}
                 </div>
               ) : (
                 <div className="space-y-3">
                   {currentQuotes
                     .filter(quote => quote && quote.id && typeof quote.id === 'string')
                     .map((quote) => (
                       <div key={quote.id} className="border border-[#D4AF37] rounded-lg p-4 hover:shadow-md transition-shadow">
                         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                           <div className="flex-1">
                             <div className="flex items-center gap-3 mb-2">
                               <span className="font-bold text-[#5E4E06]">{quote.quoteNumber}</span>
                               <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                 quote.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                                 quote.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                                 quote.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                 quote.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                 'bg-yellow-100 text-yellow-800'
                               }`}>
                                 {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                               </span>
                               {quote.isExpired && (
                                 <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                   Expired
                                 </span>
                               )}
                             </div>
                             <p className="font-semibold text-[#5E4E06] mb-1">{quote.customerName}</p>
                             <p className="text-sm text-[#8B7A1A] mb-2">Interested in {quote.customerInterest}</p>
                             <div className="flex items-center gap-4 text-xs text-[#8B7A1A]">
                               <span>Total: ₹{quote.total.toLocaleString()}</span>
                               <span>Valid until: {new Date(quote.validUntil).toLocaleDateString()}</span>
                             </div>
                           </div>
                           <div className="flex items-center gap-2">
                             <button 
                               onClick={() => openQuoteViewer(quote)}
                               className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                               title="View Quote"
                             >
                               <Eye className="w-4 h-4" />
                             </button>
                                                        <button 
                             onClick={() => handlePreviewPDF(quote)}
                             className="p-2 text-[#D4AF37] hover:bg-[#F5F2E8] rounded-lg transition-colors cursor-pointer"
                             title="Preview PDF"
                           >
                             <FileText className="w-4 h-4" />
                           </button>
                           <button 
                             onClick={() => handleDownloadPDF(quote)}
                             className="p-2 text-[#8B7A1A] hover:bg-[#F5F2E8] rounded-lg transition-colors cursor-pointer"
                             title="Download PDF"
                           >
                             <Download className="w-4 h-4" />
                           </button>
                             <button 
                               onClick={() => editQuote(quote)}
                               className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                               title="Edit Quote"
                             >
                               <Edit className="w-4 h-4" />
                             </button>
                             <button 
                               onClick={() => {
                                 setQuoteToDelete(quote);
                                 setShowDeleteQuoteModal(true);
                               }}
                               className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                               title="Delete Quote"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                           </div>
                         </div>
                       </div>
                     ))}
                 </div>
               )}
             </div>
           )}
         </div>



         {/* Pagination */}
         {filteredQuotes.length > 0 && (
           <div className="mt-6">
             <div className="bg-white rounded-xl border border-[#D4AF37] shadow-sm p-4 sm:p-6">
               <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                 <div className="text-sm text-[#8B7A1A]">
                   {totalPages > 1 ? `Page ${currentPage} of ${totalPages}` : `Showing all ${filteredQuotes.length} quotes`}
                 </div>
                 {totalPages > 1 && (
                   <div className="flex items-center gap-2">
                     {/* Previous Button */}
                     <button
                       onClick={() => handlePageChange(currentPage - 1)}
                       disabled={currentPage === 1}
                       className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                         currentPage === 1
                           ? 'text-[#8B7A1A] bg-[#F5F2E8] cursor-not-allowed'
                           : 'text-[#5E4E06] bg-[#FFFBEA] hover:bg-[#F5F2E8] border border-[#D4AF37]'
                       }`}
                     >
                       Previous
                     </button>

                   {/* Page Numbers */}
                   <div className="flex items-center gap-1">
                     {(() => {
                       const pages = [];
                       const maxVisiblePages = 5;
                       let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                       let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

                       // Adjust start page if we're near the end
                       if (endPage - startPage + 1 < maxVisiblePages) {
                         startPage = Math.max(1, endPage - maxVisiblePages + 1);
                       }

                       // First page
                       if (startPage > 1) {
                         pages.push(
                           <button
                             key={1}
                             onClick={() => handlePageChange(1)}
                             className="px-3 py-2 rounded-lg text-sm font-medium text-[#5E4E06] bg-[#FFFBEA] hover:bg-[#F5F2E8] border border-[#D4AF37] transition-colors"
                           >
                             1
                           </button>
                         );
                         if (startPage > 2) {
                           pages.push(
                             <span key="ellipsis1" className="px-2 text-[#8B7A1A]">
                               ...
                             </span>
                           );
                         }
                       }

                       // Middle pages
                       for (let i = startPage; i <= endPage; i++) {
                         pages.push(
                           <button
                             key={i}
                             onClick={() => handlePageChange(i)}
                             className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                               i === currentPage
                                 ? 'text-white bg-[#D4AF37] border border-[#D4AF37]'
                                 : 'text-[#5E4E06] bg-[#FFFBEA] hover:bg-[#F5F2E8] border border-[#D4AF37]'
                             }`}
                           >
                             {i}
                           </button>
                         );
                       }

                       // Last page
                       if (endPage < totalPages) {
                         if (endPage < totalPages - 1) {
                           pages.push(
                             <span key="ellipsis2" className="px-2 text-[#8B7A1A]">
                               ...
                             </span>
                           );
                         }
                         pages.push(
                           <button
                             key={totalPages}
                             onClick={() => handlePageChange(totalPages)}
                             className="px-3 py-2 rounded-lg text-sm font-medium text-[#5E4E06] bg-[#FFFBEA] hover:bg-[#F5F2E8] border border-[#D4AF37] transition-colors"
                           >
                             {totalPages}
                           </button>
                         );
                       }

                       return pages;
                     })()}
                   </div>

                   {/* Next Button */}
                   <button
                     onClick={() => handlePageChange(currentPage + 1)}
                     disabled={currentPage === totalPages}
                     className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                       currentPage === totalPages
                         ? 'text-[#8B7A1A] bg-[#F5F2E8] cursor-not-allowed'
                         : 'text-[#5E4E06] bg-[#FFFBEA] hover:bg-[#F5F2E8] border border-[#D4AF37]'
                     }`}
                   >
                     Next
                   </button>
                   </div>
                 )}
               </div>
             </div>
           </div>
         )}

        {/* Create Quote Modal - Mobile Optimized */}
        {showCreateQuoteModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-1 pt-12 sm:pt-4 sm:items-center sm:p-4">
            <div className="bg-white rounded-xl sm:rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-4xl max-h-[calc(100vh-3rem)] sm:max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header - Mobile Optimized */}
              <div className="flex items-center justify-between p-3 sm:p-6 border-b border-[#D4AF37] bg-gradient-to-r from-[#F5F2E8] to-[#F0EAD6]">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-xl font-bold text-[#5E4E06] truncate">
                      Create Quote
                    </h3>
                    <p className="text-xs sm:text-sm text-[#8B7A1A] truncate">
                      {quoteMode === 'existing' && selectedLeadForQuote 
                        ? `Quote for ${selectedLeadForQuote.name}`
                        : 'Generate professional quote'
                      }
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowCreateQuoteModal(false);
                    setSelectedLeadForQuote(null);
                    setQuoteMode('existing');
                    setNewCustomerForm({
                      name: '',
                      email: '',
                      phone: '',
                      interest: '',
                      source: '',
                      addToLeads: true
                    });
                    setQuoteForm({
                      title: '',
                      description: '',
                      items: [{ productId: '', quantity: 1 }],
                      terms: '',
                      validUntil: '',
                      discount: 0,
                      discountType: 'percentage',
                      shippingCharges: 0,
                      includeShipping: false,
                      paymentLink: '',
                      status: 'draft',
                      customerName: '',
                      customerEmail: '',
                      customerPhone: '',
                      customerInterest: ''
                    });
                  }}
                  className="p-2 hover:bg-[#E6DCC0] rounded-lg transition-colors duration-200 cursor-pointer flex-shrink-0 touch-manipulation"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-[#8B7A1A]" />
                </button>
              </div>

              {/* Modal Body - Mobile Optimized */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
                {/* Customer Selection */}
                <div className="bg-[#F5F2E8] rounded-xl p-3 sm:p-6 border border-[#D4AF37]">
                  <h4 className="text-sm sm:text-lg font-semibold text-[#5E4E06] mb-3 sm:mb-4">Customer Selection</h4>
                  
                  {/* Mode Toggle - Tab Style */}
                  <div className="bg-white rounded-lg sm:rounded-xl border border-[#D4AF37] p-1 mb-3 sm:mb-4">
                    <div className="flex">
                      <button
                        onClick={() => setQuoteMode('existing')}
                        className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-md sm:rounded-lg font-medium transition-all duration-200 cursor-pointer touch-manipulation text-xs sm:text-sm ${
                          quoteMode === 'existing'
                            ? 'bg-[#D4AF37] text-white shadow-sm'
                            : 'bg-transparent text-[#8B7A1A] hover:bg-[#F5F2E8] active:bg-[#E6DCC0]'
                        }`}
                      >
                        Existing Lead
                      </button>
                      <button
                        onClick={() => setQuoteMode('new')}
                        className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-md sm:rounded-lg font-medium transition-all duration-200 cursor-pointer touch-manipulation text-xs sm:text-sm ${
                          quoteMode === 'new'
                            ? 'bg-[#D4AF37] text-white shadow-sm'
                            : 'bg-transparent text-[#8B7A1A] hover:bg-[#F5F2E8] active:bg-[#E6DCC0]'
                        }`}
                      >
                        New Customer
                      </button>
                    </div>
                  </div>

                  {quoteMode === 'existing' ? (
                    /* Existing Lead Selection - Mobile Optimized */
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-xs sm:text-sm font-medium text-[#8B7A1A] mb-1 sm:mb-2">Select Lead</label>
                        <select
                          value={selectedLeadForQuote?.id || ''}
                          onChange={(e) => {
                            if (e.target.value === 'new-aura') {
                              setQuoteMode('new');
                              setSelectedLeadForQuote(null);
                              setNewCustomerForm(prev => ({ ...prev, interest: 'Aura' }));
                              setQuoteForm(prev => ({
                                ...prev,
                                title: `Quote for Customer - Aura`,
                                description: `Professional quote for customer regarding Aura`
                              }));
                            } else if (e.target.value === 'new-dhunee') {
                              setQuoteMode('new');
                              setSelectedLeadForQuote(null);
                              setNewCustomerForm(prev => ({ ...prev, interest: 'Dhunee' }));
                              setQuoteForm(prev => ({
                                ...prev,
                                title: `Quote for Customer - Dhunee`,
                                description: `Professional quote for customer regarding Dhunee`
                              }));
                            } else {
                              const selectedLead = leads.find(lead => lead.id === e.target.value);
                              setSelectedLeadForQuote(selectedLead || null);
                              setQuoteMode('existing');
                              if (selectedLead) {
                                setQuoteForm(prev => ({
                                  ...prev,
                                  title: `Quote for ${selectedLead.name} - ${selectedLead.interest}`,
                                  description: `Professional quote for ${selectedLead.name} regarding ${selectedLead.interest}`
                                }));
                              }
                            }
                          }}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] text-sm sm:text-base touch-manipulation appearance-none bg-white"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23D4AF37' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                            backgroundPosition: 'right 0.75rem center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '1.5em 1.5em',
                            paddingRight: '2.5rem'
                          }}
                        >
                          <option value="">Select a lead...</option>
                          {leads.map((lead) => (
                            <option key={lead.id} value={lead.id}>
                              {lead.name} - {lead.interest} ({lead.status})
                            </option>
                          ))}
                          <option value="new-aura">+ New Customer - Aura</option>
                          <option value="new-dhunee">+ New Customer - Dhunee</option>
                        </select>
                      </div>
                      
                      {selectedLeadForQuote && (
                        <div className="p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border border-[#D4AF37]">
                          <div className="space-y-2 sm:space-y-3">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                              <span className="text-xs sm:text-sm font-medium text-[#8B7A1A]">Name</span>
                              <span className="text-sm sm:text-base font-semibold text-[#5E4E06]">{selectedLeadForQuote.name}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                              <span className="text-xs sm:text-sm font-medium text-[#8B7A1A]">Interest</span>
                              <span className="text-sm sm:text-base font-semibold text-[#5E4E06]">{selectedLeadForQuote.interest}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                              <span className="text-xs sm:text-sm font-medium text-[#8B7A1A]">Email</span>
                              <span className="text-sm sm:text-base font-semibold text-[#5E4E06]">{selectedLeadForQuote.email || 'Not provided'}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                              <span className="text-xs sm:text-sm font-medium text-[#8B7A1A]">Phone</span>
                              <span className="text-sm sm:text-base font-semibold text-[#5E4E06]">{selectedLeadForQuote.phone || 'Not provided'}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* New Customer Form - Mobile Optimized */
                    <div className="space-y-3 sm:space-y-4">
                      {/* Customer Name - Full Width on Mobile */}
                      <div className="space-y-1 sm:space-y-2">
                        <label className="block text-xs sm:text-sm font-medium text-[#8B7A1A] mb-1 sm:mb-2">
                          Customer Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newCustomerForm.name}
                          onChange={(e) => {
                            setNewCustomerForm(prev => ({ ...prev, name: e.target.value }));
                            if (newCustomerForm.interest) {
                              setQuoteForm(prev => ({
                                ...prev,
                                title: `Quote for ${e.target.value} - ${newCustomerForm.interest}`,
                                description: `Professional quote for ${e.target.value} regarding ${newCustomerForm.interest}`
                              }));
                            }
                          }}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] placeholder-[#8B7A1A] text-sm sm:text-base touch-manipulation"
                          placeholder="Enter customer name"
                          required
                          autoComplete="name"
                        />
                      </div>

                      {/* Product Interest - Full Width on Mobile */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-[#8B7A1A] mb-2">
                          Product/Service Interest <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={newCustomerForm.interest}
                          onChange={(e) => {
                            setNewCustomerForm(prev => ({ ...prev, interest: e.target.value }));
                            if (newCustomerForm.name) {
                              setQuoteForm(prev => ({
                                ...prev,
                                title: `Quote for ${newCustomerForm.name} - ${e.target.value}`,
                                description: `Professional quote for ${newCustomerForm.name} regarding ${e.target.value}`
                              }));
                            }
                          }}
                          className="w-full px-4 py-3 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] text-base touch-manipulation appearance-none bg-white"
                          required
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23D4AF37' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                            backgroundPosition: 'right 0.75rem center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '1.5em 1.5em',
                            paddingRight: '2.5rem'
                          }}
                        >
                          <option value="">Select a product...</option>
                          <option value="Aura">Aura - Natural Plaster Solutions</option>
                          <option value="Dhunee">Dhunee - Organic Incense</option>
                        </select>
                      </div>
                      
                      {/* Email and Phone - Stacked on Mobile */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-[#8B7A1A] mb-2">Email</label>
                          <input
                            type="email"
                            value={newCustomerForm.email}
                            onChange={(e) => setNewCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-4 py-3 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] placeholder-[#8B7A1A] text-base touch-manipulation"
                            placeholder="customer@email.com"
                            autoComplete="email"
                            inputMode="email"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-[#8B7A1A] mb-2">Phone</label>
                          <input
                            type="tel"
                            value={newCustomerForm.phone}
                            onChange={(e) => setNewCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full px-4 py-3 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] placeholder-[#8B7A1A] text-base touch-manipulation"
                            placeholder="+91 12345 67890"
                            autoComplete="tel"
                            inputMode="numeric"
                          />
                        </div>
                      </div>
                      
                      {/* Lead Source and Checkbox - Stacked on Mobile */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-[#8B7A1A] mb-2">
                            Lead Source <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={newCustomerForm.source}
                            onChange={(e) => setNewCustomerForm(prev => ({ ...prev, source: e.target.value }))}
                            required
                            className="w-full px-4 py-3 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] text-base touch-manipulation appearance-none bg-white"
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23D4AF37' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                              backgroundPosition: 'right 0.75rem center',
                              backgroundRepeat: 'no-repeat',
                              backgroundSize: '1.5em 1.5em',
                              paddingRight: '2.5rem'
                            }}
                          >
                            <option value="" className="text-[#8B7A1A]">Select source</option>
                            <option value="Website" className="text-[#5E4E06]">Website</option>
                            <option value="Referral" className="text-[#5E4E06]">Referral</option>
                            <option value="Social Media" className="text-[#5E4E06]">Social Media</option>
                            <option value="Cold Call" className="text-[#5E4E06]">Cold Call</option>
                            <option value="Trade Show" className="text-[#5E4E06]">Trade Show</option>
                            <option value="Other" className="text-[#5E4E06]">Other</option>
                          </select>
                        </div>
                        <div className="flex items-center">
                          <label className="flex items-center space-x-2 cursor-pointer touch-manipulation">
                            <input
                              type="checkbox"
                              checked={newCustomerForm.addToLeads}
                              onChange={(e) => setNewCustomerForm(prev => ({ ...prev, addToLeads: e.target.checked }))}
                              className="w-5 h-5 text-[#D4AF37] border-[#D4AF37] rounded focus:ring-[#D4AF37] focus:ring-2"
                            />
                            <span className="text-sm font-medium text-[#5E4E06]">Add to Leads automatically</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quote Details & Items - Mobile Optimized */}
                <div className="bg-[#F5F2E8] rounded-xl p-4 sm:p-6 border border-[#D4AF37]">
                  <h4 className="text-base sm:text-lg font-semibold text-[#5E4E06] mb-4">Quote Details & Items</h4>
                  
                  {/* Valid Until - Full Width on Mobile */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-[#8B7A1A] mb-2">
                      Valid Until <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={quoteForm.validUntil}
                      onChange={(e) => setQuoteForm(prev => ({ ...prev, validUntil: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] text-base touch-manipulation ${
                        !quoteForm.validUntil ? 'border-red-300 bg-red-50' : 'border-[#D4AF37]'
                      }`}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {!quoteForm.validUntil && (
                      <p className="text-red-500 text-xs mt-1">Valid until date is required</p>
                    )}
                  </div>

                  {/* Payment Link - Full Width on Mobile */}
                  <div className="mb-6">
                    <label className="block text-xs sm:text-sm font-medium text-[#8B7A1A] mb-1 sm:mb-2">
                      Payment Link <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2 mb-2">
                      <input
                        type="url"
                        value={quoteForm.paymentLink}
                        onChange={(e) => setQuoteForm(prev => ({ ...prev, paymentLink: e.target.value }))}
                        className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] text-sm sm:text-base touch-manipulation"
                        placeholder="https://razorpay.com/pay/..."
                        required
                        autoComplete="url"
                        inputMode="url"
                      />
                      <button
                        type="button"
                        onClick={() => window.open('https://dashboard.razorpay.com/app/paymentlinks/new', '_blank')}
                        className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-lg sm:rounded-xl hover:scale-105 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap touch-manipulation text-sm sm:text-base"
                        title="Create new payment link in Razorpay dashboard"
                      >
                        <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                        Create Link
                      </button>
                    </div>
                    <p className="text-xs text-[#8B7A1A]">
                      💡 Click "Create Link" to open Razorpay dashboard and create a new payment link, then paste it here.
                    </p>
                  </div>

                  {/* Items Header - Mobile Optimized */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
                    <h5 className="text-base font-semibold text-[#5E4E06]">Quote Items</h5>
                    <button
                      onClick={addQuoteItem}
                      className="w-full sm:w-auto px-4 py-3 bg-[#D4AF37] text-white rounded-xl hover:bg-[#8B7A1A] active:bg-[#8B7A1A] transition-all duration-200 cursor-pointer text-sm font-medium touch-manipulation"
                    >
                      + Add Item
                    </button>
                  </div>
                  
                  {/* Items Grid - Mobile Optimized */}
                  <div className="space-y-3 sm:space-y-4">
                    {quoteForm.items.map((item, index) => {
                      const selectedProduct = products.find(p => p.id === item.productId);
                      return (
                        <div key={index} className="bg-white rounded-lg sm:rounded-xl border border-[#D4AF37] p-3 sm:p-4">
                          <div className="space-y-4">
                            {/* Product Selection - Full Width on Mobile */}
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-[#8B7A1A] mb-2">
                                Product <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={item.productId}
                                onChange={(e) => updateQuoteItem(index, 'productId', e.target.value)}
                                className="w-full px-4 py-3 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] text-base touch-manipulation appearance-none bg-white"
                                required
                                style={{
                                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23D4AF37' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                                  backgroundPosition: 'right 0.75rem center',
                                  backgroundRepeat: 'no-repeat',
                                  backgroundSize: '1.5em 1.5em',
                                  paddingRight: '2.5rem'
                                }}
                              >
                                <option value="">Select a product...</option>
                                {products.map((product) => (
                                  <option key={product.id} value={product.id}>
                                    {product.name} - ₹{product.price.toLocaleString()} {product.unit}
                                  </option>
                                ))}
                              </select>
                            </div>
                            
                            {/* Quantity and Price Row - Stacked on Mobile */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[#8B7A1A] mb-2">Quantity</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => updateQuoteItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                  className="w-full px-4 py-3 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] text-base touch-manipulation"
                                  placeholder="1"
                                  inputMode="numeric"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[#8B7A1A] mb-2">Unit Price</label>
                                <div className="px-4 py-3 bg-[#F5F2E8] border border-[#D4AF37] rounded-xl text-[#5E4E06] text-sm font-medium text-center">
                                  ₹{selectedProduct?.price || 0} {selectedProduct?.unit || ''}
                                </div>
                              </div>
                            </div>
                            
                            {/* Total Quantity Display */}
                            {selectedProduct && (
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[#8B7A1A] mb-2">Total Quantity</label>
                                <div className="px-4 py-3 bg-white border border-[#D4AF37] rounded-xl text-[#5E4E06] text-sm font-medium text-center">
                                  {item.quantity} × {getProductUnitWeight(selectedProduct)} = {calculateTotalWeight(item.quantity, selectedProduct)}
                                </div>
                              </div>
                            )}
                            
                            {/* Remove Button - Full Width on Mobile */}
                            {quoteForm.items.length > 1 && (
                              <div className="flex justify-center sm:justify-end">
                                <button
                                  onClick={() => removeQuoteItem(index)}
                                  className="w-full sm:w-auto px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 active:bg-red-700 transition-all duration-200 cursor-pointer text-sm font-medium touch-manipulation"
                                  title="Remove item"
                                >
                                  Remove Item
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Pricing & Totals - Mobile Optimized */}
                <div className="bg-[#F5F2E8] rounded-xl p-4 sm:p-6 border border-[#D4AF37]">
                  <h4 className="text-base sm:text-lg font-semibold text-[#5E4E06] mb-4">Pricing & Totals</h4>
                  
                  {/* Shipping Charges Section - Mobile Optimized */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-[#8B7A1A]">Shipping Charges</label>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-[#8B7A1A]">Include Shipping</span>
                        <button
                          onClick={() => setQuoteForm(prev => ({ 
                            ...prev, 
                            includeShipping: !prev.includeShipping,
                            shippingCharges: !prev.includeShipping ? prev.shippingCharges : 0
                          }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 ${
                            quoteForm.includeShipping ? 'bg-[#D4AF37]' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            quoteForm.includeShipping ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    </div>
                    
                    {quoteForm.includeShipping && (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={quoteForm.shippingCharges}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          setQuoteForm(prev => ({ 
                            ...prev, 
                            shippingCharges: value
                          }));
                        }}
                        className="w-full px-4 py-3 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] text-base touch-manipulation"
                        placeholder="0.00"
                        inputMode="decimal"
                      />
                    )}
                  </div>

                  {/* Discount Section - Mobile Optimized */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-[#8B7A1A] mb-3">Discount</label>
                    
                    {/* Discount Type Selection - Tab Style */}
                    <div className="bg-white rounded-lg sm:rounded-xl border border-[#D4AF37] p-1 mb-3 sm:mb-4">
                      <div className="flex">
                        <button
                          onClick={() => {
                            setQuoteForm(prev => ({ 
                              ...prev, 
                              discountType: 'percentage',
                              discount: 0
                            }));
                          }}
                          className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-md sm:rounded-lg font-medium transition-all duration-200 cursor-pointer touch-manipulation text-xs sm:text-sm ${
                            quoteForm.discountType === 'percentage'
                              ? 'bg-[#D4AF37] text-white shadow-sm'
                              : 'bg-transparent text-[#8B7A1A] hover:bg-[#F5F2E8] active:bg-[#E6DCC0]'
                          }`}
                        >
                          Percentage (%)
                        </button>
                        <button
                          onClick={() => {
                            setQuoteForm(prev => ({ 
                              ...prev, 
                              discountType: 'amount',
                              discount: 0
                            }));
                          }}
                          className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-md sm:rounded-lg font-medium transition-all duration-200 cursor-pointer touch-manipulation text-xs sm:text-sm ${
                            quoteForm.discountType === 'amount'
                              ? 'bg-[#D4AF37] text-white shadow-sm'
                              : 'bg-transparent text-[#8B7A1A] hover:bg-[#F5F2E8] active:bg-[#E6DCC0]'
                          }`}
                        >
                          Amount (₹)
                        </button>
                      </div>
                    </div>
                    
                    {/* Discount Input - Full Width on Mobile */}
                    <input
                      type="number"
                      min="0"
                      max={quoteForm.discountType === 'percentage' ? 100 : calculateQuoteTotal().subtotal}
                      step={quoteForm.discountType === 'percentage' ? 1 : 0.01}
                      value={quoteForm.discount}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        const maxValue = quoteForm.discountType === 'percentage' ? 100 : calculateQuoteTotal().subtotal;
                        setQuoteForm(prev => ({ 
                          ...prev, 
                          discount: Math.min(value, maxValue)
                        }));
                      }}
                      className="w-full px-4 py-3 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] text-base touch-manipulation"
                      placeholder={quoteForm.discountType === 'percentage' ? '0' : '0.00'}
                      inputMode="decimal"
                    />
                  </div>

                  {/* Total Display - Mobile Optimized */}
                  <div className="p-4 bg-white rounded-xl border border-[#D4AF37]">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-[#8B7A1A]">Subtotal:</span>
                        <span className="font-semibold text-[#5E4E06]">₹{calculateQuoteTotal().subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-[#8B7A1A]">Discount ({quoteForm.discountType === 'percentage' ? `${quoteForm.discount}%` : `₹${quoteForm.discount}`}):</span>
                        <span className="font-semibold text-[#5E4E06]">₹{calculateQuoteTotal().discountAmount.toFixed(2)}</span>
                      </div>
                      {quoteForm.includeShipping ? (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-[#8B7A1A]">Shipping Charges:</span>
                          <span className="font-semibold text-[#5E4E06]">₹{calculateQuoteTotal().shippingAmount.toFixed(2)}</span>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-[#8B7A1A]">Shipping Charges:</span>
                          <span className="text-gray-400 italic">Not included</span>
                        </div>
                      )}
                      <div className="border-t border-[#D4AF37] pt-3">
                        <div className="flex justify-between items-center text-lg font-bold">
                          <span className="text-[#5E4E06]">Total:</span>
                          <span className="text-[#D4AF37] text-xl">₹{calculateQuoteTotal().total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer - Mobile Optimized */}
              <div className="p-3 sm:p-6 border-t border-[#D4AF37] bg-gradient-to-r from-[#F5F2E8] to-[#F0EAD6]">
                {/* Mobile Button Layout - Stacked on Small Screens */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => {
                      setShowCreateQuoteModal(false);
                      setSelectedLeadForQuote(null);
                      setQuoteForm({
                        title: '',
                        description: '',
                        items: [{ productId: '', quantity: 1 }],
                        terms: '',
                        validUntil: '',
                        discount: 0,
                        discountType: 'percentage',
                        shippingCharges: 0,
                        includeShipping: false,
                        paymentLink: '',
                        status: 'draft',
                        customerName: '',
                        customerEmail: '',
                        customerPhone: '',
                        customerInterest: ''
                      });
                    }}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-[#F5F2E8] text-[#8B7A1A] rounded-lg sm:rounded-xl hover:bg-[#E6DCC0] active:bg-[#D4C4A0] transition-all duration-200 font-medium cursor-pointer touch-manipulation text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveQuote}
                    disabled={
                      (quoteMode === 'existing' && !selectedLeadForQuote) ||
                      (quoteMode === 'new' && (!newCustomerForm.name.trim() || !newCustomerForm.interest.trim() || !newCustomerForm.source.trim()))
                    }
                    className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-200 touch-manipulation text-sm sm:text-base ${
                      (quoteMode === 'existing' && !selectedLeadForQuote) ||
                      (quoteMode === 'new' && (!newCustomerForm.name.trim() || !newCustomerForm.interest.trim() || !newCustomerForm.source.trim()))
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white hover:scale-105 active:scale-95 cursor-pointer'
                    }`}
                  >
                    {quoteMode === 'new' 
                      ? 'Create Quote & Lead' 
                      : 'Create Quote'
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Quote Modal */}
        {showEditQuoteModal && editingQuote && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-2 pt-16 sm:pt-4 sm:items-center sm:p-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg sm:max-w-4xl max-h-[calc(100vh-4rem)] sm:max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#D4AF37] bg-gradient-to-r from-[#F5F2E8] to-[#F0EAD6]">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Edit className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-[#5E4E06] truncate">
                      Edit Quote
                    </h3>
                    <p className="text-xs sm:text-sm text-[#8B7A1A] truncate">
                      {editingQuote.quoteNumber} - {editingQuote.customerName}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowEditQuoteModal(false)}
                  className="p-2 hover:bg-[#E6DCC0] rounded-lg transition-colors duration-200 cursor-pointer flex-shrink-0 touch-manipulation"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-[#8B7A1A]" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleEditQuote} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
                {/* Quote Items */}
                <div className="bg-[#F5F2E8] rounded-xl p-4 sm:p-6 border border-[#D4AF37]">
                  <h4 className="text-base sm:text-lg font-semibold text-[#5E4E06] mb-4">Quote Items</h4>
                  <div className="space-y-4">
                    {editForm.items.map((item, index) => (
                      <div key={index} className="flex flex-col sm:flex-row gap-3 p-3 bg-white rounded-lg border border-[#D4AF37]">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-[#5E4E06] mb-2">Product</label>
                          <select
                            value={item.productId}
                            onChange={(e) => updateEditQuoteItem(index, 'productId', e.target.value)}
                            className="w-full p-3 border border-[#D4AF37] rounded-lg bg-white text-[#5E4E06] focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                            required
                          >
                            <option value="">Select Product</option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name} - ₹{product.price} {product.unit}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="w-full sm:w-32">
                          <label className="block text-sm font-medium text-[#5E4E06] mb-2">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateEditQuoteItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-full p-3 border border-[#D4AF37] rounded-lg bg-white text-[#5E4E06] focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                            required
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeEditQuoteItem(index)}
                            disabled={editForm.items.length === 1}
                            className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Remove Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addEditQuoteItem}
                      className="w-full p-3 border-2 border-dashed border-[#D4AF37] rounded-lg text-[#D4AF37] hover:bg-[#F5F2E8] transition-colors cursor-pointer"
                    >
                      + Add Product
                    </button>
                  </div>
                </div>

                {/* Quote Details */}
                <div className="bg-[#F5F2E8] rounded-xl p-4 sm:p-6 border border-[#D4AF37]">
                  <h4 className="text-base sm:text-lg font-semibold text-[#5E4E06] mb-4">Quote Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#5E4E06] mb-2">Valid Until</label>
                      <input
                        type="date"
                        value={editForm.validUntil}
                        onChange={(e) => setEditForm(prev => ({ ...prev, validUntil: e.target.value }))}
                        className="w-full p-3 border border-[#D4AF37] rounded-lg bg-white text-[#5E4E06] focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#5E4E06] mb-2">Status</label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as Quote['status'] }))}
                        className="w-full p-3 border border-[#D4AF37] rounded-lg bg-white text-[#5E4E06] focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                        required
                      >
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                        <option value="expired">Expired</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Pricing & Discount */}
                <div className="bg-[#F5F2E8] rounded-xl p-4 sm:p-6 border border-[#D4AF37]">
                  <h4 className="text-base sm:text-lg font-semibold text-[#5E4E06] mb-4">Pricing & Discount</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#5E4E06] mb-2">Discount</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0"
                          value={editForm.discount}
                          onChange={(e) => setEditForm(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                          className="flex-1 p-3 border border-[#D4AF37] rounded-lg bg-white text-[#5E4E06] focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                        />
                        <select
                          value={editForm.discountType}
                          onChange={(e) => setEditForm(prev => ({ ...prev, discountType: e.target.value as 'percentage' | 'amount' }))}
                          className="w-32 p-3 border border-[#D4AF37] rounded-lg bg-white text-[#5E4E06] focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                        >
                          <option value="percentage">%</option>
                          <option value="amount">₹</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#5E4E06] mb-2">Shipping</label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editForm.includeShipping}
                            onChange={(e) => setEditForm(prev => ({ ...prev, includeShipping: e.target.checked }))}
                            className="w-4 h-4 text-[#D4AF37] border-[#D4AF37] rounded focus:ring-[#D4AF37]"
                          />
                          <span className="text-sm text-[#5E4E06]">Include shipping charges</span>
                        </label>
                        {editForm.includeShipping && (
                          <input
                            type="number"
                            min="0"
                            value={editForm.shippingCharges}
                            onChange={(e) => setEditForm(prev => ({ ...prev, shippingCharges: parseFloat(e.target.value) || 0 }))}
                            placeholder="Shipping amount"
                            className="w-full p-3 border border-[#D4AF37] rounded-lg bg-white text-[#5E4E06] focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Link */}
                <div className="bg-[#F5F2E8] rounded-xl p-4 sm:p-6 border border-[#D4AF37]">
                  <h4 className="text-base sm:text-lg font-semibold text-[#5E4E06] mb-4">Payment Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-[#5E4E06] mb-2">Payment Link</label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={editForm.paymentLink}
                          onChange={(e) => setEditForm(prev => ({ ...prev, paymentLink: e.target.value }))}
                          placeholder="https://payment-link.com"
                          className="flex-1 p-3 border border-[#D4AF37] rounded-lg bg-white text-[#5E4E06] focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => window.open('https://dashboard.razorpay.com/app/paymentlinks/new', '_blank')}
                          className="px-4 py-3 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-lg hover:scale-105 transition-all duration-200 cursor-pointer flex items-center gap-2 whitespace-nowrap"
                          title="Create new payment link in Razorpay dashboard"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Create Link
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-[#8B7A1A]">
                      💡 Click "Create Link" to open Razorpay dashboard and create a new payment link, then paste it here.
                    </p>
                  </div>
                </div>
              </form>

              {/* Modal Footer */}
              <div className="p-4 sm:p-6 border-t border-[#D4AF37] bg-gradient-to-r from-[#F5F2E8] to-[#F0EAD6]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => setShowEditQuoteModal(false)}
                    className="w-full sm:w-auto px-6 py-3 bg-[#F5F2E8] text-[#8B7A1A] rounded-xl hover:bg-[#E6DCC0] active:bg-[#D4C4A0] transition-all duration-200 font-medium cursor-pointer touch-manipulation"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditQuote}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-xl hover:scale-105 active:scale-95 transition-all duration-200 font-medium cursor-pointer touch-manipulation"
                  >
                    Update Quote
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Quote Confirmation Modal */}
        {showDeleteQuoteModal && quoteToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 sm:p-6 rounded-t-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl flex items-center justify-center">
                    <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">Delete Quote</h3>
                    <p className="text-white/80 text-sm">This action cannot be undone</p>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-6">
                <div className="mb-6">
                  <p className="text-[#5E4E06] mb-4">Are you sure you want to delete this quote?</p>
                  <div className="bg-[#F8F6F0] rounded-lg p-4 space-y-2 text-sm">
                    <p><span className="font-medium">Quote Number:</span> {quoteToDelete.quoteNumber}</p>
                    <p><span className="font-medium">Customer:</span> {quoteToDelete.customerName}</p>
                    <p><span className="font-medium">Total:</span> ₹{quoteToDelete.total.toLocaleString()}</p>
                    <p><span className="font-medium">Status:</span> {quoteToDelete.status.charAt(0).toUpperCase() + quoteToDelete.status.slice(1)}</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-6 border-t border-[#F5F2E8] bg-[#F8F6F0]">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteQuoteModal(false);
                      setQuoteToDelete(null);
                    }}
                    className="px-6 py-3 bg-[#8B7A1A] text-white rounded-lg hover:bg-[#5E4E06] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (quoteToDelete) {
                        deleteQuote(quoteToDelete);
                        setShowDeleteQuoteModal(false);
                        setQuoteToDelete(null);
                      }
                    }}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete Quote
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quote Viewer Modal */}
        {showQuoteViewerModal && selectedQuoteForViewer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4AF37]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-white truncate">
                        {selectedQuoteForViewer.quoteNumber} - {selectedQuoteForViewer.customerName}
                      </h3>
                      <p className="text-xs sm:text-sm text-white/80 truncate">
                        {selectedQuoteForViewer.status.charAt(0).toUpperCase() + selectedQuoteForViewer.status.slice(1)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowQuoteViewerModal(false)}
                    className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Quote Content */}
              <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-6">
                  {/* Customer Information */}
                  <div className="bg-[#F8F6F0] rounded-lg p-4">
                    <h4 className="font-semibold text-[#5E4E06] mb-3">Customer Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-[#8B7A1A]">Name:</span>
                        <p className="font-medium text-[#5E4E06]">{selectedQuoteForViewer.customerName}</p>
                      </div>
                      <div>
                        <span className="text-sm text-[#8B7A1A]">Email:</span>
                        <p className="font-medium text-[#5E4E06]">{selectedQuoteForViewer.customerEmail}</p>
                      </div>
                      <div>
                        <span className="text-sm text-[#8B7A1A]">Phone:</span>
                        <p className="font-medium text-[#5E4E06]">{selectedQuoteForViewer.customerPhone}</p>
                      </div>
                      <div>
                        <span className="text-sm text-[#8B7A1A]">Interest:</span>
                        <p className="font-medium text-[#5E4E06]">{selectedQuoteForViewer.customerInterest}</p>
                      </div>
                    </div>
                  </div>

                  {/* Quote Items */}
                  <div className="bg-[#F8F6F0] rounded-lg p-4">
                    <h4 className="font-semibold text-[#5E4E06] mb-3">Quote Items</h4>
                    <div className="space-y-3">
                      {selectedQuoteForViewer.items.map((item, index) => {
                        const product = products.find(p => p.id === item.productId);
                        return (
                          <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-[#5E4E06]">{product?.name || 'Unknown Product'}</p>
                              <p className="text-sm text-[#8B7A1A]">{product?.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-[#5E4E06]">₹{product?.price || 0} × {item.quantity}</p>
                              <p className="text-sm text-[#8B7A1A]">₹{(product?.price || 0) * item.quantity}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="bg-[#F8F6F0] rounded-lg p-4">
                    <h4 className="font-semibold text-[#5E4E06] mb-3">Financial Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[#8B7A1A]">Subtotal:</span>
                        <span className="font-medium text-[#5E4E06]">₹{selectedQuoteForViewer.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-[#8B7A1A]">Discount ({selectedQuoteForViewer.discountType === 'percentage' ? `${selectedQuoteForViewer.discount}%` : `₹${selectedQuoteForViewer.discount}`}):</span>
                        <span className="font-medium text-[#5E4E06]">₹{selectedQuoteForViewer.discountType === 'percentage' ? (selectedQuoteForViewer.subtotal * selectedQuoteForViewer.discount / 100) : selectedQuoteForViewer.discount}</span>
                      </div>
                      {selectedQuoteForViewer.includeShipping ? (
                        <div className="flex justify-between">
                          <span className="text-[#8B7A1A]">Shipping Charges:</span>
                          <span className="font-medium text-[#5E4E06]">₹{selectedQuoteForViewer.shippingCharges}</span>
                        </div>
                      ) : (
                        <div className="flex justify-between">
                          <span className="text-[#8B7A1A]">Shipping Charges:</span>
                          <span className="text-gray-500 italic">Not included</span>
                        </div>
                      )}
                      <div className="border-t border-[#D4AF37] pt-2 mt-2">
                        <div className="flex justify-between font-bold text-lg">
                          <span className="text-[#5E4E06]">Total:</span>
                          <span className="text-[#D4AF37]">₹{selectedQuoteForViewer.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quote Details */}
                  <div className="bg-[#F8F6F0] rounded-lg p-4">
                    <h4 className="font-semibold text-[#5E4E06] mb-3">Quote Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-[#8B7A1A]">Valid Until:</span>
                        <p className="font-medium text-[#5E4E06]">{new Date(selectedQuoteForViewer.validUntil).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-sm text-[#8B7A1A]">Created Date:</span>
                        <p className="font-medium text-[#5E4E06]">
                          {formatDateForDisplay(selectedQuoteForViewer.createdAt)}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-[#8B7A1A]">Quote Number:</span>
                        <p className="font-medium text-[#5E4E06]">{selectedQuoteForViewer.quoteNumber}</p>
                      </div>
                      <div>
                        <span className="text-sm text-[#8B7A1A]">Status:</span>
                        <p className="font-medium text-[#5E4E06]">{selectedQuoteForViewer.status.charAt(0).toUpperCase() + selectedQuoteForViewer.status.slice(1)}</p>
                      </div>
                    </div>
                  </div>

                  {/* PDF Actions */}
                  <div className="bg-[#F8F6F0] rounded-lg p-4">
                    <h4 className="font-semibold text-[#5E4E06] mb-3">PDF Actions</h4>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handlePreviewPDF(selectedQuoteForViewer)}
                        className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#8B7A1A] transition-colors flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Preview PDF
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(selectedQuoteForViewer)}
                        className="px-4 py-2 bg-[#8B7A1A] text-white rounded-lg hover:bg-[#5E4E06] transition-colors flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>


            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default function QuotesPage() {
  const { userProfile, signOut } = useAuth();

  return (
    <AdminLayout userProfile={userProfile} onLogout={signOut}>
      <QuotesPageContent />
    </AdminLayout>
  );
}
