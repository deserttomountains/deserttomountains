'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter, Calendar, Clock, Tag, User, CheckCircle, AlertCircle, Clock as ClockIcon, Calendar as CalendarIcon, Tag as TagIcon, User as UserIcon, Activity, TrendingUp, BarChart3, FileText, Settings, Repeat, X, Edit, Target, Flag, Truck, UserCheck, Phone, SortAsc, SortDesc, Download, Eye, Mail, Building, UserPlus, ArrowUpRight, ArrowRight, MoreVertical, DollarSign } from 'lucide-react';
import { AuthService, auth, db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, where, limit } from 'firebase/firestore';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/components/ToastContext';
import { useRouter } from 'next/navigation';
import AdminLayout from './components/AdminLayout';
import { Lead, Quote, Order, Task } from '@/lib/firebase';

export default function AdminDashboard() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const router = useRouter();

  // Load user profile
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

    loadUserProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await AuthService.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AdminLayout userProfile={userProfile} onLogout={handleLogout}>
      <OverviewPageContent />
    </AdminLayout>
  );
}

function OverviewPageContent() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  
  // State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openLeadDropdown, setOpenLeadDropdown] = useState<string | null>(null);
  
  // Add Lead Modal State
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<{ isDuplicate: boolean; existingLead?: Lead; reason?: string } | null>(null);
  const [leadForm, setLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    source: '',
    status: 'New Lead' as Lead['status'],
    interest: '',
    notes: ''
  });

  // Direct Call Modal State
  const [showDirectCallModal, setShowDirectCallModal] = useState(false);
  const [leadSearchTerm, setLeadSearchTerm] = useState('');
  const [leadFilterStatus, setLeadFilterStatus] = useState<string>('all');
  const [currentLeadPage, setCurrentLeadPage] = useState(1);
  const [modalLeadsPerPage, setModalLeadsPerPage] = useState(10);
  const [selectedLeadForCall, setSelectedLeadForCall] = useState<Lead | null>(null);

  // Load data on component mount
  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [fetchedLeads, fetchedQuotes, fetchedOrders, fetchedTasks] = await Promise.all([
        AuthService.getLeads(),
        AuthService.getQuotes(),
        AuthService.getOrders(),
        AuthService.getTasks()
      ]);
      
      setLeads(fetchedLeads);
      setQuotes(fetchedQuotes);
      setOrders(fetchedOrders);
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showToast('Error loading dashboard data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const getDateFromAny = (date: any): Date | null => {
    if (!date) return null;
    if (date instanceof Date) return date;
    if (typeof date === 'object' && date.toDate) return date.toDate();
    try {
      return new Date(date);
    } catch {
      return null;
    }
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
  const calculateRevenue = (leadsList: Lead[]) => {
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

  // Handle recent lead actions
  const handleRecentLeadAction = (action: string, lead: Lead) => {
    switch (action) {
      case 'edit':
        showToast('Edit lead functionality - navigate to leads tab', 'info');
        break;
      case 'call':
        if (lead.phone) {
          window.open(`tel:${lead.phone}`, '_blank');
          showToast('Opening phone dialer...', 'success');
        }
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete ${lead.name}?`)) {
          // Handle delete
          showToast('Delete functionality - navigate to leads tab', 'info');
        }
        break;
      default:
        break;
    }
    setOpenLeadDropdown(null);
  };

  // Handle create quote
  const handleCreateQuote = (lead?: Lead) => {
    if (lead) {
      // If called from a specific lead, navigate to quotes with lead data
      router.push(`/admin/quotes?leadId=${lead.id}&leadName=${encodeURIComponent(lead.name)}`);
    } else {
      // General quote creation, navigate to quotes tab
      router.push('/admin/quotes');
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

  // Handle direct call - open phone dialer with selected lead
  const handleDirectCall = (lead: Lead) => {
    if (lead.phone) {
      window.open(`tel:${lead.phone}`, '_blank');
      showToast(`Calling ${lead.name}...`, 'success');
    } else {
      showToast('No phone number available for this lead', 'error');
    }
  };

  // Lead form handling functions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLeadForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear duplicate warning when user changes email or phone
    if (name === 'email' || name === 'phone') {
      setDuplicateWarning(null);
    }
  };

  // Check for duplicate leads as user types
  const checkForDuplicates = async (email?: string, phone?: string) => {
    if (!email && !phone) {
      setDuplicateWarning(null);
      return;
    }

    try {
      const duplicateCheck = await AuthService.checkDuplicateLead(email, phone);
      setDuplicateWarning(duplicateCheck);
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      setDuplicateWarning(null);
    }
  };

  // Debounced duplicate check
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (leadForm.email || leadForm.phone) {
        checkForDuplicates(leadForm.email, leadForm.phone);
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [leadForm.email, leadForm.phone]);

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setDuplicateWarning(null);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Check for duplicates one more time before submission
      if (leadForm.email || leadForm.phone) {
        const duplicateCheck = await AuthService.checkDuplicateLead(leadForm.email, leadForm.phone);
        if (duplicateCheck.isDuplicate) {
          setDuplicateWarning(duplicateCheck);
          setSubmitError(`Cannot create lead: ${duplicateCheck.reason}`);
          setIsSubmitting(false);
          return;
        }
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
      setDuplicateWarning(null);

      // Reload leads
      const updatedLeads = await AuthService.getLeads();
      setLeads(updatedLeads);

      showToast('Lead created successfully!', 'success');

    } catch (error) {
      console.error('Error creating lead:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to create lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-[#8B7A1A]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
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
        {/* Recent Sales */}
        <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl border border-[#D4AF37] p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-[#5E4E06]">Recent Sales</h3>
            <button 
              onClick={() => router.push('/admin/sales')}
              className="flex items-center justify-center sm:justify-start space-x-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-lg sm:rounded-xl hover:scale-105 transition-all duration-200 text-sm sm:text-base cursor-pointer"
            >
              <Target className="w-4 h-4" />
              <span>View All Sales</span>
            </button>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <Target className="w-10 h-10 sm:w-12 sm:h-12 text-[#D4AF37] mx-auto mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-[#8B7A1A]">No sales yet. Orders will appear here!</p>
              </div>
            ) : (
              orders.slice(0, 3).map((order) => (
                <div key={order.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-[#FFFBE6] rounded-lg sm:rounded-xl border border-[#D4AF37] space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-lg sm:rounded-xl flex items-center justify-center">
                      <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#5E4E06] text-sm sm:text-base">Order #{order.orderId}</p>
                      <p className="text-xs sm:text-sm text-[#8B7A1A]">{order.customerName}</p>
                      <p className="text-xs text-[#8B7A1A]">
                        {order.orderDate instanceof Date 
                          ? order.orderDate.toLocaleDateString() 
                          : getDateFromAny(order.orderDate)?.toLocaleDateString() || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end space-x-2">
                    <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-[#D4AF37] text-[#5E4E06]">
                      {order.status}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-[#5E4E06]">
                      {formatCurrency(order.finalAmount)}
                    </span>
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
              onClick={() => router.push('/admin/leads')}
              className="w-full flex items-center space-x-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#FFFBE6] to-[#F5F2E8] border border-[#D4AF37] hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#8B7A1A] to-[#5E4E06] rounded-lg sm:rounded-xl flex items-center justify-center">
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-[#5E4E06] text-sm sm:text-base">View All Leads</p>
                <p className="text-xs sm:text-sm text-[#8B7A1A]">Manage your lead pipeline</p>
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

      {/* Add Lead Modal */}
      {showAddLeadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 pt-20 sm:pt-4">
          <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[calc(100vh-5rem)] sm:max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8 border-b border-[#D4AF37]">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <UserPlus className="w-5 h-5 sm:w-6 sm:w-6 text-white" />
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
                  <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-[#D4AF37]" />
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
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:border-transparent text-sm sm:text-base ${
                        duplicateWarning?.isDuplicate && duplicateWarning.reason?.includes('phone')
                          ? 'border-red-300 focus:ring-red-300 text-red-600 placeholder-red-400'
                          : 'border-[#D4AF37] focus:ring-[#D4AF37] text-[#5E4E06] placeholder-[#8B7A1A]'
                      }`}
                      placeholder="Enter phone number"
                    />
                    {duplicateWarning?.isDuplicate && duplicateWarning.reason?.includes('phone') && (
                      <p className="text-xs text-red-600 mt-1">Phone number already exists</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#5E4E06] mb-2 sm:mb-3">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={leadForm.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:border-transparent text-sm sm:text-base ${
                        duplicateWarning?.isDuplicate && duplicateWarning.reason?.includes('email')
                          ? 'border-red-300 focus:ring-red-300 text-red-600 placeholder-red-400'
                          : 'border-[#D4AF37] focus:ring-[#D4AF37] text-[#5E4E06] placeholder-[#8B7A1A]'
                      }`}
                      placeholder="Enter email address"
                    />
                    {duplicateWarning?.isDuplicate && duplicateWarning.reason?.includes('email') && (
                      <p className="text-xs text-red-600 mt-1">Email already exists</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Lead Details */}
              <div>
                <h4 className="text-lg sm:text-xl font-semibold text-[#5E4E06] mb-4 sm:mb-6 flex items-center">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-[#D4AF37]" />
                  Lead Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#5E4E06] mb-2 sm:mb-3">Source *</label>
                    <select
                      name="source"
                      value={leadForm.source}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06]"
                    >
                      <option value="">Select source</option>
                      <option value="Website">Website</option>
                      <option value="Referral">Referral</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Cold Call">Cold Call</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#5E4E06] mb-2 sm:mb-3">Status *</label>
                    <select
                      name="status"
                      value={leadForm.status}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06]"
                    >
                      <option value="New Lead">New Lead</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Proposal Sent">Proposal Sent</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="Closed Won">Closed Won</option>
                      <option value="Closed Lost">Closed Lost</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-[#5E4E06] mb-2 sm:mb-3">Interest *</label>
                    <select
                      name="interest"
                      value={leadForm.interest}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06]"
                    >
                      <option value="">Select interest</option>
                      <option value="Aura Natural Wall Plaster">Aura Natural Wall Plaster</option>
                      <option value="Aura Pigmented Wall Plaster">Aura Pigmented Wall Plaster</option>
                      <option value="Dhunee Organic Incense">Dhunee Organic Incense</option>
                      <option value="Franchise Opportunity">Franchise Opportunity</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-[#5E4E06] mb-2 sm:mb-3">Notes</label>
                    <textarea
                      name="notes"
                      value={leadForm.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] placeholder-[#8B7A1A] text-sm sm:text-base resize-none"
                      placeholder="Add any additional notes or context"
                    />
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{submitError}</p>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-4 pt-8 border-t border-[#D4AF37]">
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
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Create Lead</span>
                    </>
                  )}
                </button>
              </div>
            </form>
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
                      <Search className="h-5 w-5 text-[#8B7A1A]" />
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
                        <UserPlus className="w-8 h-8 text-gray-400" />
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
    </div>
  );
} 
