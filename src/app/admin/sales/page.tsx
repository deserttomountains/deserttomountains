"use client";

import { useState, useEffect, useMemo } from 'react';
import { AuthService, auth, Order } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastContext';
import { useAuth } from '@/lib/hooks/useAuth';

import AdminLayout from '../components/AdminLayout';
import { Target, TrendingUp, Package, DollarSign, Calendar, BarChart3, Filter, Search, Eye, Edit, Truck, CheckCircle, Clock, AlertCircle, X } from 'lucide-react';

function SalesPageContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Sales management state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>('all');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  
  // Order details modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  
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
        setOrdersLoading(true);
        const fetchedOrders = await AuthService.getOrders();
        // Convert Firestore dates to proper Date objects
        const convertedOrders = fetchedOrders.map(convertOrderDates);
        setOrders(convertedOrders);
      } catch (error) {
        console.error('Error loading orders:', error);
        showToast('Error loading orders', 'error');
      } finally {
        setOrdersLoading(false);
        setIsLoading(false);
      }
    };

    loadUserProfile();
    loadData();
  }, []);

  // Helper functions for sales calculations
  const getCurrentMonthOrders = () => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    return orders.filter(order => {
      try {
        const orderDate = order.orderDate instanceof Date ? order.orderDate : 
                         (order.orderDate && typeof order.orderDate === 'object' && 'toDate' in order.orderDate) ? 
                         (order.orderDate as any).toDate() : new Date(order.orderDate);
        return orderDate >= startOfMonth;
      } catch (error) {
        return false;
      }
    });
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
      try {
        const orderDate = order.orderDate instanceof Date ? order.orderDate : 
                         (order.orderDate && typeof order.orderDate === 'object' && 'toDate' in order.orderDate) ? 
                         (order.orderDate as any).toDate() : new Date(order.orderDate);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      } catch (error) {
        return false;
      }
    });
  };

  // Calculate revenue
  const calculateRevenue = (ordersList: Order[]): number => {
    return ordersList.reduce((sum, order) => sum + order.finalAmount, 0);
  };

  // Format revenue for display
  const formatRevenue = (amount: number): string => {
    return `₹${amount.toLocaleString()}`;
  };

  // Calculate month-over-month change
  const calculateMonthOverMonthChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  // Filtered orders based on search and filters
  const filteredOrders = useMemo(() => {
    let filtered = orders;
    
    // Filter by status
    if (selectedStatusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatusFilter);
    }
    
         // Filter by time
     if (selectedTimeFilter !== 'all') {
       const now = new Date();
       if (selectedTimeFilter === 'today') {
         const today = new Date();
         today.setHours(0, 0, 0, 0);
         filtered = filtered.filter(order => {
           try {
             const orderDate = order.orderDate instanceof Date ? order.orderDate : 
                              (order.orderDate && typeof order.orderDate === 'object' && 'toDate' in order.orderDate) ? 
                              (order.orderDate as any).toDate() : new Date(order.orderDate);
             orderDate.setHours(0, 0, 0, 0);
             return orderDate.getTime() === today.getTime();
           } catch (error) {
             return false;
           }
         });
       } else if (selectedTimeFilter === 'week') {
         const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
         filtered = filtered.filter(order => {
           try {
             const orderDate = order.orderDate instanceof Date ? order.orderDate : 
                              (order.orderDate && typeof order.orderDate === 'object' && 'toDate' in order.orderDate) ? 
                              (order.orderDate as any).toDate() : new Date(order.orderDate);
             return orderDate >= weekAgo;
           } catch (error) {
             return false;
           }
         });
       } else if (selectedTimeFilter === 'month') {
         const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
         filtered = filtered.filter(order => {
           try {
             const orderDate = order.orderDate instanceof Date ? order.orderDate : 
                              (order.orderDate && typeof order.orderDate === 'object' && 'toDate' in order.orderDate) ? 
                              (order.orderDate as any).toDate() : new Date(order.orderDate);
             return orderDate >= monthAgo;
           } catch (error) {
             return false;
           }
         });
       }
     }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.customerName?.toLowerCase().includes(searchLower) ||
        order.customerEmail?.toLowerCase().includes(searchLower) ||
        order.orderId?.toLowerCase().includes(searchLower) ||
        order.status?.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [orders, selectedStatusFilter, selectedTimeFilter, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatusFilter, selectedTimeFilter]);

  // Debug: Log when selectedOrder changes
  useEffect(() => {
    if (selectedOrder) {
      console.log('selectedOrder changed:', selectedOrder);
    }
  }, [selectedOrder]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open order details modal
  const handleViewOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
    
    // Auto-set estimated delivery to 10 days if payment is completed and no delivery date is set
    if (order.paymentStatus === 'completed' && !safeDateConversion(order.estimatedDelivery)) {
      try {
        const tenDaysFromNow = getDefaultDeliveryDate();
        
        await AuthService.updateOrder(order.id!, {
          estimatedDelivery: tenDaysFromNow
        });
        
        // Update the order in local state
        setSelectedOrder({
          ...order,
          estimatedDelivery: tenDaysFromNow
        });
        
                                // Update the orders list
                        const updatedOrders = orders.map(o => 
                          o.id === order.id ? convertOrderDates({ ...o, estimatedDelivery: tenDaysFromNow }) : o
                        );
                        setOrders(updatedOrders);
        
        console.log('Auto-set estimated delivery to 10 days from now');
      } catch (error) {
        console.error('Error auto-setting delivery date:', error);
        // Don't show error toast as this is automatic
      }
    }
  };

  // Close order details modal
  const handleCloseOrderDetails = () => {
    setSelectedOrder(null);
    setOrderDetailsOpen(false);
  };

  // Calculate default delivery date (10 days from now)
  const getDefaultDeliveryDate = (): Date => {
    return new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
  };

  // Safely convert any date value to a valid Date object
  const safeDateConversion = (dateValue: any): Date | null => {
    try {
      if (!dateValue) return null;
      
      if (dateValue instanceof Date) {
        return isNaN(dateValue.getTime()) ? null : dateValue;
      }
      
      if (dateValue && typeof dateValue === 'object' && dateValue.toDate) {
        // Handle Firestore Timestamp
        const converted = dateValue.toDate();
        return isNaN(converted.getTime()) ? null : converted;
      }
      
      if (typeof dateValue === 'string') {
        const parsed = new Date(dateValue);
        return isNaN(parsed.getTime()) ? null : parsed;
      }
      
      if (typeof dateValue === 'number') {
        const parsed = new Date(dateValue);
        return isNaN(parsed.getTime()) ? null : parsed;
      }
      
      // Additional debugging for unknown types
      console.log('Unknown date type in safeDateConversion:', {
        value: dateValue,
        type: typeof dateValue,
        constructor: dateValue?.constructor?.name
      });
      
      return null;
    } catch (error) {
      console.error('Error converting date:', dateValue, error);
      return null;
    }
  };

  // Safely format date for display
  const safeDateToISOString = (dateValue: any): string => {
    const validDate = safeDateConversion(dateValue);
    if (!validDate) {
      return getDefaultDeliveryDate().toISOString().split('T')[0];
    }
    return validDate.toISOString().split('T')[0];
  };

  // Convert Firestore dates to proper Date objects
  const convertOrderDates = (order: Order): Order => {
    const convertedEstimatedDelivery = order.estimatedDelivery ? safeDateConversion(order.estimatedDelivery) : undefined;
    const convertedActualDelivery = order.actualDelivery ? safeDateConversion(order.actualDelivery) : undefined;
    
    // Ensure orderDate is always set - if missing, use createdAt as fallback
    let orderDate = safeDateConversion(order.orderDate);
    if (!orderDate) {
      orderDate = safeDateConversion(order.createdAt) || new Date();
      // If orderDate was missing, update it in the database
      if (order.id && !order.orderDate) {
        AuthService.updateOrder(order.id, { orderDate }).catch(error => {
          console.error('Error updating missing orderDate:', error);
        });
      }
    }
    
    return {
      ...order,
      orderDate: orderDate,
      createdAt: safeDateConversion(order.createdAt) || new Date(),
      updatedAt: safeDateConversion(order.updatedAt) || new Date(),
      estimatedDelivery: convertedEstimatedDelivery || undefined,
      actualDelivery: convertedActualDelivery || undefined
    };
  };

  // Format date for display (handles Firestore Timestamps and other date formats)
  const formatDateForDisplay = (dateValue: any): string => {
    try {
      const validDate = safeDateConversion(dateValue);
      if (!validDate) {
        return 'N/A';
      }
      return validDate.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', dateValue, error);
      return 'N/A';
    }
  };

  // Get status color
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'out_for_delivery': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#5E4E06]">Sales</h2>
                <p className="text-[#8B7A1A] text-xs sm:text-sm">Track your sales performance</p>
              </div>
            </div>

          </div>
        </div>

        {/* Sales Analytics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-[#D4AF37] p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8B7A1A]">Total Revenue</p>
                <p className="text-2xl font-bold text-[#5E4E06]">
                  {formatRevenue(calculateRevenue(orders))}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#D4AF37] p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8B7A1A]">Active Orders</p>
                <p className="text-2xl font-bold text-blue-600">
                  {getActiveOrders().length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#D4AF37] p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8B7A1A]">This Month</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatRevenue(calculateRevenue(getCurrentMonthOrders()))}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#D4AF37] p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8B7A1A]">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {getCompletedOrders().length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-[#D4AF37] shadow-sm p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B7A1A] w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search orders by customer, order ID, or status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06]"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {/* Status Filter */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="px-3 py-2 border border-[#D4AF37] rounded-lg text-[#5E4E06] bg-white focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Time Filter */}
              <select
                value={selectedTimeFilter}
                onChange={(e) => setSelectedTimeFilter(e.target.value)}
                className="px-3 py-2 border border-[#D4AF37] rounded-lg text-[#5E4E06] bg-white focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-sm text-[#8B7A1A]">
              <Filter className="w-4 h-4" />
              <span>
                Showing {startIndex + 1}-{Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} orders
              </span>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-xl border border-[#D4AF37] shadow-sm">
          {ordersLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
              <p className="text-[#8B7A1A]">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center">
              {orders.length === 0 ? (
                <>
                  <Package className="w-20 h-20 text-[#D4AF37] mx-auto mb-6 opacity-60" />
                  <h2 className="text-2xl font-bold text-[#5E4E06] mb-3">No Orders Yet</h2>
                  <p className="text-[#8B7A1A] text-lg mb-4">
                    Start tracking your sales by creating your first order.
                  </p>
                </>
              ) : searchTerm.trim() || selectedStatusFilter !== 'all' || selectedTimeFilter !== 'all' ? (
                <>
                  <Search className="w-20 h-20 text-[#8B7A1A] mx-auto mb-6 opacity-60" />
                  <h2 className="text-2xl font-bold text-[#5E4E06] mb-3">No Orders Found</h2>
                  <p className="text-[#8B7A1A] text-lg mb-4">
                    No orders match your current filters. Try adjusting your search or filters.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#8B7A1A] transition-colors"
                    >
                      Clear Search
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedStatusFilter('all');
                        setSelectedTimeFilter('all');
                      }}
                      className="px-4 py-2 bg-[#F5F2E8] text-[#5E4E06] border border-[#D4AF37] rounded-lg hover:bg-[#FFFBEA] transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Package className="w-20 h-20 text-[#D4AF37] mx-auto mb-6 opacity-60" />
                  <h2 className="text-2xl font-bold text-[#5E4E06] mb-3">No Orders</h2>
                  <p className="text-[#8B7A1A] text-lg mb-4">
                    There are no orders to display.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="divide-y divide-[#F5F2E8]">
              {currentOrders.map((order) => (
                <div key={order.id} className="p-4 sm:p-6 hover:bg-[#F8F6F0] transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-[#5E4E06]">{order.orderId}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                        </span>
                      </div>
                      <p className="font-semibold text-[#5E4E06] mb-1">{order.customerName}</p>
                      <p className="text-sm text-[#8B7A1A] mb-2">{order.customerEmail}</p>
                                             <div className="flex items-center gap-4 text-xs text-[#8B7A1A]">
                         <span>Total: {formatRevenue(order.finalAmount)}</span>
                         <span>Items: {order.items.length}</span>
                         <span>Date: {formatDateForDisplay(order.orderDate)}</span>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                                             <button
                         onClick={() => handleViewOrderDetails(order)}
                         className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                         title="View Order Details"
                       >
                         <Eye className="w-4 h-4" />
                       </button>
                                             <button
                         onClick={() => handleViewOrderDetails(order)}
                         className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                         title="View & Update Status"
                       >
                         <Edit className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <div className="mt-6">
            <div className="bg-white rounded-xl border border-[#D4AF37] shadow-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-[#8B7A1A]">
                  {totalPages > 1 ? `Page ${currentPage} of ${totalPages}` : `Showing all ${filteredOrders.length} orders`}
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
                          : 'text-[#5E4E06] bg-[#FFFBEA] hover:bg-[#F5F2E8] border border-[#D4AF37] cursor-pointer'
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
                              className="px-3 py-2 rounded-lg text-sm font-medium text-[#5E4E06] bg-[#FFFBEA] hover:bg-[#F5F2E8] border border-[#D4AF37] transition-colors cursor-pointer"
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
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
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
                              className="px-3 py-2 rounded-lg text-sm font-medium text-[#5E4E06] bg-[#FFFBEA] hover:bg-[#F5F2E8] border border-[#D4AF37] transition-colors cursor-pointer"
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
                          : 'text-[#5E4E06] bg-[#FFFBEA] hover:bg-[#F5F2E8] border border-[#D4AF37] cursor-pointer'
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

        {/* Order Details Modal */}
        {orderDetailsOpen && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col">
              {/* Modal Header - Fixed */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#F5F2E8] flex-shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#D4AF37] rounded-xl flex items-center justify-center">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-[#5E4E06]">Order Details</h2>
                    <p className="text-[#8B7A1A] text-xs sm:text-sm">Order #{selectedOrder.orderId}</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseOrderDetails}
                  className="p-2 text-[#8B7A1A] hover:text-[#5E4E06] hover:bg-[#F5F2E8] rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Order Status and Basic Info */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  <div className="bg-[#F8F6F0] rounded-lg p-3 sm:p-4">
                    <h3 className="font-semibold text-[#5E4E06] mb-3 text-sm sm:text-base">Order Information</h3>
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#8B7A1A]">Order ID:</span>
                        <span className="font-medium text-[#5E4E06] break-all">{selectedOrder.orderId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8B7A1A]">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1).replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8B7A1A]">Order Date:</span>
                        <span className="font-medium text-[#5E4E06]">
                          {formatDateForDisplay(selectedOrder.orderDate || selectedOrder.createdAt)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8B7A1A]">Payment Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedOrder.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                          selectedOrder.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          selectedOrder.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8B7A1A]">Payment Method:</span>
                        <span className="font-medium text-[#5E4E06]">{selectedOrder.paymentMethod || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#F8F6F0] rounded-lg p-3 sm:p-4">
                    <h3 className="font-semibold text-[#5E4E06] mb-3 text-sm sm:text-base">Customer Information</h3>
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#8B7A1A]">Name:</span>
                        <span className="font-medium text-[#5E4E06] break-all">{selectedOrder.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8B7A1A]">Email:</span>
                        <span className="font-medium text-[#5E4E06] break-all">{selectedOrder.customerEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8B7A1A]">Phone:</span>
                        <span className="font-medium text-[#5E4E06]">{selectedOrder.customerPhone || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8B7A1A]">Customer ID:</span>
                        <span className="font-medium text-[#5E4E06] break-all">{selectedOrder.customerId}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-[#F8F6F0] rounded-lg p-3 sm:p-4">
                  <h3 className="font-semibold text-[#5E4E06] mb-3 text-sm sm:text-base">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white rounded-lg gap-2 sm:gap-0">
                        <div className="flex-1">
                          <p className="font-medium text-[#5E4E06] text-sm sm:text-base">{item.productName}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-[#8B7A1A] mt-1">
                            <span>Type: {item.productType}</span>
                            {item.variant && <span>Variant: {item.variant}</span>}
                            {item.shades && item.shades.length > 0 && (
                              <span>Shades: {item.shades.join(', ')}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right sm:text-right">
                          <p className="font-medium text-[#5E4E06] text-sm sm:text-base">₹{item.unitPrice.toLocaleString()}</p>
                          <p className="text-xs sm:text-sm text-[#8B7A1A]">Qty: {item.quantity}</p>
                          <p className="font-semibold text-[#5E4E06] text-sm sm:text-base">₹{item.totalPrice.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-[#F8F6F0] rounded-lg p-3 sm:p-4">
                  <h3 className="font-semibold text-[#5E4E06] mb-3 text-sm sm:text-base">Financial Summary</h3>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#8B7A1A]">Subtotal:</span>
                      <span className="font-medium text-[#5E4E06]">₹{selectedOrder.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8B7A1A]">Tax:</span>
                      <span className="font-medium text-[#5E4E06]">₹{selectedOrder.tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8B7A1A]">Shipping:</span>
                      <span className="font-medium text-[#5E4E06]">₹{selectedOrder.shipping.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-[#E6DCC0]">
                      <span className="font-semibold text-[#5E4E06] text-sm sm:text-base">Total Amount:</span>
                      <span className="font-bold text-base sm:text-lg text-[#5E4E06]">₹{selectedOrder.finalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Information */}
                {selectedOrder.shippingAddress && (
                  <div className="bg-[#F8F6F0] rounded-lg p-3 sm:p-4">
                    <h3 className="font-semibold text-[#5E4E06] mb-3 text-sm sm:text-base">Shipping Address</h3>
                    <div className="text-xs sm:text-sm text-[#5E4E06] space-y-2">
                      {/* Customer Details */}
                      <div className="border-b border-[#E8E0D0] pb-2 mb-2">
                        <p className="font-medium text-[#5E4E06]">Full Name: <span className="font-normal">{selectedOrder.customerName}</span></p>
                        <p className="font-medium text-[#5E4E06]">Email: <span className="font-normal">{selectedOrder.customerEmail}</span></p>
                        <p className="font-medium text-[#5E4E06]">Phone: <span className="font-normal">{selectedOrder.customerPhone}</span></p>
                      </div>
                      
                      {/* Address Details */}
                      {selectedOrder.shippingAddress.addressLine1 && (
                        <p className="break-all"><span className="font-medium">Address Line 1:</span> {selectedOrder.shippingAddress.addressLine1}</p>
                      )}
                      {selectedOrder.shippingAddress.street && (
                        <p className="break-all"><span className="font-medium">Street:</span> {selectedOrder.shippingAddress.street}</p>
                      )}
                      {selectedOrder.shippingAddress.addressLine2 && (
                        <p className="break-all"><span className="font-medium">Address Line 2:</span> {selectedOrder.shippingAddress.addressLine2}</p>
                      )}
                      <p className="break-all">
                        <span className="font-medium">City:</span> {selectedOrder.shippingAddress.city}
                        {selectedOrder.shippingAddress.state && <span>, State: {selectedOrder.shippingAddress.state}</span>}
                        {selectedOrder.shippingAddress.pincode && <span>, Postal Code: {selectedOrder.shippingAddress.pincode}</span>}
                      </p>
                      {selectedOrder.shippingAddress.country && (
                        <p className="break-all"><span className="font-medium">Country:</span> {selectedOrder.shippingAddress.country}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Information */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  {/* Delivery Information - Always Show */}
                  <div className="bg-[#F8F6F0] rounded-lg p-3 sm:p-4">
                    <h3 className="font-semibold text-[#5E4E06] mb-3 text-sm sm:text-base">Delivery Information</h3>
                    <div className="space-y-3 text-xs sm:text-sm">
                      {/* Payment Status */}
                      <div className="flex justify-between items-center">
                        <span className="text-[#8B7A1A]">Payment Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedOrder.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                          selectedOrder.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                        </span>
                      </div>

                      {/* Estimated Delivery Section */}
                      {selectedOrder.paymentStatus === 'completed' ? (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[#8B7A1A]">Estimated Delivery:</span>
                            <span className="font-medium text-[#5E4E06] break-all">
                              {safeDateConversion(selectedOrder.estimatedDelivery) ? 
                                formatDateForDisplay(selectedOrder.estimatedDelivery) : 
                                'Not set'
                              }
                            </span>
                          </div>
                          
                          {/* Calendar Input for Admin */}
                          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                            <span className="text-[#8B7A1A] whitespace-nowrap">Set Delivery Date:</span>
                            <div className="flex gap-2 items-center">
                              <input
                                type="date"
                                className="px-3 py-1 border border-[#D4C4A8] rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#5E4E06] focus:border-transparent"
                                min={new Date().toISOString().split('T')[0]}
                                value={safeDateToISOString(selectedOrder.estimatedDelivery)}
                                onChange={(e) => {
                                  try {
                                    const newDate = new Date(e.target.value);
                                    if (!isNaN(newDate.getTime())) {
                                      setSelectedOrder({
                                        ...selectedOrder,
                                        estimatedDelivery: newDate
                                      });
                                    }
                                  } catch (error) {
                                    console.error('Error setting date:', error);
                                  }
                                }}
                              />
                              <button
                                onClick={async () => {
                                  try {
                                    const newDate = safeDateConversion(selectedOrder.estimatedDelivery) || 
                                      getDefaultDeliveryDate();
                                    
                                    await AuthService.updateOrder(selectedOrder.id!, {
                                      estimatedDelivery: newDate
                                    });
                                    
                                    // Update local state
                                    const updatedOrders = orders.map(order => 
                                      order.id === selectedOrder.id ? 
                                        convertOrderDates({ ...order, estimatedDelivery: newDate }) : order
                                    );
                                    setOrders(updatedOrders);
                                    
                                    showToast('Delivery date updated successfully!', 'success');
                                  } catch (error) {
                                    console.error('Error updating delivery date:', error);
                                    showToast('Failed to update delivery date', 'error');
                                  }
                                }}
                                className="px-3 py-1 bg-[#5E4E06] text-white text-xs rounded-md hover:bg-[#4A3D05] transition-colors cursor-pointer"
                              >
                                Update
                              </button>
                            </div>
                          </div>


                        </div>
                      ) : (
                        <div className="text-center py-2">
                          <span className="text-[#8B7A1A] font-medium">Payment Pending - Cannot set delivery date</span>
                        </div>
                      )}

                      {/* Actual Delivery */}
                      {selectedOrder.actualDelivery && (
                        <div className="flex justify-between">
                          <span className="text-[#8B7A1A]">Actual Delivery:</span>
                          <span className="font-medium text-[#5E4E06] break-all">{formatDateForDisplay(selectedOrder.actualDelivery)}</span>
                        </div>
                      )}

                      {/* Tracking Number */}
                      {selectedOrder.trackingNumber && (
                        <div className="flex justify-between">
                          <span className="text-[#8B7A1A]">Tracking Number:</span>
                          <span className="font-medium text-[#5E4E06] break-all">{selectedOrder.trackingNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#F8F6F0] rounded-lg p-3 sm:p-4">
                    <h3 className="font-semibold text-[#5E4E06] mb-3 text-sm sm:text-base">Additional Details</h3>
                    <div className="space-y-2 text-xs sm:text-sm">
                      {selectedOrder.transactionId && (
                        <div className="flex justify-between">
                          <span className="text-[#8B7A1A]">Transaction ID:</span>
                          <span className="font-medium text-[#5E4E06] break-all">{selectedOrder.transactionId}</span>
                        </div>
                      )}
                      {selectedOrder.notes && (
                        <div>
                          <span className="text-[#8B7A1A]">Notes:</span>
                          <p className="font-medium text-[#5E4E06] mt-1 break-all">{selectedOrder.notes}</p>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-[#8B7A1A]">Created:</span>
                        <span className="font-medium text-[#5E4E06] break-all">{formatDateForDisplay(selectedOrder.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8B7A1A]">Last Updated:</span>
                        <span className="font-medium text-[#5E4E06] break-all">{formatDateForDisplay(selectedOrder.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                            </div>

              {/* Modal Footer - Fixed */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-t border-[#F5F2E8] gap-4 sm:gap-0 flex-shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <span className="text-xs sm:text-sm text-[#8B7A1A]">Update Status:</span>
                  
                  {/* Debug: Show current status */}
                  <span className="text-xs text-gray-500">Current: {selectedOrder.status}</span>
                  
                  <select
                    key={`status-${selectedOrder.id}-${selectedOrder.status}`}
                    value={selectedOrder.status}
                    onChange={async (e) => {
                      const newStatus = e.target.value as Order['status'];
                      console.log('Status change requested:', selectedOrder.status, '->', newStatus);
                      
                      try {
                        // Create a completely new object to force React re-render
                        const updatedOrder = {
                          ...selectedOrder,
                          status: newStatus,
                          updatedAt: new Date()
                        };
                        
                        console.log('Updating selectedOrder:', updatedOrder);
                        setSelectedOrder(updatedOrder);
                        
                        // Update the orders list
                        const updatedOrders = orders.map(order => 
                          order.id === selectedOrder.id 
                            ? convertOrderDates(updatedOrder)
                            : order
                        );
                        console.log('Updating orders list with:', updatedOrders);
                        setOrders(updatedOrders);
                        
                        // Then update Firebase
                        console.log('Updating Firebase with status:', newStatus);
                        if (selectedOrder.id) {
                          await AuthService.updateOrderStatus(selectedOrder.id, newStatus);
                        }
                        
                        showToast('Order status updated successfully', 'success');
                        console.log('Status update completed successfully');
                      } catch (error) {
                        console.error('Error updating order status:', error);
                        showToast('Error updating order status', 'error');
                        
                        // Revert local state if Firebase update failed
                        setSelectedOrder(selectedOrder);
                        setOrders(orders);
                      }
                    }}
                    className="px-2 sm:px-3 py-2 border border-[#D4AF37] rounded-lg text-[#5E4E06] bg-white focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-xs sm:text-sm cursor-pointer"
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

             </div>
            </div>
          </div>
        )}
       </div>
     </AdminLayout>
  );
}

export default function SalesPage() {
  const { userProfile, signOut } = useAuth();

  return (
    <AdminLayout userProfile={userProfile} onLogout={signOut}>
      <SalesPageContent />
    </AdminLayout>
  );
}
