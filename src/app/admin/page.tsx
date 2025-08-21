"use client";

import { User, Settings, LogOut, Bell, Menu, LayoutDashboard, BarChart3, Users, ShoppingCart, TrendingUp, DollarSign, Calendar, MessageSquare, Phone, UserPlus, Target, Activity, Plus, ArrowUpRight, ArrowDownRight, Minus, MoreVertical, FileText, X, Edit, Trash2, Eye as EyeIcon, Download, Search, ArrowLeft, ArrowRight, Mountain, Truck, Package, CheckCircle, Clock, AlertCircle, Star, Filter, SortAsc, SortDesc, CalendarDays, CheckSquare, Square, Tag, UserCheck, Flag, LayoutGrid, List, Database, Repeat } from 'lucide-react';
import MockChatCRM from './MockChatCRM';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { AuthService, auth, db, Lead, UserProfile, Order, Task, Quote } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js';
import CustomerDetailsDrawer from '@/components/CustomerDetailsDrawer';
import React from 'react';
import { useToast } from '@/components/ToastContext';
import { AdminRouteGuard } from '@/components/RouteGuard';
import app from '@/lib/firebase';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { downloadQuotePDF, previewQuotePDF } from '@/utils/puppeteerPDFGenerator';

// Helper for date formatting (DD/MM/YY HH:MM 24-hour)
function formatShortDateTime(date: Date) {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const d = pad(date.getDate());
  const m = pad(date.getMonth() + 1);
  const y = date.getFullYear().toString().slice(-2);
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${d}/${m}/${y} ${hh}:${mm}`;
}

function AdminDashboardContent() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showAddDealModal, setShowAddDealModal] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [leadForm, setLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    source: '',
    status: 'New Lead',
    interest: '',
    notes: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'thisMonth' | 'last30' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<UserProfile | null>(null);
  const { showToast } = useToast();
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);
  const [showStatusUpdateModal, setShowStatusUpdateModal] = useState(false);
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<Order['status']>('confirmed');
  const [statusUpdateNotes, setStatusUpdateNotes] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [franchiseSubmissions, setFranchiseSubmissions] = useState<any[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [submissionsError, setSubmissionsError] = useState<string | null>(null);
  const [contactSubmissions, setContactSubmissions] = useState<any[]>([]);
  const [isLoadingContact, setIsLoadingContact] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [activeFormTab, setActiveFormTab] = useState<'franchise' | 'contact'>('franchise');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any | null>(null);

  // Lead editing state
  const [showEditLeadModal, setShowEditLeadModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isEditingLead, setIsEditingLead] = useState(false);
  const [isDeletingLead, setIsDeletingLead] = useState(false);

  // Direct Call modal state
  const [showDirectCallModal, setShowDirectCallModal] = useState(false);
  const [selectedLeadForCall, setSelectedLeadForCall] = useState<Lead | null>(null);
  const [showCreateQuoteModal, setShowCreateQuoteModal] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    title: '',
    description: '',
    items: [{ productId: '', quantity: 1 }],
    terms: '',
    validUntil: '',
    discount: 0,
    discountType: 'percentage' as 'percentage' | 'amount',
    paymentLink: '',
    status: 'draft' as 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
  });
  const [quoteMode, setQuoteMode] = useState<'existing' | 'new'>('existing');
  const [selectedLeadForQuote, setSelectedLeadForQuote] = useState<Lead | null>(null);
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    interest: '',
    source: '',
    addToLeads: true
  });

  // Product database for quotes
  const products = [
    // Aura Products
    {
      id: 'aura-natural',
      name: 'Aura Natural Wall Plaster',
      category: 'Aura',
      price: 499,
      unit: 'per sq ft',
      description: 'Natural gypsum and cow dung based plaster'
    },
    {
      id: 'aura-pigmented',
      name: 'Aura Pigmented Wall Plaster',
      category: 'Aura',
      price: 689,
      unit: 'per sq ft',
      description: 'Colored natural plaster with custom shades'
    },
    // Dhunee Products
    {
      id: 'dhunee-100',
      name: 'Dhunee Organic Incense',
      category: 'Dhunee',
      price: 1200,
      unit: 'per pack (100 sticks)',
      description: 'Natural organic incense sticks'
    },
    {
      id: 'dhunee-200',
      name: 'Dhunee Organic Incense',
      category: 'Dhunee',
      price: 2000,
      unit: 'per pack (200 sticks)',
      description: 'Natural organic incense sticks'
    }
  ];

  // Company details for quotes
  const companyDetails = {
    name: 'Desert to Mountains',
    logo: '/images/logo.png',
    address: 'Jodhpur, Rajasthan, India',
    phone: '+91 12345 67890',
    email: 'info@deserttomountains.com',
    gst: '08DVEPB9224H1ZM'
  };

  // Remove local Quote interface - use the Firebase one
  const [leadSearchTerm, setLeadSearchTerm] = useState('');
  const [leadFilterStatus, setLeadFilterStatus] = useState<string>('all');
  const [currentLeadPage, setCurrentLeadPage] = useState(1);
  const [modalLeadsPerPage, setModalLeadsPerPage] = useState(10);
  
  // Recent Leads dropdown state
  const [openLeadDropdown, setOpenLeadDropdown] = useState<string | null>(null);

  // Status filter state
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');

  // Real-time age updates for recent leads only
  const [ageUpdateTrigger, setAgeUpdateTrigger] = useState(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [leadsPerPage, setLeadsPerPage] = useState(10);
  const [showPaginationSettings, setShowPaginationSettings] = useState(false);

  // Update age every minute ONLY for leads created within the last hour
  useEffect(() => {
    // Check if we have any recent leads that need real-time updates
    const hasRecentLeads = leads.some(lead => {
      const created = getDateFromAny(lead.createdAt);
      if (!created) return false;
      
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - created.getTime());
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      
      return diffHours < 1; // Only leads created within the last hour
    });

    // Only start the interval if we have recent leads
    if (hasRecentLeads) {
      const interval = setInterval(() => {
        setAgeUpdateTrigger(prev => prev + 1);
      }, 60000); // Update every minute

      return () => clearInterval(interval);
    }
    
    // If no recent leads, don't start the interval
    return () => {};
  }, [leads]); // Re-run when leads change

  // Filtered leads for search and status
  const filteredLeads = leads.filter(lead => {
    // First apply search filter
    if (searchTerm) {
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        lead.phone.includes(searchTerm) ||
        lead.interest.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.notes && lead.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (!matchesSearch) return false;
    }
    
    // Then apply status filter
    if (selectedStatusFilter !== 'All' && lead.status !== selectedStatusFilter) {
      return false;
    }
    
    return true;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);
  const startIndex = (currentPage - 1) * leadsPerPage;
  const endIndex = startIndex + leadsPerPage;
  const currentLeads = filteredLeads.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatusFilter]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (modalOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [modalOpen]);

  // Task Management State

  const [tasks, setTasks] = useState<Task[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selectedQuoteForActions, setSelectedQuoteForActions] = useState<Quote | null>(null);
  const [showDeleteQuoteModal, setShowDeleteQuoteModal] = useState(false);
  const [quoteAnalytics, setQuoteAnalytics] = useState<{
    total: number;
    byStatus: Record<Quote['status'], number>;
    totalValue: number;
    averageValue: number;
    conversionRate: number;
  } | null>(null);
  const [quoteToDelete, setQuoteToDelete] = useState<{ quote: Quote; deleteAllVersions: boolean } | null>(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskView, setTaskView] = useState<'list' | 'kanban' | 'calendar'>('kanban');
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'overdue'>('all');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');
  const [taskCategoryFilter, setTaskCategoryFilter] = useState<'all' | 'follow_up' | 'meeting' | 'delivery' | 'marketing' | 'support' | 'other'>('all');
  const [taskDateFilter, setTaskDateFilter] = useState<'all' | 'today' | 'tomorrow' | 'this_week' | 'next_week' | 'overdue'>('all');
  const [taskSortBy, setTaskSortBy] = useState<'dueDate' | 'priority' | 'createdAt' | 'title' | 'category'>('dueDate');
  const [taskSortOrder, setTaskSortOrder] = useState<'asc' | 'desc'>('asc');
  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [showTaskAnalytics, setShowTaskAnalytics] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'pending' as Task['status'],
    priority: 'medium' as Task['priority'],
    category: 'follow_up' as Task['category'],
    dueDate: '',
    estimatedTime: '',
    tags: '',
    notes: '',
    relatedToType: '' as 'lead' | 'order' | 'customer' | '',
    relatedToId: '',
    relatedToName: '',
    isRecurring: false,
    recurringType: 'weekly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    recurringInterval: 1,
    recurringEndDate: ''
  });

  // Sales pagination state
  const [activeOrdersPage, setActiveOrdersPage] = useState(1);
  const [completedOrdersPage, setCompletedOrdersPage] = useState(1);
  const [recentSalesPage, setRecentSalesPage] = useState(1);
  const [salesPageSize] = useState(4); // Show 4 orders per page in cards
  const [recentSalesPageSize] = useState(10); // Show 10 orders per page in table

  const [isCustomersLoading, setIsCustomersLoading] = useState(false);
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [customersError, setCustomersError] = useState<string | null>(null);

  // Helper functions for sales calculations
  const getCurrentMonthOrders = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return orders.filter(order => new Date(order.orderDate) >= startOfMonth);
  };

  const getActiveOrders = () => {
    return orders.filter(order => 
      ['confirmed', 'processing', 'shipped', 'out_for_delivery'].includes(order.status)
    );
  };

  const getCompletedOrders = () => {
    return orders.filter(order => order.status === 'delivered');
  };

  const getTodayOrders = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return orders.filter(order => {
      const orderDate = new Date(order.orderDate);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatCurrencyShort = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}K`;
    }
    return formatCurrency(amount);
  };

  // Pagination helper functions
  const getPaginatedOrders = (orders: Order[], page: number, pageSize: number) => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return orders.slice(startIndex, endIndex);
  };

  const getTotalPages = (totalItems: number, pageSize: number) => {
    return Math.ceil(totalItems / pageSize);
  };

  // Status colors for order statuses
  const statusColors: Record<string, string> = {
    'pending': 'bg-gray-100 text-gray-800',
    'confirmed': 'bg-orange-100 text-orange-800',
    'processing': 'bg-yellow-100 text-yellow-800',
    'shipped': 'bg-blue-100 text-blue-800',
    'out_for_delivery': 'bg-purple-100 text-purple-800',
    'delivered': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800'
  };

  // Sales Stats
  const currentMonthOrders = getCurrentMonthOrders();
  const activeOrders = getActiveOrders();
  const completedOrders = getCompletedOrders();
  const todayOrders = getTodayOrders();

  const totalRevenue = currentMonthOrders.reduce((sum, order) => sum + order.finalAmount, 0);
  const activeOrdersValue = activeOrders.reduce((sum, order) => sum + order.finalAmount, 0);
  const completedOrdersValue = completedOrders.reduce((sum, order) => sum + order.finalAmount, 0);
  const todayOrdersValue = todayOrders.reduce((sum, order) => sum + order.finalAmount, 0);

  // Calculate month-over-month changes for stats
  const calculateMonthOverMonthChange = (currentValue: number, previousValue: number): string => {
    if (previousValue === 0) return currentValue > 0 ? '+100%' : '0%';
    const change = ((currentValue - previousValue) / previousValue) * 100;
    return change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
  };

  // Get current month and previous month data
  const currentDate = new Date();
  const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const currentMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
  const previousMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  const previousMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0, 23, 59, 59, 999);

  // Filter leads by month
  const getLeadsInMonth = (startDate: Date, endDate: Date) => {
    return leads.filter(lead => {
      const createdDate = getDateFromAny(lead.createdAt);
      return createdDate && createdDate >= startDate && createdDate <= endDate;
    });
  };

  const currentMonthLeads = getLeadsInMonth(currentMonthStart, currentMonthEnd);
  const previousMonthLeads = getLeadsInMonth(previousMonthStart, previousMonthEnd);

  // Calculate revenue (assuming each Closed Won lead generates ₹50,000 on average)
  const calculateRevenue = (leadsList: any[]) => {
    const closedWonLeads = leadsList.filter(lead => lead.status === 'Closed Won').length;
    const averageDealValue = 50000; // ₹50,000 per deal
    return closedWonLeads * averageDealValue;
  };

  const currentMonthRevenue = calculateRevenue(currentMonthLeads);
  const previousMonthRevenue = calculateRevenue(previousMonthLeads);

  // Format revenue for display
  const formatRevenue = (amount: number): string => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}K`;
    } else {
      return `₹${amount}`;
    }
  };

  const crmStats = [
    {
      title: 'Total Leads',
      value: leads.length.toString(),
      change: calculateMonthOverMonthChange(leads.length, previousMonthLeads.length),
      icon: UserPlus,
      gradient: 'from-[#D4AF37] to-[#8B7A1A]',
      description: 'from last month'
    },
    {
      title: 'Active Deals',
      value: leads.filter(lead => ['Qualified', 'Proposal Sent', 'Negotiation'].includes(lead.status)).length.toString(),
      change: calculateMonthOverMonthChange(
        leads.filter(lead => ['Qualified', 'Proposal Sent', 'Negotiation'].includes(lead.status)).length,
        previousMonthLeads.filter(lead => ['Qualified', 'Proposal Sent', 'Negotiation'].includes(lead.status)).length
      ),
      icon: Target,
      gradient: 'from-[#8B7A1A] to-[#5E4E06]',
      description: 'in pipeline'
    },
    {
      title: 'Conversion Rate',
      value: leads.length > 0 ? `${Math.round((leads.filter(lead => lead.status === 'Closed Won').length / leads.length) * 100)}%` : '0%',
      change: calculateMonthOverMonthChange(
        leads.filter(lead => lead.status === 'Closed Won').length,
        previousMonthLeads.filter(lead => lead.status === 'Closed Won').length
      ),
      icon: TrendingUp,
      gradient: 'from-[#D4AF37] to-[#8B7A1A]',
      description: 'this month'
    },
    {
      title: 'Revenue',
      value: formatRevenue(currentMonthRevenue),
      change: calculateMonthOverMonthChange(currentMonthRevenue, previousMonthRevenue),
      icon: DollarSign,
      gradient: 'from-[#8B7A1A] to-[#5E4E06]',
      description: 'this month'
    }
  ];

  // Navigation tabs
  const navigation = [
    { name: 'Overview', id: 'overview', icon: BarChart3 },
    { name: 'Leads', id: 'leads', icon: UserPlus },
    { name: 'Quotes', id: 'quotes', icon: FileText },
    { name: 'Customers', id: 'customers', icon: Users },
    { name: 'Sales', id: 'sales', icon: Target },
    { name: 'Messages', id: 'messages', icon: MessageSquare },
    { name: 'Tasks', id: 'tasks', icon: Calendar },
    { name: 'Form Submissions', id: 'formSubmissions', icon: FileText },
  ];

  // Helper to check if a date is within a range
  function isWithinRange(date: Date, start: Date, end: Date) {
    return date >= start && date <= end;
  }
  // Helper to get JS Date from Firestore Timestamp or Date
  function getDate(val: any): Date {
    if (!val) return new Date(0);
    if (typeof val.toDate === 'function') return val.toDate();
    if (val instanceof Date) return val;
    return new Date(val);
  }

  // Generate unique quote number
  function generateQuoteNumber(): string {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `Q-${year}-${month}-${random}`;
  }

  // Check if quote is expired
  function isQuoteExpired(validUntil: string): boolean {
    return new Date(validUntil) < new Date();
  }

  // Update quote status
  const updateQuoteStatus = async (quoteId: string, newStatus: Quote['status']) => {
    try {
      await AuthService.updateQuoteStatus(quoteId, newStatus);
      
      // Update local state
      setQuotes(prev => prev.map(quote => 
        quote.id === quoteId 
          ? { ...quote, status: newStatus, updatedAt: new Date() }
          : quote
      ));
      
      // Reload analytics
      await loadQuoteAnalytics();
      
      showToast(`Quote status updated to ${newStatus}`, 'success');
    } catch (error) {
      console.error('Error updating quote status:', error);
      showToast('Failed to update quote status', 'error');
    }
  };

  // Create new quote version
  const createQuoteVersion = (originalQuote: Quote) => {
    const newVersion: Quote = {
      ...originalQuote,
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      quoteNumber: `${originalQuote.quoteNumber}-v${originalQuote.version + 1}`,
      version: originalQuote.version + 1,
      parentQuoteId: originalQuote.id || null,
      previousVersionId: originalQuote.id || null,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      isExpired: false
    };
    
    setQuotes(prev => {
      // Ensure no duplicate temporary IDs
      const existingQuote = prev.find(q => q.id === newVersion.id);
      if (existingQuote) {
        return prev;
      }
      return [...prev, newVersion];
    });
    showToast(`New version v${newVersion.version} created for ${originalQuote.quoteNumber}`, 'success');
  };

  // Delete quote functions
  const deleteQuote = (quote: Quote) => {
    setQuoteToDelete({ quote, deleteAllVersions: false });
    setShowDeleteQuoteModal(true);
  };

  const deleteQuoteWithVersions = (quote: Quote) => {
    setQuoteToDelete({ quote, deleteAllVersions: true });
    setShowDeleteQuoteModal(true);
  };

  const executeDelete = async () => {
    if (!quoteToDelete) return;

    const { quote, deleteAllVersions } = quoteToDelete;

    try {
      if (deleteAllVersions) {
        // Find all related quotes (parent, children, siblings)
        const relatedQuotes = quotes.filter(q => 
          q.id === quote.id || 
          q.parentQuoteId === quote.id || 
          q.parentQuoteId === quote.parentQuoteId ||
          q.previousVersionId === quote.id ||
          (quote.parentQuoteId && (q.id === quote.parentQuoteId || q.parentQuoteId === quote.parentQuoteId))
        );

        // Delete all related quotes from Firebase
        const quoteIds = relatedQuotes.map(q => q.id).filter((id): id is string => !!id);
        const result = await AuthService.deleteQuotes(quoteIds);
        
        // Update local state
        setQuotes(prev => prev.filter(q => 
          !relatedQuotes.some(rq => rq.id === q.id)
        ));
        
        showToast(`Quote and ${result.success - 1} related version(s) deleted successfully`, 'success');
        if (result.failed > 0) {
          console.warn('Some quotes failed to delete:', result.errors);
        }
      } else {
        // Delete single quote
        if (quote.id) {
          await AuthService.deleteQuote(quote.id);
        }
        
        // Update local state
        setQuotes(prev => prev.filter(q => q.id !== quote.id));
        showToast('Quote deleted successfully', 'success');
      }

      // Close modal and reset
      setShowDeleteQuoteModal(false);
      setQuoteToDelete(null);
      setSelectedQuoteForActions(null);
    } catch (error) {
      console.error('Error deleting quote:', error);
      showToast('Failed to delete quote', 'error');
    }
  };

  // PDF Generation Functions
  const handleDownloadPDF = async (quote: Quote) => {
    try {
      setSelectedQuoteForActions(null);
      showToast('Generating PDF...', 'success');
      
      console.log('Starting PDF generation for quote:', quote.quoteNumber);
      console.log('Products:', products);
      console.log('Company details:', companyDetails);
      
      await downloadQuotePDF(quote, products, companyDetails);
      showToast('PDF downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      showToast('Failed to download PDF', 'error');
    }
  };

  const handlePreviewPDF = async (quote: Quote) => {
    try {
      setSelectedQuoteForActions(null);
      showToast('Opening PDF preview...', 'success');
      
      await previewQuotePDF(quote, products, companyDetails);
    } catch (error) {
      console.error('Error previewing PDF:', error);
      showToast('Failed to preview PDF', 'error');
    }
  };

  // Load quote analytics
  const loadQuoteAnalytics = async () => {
    try {
      const analytics = await AuthService.getQuoteAnalytics();
      setQuoteAnalytics(analytics);
    } catch (error) {
      console.error('Error loading quote analytics:', error);
    }
  };
  // Filter customers by join date
  const customerFilterDate = new Date();
  let dateFilteredCustomers = [];
  if (filterType === 'thisMonth') {
    const firstDay = new Date(customerFilterDate.getFullYear(), customerFilterDate.getMonth(), 1);
    const lastDay = new Date(customerFilterDate.getFullYear(), customerFilterDate.getMonth() + 1, 0, 23, 59, 59, 999);
    dateFilteredCustomers = customers.filter(c => {
      const d = getDate(c.createdAt);
      return isWithinRange(d, firstDay, lastDay);
    });
  } else if (filterType === 'last30') {
    const start = new Date(customerFilterDate.getTime() - 29 * 24 * 60 * 60 * 1000);
    const end = new Date(customerFilterDate.getFullYear(), customerFilterDate.getMonth(), customerFilterDate.getDate(), 23, 59, 59, 999);
    dateFilteredCustomers = customers.filter(c => {
      const d = getDate(c.createdAt);
      return isWithinRange(d, start, end);
    });
  } else if (filterType === 'custom' && customStartDate && customEndDate) {
    const start = new Date(customStartDate);
    const end = new Date(customEndDate + 'T23:59:59.999');
    dateFilteredCustomers = customers.filter(c => {
      const d = getDate(c.createdAt);
      return isWithinRange(d, start, end);
    });
  } else {
    // All Time
    dateFilteredCustomers = customers;
  }
  // Fuzzy search setup for customers (applies after date filter)
  const fuse = new Fuse(dateFilteredCustomers, {
    keys: [
      'firstName',
      'lastName',
      'email',
      'phone'
    ],
    threshold: 0.3,
    includeScore: true
  });
  const filteredCustomers = searchTerm
    ? fuse.search(searchTerm).map(result => result.item)
    : dateFilteredCustomers;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [fetchedLeads, fetchedOrders, fetchedTasks, fetchedQuotes] = await Promise.all([
          AuthService.getLeads(),
          AuthService.getOrders(),
          AuthService.getTasks(),
          AuthService.getQuotes()
        ]);
        
        // Debug: Check quotes data
        console.log('Fetched quotes:', fetchedQuotes);
        console.log('Quotes with IDs:', fetchedQuotes.filter(q => q && q.id).length);
        console.log('Quotes without IDs:', fetchedQuotes.filter(q => !q || !q.id).length);
        
        setLeads(fetchedLeads);
        setOrders(fetchedOrders);
        setTasks(fetchedTasks);
        // Ensure all quotes have valid IDs and filter out any invalid ones
        const validQuotes = fetchedQuotes.filter(q => q && q.id && typeof q.id === 'string');
        
        // Remove any duplicate IDs
        const uniqueQuotes = validQuotes.filter((quote, index, self) => 
          index === self.findIndex(q => q.id === quote.id)
        );
        
        console.log('Valid quotes to set:', validQuotes.length);
        console.log('Unique quotes after deduplication:', uniqueQuotes.length);
        setQuotes(uniqueQuotes);
        
        // Load quote analytics
        await loadQuoteAnalytics();
        
        // Fetch admin profile
        const currentUser = auth.currentUser;
        if (currentUser) {
          const profile = await AuthService.getUserProfile(currentUser.uid);
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
    loadAllCustomers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (sidebarOpen && !target.closest('.admin-sidebar') && !target.closest('.admin-sidebar-toggle')) {
        setSidebarOpen(false);
      }
      // Close quote actions dropdown when clicking outside
      if (selectedQuoteForActions && !target.closest('.quote-actions-dropdown')) {
        setSelectedQuoteForActions(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen, selectedQuoteForActions]);

  // Auto-expiry functionality for quotes
  useEffect(() => {
    const checkExpiredQuotes = async () => {
      try {
        // Mark expired quotes in Firebase
        const expiredCount = await AuthService.markExpiredQuotes();
        
        if (expiredCount > 0) {
          // Reload quotes from Firebase to get updated data
          const updatedQuotes = await AuthService.getQuotes();
          setQuotes(updatedQuotes);
          
          showToast(`${expiredCount} quote(s) marked as expired`, 'success');
        }
      } catch (error) {
        console.error('Error checking expired quotes:', error);
        
        // Fallback to local check if Firebase fails
        setQuotes(prev => prev.map(quote => ({
          ...quote,
          isExpired: isQuoteExpired(quote.validUntil),
          status: quote.status === 'draft' && isQuoteExpired(quote.validUntil) ? 'expired' : quote.status
        })));
      }
    };

    // Check immediately
    checkExpiredQuotes();
    
    // Check every hour
    const interval = setInterval(checkExpiredQuotes, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await AuthService.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Sign out failed:', error);
      router.push('/login');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLeadForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Create lead data
      const leadData = {
        name: leadForm.name,
        email: leadForm.email || undefined,
        phone: leadForm.phone,
        source: leadForm.source,
        status: leadForm.status,
        interest: leadForm.interest,
        notes: leadForm.notes || undefined,
        createdBy: currentUser.uid
      };

      // Save to Firebase
      await AuthService.createLead(leadData, currentUser.uid);

      // Reset form and close modal
      setLeadForm({
        name: '',
        email: '',
        phone: '',
        source: '',
        status: 'New Lead',
        interest: '',
        notes: ''
      });
      setShowAddLeadModal(false);

      // Reload leads
      const updatedLeads = await AuthService.getLeads();
      setLeads(updatedLeads);

    } catch (error) {
      console.error('Error creating lead:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to create lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle editing lead
  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setLeadForm({
      name: lead.name,
      email: lead.email || '',
      phone: lead.phone,
      source: lead.source,
      status: lead.status,
      interest: lead.interest,
      notes: lead.notes || ''
    });
    setShowEditLeadModal(true);
  };

  // Handle updating lead
  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead?.id) return;
    
    setIsEditingLead(true);
    setSubmitError(null);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Update lead data
      const updatedLeadData = {
        name: leadForm.name,
        email: leadForm.email || undefined,
        phone: leadForm.phone,
        source: leadForm.source,
        status: leadForm.status,
        interest: leadForm.interest,
        notes: leadForm.notes || undefined,
        updatedAt: new Date()
      };

      // Update in Firebase
      await AuthService.updateLead(editingLead.id, updatedLeadData);

      // Update local state
      setLeads(prev => prev.map(lead => 
        lead.id === editingLead.id 
          ? { ...lead, ...updatedLeadData }
          : lead
      ));

      // Reset form and close modal
      setLeadForm({
        name: '',
        email: '',
        phone: '',
        source: '',
        status: 'New Lead',
        interest: '',
        notes: ''
      });
      setShowEditLeadModal(false);
      setEditingLead(null);

      showToast('Lead updated successfully!', 'success');

    } catch (error) {
      console.error('Error updating lead:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to update lead');
    } finally {
      setIsEditingLead(false);
    }
  };

  // Handle deleting lead
  const handleDeleteLead = async (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete the lead "${lead.name}"?\n\nThis action cannot be undone and will permanently remove all information about this lead.`
    );
    
    if (!confirmed) {
      return;
    }

    setIsDeletingLead(true);

    try {
      // Delete from Firebase
      await AuthService.deleteLead(leadId);

      // Remove from local state
      setLeads(prev => prev.filter(l => l.id !== leadId));

      showToast(`Lead "${lead.name}" deleted successfully!`, 'success');

    } catch (error) {
      console.error('Error deleting lead:', error);
      showToast('Failed to delete lead', 'error');
    } finally {
      setIsDeletingLead(false);
    }
  };

  // Helper functions for modal lead management
  const filteredModalLeads = useMemo(() => {
    let filtered = leads;
    
    // Filter by search term
    if (leadSearchTerm.trim()) {
      filtered = filtered.filter(lead => 
        lead.name.toLowerCase().includes(leadSearchTerm.toLowerCase()) ||
        lead.phone.includes(leadSearchTerm) ||
        (lead.email && lead.email.toLowerCase().includes(leadSearchTerm.toLowerCase()))
      );
    }
    
    // Filter by status
    if (leadFilterStatus !== 'all') {
      filtered = filtered.filter(lead => lead.status === leadFilterStatus);
    }
    
    return filtered;
  }, [leads, leadSearchTerm, leadFilterStatus]);

  const getPaginatedModalLeads = () => {
    const startIndex = (currentLeadPage - 1) * modalLeadsPerPage;
    const endIndex = startIndex + modalLeadsPerPage;
    return filteredModalLeads.slice(startIndex, endIndex);
  };

  const totalModalPages = Math.ceil(filteredModalLeads.length / modalLeadsPerPage);

  // Reset modal pagination when search/filter changes
  useEffect(() => {
    setCurrentLeadPage(1);
  }, [leadSearchTerm, leadFilterStatus]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openLeadDropdown && !(event.target as Element).closest('.dropdown-container')) {
        setOpenLeadDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openLeadDropdown]);

  // Handle mobile viewport height for modals and layout
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      
      // Set safe area inset for mobile
      const safeAreaTop = getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0px';
      document.documentElement.style.setProperty('--sat', safeAreaTop);
      
      // Set mobile-specific layout variables
      const isMobile = window.innerWidth < 640;
      if (isMobile) {
        const headerHeight = 56; // 3.5rem
        const safeTop = parseInt(safeAreaTop) || 0;
        const totalTop = Math.max(80, headerHeight + safeTop);
        document.documentElement.style.setProperty('--mobile-top', `${totalTop}px`);
        document.documentElement.style.setProperty('--mobile-height', `calc(100vh - ${totalTop}px)`);
      }
    };

    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);

    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);

  // Handle recent lead actions
  const handleRecentLeadAction = (action: string, lead: Lead) => {
    switch (action) {
      case 'edit':
        // Pre-fill the edit form with existing lead data
        setLeadForm({
          name: lead.name,
          email: lead.email || '',
          phone: lead.phone,
          source: lead.source,
          status: lead.status,
          interest: lead.interest,
          notes: lead.notes || ''
        });
        setEditingLead(lead);
        setShowEditLeadModal(true);
        showToast(`Opening edit form for ${lead.name}`, 'info');
        break;
      case 'call':
        // Direct call without opening modal
        if (lead.phone) {
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          
          if (isMobile) {
            window.location.href = `tel:${lead.phone}`;
            showToast(`Opening phone app to call ${lead.name}...`, 'success');
          } else {
            const phoneNumber = lead.phone;
            const message = `Call ${lead.name} at: ${phoneNumber}\n\nCopy this number and use your phone to call.`;
            
            if (confirm(`${message}\n\nClick OK to copy the phone number to clipboard.`)) {
              try {
                navigator.clipboard.writeText(phoneNumber);
                showToast(`Phone number copied to clipboard: ${phoneNumber}`, 'success');
              } catch (err) {
                const textArea = document.createElement('textarea');
                textArea.value = phoneNumber;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showToast(`Phone number copied: ${phoneNumber}`, 'success');
              }
            }
          }
          
          // Update lead status to "Contacted" if it's a new lead
          if (lead.status === 'New Lead') {
            AuthService.updateLead(lead.id!, {
              ...lead,
              status: 'Contacted',
              updatedAt: new Date()
            }).then(() => {
              setLeads(leads.map(l =>
                l.id === lead.id
                  ? { ...l, status: 'Contacted', updatedAt: new Date() }
                  : l
              ));
            }).catch(error => {
              console.error('Error updating lead status:', error);
            });
          }
        } else {
          showToast('No phone number available for this lead', 'error');
        }
        break;

      case 'delete':
        if (confirm(`Are you sure you want to delete ${lead.name}?\n\nThis action cannot be undone.`)) {
          handleDeleteLead(lead.id!);
          showToast(`Deleting ${lead.name}...`, 'info');
        }
        break;
      default:
        break;
    }
    setOpenLeadDropdown(null);
  };

  // Handle direct call to a lead
  const handleDirectCall = async (lead: Lead) => {
    if (!lead.id) {
      showToast('Lead ID is missing', 'error');
      return;
    }
    
    try {
      // Make actual phone call first
      if (lead.phone) {
        // Check if we're on a mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
          // On mobile devices, use tel: protocol to open phone app
          window.location.href = `tel:${lead.phone}`;
          showToast(`Opening phone app to call ${lead.name}...`, 'success');
        } else {
          // On desktop, show phone number and instructions
          const phoneNumber = lead.phone;
          const message = `Call ${lead.name} at: ${phoneNumber}\n\nCopy this number and use your phone to call.`;
          
          // Show phone number prominently
          if (confirm(`${message}\n\nClick OK to copy the phone number to clipboard.`)) {
            try {
              await navigator.clipboard.writeText(phoneNumber);
              showToast(`Phone number copied to clipboard: ${phoneNumber}`, 'success');
            } catch (err) {
              // Fallback for older browsers
              const textArea = document.createElement('textarea');
              textArea.value = phoneNumber;
              document.body.appendChild(textArea);
              textArea.select();
              document.execCommand('copy');
              document.body.removeChild(textArea);
              showToast(`Phone number copied: ${phoneNumber}`, 'success');
            }
          }
        }
      } else {
        showToast('No phone number available for this lead', 'error');
        return;
      }
      
      // Update lead status to "Contacted" if it's a new lead
      if (lead.status === 'New Lead') {
        await AuthService.updateLead(lead.id, {
          ...lead,
          status: 'Contacted',
          updatedAt: new Date()
        });
        
        // Update local state
        setLeads(leads.map(l => 
          l.id === lead.id 
            ? { ...l, status: 'Contacted', updatedAt: new Date() }
            : l
        ));
      }

      // Create a call log entry (as a task)
      const callTaskData = {
        title: `Call: ${lead.name}`,
        description: `Direct call made to ${lead.name} on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
        status: 'completed' as const,
        priority: 'medium' as const,
        category: 'follow_up' as const,
        dueDate: new Date(),
        tags: ['call', 'direct', 'completed'],
        notes: `Call completed successfully\nLead: ${lead.name}\nPhone: ${lead.phone}\nStatus: ${lead.status}`,
        relatedTo: {
          type: 'lead' as const,
          id: lead.id!,
          name: lead.name
        },
        createdBy: auth.currentUser?.uid || ''
      };

      // Create the call log task
      await AuthService.createTask(callTaskData, auth.currentUser?.uid || '');
      
      // Show success message
      showToast(`Call logged successfully for ${lead.name}!`, 'success');
      
      // Close the modal
      setShowDirectCallModal(false);
      setSelectedLeadForCall(null);
      
      // Refresh tasks to show the new call log
      const updatedTasks = await AuthService.getTasks();
      setTasks(updatedTasks);
      
    } catch (error) {
      console.error('Error logging call:', error);
      showToast('Failed to log call', 'error');
    }
  };

  // Helper to format Firestore Timestamp or Date
  function formatDate(date: any) {
    if (!date) return '-';
    if (typeof date.toDate === 'function') {
      return date.toDate().toLocaleDateString();
    }
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }
    // Handle Firestore Timestamp objects
    if (date && typeof date === 'object' && date.seconds) {
      return new Date(date.seconds * 1000).toLocaleDateString();
    }
    // Handle ISO string dates
    if (typeof date === 'string') {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toLocaleDateString();
      }
    }
    return '-';
  }

  // Helper to get a proper Date object from various date formats
  function getDateFromAny(date: any): Date | null {
    if (!date) return null;
    
    // Handle Firestore Timestamp
    if (typeof date.toDate === 'function') {
      return date.toDate();
    }
    
    // Handle Date object
    if (date instanceof Date) {
      return date;
    }
    
    // Handle Firestore Timestamp with seconds
    if (date && typeof date === 'object' && date.seconds) {
      return new Date(date.seconds * 1000);
    }
    
    // Handle ISO string
    if (typeof date === 'string') {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }
    
    // Handle timestamp number
    if (typeof date === 'number') {
      return new Date(date);
    }
    
    return null;
  }

  // Helper to format lead age in a user-friendly way
  function formatLeadAge(createdAt: any): string {
    const created = getDateFromAny(createdAt);
    if (!created) return 'Date unknown';
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    
    // Calculate different time units
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
    
    // Show most appropriate time unit
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`;
    if (diffMonths < 12) return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
    return `${diffYears} year${diffYears === 1 ? '' : 's'} ago`;
  }

  async function handleSaveCustomer(updated: UserProfile) {
    setIsSavingCustomer(true);
    try {
      await AuthService.updateUserProfile(updated.uid, updated);
      setSelectedCustomer({ ...selectedCustomer, ...updated });
      showToast && showToast('Customer updated successfully', 'success');
    } catch (err) {
      showToast && showToast('Failed to update customer', 'error');
    } finally {
      setIsSavingCustomer(false);
    }
  }

  async function handleDeleteCustomer(uid: string) {
    setIsSavingCustomer(true);
    try {
      await AuthService.deleteUser(uid);
      setDrawerOpen(false);
      setSelectedCustomer(null);
      showToast('Customer deleted successfully', 'success');
    } catch (err) {
      showToast('Failed to delete customer', 'error');
    } finally {
      setIsSavingCustomer(false);
    }
  }

  async function loadAllCustomers() {
    setIsCustomersLoading(true);
    setCustomersError(null);
    try {
      const { customers } = await AuthService.getCustomersPaginated();
        setCustomers(customers);
    } catch (err) {
      console.error('Error loading customers:', err);
      setCustomers([]);
      setCustomersError('Failed to load customers. Please check your permissions or try again later.');
    } finally {
      setIsCustomersLoading(false);
    }
  }

  // Update order status
  const handleUpdateOrderStatus = async () => {
    if (!selectedOrderForStatus) return;
    
    setIsUpdatingStatus(true);
    try {
      await AuthService.updateOrderStatus(selectedOrderForStatus.id!, newStatus, statusUpdateNotes);
      
      // Update the order in local state
      setOrders(prev => prev.map(order => 
        order.id === selectedOrderForStatus.id 
          ? { ...order, status: newStatus, notes: statusUpdateNotes }
          : order
      ));
      
      showToast('Order status updated successfully!', 'success');
      setShowStatusUpdateModal(false);
      setSelectedOrderForStatus(null);
      setNewStatus('confirmed');
      setStatusUpdateNotes('');
    } catch (error) {
      console.error('Error updating order status:', error);
      showToast('Failed to update order status', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Open status update modal
  const openStatusUpdateModal = (order: Order) => {
    setSelectedOrderForStatus(order);
    setNewStatus(order.status);
    setStatusUpdateNotes(order.notes || '');
    setShowStatusUpdateModal(true);
  };

  // Task Helper Functions
  const getTaskStats = () => {
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const overdue = tasks.filter(t => {
      const now = new Date();
      const dueDate = new Date(t.dueDate);
      return t.status !== 'completed' && dueDate < now;
    }).length;
    
    return { total, pending, inProgress, completed, overdue };
  };

  const getTaskAnalytics = () => {
    const stats = getTaskStats();
    const now = new Date();
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const completedThisWeek = tasks.filter(t => 
      t.status === 'completed' && t.completedAt && new Date(t.completedAt) >= thisWeek
    ).length;
    
    const completedThisMonth = tasks.filter(t => 
      t.status === 'completed' && t.completedAt && new Date(t.completedAt) >= thisMonth
    ).length;
    
    const totalEstimatedTime = tasks
      .filter(t => t.estimatedTime)
      .reduce((sum, t) => sum + (t.estimatedTime || 0), 0);
    
    const totalActualTime = tasks
      .filter(t => t.actualTime)
      .reduce((sum, t) => sum + (t.actualTime || 0), 0);
    
    const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
    const overdueRate = stats.total > 0 ? Math.round((stats.overdue / stats.total) * 100) : 0;
    
    const categoryStats = ['follow_up', 'meeting', 'delivery', 'marketing', 'support', 'other'].map(cat => ({
      category: cat,
      count: tasks.filter(t => t.category === cat).length,
      completed: tasks.filter(t => t.category === cat && t.status === 'completed').length
    }));
    
    const priorityStats = ['urgent', 'high', 'medium', 'low'].map(priority => ({
      priority,
      count: tasks.filter(t => t.priority === priority).length,
      completed: tasks.filter(t => t.priority === priority && t.status === 'completed').length
    }));
    
    return {
      ...stats,
      completedThisWeek,
      completedThisMonth,
      totalEstimatedTime,
      totalActualTime,
      completionRate,
      overdueRate,
      categoryStats,
      priorityStats
    };
  };

  const getFilteredAndSortedTasks = () => {
    let filtered = tasks.filter(task => {
      if (taskFilter !== 'all' && task.status !== taskFilter) return false;
      if (taskPriorityFilter !== 'all' && task.priority !== taskPriorityFilter) return false;
      if (taskCategoryFilter !== 'all' && task.category !== taskCategoryFilter) return false;
      
      // Date filtering
      if (taskDateFilter !== 'all') {
        const now = new Date();
        const taskDate = new Date(task.dueDate);
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        const thisWeekStart = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000);
        const thisWeekEnd = new Date(thisWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
        const nextWeekStart = new Date(thisWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
        const nextWeekEnd = new Date(nextWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
        
        switch (taskDateFilter) {
          case 'today':
            if (taskDate < today || taskDate >= tomorrow) return false;
            break;
          case 'tomorrow':
            if (taskDate < tomorrow || taskDate >= new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)) return false;
            break;
          case 'this_week':
            if (taskDate < thisWeekStart || taskDate > thisWeekEnd) return false;
            break;
          case 'next_week':
            if (taskDate < nextWeekStart || taskDate > nextWeekEnd) return false;
            break;
          case 'overdue':
            if (task.status === 'completed' || taskDate >= now) return false;
            break;
        }
      }
      
      if (taskSearchQuery) {
        const query = taskSearchQuery.toLowerCase();
        const matches = 
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.tags.some(tag => tag.toLowerCase().includes(query));
        if (!matches) return false;
      }
      
      return true;
    });

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (taskSortBy) {
        case 'dueDate':
          aValue = new Date(a.dueDate);
          bValue = new Date(b.dueDate);
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (taskSortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: Task['category']) => {
    switch (category) {
      case 'follow_up': return <Phone className="w-4 h-4" />;
      case 'meeting': return <Calendar className="w-4 h-4" />;
      case 'delivery': return <Truck className="w-4 h-4" />;
      case 'marketing': return <Target className="w-4 h-4" />;
      case 'support': return <UserCheck className="w-4 h-4" />;
      case 'other': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: Task['category']) => {
    switch (category) {
      case 'follow_up': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'meeting': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'delivery': return 'bg-green-50 text-green-700 border-green-200';
      case 'marketing': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'support': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'other': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const isTaskOverdue = (task: Task) => {
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    return task.status !== 'completed' && dueDate < now;
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getDaysUntilDue = (dueDate: Date) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueDateColor = (task: Task) => {
    if (task.status === 'completed') return 'text-green-600';
    if (isTaskOverdue(task)) return 'text-red-600';
    
    const daysUntilDue = getDaysUntilDue(task.dueDate);
    if (daysUntilDue <= 0) return 'text-red-600';
    if (daysUntilDue <= 1) return 'text-orange-600';
    if (daysUntilDue <= 3) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getKanbanColumns = () => {
    const columns = [
      { id: 'pending', title: 'To Do', color: 'bg-gray-100', tasks: [] as Task[] },
      { id: 'in_progress', title: 'In Progress', color: 'bg-blue-100', tasks: [] as Task[] },
      { id: 'completed', title: 'Done', color: 'bg-green-100', tasks: [] as Task[] },
      { id: 'overdue', title: 'Overdue', color: 'bg-red-100', tasks: [] as Task[] }
    ];

    const filteredTasks = getFilteredAndSortedTasks();
    
    filteredTasks.forEach(task => {
      const status = isTaskOverdue(task) ? 'overdue' : task.status;
      const column = columns.find(col => col.id === status);
      if (column) {
        column.tasks.push(task);
      }
    });

    return columns;
  };

  // TaskCard Component
  const TaskCard = ({ task }: { task: Task }) => (
    <div
      className={`bg-white border rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-200 ${
        isTaskOverdue(task) ? 'border-red-200 bg-red-50' : 'border-[#D4AF37]'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
            <div className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium border ${getCategoryColor(task.category)}`}>
              <div className="flex items-center gap-0.5 sm:gap-1">
                {getCategoryIcon(task.category)}
                <span className="hidden sm:inline">{task.category.replace('_', ' ')}</span>
              </div>
            </div>
            <div className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </div>
            {task.recurring && (
              <div className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                <Repeat className="w-3 h-3" />
              </div>
            )}
          </div>
          
          <h3 className="font-semibold text-[#5E4E06] mb-1 sm:mb-2 text-sm">{task.title}</h3>
          <p className="text-xs text-[#8B7A1A] mb-2 sm:mb-3 line-clamp-2">{task.description}</p>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#8B7A1A] mb-2 sm:mb-3">
            <div className={`flex items-center gap-1 ${getDueDateColor(task)}`}>
              <CalendarDays className="w-3 h-3" />
              {getDaysUntilDue(task.dueDate) === 0 ? 'Today' : 
               getDaysUntilDue(task.dueDate) < 0 ? `${Math.abs(getDaysUntilDue(task.dueDate))} days overdue` :
               `${getDaysUntilDue(task.dueDate)} days left`}
            </div>
            {task.estimatedTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(task.estimatedTime)}
              </div>
            )}
            {task.relatedTo && (
              <div className="flex items-center gap-1 hidden sm:flex">
                <Tag className="w-3 h-3" />
                {task.relatedTo.type}: {task.relatedTo.name}
              </div>
            )}
          </div>
          
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
              {task.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-[#F5F2E8] text-[#8B7A1A] rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
              {task.tags.length > 2 && (
                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                  +{task.tags.length - 2}
                </span>
              )}
            </div>
          )}
          
          {task.notes && (
            <p className="text-xs text-[#8B7A1A] italic line-clamp-1">"{task.notes}"</p>
          )}
        </div>
        
        <div className="flex items-center gap-1 ml-2 sm:ml-3">
          {task.status !== 'completed' && task.id && (
            <button
              onClick={() => handleToggleTaskStatus(task.id!, 'completed')}
              className="p-1 sm:p-1.5 hover:bg-green-100 rounded-lg transition-colors"
              title="Mark as completed"
            >
              <CheckSquare className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
            </button>
          )}
          <button
            onClick={() => openEditTaskModal(task)}
            className="p-1 sm:p-1.5 hover:bg-[#F5F2E8] rounded-lg transition-colors"
            title="Edit task"
          >
            <Edit className="w-3 h-3 sm:w-4 sm:h-4 text-[#8B7A1A]" />
          </button>
          {task.id && (
            <button
              onClick={() => handleDeleteTask(task.id!)}
              className="p-1 sm:p-1.5 hover:bg-red-100 rounded-lg transition-colors"
              title="Delete task"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // EmptyTaskState Component
  const EmptyTaskState = () => (
    <div className="text-center py-8 sm:py-12">
      <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-[#D4AF37] mx-auto mb-3 sm:mb-4" />
      <h3 className="text-base sm:text-lg font-semibold text-[#5E4E06] mb-2">No tasks found</h3>
      <p className="text-sm sm:text-base text-[#8B7A1A] mb-3 sm:mb-4">Create your first task to get started</p>
      <button
        onClick={() => setShowAddTaskModal(true)}
        className="px-3 sm:px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-xl hover:scale-105 transition-all duration-200 text-sm sm:text-base"
      >
        Add First Task
      </button>
    </div>
  );

  // CalendarView Component
  const CalendarView = ({ 
    tasks, 
    selectedDate, 
    onDateSelect, 
    onTaskClick 
  }: { 
    tasks: Task[]; 
    selectedDate: Date | null; 
    onDateSelect: (date: Date | null) => void; 
    onTaskClick: (task: Task) => void; 
  }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    
    const getDaysInMonth = (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - firstDay.getDay());
      
      const days = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= lastDay || currentDate.getDay() !== 0) {
        days.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return days;
    };

    const getTasksForDate = (date: Date) => {
      return tasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return taskDate.getDate() === date.getDate() &&
               taskDate.getMonth() === date.getMonth() &&
               taskDate.getFullYear() === date.getFullYear();
      });
    };

    const isToday = (date: Date) => {
      const today = new Date();
      return date.getDate() === today.getDate() &&
             date.getMonth() === today.getMonth() &&
             date.getFullYear() === today.getFullYear();
    };

    const isSelected = (date: Date) => {
      return selectedDate && 
             date.getDate() === selectedDate.getDate() &&
             date.getMonth() === selectedDate.getMonth() &&
             date.getFullYear() === selectedDate.getFullYear();
    };

    const isCurrentMonth = (date: Date) => {
      return date.getMonth() === currentMonth.getMonth() &&
             date.getFullYear() === currentMonth.getFullYear();
    };

    const getMonthName = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
      setCurrentMonth(prev => {
        const newMonth = new Date(prev);
        if (direction === 'prev') {
          newMonth.setMonth(newMonth.getMonth() - 1);
        } else {
          newMonth.setMonth(newMonth.getMonth() + 1);
        }
        return newMonth;
      });
    };

    const days = getDaysInMonth(currentMonth);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="space-y-6">
        {/* Calendar Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center justify-between sm:justify-start space-x-2 sm:space-x-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-1.5 sm:p-2 hover:bg-[#F5F2E8] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#8B7A1A]" />
            </button>
            <h3 className="text-lg sm:text-xl font-bold text-[#5E4E06]">
              {getMonthName(currentMonth)}
            </h3>
            <button
              onClick={() => navigateMonth('next')}
              className="p-1.5 sm:p-2 hover:bg-[#F5F2E8] rounded-lg transition-colors"
            >
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#8B7A1A]" />
            </button>
          </div>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#F5F2E8] text-[#5E4E06] rounded-lg hover:bg-[#E6DCC0] transition-colors text-xs sm:text-sm font-medium"
          >
            Today
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-xl border border-[#D4AF37] overflow-hidden">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 bg-[#F5F2E8] border-b border-[#D4AF37]">
            {weekDays.map((day) => (
              <div key={day} className="p-2 sm:p-3 text-center">
                <span className="text-xs sm:text-sm font-semibold text-[#5E4E06]">{day}</span>
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {days.map((date, index) => {
              const dayTasks = getTasksForDate(date);
              const hasOverdueTasks = dayTasks.some(task => isTaskOverdue(task));
              const hasUrgentTasks = dayTasks.some(task => task.priority === 'urgent');
              const hasHighPriorityTasks = dayTasks.some(task => task.priority === 'high');
              
              return (
                <div
                  key={index}
                  onClick={() => onDateSelect(date)}
                  className={`
                    min-h-[80px] sm:min-h-[100px] md:min-h-[120px] p-1 sm:p-2 border-r border-b border-gray-200 cursor-pointer transition-all duration-200
                    ${isToday(date) ? 'bg-[#F5F2E8]' : ''}
                    ${isSelected(date) ? 'ring-2 ring-[#D4AF37] bg-[#F5F2E8]' : ''}
                    ${!isCurrentMonth(date) ? 'bg-gray-50 text-gray-400' : 'hover:bg-[#F5F2E8]'}
                  `}
                >
                  {/* Date Number */}
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <span className={`
                      text-xs sm:text-sm font-medium
                      ${isToday(date) ? 'bg-[#D4AF37] text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center' : ''}
                      ${!isCurrentMonth(date) ? 'text-gray-400' : 'text-[#5E4E06]'}
                    `}>
                      {date.getDate()}
                    </span>
                    
                    {/* Priority Indicators */}
                    <div className="flex space-x-0.5 sm:space-x-1">
                      {hasUrgentTasks && (
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full"></div>
                      )}
                      {hasHighPriorityTasks && !hasUrgentTasks && (
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full"></div>
                      )}
                      {hasOverdueTasks && (
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-600 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </div>

                  {/* Task Indicators */}
                  <div className="space-y-0.5 sm:space-y-1">
                    {dayTasks.slice(0, 2).map((task, taskIndex) => (
                      <div
                        key={task.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTaskClick(task);
                        }}
                        className={`
                          p-0.5 sm:p-1 rounded text-xs cursor-pointer transition-all duration-200 hover:scale-105
                          ${task.status === 'completed' ? 'bg-green-100 text-green-800 line-through' : ''}
                          ${isTaskOverdue(task) ? 'bg-red-100 text-red-800' : ''}
                          ${task.priority === 'urgent' ? 'bg-red-50 text-red-700 border border-red-200' : ''}
                          ${task.priority === 'high' ? 'bg-orange-50 text-orange-700 border border-orange-200' : ''}
                          ${task.priority === 'medium' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : ''}
                          ${task.priority === 'low' ? 'bg-green-50 text-green-700 border border-green-200' : ''}
                        `}
                        title={`${task.title} - ${task.priority} priority`}
                      >
                        <div className="flex items-center gap-0.5 sm:gap-1">
                          <span className="hidden sm:inline">{getCategoryIcon(task.category)}</span>
                          <span className="truncate text-xs">{task.title}</span>
                        </div>
                      </div>
                    ))}
                    
                    {dayTasks.length > 2 && (
                      <div className="text-xs text-[#8B7A1A] text-center">
                        +{dayTasks.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Calendar Legend */}
        <div className="bg-[#F5F2E8] rounded-xl p-3 sm:p-4">
          <h4 className="text-xs sm:text-sm font-semibold text-[#5E4E06] mb-2 sm:mb-3">Legend</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
              <span className="text-[#8B7A1A] text-xs">Urgent</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-orange-500 rounded-full"></div>
              <span className="text-[#8B7A1A] text-xs">High Priority</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-600 rounded-full animate-pulse"></div>
              <span className="text-[#8B7A1A] text-xs">Overdue</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
              <span className="text-[#8B7A1A] text-xs">Completed</span>
            </div>
          </div>
        </div>

        {/* Selected Date Tasks */}
        {selectedDate && (
          <div className="bg-white rounded-xl border border-[#D4AF37] p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h4 className="text-base sm:text-lg font-semibold text-[#5E4E06]">
                Tasks for {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </h4>
              <button
                onClick={() => onDateSelect(null)}
                className="text-[#8B7A1A] hover:text-[#5E4E06] transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {getTasksForDate(selectedDate).length === 0 ? (
              <div className="text-center py-4 sm:py-6">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-[#D4AF37] mx-auto mb-2" />
                <p className="text-[#8B7A1A] text-xs sm:text-sm">No tasks scheduled for this date</p>
                <button
                                      onClick={() => {
                      setTaskForm(prev => ({
                        ...prev,
                        dueDate: selectedDate.toISOString().split('T')[0]
                      }));
                      setShowAddTaskModal(true);
                      setShowEditTaskModal(false);
                    }}
                  className="mt-2 px-2 sm:px-3 py-1 bg-[#D4AF37] text-white rounded-lg text-xs hover:bg-[#8B7A1A] transition-colors"
                >
                  Add Task
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {getTasksForDate(selectedDate).map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const handleTaskInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTaskForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingTask(true);
    
    try {
      const newTaskData: any = {
        title: taskForm.title,
        description: taskForm.description,
        status: taskForm.status,
        priority: taskForm.priority,
        category: taskForm.category,
        dueDate: new Date(taskForm.dueDate),
        tags: taskForm.tags ? taskForm.tags.split(',').map(tag => tag.trim()) : [],
        notes: taskForm.notes
      };

      // Only add estimatedTime if it has a value
      if (taskForm.estimatedTime) {
        newTaskData.estimatedTime = parseInt(taskForm.estimatedTime);
      }

      // Only add relatedTo if all required fields are present
      if (taskForm.relatedToType && taskForm.relatedToId && taskForm.relatedToName) {
        newTaskData.relatedTo = {
          type: taskForm.relatedToType as 'lead' | 'order' | 'customer',
          id: taskForm.relatedToId,
          name: taskForm.relatedToName
        };
      }

      // Only add recurring if it's enabled and has valid data
      if (taskForm.isRecurring) {
        newTaskData.recurring = {
          type: taskForm.recurringType,
          interval: taskForm.recurringInterval
        };
        
        // Only add endDate if it has a value
        if (taskForm.recurringEndDate) {
          newTaskData.recurring.endDate = new Date(taskForm.recurringEndDate);
        }
      }

      // Check if user is authenticated
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated. Please log in again.');
      }

      // Create task in Firebase
      const taskId = await AuthService.createTask(newTaskData, currentUser.uid);
      
      // Add the new task to local state with the Firebase ID
      const newTask: Task = {
        id: taskId,
        ...newTaskData,
        createdAt: new Date(),
        createdBy: currentUser.uid,
        updatedAt: new Date()
      };

      setTasks(prev => [...prev, newTask]);
      setTaskForm({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        category: 'follow_up',
        dueDate: '',
        estimatedTime: '',
        tags: '',
        notes: '',
        relatedToType: '',
        relatedToId: '',
        relatedToName: '',
        isRecurring: false,
        recurringType: 'weekly',
        recurringInterval: 1,
        recurringEndDate: ''
      });
      setShowAddTaskModal(false);
      setShowEditTaskModal(false);
      showToast('Task created successfully!', 'success');
    } catch (error) {
      console.error('Error creating task:', error);
      showToast('Failed to create task', 'error');
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    
    setIsSubmittingTask(true);
    
    try {
      const updatedTaskData: any = {
        title: taskForm.title,
        description: taskForm.description,
        status: taskForm.status,
        priority: taskForm.priority,
        category: taskForm.category,
        dueDate: new Date(taskForm.dueDate),
        tags: taskForm.tags ? taskForm.tags.split(',').map(tag => tag.trim()) : [],
        notes: taskForm.notes
      };

      // Only add estimatedTime if it has a value
      if (taskForm.estimatedTime) {
        updatedTaskData.estimatedTime = parseInt(taskForm.estimatedTime);
      }

      // Only add relatedTo if all required fields are present
      if (taskForm.relatedToType && taskForm.relatedToId && taskForm.relatedToName) {
        updatedTaskData.relatedTo = {
          type: taskForm.relatedToType as 'lead' | 'order' | 'customer',
          id: taskForm.relatedToId,
          name: taskForm.relatedToName
        };
      }

      // Only add recurring if it's enabled and has valid data
      if (taskForm.isRecurring) {
        updatedTaskData.recurring = {
          type: taskForm.recurringType,
          interval: taskForm.recurringInterval
        };
        
        // Only add endDate if it has a value
        if (taskForm.recurringEndDate) {
          updatedTaskData.recurring.endDate = new Date(taskForm.recurringEndDate);
        }
      }

      // Handle completedAt
      if (taskForm.status === 'completed') {
        updatedTaskData.completedAt = new Date();
      } else if (selectedTask.completedAt) {
        updatedTaskData.completedAt = selectedTask.completedAt;
      }

      // Check if user is authenticated
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated. Please log in again.');
      }

      // Update task in Firebase
      await AuthService.updateTask(selectedTask.id!, updatedTaskData);
      
      // Update local state
      const updatedTask: Task = {
        ...selectedTask,
        ...updatedTaskData,
        updatedAt: new Date()
      };

      setTasks(prev => prev.map(task => task.id === selectedTask.id ? updatedTask : task));
      setShowEditTaskModal(false);
      setShowAddTaskModal(false);
      setSelectedTask(null);
      showToast('Task updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating task:', error);
      showToast('Failed to update task', 'error');
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      // Delete task from Firebase
      await AuthService.deleteTask(taskId);
      
      // Remove from local state
      setTasks(prev => prev.filter(task => task.id !== taskId));
      showToast('Task deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting task:', error);
      showToast('Failed to delete task', 'error');
    }
  };

  const handleToggleTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      // Update task status in Firebase
      await AuthService.updateTaskStatus(taskId, newStatus);
      
      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              status: newStatus,
              completedAt: newStatus === 'completed' ? new Date() : task.completedAt,
              updatedAt: new Date()
            }
          : task
      ));
      showToast(`Task marked as ${newStatus.replace('_', ' ')}!`, 'success');
    } catch (error) {
      console.error('Error updating task status:', error);
      showToast('Failed to update task status', 'error');
    }
  };

  const openEditTaskModal = (task: Task) => {
    setSelectedTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      category: task.category,
      dueDate: new Date(task.dueDate).toISOString().split('T')[0],
      estimatedTime: task.estimatedTime?.toString() || '',
      tags: task.tags.join(', '),
      notes: task.notes,
      relatedToType: task.relatedTo?.type || '',
      relatedToId: task.relatedTo?.id || '',
      relatedToName: task.relatedTo?.name || '',
      isRecurring: !!task.recurring,
      recurringType: task.recurring?.type || 'weekly',
      recurringInterval: task.recurring?.interval || 1,
      recurringEndDate: task.recurring?.endDate ? new Date(task.recurring.endDate).toISOString().split('T')[0] : ''
    });
    setShowEditTaskModal(true);
  };



  // Test function to create sample orders (for demonstration)
  const createTestOrders = async () => {
    try {
      const testOrders = [
        // Active Orders (processing, shipped, etc.)
        {
          orderId: `DTM${Date.now()}-001`,
          customerId: 'test-customer-1',
          customerName: 'Rahul Sharma',
          customerEmail: 'rahul@example.com',
          customerPhone: '+91 98765 43210',
          items: [{ productId: 'aura-50kg', productName: 'Aura Wall Putty', productType: 'aura' as const, quantity: 2, unitPrice: 2500, totalPrice: 5000, variant: '50kg Pack', shades: ['White'] }],
          totalAmount: 5000, tax: 900, shipping: 0, finalAmount: 5900,
          status: 'processing' as const, paymentMethod: 'UPI', paymentStatus: 'completed' as const,
          shippingAddress: { street: '123 Main Street', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', country: 'India' },
          orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), notes: 'Sample test order'
        },
        {
          orderId: `DTM${Date.now()}-002`,
          customerId: 'test-customer-2',
          customerName: 'Priya Patel',
          customerEmail: 'priya@example.com',
          customerPhone: '+91 98765 43211',
          items: [{ productId: 'dhunee-100', productName: 'Dhunee Incense', productType: 'dhunee' as const, quantity: 1, unitPrice: 1200, totalPrice: 1200, variant: '100 sticks', shades: [] }],
          totalAmount: 1200, tax: 216, shipping: 200, finalAmount: 1616,
          status: 'shipped' as const, paymentMethod: 'Card', paymentStatus: 'completed' as const,
          shippingAddress: { street: '456 Park Avenue', city: 'Delhi', state: 'Delhi', pincode: '110001', country: 'India' },
          orderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), estimatedDelivery: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), notes: 'Sample test order'
        },
        {
          orderId: `DTM${Date.now()}-003`,
          customerId: 'test-customer-3',
          customerName: 'Amit Kumar',
          customerEmail: 'amit@example.com',
          customerPhone: '+91 98765 43212',
          items: [{ productId: 'aura-25kg', productName: 'Aura Wall Putty', productType: 'aura' as const, quantity: 1, unitPrice: 1250, totalPrice: 1250, variant: '25kg Pack', shades: ['White'] }],
          totalAmount: 1250, tax: 225, shipping: 200, finalAmount: 1675,
          status: 'confirmed' as const, paymentMethod: 'Net Banking', paymentStatus: 'completed' as const,
          shippingAddress: { street: '789 Lake Road', city: 'Bangalore', state: 'Karnataka', pincode: '560001', country: 'India' },
          orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), notes: 'Sample test order'
        },
        {
          orderId: `DTM${Date.now()}-004`,
          customerId: 'test-customer-4',
          customerName: 'Neha Singh',
          customerEmail: 'neha@example.com',
          customerPhone: '+91 98765 43213',
          items: [{ productId: 'aura-50kg', productName: 'Aura Wall Putty', productType: 'aura' as const, quantity: 3, unitPrice: 2500, totalPrice: 7500, variant: '50kg Pack', shades: ['White', 'Off-White'] }],
          totalAmount: 7500, tax: 1350, shipping: 0, finalAmount: 8850,
          status: 'out_for_delivery' as const, paymentMethod: 'UPI', paymentStatus: 'completed' as const,
          shippingAddress: { street: '321 Garden Street', city: 'Chennai', state: 'Tamil Nadu', pincode: '600001', country: 'India' },
          orderDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), notes: 'Sample test order'
        },
        {
          orderId: `DTM${Date.now()}-005`,
          customerId: 'test-customer-5',
          customerName: 'Vikram Mehta',
          customerEmail: 'vikram@example.com',
          customerPhone: '+91 98765 43214',
          items: [{ productId: 'dhunee-200', productName: 'Dhunee Incense', productType: 'dhunee' as const, quantity: 2, unitPrice: 2000, totalPrice: 4000, variant: '200 sticks', shades: [] }],
          totalAmount: 4000, tax: 720, shipping: 200, finalAmount: 4920,
          status: 'processing' as const, paymentMethod: 'Card', paymentStatus: 'completed' as const,
          shippingAddress: { street: '654 Ocean Drive', city: 'Kolkata', state: 'West Bengal', pincode: '700001', country: 'India' },
          orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), notes: 'Sample test order'
        },
        {
          orderId: `DTM${Date.now()}-006`,
          customerId: 'test-customer-6',
          customerName: 'Sneha Reddy',
          customerEmail: 'sneha@example.com',
          customerPhone: '+91 98765 43215',
          items: [{ productId: 'aura-25kg', productName: 'Aura Wall Putty', productType: 'aura' as const, quantity: 1, unitPrice: 1250, totalPrice: 1250, variant: '25kg Pack', shades: ['White'] }],
          totalAmount: 1250, tax: 225, shipping: 200, finalAmount: 1675,
          status: 'confirmed' as const, paymentMethod: 'UPI', paymentStatus: 'completed' as const,
          shippingAddress: { street: '987 Hill Road', city: 'Hyderabad', state: 'Telangana', pincode: '500001', country: 'India' },
          orderDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), notes: 'Sample test order'
        },
        // Completed Orders (delivered)
        {
          orderId: `DTM${Date.now()}-007`,
          customerId: 'test-customer-7',
          customerName: 'Rajesh Kumar',
          customerEmail: 'rajesh@example.com',
          customerPhone: '+91 98765 43216',
          items: [{ productId: 'aura-50kg', productName: 'Aura Wall Putty', productType: 'aura' as const, quantity: 2, unitPrice: 2500, totalPrice: 5000, variant: '50kg Pack', shades: ['White'] }],
          totalAmount: 5000, tax: 900, shipping: 0, finalAmount: 5900,
          status: 'delivered' as const, paymentMethod: 'Net Banking', paymentStatus: 'completed' as const,
          shippingAddress: { street: '147 River View', city: 'Pune', state: 'Maharashtra', pincode: '411001', country: 'India' },
          orderDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), estimatedDelivery: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), actualDelivery: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), notes: 'Sample test order - delivered'
        },
        {
          orderId: `DTM${Date.now()}-008`,
          customerId: 'test-customer-8',
          customerName: 'Anjali Desai',
          customerEmail: 'anjali@example.com',
          customerPhone: '+91 98765 43217',
          items: [{ productId: 'dhunee-100', productName: 'Dhunee Incense', productType: 'dhunee' as const, quantity: 1, unitPrice: 1200, totalPrice: 1200, variant: '100 sticks', shades: [] }],
          totalAmount: 1200, tax: 216, shipping: 200, finalAmount: 1616,
          status: 'delivered' as const, paymentMethod: 'Card', paymentStatus: 'completed' as const,
          shippingAddress: { street: '258 Forest Lane', city: 'Ahmedabad', state: 'Gujarat', pincode: '380001', country: 'India' },
          orderDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), estimatedDelivery: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), actualDelivery: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), notes: 'Sample test order - delivered'
        },
        {
          orderId: `DTM${Date.now()}-009`,
          customerId: 'test-customer-9',
          customerName: 'Deepak Verma',
          customerEmail: 'deepak@example.com',
          customerPhone: '+91 98765 43218',
          items: [{ productId: 'aura-25kg', productName: 'Aura Wall Putty', productType: 'aura' as const, quantity: 1, unitPrice: 1250, totalPrice: 1250, variant: '25kg Pack', shades: ['White'] }],
          totalAmount: 1250, tax: 225, shipping: 200, finalAmount: 1675,
          status: 'delivered' as const, paymentMethod: 'UPI', paymentStatus: 'completed' as const,
          shippingAddress: { street: '369 Mountain View', city: 'Jaipur', state: 'Rajasthan', pincode: '302001', country: 'India' },
          orderDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), estimatedDelivery: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), actualDelivery: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), notes: 'Sample test order - delivered'
        },
        {
          orderId: `DTM${Date.now()}-010`,
          customerId: 'test-customer-10',
          customerName: 'Pooja Sharma',
          customerEmail: 'pooja@example.com',
          customerPhone: '+91 98765 43219',
          items: [{ productId: 'aura-50kg', productName: 'Aura Wall Putty', productType: 'aura' as const, quantity: 2, unitPrice: 2500, totalPrice: 5000, variant: '50kg Pack', shades: ['White', 'Off-White'] }],
          totalAmount: 5000, tax: 900, shipping: 0, finalAmount: 5900,
          status: 'delivered' as const, paymentMethod: 'Net Banking', paymentStatus: 'completed' as const,
          shippingAddress: { street: '741 Beach Road', city: 'Goa', state: 'Goa', pincode: '403001', country: 'India' },
          orderDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), estimatedDelivery: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), actualDelivery: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), notes: 'Sample test order - delivered'
        },
        {
          orderId: `DTM${Date.now()}-011`,
          customerId: 'test-customer-11',
          customerName: 'Mohan Patel',
          customerEmail: 'mohan@example.com',
          customerPhone: '+91 98765 43220',
          items: [{ productId: 'dhunee-200', productName: 'Dhunee Incense', productType: 'dhunee' as const, quantity: 1, unitPrice: 2000, totalPrice: 2000, variant: '200 sticks', shades: [] }],
          totalAmount: 2000, tax: 360, shipping: 200, finalAmount: 2560,
          status: 'delivered' as const, paymentMethod: 'Card', paymentStatus: 'completed' as const,
          shippingAddress: { street: '852 Valley Street', city: 'Chandigarh', state: 'Punjab', pincode: '160001', country: 'India' },
          orderDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), estimatedDelivery: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000), actualDelivery: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000), notes: 'Sample test order - delivered'
        },
        {
          orderId: `DTM${Date.now()}-012`,
          customerId: 'test-customer-12',
          customerName: 'Kavita Singh',
          customerEmail: 'kavita@example.com',
          customerPhone: '+91 98765 43221',
          items: [{ productId: 'aura-25kg', productName: 'Aura Wall Putty', productType: 'aura' as const, quantity: 1, unitPrice: 1250, totalPrice: 1250, variant: '25kg Pack', shades: ['White'] }],
          totalAmount: 1250, tax: 225, shipping: 200, finalAmount: 1675,
          status: 'delivered' as const, paymentMethod: 'UPI', paymentStatus: 'completed' as const,
          shippingAddress: { street: '963 Lake View', city: 'Udaipur', state: 'Rajasthan', pincode: '313001', country: 'India' },
          orderDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), estimatedDelivery: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000), actualDelivery: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000), notes: 'Sample test order - delivered'
        }
      ];

      for (const orderData of testOrders) {
        await AuthService.createOrder(orderData);
      }

      // Reload orders
      const fetchedOrders = await AuthService.getOrders();
      setOrders(fetchedOrders);
      
      showToast('Test orders created successfully! You should now see pagination controls.', 'success');
    } catch (error) {
      console.error('Error creating test orders:', error);
      showToast('Failed to create test orders', 'error');
    }
  };

  // Test function to create sample customers (for demonstration)
  // Test function to check Firebase connectivity
  const testFirebaseConnection = async () => {
    try {
      console.log('=== Firebase Connection Test ===');
      console.log('Testing Firebase configuration...');
      
      // Test 1: Check environment variables
      console.log('Environment variables:');
      console.log('- NEXT_PUBLIC_FIREBASE_API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Not set');
      console.log('- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Set' : 'Not set');
      console.log('- NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Set' : 'Not set');
      
      // Test 2: Check Firebase objects
      console.log('Firebase objects:');
      console.log('- auth:', auth);
      console.log('- db:', db);
      console.log('- app:', app);
      
      // Test 3: Try to import Firestore
      console.log('Testing Firestore imports...');
      const { getDocs, collection } = await import('firebase/firestore');
      console.log('Firestore imports successful');
      
      // Test 4: Try to fetch data
      console.log('Testing data fetch...');
      const querySnapshot = await getDocs(collection(db, 'users'));
      console.log(`Firebase connection successful! Found ${querySnapshot.docs.length} documents in users collection.`);
      
      // Show results
      const message = `Firebase connection successful! Found ${querySnapshot.docs.length} users.`;
      console.log(message);
      showToast(message, 'success');
      
    } catch (error) {
      console.error('=== Firebase Connection Test Failed ===');
      console.error('Error:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : 'No message');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
      
      const errorMessage = `Firebase connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(errorMessage);
      showToast(errorMessage, 'error');
    }
  };

  const createTestCustomers = async () => {
    try {
      const testCustomers = [
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+919876543210',
          role: 'customer' as const
        },
        {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          phone: '+919876543211',
          role: 'customer' as const
        },
        {
          firstName: 'Mike',
          lastName: 'Johnson',
          email: 'mike.johnson@example.com',
          phone: '+919876543212',
          role: 'customer' as const
        },
        {
          firstName: 'Sarah',
          lastName: 'Williams',
          email: 'sarah.williams@example.com',
          phone: '+919876543213',
          role: 'customer' as const
        },
        {
          firstName: 'David',
          lastName: 'Brown',
          email: 'david.brown@example.com',
          phone: '+919876543214',
          role: 'customer' as const
        },
        {
          firstName: 'Emily',
          lastName: 'Davis',
          email: 'emily.davis@example.com',
          phone: '+919876543215',
          role: 'customer' as const
        }
      ];

      for (const customerData of testCustomers) {
        try {
          // Create a mock user object for testing
          const mockUser = {
            uid: `customer-${Date.now()}-${Math.random()}`,
            email: customerData.email
          } as any;
          
          await AuthService.createUserProfile(mockUser, {
            firstName: customerData.firstName,
            lastName: customerData.lastName,
            phone: customerData.phone
          });
          
          // Set role to customer
          await AuthService.updateUserRole(mockUser.uid, 'customer');
        } catch (error) {
          console.error('Error creating test customer:', error);
        }
      }
      
      // Reload customers
      loadAllCustomers();
      
      showToast('Test customers created successfully!', 'success');
    } catch (error) {
      console.error('Error creating test customers:', error);
      showToast('Failed to create test customers', 'error');
    }
  };

  useEffect(() => {
    if (activeTab === 'formSubmissions') {
      setIsLoadingSubmissions(true);
      setSubmissionsError(null);
      getDocs(collection(db, 'franchiseApplications'))
        .then((querySnapshot) => {
          const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setFranchiseSubmissions(data);
        })
        .catch((err) => {
          setSubmissionsError('Failed to fetch franchise submissions.');
        })
        .finally(() => setIsLoadingSubmissions(false));

      setIsLoadingContact(true);
      setContactError(null);
      getDocs(collection(db, 'contactFormSubmissions'))
        .then((querySnapshot) => {
          const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setContactSubmissions(data);
        })
        .catch((err) => {
          setContactError('Failed to fetch contact form submissions.');
        })
        .finally(() => setIsLoadingContact(false));
    }
  }, [activeTab]);

  // Quote creation functions
  const handleCreateQuote = (lead?: Lead) => {
    if (lead) {
      // Existing lead mode
      setSelectedLeadForQuote(lead);
      setQuoteMode('existing');
      setQuoteForm({
        title: `Quote for ${lead.name} - ${lead.interest}`,
        description: `Professional quote for ${lead.name} regarding ${lead.interest}`,
        items: [{ productId: '', quantity: 1 }],
        terms: 'Payment terms: 50% advance, 50% on completion\nValid for 30 days\nGST applicable as per government rates',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        discount: 0,
        discountType: 'percentage',
        paymentLink: '',
        status: 'draft'
      });
    } else {
      // New customer mode
      setSelectedLeadForQuote(null);
      setQuoteMode('new');
      setNewCustomerForm({
        name: '',
        email: '',
        phone: '',
        interest: '',
        source: 'Website',
        addToLeads: true
      });
      setQuoteForm({
        title: '',
        description: '',
        items: [{ productId: '', quantity: 1 }],
        terms: 'Payment terms: 50% advance, 50% on completion\nValid for 30 days\nGST applicable as per government rates',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        discount: 0,
        discountType: 'percentage',
        paymentLink: '',
        status: 'draft'
      });
      
      // Pre-fill quote form if product is selected
      if (newCustomerForm.interest) {
        setQuoteForm(prev => ({
          ...prev,
          title: `Quote for Customer - ${newCustomerForm.interest}`,
          description: `Professional quote for customer regarding ${newCustomerForm.interest}`
        }));
      }
    }
    setShowCreateQuoteModal(true);
  };

  const addQuoteItem = () => {
    setQuoteForm(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1 }]
    }));
  };

  const removeQuoteItem = (index: number) => {
    if (quoteForm.items.length > 1) {
      setQuoteForm(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
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
      return sum + (item.quantity * (product?.price || 0));
    }, 0);
    
    let discountAmount = 0;
    if (quoteForm.discountType === 'percentage') {
      discountAmount = (subtotal * quoteForm.discount) / 100;
    } else {
      discountAmount = Math.min(quoteForm.discount, subtotal); // Can't exceed subtotal
    }
    
    return {
      subtotal,
      discountAmount,
      total: subtotal - discountAmount
    };
  };

  const handleSaveQuote = async () => {
    try {
      let customerName = '';
      let customerEmail = '';
      let customerPhone = '';
      let customerInterest = '';

      if (quoteMode === 'existing' && selectedLeadForQuote) {
        // Existing lead mode
        customerName = selectedLeadForQuote.name;
        customerEmail = selectedLeadForQuote.email || '';
        customerPhone = selectedLeadForQuote.phone || '';
        customerInterest = selectedLeadForQuote.interest;
      } else if (quoteMode === 'new') {
        // New customer mode
        if (!newCustomerForm.name.trim()) {
          showToast('Customer name is required', 'error');
          return;
        }
        if (!newCustomerForm.interest.trim()) {
          showToast('Product/Service interest is required', 'error');
          return;
        }
        if (!newCustomerForm.source.trim()) {
          showToast('Lead source is required', 'error');
          return;
        }
        
        customerName = newCustomerForm.name;
        customerEmail = newCustomerForm.email;
        customerPhone = newCustomerForm.phone;
        customerInterest = newCustomerForm.interest;

        // Create new lead if checkbox is checked
        if (newCustomerForm.addToLeads) {
          try {
            const newLead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'> = {
              name: customerName,
              email: customerEmail,
              phone: customerPhone,
              source: newCustomerForm.source,
              status: 'New Lead',
              interest: customerInterest,
              notes: `Created from quote generation on ${new Date().toLocaleDateString()}`,
              createdBy: auth.currentUser?.uid || ''
            };

            const leadId = await AuthService.createLead(newLead, auth.currentUser?.uid || '');
            
            // Create the full lead object for local state
            const createdLead: Lead = {
              id: leadId,
              ...newLead,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            // Add to local state
            setLeads(prev => [...prev, createdLead]);
            
            showToast(`New lead created for ${customerName}!`, 'success');
          } catch (error) {
            console.error('Error creating lead:', error);
            showToast('Quote created but failed to create lead', 'error');
          }
        }
      }

      const quoteData = {
        id: '', // Will be set by Firestore
        quoteNumber: generateQuoteNumber(),
        version: 1,
        parentQuoteId: null,
        previousVersionId: null,
        
        // Customer info  
        leadId: quoteMode === 'existing' ? (selectedLeadForQuote?.id || null) : null,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        customerInterest: customerInterest,
        
        // Quote details
        items: quoteForm.items,
        subtotal: calculateQuoteTotal().subtotal,
        discount: quoteForm.discount,
        discountType: quoteForm.discountType,
        total: calculateQuoteTotal().total,
        validUntil: quoteForm.validUntil,
        
        // Payment & company
        paymentLink: quoteForm.paymentLink,
        companyDetails: companyDetails,
        
        // Status & tracking
        status: 'draft' as const,
        createdAt: new Date(),
        createdBy: auth.currentUser?.uid || '',
        updatedAt: new Date(),
        
        // Auto-expiry
        isExpired: isQuoteExpired(quoteForm.validUntil)
      };

      // Save quote to Firestore
      const quoteId = await AuthService.createQuote(quoteData, auth.currentUser?.uid || '');
      
      // Add to local state with the generated ID
      const newQuote: Quote = {
        ...quoteData,
        id: quoteId
      };
      setQuotes(prev => {
        // Ensure no duplicate quotes
        const existingQuote = prev.find(q => q.id === quoteId);
        if (existingQuote) {
          return prev;
        }
        return [...prev, newQuote];
      });
      
      // Reload analytics
      await loadQuoteAnalytics();
      
      // Show success message
      showToast(`Quote created successfully for ${customerName}!`, 'success');
      
      // Update existing lead status to "Proposal Sent" if applicable
      if (quoteMode === 'existing' && selectedLeadForQuote && selectedLeadForQuote.status === 'Qualified') {
        await AuthService.updateLead(selectedLeadForQuote.id!, {
          ...selectedLeadForQuote,
          status: 'Proposal Sent',
          updatedAt: new Date()
        });
        
        // Update local state
        setLeads(leads.map(l =>
          l.id === selectedLeadForQuote.id
            ? { ...l, status: 'Proposal Sent', updatedAt: new Date() }
            : l
        ));
      }

      // Close modal and reset form
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
        paymentLink: '',
        status: 'draft'
      });

    } catch (error) {
      console.error('Error creating quote:', error);
      showToast('Failed to create quote', 'error');
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
    <div className="min-h-screen bg-gradient-to-br from-[#F8F6F0] via-[#F5F2E8] to-[#E6DCC0]">
            {/* Modern Admin Header */}


      {/* Main Layout */}
      <div className="fixed top-0 left-0 w-full h-full flex" style={{ top: 'env(safe-area-inset-top)', height: 'calc(100vh - env(safe-area-inset-top))' }}>
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)}></div>
        )}
        
        {/* Sidebar */}
        <aside className={`fixed md:static z-40 left-0 top-0 w-72 sm:w-80 md:w-60 h-full bg-gradient-to-br from-[#FFFBE6] to-[#F5F2E8] border-r-2 border-[#D4AF37] shadow-2xl flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between p-3 sm:p-4 pt-6 border-b border-[#D4AF37]">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] flex items-center justify-center shadow-lg border-2 border-white">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-[#5E4E06] text-xs sm:text-sm">{userProfile?.firstName || 'Admin'}</div>
                <div className="text-[#8B7A1A] text-xs">{userProfile?.email || 'admin@email.com'}</div>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 sm:p-2 hover:bg-[#F5F2E8] rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-[#8B7A1A]" />
            </button>
          </div>
          
          {/* Desktop Profile Section */}
          <div className="hidden md:flex flex-col items-center pt-6 sm:pt-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] flex items-center justify-center shadow-lg border-4 border-white mb-3 sm:mb-4">
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <div className="text-center mb-6 sm:mb-8">
              <div className="font-black text-base sm:text-lg text-[#5E4E06]">{userProfile?.firstName || 'Admin'}</div>
              <div className="text-[#8B7A1A] text-xs mb-2">{userProfile?.email || 'admin@email.com'}</div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 w-full px-3 sm:px-4">
            <ul className="space-y-1 sm:space-y-2">
              {navigation.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false); // Close sidebar on mobile after selection
                    }}
                    className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold transition-all text-sm sm:text-base md:text-lg cursor-pointer ${activeTab === item.id ? 'bg-gradient-to-r from-[#D4AF37]/30 to-[#8B7A1A]/10 text-[#5E4E06] shadow' : 'text-[#8B7A1A] hover:bg-[#F5F2E8] hover:text-[#5E4E06]'}`}
                  >
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5" /> 
                    <span className="flex-1 text-left">{item.name}</span>
                  </button>
                </li>
              ))}
              <li>
                <button 
                  onClick={() => {
                    handleLogout();
                    setSidebarOpen(false); // Close sidebar on mobile
                  }} 
                  className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold transition-all text-sm sm:text-base md:text-lg text-[#8B7A1A] hover:bg-[#F5F2E8] hover:text-[#5E4E06] cursor-pointer"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" /> 
                  <span className="flex-1 text-left">Logout</span>
                </button>
              </li>
            </ul>
          </nav>
          
          {/* Back to Site Button */}
          <div className="px-3 sm:px-4 py-3 sm:py-4 border-t border-[#D4AF37]">
            <Link 
              href="/" 
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-[#8B7A1A] bg-[#F5F2E8] hover:bg-[#D4AF37] hover:text-white transition-all duration-300 transform hover:scale-105 shadow-md cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm font-semibold">Back to Site</span>
            </Link>
          </div>
          
          {/* Footer */}
          <div className="p-3 sm:p-4 md:px-4 md:mb-6">
            <div className="text-xs text-[#8B7A1A] text-center">Desert to Mountains &copy; {new Date().getFullYear()}</div>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 w-full h-full overflow-y-auto relative z-10 bg-transparent p-2 sm:p-3 md:p-4 lg:p-8 pt-20 md:pt-2">
          {/* Mobile Menu Button - Fixed Position */}
          <button 
            onClick={() => setSidebarOpen(true)}
            className="md:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white hover:from-[#8B7A1A] hover:to-[#5E4E06] transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        {activeTab === 'overview' && (
          <div className="space-y-4 sm:space-y-6 lg:space-y-8 mt-4 md:mt-0">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-[#FFFBE6] to-[#F5F2E8] rounded-xl sm:rounded-2xl lg:rounded-3xl border border-[#D4AF37] p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#5E4E06] mb-2 sm:mb-3">Welcome back! 👋</h2>
                  <p className="text-sm sm:text-base lg:text-lg text-[#8B7A1A]">Here's what's happening with your business today.</p>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-[#D4AF37]">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37]" />
                  <span className="text-xs sm:text-sm font-medium text-[#5E4E06]">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {crmStats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl sm:rounded-2xl border border-[#D4AF37] p-3 sm:p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br ${stat.gradient} rounded-xl sm:rounded-2xl flex items-center justify-center`}>
                      <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xs sm:text-sm font-medium text-[#8B7A1A] mb-1 sm:mb-2">{stat.title}</h3>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#5E4E06] mb-2 sm:mb-3">
                    {stat.title === 'Total Leads' ? leads.length.toString() : stat.value}
                  </p>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    {stat.change.startsWith('+') ? (
                      <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                    ) : stat.change.startsWith('-') ? (
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                    ) : (
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-[#8B7A1A]" />
                    )}
                    <span className={`text-xs sm:text-sm font-semibold ${
                      stat.change.startsWith('+') ? 'text-green-600' : 
                      stat.change.startsWith('-') ? 'text-red-600' : 
                      'text-[#8B7A1A]'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-xs sm:text-sm text-[#8B7A1A] hidden sm:inline">{stat.description}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {/* Recent Leads */}
              <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl border border-[#D4AF37] p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-[#5E4E06]">Recent Leads</h3>
                  <button 
                    onClick={() => setShowAddLeadModal(true)}
                    className="flex items-center justify-center sm:justify-start space-x-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-lg sm:rounded-xl hover:scale-105 transition-all duration-200 text-sm sm:text-base cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Lead</span>
                  </button>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {leads.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                      <UserPlus className="w-10 h-10 sm:w-12 sm:h-12 text-[#D4AF37] mx-auto mb-3 sm:mb-4" />
                      <p className="text-sm sm:text-base text-[#8B7A1A]">No leads yet. Add your first lead!</p>
                    </div>
                  ) : (
                    leads.slice(0, 5).map((lead) => (
                      <div key={lead.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-[#FFFBE6] rounded-lg sm:rounded-xl border border-[#D4AF37] space-y-2 sm:space-y-0">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-lg sm:rounded-xl flex items-center justify-center">
                            <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-[#5E4E06] text-sm sm:text-base">{lead.name}</p>
                            <p className="text-xs sm:text-sm text-[#8B7A1A]">Interested in {lead.interest}</p>
                            <p className="text-xs text-[#8B7A1A]">
                              {lead.createdAt instanceof Date 
                                ? lead.createdAt.toLocaleDateString() 
                                : new Date(lead.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end space-x-2">
                          <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-[#D4AF37] text-[#5E4E06]">
                            {lead.status}
                          </span>
                          <div className="relative dropdown-container">
                            <button 
                              onClick={() => setOpenLeadDropdown(openLeadDropdown === lead.id ? null : (lead.id || null))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  setOpenLeadDropdown(openLeadDropdown === lead.id ? null : (lead.id || null));
                                }
                              }}
                              aria-label={`More options for ${lead.name}`}
                              aria-expanded={openLeadDropdown === lead.id}
                              aria-haspopup="true"
                              className={`p-1 sm:p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                                openLeadDropdown === lead.id 
                                  ? 'bg-[#D4AF37] text-white' 
                                  : 'hover:bg-[#F5F2E8] text-[#8B7A1A]'
                              }`}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            
                            {/* Dropdown Menu */}
                            {openLeadDropdown === lead.id && (
                              <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-[#D4AF37] rounded-lg shadow-lg z-50">
                                <div className="py-1">
                                  <button
                                    onClick={() => handleRecentLeadAction('edit', lead)}
                                    className="w-full text-left px-4 py-2 text-sm text-[#5E4E06] hover:bg-[#F5F2E8] transition-colors duration-200 cursor-pointer flex items-center space-x-2"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    <span>Edit Lead</span>
                                  </button>
                                  <button
                                    onClick={() => handleRecentLeadAction('call', lead)}
                                    disabled={!lead.phone}
                                    className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 cursor-pointer flex items-center space-x-2 ${
                                      lead.phone 
                                        ? 'text-[#5E4E06] hover:bg-[#F5F2E8]' 
                                        : 'text-gray-400 cursor-not-allowed'
                                    }`}
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span>{lead.phone ? 'Call Now' : 'No Phone'}</span>
                                  </button>
                                  <button
                                    onClick={() => handleCreateQuote(lead)}
                                    className="w-full text-left px-4 py-2 text-sm text-[#5E4E06] hover:bg-[#F5F2E8] transition-colors duration-200 cursor-pointer flex items-center space-x-2"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>Create Quote</span>
                                  </button>
                                  <div className="border-t border-gray-200 my-1"></div>
                                  <button
                                    onClick={() => handleRecentLeadAction('delete', lead)}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 cursor-pointer flex items-center space-x-2"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <span>Delete Lead</span>
                          </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl sm:rounded-2xl border border-[#D4AF37] p-4 sm:p-6 shadow-sm">
                <h3 className="text-lg sm:text-xl font-bold text-[#5E4E06] mb-4 sm:mb-6">Quick Actions</h3>
                <div className="space-y-3 sm:space-y-4">
                  <button 
                    onClick={() => setShowAddLeadModal(true)}
                    className="w-full flex items-center space-x-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#FFFBE6] to-[#F5F2E8] border border-[#D4AF37] hover:scale-105 transition-all duration-300 cursor-pointer"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-lg sm:rounded-xl flex items-center justify-center">
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-[#5E4E06] text-sm sm:text-base">Add New Lead</p>
                      <p className="text-xs sm:text-sm text-[#8B7A1A]">Capture potential customer</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => setShowDirectCallModal(true)}
                    className="w-full flex items-center space-x-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#FFFBE6] to-[#F5F2E8] border border-[#D4AF37] hover:scale-105 transition-all duration-300 cursor-pointer"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#8B7A1A] to-[#5E4E06] rounded-lg sm:rounded-xl flex items-center justify-center">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-[#5E4E06] text-sm sm:text-base">Direct Call</p>
                      <p className="text-xs sm:text-sm text-[#8B7A1A]">Call lead directly now</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => handleCreateQuote()}
                    className="w-full flex items-center space-x-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#FFFBE6] to-[#F5F2E8] border border-[#D4AF37] hover:scale-105 transition-all duration-300 cursor-pointer"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-lg sm:rounded-xl flex items-center justify-center">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-[#5E4E06] text-sm sm:text-base">Create Quote</p>
                      <p className="text-xs sm:text-sm text-[#8B7A1A]">Generate price proposal</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="bg-white rounded-xl sm:rounded-2xl border border-[#D4AF37] p-4 sm:p-6 lg:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#5E4E06] mb-2">Lead Management</h2>
                <p className="text-sm sm:text-base text-[#8B7A1A]">
                  Track and manage your potential customers effectively. 
                  <span className="ml-2 font-semibold text-[#D4AF37]">{leads.length} total leads</span>
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <button 
                  onClick={async () => {
                    try {
                      const updatedLeads = await AuthService.getLeads();
                      setLeads(updatedLeads);
                      showToast('Leads refreshed successfully!', 'success');
                    } catch (error) {
                      showToast('Failed to refresh leads', 'error');
                    }
                  }}
                  className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 sm:py-3 bg-[#F5F2E8] text-[#8B7A1A] rounded-lg sm:rounded-xl hover:bg-[#E6DCC0] transition-colors duration-200 text-sm sm:text-base cursor-pointer"
                  title="Refresh leads"
                >
                  <Repeat className="w-4 h-4" />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              <button 
                onClick={() => setShowAddLeadModal(true)}
                  className="flex items-center justify-center sm:justify-start space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-lg sm:rounded-xl hover:scale-105 transition-all duration-200 text-sm sm:text-base cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Lead</span>
              </button>
            </div>
            </div>
                        {/* Lead Search and Filters */}
            {leads.length > 0 && (
              <div className="mb-6 space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B7A1A]" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 border border-[#D4AF37] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] placeholder-[#8B7A1A]"
                    placeholder="Search leads by name, phone, email, or interest..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[#F5F2E8] rounded-lg transition-colors cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-4 h-4 text-[#8B7A1A]" />
                    </button>
                  )}
                </div>
                
                {/* Filters */}
                <div className="p-3 sm:p-4 bg-[#F5F2E8] rounded-lg border border-[#D4AF37]">
                  {/* Mobile: Stacked layout, Desktop: Side by side */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    {/* Filter by Status Section */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                      <span className="text-sm sm:text-base font-semibold text-[#5E4E06]">Filter by Status:</span>
                      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-2">
                        {['All', 'New Lead', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Closed Won', 'Closed Lost'].map((status) => {
                          const count = status === 'All' 
                            ? leads.length 
                            : leads.filter(lead => lead.status === status).length;
                          
                          return (
                            <button
                              key={status}
                              onClick={() => {
                                setSelectedStatusFilter(status);
                                // Clear search when changing status filter for better UX
                                if (searchTerm) {
                                  setSearchTerm('');
                                }
                              }}
                              className={`px-3 py-2.5 sm:py-1.5 text-xs sm:text-xs font-medium rounded-full border transition-colors duration-200 cursor-pointer min-h-[40px] sm:min-h-0 ${
                                selectedStatusFilter === status
                                  ? 'bg-[#D4AF37] text-white border-[#D4AF37] shadow-sm'
                                  : 'border-[#D4AF37] text-[#8B7A1A] hover:bg-[#D4AF37] hover:text-white bg-white/50'
                              }`}
                            >
                              <span className="block sm:inline">{status}</span>
                              <span className="block sm:inline text-[10px] sm:text-xs opacity-80">({count})</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Mobile: Stacked info, Desktop: Side by side */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-3 pt-2 sm:pt-0 border-t border-[#D4AF37]/20 sm:border-t-0">
                      {/* Left side: Active filter and results count */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        {/* Active Filter Display */}
                        {selectedStatusFilter !== 'All' && (
                          <div className="text-xs text-[#8B7A1A] bg-white px-3 py-1.5 rounded-full border border-[#D4AF37] self-start sm:self-auto">
                            Active: {selectedStatusFilter}
                          </div>
                        )}
                        
                        {/* Results Count */}
                        <div className="text-xs sm:text-sm text-[#8B7A1A] self-start sm:self-auto">
                          Showing {filteredLeads.length} of {leads.length} leads
                        </div>
                      </div>
                      
                      {/* Right side: Clear filters button */}
                      {(selectedStatusFilter !== 'All' || searchTerm) && (
                        <button
                          onClick={() => {
                            setSelectedStatusFilter('All');
                            setSearchTerm('');
                          }}
                          className="text-xs sm:text-sm text-[#8B7A1A] hover:text-[#5E4E06] underline cursor-pointer self-start sm:self-auto px-2 py-1 -ml-2 sm:ml-0"
                        >
                          Clear All Filters
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Filter Summary */}
                {(selectedStatusFilter !== 'All' || searchTerm) && (
                  <div className="p-3 sm:p-4 bg-white rounded-lg border border-[#D4AF37]">
                    {/* Mobile: Stacked layout, Desktop: Side by side */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                      {/* Left side: Filter info */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-2">
                          <Filter className="w-4 h-4 text-[#D4AF37]" />
                          <span className="font-medium text-[#5E4E06] text-sm sm:text-base">Active Filters:</span>
                        </div>
                        <div className="flex flex-wrap gap-2 ml-6 sm:ml-0">
                          {selectedStatusFilter !== 'All' && (
                            <span className="px-2 py-1.5 bg-[#F5F2E8] text-[#8B7A1A] rounded-full text-xs border border-[#D4AF37]/30">
                              Status: {selectedStatusFilter}
                            </span>
                          )}
                          {searchTerm && (
                            <span className="px-2 py-1.5 bg-[#F5F2E8] text-[#8B7A1A] rounded-full text-xs border border-[#D4AF37]/30">
                              Search: "{searchTerm}"
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Right side: Clear button */}
                      <button
                        onClick={() => {
                          setSelectedStatusFilter('All');
                          setSearchTerm('');
                        }}
                        className="text-[#8B7A1A] hover:text-[#5E4E06] underline text-xs sm:text-sm cursor-pointer self-start sm:self-auto px-2 py-1 -ml-2 sm:ml-0"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                )}

                {/* Pagination Controls */}
                {filteredLeads.length > 0 && (
                  <div className="flex flex-col gap-4 p-3 sm:p-4 bg-white rounded-lg border border-[#D4AF37]">
                    {/* Mobile: Stacked layout, Desktop: Side by side */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-4">
                      {/* Left side: Page size and results info */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        {/* Page Size Selector */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm text-[#8B7A1A]">Show:</span>
                          <select
                            value={leadsPerPage}
                            onChange={(e) => {
                              setLeadsPerPage(Number(e.target.value));
                              setCurrentPage(1); // Reset to first page
                            }}
                            className="px-2 py-1.5 sm:py-1 text-xs sm:text-sm border border-[#D4AF37] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] cursor-pointer min-h-[36px] sm:min-h-0"
                          >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                          </select>
                          <span className="text-xs sm:text-sm text-[#8B7A1A]">leads per page</span>
                        </div>

                        {/* Results Info */}
                        <div className="text-xs sm:text-sm text-[#8B7A1A]">
                          Showing {startIndex + 1}-{Math.min(endIndex, filteredLeads.length)} of {filteredLeads.length} leads
                        </div>
                      </div>
                    </div>

                    {/* Pagination Navigation */}
                    {totalPages > 1 && (
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2 pt-2 sm:pt-0 border-t border-[#D4AF37]/20 sm:border-t-0">
                        {/* Mobile: Stacked navigation, Desktop: Horizontal */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2">
                          {/* First and Previous buttons */}
                          <div className="flex items-center gap-2 justify-center sm:justify-start">
                            {/* First Page */}
                            <button
                              onClick={() => setCurrentPage(1)}
                              disabled={currentPage === 1}
                              className="px-3 py-2 sm:py-1 text-xs sm:text-sm border border-[#D4AF37] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5F2E8] transition-colors cursor-pointer min-h-[40px] sm:min-h-0"
                            >
                              First
                            </button>

                            {/* Previous Page */}
                            <button
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={currentPage === 1}
                              className="px-3 py-2 sm:py-1 text-xs sm:text-sm border border-[#D4AF37] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5F2E8] transition-colors cursor-pointer min-h-[40px] sm:min-h-0"
                            >
                              Previous
                            </button>
                          </div>

                          {/* Page Numbers - Mobile: Grid, Desktop: Flex */}
                          <div className="grid grid-cols-5 gap-1 sm:flex sm:items-center sm:gap-1 justify-center sm:justify-start">
                            {(() => {
                              const pages = [];
                              const maxVisiblePages = 5;
                              let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                              let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

                              // Adjust start page if we're near the end
                              if (endPage - startPage + 1 < maxVisiblePages) {
                                startPage = Math.max(1, endPage - maxVisiblePages + 1);
                              }

                              // Add ellipsis and first page if needed
                              if (startPage > 1) {
                                pages.push(
                                  <span key="ellipsis-start" className="px-2 py-2 sm:py-1 text-[#8B7A1A] text-center sm:text-left">
                                    ...
                                  </span>
                                );
                              }

                              for (let i = startPage; i <= endPage; i++) {
                                pages.push(
                                  <button
                                    key={i}
                                    onClick={() => setCurrentPage(i)}
                                    className={`px-3 py-2 sm:py-1 text-xs sm:text-sm border rounded-lg transition-colors cursor-pointer min-h-[40px] sm:min-h-0 ${
                                      currentPage === i
                                        ? 'bg-[#D4AF37] text-white border-[#D4AF37]'
                                        : 'border-[#D4AF37] text-[#8B7A1A] hover:bg-[#F5F2E8]'
                                    }`}
                                  >
                                    {i}
                                  </button>
                                );
                              }

                              // Add ellipsis and last page if needed
                              if (endPage < totalPages) {
                                pages.push(
                                  <span key="ellipsis-end" className="px-2 py-2 sm:py-1 text-[#8B7A1A] text-center sm:text-left">
                                    ...
                                  </span>
                                );
                              }

                              return pages;
                            })()}
                          </div>

                          {/* Next and Last buttons */}
                          <div className="flex items-center gap-2 justify-center sm:justify-start">
                            {/* Next Page */}
                            <button
                              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                              disabled={currentPage === totalPages}
                              className="px-3 py-2 sm:py-1 text-xs sm:text-sm border border-[#D4AF37] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5F2E8] transition-colors cursor-pointer min-h-[40px] sm:min-h-0"
                            >
                              Next
                            </button>

                            {/* Last Page */}
                            <button
                              onClick={() => setCurrentPage(totalPages)}
                              disabled={currentPage === totalPages}
                              className="px-3 py-2 sm:py-1 text-xs sm:text-sm border border-[#D4AF37] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5F2E8] transition-colors cursor-pointer min-h-[40px] sm:min-h-0"
                            >
                              Last
                            </button>
                          </div>
                        </div>

                        {/* Quick Jump Input for many pages - Mobile: Full width, Desktop: Compact */}
                        {totalPages > 10 && (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-3 sm:pt-0 sm:ml-2 border-t border-[#D4AF37]/20 sm:border-t-0">
                            <span className="text-xs text-[#8B7A1A] text-center sm:text-left">Go to page:</span>
                            <div className="flex items-center gap-2 justify-center sm:justify-start">
                              <input
                                type="number"
                                min={1}
                                max={totalPages}
                                value={currentPage}
                                onChange={(e) => {
                                  const page = parseInt(e.target.value);
                                  if (page >= 1 && page <= totalPages) {
                                    setCurrentPage(page);
                                  }
                                }}
                                className="w-20 sm:w-16 px-3 sm:px-2 py-2 sm:py-1 text-xs sm:text-sm border border-[#D4AF37] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] cursor-text text-center sm:text-left min-h-[40px] sm:min-h-0"
                                placeholder="Page"
                              />
                              <span className="text-xs text-[#8B7A1A]">of {totalPages}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {leads.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <UserPlus className="w-16 h-16 sm:w-20 sm:h-20 text-[#D4AF37] mx-auto mb-4 sm:mb-6" />
                <h3 className="text-lg sm:text-xl font-semibold text-[#5E4E06] mb-2 sm:mb-3">No Leads Yet</h3>
                <p className="text-sm sm:text-base text-[#8B7A1A] max-w-md mx-auto">Start by adding your first lead using the button above.</p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <Search className="w-16 h-16 sm:w-20 sm:h-20 text-[#D4AF37] mx-auto mb-4 sm:mb-6" />
                <h3 className="text-lg sm:text-xl font-semibold text-[#5E4E06] mb-2 sm:mb-3">
                  {searchTerm ? 'No Search Results' : 'No Leads Found'}
                </h3>
                <p className="text-sm sm:text-base text-[#8B7A1A] max-w-md mx-auto">
                  {searchTerm 
                    ? `No leads found matching "${searchTerm}". Try adjusting your search terms.`
                    : `No leads found with status "${selectedStatusFilter}". Try selecting a different status.`
                  }
                </p>
                <div className="flex items-center justify-center gap-3 mt-4">
                  <button
                    onClick={() => setSearchTerm('')}
                    className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#8B7A1A] transition-colors text-sm"
                  >
                    Clear Search
                  </button>
                  <button
                    onClick={() => setSelectedStatusFilter('All')}
                    className="px-4 py-2 bg-[#F5F2E8] text-[#8B7A1A] rounded-lg hover:bg-[#E6DCC0] transition-colors text-sm"
                  >
                    Show All Leads
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {currentLeads.map((lead) => (
                  <div key={lead.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 lg:p-6 bg-[#FFFBE6] rounded-lg sm:rounded-xl border border-[#D4AF37] hover:shadow-md transition-shadow duration-300 space-y-3 sm:space-y-0">
                    <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                        <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {/* Mobile: Stacked header, Desktop: Horizontal */}
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 mb-2 sm:mb-2">
                          {/* Mobile: Stacked name and badges, Desktop: Horizontal */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2">
                          <h3 className="font-semibold text-[#5E4E06] text-base sm:text-lg truncate">{lead.name}</h3>
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                              <span className="text-xs text-[#8B7A1A] bg-[#F5F2E8] px-2 py-1 rounded-full">
                                ID: {lead.id?.slice(-8) || 'N/A'}
                              </span>
                              <span className="text-xs text-[#8B7A1A] bg-[#F5F2E8] px-2 py-1 rounded-full">
                                {formatLeadAge(lead.createdAt)}
                                {/* Only trigger re-render for leads that need real-time updates */}
                                {(() => {
                                  const created = getDateFromAny(lead.createdAt);
                                  if (!created) return null;
                                  
                                  const now = new Date();
                                  const diffTime = Math.abs(now.getTime() - created.getTime());
                                  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
                                  
                                  // Only include ageUpdateTrigger for leads less than 1 hour old
                                  return diffHours < 1 ? <span className="hidden">{ageUpdateTrigger}</span> : null;
                                })()}
                              </span>
                              
                              {/* Live indicator for very recent leads */}
                              {(() => {
                                const created = getDateFromAny(lead.createdAt);
                                if (!created) return null;
                                
                                const now = new Date();
                                const diffTime = Math.abs(now.getTime() - created.getTime());
                                const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
                                
                                // Show live indicator for leads created within the last hour
                                if (diffHours < 1) {
                                  return (
                                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full border border-green-200 animate-pulse">
                                      Live
                                    </span>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium w-fit self-start sm:self-auto ${
                            lead.status === 'New Lead' ? 'bg-[#D4AF37] text-[#5E4E06]' :
                            lead.status === 'Contacted' ? 'bg-blue-500 text-white' :
                            lead.status === 'Qualified' ? 'bg-[#8B7A1A] text-white' :
                            lead.status === 'Proposal Sent' ? 'bg-purple-500 text-white' :
                            lead.status === 'Negotiation' ? 'bg-orange-500 text-white' :
                            lead.status === 'Closed Won' ? 'bg-green-500 text-white' :
                            lead.status === 'Closed Lost' ? 'bg-red-500 text-white' :
                            'bg-gray-500 text-white'
                          }`}>
                            {lead.status}
                          </span>
                        </div>
                        {/* Contact Info - Mobile: Stacked, Desktop: Grid */}
                        <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-3 sm:gap-4 text-xs sm:text-sm text-[#8B7A1A]">
                          <div>
                            <span className="font-medium">Phone:</span> 
                            <a 
                              href={`tel:${lead.phone}`}
                              className="inline-flex items-center px-2 py-0.5 bg-[#F5F2E8] text-[#8B7A1A] rounded-full text-xs ml-1 hover:bg-[#D4AF37] hover:text-white transition-colors cursor-pointer"
                              title="Click to call"
                            >
                              {lead.phone}
                            </a>
                          </div>
                          {lead.email && (
                            <div>
                              <span className="font-medium">Email:</span> 
                              <a 
                                href={`mailto:${lead.email}`}
                                className="inline-flex items-center px-2 py-0.5 bg-[#F5F2E8] text-[#8B7A1A] rounded-full text-xs ml-1 hover:bg-[#D4AF37] hover:text-white transition-colors cursor-pointer"
                                title="Click to email"
                              >
                                {lead.email}
                              </a>
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Interest:</span> 
                            <span className="inline-flex items-center px-2 py-0.5 bg-[#D4AF37] text-white rounded-full text-xs ml-1">
                              {lead.interest}
                            </span>
                          </div>
                        </div>
                        {/* Source and Dates - Mobile: Stacked, Desktop: Inline */}
                        <div className="mt-2 text-xs text-[#8B7A1A] space-y-1 sm:space-y-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <span className="font-medium">Source:</span> 
                            <span className="inline-flex items-center px-2 py-0.5 bg-[#F5F2E8] rounded-full text-[#8B7A1A] self-start sm:self-auto">
                              {lead.source}
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <span className="font-medium">Created:</span> 
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F5F2E8] rounded-full text-[#8B7A1A] self-start sm:self-auto">
                              <Calendar className="w-3 h-3" />
                              {(() => {
                                const created = getDateFromAny(lead.createdAt);
                                if (!created) return 'Unknown';
                                
                                // Format as dd/mm/yy for mobile-friendly display
                                const day = created.getDate().toString().padStart(2, '0');
                                const month = (created.getMonth() + 1).toString().padStart(2, '0');
                                const year = created.getFullYear().toString().slice(-2);
                                return `${day}/${month}/${year}`;
                              })()}
                            </span>
                          </div>
                          {lead.updatedAt && (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <span className="font-medium">Updated:</span> 
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F5F2E8] rounded-full text-[#8B7A1A] self-start sm:self-auto">
                                <Calendar className="w-3 h-3" />
                                {(() => {
                                  const updated = getDateFromAny(lead.updatedAt);
                                  if (!updated) return 'Unknown';
                                  
                                  // Format as dd/mm/yy for mobile-friendly display
                                  const day = updated.getDate().toString().padStart(2, '0');
                                  const month = (updated.getMonth() + 1).toString().padStart(2, '0');
                                  const year = updated.getFullYear().toString().slice(-2);
                                  return `${day}/${month}/${year}`;
                                })()}
                              </span>
                            </div>
                          )}
                        </div>
                        {lead.notes && (
                          <div className="mt-2 text-xs sm:text-sm text-[#8B7A1A] bg-white/50 p-2 sm:p-3 rounded-lg border-l-4 border-[#D4AF37] pl-3">
                            <span className="font-medium text-[#5E4E06]">Notes:</span> 
                            <p className="mt-1 text-[#8B7A1A] leading-relaxed">{lead.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Action Buttons - Mobile: Stacked, Desktop: Horizontal */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 sm:space-x-2 pt-2 sm:pt-0 border-t border-[#D4AF37]/20 sm:border-t-0">
                      {/* Last Activity Indicator */}
                      {(() => {
                        const created = getDateFromAny(lead.createdAt);
                        const updated = getDateFromAny(lead.updatedAt);
                        
                        if (!created || !updated) return null;
                        
                        // Show updated indicator if updated date is different from created date
                        // Allow for small time differences (within 1 minute) due to Firestore timing
                        const timeDiff = Math.abs(updated.getTime() - created.getTime());
                        const oneMinute = 60 * 1000;
                        
                        if (timeDiff > oneMinute) {
                          return (
                            <div className="text-xs text-[#8B7A1A] bg-[#F5F2E8] px-2 py-1 rounded-full border border-[#D4AF37] self-start sm:self-auto">
                              <span className="font-medium">Updated</span>
                            </div>
                          );
                        }
                        return null;
                      })()}
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 justify-center sm:justify-end">
                        <button 
                          onClick={() => handleEditLead(lead)}
                          disabled={isEditingLead}
                          className="p-2 sm:p-2 hover:bg-[#F5F2E8] rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[40px] sm:min-h-0" 
                          title="Edit"
                        >
                          {isEditingLead ? (
                            <div className="w-4 h-4 border-2 border-[#8B7A1A] border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                        <Edit className="w-4 h-4 text-[#8B7A1A]" />
                          )}
                      </button>
                        <button 
                          onClick={() => handleDeleteLead(lead.id!)}
                          disabled={isDeletingLead}
                          className="p-2 sm:p-2 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[40px] sm:min-h-0" 
                          title="Delete"
                        >
                          {isDeletingLead ? (
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                        <Trash2 className="w-4 h-4 text-red-500" />
                          )}
                      </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'quotes' && (
          <div className="space-y-4 sm:space-y-6">
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
            {quoteAnalytics && (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-[#D4AF37] p-4 shadow-sm">
                  <div className="text-2xl font-bold text-[#5E4E06]">{quoteAnalytics.total}</div>
                  <div className="text-sm text-[#8B7A1A]">Total Quotes</div>
                </div>
                <div className="bg-white rounded-xl border border-[#D4AF37] p-4 shadow-sm">
                  <div className="text-2xl font-bold text-green-600">{quoteAnalytics.byStatus.accepted}</div>
                  <div className="text-sm text-[#8B7A1A]">Accepted</div>
                </div>
                <div className="bg-white rounded-xl border border-[#D4AF37] p-4 shadow-sm">
                  <div className="text-2xl font-bold text-[#5E4E06]">₹{quoteAnalytics.totalValue.toLocaleString()}</div>
                  <div className="text-sm text-[#8B7A1A]">Total Value</div>
                </div>
                <div className="bg-white rounded-xl border border-[#D4AF37] p-4 shadow-sm">
                  <div className="text-2xl font-bold text-[#5E4E06]">₹{Math.round(quoteAnalytics.averageValue).toLocaleString()}</div>
                  <div className="text-sm text-[#8B7A1A]">Avg Value</div>
                </div>
                <div className="bg-white rounded-xl border border-[#D4AF37] p-4 shadow-sm">
                  <div className="text-2xl font-bold text-blue-600">{Math.round(quoteAnalytics.conversionRate)}%</div>
                  <div className="text-sm text-[#8B7A1A]">Conversion Rate</div>
                </div>
              </div>
            )}

            {/* Quotes Content */}
            <div className="bg-white rounded-xl border border-[#D4AF37] shadow-sm p-4 sm:p-6">
              {quotes.length === 0 ? (
                <div className="text-center py-16">
                  <FileText className="w-20 h-20 text-[#D4AF37] mx-auto mb-6 opacity-60" />
                  <h2 className="text-2xl font-bold text-[#5E4E06] mb-3">No Quotes Yet</h2>
                  <p className="text-[#8B7A1A] text-lg mb-4 text-center max-w-md">
                    Create your first professional quote to get started. 
                    Track versions, manage statuses, and generate PDFs.
                  </p>
                  <button 
                    onClick={() => setShowCreateQuoteModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-lg hover:scale-105 transition-all duration-200 cursor-pointer"
                  >
                    Create Your First Quote
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Quote Status Filter */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {['all', 'draft', 'sent', 'accepted', 'rejected', 'expired'].map((status) => (
                      <button
                        key={status}
                        className={`px-3 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                          status === 'all' 
                            ? 'bg-[#D4AF37] text-white' 
                            : 'bg-[#F5F2E8] text-[#8B7A1A] hover:bg-[#D4AF37] hover:text-white'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)} ({quotes.filter(q => status === 'all' || q.status === status).length})
                      </button>
                    ))}
                  </div>

                  {/* Quotes List */}
                  <div className="space-y-3">
                    {quotes
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
                              <span>v{quote.version}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handlePreviewPDF(quote)}
                              className="p-2 text-[#D4AF37] hover:bg-[#F5F2E8] rounded-lg transition-colors cursor-pointer"
                              title="Preview PDF"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDownloadPDF(quote)}
                              className="p-2 text-[#8B7A1A] hover:bg-[#F5F2E8] rounded-lg transition-colors cursor-pointer"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <div className="relative">
                              <button 
                                onClick={() => setSelectedQuoteForActions(quote)}
                                className="p-2 text-[#8B7A1A] hover:bg-[#F5F2E8] rounded-lg transition-colors cursor-pointer"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              
                              {selectedQuoteForActions?.id === (quote.id || '') && (
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-[#D4AF37] rounded-lg shadow-lg z-50 quote-actions-dropdown">
                                  <div className="py-1">
                                    <button
                                      onClick={() => {
                                        if (quote.id) updateQuoteStatus(quote.id, 'sent');
                                        setSelectedQuoteForActions(null);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-[#8B7A1A] hover:bg-[#F5F2E8] cursor-pointer"
                                    >
                                      Mark as Sent
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (quote.id) updateQuoteStatus(quote.id, 'accepted');
                                        setSelectedQuoteForActions(null);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-[#8B7A1A] hover:bg-[#F5F2E8] cursor-pointer"
                                    >
                                      Mark as Accepted
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (quote.id) updateQuoteStatus(quote.id, 'rejected');
                                        setSelectedQuoteForActions(null);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-[#8B7A1A] hover:bg-[#F5F2E8] cursor-pointer"
                                    >
                                      Mark as Rejected
                                    </button>
                                    <button
                                      onClick={() => {
                                        createQuoteVersion(quote);
                                        setSelectedQuoteForActions(null);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-[#8B7A1A] hover:bg-[#F5F2E8] cursor-pointer"
                                    >
                                      Create New Version
                                    </button>
                                    
                                    {/* PDF Options */}
                                    <div className="border-t border-[#F5F2E8] my-1"></div>
                                    
                                    <button
                                      onClick={() => handlePreviewPDF(quote)}
                                      className="w-full text-left px-4 py-2 text-sm text-[#8B7A1A] hover:bg-[#F5F2E8] cursor-pointer"
                                    >
                                      Preview PDF
                                    </button>
                                    
                                    <button
                                      onClick={() => handleDownloadPDF(quote)}
                                      className="w-full text-left px-4 py-2 text-sm text-[#8B7A1A] hover:bg-[#F5F2E8] cursor-pointer"
                                    >
                                      Download PDF
                                    </button>
                                    
                                    {/* Divider */}
                                    <div className="border-t border-[#F5F2E8] my-1"></div>
                                    
                                    {/* Delete Options */}
                                    <button
                                      onClick={() => {
                                        deleteQuote(quote);
                                        setSelectedQuoteForActions(null);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                                    >
                                      Delete This Quote
                                    </button>
                                    
                                    {(quote.parentQuoteId || quote.previousVersionId || 
                                      quotes.some(q => q.parentQuoteId === quote.id || q.previousVersionId === quote.id)) && (
                                      <button
                                        onClick={() => {
                                          deleteQuoteWithVersions(quote);
                                          setSelectedQuoteForActions(null);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                                      >
                                        Delete All Versions
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl border border-[#D4AF37] p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#D4AF37] rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#5E4E06]">Customers</h2>
                    <p className="text-[#8B7A1A] text-xs sm:text-sm">{filteredCustomers.length} total customers</p>
          </div>
                </div>
              </div>
              
              {/* Search and Filters */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B7A1A]" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 border border-[#D4AF37] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] placeholder-[#8B7A1A]"
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
            </div>
                <div className="flex gap-2">
                  <select
                    className="flex-1 px-3 py-3 border border-[#D4AF37] rounded-lg text-[#5E4E06] bg-white focus:outline-none"
                    value={filterType}
                    onChange={e => setFilterType(e.target.value as any)}
                  >
                    <option value="all">All Time</option>
                    <option value="thisMonth">This Month</option>
                    <option value="last30">Last 30 Days</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>
                {filterType === 'custom' && (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      className="px-3 py-3 border border-[#D4AF37] rounded-lg text-[#5E4E06] bg-white focus:outline-none text-sm"
                      value={customStartDate}
                      onChange={e => setCustomStartDate(e.target.value)}
                      max={customEndDate || undefined}
                    />
                    <input
                      type="date"
                      className="px-3 py-3 border border-[#D4AF37] rounded-lg text-[#5E4E06] bg-white focus:outline-none text-sm"
                      value={customEndDate}
                      onChange={e => setCustomEndDate(e.target.value)}
                      min={customStartDate || undefined}
                    />
          </div>
        )}
              </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl border border-[#D4AF37] shadow-sm">
              {isCustomersLoading ? (
                <div className="flex justify-center items-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
                </div>
              ) : customersError ? (
                <div className="text-red-600 text-center py-8 px-6">{customersError}</div>
              ) : filteredCustomers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6">
                  <Users className="w-20 h-20 text-[#D4AF37] mb-6 opacity-60" />
                  <h2 className="text-2xl font-bold text-[#5E4E06] mb-3">No Customers Yet</h2>
                  <p className="text-[#8B7A1A] text-lg mb-2 text-center max-w-md">You haven&apos;t added any customers yet. When someone signs up or places an order, they&apos;ll appear here!</p>
                  <div className="text-[#8B7A1A] text-sm text-center">Try adjusting your search or filters if you&apos;re expecting to see someone.</div>
                </div>
              ) : (
                <>
                  {/* Mobile View */}
                  <div className="md:hidden divide-y divide-[#F5F2E8]">
                    {filteredCustomers.map((customer) => (
                      <div
                        key={customer.uid}
                        className="flex items-center gap-3 p-3 sm:p-4 hover:bg-[#F5F2E8] transition-colors cursor-pointer"
                        onClick={() => { setSelectedCustomer(customer); setDrawerOpen(true); }}
                      >
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#D4AF37] flex items-center justify-center text-white font-semibold text-sm sm:text-base flex-shrink-0">
                          {((customer.firstName || '')[0] || '').toUpperCase()}
                          {((customer.lastName || '')[0] || '').toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-[#5E4E06] text-sm sm:text-base truncate">
                            {customer.firstName || ''} {customer.lastName || ''}
                          </div>
                          <div className="text-[#8B7A1A] text-xs sm:text-sm truncate">{customer.email}</div>
                          {customer.phone && (
                            <div className="text-[#8B7A1A] text-xs sm:text-sm">{customer.phone}</div>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-[#8B7A1A] text-xs mb-1">{formatDate(customer.createdAt)}</div>
                          <EyeIcon className="w-4 h-4 text-[#D4AF37]" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop View */}
                  <div className="hidden md:block">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-[#F5F2E8] border-b border-[#E6DCC0]">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-[#8B7A1A] uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-[#8B7A1A] uppercase tracking-wider hidden sm:table-cell">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-[#8B7A1A] uppercase tracking-wider hidden md:table-cell">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-[#8B7A1A] uppercase tracking-wider hidden lg:table-cell">City</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-[#8B7A1A] uppercase tracking-wider hidden lg:table-cell">State</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-[#8B7A1A] uppercase tracking-wider hidden xl:table-cell">Message</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-[#8B7A1A] uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-[#8B7A1A] uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F5F2E8]">
                          {filteredCustomers.map((customer) => (
                            <tr 
                              key={customer.uid} 
                              className="hover:bg-[#F5F2E8] transition-colors cursor-pointer"
                              onClick={() => { setSelectedCustomer(customer); setDrawerOpen(true); }}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center text-white font-semibold text-sm">
                                    {((customer.firstName || '')[0] || '').toUpperCase()}
                                    {((customer.lastName || '')[0] || '').toUpperCase()}
            </div>
                                  <div>
                                    <div className="font-semibold text-[#5E4E06]">
                                      {customer.firstName || ''} {customer.lastName || ''}
          </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-[#5E4E06] hidden sm:table-cell">{customer.email}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-[#5E4E06] hidden md:table-cell">{customer.phone || '-'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-[#5E4E06] text-sm hidden lg:table-cell">{customer.address?.city || '-'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-[#5E4E06] text-sm hidden lg:table-cell">{customer.address?.state || '-'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-[#5E4E06] text-sm hidden xl:table-cell">{customer.role}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-[#5E4E06] text-sm">{formatDate(customer.createdAt)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <button 
                                  className="p-2 hover:bg-[#D4AF37] hover:text-white rounded-lg transition-colors" 
                                  title="View Details"
                                >
                                  <EyeIcon className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Customer Details Drawer */}
            <CustomerDetailsDrawer
              open={drawerOpen}
              onOpenChange={setDrawerOpen}
              customer={selectedCustomer}
              onSave={handleSaveCustomer}
              onDelete={handleDeleteCustomer}
            />
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="space-y-6">
            {/* Sales Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-[#D4AF37] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">+15.3%</span>
                </div>
                <h3 className="text-sm font-medium text-[#8B7A1A] mb-2">Total Revenue</h3>
                <p className="text-2xl font-bold text-[#5E4E06]">{formatCurrencyShort(totalRevenue)}</p>
                <p className="text-xs text-[#8B7A1A] mt-1">This month</p>
              </div>
              
              <div className="bg-white rounded-xl border border-[#D4AF37] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#8B7A1A] to-[#5E4E06] rounded-xl flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">12</span>
                </div>
                <h3 className="text-sm font-medium text-[#8B7A1A] mb-2">Active Orders</h3>
                <p className="text-2xl font-bold text-[#5E4E06]">{activeOrders.length}</p>
                <p className="text-xs text-[#8B7A1A] mt-1">{formatCurrencyShort(activeOrdersValue)} value</p>
              </div>
              
              <div className="bg-white rounded-xl border border-[#D4AF37] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">+12.8%</span>
                </div>
                <h3 className="text-sm font-medium text-[#8B7A1A] mb-2">Completed Sales</h3>
                <p className="text-2xl font-bold text-[#5E4E06]">{completedOrders.length}</p>
                <p className="text-xs text-[#8B7A1A] mt-1">{formatCurrencyShort(completedOrdersValue)} value</p>
              </div>
              
              <div className="bg-white rounded-xl border border-[#D4AF37] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#8B7A1A] to-[#5E4E06] rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">8</span>
                </div>
                <h3 className="text-sm font-medium text-[#8B7A1A] mb-2">Orders Today</h3>
                <p className="text-2xl font-bold text-[#5E4E06]">{todayOrders.length}</p>
                <p className="text-xs text-[#8B7A1A] mt-1">{formatCurrencyShort(todayOrdersValue)} value</p>
              </div>
            </div>

            {/* Order Status Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Orders */}
              <div className="bg-white rounded-xl border border-[#D4AF37] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-[#5E4E06]">Active Orders</h2>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{activeOrders.length} Orders</span>
                </div>
                <div className="space-y-4">
                  {activeOrders.length > 0 ? (
                    getPaginatedOrders(activeOrders, activeOrdersPage, salesPageSize).map((order, index) => {
                      const daysAgo = Math.floor((Date.now() - new Date(order.orderDate).getTime()) / (1000 * 60 * 60 * 24));
                      
                      return (
                        <div key={order.id || index} className="bg-[#FFFBE6] rounded-lg p-4 border border-[#E6DCC0]">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-[#5E4E06]">Order #{order.orderId}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                              {order.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-[#8B7A1A] mb-1">{order.customerName}</p>
                          <p className="text-sm text-[#8B7A1A] mb-2">
                            {order.items.length} item{order.items.length > 1 ? 's' : ''} • {order.items[0]?.productName || 'Product'}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[#5E4E06]">{formatCurrency(order.finalAmount)}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#8B7A1A]">
                                Ordered {daysAgo === 0 ? 'today' : `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`}
                              </span>
                              <button
                                onClick={() => openStatusUpdateModal(order)}
                                className="px-2 py-1 bg-[#D4AF37] text-white text-xs rounded hover:bg-[#8B7A1A] transition-colors"
                              >
                                Update
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-[#8B7A1A] mx-auto mb-3 opacity-50" />
                      <p className="text-[#8B7A1A] text-sm">No active orders</p>
                    </div>
                  )}
                </div>
                
                {/* Active Orders Pagination */}
                {activeOrders.length > salesPageSize && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-[#8B7A1A]">
                        Page {activeOrdersPage} of {getTotalPages(activeOrders.length, salesPageSize)} • {activeOrders.length} orders
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 rounded-lg text-[#8B7A1A] bg-[#F5F2E8] hover:bg-[#D4AF37] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => setActiveOrdersPage(prev => Math.max(1, prev - 1))}
                          disabled={activeOrdersPage === 1}
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 rounded-lg text-[#8B7A1A] bg-[#F5F2E8] hover:bg-[#D4AF37] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => setActiveOrdersPage(prev => Math.min(getTotalPages(activeOrders.length, salesPageSize), prev + 1))}
                          disabled={activeOrdersPage >= getTotalPages(activeOrders.length, salesPageSize)}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Completed Sales */}
              <div className="bg-white rounded-xl border border-[#D4AF37] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-[#5E4E06]">Completed Sales</h2>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">{completedOrders.length} Orders</span>
                </div>
                <div className="space-y-4">
                  {completedOrders.length > 0 ? (
                    getPaginatedOrders(completedOrders, completedOrdersPage, salesPageSize).map((order, index) => {
                      const daysAgo = order.actualDelivery 
                        ? Math.floor((Date.now() - new Date(order.actualDelivery).getTime()) / (1000 * 60 * 60 * 24))
                        : Math.floor((Date.now() - new Date(order.orderDate).getTime()) / (1000 * 60 * 60 * 24));
                      
                      return (
                        <div key={order.id || index} className="bg-[#FFFBE6] rounded-lg p-4 border border-[#E6DCC0]">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-[#5E4E06]">Order #{order.orderId}</h3>
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Delivered</span>
                          </div>
                          <p className="text-sm text-[#8B7A1A] mb-1">{order.customerName}</p>
                          <p className="text-sm text-[#8B7A1A] mb-2">
                            {order.items.length} item{order.items.length > 1 ? 's' : ''} • {order.items[0]?.productName || 'Product'}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[#5E4E06]">{formatCurrency(order.finalAmount)}</span>
                            <span className="text-xs text-[#8B7A1A]">
                              Delivered {daysAgo === 0 ? 'today' : `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-[#8B7A1A] mx-auto mb-3 opacity-50" />
                      <p className="text-[#8B7A1A] text-sm">No completed sales</p>
                    </div>
                  )}
                </div>
                
                {/* Completed Sales Pagination */}
                {completedOrders.length > salesPageSize && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-[#8B7A1A]">
                        Page {completedOrdersPage} of {getTotalPages(completedOrders.length, salesPageSize)} • {completedOrders.length} orders
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 rounded-lg text-[#8B7A1A] bg-[#F5F2E8] hover:bg-[#D4AF37] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => setCompletedOrdersPage(prev => Math.max(1, prev - 1))}
                          disabled={completedOrdersPage === 1}
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 rounded-lg text-[#8B7A1A] bg-[#F5F2E8] hover:bg-[#D4AF37] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => setCompletedOrdersPage(prev => Math.min(getTotalPages(completedOrders.length, salesPageSize), prev + 1))}
                          disabled={completedOrdersPage >= getTotalPages(completedOrders.length, salesPageSize)}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Sales Table */}
            <div className="bg-white rounded-xl border border-[#D4AF37] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#5E4E06]">Recent Sales</h2>
                                  {orders.length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-[#8B7A1A] mx-auto mb-3 opacity-50" />
                      <p className="text-[#8B7A1A] text-sm">No sales/orders found</p>
                    </div>
                  )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E6DCC0]">
                      <th className="text-left py-3 px-4 font-semibold text-[#5E4E06]">Order ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#5E4E06]">Customer</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#5E4E06]">Product</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#5E4E06]">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#5E4E06]">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#5E4E06]">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#5E4E06]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length > 0 ? (
                      getPaginatedOrders(orders, recentSalesPage, recentSalesPageSize).map((order, index) => {
                        const daysAgo = Math.floor((Date.now() - new Date(order.orderDate).getTime()) / (1000 * 60 * 60 * 24));
                        
                        return (
                          <tr key={order.id || index} className="border-b border-[#F5F2E8] hover:bg-[#FFFBE6]">
                            <td className="py-3 px-4 font-medium text-[#5E4E06]">#{order.orderId}</td>
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium text-[#5E4E06]">{order.customerName}</p>
                                <p className="text-sm text-[#8B7A1A]">{order.customerEmail}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-[#5E4E06]">
                              {order.items.length} item{order.items.length > 1 ? 's' : ''} • {order.items[0]?.productName || 'Product'}
                            </td>
                            <td className="py-3 px-4 font-semibold text-[#5E4E06]">{formatCurrency(order.finalAmount)}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                                {order.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-[#8B7A1A]">
                              {daysAgo === 0 ? 'Today' : `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <button className="text-[#D4AF37] hover:text-[#8B7A1A] transition-colors">
                                  <EyeIcon className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => openStatusUpdateModal(order)}
                                  className="text-[#8B7A1A] hover:text-[#5E4E06] transition-colors text-xs font-medium"
                                >
                                  Update
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center">
                          <Package className="w-12 h-12 text-[#8B7A1A] mx-auto mb-3 opacity-50" />
                          <p className="text-[#8B7A1A] text-sm">No orders found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Recent Sales Pagination */}
              {orders.length > recentSalesPageSize && (
                <div className="border-t border-[#F5F2E8] px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-[#8B7A1A]">
                      Page {recentSalesPage} of {getTotalPages(orders.length, recentSalesPageSize)} • {orders.length} orders
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 rounded-lg text-[#8B7A1A] bg-[#F5F2E8] hover:bg-[#D4AF37] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => setRecentSalesPage(prev => Math.max(1, prev - 1))}
                        disabled={recentSalesPage === 1}
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 rounded-lg text-[#8B7A1A] bg-[#F5F2E8] hover:bg-[#D4AF37] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => setRecentSalesPage(prev => Math.min(getTotalPages(orders.length, recentSalesPageSize), prev + 1))}
                        disabled={recentSalesPage >= getTotalPages(orders.length, recentSalesPageSize)}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

          {activeTab === 'messages' && <MockChatCRM />}

        {activeTab === 'tasks' && (
          <div className="space-y-6">
            {/* Enhanced Task Stats with Analytics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Total</p>
                    <p className="text-2xl font-bold text-blue-900">{getTaskStats().total}</p>
                    <p className="text-xs text-blue-600">Tasks</p>
                  </div>
                  <div className="p-2 bg-blue-200 rounded-xl">
                    <Calendar className="w-6 h-6 text-blue-700" />
                </div>
              </div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-4 border border-yellow-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-yellow-700 uppercase tracking-wide">Pending</p>
                    <p className="text-2xl font-bold text-yellow-900">{getTaskStats().pending}</p>
                    <p className="text-xs text-yellow-600">To Do</p>
                  </div>
                  <div className="p-2 bg-yellow-200 rounded-xl">
                    <Clock className="w-6 h-6 text-yellow-700" />
                </div>
              </div>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-4 border border-indigo-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-indigo-700 uppercase tracking-wide">In Progress</p>
                    <p className="text-2xl font-bold text-indigo-900">{getTaskStats().inProgress}</p>
                    <p className="text-xs text-indigo-600">Active</p>
                  </div>
                  <div className="p-2 bg-indigo-200 rounded-xl">
                    <Activity className="w-6 h-6 text-indigo-700" />
                </div>
              </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Completed</p>
                    <p className="text-2xl font-bold text-green-900">{getTaskStats().completed}</p>
                    <p className="text-xs text-green-600">Done</p>
                  </div>
                  <div className="p-2 bg-green-200 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-green-700" />
                </div>
              </div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-4 border border-red-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-red-700 uppercase tracking-wide">Overdue</p>
                    <p className="text-2xl font-bold text-red-900">{getTaskStats().overdue}</p>
                    <p className="text-xs text-red-600">Late</p>
                  </div>
                  <div className="p-2 bg-red-200 rounded-xl">
                    <AlertCircle className="w-6 h-6 text-red-700" />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-purple-700 uppercase tracking-wide">Completion</p>
                    <p className="text-2xl font-bold text-purple-900">{getTaskAnalytics().completionRate}%</p>
                    <p className="text-xs text-purple-600">Rate</p>
                  </div>
                  <div className="p-2 bg-purple-200 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-purple-700" />
                  </div>
                </div>
              </div>
            </div>

            {/* Task Controls with View Toggle */}
            <div className="bg-white rounded-2xl border border-[#D4AF37] p-6 shadow-lg">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#5E4E06] mb-2">Task Management</h2>
                  <p className="text-[#8B7A1A]">Organize, track, and complete your business tasks efficiently</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowTaskAnalytics(true)}
                    className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all duration-200 text-sm font-medium flex items-center gap-2 shadow-sm"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Analytics
                  </button>

                  <button
                    onClick={() => setShowAddTaskModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-xl hover:scale-105 transition-all duration-200 text-sm font-medium flex items-center gap-2 shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    Add Task
                  </button>
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex justify-center mb-6">
                <div className="bg-gray-100 rounded-xl p-1 flex">
                  <button
                    onClick={() => setTaskView('kanban')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      taskView === 'kanban' 
                        ? 'bg-white text-[#5E4E06] shadow-sm' 
                        : 'text-gray-600 hover:text-[#5E4E06]'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    Kanban
                  </button>
                  <button
                    onClick={() => setTaskView('list')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      taskView === 'list' 
                        ? 'bg-white text-[#5E4E06] shadow-sm' 
                        : 'text-gray-600 hover:text-[#5E4E06]'
                    }`}
                  >
                    <List className="w-4 h-4" />
                    List
                  </button>
                  <button
                    onClick={() => setTaskView('calendar')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      taskView === 'calendar' 
                        ? 'bg-white text-[#5E4E06] shadow-sm' 
                        : 'text-gray-600 hover:text-[#5E4E06]'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    Calendar
                  </button>
                </div>
              </div>

              {/* Enhanced Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[#5E4E06] mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#8B7A1A]" />
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      value={taskSearchQuery}
                      onChange={(e) => setTaskSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5E4E06] mb-2">Status</label>
                  <select
                    value={taskFilter}
                    onChange={(e) => setTaskFilter(e.target.value as any)}
                    className="w-full px-4 py-2 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5E4E06] mb-2">Priority</label>
                  <select
                    value={taskPriorityFilter}
                    onChange={(e) => setTaskPriorityFilter(e.target.value as any)}
                    className="w-full px-4 py-2 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
                  >
                    <option value="all">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5E4E06] mb-2">Category</label>
                  <select
                    value={taskCategoryFilter}
                    onChange={(e) => setTaskCategoryFilter(e.target.value as any)}
                    className="w-full px-4 py-2 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
                  >
                    <option value="all">All Categories</option>
                    <option value="follow_up">Follow Up</option>
                    <option value="meeting">Meeting</option>
                    <option value="delivery">Delivery</option>
                    <option value="marketing">Marketing</option>
                    <option value="support">Support</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5E4E06] mb-2">Date Range</label>
                  <select
                    value={taskDateFilter}
                    onChange={(e) => setTaskDateFilter(e.target.value as any)}
                    className="w-full px-4 py-2 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Today</option>
                    <option value="tomorrow">Tomorrow</option>
                    <option value="this_week">This Week</option>
                    <option value="next_week">Next Week</option>
                    <option value="overdue">Overdue</option>
                  </select>
              </div>
                <div>
                  <label className="block text-sm font-medium text-[#5E4E06] mb-2">Sort By</label>
                  <select
                    value={taskSortBy}
                    onChange={(e) => setTaskSortBy(e.target.value as any)}
                    className="w-full px-4 py-2 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
                  >
                    <option value="dueDate">Due Date</option>
                    <option value="priority">Priority</option>
                    <option value="createdAt">Created Date</option>
                    <option value="title">Title</option>
                    <option value="category">Category</option>
                  </select>
                </div>
              </div>

              {/* Task Count and Sort Order */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="text-sm text-[#8B7A1A] bg-[#F5F2E8] px-3 py-2 rounded-lg">
                  <span className="font-medium">{getFilteredAndSortedTasks().length}</span> tasks found
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTaskSortOrder(taskSortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2 hover:bg-[#F5F2E8] rounded-lg transition-colors"
                    title={`Sort ${taskSortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                  >
                    {taskSortOrder === 'asc' ? <SortAsc className="w-4 h-4 text-[#8B7A1A]" /> : <SortDesc className="w-4 h-4 text-[#8B7A1A]" />}
                  </button>
                </div>
                </div>

              {/* Task Views */}
              {taskView === 'kanban' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {getKanbanColumns().map((column) => (
                    <div key={column.id} className="space-y-4">
                      <div className={`${column.color} rounded-xl p-4 border`}>
                        <h3 className="font-semibold text-gray-800 mb-2">{column.title}</h3>
                        <p className="text-sm text-gray-600">{column.tasks.length} tasks</p>
              </div>
                      <div className="space-y-3">
                        {column.tasks.map((task) => (
                          <TaskCard key={task.id} task={task} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {taskView === 'list' && (
              <div className="space-y-4">
                {getFilteredAndSortedTasks().length === 0 ? (
                    <EmptyTaskState />
                ) : (
                  getFilteredAndSortedTasks().map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))
                            )}
                          </div>
              )}

              {taskView === 'calendar' && (
                <div className="bg-white rounded-xl border border-[#D4AF37] p-6">
                  <CalendarView 
                    tasks={getFilteredAndSortedTasks()}
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                    onTaskClick={(task) => {
                      setSelectedTask(task);
                      openEditTaskModal(task);
                    }}
                  />
                            </div>
              )}
                            </div>
                              </div>
                            )}

        {/* Form Submissions Tab Content */}
        {activeTab === 'formSubmissions' && (
          <div className="bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-3xl shadow-2xl p-0 sm:p-2 md:p-6 max-w-7xl xl:max-w-full mx-auto mt-4 relative min-h-screen overflow-hidden">
            <div className="flex justify-center gap-4 mb-8 mt-4">
              <button
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 shadow-sm border text-base sm:text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E6C866] ${activeFormTab === 'franchise' ? 'bg-[#E6C866] text-[#5E4E06] border-[#E6C866] scale-105' : 'bg-white text-gray-500 border-gray-200 hover:bg-[#F5F2E8] hover:text-[#5E4E06]'}`}
                onClick={() => setActiveFormTab('franchise')}
              >
                Franchise Applications
              </button>
              <button
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 shadow-sm border text-base sm:text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E6C866] ${activeFormTab === 'contact' ? 'bg-[#E6C866] text-[#5E4E06] border-[#E6C866] scale-105' : 'bg-white text-gray-500 border-gray-200 hover:bg-[#F5F2E8] hover:text-[#5E4E06]'}`}
                onClick={() => setActiveFormTab('contact')}
              >
                Contact Us Submissions
              </button>
            </div>
            {activeFormTab === 'franchise' && (
              <>
                <h2 className="text-2xl font-extrabold mb-6 text-[#5E4E06] text-center tracking-tight">Franchise Form Submissions</h2>
                {isLoadingSubmissions ? (
                  <div>Loading...</div>
                ) : submissionsError ? (
                  <div className="text-red-600">{submissionsError}</div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl shadow-lg bg-white">
                    <table className="min-w-full text-sm sm:text-base">
                      <thead className="sticky top-0 z-10 bg-[#F5F2E8] border-b border-[#E6C866]">
                        <tr>
                          <th className="px-4 py-3 font-bold text-[#5E4E06] text-left">Name</th>
                          <th className="px-4 py-3 font-bold text-[#5E4E06] text-left hidden sm:table-cell">Email</th>
                          <th className="px-4 py-3 font-bold text-[#5E4E06] text-left hidden md:table-cell">Phone</th>
                          <th className="px-4 py-3 font-bold text-[#5E4E06] text-left hidden lg:table-cell">City</th>
                          <th className="px-4 py-3 font-bold text-[#5E4E06] text-left hidden lg:table-cell">State</th>
                          <th className="px-4 py-3 font-bold text-[#5E4E06] text-left hidden xl:table-cell">Message</th>
                          <th className="px-4 py-3 font-bold text-[#5E4E06] text-left">Date</th>
                          <th className="px-4 py-3 font-bold text-[#5E4E06] text-left">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {franchiseSubmissions.length === 0 ? (
                          <tr><td colSpan={8} className="text-center py-8 text-gray-400">No submissions found.</td></tr>
                        ) : franchiseSubmissions.map((sub, idx) => (
                          <tr key={sub.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#F8F6F0] hover:bg-[#F5F2E8]'}>
                            <td className="px-4 py-3 font-medium">{sub.name}</td>
                            <td className="px-4 py-3 hidden sm:table-cell">{sub.email}</td>
                            <td className="px-4 py-3 hidden md:table-cell">{sub.phone}</td>
                            <td className="px-4 py-3 hidden lg:table-cell">{sub.city}</td>
                            <td className="px-4 py-3 hidden lg:table-cell">{sub.state}</td>
                            <td className="px-4 py-3 max-w-xs truncate hidden xl:table-cell" title={sub.message}>{sub.message}</td>
                            <td className="px-4 py-3">{sub.createdAt && (sub.createdAt.seconds ? formatShortDateTime(new Date(sub.createdAt.seconds * 1000)) : formatShortDateTime(new Date(sub.createdAt)))}</td>
                            <td className="px-4 py-3">
                              <button
                                className="px-3 py-1 rounded-full bg-[#E6C866] text-[#5E4E06] font-semibold shadow hover:bg-[#F5F2E8] transition text-xs sm:text-sm cursor-pointer"
                                onClick={() => { setModalData({ ...sub, type: 'franchise' }); setModalOpen(true); }}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                            </div>
                          )}
              </>
            )}
            {activeFormTab === 'contact' && (
              <>
                <h2 className="text-2xl font-extrabold mb-6 text-[#5E4E06] text-center tracking-tight">Contact Form Submissions</h2>
                {isLoadingContact ? (
                  <div>Loading...</div>
                ) : contactError ? (
                  <div className="text-red-600">{contactError}</div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl shadow-lg bg-white">
                    <table className="min-w-full text-sm sm:text-base">
                      <thead className="sticky top-0 z-10 bg-[#F5F2E8] border-b border-[#E6C866]">
                        <tr>
                          <th className="px-4 py-3 font-bold text-[#5E4E06] text-left">Name</th>
                          <th className="px-4 py-3 font-bold text-[#5E4E06] text-left hidden sm:table-cell">Email</th>
                          <th className="px-4 py-3 font-bold text-[#5E4E06] text-left hidden md:table-cell">Phone</th>
                          <th className="px-4 py-3 font-bold text-[#5E4E06] text-left hidden lg:table-cell">Subject</th>
                          <th className="px-4 py-3 font-bold text-[#5E4E06] text-left hidden xl:table-cell">Message</th>
                          <th className="px-4 py-3 font-bold text-[#5E4E06] text-left">Date</th>
                          <th className="px-4 py-3 font-bold text-[#5E4E06] text-left">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contactSubmissions.length === 0 ? (
                          <tr><td colSpan={7} className="text-center py-8 text-gray-400">No submissions found.</td></tr>
                        ) : contactSubmissions.map((sub, idx) => (
                          <tr key={sub.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#F8F6F0] hover:bg-[#F5F2E8]'}>
                            <td className="px-4 py-3 font-medium">{sub.name}</td>
                            <td className="px-4 py-3 hidden sm:table-cell">{sub.email}</td>
                            <td className="px-4 py-3 hidden md:table-cell">{sub.phone}</td>
                            <td className="px-4 py-3 hidden lg:table-cell">{sub.subject}</td>
                            <td className="px-4 py-3 max-w-xs truncate hidden xl:table-cell" title={sub.message}>{sub.message}</td>
                            <td className="px-4 py-3">{sub.createdAt && (sub.createdAt.seconds ? formatShortDateTime(new Date(sub.createdAt.seconds * 1000)) : formatShortDateTime(new Date(sub.createdAt)))}</td>
                            <td className="px-4 py-3">
                            <button
                                className="px-3 py-1 rounded-full bg-[#E6C866] text-[#5E4E06] font-semibold shadow hover:bg-[#F5F2E8] transition text-xs sm:text-sm cursor-pointer"
                                onClick={() => { setModalData({ ...sub, type: 'contact' }); setModalOpen(true); }}
                            >
                                View
                            </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
            {/* Modal for full message */}
            {modalOpen && modalData && (
              <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/40 pt-20 sm:pt-0">
                <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative animate-fade-in-up max-h-[calc(100vh-5rem)] sm:max-h-none overflow-y-auto">
                          <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-[#5E4E06] text-2xl font-bold cursor-pointer"
                    onClick={() => setModalOpen(false)}
                    aria-label="Close"
                  >
                    &times;
                          </button>
                  <h3 className="text-xl font-bold mb-4 text-[#5E4E06]">{modalData.type === 'franchise' ? 'Franchise Application' : 'Contact Us Submission'}</h3>
                  <div className="space-y-2 text-[#2A2418]">
                    <div><span className="font-semibold">Name:</span> {modalData.name}</div>
                    <div><span className="font-semibold">Email:</span> {modalData.email}</div>
                    <div><span className="font-semibold">Phone:</span> {modalData.phone}</div>
                    {modalData.type === 'franchise' && <>
                      <div><span className="font-semibold">City:</span> {modalData.city}</div>
                      <div><span className="font-semibold">State:</span> {modalData.state}</div>
                    </>}
                    {modalData.type === 'contact' && <>
                      <div><span className="font-semibold">Subject:</span> {modalData.subject}</div>
                    </>}
                    <div><span className="font-semibold">Date:</span> {modalData.createdAt && (modalData.createdAt.seconds ? formatShortDateTime(new Date(modalData.createdAt.seconds * 1000)) : formatShortDateTime(new Date(modalData.createdAt)))}</div>
                    <div className="pt-4">
                      <span className="font-semibold">Message:</span>
                      <div className="mt-2 p-3 bg-[#F8F6F0] rounded-lg text-[#5E4E06] whitespace-pre-line break-words max-h-72 overflow-y-auto border border-[#E6C866]">
                        {modalData.message}
                        </div>
                      </div>
                    </div>
              </div>
            </div>
            )}
          </div>
        )}
        </main>
        
        {/* Order Status Update Modal */}
        {showStatusUpdateModal && selectedOrderForStatus && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-4 pt-20 sm:pt-4">
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-[#D4AF37] max-w-md w-full max-h-[calc(100vh-5rem)] sm:max-h-none overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-[#5E4E06]">Update Order Status</h2>
                  <button 
                    onClick={() => setShowStatusUpdateModal(false)}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-[#8B7A1A] mb-2">Order ID</p>
                    <p className="font-semibold text-[#5E4E06]">#{selectedOrderForStatus.orderId}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-[#8B7A1A] mb-2">Customer</p>
                    <p className="font-semibold text-[#5E4E06]">{selectedOrderForStatus.customerName}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-[#8B7A1A] mb-2">Current Status</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[selectedOrderForStatus.status] || 'bg-gray-100 text-gray-800'}`}>
                      {selectedOrderForStatus.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-[#5E4E06] mb-2">New Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as Order['status'])}
                      className="w-full px-4 py-2 border border-[#D4AF37] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-[#5E4E06]"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-[#5E4E06] mb-2">Notes (Optional)</label>
                    <textarea
                      value={statusUpdateNotes}
                      onChange={(e) => setStatusUpdateNotes(e.target.value)}
                      placeholder="Add any notes about this status update..."
                      className="w-full px-4 py-2 border border-[#D4AF37] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-[#5E4E06] resize-none"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowStatusUpdateModal(false)}
                    className="flex-1 px-4 py-2 border border-[#D4AF37] text-[#5E4E06] rounded-lg hover:bg-[#F5F2E8] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateOrderStatus}
                    disabled={isUpdatingStatus}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-lg hover:scale-105 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdatingStatus ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
      {/* Add Lead Modal */}
      {showAddLeadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 pt-20 sm:pt-4">
          <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[calc(100vh-5rem)] sm:max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8 border-b border-[#D4AF37]">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#5E4E06]">Add New Lead</h3>
                  <p className="text-xs sm:text-sm text-[#8B7A1A]">Enter lead information</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddLeadModal(false)}
                className="p-2 sm:p-3 hover:bg-[#F5F2E8] rounded-lg sm:rounded-xl transition-colors duration-200"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#8B7A1A]" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitLead} className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
              {/* Personal Information */}
              <div>
                <h4 className="text-lg sm:text-xl font-semibold text-[#5E4E06] mb-4 sm:mb-6 flex items-center">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-[#D4AF37]" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#5E4E06] mb-2 sm:mb-3">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={leadForm.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] placeholder-[#8B7A1A] text-sm sm:text-base"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#5E4E06] mb-2 sm:mb-3">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={leadForm.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] placeholder-[#8B7A1A] text-sm sm:text-base"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#5E4E06] mb-2 sm:mb-3">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={leadForm.email}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] placeholder-[#8B7A1A] text-sm sm:text-base"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
              </div>

              {/* Lead Details */}
              <div>
                  <h4 className="text-xl font-semibold text-[#5E4E06] mb-6 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-3 text-[#D4AF37]" />
                  Lead Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label className="block text-sm font-semibold text-[#5E4E06] mb-3">Lead Source *</label>
                    <select
                      name="source"
                      value={leadForm.source}
                      onChange={handleInputChange}
                      required
                        className="w-full px-4 py-3 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06]"
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
                  <div>
                      <label className="block text-sm font-semibold text-[#5E4E06] mb-3">Status *</label>
                    <select
                      name="status"
                      value={leadForm.status}
                      onChange={handleInputChange}
                      required
                        className="w-full px-4 py-3 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06]"
                      >
                        <option value="New Lead" className="text-[#5E4E06]">New Lead</option>
                        <option value="Contacted" className="text-[#5E4E06]">Contacted</option>
                        <option value="Qualified" className="text-[#5E4E06]">Qualified</option>
                        <option value="Proposal Sent" className="text-[#5E4E06]">Proposal Sent</option>
                        <option value="Negotiation" className="text-[#5E4E06]">Negotiation</option>
                        <option value="Closed Won" className="text-[#5E4E06]">Closed Won</option>
                        <option value="Closed Lost" className="text-[#5E4E06]">Closed Lost</option>
                    </select>
                  </div>
                </div>

                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-[#5E4E06] mb-3">Product Interest *</label>
                  <select
                    name="interest"
                    value={leadForm.interest}
                    onChange={handleInputChange}
                    required
                      className="w-full px-4 py-3 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06]"
                    >
                      <option value="" className="text-[#8B7A1A]">Select product</option>
                      <option value="Aura Wall Putty" className="text-[#5E4E06]">Aura Wall Putty</option>
                      <option value="Dhunee" className="text-[#5E4E06]">Dhunee</option>
                      <option value="Both" className="text-[#5E4E06]">Both</option>
                  </select>
                </div>
                <div className="mt-6">
                    <label className="block text-sm font-semibold text-[#5E4E06] mb-3">Notes</label>
                  <textarea
                    name="notes"
                    value={leadForm.notes}
                    onChange={handleInputChange}
                    rows={4}
                      className="w-full px-4 py-3 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent resize-none text-[#5E4E06] placeholder-[#8B7A1A]"
                    placeholder="Add any additional notes about this lead..."
                  />
                </div>
              </div>

              {/* Modal Footer */}
                <div className="flex items-center justify-end space-x-4 pt-8 border-t border-[#D4AF37]">
                  {submitError && (
                    <div className="text-red-600 text-sm mr-auto">
                      {submitError}
                    </div>
                  )}
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                    className="px-6 py-3 text-[#8B7A1A] bg-[#F5F2E8] hover:bg-[#E6DCC0] rounded-xl transition-colors duration-200 font-medium"
                    disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-xl hover:scale-105 transition-all duration-200 shadow-lg font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                  <UserPlus className="w-4 h-4" />
                  <span>Add Lead</span>
                      </>
                    )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Lead Modal */}
      {showEditLeadModal && editingLead && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 pt-20 sm:pt-4">
          <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[calc(100vh-5rem)] sm:max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8 border-b border-[#D4AF37]">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <Edit className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#5E4E06]">Edit Lead</h3>
                  <p className="text-xs sm:text-sm text-[#8B7A1A]">Update lead information</p>
                </div>
              </div>
              <button 
                onClick={() => setShowEditLeadModal(false)}
                className="p-2 sm:p-3 hover:bg-[#F5F2E8] rounded-lg sm:rounded-xl transition-colors duration-200"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#8B7A1A]" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleUpdateLead} className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
              {/* Personal Information */}
              <div>
                <h4 className="text-lg sm:text-xl font-semibold text-[#5E4E06] mb-4 sm:mb-6 flex items-center">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-[#D4AF37]" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#5E4E06] mb-2 sm:mb-3">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={leadForm.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] placeholder-[#8B7A1A] text-sm sm:text-base"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#5E4E06] mb-2 sm:mb-3">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={leadForm.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] placeholder-[#8B7A1A] text-sm sm:text-base"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#5E4E06] mb-2 sm:mb-3">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={leadForm.email}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] placeholder-[#8B7A1A] text-sm sm:text-base"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
              </div>

              {/* Lead Details */}
              <div>
                <h4 className="text-xl font-semibold text-[#5E4E06] mb-6 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-3 text-[#D4AF37]" />
                  Lead Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#5E4E06] mb-3">Lead Source *</label>
                    <select
                      name="source"
                      value={leadForm.source}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06]"
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
                  <div>
                    <label className="block text-sm font-semibold text-[#5E4E06] mb-3">Status *</label>
                    <select
                      name="status"
                      value={leadForm.status}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06]"
                    >
                      <option value="New Lead" className="text-[#5E4E06]">New Lead</option>
                      <option value="Contacted" className="text-[#5E4E06]">Contacted</option>
                      <option value="Qualified" className="text-[#5E4E06]">Qualified</option>
                      <option value="Proposal Sent" className="text-[#5E4E06]">Proposal Sent</option>
                      <option value="Negotiation" className="text-[#5E4E06]">Negotiation</option>
                      <option value="Closed Won" className="text-[#5E4E06]">Closed Won</option>
                      <option value="Closed Lost" className="text-[#5E4E06]">Closed Lost</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-semibold text-[#5E4E06] mb-3">Product Interest *</label>
                  <select
                    name="interest"
                    value={leadForm.interest}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06]"
                  >
                    <option value="" className="text-[#8B7A1A]">Select product</option>
                    <option value="Aura Wall Putty" className="text-[#5E4E06]">Aura Wall Putty</option>
                    <option value="Dhunee" className="text-[#5E4E06]">Dhunee</option>
                    <option value="Both" className="text-[#5E4E06]">Both</option>
                  </select>
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-[#5E4E06] mb-3">Notes</label>
                  <textarea
                    name="notes"
                    value={leadForm.notes}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent resize-none text-[#5E4E06] placeholder-[#8B7A1A]"
                    placeholder="Add any additional notes about this lead..."
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-4 pt-8 border-t border-[#D4AF37]">
                {submitError && (
                  <div className="text-red-600 text-sm mr-auto">
                    {submitError}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowEditLeadModal(false)}
                  className="px-6 py-3 text-[#8B7A1A] bg-[#F5F2E8] hover:bg-[#E6DCC0] rounded-xl transition-colors duration-200 font-medium"
                  disabled={isEditingLead}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-xl hover:scale-105 transition-all duration-200 shadow-lg font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isEditingLead}
                >
                  {isEditingLead ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4" />
                      <span>Update Lead</span>
                      </>
                    )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unified Task Modal */}
      {(showAddTaskModal || showEditTaskModal) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 pt-20 sm:pt-4">
          <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[calc(100vh-5rem)] sm:max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8 border-b border-[#D4AF37]">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-xl sm:rounded-2xl flex items-center justify-center">
                  {showEditTaskModal ? (
                    <Edit className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  ) : (
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#5E4E06]">
                    {showEditTaskModal ? 'Edit Task' : 'Add New Task'}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#8B7A1A]">
                    {showEditTaskModal ? 'Update task information' : 'Create a new task for your team'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowAddTaskModal(false);
                  setShowEditTaskModal(false);
                }}
                className="p-2 sm:p-3 hover:bg-[#F5F2E8] rounded-lg sm:rounded-xl transition-colors duration-200"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#8B7A1A]" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={showEditTaskModal ? handleUpdateTask : handleSubmitTask} className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
              {/* Basic Information */}
              <div>
                <h4 className="text-lg sm:text-xl font-semibold text-[#5E4E06] mb-4 sm:mb-6 flex items-center">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-[#D4AF37]" />
                  Task Information
                </h4>
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#5E4E06] mb-2 sm:mb-3">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={taskForm.title}
                      onChange={handleTaskInputChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] placeholder-[#8B7A1A] text-sm sm:text-base"
                      placeholder="Enter task title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#5E4E06] mb-2 sm:mb-3">Description *</label>
                    <textarea
                      name="description"
                      value={taskForm.description}
                      onChange={handleTaskInputChange}
                      required
                      rows={3}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] placeholder-[#8B7A1A] text-sm sm:text-base resize-none"
                      placeholder="Describe the task in detail"
                    />
                  </div>
                </div>
              </div>

              {/* Task Details */}
              <div>
                <h4 className="text-lg sm:text-xl font-semibold text-[#5E4E06] mb-4 sm:mb-6 flex items-center">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-[#D4AF37]" />
                  Task Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#5E4E06] mb-2 sm:mb-3">Category *</label>
                    <select
                      name="category"
                      value={taskForm.category}
                      onChange={handleTaskInputChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06]"
                    >
                      <option value="follow_up">Follow Up</option>
                      <option value="meeting">Meeting</option>
                      <option value="delivery">Delivery</option>
                      <option value="marketing">Marketing</option>
                      <option value="support">Support</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#5E4E06] mb-2 sm:mb-3">Priority *</label>
                    <select
                      name="priority"
                      value={taskForm.priority}
                      onChange={handleTaskInputChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06]"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#5E4E06] mb-2 sm:mb-3">Status *</label>
                    <select
                      name="status"
                      value={taskForm.status}
                      onChange={handleTaskInputChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06]"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#5E4E06] mb-2 sm:mb-3">Due Date *</label>
                    <input
                      type="date"
                      name="dueDate"
                      value={taskForm.dueDate}
                      onChange={handleTaskInputChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#5E4E06] mb-2 sm:mb-3">Estimated Time (minutes)</label>
                    <input
                      type="number"
                      name="estimatedTime"
                      value={taskForm.estimatedTime}
                      onChange={handleTaskInputChange}
                      min="1"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] placeholder-[#8B7A1A] text-sm sm:text-base"
                      placeholder="e.g., 30, 60, 120"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h4 className="text-lg sm:text-xl font-semibold text-[#5E4E06] mb-4 sm:mb-6 flex items-center">
                  <Tag className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-[#D4AF37]" />
                  Additional Information
                </h4>
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#5E4E06] mb-2 sm:mb-3">Tags</label>
                    <input
                      type="text"
                      name="tags"
                      value={taskForm.tags}
                      onChange={handleTaskInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] placeholder-[#8B7A1A] text-sm sm:text-base"
                      placeholder="Enter tags separated by commas (e.g., urgent, follow-up, customer)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#5E4E06] mb-2 sm:mb-3">Notes</label>
                    <textarea
                      name="notes"
                      value={taskForm.notes}
                      onChange={handleTaskInputChange}
                      rows={3}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] placeholder-[#8B7A1A] text-sm sm:text-base resize-none"
                      placeholder="Add any additional notes or context"
                    />
                  </div>
                </div>
              </div>

              {/* Recurring Task Settings */}
              <div>
                <h4 className="text-lg sm:text-xl font-semibold text-[#5E4E06] mb-4 sm:mb-6 flex items-center">
                  <Repeat className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-[#D4AF37]" />
                  Recurring Task (Optional)
                </h4>
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="isRecurring"
                      checked={taskForm.isRecurring}
                      onChange={(e) => setTaskForm(prev => ({ ...prev, isRecurring: e.target.checked }))}
                      className="w-4 h-4 text-[#D4AF37] border-[#D4AF37] rounded focus:ring-[#D4AF37]"
                    />
                    <label className="text-sm font-medium text-[#5E4E06]">Make this a recurring task</label>
                  </div>
                  
                  {taskForm.isRecurring && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pl-7">
                      <div>
                        <label className="block text-sm font-semibold text-[#5E4E06] mb-2 sm:mb-3">Repeat Every</label>
                        <input
                          type="number"
                          name="recurringInterval"
                          value={taskForm.recurringInterval}
                          onChange={handleTaskInputChange}
                          min="1"
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#5E4E06] mb-2 sm:mb-3">Period</label>
                        <select
                          name="recurringType"
                          value={taskForm.recurringType}
                          onChange={handleTaskInputChange}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] text-sm sm:text-base"
                        >
                          <option value="daily">Day(s)</option>
                          <option value="weekly">Week(s)</option>
                          <option value="monthly">Month(s)</option>
                          <option value="yearly">Year(s)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#5E4E06] mb-2 sm:mb-3">End Date (Optional)</label>
                        <input
                          type="date"
                          name="recurringEndDate"
                          value={taskForm.recurringEndDate}
                          onChange={handleTaskInputChange}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] text-sm sm:text-base"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-4 pt-8 border-t border-[#D4AF37]">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTaskModal(false);
                    setShowEditTaskModal(false);
                  }}
                  className="px-6 py-3 text-[#8B7A1A] bg-[#F5F2E8] hover:bg-[#E6DCC0] rounded-xl transition-colors duration-200 font-medium"
                  disabled={isSubmittingTask}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-xl hover:scale-105 transition-all duration-200 shadow-lg font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmittingTask}
                >
                  {isSubmittingTask ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{showEditTaskModal ? 'Updating...' : 'Creating...'}</span>
                    </>
                  ) : (
                    <>
                      {showEditTaskModal ? (
                        <>
                          <Edit className="w-4 h-4" />
                          <span>Update Task</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Create Task</span>
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* Task Analytics Modal */}
      {showTaskAnalytics && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 pt-20 sm:pt-4">
          <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[calc(100vh-5rem)] sm:max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8 border-b border-[#D4AF37]">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#5E4E06]">Task Analytics</h3>
                  <p className="text-xs sm:text-sm text-[#8B7A1A]">Comprehensive insights into your task performance</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTaskAnalytics(false)}
                className="p-2 sm:p-3 hover:bg-[#F5F2E8] rounded-lg sm:rounded-xl transition-colors duration-200"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#8B7A1A]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
              {/* Key Metrics */}
              <div>
                <h4 className="text-lg sm:text-xl font-semibold text-[#5E4E06] mb-4 sm:mb-6 flex items-center">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-[#D4AF37]" />
                  Key Performance Metrics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                  <div>
                        <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Completion Rate</p>
                        <p className="text-2xl font-bold text-blue-900">{getTaskAnalytics().completionRate}%</p>
                  </div>
                      <div className="p-2 bg-blue-200 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-blue-700" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                  <div>
                        <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Completed This Week</p>
                        <p className="text-2xl font-bold text-green-900">{getTaskAnalytics().completedThisWeek}</p>
                      </div>
                      <div className="p-2 bg-green-200 rounded-lg">
                        <Calendar className="w-5 h-5 text-green-700" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-orange-700 uppercase tracking-wide">Completed This Month</p>
                        <p className="text-2xl font-bold text-orange-900">{getTaskAnalytics().completedThisMonth}</p>
                      </div>
                      <div className="p-2 bg-orange-200 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-orange-700" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-red-700 uppercase tracking-wide">Overdue Rate</p>
                        <p className="text-2xl font-bold text-red-900">{getTaskAnalytics().overdueRate}%</p>
                      </div>
                      <div className="p-2 bg-red-200 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-700" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Performance */}
              <div>
                <h4 className="text-lg sm:text-xl font-semibold text-[#5E4E06] mb-4 sm:mb-6 flex items-center">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-[#D4AF37]" />
                  Category Performance
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getTaskAnalytics().categoryStats.map((stat) => (
                    <div key={stat.category} className="bg-white border border-[#D4AF37] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(stat.category as Task['category'])}`}>
                          <div className="flex items-center gap-1">
                            {getCategoryIcon(stat.category as Task['category'])}
                            {stat.category.replace('_', ' ')}
                  </div>
                  </div>
                        <span className="text-sm font-medium text-[#8B7A1A]">{stat.count} tasks</span>
                  </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#8B7A1A]">Completed: {stat.completed}</span>
                        <span className="text-xs font-medium text-green-600">
                          {stat.count > 0 ? Math.round((stat.completed / stat.count) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority Distribution */}
                  <div>
                <h4 className="text-lg sm:text-xl font-semibold text-[#5E4E06] mb-4 sm:mb-6 flex items-center">
                  <Flag className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-[#D4AF37]" />
                  Priority Distribution
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {getTaskAnalytics().priorityStats.map((stat) => (
                    <div key={stat.priority} className="bg-white border border-[#D4AF37] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(stat.priority as Task['priority'])}`}>
                          {stat.priority}
                  </div>
                        <span className="text-sm font-medium text-[#8B7A1A]">{stat.count} tasks</span>
                  </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#8B7A1A]">Completed: {stat.completed}</span>
                        <span className="text-xs font-medium text-green-600">
                          {stat.count > 0 ? Math.round((stat.completed / stat.count) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time Tracking */}
              <div>
                <h4 className="text-lg sm:text-xl font-semibold text-[#5E4E06] mb-4 sm:mb-6 flex items-center">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-[#D4AF37]" />
                  Time Tracking Summary
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
                    <div className="flex items-center justify-between">
                  <div>
                        <p className="text-xs font-medium text-indigo-700 uppercase tracking-wide">Total Estimated Time</p>
                        <p className="text-xl font-bold text-indigo-900">{formatTime(getTaskAnalytics().totalEstimatedTime)}</p>
                  </div>
                      <div className="p-2 bg-indigo-200 rounded-lg">
                        <Clock className="w-5 h-5 text-indigo-700" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center justify-between">
                  <div>
                        <p className="text-xs font-medium text-purple-700 uppercase tracking-wide">Total Actual Time</p>
                        <p className="text-xl font-bold text-purple-900">{formatTime(getTaskAnalytics().totalActualTime)}</p>
                      </div>
                      <div className="p-2 bg-purple-200 rounded-lg">
                        <Activity className="w-5 h-5 text-purple-700" />
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
            <div className="flex items-center justify-end p-4 sm:p-6 lg:p-8 border-t border-[#D4AF37]">
                <button
                onClick={() => setShowTaskAnalytics(false)}
                className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-xl hover:scale-105 transition-all duration-200 shadow-lg font-medium"
              >
                Close
                </button>
              </div>
          </div>
        </div>
      )}

              {/* Direct Call Modal */}
        {showDirectCallModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 pt-20 sm:pt-4">
            <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[calc(100vh-5rem)] sm:max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8 border-b border-[#D4AF37]">
              <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#8B7A1A] to-[#5E4E06] rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#5E4E06] truncate">Direct Call</h3>
                  <p className="text-xs sm:text-sm text-[#8B7A1A] truncate">Call a lead directly now</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowDirectCallModal(false);
                  // Reset modal state
                  setLeadSearchTerm('');
                  setLeadFilterStatus('all');
                  setCurrentLeadPage(1);
                  setSelectedLeadForCall(null);
                }}
                className="p-2 sm:p-3 hover:bg-[#F5F2E8] rounded-lg sm:rounded-xl transition-colors duration-200 cursor-pointer flex-shrink-0"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#8B7A1A]" />
              </button>
            </div>

                        {/* Modal Body */}
            <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
              {/* Lead Selection */}
              <div>
                <h4 className="text-lg sm:text-xl font-semibold text-[#5E4E06] mb-4 sm:mb-6 flex items-center">
                  <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-[#D4AF37]" />
                  Select Lead to Call
                </h4>
                
                {/* Search and Filter Controls */}
                <div className="space-y-3 mb-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search leads by name, phone, or email..."
                      value={leadSearchTerm}
                      onChange={(e) => setLeadSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 pl-10 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] placeholder-[#8B7A1A] text-sm sm:text-base"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-[#8B7A1A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Status Filter */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setLeadFilterStatus('all')}
                      className={`px-3 py-2 text-xs font-medium rounded-full border transition-colors duration-200 cursor-pointer ${
                        leadFilterStatus === 'all'
                          ? 'bg-[#D4AF37] text-white border-[#D4AF37]'
                          : 'bg-white text-[#8B7A1A] border-[#D4AF37] hover:bg-[#F5F2E8]'
                      }`}
                    >
                      All ({leads.length})
                    </button>
                    {['New Lead', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Closed Won', 'Closed Lost'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setLeadFilterStatus(status)}
                        className={`px-3 py-2 text-xs font-medium rounded-full border transition-colors duration-200 cursor-pointer ${
                          leadFilterStatus === status
                            ? 'bg-[#D4AF37] text-white border-[#D4AF37]'
                            : 'bg-white text-[#8B7A1A] border-[#D4AF37] hover:bg-[#F5F2E8]'
                        }`}
                      >
                        {status} ({leads.filter((l: Lead) => l.status === status).length})
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Results Summary */}
                <div className="flex items-center justify-between mb-3 text-sm text-[#8B7A1A]">
                  <span>
                    Showing {getPaginatedModalLeads().length} of {filteredModalLeads.length} leads
                    {leadSearchTerm && ` matching "${leadSearchTerm}"`}
                    {leadFilterStatus !== 'all' && ` with status "${leadFilterStatus}"`}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs">Show:</span>
                    <select
                      value={modalLeadsPerPage}
                      onChange={(e) => {
                        setModalLeadsPerPage(Number(e.target.value));
                        setCurrentLeadPage(1);
                      }}
                      className="px-2 py-1 text-xs border border-[#D4AF37] rounded focus:outline-none focus:ring-1 focus:ring-[#D4AF37] cursor-pointer"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {getPaginatedModalLeads().length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.285 2.285 0 01-2.285 2.285A2.285 2.285 0 0116.715 12 2.285 2.285 0 0119 9.715 2.285 2.285 0 0121.285 12z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
                      <p className="text-gray-500 mb-4">
                        {leadSearchTerm 
                          ? `No leads match "${leadSearchTerm}"`
                          : leadFilterStatus !== 'all'
                          ? `No leads with status "${leadFilterStatus}"`
                          : 'No leads available'
                        }
                      </p>
                      <button
                        onClick={() => {
                          setLeadSearchTerm('');
                          setLeadFilterStatus('all');
                        }}
                        className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#8B7A1A] transition-colors cursor-pointer"
                      >
                        Clear filters
                      </button>
                    </div>
                  ) : (
                    getPaginatedModalLeads().map((lead) => (
                    <div 
                      key={lead.id}
                      onClick={() => setSelectedLeadForCall(lead)}
                      className={`p-4 sm:p-3 border rounded-lg sm:rounded-xl cursor-pointer transition-all duration-200 min-h-[80px] sm:min-h-0 ${
                        selectedLeadForCall?.id === lead.id
                          ? 'border-[#D4AF37] bg-[#FFFBE6] shadow-md'
                          : 'border-gray-200 hover:border-[#D4AF37] hover:bg-[#F5F2E8]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 sm:w-8 sm:h-8 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-base sm:text-sm font-semibold">
                                {lead.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-semibold text-[#5E4E06] text-base sm:text-sm truncate">{lead.name}</h5>
                              <p className="text-sm sm:text-xs text-[#8B7A1A] break-all">{lead.phone}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 ml-13 sm:ml-0">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              lead.status === 'New Lead' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                              lead.status === 'Contacted' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                              lead.status === 'Qualified' ? 'bg-green-100 text-green-800 border-green-200' :
                              lead.status === 'Proposal Sent' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                              lead.status === 'Negotiation' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                              lead.status === 'Closed Won' ? 'bg-green-100 text-green-800 border-green-200' :
                              lead.status === 'Closed Lost' ? 'bg-red-100 text-red-800 border-red-200' :
                              'bg-gray-100 text-gray-800 border-gray-200'
                            } border`}>
                              {lead.status}
                            </span>
                            {lead.email && (
                              <span className="text-xs text-[#8B7A1A] break-all">• {lead.email}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-center sm:justify-end space-x-2 self-center sm:self-auto">
                          {lead.phone ? (
                            <>
                              <Phone className="w-5 h-5 sm:w-4 sm:h-4 text-green-600" />
                              <span className="text-xs text-green-600 font-medium">📱 Callable</span>
                            </>
                          ) : (
                            <>
                              <Phone className="w-5 h-5 sm:w-4 sm:h-4 text-red-400" />
                              <span className="text-xs text-red-400">❌ No phone</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                  )}
                </div>
                
                {/* Pagination Controls */}
                {totalModalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentLeadPage(1)}
                        disabled={currentLeadPage === 1}
                        className="px-3 py-2 text-xs font-medium text-[#8B7A1A] border border-[#D4AF37] rounded hover:bg-[#F5F2E8] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        First
                      </button>
                      <button
                        onClick={() => setCurrentLeadPage(prev => Math.max(1, prev - 1))}
                        disabled={currentLeadPage === 1}
                        className="px-3 py-2 text-xs font-medium text-[#8B7A1A] border border-[#D4AF37] rounded hover:bg-[#F5F2E8] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Previous
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalModalPages) }, (_, i) => {
                        let pageNum;
                        if (totalModalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentLeadPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentLeadPage >= totalModalPages - 2) {
                          pageNum = totalModalPages - 4 + i;
                        } else {
                          pageNum = currentLeadPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentLeadPage(pageNum)}
                            className={`px-3 py-2 text-xs font-medium rounded ${
                              currentLeadPage === pageNum
                                ? 'bg-[#D4AF37] text-white'
                                : 'text-[#8B7A1A] border border-[#D4AF37] hover:bg-[#F5F2E8]'
                            } cursor-pointer`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentLeadPage(prev => Math.min(totalModalPages, prev + 1))}
                        disabled={currentLeadPage === totalModalPages}
                        className="px-3 py-2 text-xs font-medium text-[#8B7A1A] border border-[#D4AF37] rounded hover:bg-[#F5F2E8] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Next
                      </button>
                      <button
                        onClick={() => setCurrentLeadPage(totalModalPages)}
                        disabled={currentLeadPage === totalModalPages}
                        className="px-3 py-2 text-xs font-medium text-[#8B7A1A] border border-[#D4AF37] rounded hover:bg-[#F5F2E8] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Last
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Call Actions */}
              {selectedLeadForCall && (
                <div className="border-t border-[#D4AF37] pt-6">
                                    <h4 className="text-lg sm:text-xl font-semibold text-[#5E4E06] mb-4 sm:mb-6 flex items-center">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-[#D4AF37]" />
                    Call {selectedLeadForCall.name}
                  </h4>
                  
                  {/* Call Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-4 sm:p-3 mb-4">
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 text-sm">ℹ️</span>
                      </div>
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1 text-base sm:text-sm">How calling works:</p>
                        <ul className="space-y-1 text-xs sm:text-xs">
                          <li>• <strong>Mobile devices:</strong> Click "Call Now" to open your phone app</li>
                          <li>• <strong>Desktop computers:</strong> Phone number will be copied to clipboard</li>
                          <li>• <strong>All calls are automatically logged</strong> in your system</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  
                  
                                    <div className="bg-[#FFFBE6] border border-[#D4AF37] rounded-lg sm:rounded-xl p-4 sm:p-6 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 mb-4">
                      <div className="w-16 h-16 sm:w-12 sm:h-12 bg-gradient-to-br from-[#8B7A1A] to-[#5E4E06] rounded-full flex items-center justify-center self-center sm:self-auto">
                        <span className="text-white text-2xl sm:text-lg font-bold">
                          {selectedLeadForCall.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="text-center sm:text-left">
                        <h5 className="font-bold text-[#5E4E06] text-xl sm:text-lg">{selectedLeadForCall.name}</h5>
                        <div className="flex items-center justify-center sm:justify-start space-x-2 mb-2 sm:mb-1">
                          <Phone className="w-5 h-5 sm:w-4 sm:h-4 text-[#8B7A1A]" />
                          <p className="text-[#8B7A1A] font-medium text-base sm:text-sm">{selectedLeadForCall.phone}</p>
                          <button
                            onClick={() => {
                              if (selectedLeadForCall.phone) {
                                navigator.clipboard.writeText(selectedLeadForCall.phone);
                                showToast('Phone number copied!', 'success');
                              }
                            }}
                            className="ml-2 p-2 sm:p-1 hover:bg-[#D4AF37]/20 rounded transition-colors cursor-pointer"
                            title="Copy phone number"
                          >
                            📋
                          </button>
                        </div>
                        <p className="text-base sm:text-sm text-[#8B7A1A]">Status: {selectedLeadForCall.status}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-[#8B7A1A]" />
                        <span className="text-[#5E4E06] font-medium">Ready to call this lead?</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-[#8B7A1A]" />
                        <span className="text-[#8B7A1A] text-sm">Call will be logged in your system</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:gap-4">
                    <button
                      onClick={() => handleDirectCall(selectedLeadForCall)}
                      disabled={!selectedLeadForCall.phone}
                      className={`w-full flex items-center justify-center space-x-2 px-6 py-4 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 font-medium shadow-lg cursor-pointer ${
                        selectedLeadForCall.phone
                          ? 'bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white hover:scale-105'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <span className="font-semibold text-base sm:text-sm">
                        {selectedLeadForCall.phone 
                          ? `Call ${selectedLeadForCall.phone}`
                          : '❌ No phone number'
                        }
                      </span>
                    </button>
                    <button
                      onClick={() => setSelectedLeadForCall(null)}
                      className="w-full sm:w-auto px-6 py-3 bg-[#F5F2E8] text-[#8B7A1A] rounded-lg sm:rounded-xl hover:bg-[#E6DCC0] transition-colors duration-200 font-medium cursor-pointer"
                    >
                      Change Lead
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-center sm:justify-end p-4 sm:p-6 lg:p-8 border-t border-[#D4AF37]">
              <button
                onClick={() => {
                  setShowDirectCallModal(false);
                  // Reset modal state
                  setLeadSearchTerm('');
                  setLeadFilterStatus('all');
                  setCurrentLeadPage(1);
                  setSelectedLeadForCall(null);
                }}
                className="w-full sm:w-auto px-6 py-3 bg-[#F5F2E8] text-[#8B7A1A] rounded-lg sm:rounded-xl hover:bg-[#E6DCC0] transition-colors duration-200 font-medium cursor-pointer"
              >
                Close
                </button>
              </div>
          </div>
        </div>
      )}

              {/* Delete Quote Confirmation Modal */}
        {showDeleteQuoteModal && quoteToDelete && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-[#D4AF37] shadow-2xl max-w-md w-full mx-4">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#5E4E06]">
                      {quoteToDelete.deleteAllVersions ? 'Delete All Quote Versions' : 'Delete Quote'}
                    </h3>
                    <p className="text-sm text-[#8B7A1A]">This action cannot be undone</p>
                  </div>
                </div>

                {/* Content */}
                <div className="mb-6">
                  <div className="bg-[#F5F2E8] rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium text-[#5E4E06] mb-2">Quote Details:</p>
                    <div className="space-y-1 text-sm text-[#8B7A1A]">
                      <p><span className="font-medium">Quote Number:</span> {quoteToDelete.quote.quoteNumber}</p>
                      <p><span className="font-medium">Customer:</span> {quoteToDelete.quote.customerName}</p>
                      <p><span className="font-medium">Total:</span> ₹{quoteToDelete.quote.total.toLocaleString()}</p>
                      <p><span className="font-medium">Status:</span> {quoteToDelete.quote.status.charAt(0).toUpperCase() + quoteToDelete.quote.status.slice(1)}</p>
                    </div>
                  </div>

                  {quoteToDelete.deleteAllVersions && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-800">
                        <span className="font-medium">Warning:</span> This will delete ALL versions of this quote and cannot be undone.
                        All related quote versions will be permanently removed.
                      </p>
                    </div>
                  )}

                  {!quoteToDelete.deleteAllVersions && (
                    <p className="text-sm text-[#8B7A1A]">
                      Are you sure you want to delete this quote? This action cannot be undone.
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowDeleteQuoteModal(false);
                      setQuoteToDelete(null);
                    }}
                    className="px-4 py-2 text-[#8B7A1A] hover:bg-[#F5F2E8] rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                  >
                    {quoteToDelete.deleteAllVersions ? 'Delete All Versions' : 'Delete Quote'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Quote Modal */}
        {showCreateQuoteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 pt-20 sm:pt-4">
          <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[calc(100vh-5rem)] sm:max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8 border-b border-[#D4AF37]">
              <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#5E4E06] truncate">Create Quote</h3>
                  <p className="text-xs sm:text-sm text-[#8B7A1A] truncate">
                    {quoteMode === 'existing' && selectedLeadForQuote 
                      ? `Generate professional quote for ${selectedLeadForQuote.name}`
                      : 'Generate professional quote for new or existing customer'
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
                    paymentLink: '',
                    status: 'draft'
                  });
                }}
                className="p-2 sm:p-3 hover:bg-[#F5F2E8] rounded-lg sm:rounded-xl transition-colors duration-200 cursor-pointer flex-shrink-0"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#8B7A1A]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
              {/* Customer Selection */}
              <div className="bg-[#F5F2E8] rounded-lg sm:rounded-xl p-4 sm:p-6 border border-[#D4AF37]">
                <h4 className="text-lg sm:text-xl font-semibold text-[#5E4E06] mb-3 sm:mb-4">Customer Selection</h4>
                
                {/* Mode Toggle */}
                <div className="flex space-x-2 mb-4">
                  <button
                    onClick={() => setQuoteMode('existing')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 cursor-pointer ${
                      quoteMode === 'existing'
                        ? 'bg-[#D4AF37] text-white'
                        : 'bg-white text-[#8B7A1A] hover:bg-[#F5F2E8]'
                    }`}
                  >
                    Existing Lead
                  </button>
                  <button
                    onClick={() => setQuoteMode('new')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 cursor-pointer ${
                      quoteMode === 'new'
                        ? 'bg-[#D4AF37] text-white'
                        : 'bg-white text-[#8B7A1A] hover:bg-[#F5F2E8]'
                    }`}
                  >
                    New Customer
                  </button>
                </div>

                {quoteMode === 'existing' ? (
                  /* Existing Lead Selection */
                  <div>
                    <label className="block text-sm font-medium text-[#8B7A1A] mb-2">Select Lead</label>
                    <select
                      value={selectedLeadForQuote?.id || ''}
                      onChange={(e) => {
                        if (e.target.value === 'new-aura') {
                          setQuoteMode('new');
                          setSelectedLeadForQuote(null);
                          setNewCustomerForm(prev => ({ ...prev, interest: 'Aura' }));
                          // Auto-generate quote title and description
                          setQuoteForm(prev => ({
                            ...prev,
                            title: `Quote for Customer - Aura`,
                            description: `Professional quote for customer regarding Aura`
                          }));
                        } else if (e.target.value === 'new-dhunee') {
                          setQuoteMode('new');
                          setSelectedLeadForQuote(null);
                          setNewCustomerForm(prev => ({ ...prev, interest: 'Dhunee' }));
                          // Auto-generate quote title and description
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
                      className="w-full px-4 py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06]"
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
                    
                    {selectedLeadForQuote && (
                      <div className="mt-4 p-3 bg-white rounded-lg border border-[#D4AF37]">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <p className="text-sm font-medium text-[#8B7A1A]">Name</p>
                            <p className="text-base font-semibold text-[#5E4E06]">{selectedLeadForQuote.name}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#8B7A1A]">Interest</p>
                            <p className="text-base font-semibold text-[#5E4E06]">{selectedLeadForQuote.interest}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#8B7A1A]">Email</p>
                            <p className="text-base font-semibold text-[#5E4E06]">{selectedLeadForQuote.email || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#8B7A1A]">Phone</p>
                            <p className="text-base font-semibold text-[#5E4E06]">{selectedLeadForQuote.phone || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* New Customer Form */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#8B7A1A] mb-2">Customer Name *</label>
                        <input
                          type="text"
                          value={newCustomerForm.name}
                          onChange={(e) => {
                            setNewCustomerForm(prev => ({ ...prev, name: e.target.value }));
                            // Auto-generate quote title and description when name changes
                            if (newCustomerForm.interest) {
                              setQuoteForm(prev => ({
                                ...prev,
                                title: `Quote for ${e.target.value} - ${newCustomerForm.interest}`,
                                description: `Professional quote for ${e.target.value} regarding ${newCustomerForm.interest}`
                              }));
                            }
                          }}
                          className="w-full px-4 py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] placeholder-[#8B7A1A]"
                          placeholder="Enter customer name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#8B7A1A] mb-2">Product/Service Interest *</label>
                        <select
                          value={newCustomerForm.interest}
                          onChange={(e) => {
                            setNewCustomerForm(prev => ({ ...prev, interest: e.target.value }));
                            // Auto-generate quote title and description when interest changes
                            if (newCustomerForm.name) {
                              setQuoteForm(prev => ({
                                ...prev,
                                title: `Quote for ${newCustomerForm.name} - ${e.target.value}`,
                                description: `Professional quote for ${newCustomerForm.name} regarding ${e.target.value}`
                              }));
                            }
                          }}
                          className="w-full px-4 py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06]"
                          required
                        >
                          <option value="">Select a product...</option>
                          <option value="Aura">Aura - Natural Plaster Solutions</option>
                          <option value="Dhunee">Dhunee - Organic Incense</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#8B7A1A] mb-2">Email</label>
                        <input
                          type="email"
                          value={newCustomerForm.email}
                          onChange={(e) => setNewCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-4 py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] placeholder-[#8B7A1A]"
                          placeholder="customer@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#8B7A1A] mb-2">Phone</label>
                        <input
                          type="tel"
                          value={newCustomerForm.phone}
                          onChange={(e) => setNewCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-4 py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] placeholder-[#8B7A1A]"
                          placeholder="+91 12345 67890"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#8B7A1A] mb-2">Lead Source *</label>
                        <select
                          value={newCustomerForm.source}
                          onChange={(e) => setNewCustomerForm(prev => ({ ...prev, source: e.target.value }))}
                          required
                          className="w-full px-4 py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06]"
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
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newCustomerForm.addToLeads}
                            onChange={(e) => setNewCustomerForm(prev => ({ ...prev, addToLeads: e.target.checked }))}
                            className="w-4 h-4 text-[#D4AF37] border-[#D4AF37] rounded focus:ring-[#D4AF37] focus:ring-2"
                          />
                          <span className="text-sm font-medium text-[#5E4E06]">Add to Leads automatically</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quote Details & Items - Combined Section */}
              <div className="bg-[#F5F2E8] rounded-lg sm:rounded-xl p-4 sm:p-6 border border-[#D4AF37]">
                <h4 className="text-lg sm:text-xl font-semibold text-[#5E4E06] mb-4">Quote Details & Items</h4>
                
                {/* Valid Until */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-[#8B7A1A] mb-2">Valid Until</label>
                  <input
                    type="date"
                    value={quoteForm.validUntil}
                    onChange={(e) => setQuoteForm(prev => ({ ...prev, validUntil: e.target.value }))}
                    className="w-full max-w-xs px-4 py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06]"
                  />
                </div>

                {/* Payment Link */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-[#8B7A1A] mb-2">Payment Link *</label>
                  <input
                    type="url"
                    value={quoteForm.paymentLink}
                    onChange={(e) => setQuoteForm(prev => ({ ...prev, paymentLink: e.target.value }))}
                    className="w-full px-4 py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06]"
                    placeholder="https://razorpay.com/pay/..."
                    required
                  />
                  <p className="text-xs text-[#8B7A1A] mt-1">
                    Create a Razorpay payment link for the quote amount and paste it here
                  </p>
                </div>

                {/* Items Header */}
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-base font-semibold text-[#5E4E06]">Quote Items</h5>
                  <button
                    onClick={addQuoteItem}
                    className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#8B7A1A] transition-colors duration-200 cursor-pointer text-sm font-medium"
                  >
                    + Add Item
                  </button>
                </div>
                
                {/* Items Grid */}
                <div className="space-y-4">
                  {quoteForm.items.map((item, index) => {
                    const selectedProduct = products.find(p => p.id === item.productId);
                    return (
                      <div key={index} className="bg-white rounded-lg border border-[#D4AF37] p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                          <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-[#8B7A1A] mb-2">Product *</label>
                            <select
                              value={item.productId}
                              onChange={(e) => updateQuoteItem(index, 'productId', e.target.value)}
                              className="w-full px-4 py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06]"
                              required
                            >
                              <option value="">Select a product...</option>
                              {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                  {product.name} - ₹{product.price.toLocaleString()} {product.unit}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[#8B7A1A] mb-2">Quantity</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateQuoteItem(index, 'quantity', parseInt(e.target.value) || 1)}
                              className="w-full px-4 py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06]"
                              placeholder="1"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-[#8B7A1A] mb-2">Unit Price</label>
                              <div className="px-3 py-3 bg-[#F5F2E8] border border-[#D4AF37] rounded-lg text-[#5E4E06] text-sm font-medium">
                                ₹{selectedProduct?.price || 0} {selectedProduct?.unit || ''}
                              </div>
                            </div>
                            {quoteForm.items.length > 1 && (
                              <button
                                onClick={() => removeQuoteItem(index)}
                                className="px-3 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 cursor-pointer text-sm"
                                title="Remove item"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pricing & Totals - Redesigned */}
              <div className="bg-[#F5F2E8] rounded-lg sm:rounded-xl p-4 sm:p-6 border border-[#D4AF37]">
                <h4 className="text-lg sm:text-xl font-semibold text-[#5E4E06] mb-4">Pricing & Totals</h4>
                
                {/* Discount Section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-[#8B7A1A] mb-3">Discount</label>
                  <div className="flex space-x-2 mb-3">
                    <button
                      onClick={() => {
                        setQuoteForm(prev => ({ 
                          ...prev, 
                          discountType: 'percentage',
                          discount: 0
                        }));
                      }}
                      className={`px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 cursor-pointer ${
                        quoteForm.discountType === 'percentage'
                          ? 'bg-[#D4AF37] text-white shadow-lg scale-105'
                          : 'bg-white text-[#8B7A1A] hover:bg-[#F5F2E8] border border-[#D4AF37]'
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
                      className={`px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 cursor-pointer ${
                        quoteForm.discountType === 'amount'
                          ? 'bg-[#D4AF37] text-white shadow-lg scale-105'
                          : 'bg-white text-[#8B7A1A] hover:bg-[#F5F2E8] border border-[#D4AF37]'
                      }`}
                    >
                      Amount (₹)
                    </button>
                  </div>
                  
                  {/* Discount Input */}
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
                    className="w-full px-4 py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06]"
                    placeholder={quoteForm.discountType === 'percentage' ? '0' : '0.00'}
                  />
                </div>

                {/* Total Display */}
                <div className="p-4 bg-white rounded-lg sm:rounded-xl border border-[#D4AF37]">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#8B7A1A]">Subtotal:</span>
                      <span className="font-semibold text-[#5E4E06]">₹{calculateQuoteTotal().subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#8B7A1A]">Discount ({quoteForm.discountType === 'percentage' ? `${quoteForm.discount}%` : `₹${quoteForm.discount}`}):</span>
                      <span className="font-semibold text-[#5E4E06]">₹{calculateQuoteTotal().discountAmount.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-[#D4AF37] pt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-[#5E4E06]">Total:</span>
                        <span className="text-[#D4AF37]">₹{calculateQuoteTotal().total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-center sm:justify-end p-4 sm:p-6 lg:p-8 border-t border-[#D4AF37] space-x-3 sm:space-x-4">
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
                    paymentLink: '',
                    status: 'draft'
                  });
                }}
                className="px-6 py-3 bg-[#F5F2E8] text-[#8B7A1A] rounded-lg sm:rounded-xl hover:bg-[#E6DCC0] transition-colors duration-200 font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQuote}
                disabled={
                  (quoteMode === 'existing' && !selectedLeadForQuote) ||
                  (quoteMode === 'new' && (!newCustomerForm.name.trim() || !newCustomerForm.interest.trim() || !newCustomerForm.source.trim()))
                }
                className={`px-6 py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-200 ${
                  (quoteMode === 'existing' && !selectedLeadForQuote) ||
                  (quoteMode === 'new' && (!newCustomerForm.name.trim() || !newCustomerForm.interest.trim() || !newCustomerForm.source.trim()))
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white hover:scale-105 cursor-pointer'
                }`}
              >
                {quoteMode === 'new' ? 'Create Quote & Lead' : 'Create Quote'}
                </button>
              </div>
          </div>
        </div>
      )}

      {/* Drawer for customer details */}
<CustomerDetailsDrawer
  open={drawerOpen}
  onOpenChange={setDrawerOpen}
  customer={selectedCustomer}
  onSave={handleSaveCustomer}
  onDelete={handleDeleteCustomer}
/>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminRouteGuard>
      <AdminDashboardContent />
    </AdminRouteGuard>
  );
} 