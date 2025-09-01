'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar, Clock, Tag, User, CheckCircle, AlertCircle, Clock as ClockIcon, Calendar as CalendarIcon, Tag as TagIcon, User as UserIcon, Activity, TrendingUp, BarChart3, FileText, Settings, Repeat, X, Edit, Target, Flag, Truck, UserCheck, Phone, SortAsc, SortDesc, Download, Eye, Mail, Building, UserPlus, Users, MessageSquare } from 'lucide-react';
import { AuthService, auth, db, Lead } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, where, limit } from 'firebase/firestore';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/components/ToastContext';
import { useRouter } from 'next/navigation';
import AdminLayout from '../components/AdminLayout';

export default function FormSubmissionsPage() {
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
      router.push('/logout');
    } catch (error) {
      console.error('Error logging out:', error);
      // Still redirect to logout page even if there's an error
      router.push('/logout');
    }
  };

  return (
    <AdminLayout userProfile={userProfile} onLogout={handleLogout}>
      <FormSubmissionsPageContent />
    </AdminLayout>
  );
}

function FormSubmissionsPageContent() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // State
  const [activeFormTab, setActiveFormTab] = useState<'franchise' | 'contact'>('franchise');
  const [franchiseSubmissions, setFranchiseSubmissions] = useState<any[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<any[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(true);
  const [isLoadingContact, setIsLoadingContact] = useState(true);
  const [submissionsError, setSubmissionsError] = useState<string | null>(null);
  const [contactError, setContactError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  
  // Add Lead Modal State
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<{ isDuplicate: boolean; existingLead?: Lead; reason?: string } | null>(null);
  const [leadForm, setLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    countryCode: '+91',
    source: 'Website',
    status: 'New Lead' as Lead['status'],
    interest: 'Aura Natural Wall Plaster',
    notes: ''
  });
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState<'all' | 'today' | 'this_week' | 'this_month'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'email'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [submissionsPerPage] = useState(10);

  // Load form submissions on component mount
  useEffect(() => {
    if (user) {
      loadFranchiseSubmissions();
      loadContactSubmissions();
    }
  }, [user]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDateFilter, sortBy, sortOrder]);

  // Check for duplicate leads when email or phone changes
  useEffect(() => {
    const checkDuplicate = async () => {
      if (leadForm.email || leadForm.phone) {
        try {
          const duplicateCheck = await AuthService.checkDuplicateLead(leadForm.email, leadForm.phone);
          setDuplicateWarning(duplicateCheck);
        } catch (error) {
          console.error('Error checking duplicate:', error);
          setDuplicateWarning(null);
        }
      } else {
        setDuplicateWarning(null);
      }
    };

    const timeoutId = setTimeout(checkDuplicate, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [leadForm.email, leadForm.phone]);

  const loadFranchiseSubmissions = async () => {
    try {
      setIsLoadingSubmissions(true);
      setSubmissionsError(null);
      const querySnapshot = await getDocs(collection(db, 'franchiseApplications'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFranchiseSubmissions(data);
    } catch (err) {
      console.error('Error loading franchise submissions:', err);
      setSubmissionsError('Failed to fetch franchise submissions.');
      showToast('Error loading franchise submissions', 'error');
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  const loadContactSubmissions = async () => {
    try {
      setIsLoadingContact(true);
      setContactError(null);
      const querySnapshot = await getDocs(collection(db, 'contactFormSubmissions'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setContactSubmissions(data);
    } catch (err) {
      console.error('Error loading contact submissions:', err);
      setContactError('Failed to fetch contact form submissions.');
      showToast('Error loading contact submissions', 'error');
    } finally {
      setIsLoadingContact(false);
    }
  };

  // Filter and search submissions
  const getFilteredSubmissions = () => {
    const submissions = activeFormTab === 'franchise' ? franchiseSubmissions : contactSubmissions;
    let filtered = submissions;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(sub =>
        sub.name?.toLowerCase().includes(query) ||
        sub.email?.toLowerCase().includes(query) ||
        sub.phone?.toLowerCase().includes(query) ||
        sub.message?.toLowerCase().includes(query) ||
        (sub.subject && sub.subject.toLowerCase().includes(query)) ||
        (sub.city && sub.city.toLowerCase().includes(query)) ||
        (sub.state && sub.state.toLowerCase().includes(query))
      );
    }

    // Date filter
    if (selectedDateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeekStart = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000);
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      filtered = filtered.filter(sub => {
        try {
          let submissionDate: Date;
          if (sub.createdAt?.seconds) {
            submissionDate = new Date(sub.createdAt.seconds * 1000);
          } else if (sub.createdAt instanceof Date) {
            submissionDate = sub.createdAt;
          } else {
            submissionDate = new Date(sub.createdAt);
          }

          switch (selectedDateFilter) {
            case 'today':
              return submissionDate >= today;
            case 'this_week':
              return submissionDate >= thisWeekStart;
            case 'this_month':
              return submissionDate >= thisMonthStart;
            default:
              return true;
          }
        } catch {
          return false;
        }
      });
    }

    // Sort submissions
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'date':
          try {
            aValue = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(a.createdAt);
            bValue = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(b.createdAt);
          } catch {
            return 0;
          }
          break;
        case 'name':
          aValue = (a.name || '').toLowerCase();
          bValue = (b.name || '').toLowerCase();
          break;
        case 'email':
          aValue = (a.email || '').toLowerCase();
          bValue = (b.email || '').toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  // Pagination
  const filteredSubmissions = getFilteredSubmissions();
  const totalPages = Math.ceil(filteredSubmissions.length / submissionsPerPage);
  const startIndex = (currentPage - 1) * submissionsPerPage;
  const paginatedSubmissions = filteredSubmissions.slice(startIndex, startIndex + submissionsPerPage);

  // Helper functions
  const formatShortDateTime = (date: Date) => {
    if (!date) return 'N/A';
    try {
      const d = date.getDate().toString().padStart(2, '0');
      const m = (date.getMonth() + 1).toString().padStart(2, '0');
      const y = date.getFullYear();
      const hh = date.getHours().toString().padStart(2, '0');
      const mm = date.getMinutes().toString().padStart(2, '0');
      return `${d}/${m}/${y} ${hh}:${mm}`;
    } catch {
      return 'N/A';
    }
  };

  const handleExportData = () => {
    const submissions = activeFormTab === 'franchise' ? franchiseSubmissions : contactSubmissions;
    const csvContent = generateCSV(submissions);
    downloadCSV(csvContent, `${activeFormTab}_submissions_${new Date().toISOString().split('T')[0]}.csv`);
    showToast('Data exported successfully', 'success');
  };

  const generateCSV = (submissions: any[]) => {
    const headers = activeFormTab === 'franchise' 
      ? ['Name', 'Email', 'Phone', 'City', 'State', 'Message', 'Date']
      : ['Name', 'Email', 'Phone', 'Subject', 'Message', 'Date'];
    
    const rows = submissions.map(sub => {
      const date = sub.createdAt?.seconds 
        ? formatShortDateTime(new Date(sub.createdAt.seconds * 1000))
        : formatShortDateTime(new Date(sub.createdAt));
      
      if (activeFormTab === 'franchise') {
        return [sub.name, sub.email, sub.phone, sub.city, sub.state, sub.message, date];
      } else {
        return [sub.name, sub.email, sub.phone, sub.subject, sub.message, date];
      }
    });

    return [headers, ...rows].map(row => 
      row.map(field => `"${(field || '').toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Add to Lead functionality
  const handleAddToLead = (submissionData: any) => {
    // Pre-fill the lead form with submission data
    setLeadForm({
      name: submissionData.name || '',
      email: submissionData.email || '',
      phone: submissionData.phone || '',
      countryCode: '+91', // Default to India
      source: 'Website', // Default as requested
      status: 'New Lead',
      interest: 'Aura Natural Wall Plaster', // Default as requested
      notes: submissionData.type === 'contact' 
        ? `Contact form submission - Subject: ${submissionData.subject || 'N/A'}\n\nMessage: ${submissionData.message || ''}`
        : `Franchise application from ${submissionData.city || ''}, ${submissionData.state || ''}\n\nMessage: ${submissionData.message || ''}`
    });
    
    // Close the view modal and open the add lead modal
    setModalOpen(false);
    setShowAddLeadModal(true);
    setSubmitError(null);
    setDuplicateWarning(null);
  };

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
        countryCode: leadForm.countryCode,
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
        countryCode: '+91',
        source: 'Website',
        status: 'New Lead',
        interest: 'Aura Natural Wall Plaster',
        notes: ''
      });
      setShowAddLeadModal(false);
      setDuplicateWarning(null);

      showToast('Lead created successfully!', 'success');

    } catch (error) {
      console.error('Error creating lead:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to create lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-[#8B7A1A]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="bg-white rounded-xl border border-[#D4AF37] p-4 sm:p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#D4AF37] rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#5E4E06]">Form Submissions</h2>
              <p className="text-[#8B7A1A] text-xs sm:text-sm">Review contact and franchise applications</p>
            </div>
          </div>
          <button 
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-lg hover:scale-105 transition-all duration-200 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 shadow-sm border text-base sm:text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E6C866] ${
            activeFormTab === 'franchise' 
              ? 'bg-[#E6C866] text-[#5E4E06] border-[#E6C866] scale-105' 
              : 'bg-white text-gray-500 border-gray-200 hover:bg-[#F5F2E8] hover:text-[#5E4E06]'
          }`}
          onClick={() => setActiveFormTab('franchise')}
        >
          <Building className="w-4 h-4 inline mr-2" />
          Franchise Applications
        </button>
        <button
          className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 shadow-sm border text-base sm:text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E6C866] ${
            activeFormTab === 'contact' 
              ? 'bg-[#E6C866] text-[#5E4E06] border-[#E6C866] scale-105' 
              : 'bg-white text-gray-500 border-gray-200 hover:bg-[#F5F2E8] hover:text-[#5E4E06]'
          }`}
          onClick={() => setActiveFormTab('contact')}
        >
          <Mail className="w-4 h-4 inline mr-2" />
          Contact Us Submissions
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 sm:p-6 mb-6 shadow-sm border border-[#F5F2E8]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-[#5E4E06] mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#8B7A1A]" />
              <input
                type="text"
                placeholder="Search submissions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#5E4E06] mb-2">Date Range</label>
            <select
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value as 'all' | 'today' | 'this_week' | 'this_month')}
              className="w-full px-4 py-2 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#5E4E06] mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'email')}
              className="w-full px-4 py-2 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#5E4E06] mb-2">Sort Order</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 hover:bg-[#F5F2E8] rounded-lg transition-colors"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4 text-[#8B7A1A]" /> : <SortDesc className="w-4 h-4 text-[#8B7A1A]" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Filter Summary */}
        <div className="flex items-center gap-2 text-sm text-[#8B7A1A]">
          <Filter className="w-4 h-4" />
          <span>
            {filteredSubmissions.length} of {(activeFormTab === 'franchise' ? franchiseSubmissions : contactSubmissions).length} submissions
            {selectedDateFilter !== 'all' && ` • Date: ${selectedDateFilter.replace('_', ' ')}`}
            {searchQuery && ` • Search: "${searchQuery}"`}
          </span>
        </div>
      </div>

      {/* Content */}
      {activeFormTab === 'franchise' && (
        <>
          {isLoadingSubmissions ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
              <p className="text-[#8B7A1A]">Loading franchise submissions...</p>
            </div>
          ) : submissionsError ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 text-lg">{submissionsError}</p>
            </div>
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
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12">
                        <div className="text-center">
                          <FileText className="w-16 h-16 text-[#D4AF37] mx-auto mb-4 opacity-60" />
                          <h3 className="text-lg font-semibold text-[#5E4E06] mb-2">No submissions found</h3>
                          <p className="text-[#8B7A1A] text-sm">
                            {searchQuery || selectedDateFilter !== 'all'
                              ? 'Try adjusting your filters or search terms'
                              : 'No franchise applications have been submitted yet'
                            }
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedSubmissions.map((sub, idx) => (
                    <tr key={sub.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#F8F6F0] hover:bg-[#F5F2E8]'}>
                      <td className="px-4 py-3 font-medium">{sub.name}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">{sub.email}</td>
                      <td className="px-4 py-3 hidden md:table-cell">{sub.phone}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">{sub.city}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">{sub.state}</td>
                      <td className="px-4 py-3 max-w-xs truncate hidden xl:table-cell" title={sub.message}>{sub.message}</td>
                      <td className="px-4 py-3">
                        {sub.createdAt && (sub.createdAt.seconds 
                          ? formatShortDateTime(new Date(sub.createdAt.seconds * 1000)) 
                          : formatShortDateTime(new Date(sub.createdAt))
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          className="px-3 py-1 rounded-full bg-[#E6C866] text-[#5E4E06] font-semibold shadow hover:bg-[#F5F2E8] transition text-xs sm:text-sm cursor-pointer flex items-center gap-1"
                          onClick={() => { setModalData({ ...sub, type: 'franchise' }); setModalOpen(true); }}
                        >
                          <Eye className="w-3 h-3" />
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
          {isLoadingContact ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
              <p className="text-[#8B7A1A]">Loading contact submissions...</p>
            </div>
          ) : contactError ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 text-lg">{contactError}</p>
            </div>
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
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12">
                        <div className="text-center">
                          <Mail className="w-16 h-16 text-[#D4AF37] mx-auto mb-4 opacity-60" />
                          <h3 className="text-lg font-semibold text-[#5E4E06] mb-2">No submissions found</h3>
                          <p className="text-[#8B7A1A] text-sm">
                            {searchQuery || selectedDateFilter !== 'all'
                              ? 'Try adjusting your filters or search terms'
                              : 'No contact form submissions have been received yet'
                            }
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedSubmissions.map((sub, idx) => (
                    <tr key={sub.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#F8F6F0] hover:bg-[#F5F2E8]'}>
                      <td className="px-4 py-3 font-medium">{sub.name}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">{sub.email}</td>
                      <td className="px-4 py-3 hidden md:table-cell">{sub.phone}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">{sub.subject}</td>
                      <td className="px-4 py-3 max-w-xs truncate hidden xl:table-cell" title={sub.message}>{sub.message}</td>
                      <td className="px-4 py-3">
                        {sub.createdAt && (sub.createdAt.seconds 
                          ? formatShortDateTime(new Date(sub.createdAt.seconds * 1000)) 
                          : formatShortDateTime(new Date(sub.createdAt))
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          className="px-3 py-1 rounded-full bg-[#E6C866] text-[#5E4E06] font-semibold shadow hover:bg-[#F5F2E8] transition text-xs sm:text-sm cursor-pointer flex items-center gap-1"
                          onClick={() => { setModalData({ ...sub, type: 'contact' }); setModalOpen(true); }}
                        >
                          <Eye className="w-3 h-3" />
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-[#8B7A1A]">
            Showing {startIndex + 1} to {Math.min(startIndex + submissionsPerPage, filteredSubmissions.length)} of {filteredSubmissions.length} submissions
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-[#5E4E06] bg-white border border-[#D4AF37] rounded-lg hover:bg-[#F5F2E8] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                    currentPage === page
                      ? 'bg-[#D4AF37] text-white'
                      : 'text-[#5E4E06] bg-white border border-[#D4AF37] hover:bg-[#F5F2E8]'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-[#5E4E06] bg-white border border-[#D4AF37] rounded-lg hover:bg-[#F5F2E8] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
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
            <h3 className="text-xl font-bold mb-4 text-[#5E4E06]">
              {modalData.type === 'franchise' ? 'Franchise Application' : 'Contact Us Submission'}
            </h3>
            <div className="space-y-2 text-[#2A2418]">
              <div><span className="font-semibold">Name:</span> {modalData.name}</div>
              <div><span className="font-semibold">Email:</span> {modalData.email}</div>
              <div><span className="font-semibold">Phone:</span> {modalData.phone}</div>
              {modalData.type === 'franchise' && (
                <>
                  <div><span className="font-semibold">City:</span> {modalData.city}</div>
                  <div><span className="font-semibold">State:</span> {modalData.state}</div>
                </>
              )}
              {modalData.type === 'contact' && (
                <div><span className="font-semibold">Subject:</span> {modalData.subject}</div>
              )}
              <div>
                <span className="font-semibold">Date:</span> 
                {modalData.createdAt && (modalData.createdAt.seconds 
                  ? formatShortDateTime(new Date(modalData.createdAt.seconds * 1000)) 
                  : formatShortDateTime(new Date(modalData.createdAt))
                )}
              </div>
              <div className="pt-4">
                <span className="font-semibold">Message:</span>
                <div className="mt-2 p-3 bg-[#F8F6F0] rounded-lg text-[#5E4E06] whitespace-pre-line break-words max-h-72 overflow-y-auto border border-[#E6C866]">
                  {modalData.message}
                </div>
              </div>
              
              {/* Add to Lead Button - Show for both contact and franchise submissions */}
              <div className="pt-4 border-t border-[#E6C866] mt-4">
                <button
                  onClick={() => handleAddToLead(modalData)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-xl hover:scale-105 transition-all duration-200 cursor-pointer font-semibold shadow-lg"
                >
                  <UserPlus className="w-5 h-5" />
                  Add to Lead
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddLeadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-2 pt-16 sm:pt-4 sm:items-center sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg sm:max-w-2xl max-h-[calc(100vh-4rem)] sm:max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header - Fixed Top */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#D4AF37] bg-gradient-to-r from-[#F5F2E8] to-[#F0EAD6]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-xl flex items-center justify-center flex-shrink-0">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-[#5E4E06] truncate">Add New Lead</h3>
                  <p className="text-xs sm:text-sm text-[#8B7A1A] truncate">Convert submission to lead</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowAddLeadModal(false);
                  setLeadForm({
                    name: '',
                    email: '',
                    phone: '',
                    countryCode: '+91',
                    source: 'Website',
                    status: 'New Lead',
                    interest: 'Aura Natural Wall Plaster',
                    notes: ''
                  });
                  setSubmitError(null);
                  setDuplicateWarning(null);
                }}
                className="p-2 hover:bg-[#E6DCC0] rounded-lg transition-colors duration-200 flex-shrink-0 touch-manipulation"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-[#8B7A1A]" />
              </button>
            </div>

            {/* Modal Body - Scrollable Content */}
            <form onSubmit={handleSubmitLead} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
              {/* Error Display */}
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                    <p className="text-red-700 text-sm font-medium">{submitError}</p>
                  </div>
                </div>
              )}

              {/* Duplicate Warning */}
              {duplicateWarning && duplicateWarning.isDuplicate && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0" />
                    <p className="text-yellow-700 text-sm font-medium">{duplicateWarning.reason}</p>
                  </div>
                </div>
              )}

              {/* Personal Information Section */}
              <div className="space-y-4">
                <h4 className="text-base sm:text-lg font-semibold text-[#5E4E06] flex items-center">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-[#D4AF37] flex-shrink-0" />
                  <span>Personal Information</span>
                </h4>
                
                {/* Name Field - Full Width */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#5E4E06]">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={leadForm.name}
                    onChange={(e) => setLeadForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full px-4 py-3 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] placeholder-[#8B7A1A] text-base touch-manipulation"
                    placeholder="Enter full name"
                    autoComplete="name"
                  />
                </div>

                {/* Phone Field - Full Width with Country Code */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#5E4E06]">Phone</label>
                  <div className="flex gap-2 w-full">
                    <select
                      value={leadForm.countryCode}
                      onChange={(e) => setLeadForm(prev => ({ ...prev, countryCode: e.target.value }))}
                      className="px-4 py-3 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] text-base touch-manipulation cursor-pointer appearance-none bg-white flex-shrink-0"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23D4AF37' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.75rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em',
                        paddingRight: '2.5rem',
                        minWidth: 'fit-content'
                      }}
                    >
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+61">🇦🇺 +61</option>
                      <option value="+86">🇨🇳 +86</option>
                      <option value="+81">🇯🇵 +81</option>
                      <option value="+49">🇩🇪 +49</option>
                      <option value="+33">🇫🇷 +33</option>
                      <option value="+39">🇮🇹 +39</option>
                      <option value="+34">🇪🇸 +34</option>
                      <option value="+971">🇦🇪 +971</option>
                      <option value="+966">🇸🇦 +966</option>
                      <option value="+65">🇸🇬 +65</option>
                      <option value="+60">🇲🇾 +60</option>
                      <option value="+66">🇹🇭 +66</option>
                    </select>
                    <input
                      type="tel"
                      value={leadForm.phone}
                      onChange={(e) => setLeadForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="flex-1 min-w-0 px-4 py-3 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] placeholder-[#8B7A1A] text-base touch-manipulation"
                      placeholder="Enter phone number"
                      autoComplete="tel"
                      inputMode="numeric"
                    />
                  </div>
                </div>

                {/* Email Field - Full Width */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#5E4E06]">Email</label>
                  <input
                    type="email"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] placeholder-[#8B7A1A] text-base touch-manipulation"
                    placeholder="Enter email address"
                    autoComplete="email"
                    inputMode="email"
                  />
                </div>
              </div>

              {/* Lead Details Section */}
              <div className="space-y-4">
                <h4 className="text-base sm:text-lg font-semibold text-[#5E4E06] flex items-center">
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-[#D4AF37] flex-shrink-0" />
                  <span>Lead Details</span>
                </h4>
                
                {/* Lead Source */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#5E4E06]">
                    Lead Source <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={leadForm.source}
                    onChange={(e) => setLeadForm(prev => ({ ...prev, source: e.target.value }))}
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

                {/* Status */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#5E4E06]">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={leadForm.status}
                    onChange={(e) => setLeadForm(prev => ({ ...prev, status: e.target.value }))}
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
                    <option value="New Lead" className="text-[#5E4E06]">New Lead</option>
                    <option value="Contacted" className="text-[#5E4E06]">Contacted</option>
                    <option value="Qualified" className="text-[#5E4E06]">Qualified</option>
                    <option value="Proposal Sent" className="text-[#5E4E06]">Proposal Sent</option>
                    <option value="Negotiation" className="text-[#5E4E06]">Negotiation</option>
                    <option value="Closed Won" className="text-[#5E4E06]">Closed Won</option>
                    <option value="Closed Lost" className="text-[#5E4E06]">Closed Lost</option>
                  </select>
                </div>

                {/* Product Interest */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#5E4E06]">
                    Product Interest <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={leadForm.interest}
                    onChange={(e) => setLeadForm(prev => ({ ...prev, interest: e.target.value }))}
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
                    <option value="" className="text-[#8B7A1A]">Select product</option>
                    <option value="Aura Natural Wall Plaster" className="text-[#5E4E06]">Aura Natural Wall Plaster</option>
                    <option value="Dhunee" className="text-[#5E4E06]">Dhunee</option>
                    <option value="Both Products" className="text-[#5E4E06]">Both Products</option>
                    <option value="Other" className="text-[#5E4E06]">Other</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#5E4E06]">Notes</label>
                  <textarea
                    value={leadForm.notes}
                    onChange={(e) => setLeadForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] placeholder-[#8B7A1A] text-base touch-manipulation resize-none"
                    placeholder="Additional notes about the lead..."
                  />
                </div>
              </div>

              {/* Modal Footer - Fixed Bottom */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-[#E6DCC0]">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddLeadModal(false);
                    setLeadForm({
                      name: '',
                      email: '',
                      phone: '',
                      countryCode: '+91',
                      source: 'Website',
                      status: 'New Lead',
                      interest: 'Aura Natural Wall Plaster',
                      notes: ''
                    });
                    setSubmitError(null);
                    setDuplicateWarning(null);
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors duration-200 cursor-pointer touch-manipulation"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || (duplicateWarning?.isDuplicate ?? false)}
                  className="w-full sm:flex-1 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-xl font-semibold hover:scale-105 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 touch-manipulation flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Lead...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Create Lead
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
