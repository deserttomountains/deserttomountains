/**
 * ORIGINAL MESSAGES PAGE - BACKUP
 * This is the original messages page before campaign-centric redesign
 * Keep this as backup for reference
 */

"use client";

import { useState, useEffect } from 'react';
import { AuthService, auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastContext';
import { useAuth } from '@/lib/hooks/useAuth';
import AdminLayout from '../components/AdminLayout';
import { MessageSquare, Send, Phone, Instagram, Clock, User, Filter } from 'lucide-react';
import { Thread, Message } from '@/lib/messaging/types';
import { getAvailableTemplates, WhatsAppTemplate } from '@/lib/messaging/templates';

function MessagesPageContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templateVars, setTemplateVars] = useState<Record<string, string>>({});
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [filters, setFilters] = useState({
    status: '',
    assignee: '',
    channels: [] as string[]
  });

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

  // Load threads
  const loadThreads = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.assignee) params.append('assignee', filters.assignee);
      if (filters.channels.length > 0) params.append('channels', filters.channels.join(','));
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
      <div className="flex h-screen bg-gray-50">
        {/* Left Sidebar - Filters */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Filters</h3>
            </div>
            
            {/* Status Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Channel Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Channels</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.channels.includes('whatsapp')}
                    onChange={(e) => {
                      const newChannels = e.target.checked 
                        ? [...filters.channels, 'whatsapp']
                        : filters.channels.filter(c => c !== 'whatsapp');
                      setFilters(prev => ({ ...prev, channels: newChannels }));
                    }}
                    className="mr-2"
                  />
                  <Phone className="w-4 h-4 text-green-600 mr-2" />
                  WhatsApp
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.channels.includes('instagram')}
                    onChange={(e) => {
                      const newChannels = e.target.checked 
                        ? [...filters.channels, 'instagram']
                        : filters.channels.filter(c => c !== 'instagram');
                      setFilters(prev => ({ ...prev, channels: newChannels }));
                    }}
                    className="mr-2"
                  />
                  <Instagram className="w-4 h-4 text-pink-600 mr-2" />
                  Instagram
                </label>
              </div>
            </div>

            <button
              onClick={loadThreads}
              className="w-full bg-[#D4AF37] text-white py-2 px-4 rounded-md hover:bg-[#8B7A1A] transition-colors"
            >
              Apply Filters
            </button>
          </div>

          {/* Thread List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Conversations</h3>
              <div className="space-y-2">
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
        </div>

        {/* Main Content - Messages */}
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
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="space-y-4">
                  {/* Template Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template (Optional)
                    </label>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => handleTemplateSelect(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
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
                    <div className="grid grid-cols-2 gap-2">
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
                  <div className="flex gap-2">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] resize-none"
                      rows={3}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage && !selectedTemplate}
                      className="px-4 py-2 bg-[#D4AF37] text-white rounded-md hover:bg-[#8B7A1A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
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

