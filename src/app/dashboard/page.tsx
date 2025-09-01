'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Settings, 
  LogOut, 
  ShoppingBag, 
  Bell, 
  Edit3, 
  Menu, 
  LayoutDashboard,
  Package,
  Calendar,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  TrendingUp,
  Heart
} from 'lucide-react';
import { AuthService, auth, UserProfile, Order } from '@/lib/firebase';
import DashboardLayout from './DashboardLayout';
import { CustomerRouteGuard } from '@/components/RouteGuard';
import { onSnapshot, query, collection, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

function DashboardPageContent() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const router = useRouter();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const loadUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const profile = await AuthService.getUserProfile(currentUser.uid);
          setUserProfile(profile);
          
          // Set up real-time listener for orders from Firestore
          const ordersQuery = query(
            collection(db, 'orders'),
            where('customerId', '==', currentUser.uid)
          );

          unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
            const userOrders = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Order[];
            
            // Sort by creation date (newest first)
            userOrders.sort((a, b) => {
              const dateA = (a.createdAt && typeof a.createdAt === 'object' && 'toDate' in a.createdAt) ? 
                (a.createdAt as any).toDate() : new Date(a.createdAt || 0);
              const dateB = (b.createdAt && typeof b.createdAt === 'object' && 'toDate' in b.createdAt) ? 
                (b.createdAt as any).toDate() : new Date(b.createdAt || 0);
              return dateB.getTime() - dateA.getTime();
            });
            
            setRecentOrders(userOrders.slice(0, 3)); // Show last 3 orders
            setTotalOrders(userOrders.length); // Set total count
          }, (error) => {
            console.error('Error listening to orders:', error);
            // Fallback to localStorage if Firestore fails
            const fallbackOrders = JSON.parse(localStorage.getItem('orders') || '[]');
            setRecentOrders(fallbackOrders.slice(0, 3));
            setTotalOrders(fallbackOrders.length);
          });
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        // Fallback to localStorage if profile loading fails
        const fallbackOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        setRecentOrders(fallbackOrders.slice(0, 3));
        setTotalOrders(fallbackOrders.length);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const handleLogout = async () => {
    try {
      await AuthService.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      router.push('/login');
    }
  };

  const formatDate = (dateInput: any) => {
    if (!dateInput) return 'N/A';
    
    try {
      let date;
      // Handle Firestore Timestamp
      if (dateInput && typeof dateInput === 'object' && dateInput.toDate) {
        date = dateInput.toDate();
      } else if (typeof dateInput === 'string' || typeof dateInput === 'number') {
        date = new Date(dateInput);
      } else {
        date = new Date(dateInput);
      }
      
      if (isNaN(date.getTime())) return 'N/A';
      
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateInput);
      return 'N/A';
    }
  };

  const getOrderStatusColor = (status: string) => {
    if (!status) return 'text-gray-600 bg-gray-100';
    
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'out_for_delivery':
        return 'text-blue-600 bg-blue-100';
      case 'shipped':
        return 'text-blue-600 bg-blue-100';
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      case 'confirmed':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-orange-600 bg-orange-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getYear = (createdAt: any) => {
    if (!createdAt) return '2024';
    let date;
    if (typeof createdAt === 'object' && createdAt.seconds) {
      // Firestore Timestamp
      date = new Date(createdAt.seconds * 1000);
    } else {
      date = new Date(createdAt);
    }
    return isNaN(date.getTime()) ? '2024' : date.getFullYear();
  };

  if (loading) {
    return (
      <DashboardLayout active="Dashboard">
        <div className="max-w-5xl mx-auto py-12 px-4 pt-32 md:pt-24">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!userProfile) {
  return (
      <DashboardLayout active="Dashboard">
        <div className="max-w-5xl mx-auto py-12 px-4 pt-32 md:pt-24">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#5E4E06] mb-4">Profile Not Found</h1>
            <p className="text-[#8B7A1A]">Unable to load your profile. Please try logging in again.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout active="Dashboard">
      <main className="max-w-5xl mx-auto py-6 sm:py-12 px-4 pt-24 sm:pt-32 md:pt-24 pb-20 sm:pb-6">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-[#5E4E06] mb-2">
            Welcome back, {userProfile.firstName || 'Valued Customer'}!
          </h1>
          <p className="text-[#8B7A1A] text-base sm:text-lg mb-4">
            Your personal dashboard for all things Desert to Mountains
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-[#D4AF37] p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#8B7A1A] text-xs sm:text-sm font-medium">Total Orders</p>
                <p className="text-2xl sm:text-3xl font-bold text-[#5E4E06]">{totalOrders}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-2xl flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-[#D4AF37] p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#8B7A1A] text-xs sm:text-sm font-medium">Member Since</p>
                <p className="text-2xl sm:text-3xl font-bold text-[#5E4E06]">
                  {getYear(userProfile.createdAt)}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-2xl flex items-center justify-center">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-[#D4AF37] p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#8B7A1A] text-xs sm:text-sm font-medium">Account Status</p>
                <p className="text-2xl sm:text-3xl font-bold text-[#5E4E06]">Active</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-[#D4AF37] p-4 sm:p-8 mb-6 sm:mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-[#5E4E06] mb-4 sm:mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-[#8B7A1A]" />
            Recent Orders
          </h2>
          
          {recentOrders.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {recentOrders.map((order, index) => (
                <div key={order.id || index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-[#F8F6F0] to-[#F5F2E8] rounded-2xl border border-[#D4AF37]/30 gap-2 sm:gap-0">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-xl flex items-center justify-center">
                      <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#5E4E06] text-sm sm:text-base">Order #{order.orderId || `ORD-${order.id?.slice(-8) || Date.now()}`}</p>
                      <p className="text-[#8B7A1A] text-xs sm:text-sm">
                        {order.items?.length || 0} items • {formatDate(order.createdAt || order.orderDate || new Date().toISOString())}
                      </p>
                    </div>
                  </div>
                  <div className="text-right sm:text-right">
                    <p className="font-bold text-[#5E4E06] text-sm sm:text-base">₹{order.finalAmount || order.totalAmount || '0'}</p>
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status || 'Processing')}`}> 
                      {order.status || 'Processing'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <Package className="w-12 h-12 sm:w-16 sm:h-16 text-[#8B7A1A] mx-auto mb-3 sm:mb-4 opacity-50" />
              <p className="text-[#8B7A1A] text-base sm:text-lg font-medium mb-2">No orders yet</p>
              <p className="text-[#8B7A1A] text-xs sm:text-sm">Start shopping to see your order history here</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-[#D4AF37] p-4 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-[#5E4E06] mb-4 sm:mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-[#8B7A1A]" />
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <button 
              onClick={() => router.push('/aura')}
              className="flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-6 bg-gradient-to-br from-[#F8F6F0] to-[#F5F2E8] rounded-2xl border-2 border-[#D4AF37] hover:border-[#8B7A1A] transition-all duration-300 group cursor-pointer"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="font-semibold text-[#5E4E06] text-center text-xs sm:text-sm">Shop Aura</span>
            </button>

            <button 
              onClick={() => router.push('/dhunee')}
              className="flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-6 bg-gradient-to-br from-[#F8F6F0] to-[#F5F2E8] rounded-2xl border-2 border-[#D4AF37] hover:border-[#8B7A1A] transition-all duration-300 group cursor-pointer"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="font-semibold text-[#5E4E06] text-center text-xs sm:text-sm">Shop Dhunee</span>
            </button>

            <button 
              onClick={() => router.push('/dashboard/orders')}
              className="flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-6 bg-gradient-to-br from-[#F8F6F0] to-[#F5F2E8] rounded-2xl border-2 border-[#D4AF37] hover:border-[#8B7A1A] transition-all duration-300 group cursor-pointer"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="font-semibold text-[#5E4E06] text-center text-xs sm:text-sm">View Orders</span>
            </button>

            <button 
              onClick={() => router.push('/dashboard/settings')}
              className="flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-6 bg-gradient-to-br from-[#F8F6F0] to-[#F5F2E8] rounded-2xl border-2 border-[#D4AF37] hover:border-[#8B7A1A] transition-all duration-300 group cursor-pointer"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="font-semibold text-[#5E4E06] text-center text-xs sm:text-sm">Settings</span>
            </button>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}

export default function DashboardPage() {
  return (
    <CustomerRouteGuard>
      <DashboardPageContent />
    </CustomerRouteGuard>
  );
} 