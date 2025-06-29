"use client";

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  DollarSign, 
  Settings,
  Bell,
  ArrowUpRight,
  Sparkles,
  Calendar,
  MessageSquare,
  Phone,
  Mail,
  UserPlus,
  Building2,
  Menu,
  Search,
  Plus,
  Download,
  X,
  MapPin,
  Briefcase,
  ChevronDown,
  Instagram,
  MessageCircle,
  Facebook,
  Target,
  UserCheck,
  FileText,
  Activity,
  Home,
  ArrowLeft,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Star,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import MockChatCRM from './MockChatCRM';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [leadForm, setLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    source: '',
    socialMedia: '',
    socialMediaHandles: [] as { platform: string; handle: string }[],
    status: 'New Lead',
    interest: '',
    notes: ''
  });

  const [newSocialHandle, setNewSocialHandle] = useState({ platform: '', handle: '' });
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const socialPlatforms = [
    { value: 'Instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-500' },
    { value: 'WhatsApp', label: 'WhatsApp', icon: MessageCircle, color: 'text-green-500' },
    { value: 'Facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-500' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLeadForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSocialHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (newSocialHandle.platform === 'WhatsApp') {
      const whatsappRegex = /^[\d\s\+\-\(\)]+$/;
      if (value === '' || whatsappRegex.test(value)) {
        setNewSocialHandle(prev => ({ ...prev, handle: value }));
      }
    } else {
      setNewSocialHandle(prev => ({ ...prev, handle: value }));
    }
  };

  const addSocialHandle = () => {
    if (newSocialHandle.platform && newSocialHandle.handle) {
      setLeadForm(prev => ({
        ...prev,
        socialMediaHandles: [...prev.socialMediaHandles, { ...newSocialHandle }]
      }));
      setNewSocialHandle({ platform: '', handle: '' });
    }
  };

  const removeSocialHandle = (index: number) => {
    setLeadForm(prev => ({
      ...prev,
      socialMediaHandles: prev.socialMediaHandles.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitLead = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('New Lead:', leadForm);
    setLeadForm({
      name: '',
      email: '',
      phone: '',
      source: '',
      socialMedia: '',
      socialMediaHandles: [],
      status: 'New Lead',
      interest: '',
      notes: ''
    });
    setShowAddLeadModal(false);
  };

  // CRM Stats
  const crmStats = [
    {
      title: 'Total Leads',
      value: '156',
      change: '+12.5%',
      icon: UserPlus,
      gradient: 'from-blue-500 to-indigo-600',
      description: 'from last month'
    },
    {
      title: 'Active Deals',
      value: '24',
      change: '+8.2%',
      icon: Target,
      gradient: 'from-emerald-500 to-teal-500',
      description: 'in pipeline'
    },
    {
      title: 'Conversion Rate',
      value: '18.5%',
      change: '+2.1%',
      icon: TrendingUp,
      gradient: 'from-purple-500 to-pink-500',
      description: 'this month'
    },
    {
      title: 'Revenue',
      value: '₹2.4L',
      change: '+15.3%',
      icon: DollarSign,
      gradient: 'from-orange-500 to-red-500',
      description: 'this month'
    }
  ];

  // Smart Navigation with shorter names
  const navigation = [
    { name: 'Dashboard', id: 'overview', icon: BarChart3, badge: 'Live' },
    { name: 'Leads', id: 'leads', icon: UserPlus, badge: '12 New' },
    { name: 'Customers', id: 'customers', icon: Users },
    { name: 'Pipeline', id: 'sales', icon: Target, badge: '5 Active' },
    { name: 'Messages', id: 'social-chat', icon: MessageSquare, badge: '3 Unread' },
    { name: 'Tasks', id: 'tasks', icon: Calendar },
    { name: 'Reports', id: 'analytics', icon: Activity, badge: 'Pro' },
    { name: 'Settings', id: 'settings', icon: Settings }
  ];

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showMobileMenu && !target.closest('.mobile-menu-container')) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMobileMenu]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Left Section */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 lg:space-x-8">
              {/* Logo & Title */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Desert to Mountains</h1>
                  <p className="text-sm text-gray-500">Customer Relationship Management</p>
                </div>
              </div>
              
              {/* Back to Website Button */}
              <Link 
                href="/"
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors duration-200 w-fit"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium">Back to Website</span>
              </Link>
            </div>
            
            {/* Right Section */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Search */}
              <div className="hidden md:flex relative flex-1 max-w-sm">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search leads, customers..."
                  className="pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              
              {/* Notifications */}
              <button className="relative p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                <Bell className="w-5 h-5 text-gray-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>
              
              {/* User Profile */}
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">A</span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">Admin</p>
                  <p className="text-xs text-gray-500">CRM Manager</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-6 py-4 rounded-xl transition-all duration-300 flex items-center space-x-2 cursor-pointer border-b-2 whitespace-nowrap ${
                  activeTab === item.id
                    ? 'border-amber-500 text-amber-700 bg-amber-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <item.icon className={`w-4 h-4 ${
                  activeTab === item.id ? 'text-amber-600' : 'text-gray-500'
                }`} />
                <span className="font-medium">{item.name}</span>
                {item.badge && (
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                    activeTab === item.id 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <div className="flex items-center justify-between py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {navigation.find(item => item.id === activeTab)?.name}
              </h2>
              <div className="relative mobile-menu-container">
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                >
                  <span className="text-sm font-medium text-gray-700">Menu</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                
                {showMobileMenu && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                    <div className="py-2">
                      {navigation.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            setShowMobileMenu(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 ${
                            activeTab === item.id ? 'bg-amber-50 text-amber-700' : 'text-gray-700'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <item.icon className={`w-4 h-4 ${
                              activeTab === item.id ? 'text-amber-600' : 'text-gray-500'
                            }`} />
                            <span className="font-medium">{item.name}</span>
                          </div>
                          {item.badge && (
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                              activeTab === item.id 
                                ? 'bg-amber-100 text-amber-700' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl border border-amber-200 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Welcome back! 👋</h2>
                  <p className="text-base sm:text-lg text-gray-600">Here's what's happening with your business today.</p>
                </div>
                <div className="flex items-center space-x-3 px-4 sm:px-6 py-3 bg-white rounded-2xl shadow-sm">
                  <Calendar className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {crmStats.map((stat, index) => (
                <div key={index} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center`}>
                      <stat.icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">{stat.title}</h3>
                  <p className="text-3xl font-bold text-gray-900 mb-3">{stat.value}</p>
                  <div className="flex items-center space-x-2">
                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-semibold text-emerald-600">{stat.change}</span>
                    <span className="text-sm text-gray-500">{stat.description}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Recent Leads */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Recent Leads</h3>
                  <button 
                    onClick={() => setShowAddLeadModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Lead</span>
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <UserPlus className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Rahul Sharma</p>
                        <p className="text-sm text-gray-500">Interested in Aura Wall Putty</p>
                        <p className="text-xs text-gray-400">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Hot Lead
                      </span>
                      <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200">
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Target className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Priya Patel</p>
                        <p className="text-sm text-gray-500">Bulk order inquiry</p>
                        <p className="text-xs text-gray-400">4 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Qualified
                      </span>
                      <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200">
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
                <div className="space-y-4">
                  <button 
                    onClick={() => setShowAddLeadModal(true)}
                    className="w-full flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 hover:from-emerald-100 hover:to-teal-100 transition-all duration-300"
                  >
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Add New Lead</p>
                      <p className="text-sm text-gray-500">Capture potential customer</p>
                    </div>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Schedule Call</p>
                      <p className="text-sm text-gray-500">Book customer meeting</p>
                    </div>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 hover:from-purple-100 hover:to-pink-100 transition-all duration-300">
                    <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Create Quote</p>
                      <p className="text-sm text-gray-500">Generate price proposal</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Lead Management</h2>
                <p className="text-gray-600">Track and manage your potential customers effectively.</p>
              </div>
              <button 
                onClick={() => setShowAddLeadModal(true)}
                className="px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors duration-200 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Lead</span>
              </button>
            </div>
            <div className="text-center py-16">
              <UserPlus className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Lead Management Coming Soon</h3>
              <p className="text-gray-600 max-w-md mx-auto">Advanced lead tracking, scoring, and management features will be implemented here.</p>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Database</h2>
            <div className="text-center py-16">
              <Users className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Customer Management Coming Soon</h3>
              <p className="text-gray-600 max-w-md mx-auto">Complete customer profiles, purchase history, and relationship management will be implemented here.</p>
            </div>
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Sales Pipeline</h2>
            <div className="text-center py-16">
              <Target className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Sales Management Coming Soon</h3>
              <p className="text-gray-600 max-w-md mx-auto">Deal tracking, pipeline management, and sales forecasting will be implemented here.</p>
            </div>
          </div>
        )}

        {activeTab === 'social-chat' && (
          <MockChatCRM />
        )}

        {activeTab === 'tasks' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Task Management</h2>
            <div className="text-center py-16">
              <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Task Management Coming Soon</h3>
              <p className="text-gray-600 max-w-md mx-auto">Follow-up tasks, reminders, and activity tracking will be implemented here.</p>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics & Reports</h2>
            <div className="text-center py-16">
              <Activity className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Analytics Coming Soon</h3>
              <p className="text-gray-600 max-w-md mx-auto">Advanced reporting, performance metrics, and business insights will be implemented here.</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">CRM Settings</h2>
            <div className="text-center py-16">
              <Settings className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Settings Coming Soon</h3>
              <p className="text-gray-600 max-w-md mx-auto">CRM configuration, user management, and system preferences will be implemented here.</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Lead Modal */}
      {showAddLeadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-8 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Add New Lead</h3>
                  <p className="text-gray-500">Enter lead information</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddLeadModal(false)}
                className="p-3 hover:bg-gray-100 rounded-xl transition-colors duration-200"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitLead} className="p-8 space-y-8">
              {/* Personal Information */}
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Users className="w-5 h-5 mr-3 text-emerald-600" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={leadForm.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={leadForm.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={leadForm.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
              </div>

              {/* Lead Details */}
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-3 text-purple-600" />
                  Lead Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Lead Source *</label>
                    <select
                      name="source"
                      value={leadForm.source}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                    >
                      <option value="" className="text-gray-500">Select source</option>
                      <option value="Website" className="text-gray-900">Website</option>
                      <option value="Referral" className="text-gray-900">Referral</option>
                      <option value="Social Media" className="text-gray-900">Social Media</option>
                      <option value="Cold Call" className="text-gray-900">Cold Call</option>
                      <option value="Trade Show" className="text-gray-900">Trade Show</option>
                      <option value="Other" className="text-gray-900">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Status *</label>
                    <select
                      name="status"
                      value={leadForm.status}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                    >
                      <option value="New Lead" className="text-gray-900">New Lead</option>
                      <option value="Contacted" className="text-gray-900">Contacted</option>
                      <option value="Qualified" className="text-gray-900">Qualified</option>
                      <option value="Proposal Sent" className="text-gray-900">Proposal Sent</option>
                      <option value="Negotiation" className="text-gray-900">Negotiation</option>
                      <option value="Closed Won" className="text-gray-900">Closed Won</option>
                      <option value="Closed Lost" className="text-gray-900">Closed Lost</option>
                    </select>
                  </div>
                </div>

                {/* Social Media Section */}
                {leadForm.source === 'Social Media' && (
                  <div className="mt-6">
                    <h5 className="text-lg font-semibold text-gray-900 mb-4">Social Media Handles</h5>
                    
                    {/* Existing social handles */}
                    {leadForm.socialMediaHandles && leadForm.socialMediaHandles.length > 0 && (
                      <div className="space-y-3 mb-4">
                        <label className="block text-sm font-semibold text-gray-700">Social Media Handles:</label>
                        <div className="space-y-3">
                          {leadForm.socialMediaHandles.map((handle, index) => {
                            const platform = socialPlatforms.find(p => p.value === handle.platform);
                            const IconComponent = platform?.icon;
                            return (
                              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center space-x-3">
                                  {IconComponent && (
                                    <IconComponent className={`w-5 h-5 ${platform?.color}`} />
                                  )}
                                  <span className="text-sm font-semibold text-gray-700">{handle.platform}:</span>
                                  <span className="text-sm text-gray-600">{handle.handle}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeSocialHandle(index)}
                                  className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Add new social handle */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowPlatformDropdown(!showPlatformDropdown)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 bg-white flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            {newSocialHandle.platform ? (
                              <>
                                {(() => {
                                  const platform = socialPlatforms.find(p => p.value === newSocialHandle.platform);
                                  const IconComponent = platform?.icon;
                                  return IconComponent ? (
                                    <IconComponent className={`w-5 h-5 ${platform.color}`} />
                                  ) : null;
                                })()}
                                <span className="font-medium">{newSocialHandle.platform}</span>
                              </>
                            ) : (
                              <span className="text-gray-500">Select platform</span>
                            )}
                          </div>
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>
                        
                        {showPlatformDropdown && (
                          <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-xl shadow-lg">
                            {socialPlatforms.map((platform) => {
                              const IconComponent = platform.icon;
                              return (
                                <button
                                  key={platform.value}
                                  type="button"
                                  onClick={() => {
                                    setNewSocialHandle(prev => ({ ...prev, platform: platform.value }));
                                    setShowPlatformDropdown(false);
                                  }}
                                  className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 text-left"
                                >
                                  <IconComponent className={`w-5 h-5 ${platform.color}`} />
                                  <span className="text-gray-900 font-medium">{platform.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <div>
                        <input
                          type={newSocialHandle.platform === 'WhatsApp' ? 'tel' : 'url'}
                          value={newSocialHandle.handle}
                          onChange={handleSocialHandleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          placeholder={
                            newSocialHandle.platform === 'WhatsApp' 
                              ? 'Enter WhatsApp number' 
                              : newSocialHandle.platform === 'Instagram'
                              ? 'Enter Instagram profile URL'
                              : newSocialHandle.platform === 'Facebook'
                              ? 'Enter Facebook profile URL'
                              : 'Enter username/handle'
                          }
                        />
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={addSocialHandle}
                          className="w-full px-4 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors duration-200 flex items-center justify-center space-x-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span>{newSocialHandle.platform === 'WhatsApp' ? 'Add Number' : 'Add Handle'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Product Interest *</label>
                  <select
                    name="interest"
                    value={leadForm.interest}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                  >
                    <option value="" className="text-gray-500">Select product</option>
                    <option value="Aura Wall Putty" className="text-gray-900">Aura Wall Putty</option>
                    <option value="Dhunee" className="text-gray-900">Dhunee</option>
                    <option value="Both" className="text-gray-900">Both</option>
                  </select>
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Notes</label>
                  <textarea
                    name="notes"
                    value={leadForm.notes}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
                    placeholder="Add any additional notes about this lead..."
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-4 pt-8 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg font-medium flex items-center space-x-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Lead</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 