"use client";

import { User, Settings, LogOut, Bell, Menu, LayoutDashboard, BarChart3, Users, ShoppingCart, TrendingUp, DollarSign, Calendar, MessageSquare, Phone, UserPlus, Target, Activity, Plus, ArrowUpRight, MoreVertical, FileText, X, Edit, Trash2, Eye as EyeIcon, Search, ArrowLeft, ArrowRight, Mountain, Truck, Package, CheckCircle, Clock, AlertCircle, Star, Filter, SortAsc, SortDesc, CalendarDays, CheckSquare, Square, Tag, UserCheck, Flag } from 'lucide-react';
import MockChatCRM from './MockChatCRM';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { AuthService, auth, db, Lead, UserProfile, Order } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js';
import CustomerDetailsDrawer from '@/components/CustomerDetailsDrawer';
import React from 'react';
import { useToast } from '@/components/ToastContext';
import { AdminRouteGuard } from '@/components/RouteGuard';
import app from '@/lib/firebase';

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

  // Task Management State
  interface Task {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'overdue';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: 'follow_up' | 'meeting' | 'delivery' | 'marketing' | 'support' | 'other';
    assignedTo: string;
    dueDate: Date;
    createdAt: Date;
    completedAt?: Date;
    tags: string[];
    notes: string;
    relatedTo?: {
      type: 'lead' | 'order' | 'customer';
      id: string;
      name: string;
    };
  }

  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'overdue'>('all');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');
  const [taskCategoryFilter, setTaskCategoryFilter] = useState<'all' | 'follow_up' | 'meeting' | 'delivery' | 'marketing' | 'support' | 'other'>('all');
  const [taskSortBy, setTaskSortBy] = useState<'dueDate' | 'priority' | 'createdAt' | 'title'>('dueDate');
  const [taskSortOrder, setTaskSortOrder] = useState<'asc' | 'desc'>('asc');
  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'pending' as Task['status'],
    priority: 'medium' as Task['priority'],
    category: 'follow_up' as Task['category'],
    assignedTo: '',
    dueDate: '',
    tags: '',
    notes: '',
    relatedToType: '' as 'lead' | 'order' | 'customer' | '',
    relatedToId: '',
    relatedToName: ''
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
        const [fetchedLeads, fetchedOrders] = await Promise.all([
          AuthService.getLeads(),
          AuthService.getOrders()
        ]);
        setLeads(fetchedLeads);
        setOrders(fetchedOrders);
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
      router.push('/');
    } catch (error) {
      console.error('Sign out failed:', error);
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

  const getFilteredAndSortedTasks = () => {
    let filtered = tasks.filter(task => {
      if (taskFilter !== 'all' && task.status !== taskFilter) return false;
      if (taskPriorityFilter !== 'all' && task.priority !== taskPriorityFilter) return false;
      if (taskCategoryFilter !== 'all' && task.category !== taskCategoryFilter) return false;
      
      if (taskSearchQuery) {
        const query = taskSearchQuery.toLowerCase();
        const matches = 
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.assignedTo.toLowerCase().includes(query) ||
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

  const handleTaskInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTaskForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingTask(true);
    
    try {
      const newTask: Task = {
        id: Date.now().toString(),
        title: taskForm.title,
        description: taskForm.description,
        status: taskForm.status,
        priority: taskForm.priority,
        category: taskForm.category,
        assignedTo: taskForm.assignedTo,
        dueDate: new Date(taskForm.dueDate),
        createdAt: new Date(),
        tags: taskForm.tags ? taskForm.tags.split(',').map(tag => tag.trim()) : [],
        notes: taskForm.notes,
        relatedTo: taskForm.relatedToType && taskForm.relatedToId ? {
          type: taskForm.relatedToType as 'lead' | 'order' | 'customer',
          id: taskForm.relatedToId,
          name: taskForm.relatedToName
        } : undefined
      };

      setTasks(prev => [...prev, newTask]);
      setTaskForm({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        category: 'follow_up',
        assignedTo: '',
        dueDate: '',
        tags: '',
        notes: '',
        relatedToType: '',
        relatedToId: '',
        relatedToName: ''
      });
      setShowAddTaskModal(false);
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
      const updatedTask: Task = {
        ...selectedTask,
        title: taskForm.title,
        description: taskForm.description,
        status: taskForm.status,
        priority: taskForm.priority,
        category: taskForm.category,
        assignedTo: taskForm.assignedTo,
        dueDate: new Date(taskForm.dueDate),
        tags: taskForm.tags ? taskForm.tags.split(',').map(tag => tag.trim()) : [],
        notes: taskForm.notes,
        relatedTo: taskForm.relatedToType && taskForm.relatedToId ? {
          type: taskForm.relatedToType as 'lead' | 'order' | 'customer',
          id: taskForm.relatedToId,
          name: taskForm.relatedToName
        } : undefined,
        completedAt: taskForm.status === 'completed' ? new Date() : selectedTask.completedAt
      };

      setTasks(prev => prev.map(task => task.id === selectedTask.id ? updatedTask : task));
      setShowEditTaskModal(false);
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
      setTasks(prev => prev.filter(task => task.id !== taskId));
      showToast('Task deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting task:', error);
      showToast('Failed to delete task', 'error');
    }
  };

  const handleToggleTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              status: newStatus,
              completedAt: newStatus === 'completed' ? new Date() : task.completedAt
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
      assignedTo: task.assignedTo,
      dueDate: new Date(task.dueDate).toISOString().split('T')[0],
      tags: task.tags.join(', '),
      notes: task.notes,
      relatedToType: task.relatedTo?.type || '',
      relatedToId: task.relatedTo?.id || '',
      relatedToName: task.relatedTo?.name || ''
    });
    setShowEditTaskModal(true);
  };

  const createTestTasks = async () => {
    const testTasks: Task[] = [
      {
        id: '1',
        title: 'Follow up with Rahul Sharma',
        description: 'Call to discuss the Aura Wall Putty order and delivery timeline',
        status: 'pending',
        priority: 'high',
        category: 'follow_up',
        assignedTo: 'Sales Team',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        tags: ['customer', 'follow-up', 'sales'],
        notes: 'Customer showed interest in bulk order',
        relatedTo: { type: 'order', id: 'DTM001', name: 'Rahul Sharma' }
      },
      {
        id: '2',
        title: 'Prepare marketing campaign for Diwali',
        description: 'Create promotional materials and social media content for Diwali season',
        status: 'in_progress',
        priority: 'urgent',
        category: 'marketing',
        assignedTo: 'Marketing Team',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        tags: ['marketing', 'diwali', 'campaign'],
        notes: 'Focus on Aura Wall Putty and Dhunee Incense products'
      },
      {
        id: '3',
        title: 'Schedule delivery for Mumbai orders',
        description: 'Coordinate with logistics team for pending deliveries in Mumbai area',
        status: 'pending',
        priority: 'medium',
        category: 'delivery',
        assignedTo: 'Logistics Team',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        tags: ['delivery', 'mumbai', 'logistics'],
        notes: '5 orders pending delivery in Mumbai'
      },
      {
        id: '4',
        title: 'Customer support call - Anjali Desai',
        description: 'Address customer complaint about delayed delivery',
        status: 'completed',
        priority: 'high',
        category: 'support',
        assignedTo: 'Support Team',
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        tags: ['support', 'complaint', 'resolved'],
        notes: 'Issue resolved - delivery rescheduled for tomorrow',
        relatedTo: { type: 'customer', id: 'cust001', name: 'Anjali Desai' }
      },
      {
        id: '5',
        title: 'Team meeting - Weekly review',
        description: 'Weekly team meeting to review progress and plan next week',
        status: 'pending',
        priority: 'medium',
        category: 'meeting',
        assignedTo: 'All Teams',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        tags: ['meeting', 'weekly', 'review'],
        notes: 'Agenda: Sales review, marketing updates, delivery status'
      },
      {
        id: '6',
        title: 'Update product catalog',
        description: 'Add new product variants and update pricing information',
        status: 'overdue',
        priority: 'high',
        category: 'other',
        assignedTo: 'Admin Team',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        tags: ['catalog', 'products', 'pricing'],
        notes: 'New Aura Wall Putty variants need to be added'
      }
    ];

    setTasks(testTasks);
    showToast('Test tasks created successfully!', 'success');
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#D4AF37] shadow-sm h-16 flex items-center px-4 sm:px-6">
        {/* Mobile Menu Button */}
        <button 
          onClick={() => setSidebarOpen(true)}
          className="md:hidden p-2 rounded-lg bg-[#F5F2E8] text-[#8B7A1A] hover:bg-[#D4AF37] hover:text-white transition-colors mr-3"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-[#8B7A1A] bg-[#F5F2E8] hover:bg-[#D4AF37] hover:text-white transition-colors duration-200 mr-4">
                <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
              </Link>
        
        <div className="flex items-center gap-2 sm:gap-3 flex-1">
          <Mountain className="w-6 h-6 sm:w-8 sm:h-8 text-[#D4AF37]" />
          <h1 className="text-lg sm:text-2xl font-bold text-[#5E4E06]">Admin</h1>
              </div>
              
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden md:flex items-center gap-2 text-[#8B7A1A] font-medium">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-white font-semibold text-sm">
              {userProfile?.firstName?.[0]?.toUpperCase() || 'A'}
            </div>
            {userProfile?.firstName || 'Admin'}
          </span>
          <button onClick={handleLogout} className="p-2 rounded-lg bg-[#F5F2E8] text-[#8B7A1A] hover:bg-[#D4AF37] hover:text-white transition-colors" title="Logout">
            <LogOut className="w-4 h-4" />
              </button>
                </div>
      </nav>
      {/* Fixed layout below header */}
      <div className="fixed top-16 left-0 w-full h-[calc(100vh-4rem)] flex">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)}></div>
        )}
        
        {/* Sidebar */}
        <aside className={`fixed md:static z-40 left-0 top-16 w-80 md:w-60 h-[calc(100vh-4rem)] bg-gradient-to-br from-[#FFFBE6] to-[#F5F2E8] border-r-2 border-[#D4AF37] shadow-2xl flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between p-4 border-b border-[#D4AF37]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] flex items-center justify-center shadow-lg border-2 border-white">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-[#5E4E06] text-sm">{userProfile?.firstName || 'Admin'}</div>
                <div className="text-[#8B7A1A] text-xs">{userProfile?.email || 'admin@email.com'}</div>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-[#F5F2E8] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[#8B7A1A]" />
            </button>
          </div>
          
          {/* Desktop Profile Section */}
          <div className="hidden md:flex flex-col items-center pt-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] flex items-center justify-center shadow-lg border-4 border-white mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="text-center mb-8">
              <div className="font-black text-lg text-[#5E4E06]">{userProfile?.firstName || 'Admin'}</div>
              <div className="text-[#8B7A1A] text-xs mb-2">{userProfile?.email || 'admin@email.com'}</div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 w-full px-4 md:px-4">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false); // Close sidebar on mobile after selection
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 md:py-3 rounded-xl font-bold transition-all text-base md:text-lg cursor-pointer ${activeTab === item.id ? 'bg-gradient-to-r from-[#D4AF37]/30 to-[#8B7A1A]/10 text-[#5E4E06] shadow' : 'text-[#8B7A1A] hover:bg-[#F5F2E8] hover:text-[#5E4E06]'}`}
                  >
                    <item.icon className="w-5 h-5" /> 
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
                  className="w-full flex items-center gap-3 px-4 py-3 md:py-3 rounded-xl font-bold transition-all text-base md:text-lg text-[#8B7A1A] hover:bg-[#F5F2E8] hover:text-[#5E4E06] cursor-pointer"
                >
                  <LogOut className="w-5 h-5" /> 
                  <span className="flex-1 text-left">Logout</span>
                </button>
              </li>
            </ul>
          </nav>
          
          {/* Footer */}
          <div className="p-4 md:px-4 md:mb-6">
            <div className="text-xs text-[#8B7A1A] text-center">Desert to Mountains &copy; {new Date().getFullYear()}</div>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 w-full h-full overflow-y-auto relative z-10 bg-transparent p-3 sm:p-4 md:p-8">
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
                            <th className="px-6 py-3 text-left text-xs font-semibold text-[#8B7A1A] uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-[#8B7A1A] uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-[#8B7A1A] uppercase tracking-wider">Joined</th>
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
                              <td className="px-6 py-4 whitespace-nowrap text-[#5E4E06]">{customer.email}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-[#5E4E06]">{customer.phone || '-'}</td>
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
            {/* Task Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total Tasks</p>
                    <p className="text-2xl font-bold text-blue-900">{getTaskStats().total}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-700">Pending</p>
                    <p className="text-2xl font-bold text-yellow-900">{getTaskStats().pending}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">In Progress</p>
                    <p className="text-2xl font-bold text-blue-900">{getTaskStats().inProgress}</p>
                  </div>
                  <Activity className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Completed</p>
                    <p className="text-2xl font-bold text-green-900">{getTaskStats().completed}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-700">Overdue</p>
                    <p className="text-2xl font-bold text-red-900">{getTaskStats().overdue}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </div>

            {/* Task Controls */}
            <div className="bg-white rounded-xl border border-[#D4AF37] p-6 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#5E4E06] mb-2">Task Management</h2>
                  <p className="text-[#8B7A1A]">Manage and track all your business tasks</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={createTestTasks}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                  >
                    Create Test Tasks
                  </button>
                  <button
                    onClick={() => setShowAddTaskModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-lg hover:scale-105 transition-all duration-200 text-sm font-medium flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Task
                  </button>
                </div>
              </div>

              {/* Filters and Search */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[#5E4E06] mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#8B7A1A]" />
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      value={taskSearchQuery}
                      onChange={(e) => setTaskSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-[#D4AF37] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5E4E06] mb-2">Status</label>
                  <select
                    value={taskFilter}
                    onChange={(e) => setTaskFilter(e.target.value as any)}
                    className="w-full px-4 py-2 border border-[#D4AF37] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
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
                    className="w-full px-4 py-2 border border-[#D4AF37] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
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
                    className="w-full px-4 py-2 border border-[#D4AF37] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
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
              </div>

              {/* Sort Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-[#5E4E06]">Sort by:</label>
                  <select
                    value={taskSortBy}
                    onChange={(e) => setTaskSortBy(e.target.value as any)}
                    className="px-3 py-1 border border-[#D4AF37] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
                  >
                    <option value="dueDate">Due Date</option>
                    <option value="priority">Priority</option>
                    <option value="createdAt">Created Date</option>
                    <option value="title">Title</option>
                  </select>
                  <button
                    onClick={() => setTaskSortOrder(taskSortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2 hover:bg-[#F5F2E8] rounded-lg transition-colors"
                  >
                    {taskSortOrder === 'asc' ? <SortAsc className="w-4 h-4 text-[#8B7A1A]" /> : <SortDesc className="w-4 h-4 text-[#8B7A1A]" />}
                  </button>
                </div>
                <div className="text-sm text-[#8B7A1A]">
                  {getFilteredAndSortedTasks().length} tasks found
                </div>
              </div>

              {/* Task List */}
              <div className="space-y-4">
                {getFilteredAndSortedTasks().length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-[#5E4E06] mb-2">No tasks found</h3>
                    <p className="text-[#8B7A1A] mb-4">Create your first task to get started</p>
                    <button
                      onClick={() => setShowAddTaskModal(true)}
                      className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-lg hover:scale-105 transition-all duration-200"
                    >
                      Add First Task
                    </button>
                  </div>
                ) : (
                  getFilteredAndSortedTasks().map((task) => (
                    <div
                      key={task.id}
                      className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 ${
                        isTaskOverdue(task) ? 'border-red-200 bg-red-50' : 'border-[#D4AF37]'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(task.category)}`}>
                              <div className="flex items-center gap-1">
                                {getCategoryIcon(task.category)}
                                {task.category.replace('_', ' ')}
                              </div>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                              {task.status.replace('_', ' ')}
                            </div>
                            {isTaskOverdue(task) && (
                              <div className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                Overdue
                              </div>
                            )}
                          </div>
                          
                          <h3 className="font-semibold text-[#5E4E06] mb-1">{task.title}</h3>
                          <p className="text-sm text-[#8B7A1A] mb-3">{task.description}</p>
                          
                          <div className="flex flex-wrap items-center gap-4 text-xs text-[#8B7A1A] mb-3">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {task.assignedTo}
                            </div>
                            <div className="flex items-center gap-1">
                              <CalendarDays className="w-3 h-3" />
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                            {task.relatedTo && (
                              <div className="flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                {task.relatedTo.type}: {task.relatedTo.name}
                              </div>
                            )}
                          </div>
                          
                          {task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {task.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-[#F5F2E8] text-[#8B7A1A] rounded-full text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {task.notes && (
                            <p className="text-sm text-[#8B7A1A] italic">"{task.notes}"</p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          {task.status !== 'completed' && (
                            <button
                              onClick={() => handleToggleTaskStatus(task.id, 'completed')}
                              className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                              title="Mark as completed"
                            >
                              <CheckSquare className="w-4 h-4 text-green-600" />
                            </button>
                          )}
                          <button
                            onClick={() => openEditTaskModal(task)}
                            className="p-2 hover:bg-[#F5F2E8] rounded-lg transition-colors"
                            title="Edit task"
                          >
                            <Edit className="w-4 h-4 text-[#8B7A1A]" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete task"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
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

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8 border-b border-[#D4AF37]">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#5E4E06]">Add New Task</h3>
                  <p className="text-xs sm:text-sm text-[#8B7A1A]">Create a new task for your team</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddTaskModal(false)}
                className="p-2 sm:p-3 hover:bg-[#F5F2E8] rounded-lg sm:rounded-xl transition-colors duration-200"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#8B7A1A]" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitTask} className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
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
                    <label className="block text-sm font-semibold text-[#5E4E06] mb-2 sm:mb-3">Assigned To *</label>
                    <input
                      type="text"
                      name="assignedTo"
                      value={taskForm.assignedTo}
                      onChange={handleTaskInputChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] placeholder-[#8B7A1A] text-sm sm:text-base"
                      placeholder="e.g., Sales Team, John Doe"
                    />
                  </div>
                  <div className="md:col-span-2">
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

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-4 pt-8 border-t border-[#D4AF37]">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
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
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Create Task</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8 border-b border-[#D4AF37]">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <Edit className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#5E4E06]">Edit Task</h3>
                  <p className="text-xs sm:text-sm text-[#8B7A1A]">Update task information</p>
                </div>
              </div>
              <button 
                onClick={() => setShowEditTaskModal(false)}
                className="p-2 sm:p-3 hover:bg-[#F5F2E8] rounded-lg sm:rounded-xl transition-colors duration-200"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#8B7A1A]" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleUpdateTask} className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
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
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#5E4E06] mb-2 sm:mb-3">Assigned To *</label>
                    <input
                      type="text"
                      name="assignedTo"
                      value={taskForm.assignedTo}
                      onChange={handleTaskInputChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] placeholder-[#8B7A1A] text-sm sm:text-base"
                      placeholder="e.g., Sales Team, John Doe"
                    />
                  </div>
                  <div className="md:col-span-2">
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

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-4 pt-8 border-t border-[#D4AF37]">
                <button
                  type="button"
                  onClick={() => setShowEditTaskModal(false)}
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
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4" />
                      <span>Update Task</span>
                    </>
                  )}
                </button>
              </div>
            </form>
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