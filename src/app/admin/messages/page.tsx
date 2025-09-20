/**
 * Campaign-Centric Messages Page
 * Redesigned to focus on campaigns as the primary use case
 */

"use client";

import { useState, useEffect } from 'react';
import { AuthService, auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastContext';
import { useAuth } from '@/lib/hooks/useAuth';
import AdminLayout from '../components/AdminLayout';
import { 
  MessageSquare, 
  Send, 
  Phone, 
  Instagram, 
  Clock, 
  User, 
  Filter, 
  Plus, 
  BarChart3, 
  Users, 
  Mail,
  Calendar,
  Play,
  Pause,
  Trash2,
  Eye,
  Edit
} from 'lucide-react';
import { 
  Thread, 
  Message, 
  Campaign, 
  Contact, 
  CreateCampaignRequest,
  CampaignListRequest,
  ContactListRequest
} from '@/lib/messaging/types';
import { getAvailableTemplates, WhatsAppTemplate } from '@/lib/messaging/templates';
import CreateCampaignModal from './components/CreateCampaignModal';
import CreateContactModal from './components/CreateContactModal';
import ViewEditContactModal from './components/ViewEditContactModal';
import AnalyticsDashboard from './components/AnalyticsDashboard';

function MessagesPageContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Campaign state
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [campaignFilters, setCampaignFilters] = useState({
    status: '',
    type: '',
    channel: ''
  });

  // Contact state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [contactFilters, setContactFilters] = useState({
    status: '',
    tags: [] as string[],
    groups: [] as string[]
  });
  const [contactSearch, setContactSearch] = useState('');
  const [contactPagination, setContactPagination] = useState({
    currentPage: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0
  });

  // Thread state (for individual conversations)
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templateVars, setTemplateVars] = useState<Record<string, string>>({});
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);

  // UI state
  const [activeTab, setActiveTab] = useState<'campaigns' | 'conversations' | 'contacts' | 'analytics'>('campaigns');
  const [showCreateContact, setShowCreateContact] = useState(false);
  const [showViewEditContact, setShowViewEditContact] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [viewEditMode, setViewEditMode] = useState<'view' | 'edit'>('view');

  const router = useRouter();
  const { showToast } = useToast();

  // Load user profile and initial data
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

    const loadTemplates = () => {
      setTemplates(getAvailableTemplates());
    };

    const loadData = async () => {
      try {
        await loadCampaigns();
        await loadContacts();
        await loadThreads();
        loadTemplates();
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoading(false);
      }
    };

    loadUserProfile();
    loadData();
  }, []);

  // Debounced search for contacts
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (activeTab === 'contacts') {
        loadContacts(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [contactSearch, contactFilters]);

  // Load campaigns
  const loadCampaigns = async () => {
    try {
      const params = new URLSearchParams();
      if (campaignFilters.status) params.append('status', campaignFilters.status);
      if (campaignFilters.type) params.append('type', campaignFilters.type);
      if (campaignFilters.channel) params.append('channel', campaignFilters.channel);
      params.append('limit', '50');

      const response = await fetch(`/api/campaigns?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setCampaigns(data.data.campaigns);
      } else {
        showToast('Error loading campaigns', 'error');
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
      showToast('Error loading campaigns', 'error');
    }
  };


  // Load contacts
  const loadContacts = async (page = contactPagination.currentPage) => {
    try {
      const params = new URLSearchParams();
      if (contactFilters.status) params.append('status', contactFilters.status);
      if (contactFilters.tags.length > 0) params.append('tags', contactFilters.tags.join(','));
      if (contactFilters.groups.length > 0) params.append('groups', contactFilters.groups.join(','));
      if (contactSearch.trim()) params.append('search', contactSearch.trim());
      params.append('limit', contactPagination.pageSize.toString());
      params.append('offset', ((page - 1) * contactPagination.pageSize).toString());

      const response = await fetch(`/api/contacts?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        console.log('Contacts API Response:', data);
        setContacts(data.data.contacts);
        setContactPagination(prev => ({
          ...prev,
          currentPage: page,
          totalCount: data.data.total || 0,
          totalPages: Math.ceil((data.data.total || 0) / contactPagination.pageSize)
        }));
      } else {
        showToast('Error loading contacts', 'error');
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      showToast('Error loading contacts', 'error');
    }
  };

  // Load threads
  const loadThreads = async () => {
    try {
      const params = new URLSearchParams();
      params.append('limit', '50');

      const response = await fetch(`/api/messages/threads?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setThreads(data.threads);
      } else {
        showToast('Error loading threads', 'error');
      }
    } catch (error) {
      console.error('Error loading threads:', error);
      showToast('Error loading threads', 'error');
    }
  };

  // Load messages for selected thread
  const loadMessages = async (threadId: string) => {
    try {
      const response = await fetch(`/api/messages/messages?threadId=${threadId}&limit=100`);
      const data = await response.json();
      
      if (response.ok) {
        setMessages(data.messages);
      } else {
        showToast('Error loading messages', 'error');
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      showToast('Error loading messages', 'error');
    }
  };

  // Campaign management functions
  const handleCreateCampaign = async (campaignData: CreateCampaignRequest) => {
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(campaignData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create campaign');
      }

      const result = await response.json();

      if (result.success) {
        showToast('Campaign created successfully', 'success');
        setShowCreateCampaign(false);
        await loadCampaigns();
      } else {
        throw new Error(result.error || 'Failed to create campaign');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error; // Re-throw to let the modal handle the error display
    }
  };

  const handleExecuteCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/execute`, {
        method: 'POST'
      });

      const result = await response.json();

      if (result.success) {
        showToast('Campaign execution started', 'success');
        await loadCampaigns();
      } else {
        showToast(result.error || 'Failed to execute campaign', 'error');
      }
    } catch (error) {
      console.error('Error executing campaign:', error);
      showToast('Error executing campaign', 'error');
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) {
      return;
    }

    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        showToast('Campaign deleted successfully', 'success');
        await loadCampaigns();
      } else {
        showToast(result.error || 'Failed to delete campaign', 'error');
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      showToast('Error deleting campaign', 'error');
    }
  };

  // Contact management functions
  const handleCreateContact = async (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create contact');
      }

      const result = await response.json();

      if (result.success) {
        showToast('Contact created successfully', 'success');
        setShowCreateContact(false);
        await loadContacts();
      } else {
        throw new Error(result.error || 'Failed to create contact');
      }
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error; // Re-throw to let the modal handle the error display
    }
  };

  const handleUpdateContact = async (contactId: string, contactData: Partial<Contact>) => {
    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update contact');
      }

      const result = await response.json();

      if (result.success) {
        showToast('Contact updated successfully', 'success');
        await loadContacts();
        // Update the selected contact data
        setSelectedContact(result.data);
      } else {
        throw new Error(result.error || 'Failed to update contact');
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error; // Re-throw to let the modal handle the error display
    }
  };

  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact);
    setViewEditMode('view');
    setShowViewEditContact(true);
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setViewEditMode('edit');
    setShowViewEditContact(true);
  };

  // Handle thread selection
  const handleThreadSelect = (thread: Thread) => {
    setSelectedThread(thread);
    loadMessages(thread.id);
  };

  // Send message
  const sendMessage = async () => {
    if (!selectedThread || (!newMessage && !selectedTemplate)) {
      showToast('Please enter a message or select a template', 'error');
      return;
    }

    try {
      const payload: any = {
        channel: selectedThread.channels[0], // Use first channel for now
        threadId: selectedThread.id
      };

      if (selectedTemplate) {
        payload.template = {
          name: selectedTemplate,
          lang: 'en',
          vars: templateVars
        };
      } else {
        payload.text = newMessage;
      }

      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        setNewMessage('');
        setSelectedTemplate('');
        setTemplateVars({});
        await loadMessages(selectedThread.id);
        showToast('Message sent successfully', 'success');
      } else {
        showToast(result.error || 'Failed to send message', 'error');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showToast('Error sending message', 'error');
    }
  };

  // Handle template selection
  const handleTemplateSelect = (templateName: string) => {
    setSelectedTemplate(templateName);
    const template = templates.find(t => t.name === templateName);
    if (template) {
      const vars: Record<string, string> = {};
      template.requiredVars.forEach((v: string) => {
        vars[v] = '';
      });
      setTemplateVars(vars);
    }
  };

  // Handle template variable change
  const handleTemplateVarChange = (key: string, value: string) => {
    setTemplateVars(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleLogout = async () => {
    try {
      await AuthService.signOut();
      router.push('/logout');
      showToast('Logged out successfully', 'success');
    } catch (error) {
      console.error('Error logging out:', error);
      showToast('Error logging out', 'error');
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
      <div className="flex flex-col lg:flex-row h-screen bg-gray-50">
        {/* Mobile Tab Navigation */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'campaigns'
                  ? 'bg-[#D4AF37] text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Campaigns</span>
            </button>
            
            <button
              onClick={() => setActiveTab('conversations')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'conversations'
                  ? 'bg-[#D4AF37] text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Chats</span>
            </button>
            
            <button
              onClick={() => setActiveTab('contacts')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'contacts'
                  ? 'bg-[#D4AF37] text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Contacts</span>
            </button>
            
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-[#D4AF37] text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </button>
          </div>
        </div>

        {/* Desktop Left Sidebar - Navigation */}
        <div className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Messaging</h2>
            
            {/* Tab Navigation */}
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('campaigns')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                  activeTab === 'campaigns'
                    ? 'bg-[#D4AF37] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Mail className="w-5 h-5" />
                Campaigns
              </button>
              
              <button
                onClick={() => setActiveTab('conversations')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                  activeTab === 'conversations'
                    ? 'bg-[#D4AF37] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                Conversations
              </button>
              
              <button
                onClick={() => setActiveTab('contacts')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                  activeTab === 'contacts'
                    ? 'bg-[#D4AF37] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Users className="w-5 h-5" />
                Contacts
              </button>
              
              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                  activeTab === 'analytics'
                    ? 'bg-[#D4AF37] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                Analytics
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {activeTab === 'campaigns' && (
                <button
                  onClick={() => setShowCreateCampaign(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-[#D4AF37] text-white rounded-md hover:bg-[#8B7A1A] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Campaign
                </button>
              )}
              
              {activeTab === 'contacts' && (
                <button
                  onClick={() => setShowCreateContact(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-[#D4AF37] text-white rounded-md hover:bg-[#8B7A1A] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Contact
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex-1 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Filters</h3>
            
            {activeTab === 'campaigns' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={campaignFilters.status}
                    onChange={(e) => setCampaignFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  >
                    <option value="">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="sending">Sending</option>
                    <option value="sent">Sent</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={campaignFilters.type}
                    onChange={(e) => setCampaignFilters(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  >
                    <option value="">All Types</option>
                    <option value="marketing">Marketing</option>
                    <option value="announcement">Announcement</option>
                    <option value="followup">Follow-up</option>
                    <option value="support">Support</option>
                  </select>
                </div>
                
                <button
                  onClick={loadCampaigns}
                  className="w-full px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            )}

            {activeTab === 'contacts' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    placeholder="Search contacts..."
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={contactFilters.status}
                    onChange={(e) => setContactFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="unsubscribed">Unsubscribed</option>
                  </select>
                </div>
                
                <button
                  onClick={() => loadContacts(1)}
                  className="w-full px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {activeTab === 'campaigns' && (
            <div className="flex-1 p-3 sm:p-4 lg:p-6">
              {/* Mobile Header with Action Button */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Campaigns</h1>
                <button
                  onClick={() => setShowCreateCampaign(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-[#D4AF37] text-white rounded-md hover:bg-[#8B7A1A] transition-colors w-full sm:w-auto"
                >
                  <Plus className="w-5 h-5" />
                  <span className="sm:hidden">New Campaign</span>
                  <span className="hidden sm:inline">Create Campaign</span>
                </button>
              </div>

              {/* Mobile Filters */}
              <div className="lg:hidden mb-6">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Filters</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={campaignFilters.status}
                        onChange={(e) => setCampaignFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                      >
                        <option value="">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="sending">Sending</option>
                        <option value="sent">Sent</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={campaignFilters.type}
                        onChange={(e) => setCampaignFilters(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                      >
                        <option value="">All Types</option>
                        <option value="marketing">Marketing</option>
                        <option value="announcement">Announcement</option>
                        <option value="followup">Follow-up</option>
                        <option value="support">Support</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={loadCampaigns}
                    className="w-full mt-3 px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>

              {/* Campaign Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Campaigns</p>
                      <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Play className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Active</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {campaigns.filter(c => c.status === 'sending').length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Scheduled</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {campaigns.filter(c => c.status === 'scheduled').length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {campaigns.filter(c => c.status === 'sent').length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Campaign List */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Campaigns</h3>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="p-3 sm:p-4 hover:bg-gray-50">
                      {/* Mobile Layout */}
                      <div className="lg:hidden">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">{campaign.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                campaign.status === 'sent' ? 'bg-green-100 text-green-800' :
                                campaign.status === 'sending' ? 'bg-blue-100 text-blue-800' :
                                campaign.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                                campaign.status === 'failed' ? 'bg-red-100 text-red-800' :
                                campaign.status === 'paused' ? 'bg-orange-100 text-orange-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                              </span>
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                {campaign.type}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            {campaign.status === 'draft' && (
                              <button
                                onClick={() => handleExecuteCampaign(campaign.id)}
                                className="p-2 text-green-600 hover:bg-green-100 rounded"
                                title="Execute Campaign"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            {campaign.channel === 'whatsapp' && <Phone className="w-4 h-4 text-green-600" />}
                            {campaign.channel === 'instagram' && <Instagram className="w-4 h-4 text-pink-600" />}
                            {campaign.channel === 'email' && <Mail className="w-4 h-4 text-blue-600" />}
                            {campaign.channel === 'multi' && <Users className="w-4 h-4 text-purple-600" />}
                            <span className="capitalize">{campaign.channel}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {campaign.recipients.totalCount} recipients
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {new Date(campaign.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {/* Campaign Stats for Mobile */}
                        {campaign.status === 'sent' && (
                          <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-500">
                            <div className="grid grid-cols-2 gap-2">
                              <span>Sent: {campaign.stats.sent}</span>
                              <span>Delivered: {campaign.stats.delivered}</span>
                              <span>Read: {campaign.stats.read}</span>
                              <span className="text-green-600">Delivery: {campaign.stats.deliveryRate.toFixed(1)}%</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden lg:block">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                campaign.status === 'sent' ? 'bg-green-100 text-green-800' :
                                campaign.status === 'sending' ? 'bg-blue-100 text-blue-800' :
                                campaign.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                                campaign.status === 'failed' ? 'bg-red-100 text-red-800' :
                                campaign.status === 'paused' ? 'bg-orange-100 text-orange-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                              </span>
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                {campaign.type}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center gap-1">
                                {campaign.channel === 'whatsapp' && <Phone className="w-4 h-4 text-green-600" />}
                                {campaign.channel === 'instagram' && <Instagram className="w-4 h-4 text-pink-600" />}
                                {campaign.channel === 'email' && <Mail className="w-4 h-4 text-blue-600" />}
                                {campaign.channel === 'multi' && <Users className="w-4 h-4 text-purple-600" />}
                                {campaign.channel}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {campaign.recipients.totalCount} recipients
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {new Date(campaign.createdAt).toLocaleDateString()}
                              </div>
                            </div>

                            {/* Campaign Stats */}
                            {campaign.status === 'sent' && (
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>Sent: {campaign.stats.sent}</span>
                                <span>Delivered: {campaign.stats.delivered}</span>
                                <span>Read: {campaign.stats.read}</span>
                                <span>Failed: {campaign.stats.failed}</span>
                                <span className="text-green-600">Delivery: {campaign.stats.deliveryRate.toFixed(1)}%</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {campaign.status === 'draft' && (
                              <button
                                onClick={() => handleExecuteCampaign(campaign.id)}
                                className="p-2 text-green-600 hover:bg-green-100 rounded"
                                title="Execute Campaign"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                            )}
                            
                            {campaign.status === 'sending' && (
                              <button
                                className="p-2 text-orange-600 hover:bg-orange-100 rounded"
                                title="Pause Campaign"
                              >
                                <Pause className="w-4 h-4" />
                              </button>
                            )}
                            
                            <button
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            <button
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                              title="Edit Campaign"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => handleDeleteCampaign(campaign.id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded"
                              title="Delete Campaign"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {campaigns.length === 0 && (
                    <div className="p-8 text-center">
                      <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
                      <p className="text-gray-500 mb-4">Create your first campaign to start messaging your contacts</p>
                      <button
                        onClick={() => setShowCreateCampaign(true)}
                        className="px-4 py-2 bg-[#D4AF37] text-white rounded-md hover:bg-[#8B7A1A] transition-colors"
                      >
                        Create Campaign
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="flex-1 p-3 sm:p-4 lg:p-6">
              {/* Mobile Header with Action Button */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Contacts</h1>
                <button
                  onClick={() => setShowCreateContact(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-[#D4AF37] text-white rounded-md hover:bg-[#8B7A1A] transition-colors w-full sm:w-auto"
                >
                  <Plus className="w-5 h-5" />
                  <span className="sm:hidden">Add Contact</span>
                  <span className="hidden sm:inline">Add Contact</span>
                </button>
              </div>

              {/* Mobile Filters */}
              <div className="lg:hidden mb-6">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Filters</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
                      <input
                        type="text"
                        value={contactSearch}
                        onChange={(e) => setContactSearch(e.target.value)}
                        placeholder="Search contacts..."
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={contactFilters.status}
                        onChange={(e) => setContactFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                      >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="unsubscribed">Unsubscribed</option>
                      </select>
                    </div>
                    <button
                      onClick={() => loadContacts(1)}
                      className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>


              {/* Contact List */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">All Contacts</h3>
                  <div className="text-sm text-gray-500">
                    Showing {contacts.length} of {contactPagination.totalCount} contacts
                  </div>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-gray-900">{contact.name}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              contact.status === 'active' ? 'bg-green-100 text-green-800' :
                              contact.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                              contact.status === 'unsubscribed' ? 'bg-red-100 text-red-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                            </span>
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              {contact.source}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            {contact.channels.whatsapp && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4 text-green-600" />
                                {contact.channels.whatsapp}
                              </div>
                            )}
                            {contact.channels.instagram && (
                              <div className="flex items-center gap-1">
                                <Instagram className="w-4 h-4 text-pink-600" />
                                {contact.channels.instagram}
                              </div>
                            )}
                            {contact.channels.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="w-4 h-4 text-blue-600" />
                                {contact.channels.email}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {new Date(contact.createdAt).toLocaleDateString()}
                            </div>
                          </div>

                          {/* Tags and Groups */}
                          <div className="flex items-center gap-2 mb-2">
                            {contact.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-1 bg-[#F5F2E8] text-[#8B7A1A] rounded-full text-xs"
                              >
                                {tag.replace(/-/g, ' ')}
                              </span>
                            ))}
                            {contact.tags.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{contact.tags.length - 3} more
                              </span>
                            )}
                          </div>

                          {contact.groups.length > 0 && (
                            <div className="flex items-center gap-2">
                              {contact.groups.slice(0, 2).map((group) => (
                                <span
                                  key={group}
                                  className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                                >
                                  {group.replace(/-/g, ' ')}
                                </span>
                              ))}
                              {contact.groups.length > 2 && (
                                <span className="text-xs text-gray-500">
                                  +{contact.groups.length - 2} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewContact(contact)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleEditContact(contact)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                            title="Edit Contact"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            className="p-2 text-green-600 hover:bg-green-100 rounded"
                            title="Send Message"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {contacts.length === 0 && (
                    <div className="p-8 text-center">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts yet</h3>
                      <p className="text-gray-500 mb-4">Add contacts to start creating campaigns</p>
                      <button
                        onClick={() => setShowCreateContact(true)}
                        className="px-4 py-2 bg-[#D4AF37] text-white rounded-md hover:bg-[#8B7A1A] transition-colors"
                      >
                        Add Contact
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Pagination */}
                {contactPagination.totalPages > 1 && (
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => loadContacts(contactPagination.currentPage - 1)}
                          disabled={contactPagination.currentPage <= 1}
                          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, contactPagination.totalPages) }, (_, i) => {
                            const pageNum = Math.max(1, contactPagination.currentPage - 2) + i;
                            if (pageNum > contactPagination.totalPages) return null;
                            
                            return (
                              <button
                                key={pageNum}
                                onClick={() => loadContacts(pageNum)}
                                className={`px-3 py-1 text-sm border rounded ${
                                  pageNum === contactPagination.currentPage
                                    ? 'bg-[#D4AF37] text-white border-[#D4AF37]'
                                    : 'border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>
                        
                        <button
                          onClick={() => loadContacts(contactPagination.currentPage + 1)}
                          disabled={contactPagination.currentPage >= contactPagination.totalPages}
                          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        Page {contactPagination.currentPage} of {contactPagination.totalPages}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'conversations' && (
            <div className="flex-1 flex flex-col lg:flex-row">
              {/* Mobile Thread List - Full Width */}
              <div className="lg:hidden bg-white border-b border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Conversations</h3>
                </div>
                <div className="overflow-x-auto">
                  <div className="flex space-x-2 p-4">
                    {threads.map((thread) => (
                      <div
                        key={thread.id}
                        onClick={() => handleThreadSelect(thread)}
                        className={`min-w-[200px] p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedThread?.id === thread.id
                            ? 'bg-[#D4AF37] text-white'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {thread.channels.includes('whatsapp') && (
                              <Phone className="w-4 h-4 text-green-600" />
                            )}
                            {thread.channels.includes('instagram') && (
                              <Instagram className="w-4 h-4 text-pink-600" />
                            )}
                            <span className="text-sm font-medium">
                              Customer {thread.customerId.slice(-6)}
                            </span>
                          </div>
                          {thread.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                              {thread.unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className={`${selectedThread?.id === thread.id ? 'text-white' : 'text-gray-500'}`}>
                            {thread.status}
                          </span>
                          <span className={`${selectedThread?.id === thread.id ? 'text-white' : 'text-gray-400'}`}>
                            {new Date(thread.lastMessageAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Desktop Thread List */}
              <div className="hidden lg:flex w-80 bg-white border-r border-gray-200 flex-col">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Conversations</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4 space-y-2">
                    {threads.map((thread) => (
                      <div
                        key={thread.id}
                        onClick={() => handleThreadSelect(thread)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedThread?.id === thread.id
                            ? 'bg-[#D4AF37] text-white'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {thread.channels.includes('whatsapp') && (
                              <Phone className="w-4 h-4 text-green-600" />
                            )}
                            {thread.channels.includes('instagram') && (
                              <Instagram className="w-4 h-4 text-pink-600" />
                            )}
                            <span className="text-sm font-medium">
                              Customer {thread.customerId.slice(-6)}
                            </span>
                          </div>
                          {thread.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                              {thread.unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className={`${selectedThread?.id === thread.id ? 'text-white' : 'text-gray-500'}`}>
                            {thread.status}
                          </span>
                          <span className={`${selectedThread?.id === thread.id ? 'text-white' : 'text-gray-400'}`}>
                            {new Date(thread.lastMessageAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 flex flex-col">
                {selectedThread ? (
            <>
              {/* Thread Header */}
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {selectedThread.channels.includes('whatsapp') && (
                        <Phone className="w-5 h-5 text-green-600" />
                      )}
                      {selectedThread.channels.includes('instagram') && (
                        <Instagram className="w-5 h-5 text-pink-600" />
                      )}
              </div>
              <div>
                      <h3 className="font-semibold text-gray-900">
                        Customer {selectedThread.customerId.slice(-6)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedThread.status} • {selectedThread.priority} priority
                      </p>
              </div>
            </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    {new Date(selectedThread.lastMessageAt).toLocaleString()}
                  </div>
          </div>
        </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.dir === 'out' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.dir === 'out'
                          ? 'bg-[#D4AF37] text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.body.text}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(message.sentAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 p-3 sm:p-4">
                <div className="space-y-3 sm:space-y-4">
                  {/* Template Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template (Optional)
                    </label>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => handleTemplateSelect(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
                    >
                      <option value="">Select a template</option>
                      {templates.map((template) => (
                        <option key={template.name} value={template.name}>
                          {template.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Template Variables */}
                  {selectedTemplate && Object.keys(templateVars).length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.entries(templateVars).map(([key, value]) => (
                        <div key={key}>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            {key}
                          </label>
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => handleTemplateVarChange(key, e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                            placeholder={key}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Message Input */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] resize-none text-sm"
                      rows={3}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage && !selectedTemplate}
                      className="px-4 py-2 bg-[#D4AF37] text-white rounded-md hover:bg-[#8B7A1A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:flex-col sm:gap-1"
                    >
                      <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-sm sm:hidden">Send</span>
                    </button>
                  </div>
                </div>
              </div>
                </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                      <p className="text-gray-500">Choose a thread from the sidebar to start messaging</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <AnalyticsDashboard />
          )}
        </div>
      </div>

      {/* Campaign Creation Modal */}
      <CreateCampaignModal
        isOpen={showCreateCampaign}
        onClose={() => setShowCreateCampaign(false)}
        onSubmit={handleCreateCampaign}
        contacts={contacts}
      />

      {/* Contact Creation Modal */}
      <CreateContactModal
        isOpen={showCreateContact}
        onClose={() => setShowCreateContact(false)}
        onSubmit={handleCreateContact}
      />

      {/* View/Edit Contact Modal */}
      <ViewEditContactModal
        isOpen={showViewEditContact}
        onClose={() => setShowViewEditContact(false)}
        contact={selectedContact}
        onUpdate={handleUpdateContact}
        mode={viewEditMode}
        onModeChange={setViewEditMode}
      />
    </AdminLayout>
  );
}

export default function MessagesPage() {
  const { userProfile, signOut } = useAuth();

  return (
    <AdminLayout userProfile={userProfile} onLogout={signOut}>
      <MessagesPageContent />
    </AdminLayout>
  );
}
