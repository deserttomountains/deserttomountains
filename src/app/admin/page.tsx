"use client";

import { User, Settings, LogOut, Bell, Menu, LayoutDashboard, BarChart3, Users, ShoppingCart, TrendingUp, DollarSign, Calendar, MessageSquare, Phone, UserPlus, Target, Activity, Plus, ArrowUpRight, MoreVertical, FileText, X, Edit, Trash2, Eye as EyeIcon, Search as SearchIcon, ArrowLeft, ArrowRight, Mountain } from 'lucide-react';
import MockChatCRM from './MockChatCRM';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { AuthService, auth, Lead, UserProfile } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js';
import CustomerDetailsDrawer from '@/components/CustomerDetailsDrawer';
import React from 'react';
import { useToast } from '@/components/ToastContext';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
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
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [isCustomersLoading, setIsCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'thisMonth' | 'last30' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<UserProfile | null>(null);
  const { showToast } = useToast();
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);
  const [pageSize] = useState(10);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [firstDocStack, setFirstDocStack] = useState<any[]>([]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // CRM Stats
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
    { name: 'Overview', id: 'overview', icon: BarChart3, badge: 'Live' },
    { name: 'Leads', id: 'leads', icon: UserPlus, badge: '12 New' },
    { name: 'Customers', id: 'customers', icon: Users },
    { name: 'Sales', id: 'sales', icon: Target, badge: '5 Active' },
    { name: 'Messages', id: 'messages', icon: MessageSquare, badge: '3 Unread' },
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
  let dateFilteredCustomers = customers;
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
    const checkAuthAndRole = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          router.push('/login');
          return;
        }
        const role = await AuthService.getUserRole(currentUser.uid);
        if (role !== 'admin') {
          router.push('/dashboard');
          return;
        }
        const profile = await AuthService.getUserProfile(currentUser.uid);
        setUserProfile(profile);
        setIsLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      }
    };
    checkAuthAndRole();
  }, [router]);

  // Load leads on component mount
  useEffect(() => {
    const loadLeads = async () => {
      try {
        const fetchedLeads = await AuthService.getLeads();
        setLeads(fetchedLeads);
      } catch (error) {
        console.error('Error loading leads:', error);
      }
    };

    if (!isLoading) {
      loadLeads();
    }
  }, [isLoading]);

  // Fetch customers after admin check
  useEffect(() => {
    if (!isLoading && userProfile) {
      loadCustomersPage('init');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, userProfile]);

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
      setCustomers(prev => prev.map(c => c.uid === updated.uid ? { ...c, ...updated } : c));
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
      setCustomers(prev => prev.filter(c => c.uid !== uid));
      setDrawerOpen(false);
      setSelectedCustomer(null);
      showToast('Customer deleted successfully', 'success');
    } catch (err) {
      showToast('Failed to delete customer', 'error');
    } finally {
      setIsSavingCustomer(false);
    }
  }

  // Firestore-powered pagination
  async function loadCustomersPage(direction: 'next' | 'prev' | 'init') {
    setIsCustomersLoading(true);
    try {
      if (direction === 'init') {
        const { customers, lastDoc } = await AuthService.getCustomersPaginated(pageSize);
        setCustomers(customers);
        setLastDoc(lastDoc);
        setFirstDocStack([]);
        setHasPrevPage(false);
        setHasNextPage(customers.length === pageSize);
        setCurrentPage(1);
      } else if (direction === 'next') {
        if (!lastDoc) return;
        setFirstDocStack(prev => [...prev, lastDoc]);
        const { customers, lastDoc: newLastDoc } = await AuthService.getCustomersPaginated(pageSize, lastDoc);
        setCustomers(customers);
        setLastDoc(newLastDoc);
        setHasPrevPage(true);
        setHasNextPage(customers.length === pageSize);
        setCurrentPage(prev => prev + 1);
      } else if (direction === 'prev') {
        if (firstDocStack.length === 0) return;
        const prevStack = [...firstDocStack];
        const prevCursor = prevStack.length > 1 ? prevStack[prevStack.length - 2] : null;
        prevStack.pop();
        const { customers, lastDoc: newLastDoc } = await AuthService.getCustomersPaginated(pageSize, prevCursor);
        setCustomers(customers);
        setLastDoc(newLastDoc);
        setFirstDocStack(prevStack);
        setHasPrevPage(prevStack.length > 0);
        setHasNextPage(customers.length === pageSize);
        setCurrentPage(prev => Math.max(1, prev - 1));
      }
    } catch (err) {
      showToast('Failed to load customers', 'error');
    } finally {
      setIsCustomersLoading(false);
    }
  }

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
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[#D4AF37] text-[#5E4E06]">
                        {item.badge}
                      </span>
                    )}
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
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B7A1A]" />
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
                  <Users className="w-12 h-12 text-[#D4AF37] mb-4" />
                  <div className="text-[#5E4E06] font-medium mb-2">No customers found</div>
                  <div className="text-[#8B7A1A] text-sm text-center">Try adjusting your search or filters</div>
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

                  {/* Pagination */}
                  <div className="border-t border-[#F5F2E8] px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-[#8B7A1A]">
                        {filteredCustomers.length} customers • Page {currentPage}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 rounded-lg text-[#8B7A1A] bg-[#F5F2E8] hover:bg-[#D4AF37] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => loadCustomersPage('prev')}
                          disabled={!hasPrevPage || isCustomersLoading}
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 rounded-lg text-[#8B7A1A] bg-[#F5F2E8] hover:bg-[#D4AF37] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => loadCustomersPage('next')}
                          disabled={!hasNextPage || isCustomersLoading}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
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
          <div className="bg-white rounded-xl sm:rounded-2xl border border-[#D4AF37] p-4 sm:p-6 lg:p-8 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-[#5E4E06] mb-4 sm:mb-6">Sales Pipeline</h2>
            <div className="text-center py-12 sm:py-16">
              <Target className="w-16 h-16 sm:w-20 sm:h-20 text-[#D4AF37] mx-auto mb-4 sm:mb-6" />
              <h3 className="text-lg sm:text-xl font-semibold text-[#5E4E06] mb-2 sm:mb-3">Sales Management Coming Soon</h3>
              <p className="text-sm sm:text-base text-[#8B7A1A] max-w-md mx-auto">Deal tracking, pipeline management, and sales forecasting will be implemented here.</p>
            </div>
          </div>
        )}

          {activeTab === 'messages' && <MockChatCRM />}

        {activeTab === 'tasks' && (
          <div className="bg-white rounded-xl sm:rounded-2xl border border-[#D4AF37] p-4 sm:p-6 lg:p-8 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-[#5E4E06] mb-4 sm:mb-6">Task Management</h2>
            <div className="text-center py-12 sm:py-16">
              <Calendar className="w-16 h-16 sm:w-20 sm:h-20 text-[#D4AF37] mx-auto mb-4 sm:mb-6" />
              <h3 className="text-lg sm:text-xl font-semibold text-[#5E4E06] mb-2 sm:mb-3">Task Management Coming Soon</h3>
              <p className="text-sm sm:text-base text-[#8B7A1A] max-w-md mx-auto">Follow-up tasks, reminders, and activity tracking will be implemented here.</p>
            </div>
          </div>
        )}
        </main>
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