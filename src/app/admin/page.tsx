"use client";

import { User, Settings, LogOut, Bell, Menu, LayoutDashboard, BarChart3, Users, ShoppingCart, TrendingUp, DollarSign, Calendar, MessageSquare, Phone, UserPlus, Target, Activity, Plus, ArrowUpRight, MoreVertical, FileText, X, Edit, Trash2, Eye as EyeIcon, Search, ArrowLeft, ArrowRight, Mountain, Truck, Package, CheckCircle, Clock, AlertCircle, Star, Filter, SortAsc, SortDesc, CalendarDays, CheckSquare, Square, Tag, UserCheck, Flag, LayoutGrid, List, Database, Repeat } from 'lucide-react';
import MockChatCRM from './MockChatCRM';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { AuthService, auth, db, Lead, UserProfile, Order, Task } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js';
import CustomerDetailsDrawer from '@/components/CustomerDetailsDrawer';
import React from 'react';
import { useToast } from '@/components/ToastContext';
import { AdminRouteGuard } from '@/components/RouteGuard';
import app from '@/lib/firebase';
import { collection, getDocs, Timestamp } from 'firebase/firestore';

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

  const crmStats = [
    {
      title: 'Total Leads',
      value: leads.length.toString(),
      change: '+12.5%',
      icon: UserPlus,
      gradient: 'from-[#D4AF37] to-[#8B7A1A]',
      description: 'from last month'
    },
    {
      title: 'Active Deals',
      value: leads.filter(lead => ['Qualified', 'Proposal Sent', 'Negotiation'].includes(lead.status)).length.toString(),
      change: '+8.2%',
      icon: Target,
      gradient: 'from-[#8B7A1A] to-[#5E4E06]',
      description: 'in pipeline'
    },
    {
      title: 'Conversion Rate',
      value: leads.length > 0 ? `${Math.round((leads.filter(lead => lead.status === 'Closed Won').length / leads.length) * 100)}%` : '0%',
      change: '+2.1%',
      icon: TrendingUp,
      gradient: 'from-[#D4AF37] to-[#8B7A1A]',
      description: 'this month'
    },
    {
      title: 'Revenue',
      value: '₹2.4L',
      change: '+15.3%',
      icon: DollarSign,
      gradient: 'from-[#8B7A1A] to-[#5E4E06]',
      description: 'this month'
    }
  ];

  // Navigation tabs
  const navigation = [
    { name: 'Overview', id: 'overview', icon: BarChart3 },
    { name: 'Leads', id: 'leads', icon: UserPlus },
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
  // Filter customers by join date
  const now = new Date();
  let dateFilteredCustomers = [];
  if (filterType === 'thisMonth') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    dateFilteredCustomers = customers.filter(c => {
      const d = getDate(c.createdAt);
      return isWithinRange(d, firstDay, lastDay);
    });
  } else if (filterType === 'last30') {
    const start = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
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
        const [fetchedLeads, fetchedOrders, fetchedTasks] = await Promise.all([
          AuthService.getLeads(),
          AuthService.getOrders(),
          AuthService.getTasks()
        ]);
        setLeads(fetchedLeads);
        setOrders(fetchedOrders);
        setTasks(fetchedTasks);
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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen]);

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

  // Helper to format Firestore Timestamp or Date
  function formatDate(date: any) {
    if (!date) return '-';
    if (typeof date.toDate === 'function') {
      return date.toDate().toLocaleDateString();
    }
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }
    return '-';
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

  if (isLoading) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F6F0] via-[#F5F2E8] to-[#E6DCC0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
                </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F6F0] via-[#F5F2E8] to-[#E6DCC0]">
      {/* Topbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#D4AF37] shadow-sm h-14 sm:h-16 flex items-center px-3 sm:px-4 md:px-6">
        {/* Mobile Menu Button */}
        <button 
          onClick={() => setSidebarOpen(true)}
          className="md:hidden p-2 rounded-lg bg-[#F5F2E8] text-[#8B7A1A] hover:bg-[#D4AF37] hover:text-white transition-colors mr-2 sm:mr-3"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <Link href="/" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium text-[#8B7A1A] bg-[#F5F2E8] hover:bg-[#D4AF37] hover:text-white transition-colors duration-200 mr-2 sm:mr-4">
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline text-xs sm:text-sm">Back</span>
              </Link>
        
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-1">
          <Mountain className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-[#D4AF37]" />
          <h1 className="text-base sm:text-lg md:text-2xl font-bold text-[#5E4E06]">Admin</h1>
              </div>
              
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
          <span className="hidden md:flex items-center gap-2 text-[#8B7A1A] font-medium">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-white font-semibold text-sm">
              {userProfile?.firstName?.[0]?.toUpperCase() || 'A'}
            </div>
            {userProfile?.firstName || 'Admin'}
          </span>
          <button onClick={handleLogout} className="p-1.5 sm:p-2 rounded-lg bg-[#F5F2E8] text-[#8B7A1A] hover:bg-[#D4AF37] hover:text-white transition-colors" title="Logout">
            <LogOut className="w-4 h-4" />
              </button>
                </div>
      </nav>

      {/* Fixed layout below header */}
      <div className="fixed top-14 sm:top-16 left-0 w-full h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] flex">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)}></div>
        )}
        
        {/* Sidebar */}
        <aside className={`fixed md:static z-40 left-0 top-14 sm:top-16 w-72 sm:w-80 md:w-60 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] bg-gradient-to-br from-[#FFFBE6] to-[#F5F2E8] border-r-2 border-[#D4AF37] shadow-2xl flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between p-3 sm:p-4 border-b border-[#D4AF37]">
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
              className="p-1.5 sm:p-2 hover:bg-[#F5F2E8] rounded-lg transition-colors"
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
          
          {/* Footer */}
          <div className="p-3 sm:p-4 md:px-4 md:mb-6">
            <div className="text-xs text-[#8B7A1A] text-center">Desert to Mountains &copy; {new Date().getFullYear()}</div>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 w-full h-full overflow-y-auto relative z-10 bg-transparent p-2 sm:p-3 md:p-4 lg:p-8">
        {activeTab === 'overview' && (
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
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
                    <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-[#8B7A1A]" />
                    <span className="text-xs sm:text-sm font-semibold text-[#8B7A1A]">{stat.change}</span>
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
                    className="flex items-center justify-center sm:justify-start space-x-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-lg sm:rounded-xl hover:scale-105 transition-all duration-200 text-sm sm:text-base"
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
                          <button className="p-1 sm:p-2 hover:bg-[#F5F2E8] rounded-lg transition-colors duration-200">
                            <MoreVertical className="w-4 h-4 text-[#8B7A1A]" />
                          </button>
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
                    className="w-full flex items-center space-x-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#FFFBE6] to-[#F5F2E8] border border-[#D4AF37] hover:scale-105 transition-all duration-300"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-lg sm:rounded-xl flex items-center justify-center">
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-[#5E4E06] text-sm sm:text-base">Add New Lead</p>
                      <p className="text-xs sm:text-sm text-[#8B7A1A]">Capture potential customer</p>
                    </div>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#FFFBE6] to-[#F5F2E8] border border-[#D4AF37] hover:scale-105 transition-all duration-300">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#8B7A1A] to-[#5E4E06] rounded-lg sm:rounded-xl flex items-center justify-center">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-[#5E4E06] text-sm sm:text-base">Schedule Call</p>
                      <p className="text-xs sm:text-sm text-[#8B7A1A]">Book customer meeting</p>
                    </div>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#FFFBE6] to-[#F5F2E8] border border-[#D4AF37] hover:scale-105 transition-all duration-300">
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
                <p className="text-sm sm:text-base text-[#8B7A1A]">Track and manage your potential customers effectively.</p>
              </div>
              <button 
                onClick={() => setShowAddLeadModal(true)}
                className="flex items-center justify-center sm:justify-start space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-lg sm:rounded-xl hover:scale-105 transition-all duration-200 text-sm sm:text-base"
              >
                <Plus className="w-4 h-4" />
                <span>Add Lead</span>
              </button>
            </div>
            {leads.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <UserPlus className="w-16 h-16 sm:w-20 sm:h-20 text-[#D4AF37] mx-auto mb-4 sm:mb-6" />
                <h3 className="text-lg sm:text-xl font-semibold text-[#5E4E06] mb-2 sm:mb-3">No Leads Yet</h3>
                <p className="text-sm sm:text-base text-[#8B7A1A] max-w-md mx-auto">Start by adding your first lead using the button above.</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {leads.map((lead) => (
                  <div key={lead.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 bg-[#FFFBE6] rounded-lg sm:rounded-xl border border-[#D4AF37] hover:shadow-md transition-shadow duration-300 space-y-3 sm:space-y-0">
                    <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                        <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                          <h3 className="font-semibold text-[#5E4E06] text-base sm:text-lg truncate">{lead.name}</h3>
                          <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium w-fit ${
                            lead.status === 'New Lead' ? 'bg-[#D4AF37] text-[#5E4E06]' :
                            lead.status === 'Qualified' ? 'bg-[#8B7A1A] text-white' :
                            lead.status === 'Closed Won' ? 'bg-green-500 text-white' :
                            lead.status === 'Closed Lost' ? 'bg-red-500 text-white' :
                            'bg-gray-500 text-white'
                          }`}>
                            {lead.status}
                          </span>
                        </div>
                        <div className="space-y-1 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-3 sm:gap-4 text-xs sm:text-sm text-[#8B7A1A]">
                          <div>
                            <span className="font-medium">Phone:</span> {lead.phone}
                          </div>
                          {lead.email && (
                            <div>
                              <span className="font-medium">Email:</span> {lead.email}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Interest:</span> {lead.interest}
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-[#8B7A1A]">
                          <span className="font-medium">Source:</span> {lead.source} • 
                          <span className="font-medium ml-2">Created:</span> {
                            lead.createdAt instanceof Date 
                              ? lead.createdAt.toLocaleDateString() 
                              : new Date(lead.createdAt).toLocaleDateString()
                          }
                        </div>
                        {lead.notes && (
                          <div className="mt-2 text-xs sm:text-sm text-[#8B7A1A] bg-white/50 p-2 rounded-lg">
                            <span className="font-medium">Notes:</span> {lead.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-2 hover:bg-[#F5F2E8] rounded-lg transition-colors duration-200" title="Edit">
                        <Edit className="w-4 h-4 text-[#8B7A1A]" />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg transition-colors duration-200" title="Delete">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative animate-fade-in-up">
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-[#D4AF37] max-w-md w-full">
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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

      {/* Unified Task Modal */}
      {(showAddTaskModal || showEditTaskModal) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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