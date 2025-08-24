"use client";

import { useState, useEffect, useMemo } from 'react';
import { AuthService, auth, UserProfile } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastContext';
import { AdminRouteGuard } from '@/components/RouteGuard';
import AdminLayout from '../components/AdminLayout';
import { Users, Search, Filter, Edit, Trash2, Eye, Mail, Phone, Calendar } from 'lucide-react';
import CustomerDetailsDrawer from '@/components/CustomerDetailsDrawer';

function CustomersPageContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Customer management state
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<UserProfile | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [customersPerPage] = useState(10);
  
  const router = useRouter();
  const { showToast } = useToast();

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

    const loadData = async () => {
      try {
        await loadAllCustomers();
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoading(false);
      }
    };

    loadUserProfile();
    loadData();
  }, []);

  // Load customers data
  const loadAllCustomers = async () => {
    setCustomersLoading(true);
    setCustomersError(null);
    try {
      const { customers } = await AuthService.getCustomersPaginated();
      setCustomers(customers);
    } catch (err) {
      console.error('Error loading customers:', err);
      setCustomers([]);
      setCustomersError('Failed to load customers. Please check your permissions or try again later.');
    } finally {
      setCustomersLoading(false);
    }
  };

  // Handle customer operations
  const handleSaveCustomer = async (updated: UserProfile) => {
    setIsSavingCustomer(true);
    try {
      await AuthService.updateUserProfile(updated.uid, updated);
      setSelectedCustomer({ ...selectedCustomer, ...updated });
      showToast('Customer updated successfully', 'success');
      await loadAllCustomers(); // Refresh the list
    } catch (error) {
      console.error('Error updating customer:', error);
      showToast('Failed to update customer', 'error');
    } finally {
      setIsSavingCustomer(false);
    }
  };

  const handleDeleteCustomer = async (uid: string) => {
    try {
      await AuthService.deleteUser(uid);
      setSelectedCustomer(null);
      showToast('Customer deleted successfully', 'success');
      await loadAllCustomers(); // Refresh the list
    } catch (error) {
      console.error('Error deleting customer:', error);
      showToast('Failed to delete customer', 'error');
    }
  };

  // Helper function to format dates from Firestore
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

  // Filtered customers based on search
  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) {
      return customers;
    }
    
    const searchLower = searchTerm.toLowerCase();
    return customers.filter(customer => 
      customer.firstName?.toLowerCase().includes(searchLower) ||
      customer.lastName?.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower) ||
      customer.phone?.toLowerCase().includes(searchLower)
    );
  }, [customers, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);
  const startIndex = (currentPage - 1) * customersPerPage;
  const endIndex = startIndex + customersPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of customer list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#5E4E06]">Customers</h2>
                <p className="text-[#8B7A1A] text-xs sm:text-sm">Manage your customer database</p>
              </div>
            </div>
            
          </div>
        </div>

        {/* Customer Analytics */}
        {customers.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-[#D4AF37] p-4 shadow-sm">
              <div className="text-2xl font-bold text-[#5E4E06]">
                {customers.length}
              </div>
              <div className="text-sm text-[#8B7A1A]">Total Customers</div>
            </div>
                         <div className="bg-white rounded-xl border border-[#D4AF37] p-4 shadow-sm">
               <div className="text-2xl font-bold text-blue-600">
                 {customers.filter(c => {
                   try {
                     const date = c.createdAt && typeof c.createdAt === 'object' && c.createdAt.toDate ? 
                       c.createdAt.toDate() : new Date(c.createdAt);
                     return date > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                   } catch {
                     return false;
                   }
                 }).length}
               </div>
               <div className="text-sm text-[#8B7A1A]">New This Month</div>
             </div>
            <div className="bg-white rounded-xl border border-[#D4AF37] p-4 shadow-sm">
              <div className="text-2xl font-bold text-green-600">
                {customers.filter(c => c.phone).length}
              </div>
              <div className="text-sm text-[#8B7A1A]">With Phone</div>
            </div>
            <div className="bg-white rounded-xl border border-[#D4AF37] p-4 shadow-sm">
              <div className="text-2xl font-bold text-purple-600">
                {customers.filter(c => c.address).length}
              </div>
              <div className="text-sm text-[#8B7A1A]">With Address</div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-xl border border-[#D4AF37] shadow-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B7A1A] w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search customers by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06]"
                />
              </div>
            </div>
                         <div className="flex items-center gap-2 text-sm text-[#8B7A1A]">
               <Filter className="w-4 h-4" />
               <span>
                 Showing {startIndex + 1}-{Math.min(endIndex, filteredCustomers.length)} of {filteredCustomers.length} customers
               </span>
             </div>
          </div>
        </div>

        {/* Customers List */}
        <div className="bg-white rounded-xl border border-[#D4AF37] shadow-sm">
          {customersLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
              <p className="text-[#8B7A1A]">Loading customers...</p>
            </div>
          ) : customersError ? (
            <div className="p-8 text-center">
              <div className="text-red-500 mb-4">
                <Users className="w-16 h-16 mx-auto opacity-60" />
              </div>
              <h3 className="text-lg font-semibold text-[#5E4E06] mb-2">Error Loading Customers</h3>
              <p className="text-[#8B7A1A] mb-4">{customersError}</p>
              <button
                onClick={loadAllCustomers}
                className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#8B7A1A] transition-colors"
              >
                Try Again
              </button>
            </div>
                     ) : currentCustomers.length === 0 ? (
            <div className="p-8 text-center">
              {customers.length === 0 ? (
                <>
                  <Users className="w-20 h-20 text-[#D4AF37] mx-auto mb-6 opacity-60" />
                  <h2 className="text-2xl font-bold text-[#5E4E06] mb-3">No Customers Yet</h2>
                  <p className="text-[#8B7A1A] text-lg mb-4">
                    Start building your customer database by adding your first customer.
                  </p>
                </>
              ) : (
                <>
                  <Search className="w-20 h-20 text-[#8B7A1A] mx-auto mb-6 opacity-60" />
                  <h2 className="text-2xl font-bold text-[#5E4E06] mb-3">No Customers Found</h2>
                  <p className="text-[#8B7A1A] text-lg mb-4">
                    Try adjusting your search terms or filters.
                  </p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#8B7A1A] transition-colors"
                  >
                    Clear Search
                  </button>
                </>
              )}
            </div>
          ) : (
                         <div className="divide-y divide-[#F5F2E8]">
               {currentCustomers.map((customer) => (
                <div key={customer.uid} className="p-4 sm:p-6 hover:bg-[#F8F6F0] transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] flex items-center justify-center text-white font-bold text-lg shadow">
                        {((customer.firstName || '')[0] || '').toUpperCase()}
                        {((customer.lastName || '')[0] || '').toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-[#5E4E06] mb-1">
                          {customer.firstName} {customer.lastName}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-[#8B7A1A]">
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            <span>{customer.email}</span>
                          </div>
                          {customer.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                                                     <div className="flex items-center gap-1">
                             <Calendar className="w-4 h-4" />
                             <span>Customer since {formatDateForDisplay(customer.createdAt)}</span>
                           </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setDrawerOpen(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="View Customer Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setDrawerOpen(true);
                        }}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Customer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setDrawerOpen(true);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Customer"
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

         {/* Pagination */}
         {totalPages > 1 && (
           <div className="mt-6">
           <div className="bg-white rounded-xl border border-[#D4AF37] shadow-sm p-4 sm:p-6">
             <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
               <div className="text-sm text-[#8B7A1A]">
                 Page {currentPage} of {totalPages}
               </div>
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
             </div>
           </div>
         </div>
         )}

         {/* Customer Details Drawer */}
        <CustomerDetailsDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          customer={selectedCustomer}
          onSave={handleSaveCustomer}
          onDelete={handleDeleteCustomer}
        />
      </div>
    </AdminLayout>
  );
}

export default function CustomersPage() {
  return (
    <AdminRouteGuard>
      <CustomersPageContent />
    </AdminRouteGuard>
  );
}
