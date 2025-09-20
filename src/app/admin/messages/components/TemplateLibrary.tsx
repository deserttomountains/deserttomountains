/**
 * Enhanced Template Library Component
 * Modern, feature-rich template management with advanced filtering, preview, and bulk actions
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Eye, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Search,
  RefreshCw,
  ExternalLink,
  Edit,
  Trash2,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  Download,
  Share2,
  Play,
  Pause,
  Archive,
  Tag,
  Calendar,
  Users,
  Zap,
  Plus,
  Settings,
  BarChart3,
  TrendingUp,
  Activity,
  Copy,
  MoreVertical
} from 'lucide-react';
import { 
  TemplateRequest, 
  UtilityTemplate, 
  MarketingTemplate,
  templateManagementService 
} from '@/lib/messaging/template-management';

// Helper function to safely convert Firestore timestamps to dates
const safeToDate = (dateValue: any): Date => {
  if (!dateValue) return new Date();
  
  // If it's already a Date object
  if (dateValue instanceof Date) return dateValue;
  
  // If it's a Firestore Timestamp
  if (dateValue && typeof dateValue.toDate === 'function') {
    return dateValue.toDate();
  }
  
  // If it's a string or number
  if (typeof dateValue === 'string' || typeof dateValue === 'number') {
    return new Date(dateValue);
  }
  
  // Fallback
  return new Date();
};

interface TemplateLibraryProps {
  onEditTemplate?: (template: TemplateRequest) => void;
  onDeleteTemplate?: (templateId: string) => void;
  onSubmitToMeta?: (templateId: string) => void;
  onCreateTemplate?: () => void;
}

export default function TemplateLibrary({
  onEditTemplate,
  onDeleteTemplate,
  onSubmitToMeta,
  onCreateTemplate
}: TemplateLibraryProps) {
  const [templates, setTemplates] = useState<TemplateRequest[]>([]);
  const [utilityTemplates, setUtilityTemplates] = useState<UtilityTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  
  // Enhanced UI state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'status' | 'category'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());
  const [previewTemplate, setPreviewTemplate] = useState<TemplateRequest | UtilityTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Load templates
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load Marketing templates from database
      const marketingTemplates = await templateManagementService.listTemplates({
        limit: 100,
        offset: 0
      });

      // Load predefined Utility templates
      const utilityTemplates = getPredefinedUtilityTemplates();

      setTemplates(marketingTemplates.templates);
      setUtilityTemplates(utilityTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      setError('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const refreshTemplates = async () => {
    setRefreshing(true);
    await loadTemplates();
    setRefreshing(false);
  };

  // Get predefined Utility templates
  const getPredefinedUtilityTemplates = (): UtilityTemplate[] => {
    return [
      {
        id: 'utility_order_confirmation',
        name: 'order_confirmation',
        language: 'en',
        category: 'UTILITY',
        status: 'APPROVED',
        platforms: ['whatsapp'],
        components: [{
          type: 'TEXT',
          text: 'Hello {{customer_name}}, your order {{order_id}} has been confirmed. Total: {{order_total}}. Thank you for choosing us!',
          variables: ['customer_name', 'order_id', 'order_total']
        }],
        meta: {
          description: 'Confirms customer orders with details',
          useCase: 'Order confirmation notifications',
          exampleVariables: {
            customer_name: 'John Doe',
            order_id: 'ORD-2024-001',
            order_total: '₹1,299'
          }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'utility_shipping_update',
        name: 'shipping_update',
        language: 'en',
        category: 'UTILITY',
        status: 'APPROVED',
        platforms: ['whatsapp'],
        components: [{
          type: 'TEXT',
          text: 'Great news! Your order {{order_id}} has been shipped via {{carrier}}. Track your package: {{tracking_number}}. Expected delivery in 2-3 business days.',
          variables: ['order_id', 'carrier', 'tracking_number']
        }],
        meta: {
          description: 'Notifies customers when their order is shipped',
          useCase: 'Shipping update notifications',
          exampleVariables: {
            order_id: 'ORD-2024-001',
            carrier: 'Blue Dart',
            tracking_number: 'BD123456789'
          }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'utility_delivery_update',
        name: 'delivery_update',
        language: 'en',
        category: 'UTILITY',
        status: 'APPROVED',
        platforms: ['whatsapp'],
        components: [{
          type: 'TEXT',
          text: 'Your order {{order_id}} is out for delivery. Expected delivery time: {{delivery_time}}. Track your package: {{tracking_link}}',
          variables: ['order_id', 'delivery_time', 'tracking_link']
        }],
        meta: {
          description: 'Notifies customers about delivery status',
          useCase: 'Delivery update notifications',
          exampleVariables: {
            order_id: 'ORD-2024-001',
            delivery_time: '2:00 PM - 4:00 PM',
            tracking_link: 'https://track.example.com/BD123456789'
          }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  };

  // Enhanced filtering and sorting
  const filterAndSortTemplates = (templateList: (TemplateRequest | UtilityTemplate)[]) => {
    let filtered = templateList.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.meta.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.meta.useCase.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || template.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });

    // Sort templates
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created':
          comparison = safeToDate(a.createdAt).getTime() - safeToDate(b.createdAt).getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  const filteredTemplates = filterAndSortTemplates(templates);
  const filteredUtilityTemplates = filterAndSortTemplates(utilityTemplates);

  // Get status badge
  const getStatusBadge = (status: string, metaStatus?: string) => {
    const displayStatus = metaStatus || status;
    
    switch (displayStatus) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Edit className="w-3 h-3 mr-1" />
            Draft
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {displayStatus}
          </span>
        );
    }
  };

  // Get platform badges
  const getPlatformBadges = (platforms: string[]) => {
    return platforms.map(platform => (
      <span
        key={platform}
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          platform === 'whatsapp' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-pink-100 text-pink-800'
        }`}
      >
        {platform === 'whatsapp' ? 'WhatsApp' : 'Instagram'}
      </span>
    ));
  };

  // Enhanced utility functions

  const toggleTemplateSelection = (templateId: string) => {
    const newSelected = new Set(selectedTemplates);
    if (newSelected.has(templateId)) {
      newSelected.delete(templateId);
    } else {
      newSelected.add(templateId);
    }
    setSelectedTemplates(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const selectAllTemplates = () => {
    const allTemplateIds = new Set([
      ...filteredTemplates.map(t => t.id),
      ...filteredUtilityTemplates.map(t => t.id)
    ]);
    setSelectedTemplates(allTemplateIds);
    setShowBulkActions(true);
  };

  const clearSelection = () => {
    setSelectedTemplates(new Set());
    setShowBulkActions(false);
  };


  const handlePreviewTemplate = (template: TemplateRequest | UtilityTemplate) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  const copyTemplateContent = async (template: TemplateRequest | UtilityTemplate) => {
    try {
      const content = template.components.map(comp => comp.text).join('\n\n');
      await navigator.clipboard.writeText(content);
      // You could add a toast notification here
      console.log('Template content copied to clipboard');
    } catch (error) {
      console.error('Failed to copy template content:', error);
    }
  };

  const exportTemplates = () => {
    const selectedTemplatesList = [...selectedTemplates];
    const templatesToExport = [
      ...filteredTemplates.filter(t => selectedTemplatesList.includes(t.id)),
      ...filteredUtilityTemplates.filter(t => selectedTemplatesList.includes(t.id))
    ];
    
    const exportData = templatesToExport.map(template => ({
      name: template.name,
      category: template.category,
      status: template.status,
      platforms: template.platforms,
      description: template.meta.description,
      useCase: template.meta.useCase,
      content: template.components.map(comp => comp.text).join('\n\n'),
      variables: template.components.flatMap(comp => comp.variables || [])
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `templates-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTemplateStats = () => {
    const allTemplates = [...templates, ...utilityTemplates];
    return {
      total: allTemplates.length,
      approved: allTemplates.filter(t => t.status === 'APPROVED').length,
      pending: allTemplates.filter(t => t.status === 'PENDING').length,
      draft: allTemplates.filter(t => t.status === 'DRAFT').length,
      rejected: allTemplates.filter(t => t.status === 'REJECTED').length,
      marketing: allTemplates.filter(t => t.category === 'MARKETING').length,
      utility: allTemplates.filter(t => t.category === 'UTILITY').length
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
        <span className="ml-2 text-gray-600">Loading templates...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadTemplates}
          className="px-4 py-2 bg-[#D4AF37] text-white rounded-md hover:bg-[#8B7A1A] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const stats = getTemplateStats();

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] rounded-lg p-4 sm:p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Template Library</h2>
            <p className="text-white/90 text-sm sm:text-base">
              Manage your WhatsApp and Instagram message templates with advanced features
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            {onCreateTemplate && (
              <button
                onClick={onCreateTemplate}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span className="sm:hidden">Create</span>
                <span className="hidden sm:inline">Create Template</span>
              </button>
            )}
            
            <button
              onClick={refreshTemplates}
              disabled={refreshing}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-300 disabled:opacity-50 w-full sm:w-auto cursor-pointer disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="sm:hidden">Refresh</span>
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Template Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs sm:text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.approved}</div>
          <div className="text-xs sm:text-sm text-gray-600">Approved</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-xs sm:text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-gray-600">{stats.draft}</div>
          <div className="text-xs sm:text-sm text-gray-600">Draft</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.rejected}</div>
          <div className="text-xs sm:text-sm text-gray-600">Rejected</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.marketing}</div>
          <div className="text-xs sm:text-sm text-gray-600">Marketing</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-purple-600">{stats.utility}</div>
          <div className="text-xs sm:text-sm text-gray-600">Utility</div>
        </div>
      </div>

      {/* Enhanced Filters and Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900">Filters & Controls</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'grid' 
                    ? 'bg-[#D4AF37] text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Grid view"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'list' 
                    ? 'bg-[#D4AF37] text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
              >
                <option value="created">Created Date</option>
                <option value="name">Name</option>
                <option value="status">Status</option>
                <option value="category">Category</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
                title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
              >
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
            >
              <option value="all">All Statuses</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
            >
              <option value="all">All Categories</option>
              <option value="UTILITY">Utility</option>
              <option value="MARKETING">Marketing</option>
            </select>
          </div>

        </div>

        {/* Bulk Actions */}
        {showBulkActions && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-blue-800">
                  {selectedTemplates.size} template{selectedTemplates.size !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={clearSelection}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                >
                  Clear selection
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={exportTemplates}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={selectAllTemplates}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  Select All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Utility Templates Section */}
      {filteredUtilityTemplates.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              Utility Templates
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {filteredUtilityTemplates.length}
              </span>
            </h3>
            <div className="text-sm text-gray-500">
              Predefined templates for WhatsApp only
            </div>
          </div>
          
          <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6' : 'space-y-4'}`}>
            {filteredUtilityTemplates.map((template) => (
              <div key={template.id} className={`bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-300 ${
                selectedTemplates.has(template.id) ? 'ring-2 ring-[#D4AF37] border-[#D4AF37]' : ''
              }`}>
                {viewMode === 'grid' ? (
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedTemplates.has(template.id)}
                          onChange={() => toggleTemplateSelection(template.id)}
                          className="mt-1 w-4 h-4 text-[#D4AF37] border-gray-300 rounded focus:ring-[#D4AF37]"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{template.name}</h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{template.meta.description}</p>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(template.status)}
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {template.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-700 line-clamp-3 bg-gray-50 p-3 rounded-md">
                        {template.components[0]?.text}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {getPlatformBadges(template.platforms)}
                      </div>
                      
                      <div className="flex gap-1">
                        <button
                          onClick={() => handlePreviewTemplate(template)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                          title="Preview template"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={selectedTemplates.has(template.id)}
                        onChange={() => toggleTemplateSelection(template.id)}
                        className="w-4 h-4 text-[#D4AF37] border-gray-300 rounded focus:ring-[#D4AF37]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-gray-900">{template.name}</h4>
                          {getStatusBadge(template.status)}
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {template.category}
                          </span>
                          <div className="flex gap-1">
                            {getPlatformBadges(template.platforms)}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{template.meta.description}</p>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                          {template.components[0]?.text}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePreviewTemplate(template)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => copyTemplateContent(template)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Marketing Templates Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MessageSquare className="w-5 h-5 text-green-600" />
            </div>
            Marketing Templates
            <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
              {filteredTemplates.length}
            </span>
          </h3>
          <div className="text-sm text-gray-500">
            Custom templates for WhatsApp and Instagram
          </div>
        </div>
        
        {filteredTemplates.length > 0 ? (
          <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6' : 'space-y-4'}`}>
            {filteredTemplates.map((template) => (
              <div key={template.id} className={`bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-300 ${
                selectedTemplates.has(template.id) ? 'ring-2 ring-[#D4AF37] border-[#D4AF37]' : ''
              }`}>
                {viewMode === 'grid' ? (
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedTemplates.has(template.id)}
                          onChange={() => toggleTemplateSelection(template.id)}
                          className="mt-1 w-4 h-4 text-[#D4AF37] border-gray-300 rounded focus:ring-[#D4AF37]"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{template.name}</h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{template.meta.description}</p>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(template.status, (template as any).metaStatus)}
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              {template.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-700 line-clamp-3 bg-gray-50 p-3 rounded-md">
                        {template.components[0]?.text}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-1">
                        {getPlatformBadges(template.platforms || [])}
                      </div>
                      
                      <div className="flex gap-1">
                        <button
                          onClick={() => handlePreviewTemplate(template)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                          title="Preview template"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 flex-wrap">
                      {template.status === 'DRAFT' && onSubmitToMeta && (
                        <button
                          onClick={() => onSubmitToMeta(template.id)}
                          className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors cursor-pointer"
                        >
                          <Upload className="w-3 h-3" />
                          Submit to Meta
                        </button>
                      )}
                      
                      {onEditTemplate && (
                        <button
                          onClick={() => onEditTemplate(template)}
                          className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </button>
                      )}
                      
                      {onDeleteTemplate && template.status === 'DRAFT' && (
                        <button
                          onClick={() => onDeleteTemplate(template.id)}
                          className="flex items-center gap-1 px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      )}
                    </div>

                    {/* Meta status info */}
                    {(template as any).metaTemplateId && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          Meta ID: {(template as any).metaTemplateId}
                        </p>
                        {(template as any).metaRejectionReason && (
                          <p className="text-xs text-red-600 mt-1">
                            Rejection: {(template as any).metaRejectionReason}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={selectedTemplates.has(template.id)}
                        onChange={() => toggleTemplateSelection(template.id)}
                        className="w-4 h-4 text-[#D4AF37] border-gray-300 rounded focus:ring-[#D4AF37]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-gray-900">{template.name}</h4>
                          {getStatusBadge(template.status, (template as any).metaStatus)}
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {template.category}
                          </span>
                          <div className="flex gap-1">
                            {getPlatformBadges(template.platforms || [])}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{template.meta.description}</p>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                          {template.components[0]?.text}
                        </p>
                        {(template as any).metaTemplateId && (
                          <p className="text-xs text-gray-400 mt-1">
                            Meta ID: {(template as any).metaTemplateId}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {template.status === 'DRAFT' && onSubmitToMeta && (
                          <button
                            onClick={() => onSubmitToMeta(template.id)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                            title="Submit to Meta"
                          >
                            <Upload className="w-4 h-4" />
                          </button>
                        )}
                        {onEditTemplate && (
                          <button
                            onClick={() => onEditTemplate(template)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
                            title="Edit template"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handlePreviewTemplate(template)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => copyTemplateContent(template)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {onDeleteTemplate && template.status === 'DRAFT' && (
                          <button
                            onClick={() => onDeleteTemplate(template.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title="Delete template"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Marketing Templates</h4>
            <p className="text-gray-600 mb-4 max-w-md mx-auto">
              You haven't created any marketing templates yet. Create your first template to get started with WhatsApp and Instagram messaging.
            </p>
            {onCreateTemplate && (
              <button
                onClick={onCreateTemplate}
                className="flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-white rounded-lg hover:bg-[#8B7A1A] transition-all duration-300 transform hover:scale-105 shadow-lg mx-auto cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                Create Marketing Template
              </button>
            )}
          </div>
        )}
      </div>

      {/* Global Empty State - Only show when no templates exist at all */}
      {filteredTemplates.length === 0 && filteredUtilityTemplates.length === 0 && (
        <div className="text-center py-16 mt-8">
          <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'No templates match your current search criteria. Try adjusting your filters.'
              : 'You haven\'t created any templates yet. Start by creating your first marketing template.'
            }
          </p>
          <div className="flex items-center justify-center gap-3">
            {onCreateTemplate && (
              <button
                onClick={onCreateTemplate}
                className="flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-white rounded-lg hover:bg-[#8B7A1A] transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                Create Your First Template
              </button>
            )}
            {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setCategoryFilter('all');
                }}
                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Template Preview Modal */}
      {showPreview && previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">Template Preview</h3>
                <p className="text-sm text-gray-600 mt-1 truncate">{previewTemplate.name}</p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors ml-2 cursor-pointer"
              >
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Template Details</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Name</label>
                      <p className="text-gray-900">{previewTemplate.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Category</label>
                      <p className="text-gray-900">{previewTemplate.category}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <div className="mt-1">
                        {getStatusBadge(previewTemplate.status, (previewTemplate as TemplateRequest).metaStatus)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Platforms</label>
                      <div className="flex gap-1 mt-1">
                        {getPlatformBadges(previewTemplate.platforms || [])}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Description</label>
                      <p className="text-gray-900">{previewTemplate.meta.description}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Use Case</label>
                      <p className="text-gray-900">{previewTemplate.meta.useCase}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Template Content</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {previewTemplate.components[0]?.text}
                    </p>
                  </div>
                  
                  {previewTemplate.components[0]?.variables && previewTemplate.components[0].variables.length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-medium text-gray-900 mb-2">Variables</h5>
                      <div className="flex flex-wrap gap-2">
                        {previewTemplate.components[0].variables.map((variable, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded"
                          >
                            {`{{${variable}}}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              {onEditTemplate && (previewTemplate as TemplateRequest).id && previewTemplate.category !== 'UTILITY' && (
                <button
                  onClick={() => {
                    onEditTemplate(previewTemplate as TemplateRequest);
                    setShowPreview(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-white rounded-md hover:bg-[#8B7A1A] transition-colors cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                  Edit Template
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
