'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '../DashboardLayout';
import { 
  Bell, 
  Package, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Star,
  Calendar,
  ShoppingBag,
  X,
  Filter
} from 'lucide-react';
import { AuthService, auth, UserProfile } from '@/lib/firebase';

interface Notification {
  id: string;
  type: 'order' | 'promo' | 'info' | 'success' | 'warning';
  title: string;
  message: string;
  date: Date;
  read: boolean;
  actionUrl?: string;
}

export default function NotificationsPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const profile = await AuthService.getUserProfile(user.uid);
          setUserProfile(profile);
          // TODO: Fetch real notifications from Firestore or backend here
          // setNotifications(realNotifications);
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="w-5 h-5" />;
      case 'promo':
        return <Star className="w-5 h-5" />;
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'promo':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'success':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <DashboardLayout active="Notifications">
        <div className="max-w-3xl mx-auto py-12 px-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout active="Notifications">
      <div className="max-w-4xl mx-auto pt-32 md:pt-24 pb-12 px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-[#5E4E06] flex items-center gap-3">
            <Bell className="w-8 h-8 text-[#8B7A1A]" /> 
            Notifications
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-sm font-bold px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
        </h1>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-xl border-2 border-[#D4AF37] p-2">
              <Filter className="w-4 h-4 text-[#8B7A1A]" />
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'read')}
                className="bg-transparent text-[#5E4E06] font-medium focus:outline-none"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white font-bold rounded-xl shadow hover:scale-105 transition-all duration-300"
              >
                Mark All Read
              </button>
            )}
          </div>
        </div>
        {/* Notification List or Empty State */}
        {filteredNotifications.length > 0 ? (
          <div className="space-y-4">
            {filteredNotifications.map(notification => (
              <div 
                key={notification.id} 
                className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border-2 p-6 transition-all ${
                  notification.read 
                    ? 'border-[#D4AF37]/50 opacity-75' 
                    : 'border-[#D4AF37] shadow-2xl'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-lg text-[#5E4E06] mb-2">
                          {notification.title}
                        </h3>
                        <p className="text-[#8B7A1A] mb-3 leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-[#8B7A1A]">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {notification.date.toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {notification.actionUrl && (
                          <button
                            onClick={() => window.location.href = notification.actionUrl!}
                            className="px-3 py-1 bg-gradient-to-r from-[#8B7A1A] to-[#D4AF37] text-white font-medium rounded-lg text-sm hover:scale-105 transition-all duration-300"
                          >
                            View
                          </button>
                        )}
                        
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="px-3 py-1 bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white font-medium rounded-lg text-sm hover:scale-105 transition-all duration-300"
                          >
                            Mark Read
                          </button>
                        )}
                        
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 text-[#8B7A1A] hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Bell className="w-24 h-24 text-[#8B7A1A] mx-auto mb-6 opacity-50" />
            <h2 className="text-2xl font-bold text-[#5E4E06] mb-4">No Notifications</h2>
            <p className="text-[#8B7A1A] text-lg mb-8">You have no notifications at this time.</p>
          </div>
        )}

        {/* Notification Stats */}
        <div className="mt-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-[#D4AF37] p-6">
          <h3 className="text-lg font-bold text-[#5E4E06] mb-4">Notification Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-r from-[#F8F6F0] to-[#F5F2E8] rounded-xl border border-[#D4AF37]/30">
              <p className="text-[#8B7A1A] text-sm font-medium">Total</p>
              <p className="text-2xl font-bold text-[#5E4E06]">{notifications.length}</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-[#F8F6F0] to-[#F5F2E8] rounded-xl border border-[#D4AF37]/30">
              <p className="text-[#8B7A1A] text-sm font-medium">Unread</p>
              <p className="text-2xl font-bold text-[#5E4E06]">{unreadCount}</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-[#F8F6F0] to-[#F5F2E8] rounded-xl border border-[#D4AF37]/30">
              <p className="text-[#8B7A1A] text-sm font-medium">Read</p>
              <p className="text-2xl font-bold text-[#5E4E06]">{notifications.length - unreadCount}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 