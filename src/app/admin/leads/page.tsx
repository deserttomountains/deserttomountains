"use client";

import { useState, useEffect } from 'react';
import { AuthService, auth, Lead } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastContext';
import { AdminRouteGuard } from '@/components/RouteGuard';
import AdminLayout from '../components/AdminLayout';
import { Plus, Search, Edit, Trash2, UserPlus, X, Repeat, Filter, Users, MessageSquare } from 'lucide-react';

function LeadsPageContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [leadsPerPage, setLeadsPerPage] = useState(10);
  
  // Filtered leads based on search and status
  const filteredLeads = leads.filter(lead => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      lead.phone.includes(searchTerm) ||
      (lead.countryCode && lead.countryCode.includes(searchTerm)) ||
      (lead.interest && lead.interest.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Status filter
    if (selectedStatusFilter !== 'All' && lead.status !== selectedStatusFilter) {
      return false;
    }
    
    return matchesSearch;
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
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showEditLeadModal, setShowEditLeadModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const [leadForm, setLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    countryCode: '+91',
    source: '',
    status: 'New Lead',
    interest: '',
    notes: ''
  });

  const router = useRouter();
  const { showToast } = useToast();

  // Load user profile and leads data
  useEffect(() => {
    const loadData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const profile = await AuthService.getUserProfile(user.uid);
          setUserProfile(profile);
        }
        
        const leadsData = await AuthService.getLeads();
        setLeads(leadsData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        showToast('Failed to load leads', 'error');
        setIsLoading(false);
      }
    };

    loadData();
  }, [showToast]);

  const handleLogout = async () => {
    try {
      await AuthService.signOut();
      router.push('/login');
      showToast('Logged out successfully', 'success');
    } catch (error) {
      console.error('Error logging out:', error);
      showToast('Error logging out', 'error');
    }
  };

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      await AuthService.createLead({ ...leadForm, createdBy: currentUser.uid }, currentUser.uid);
      
      // Refresh leads
      const updatedLeads = await AuthService.getLeads();
      setLeads(updatedLeads);
      
      setShowAddLeadModal(false);
             setLeadForm({
         name: '',
         email: '',
         phone: '',
         countryCode: '+91',
         source: '',
         status: 'New Lead',
         interest: '',
         notes: ''
       });
      showToast('Lead created successfully', 'success');
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to create lead');
      showToast('Failed to create lead', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead?.id) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await AuthService.updateLead(editingLead.id, leadForm);
      
      // Update local state
      setLeads(prev => prev.map(lead => 
        lead.id === editingLead.id 
          ? { ...lead, ...leadForm, updatedAt: new Date() }
          : lead
      ));
      
      setShowEditLeadModal(false);
      setEditingLead(null);
      showToast('Lead updated successfully', 'success');
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to update lead');
      showToast('Failed to update lead', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLead = async (lead: Lead) => {
    if (!lead.id) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete the lead "${lead.name}"?\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      await AuthService.deleteLead(lead.id);
      setLeads(prev => prev.filter(l => l.id !== lead.id));
      showToast('Lead deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting lead:', error);
      showToast('Failed to delete lead', 'error');
    }
  };

  const handleRefreshLeads = async () => {
    try {
      const updatedLeads = await AuthService.getLeads();
      setLeads(updatedLeads);
      showToast('Leads refreshed successfully!', 'success');
    } catch (error) {
      showToast('Failed to refresh leads', 'error');
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
                onClick={handleRefreshLeads}
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
                                     placeholder="Search leads by name, phone, country code, email, or interest..."
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
             </div>
           )}

                       {/* Pagination Controls */}
            {filteredLeads.length > 0 && (
              <div className="flex flex-col gap-4 p-3 sm:p-4 bg-white rounded-lg border border-[#D4AF37] mb-6">
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

            {/* Leads List */}
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
                   className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#8B7A1A] transition-colors text-sm cursor-pointer"
                 >
                   Clear Search
                 </button>
                 <button
                   onClick={() => setSelectedStatusFilter('All')}
                   className="px-4 py-2 bg-[#F5F2E8] text-[#8B7A1A] rounded-lg hover:bg-[#E6DCC0] transition-colors text-sm cursor-pointer"
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
                               {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'Unknown'}
                             </span>
                           </div>
                         </div>
                         <div className="flex items-center gap-2">
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
                       </div>
                       {/* Contact Info - Mobile: Stacked, Desktop: Grid */}
                       <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-3 sm:gap-4 text-xs sm:text-sm text-[#8B7A1A]">
                                                   <div>
                            <span className="font-medium">Phone:</span> 
                            <a 
                              href={`tel:${lead.countryCode || '+91'}${lead.phone}`}
                              className="inline-flex items-center px-2 py-0.5 bg-[#F5F2E8] text-[#8B7A1A] rounded-full text-xs ml-1 hover:bg-[#D4AF37] hover:text-white transition-colors cursor-pointer"
                              title="Click to call"
                            >
                              {lead.countryCode || '+91'} {lead.phone}
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
                             {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'Unknown'}
                           </span>
                         </div>
                         {lead.updatedAt && (
                           <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                             <span className="font-medium">Updated:</span> 
                             <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F5F2E8] rounded-full text-[#8B7A1A] self-start sm:self-auto">
                               {lead.updatedAt ? new Date(lead.updatedAt).toLocaleDateString() : 'Unknown'}
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
                     {/* Action Buttons */}
                     <div className="flex items-center gap-2 justify-center sm:justify-end">
                       <button 
                         onClick={() => {
                           setEditingLead(lead);
                                                       setLeadForm({
                              name: lead.name,
                              email: lead.email || '',
                              phone: lead.phone,
                              countryCode: '+91',
                              source: lead.source,
                              status: lead.status,
                              interest: lead.interest || '',
                              notes: lead.notes || ''
                            });
                           setShowEditLeadModal(true);
                         }}
                         className="p-2 text-[#8B7A1A] hover:bg-[#F5F2E8] rounded-lg transition-colors cursor-pointer"
                         title="Edit Lead"
                       >
                         <Edit className="w-4 h-4" />
                       </button>
                       <button
                         onClick={() => handleDeleteLead(lead)}
                         className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                         title="Delete Lead"
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
       </div>

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
                    <p className="text-xs sm:text-sm text-[#8B7A1A] truncate">Enter lead information</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAddLeadModal(false)}
                  className="p-2 hover:bg-[#E6DCC0] rounded-lg transition-colors duration-200 flex-shrink-0 touch-manipulation"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-[#8B7A1A]" />
                </button>
              </div>

              {/* Modal Body - Scrollable Content */}
              <form onSubmit={handleAddLead} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
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
                      <option value="Both" className="text-[#5E4E06]">Both</option>
                    </select>
                  </div>

                  {/* Notes Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[#5E4E06]">Notes</label>
                    <textarea
                      value={leadForm.notes}
                      onChange={(e) => setLeadForm(prev => ({ ...prev, notes: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-3 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent resize-none text-[#5E4E06] placeholder-[#8B7A1A] text-base touch-manipulation"
                      placeholder="Add any additional notes about this lead..."
                    />
                  </div>
                </div>
              </form>

              {/* Modal Footer - Fixed Bottom */}
              <div className="p-4 sm:p-6 border-t border-[#D4AF37] bg-gradient-to-r from-[#F5F2E8] to-[#F0EAD6]">
                {submitError && (
                  <div className="text-red-600 text-sm mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    {submitError}
                  </div>
                )}
                
                {/* Mobile Button Layout - Stacked on Small Screens */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddLeadModal(false)}
                    className="w-full sm:w-auto px-6 py-3 text-[#8B7A1A] bg-[#F5F2E8] hover:bg-[#E6DCC0] active:bg-[#D4C4A0] rounded-xl transition-all duration-200 font-medium touch-manipulation"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={handleAddLead}
                    className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-xl hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Add Lead</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

             {/* Edit Lead Modal - Mobile Optimized */}
       {showEditLeadModal && editingLead && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-2 pt-16 sm:pt-4 sm:items-center sm:p-4">
           <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg sm:max-w-2xl max-h-[calc(100vh-4rem)] sm:max-h-[90vh] overflow-hidden flex flex-col">
             {/* Modal Header - Mobile Optimized */}
             <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#D4AF37] bg-gradient-to-r from-[#F5F2E8] to-[#F0EAD6]">
               <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-xl flex items-center justify-center flex-shrink-0">
                   <Edit className="w-5 h-5 text-white" />
                 </div>
                 <div className="min-w-0 flex-1">
                   <h3 className="text-lg sm:text-xl font-bold text-[#5E4E06] truncate">Edit Lead</h3>
                   <p className="text-xs sm:text-sm text-[#8B7A1A] truncate">Update lead information</p>
                 </div>
               </div>
               <button 
                 onClick={() => setShowEditLeadModal(false)}
                 className="p-2 hover:bg-[#E6DCC0] rounded-lg transition-colors duration-200 flex-shrink-0 touch-manipulation"
                 aria-label="Close modal"
               >
                 <X className="w-5 h-5 text-[#8B7A1A]" />
               </button>
             </div>

             {/* Modal Body - Mobile Optimized */}
             <form onSubmit={handleEditLead} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
               {/* Personal Information Section */}
               <div className="space-y-4">
                 <h4 className="text-base sm:text-lg font-semibold text-[#5E4E06] flex items-center">
                   <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-[#D4AF37] flex-shrink-0" />
                   <span>Personal Information</span>
                 </h4>
                 
                 {/* Name Field - Full Width on Mobile */}
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

                                   {/* Phone Field - Full Width on Mobile */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[#5E4E06]">
                      Phone
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={leadForm.countryCode}
                        onChange={(e) => setLeadForm(prev => ({ ...prev, countryCode: e.target.value }))}
                        className="px-4 py-3 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] text-base touch-manipulation cursor-pointer appearance-none bg-white"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23D4AF37' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 0.75rem center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '1.5em 1.5em',
                          paddingRight: '2.5rem'
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
                        className="flex-1 px-4 py-3 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] placeholder-[#8B7A1A] text-base touch-manipulation"
                        placeholder="Enter phone number"
                        autoComplete="tel"
                        inputMode="numeric"
                      />
                    </div>
                  </div>

                 {/* Email Field - Full Width on Mobile */}
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
                 
                 {/* Lead Source and Status - Stacked on Mobile */}
                 <div className="space-y-4">
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
                     <option value="Both" className="text-[#5E4E06]">Both</option>
                   </select>
                 </div>

                 {/* Notes Field */}
                 <div className="space-y-2">
                   <label className="block text-sm font-semibold text-[#5E4E06]">Notes</label>
                   <textarea
                     value={leadForm.notes}
                     onChange={(e) => setLeadForm(prev => ({ ...prev, notes: e.target.value }))}
                     rows={4}
                     className="w-full px-4 py-3 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent resize-none text-[#5E4E06] placeholder-[#8B7A1A] text-base touch-manipulation"
                     placeholder="Add any additional notes about this lead..."
                   />
                 </div>
               </div>
             </form>

             {/* Modal Footer - Mobile Optimized */}
             <div className="p-4 sm:p-6 border-t border-[#D4AF37] bg-gradient-to-r from-[#F5F2E8] to-[#F0EAD6]">
               {submitError && (
                 <div className="text-red-600 text-sm mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                   {submitError}
                 </div>
               )}
               
               {/* Mobile Button Layout - Stacked on Small Screens */}
               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                 <button
                   type="button"
                   onClick={() => {
                     setShowEditLeadModal(false);
                     setEditingLead(null);
                   }}
                   className="w-full sm:w-auto px-6 py-3 text-[#8B7A1A] bg-[#F5F2E8] hover:bg-[#E6DCC0] active:bg-[#D4C4A0] rounded-xl transition-all duration-200 font-medium touch-manipulation"
                   disabled={isSubmitting}
                 >
                   Cancel
                 </button>
                                    <button
                     type="submit"
                     onClick={(e) => handleEditLead(e)}
                     className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-xl hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                     disabled={isSubmitting}
                   >
                   {isSubmitting ? (
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
             </div>
           </div>
         </div>
       )}
    </AdminLayout>
  );
}

export default function LeadsPage() {
  return (
    <AdminRouteGuard>
      <LeadsPageContent />
    </AdminRouteGuard>
  );
}
