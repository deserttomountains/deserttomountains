/**
 * Status Monitor Component - Redesigned
 * Shows template approval status with enhanced UI and clear functionality indicators
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Eye,
  Download,
  Filter,
  Search,
  Activity,
  Database,
  Wifi,
  WifiOff,
  Info,
  TrendingUp,
  Calendar,
  Users,
  MessageSquare,
  Zap
} from 'lucide-react';
import { 
  TemplateRequest,
  templateManagementService 
} from '@/lib/messaging/template-management';

interface StatusMonitorProps {
  onViewTemplate?: (template: TemplateRequest) => void;
  onRefresh?: () => void;
}

interface TemplateStatusSummary {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  draft: number;
}

interface ConnectionStatus {
  isConnected: boolean;
  lastCheck: Date;
  error?: string;
}

export default function StatusMonitor({
  onViewTemplate,
  onRefresh
}: StatusMonitorProps) {
  const [templates, setTemplates] = useState<TemplateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    lastCheck: new Date()
  });
  const [showDetails, setShowDetails] = useState(false);
  const [submittingToMeta, setSubmittingToMeta] = useState<string | null>(null);
  const [metaApiStatus, setMetaApiStatus] = useState<{ connected: boolean; error?: string }>({
    connected: false
  });

  // Load templates on component mount
  useEffect(() => {
    loadTemplates();
    checkConnectionStatus();
    checkMetaApiStatus();
  }, []);

  const checkMetaApiStatus = async () => {
    const status = await checkMetaApiConnection();
    setMetaApiStatus(status);
  };

  const checkConnectionStatus = async () => {
    try {
      // Test connection by making a simple API call
      const response = await fetch('/api/templates?limit=1');
      setConnectionStatus({
        isConnected: response.ok,
        lastCheck: new Date(),
        error: response.ok ? undefined : `HTTP ${response.status}`
      });
    } catch (error) {
      setConnectionStatus({
        isConnected: false,
        lastCheck: new Date(),
        error: error instanceof Error ? error.message : 'Connection failed'
      });
    }
  };

  const checkMetaApiConnection = async (): Promise<{ connected: boolean; error?: string }> => {
    try {
      // Test Meta API connection by making a simple API call
      const response = await fetch('/api/debug/meta-connection', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return { connected: data.success, error: data.error };
      } else {
        const errorData = await response.json();
        return { connected: false, error: errorData.error || `HTTP ${response.status}` };
      }
    } catch (error) {
      return { 
        connected: false, 
        error: error instanceof Error ? error.message : 'Meta API connection test failed' 
      };
    }
  };

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await templateManagementService.listTemplates({
        limit: 100,
        offset: 0
      });

      setTemplates(response.templates);
      setLastUpdated(new Date());
      await checkConnectionStatus();
    } catch (error) {
      console.error('Error loading templates:', error);
      setError('Failed to load template status');
      setConnectionStatus({
        isConnected: false,
        lastCheck: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshTemplates = async () => {
    setRefreshing(true);
    await loadTemplates();
    await checkMetaApiStatus();
    setRefreshing(false);
    onRefresh?.();
  };

  const handleSubmitToMeta = async (templateId: string) => {
    setSubmittingToMeta(templateId);
    try {
      const response = await fetch(`/api/templates/${templateId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit template to Meta');
      }

      // Refresh templates to get updated status
      await loadTemplates();
      
      // Show success message
      alert('Template submitted to Meta for approval! You can track the status here.');
    } catch (error) {
      console.error('Error submitting template to Meta:', error);
      alert(`Failed to submit template to Meta: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSubmittingToMeta(null);
    }
  };

  // Calculate status summary
  const statusSummary: TemplateStatusSummary = templates.reduce(
    (acc, template) => {
      acc.total++;
      const status = template.metaStatus || template.status;
      switch (status) {
        case 'APPROVED':
          acc.approved++;
          break;
        case 'PENDING':
          acc.pending++;
          break;
        case 'REJECTED':
          acc.rejected++;
          break;
        case 'DRAFT':
          acc.draft++;
          break;
      }
      return acc;
    },
    { total: 0, approved: 0, pending: 0, rejected: 0, draft: 0 }
  );

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.meta.description.toLowerCase().includes(searchTerm.toLowerCase());
    const status = template.metaStatus || template.status;
    const matchesStatus = statusFilter === 'all' || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Get status badge with enhanced styling
  const getStatusBadge = (template: TemplateRequest) => {
    const status = template.metaStatus || template.status;
    
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-2" />
            Approved
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 mr-2" />
            Pending Review
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-2" />
            Rejected
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            <AlertCircle className="w-4 h-4 mr-2" />
            Draft
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  // Get time since last update
  const getTimeSinceUpdate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Get connection status indicator
  const getConnectionIndicator = () => {
    if (connectionStatus.isConnected) {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <Wifi className="w-4 h-4" />
          <span className="text-sm font-medium">Connected</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 text-red-600">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">Disconnected</span>
        </div>
      );
    }
  };

  // Export status report
  const exportStatusReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      connectionStatus,
      summary: statusSummary,
      templates: filteredTemplates.map(template => ({
        name: template.name,
        category: template.category,
        status: template.metaStatus || template.status,
        platforms: template.platforms,
        submittedAt: template.submittedAt,
        approvedAt: template.approvedAt,
        rejectionReason: template.metaRejectionReason || template.rejectionReason,
        metaTemplateId: template.metaTemplateId
      }))
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template-status-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
        <div className="text-center">
          <p className="text-gray-600 font-medium">Loading template status...</p>
          <p className="text-sm text-gray-500 mt-1">Fetching data from Firebase</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">Connection Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={loadTemplates}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={checkConnectionStatus}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Check Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] rounded-lg p-4 sm:p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1 mb-4 lg:mb-0">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
              <h2 className="text-xl sm:text-2xl font-bold">Template Status Monitor</h2>
            </div>
            <p className="text-[#F5E6A3] mb-2 text-sm sm:text-base">
              Real-time tracking of template approval status and Meta API integration
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span>Last updated: {getTimeSinceUpdate(lastUpdated)}</span>
              </div>
              {getConnectionIndicator()}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={exportStatusReport}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-md hover:bg-white/30 transition-colors w-full sm:w-auto cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span className="sm:hidden">Export</span>
              <span className="hidden sm:inline">Export Report</span>
            </button>
            <button
              onClick={refreshTemplates}
              disabled={refreshing}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-md hover:bg-white/30 transition-colors disabled:opacity-50 w-full sm:w-auto cursor-pointer disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="sm:hidden">Refresh</span>
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Connection Status Card */}
      {!connectionStatus.isConnected && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <WifiOff className="w-5 h-5 text-red-600" />
            <div className="flex-1">
              <h3 className="font-medium text-red-800">Connection Issue</h3>
              <p className="text-sm text-red-600">
                {connectionStatus.error || 'Unable to connect to Firebase'}
              </p>
            </div>
            <button
              onClick={checkConnectionStatus}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Status Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Total Templates</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900">{statusSummary.total}</p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-center text-xs sm:text-sm text-gray-500">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span>All categories</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Approved</p>
              <p className="text-xl sm:text-3xl font-bold text-green-600">{statusSummary.approved}</p>
            </div>
            <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-center text-xs sm:text-sm text-green-600">
            <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span>Ready to use</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Pending</p>
              <p className="text-xl sm:text-3xl font-bold text-yellow-600">{statusSummary.pending}</p>
            </div>
            <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-center text-xs sm:text-sm text-yellow-600">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span>Under review</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Rejected</p>
              <p className="text-xl sm:text-3xl font-bold text-red-600">{statusSummary.rejected}</p>
            </div>
            <div className="p-2 sm:p-3 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-center text-xs sm:text-sm text-red-600">
            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span>Needs revision</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Draft</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-600">{statusSummary.draft}</p>
            </div>
            <div className="p-2 sm:p-3 bg-gray-100 rounded-lg">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-center text-xs sm:text-sm text-gray-600">
            <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span>In progress</span>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900">Filters & Search</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Templates</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or description..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
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
        </div>
      </div>

      {/* Enhanced Templates List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-medium text-gray-900">Template Details</h3>
              <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
                {filteredTemplates.length} templates
              </span>
            </div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
            >
              <Info className="w-4 h-4" />
              {showDetails ? 'Hide' : 'Show'} Details
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    {getStatusBadge(template)}
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {template.category}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{template.meta.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>Platforms: {template.platforms && template.platforms.length > 0 ? template.platforms.join(', ') : 'WhatsApp, Instagram'}</span>
                    </div>
                    {template.submittedAt && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Submitted: {template.submittedAt.toLocaleDateString()}</span>
                      </div>
                    )}
                    {template.approvedAt && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Approved: {template.approvedAt.toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {showDetails && (
                    <div className="mt-4 space-y-3">
                      {template.metaRejectionReason && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-800">
                            <strong>Rejection Reason:</strong> {template.metaRejectionReason}
                          </p>
                        </div>
                      )}

                      {template.metaTemplateId && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                          <p className="text-sm text-green-800">
                            <strong>Meta Template ID:</strong> {template.metaTemplateId}
                          </p>
                        </div>
                      )}

                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                        <p className="text-sm text-gray-700">
                          <strong>Use Case:</strong> {template.meta.useCase}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {/* Submit to Meta button for draft templates */}
                  {(template.status === 'DRAFT' || (!template.metaTemplateId && template.status !== 'REJECTED')) && (
                    <button
                      onClick={() => handleSubmitToMeta(template.id)}
                      disabled={submittingToMeta === template.id}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      title="Submit to Meta for approval"
                    >
                      {submittingToMeta === template.id ? 'Submitting...' : 'Submit to Meta'}
                    </button>
                  )}
                  
                  {onViewTemplate && (
                    <button
                      onClick={() => onViewTemplate(template)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                      title="View template"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  
                  {template.metaTemplateId && (
                    <a
                      href={`https://business.facebook.com/wa/manage/message-templates/${template.metaTemplateId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                      title="View in Meta Business Manager"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-4">No templates match your current search criteria</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="px-4 py-2 bg-[#D4AF37] text-white rounded-md hover:bg-[#8B7A1A] transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Functionality Status Indicator */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-blue-800 mb-1">System Status</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• <strong>Firebase Connection:</strong> {connectionStatus.isConnected ? 'Active' : 'Disconnected'}</p>
              <p>• <strong>Template Storage:</strong> {templates.length > 0 ? 'Data Available' : 'No Templates Found'}</p>
              <p>• <strong>Meta API Integration:</strong> {metaApiStatus.connected ? 'Connected' : 'Not Connected'}</p>
              <p>• <strong>Webhook Updates:</strong> Manual refresh only (auto-refresh disabled)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
