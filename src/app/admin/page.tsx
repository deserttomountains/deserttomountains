"use client";

import { useState } from 'react';
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
  Facebook
} from 'lucide-react';
import Link from 'next/link';

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
    // For WhatsApp, only allow digits, spaces, +, and -
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
    // Here you would typically send the data to your backend
    console.log('New Lead:', leadForm);
    // Reset form and close modal
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

  const stats = [
    {
      title: 'Total Revenue',
      value: '₹1,25,000',
      change: '+12.5%',
      icon: DollarSign,
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      title: 'Total Orders',
      value: '156',
      change: '+8.2%',
      icon: ShoppingCart,
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'Total Products',
      value: '24',
      change: '+2.1%',
      icon: Package,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Total Customers',
      value: '89',
      change: '+15.3%',
      icon: Users,
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  const navigation = [
    { name: 'Overview', id: 'overview', icon: BarChart3, badge: 'Live' },
    { name: 'Products', id: 'products', icon: Package },
    { name: 'Orders', id: 'orders', icon: ShoppingCart, badge: '5 New' },
    { name: 'Customers', id: 'customers', icon: Users },
    { name: 'Analytics', id: 'analytics', icon: TrendingUp, badge: 'Pro' },
    { name: 'CRM', id: 'crm', icon: MessageSquare },
    { name: 'Settings', id: 'settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Desert to Mountains</h1>
                  <p className="text-sm text-gray-500">Admin Dashboard</p>
                </div>
              </div>
              
              {/* Navigation Tabs */}
              <nav className="hidden lg:flex items-center space-x-1">
                {navigation.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`px-4 py-2 rounded-xl transition-all duration-300 flex items-center space-x-2 cursor-pointer border ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-200/50'
                        : 'hover:bg-white/50 border-transparent'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${
                      activeTab === item.id ? 'text-amber-700' : 'text-gray-700'
                    }`} />
                    <span className={`font-medium ${
                      activeTab === item.id ? 'text-gray-900' : 'text-gray-800'
                    }`}>{item.name}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 bg-white/50 border border-white/20 rounded-xl w-64"
                />
              </div>
              
              <button className="relative p-3 rounded-xl bg-white/50 border border-white/20">
                <Bell className="w-5 h-5 text-gray-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>
              
              <div className="flex items-center space-x-3 p-2 rounded-xl bg-white/50 border border-white/20">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">A</span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">Admin</p>
                  <p className="text-xs text-gray-500">Super Admin</p>
                </div>
              </div>
              
              <button className="lg:hidden p-3 rounded-xl bg-white/50 border border-white/20">
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-6 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="backdrop-blur-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-200/30 p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Admin! 👋</h2>
                  <p className="text-gray-600">Here's what's happening with your store today.</p>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-white/50 rounded-xl">
                  <Calendar className="w-4 h-4 text-gray-600" />
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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="backdrop-blur-xl bg-white/50 rounded-2xl border border-white/20 p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
                  <p className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</p>
                  <div className="flex items-center space-x-2">
                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-semibold text-emerald-600">{stat.change}</span>
                    <span className="text-sm text-gray-500">from last month</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 backdrop-blur-xl bg-white/50 rounded-2xl border border-white/20 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Orders</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Rahul Sharma</p>
                        <p className="text-sm text-gray-500">Order #DTM001</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₹2,500</p>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Delivered
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/50 rounded-2xl border border-white/20 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-200/30">
                    <Plus className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-gray-700">Add Product</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200/30">
                    <Download className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Export Data</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'crm' && (
          <div className="space-y-8">
            {/* CRM Header */}
            <div className="backdrop-blur-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl border border-indigo-200/30 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Customer Relationship Management</h2>
                  <p className="text-gray-600">Manage customer interactions, leads, and communications effectively.</p>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-white/50 rounded-xl">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-medium text-gray-700">Active Conversations: 12</span>
                </div>
              </div>
              
              {/* CRM Search and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0 mb-4">
                <div className="flex items-center bg-white/90 shadow-sm border border-gray-200 rounded-full px-2 py-1 space-x-2 w-full max-w-xl">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-500" />
                    <input
                      type="text"
                      placeholder="Search leads, customers, or interactions..."
                      className="pl-10 pr-4 py-2 bg-transparent rounded-full w-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                  <div className="relative">
                    <select className="appearance-none px-4 py-2 bg-transparent rounded-full text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 border-none pr-8 cursor-pointer">
                      <option>All Leads</option>
                      <option>Hot Leads</option>
                      <option>Warm Leads</option>
                      <option>Qualified</option>
                      <option>Customers</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <button onClick={() => setShowAddLeadModal(true)} className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full shadow-md hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 cursor-pointer">
                  <UserPlus className="w-4 h-4" />
                  <span className="font-medium">Add Lead</span>
                </button>
              </div>
            </div>

            {/* CRM Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="backdrop-blur-xl bg-white/50 rounded-2xl border border-white/20 p-6 shadow-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">New Leads</h3>
                <p className="text-2xl font-bold text-gray-900 mb-2">24</p>
                <div className="flex items-center space-x-2">
                  <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-600">+18.5%</span>
                  <span className="text-sm text-gray-500">this week</span>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/50 rounded-2xl border border-white/20 p-6 shadow-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Calls Made</h3>
                <p className="text-2xl font-bold text-gray-900 mb-2">156</p>
                <div className="flex items-center space-x-2">
                  <ArrowUpRight className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-semibold text-blue-600">+12.3%</span>
                  <span className="text-sm text-gray-500">this month</span>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/50 rounded-2xl border border-white/20 p-6 shadow-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Emails Sent</h3>
                <p className="text-2xl font-bold text-gray-900 mb-2">89</p>
                <div className="flex items-center space-x-2">
                  <ArrowUpRight className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-semibold text-purple-600">+8.7%</span>
                  <span className="text-sm text-gray-500">this week</span>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/50 rounded-2xl border border-white/20 p-6 shadow-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Deals Closed</h3>
                <p className="text-2xl font-bold text-gray-900 mb-2">12</p>
                <div className="flex items-center space-x-2">
                  <ArrowUpRight className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-semibold text-orange-600">+25.4%</span>
                  <span className="text-sm text-gray-500">this month</span>
                </div>
              </div>
            </div>

            {/* CRM Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Recent Leads */}
              <div className="xl:col-span-2 backdrop-blur-xl bg-white/50 rounded-2xl border border-white/20 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-white/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                        <UserPlus className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Recent Leads</h3>
                        <p className="text-sm text-gray-500">Latest potential customers</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-200/30 rounded-xl text-emerald-700 font-medium hover:from-emerald-500/20 hover:to-teal-500/20 transition-all duration-300">
                      View all
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="group p-4 rounded-xl bg-gradient-to-r from-gray-50/50 to-white/50 border border-white/20 hover:from-gray-50/80 hover:to-white/80 transition-all duration-300 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-sm">R</span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Rahul Sharma</p>
                            <p className="text-sm text-gray-500">Interested in Aura Wall Putty</p>
                            <p className="text-xs text-gray-400">+91 98765 43210</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">2 hours ago</p>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                            Hot Lead
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="group p-4 rounded-xl bg-gradient-to-r from-gray-50/50 to-white/50 border border-white/20 hover:from-gray-50/80 hover:to-white/80 transition-all duration-300 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-sm">P</span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Priya Patel</p>
                            <p className="text-sm text-gray-500">Inquiry about Dhunee Samples</p>
                            <p className="text-xs text-gray-400">+91 87654 32109</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">4 hours ago</p>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                            Warm Lead
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="group p-4 rounded-xl bg-gradient-to-r from-gray-50/50 to-white/50 border border-white/20 hover:from-gray-50/80 hover:to-white/80 transition-all duration-300 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-sm">A</span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Amit Kumar</p>
                            <p className="text-sm text-gray-500">Bulk order inquiry</p>
                            <p className="text-xs text-gray-400">+91 76543 21098</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">6 hours ago</p>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                            Qualified
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Communication Tools */}
              <div className="backdrop-blur-xl bg-white/50 rounded-2xl border border-white/20 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-white/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Communication</h3>
                        <p className="text-sm text-gray-500">Quick actions and tools</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <button className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-200/30 hover:from-emerald-500/20 hover:to-teal-500/20 transition-all duration-300 group cursor-pointer">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Phone className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Make Call</span>
                      </div>
                    </button>
                    
                    <button className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200/30 hover:from-blue-500/20 hover:to-indigo-500/20 transition-all duration-300 group cursor-pointer">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Mail className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Send Email</span>
                      </div>
                    </button>
                    
                    <button className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200/30 hover:from-purple-500/20 hover:to-pink-500/20 transition-all duration-300 group cursor-pointer">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Send SMS</span>
                      </div>
                    </button>
                    
                    <button className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-200/30 hover:from-orange-500/20 hover:to-red-500/20 transition-all duration-300 group cursor-pointer">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Schedule</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sales Pipeline */}
            <div className="backdrop-blur-xl bg-white/50 rounded-2xl border border-white/20 shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Sales Pipeline</h3>
                    <p className="text-sm text-gray-500">Track your sales funnel</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-6 rounded-xl bg-gradient-to-r from-gray-500/10 to-gray-600/10 border border-gray-200/30">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">Prospects</h4>
                    <span className="text-2xl font-bold text-gray-900">45</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">New this week</span>
                      <span className="font-medium text-gray-900">12</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gray-500 h-2 rounded-full" style={{width: '60%'}}></div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200/30">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">Qualified</h4>
                    <span className="text-2xl font-bold text-gray-900">28</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Conversion rate</span>
                      <span className="font-medium text-gray-900">62%</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '62%'}}></div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200/30">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">Proposals</h4>
                    <span className="text-2xl font-bold text-gray-900">18</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Pending review</span>
                      <span className="font-medium text-gray-900">8</span>
                    </div>
                    <div className="w-full bg-purple-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{width: '45%'}}></div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-200/30">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">Closed</h4>
                    <span className="text-2xl font-bold text-gray-900">12</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">This month</span>
                      <span className="font-medium text-gray-900">₹2.4L</span>
                    </div>
                    <div className="w-full bg-emerald-200 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{width: '75%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs */}
        {activeTab === 'products' && (
          <div className="backdrop-blur-xl bg-white/50 rounded-2xl border border-white/20 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Products Management</h2>
            <p className="text-gray-600">Advanced products management features will be implemented here.</p>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="backdrop-blur-xl bg-white/50 rounded-2xl border border-white/20 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Orders Management</h2>
            <p className="text-gray-600">Advanced orders management features will be implemented here.</p>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="backdrop-blur-xl bg-white/50 rounded-2xl border border-white/20 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Customers Management</h2>
            <p className="text-gray-600">Advanced customers management features will be implemented here.</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="backdrop-blur-xl bg-white/50 rounded-2xl border border-white/20 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics Dashboard</h2>
            <p className="text-gray-600">Advanced analytics and reporting features will be implemented here.</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="backdrop-blur-xl bg-white/50 rounded-2xl border border-white/20 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
            <p className="text-gray-600">Store configuration and settings will be implemented here.</p>
          </div>
        )}
      </div>

      {/* Add Lead Modal */}
      {showAddLeadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Add New Lead</h3>
                  <p className="text-sm text-gray-500">Enter lead information</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddLeadModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitLead} className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="w-4 h-4 mr-2 text-emerald-600" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={leadForm.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder-gray-600"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={leadForm.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder-gray-600"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={leadForm.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder-gray-600"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
              </div>

              {/* Lead Details */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2 text-purple-600" />
                  Lead Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lead Source *</label>
                    <select
                      name="source"
                      value={leadForm.source}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                    >
                      <option value="" className="text-gray-600">Select source</option>
                      <option value="Website" className="text-gray-900">Website</option>
                      <option value="Referral" className="text-gray-900">Referral</option>
                      <option value="Social Media" className="text-gray-900">Social Media</option>
                      <option value="Cold Call" className="text-gray-900">Cold Call</option>
                      <option value="Trade Show" className="text-gray-900">Trade Show</option>
                      <option value="Other" className="text-gray-900">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                    <select
                      name="status"
                      value={leadForm.status}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
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

                {/* Social Media Section - Only show if Social Media is selected */}
                {leadForm.source === 'Social Media' && (
                  <div className="mt-4">
                    <h5 className="text-md font-medium text-gray-900 mb-3">Social Media Handles</h5>
                    
                    {/* Existing social handles */}
                    {leadForm.socialMediaHandles && leadForm.socialMediaHandles.length > 0 && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Social Media Handles:</label>
                        <div className="space-y-2">
                          {leadForm.socialMediaHandles.map((handle, index) => {
                            const platform = socialPlatforms.find(p => p.value === handle.platform);
                            const IconComponent = platform?.icon;
                            return (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-2">
                                  {IconComponent && (
                                    <IconComponent className={`w-4 h-4 ${platform?.color}`} />
                                  )}
                                  <span className="text-sm font-medium text-gray-700">{handle.platform}:</span>
                                  <span className="text-sm text-gray-600">{handle.handle}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeSocialHandle(index)}
                                  className="text-red-500 hover:text-red-700"
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowPlatformDropdown(!showPlatformDropdown)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 bg-white flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-2">
                            {newSocialHandle.platform ? (
                              <>
                                {(() => {
                                  const platform = socialPlatforms.find(p => p.value === newSocialHandle.platform);
                                  const IconComponent = platform?.icon;
                                  return IconComponent ? (
                                    <IconComponent className={`w-4 h-4 ${platform.color}`} />
                                  ) : null;
                                })()}
                                <span>{newSocialHandle.platform}</span>
                              </>
                            ) : (
                              <span className="text-gray-500">Select platform</span>
                            )}
                          </div>
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>
                        
                        {showPlatformDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
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
                                  className="w-full px-3 py-2 flex items-center space-x-2 hover:bg-gray-50 text-left"
                                >
                                  <IconComponent className={`w-4 h-4 ${platform.color}`} />
                                  <span className="text-gray-900">{platform.label}</span>
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder-gray-600"
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
                          className="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors duration-200 cursor-pointer flex items-center justify-center space-x-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span>{newSocialHandle.platform === 'WhatsApp' ? 'Add Number' : 'Add Handle'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Interest *</label>
                  <select
                    name="interest"
                    value={leadForm.interest}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                  >
                    <option value="" className="text-gray-600">Select product</option>
                    <option value="Aura Wall Putty" className="text-gray-900">Aura Wall Putty</option>
                    <option value="Dhunee" className="text-gray-900">Dhunee</option>
                    <option value="Both" className="text-gray-900">Both</option>
                  </select>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    name="notes"
                    value={leadForm.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-600"
                    placeholder="Add any additional notes about this lead..."
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg cursor-pointer flex items-center space-x-2"
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