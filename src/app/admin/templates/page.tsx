/**
 * Template Management Page
 * Allows users to create, edit, and manage custom WhatsApp templates
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastContext';
import { useAuth } from '@/lib/hooks/useAuth';
import AdminLayout from '../components/AdminLayout';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Filter,
  Search,
  MessageSquare
} from 'lucide-react';
import { 
  TemplateRequest, 
  CreateTemplateRequest,
  ListTemplatesRequest,
  templateManagementService
} from '@/lib/messaging/template-management';
import TemplateLibrary from '../messages/components/TemplateLibrary';
import StatusMonitor from '../messages/components/StatusMonitor';
import AdvancedTemplateBuilder from '../messages/components/AdvancedTemplateBuilder';

function TemplatesPageContent() {
  const [templates, setTemplates] = useState<TemplateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateRequest | null>(null);
  const [activeTab, setActiveTab] = useState<'library' | 'status' | 'builder'>('library');
  
  // Ensure activeTab is valid when showBuilder changes
  useEffect(() => {
    if (!showBuilder && activeTab === 'builder') {
      setActiveTab('library');
    }
  }, [showBuilder, activeTab]);
  const [filters, setFilters] = useState<ListTemplatesRequest>({
    status: undefined,
    category: undefined,
    language: undefined,
    limit: 50,
    offset: 0
  });
  const [searchTerm, setSearchTerm] = useState('');

  const router = useRouter();
  const { showToast } = useToast();

  // Load templates
  useEffect(() => {
    loadTemplates();
  }, [filters]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.language) params.append('language', filters.language);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());

      const response = await fetch(`/api/templates?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load templates');
      }

      // Transform dates from API response
      const transformedTemplates = data.data.templates.map((template: any) => ({
        ...template,
        createdAt: template.createdAt ? new Date(template.createdAt) : new Date(),
        updatedAt: template.updatedAt ? new Date(template.updatedAt) : new Date(),
        submittedAt: template.submittedAt ? new Date(template.submittedAt) : undefined,
        approvedAt: template.approvedAt ? new Date(template.approvedAt) : undefined
      }));
      
      setTemplates(transformedTemplates);
    } catch (err) {
      console.error('Error loading templates:', err);
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (templateData: CreateTemplateRequest) => {
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create template');
      }

      showToast('Template created successfully!', 'success');
      setShowBuilder(false);
      loadTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  };

  const handleUpdateTemplate = async (templateData: CreateTemplateRequest) => {
    if (!editingTemplate) return;

    try {
      const response = await fetch(`/api/templates/${editingTemplate.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update template');
      }

      showToast('Template updated successfully!', 'success');
      setEditingTemplate(null);
      setShowBuilder(false);
      loadTemplates();
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete template');
      }

      showToast('Template deleted successfully!', 'success');
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      showToast(error instanceof Error ? error.message : 'Failed to delete template', 'error');
    }
  };

  const handleEditTemplate = (template: TemplateRequest) => {
    setEditingTemplate(template);
    setShowBuilder(true);
  };

  const handleCancelBuilder = () => {
    setShowBuilder(false);
    setEditingTemplate(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to safely format dates
  const formatDate = (date: any): string => {
    try {
      if (!date) return 'N/A';
      
      // If it's already a Date object
      if (date instanceof Date) {
        return date.toLocaleDateString();
      }
      
      // If it's a Firestore timestamp with toDate method
      if (date && typeof date.toDate === 'function') {
        return date.toDate().toLocaleDateString();
      }
      
      // If it's a string or number, try to create a Date
      if (typeof date === 'string' || typeof date === 'number') {
        return new Date(date).toLocaleDateString();
      }
      
      // If it has seconds property (Firestore timestamp)
      if (date && typeof date.seconds === 'number') {
        return new Date(date.seconds * 1000).toLocaleDateString();
      }
      
      return 'Invalid Date';
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return 'Invalid Date';
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.meta.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showBuilder) {
    return (
      <AdvancedTemplateBuilder
        template={editingTemplate || undefined}
        onSave={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
        onCancel={handleCancelBuilder}
        isEditing={!!editingTemplate}
      />
    );
  }

  return (
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Template Management</h1>
            <p className="text-gray-600 mt-1">Create and manage WhatsApp and Instagram templates</p>
          </div>
          
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('library')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'library'
                  ? 'border-[#D4AF37] text-[#D4AF37]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Template Library
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'status'
                  ? 'border-[#D4AF37] text-[#D4AF37]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Status Monitor
            </button>
            {showBuilder && (
              <button
                onClick={() => setActiveTab('builder')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'builder'
                    ? 'border-[#D4AF37] text-[#D4AF37]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Template Builder
              </button>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'library' && (
          <TemplateLibrary
            onEditTemplate={(template) => {
              setEditingTemplate(template);
              setActiveTab('builder');
              setShowBuilder(true);
            }}
            onDeleteTemplate={async (templateId) => {
              if (confirm('Are you sure you want to delete this template?')) {
                try {
                  await templateManagementService.deleteTemplate(templateId);
                  await loadTemplates();
                  showToast('Template deleted successfully', 'success');
                } catch (error) {
                  console.error('Error deleting template:', error);
                  showToast('Failed to delete template', 'error');
                }
              }
            }}
            onSubmitToMeta={async (templateId) => {
              try {
                const response = await fetch('/api/templates/submit-to-meta', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ templateId })
                });
                
                if (response.ok) {
                  showToast('Template submitted to Meta for approval', 'success');
                  await loadTemplates();
                } else {
                  const error = await response.json();
                  showToast(error.error || 'Failed to submit template', 'error');
                }
              } catch (error) {
                console.error('Error submitting template:', error);
                showToast('Failed to submit template', 'error');
              }
            }}
            onCreateTemplate={() => {
              setActiveTab('builder');
              setShowBuilder(true);
            }}
          />
        )}

        {activeTab === 'status' && (
          <StatusMonitor
            onViewTemplate={(template) => {
              setEditingTemplate(template);
              setActiveTab('builder');
              setShowBuilder(true);
            }}
            onRefresh={loadTemplates}
          />
        )}

        {/* Templates List */}
        {loading ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error Loading Templates</h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={loadTemplates}
              className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        ) : null}

        {activeTab === 'builder' && showBuilder && (
          <AdvancedTemplateBuilder
            template={editingTemplate || undefined}
            onSave={async (templateData) => {
              try {
                if (editingTemplate) {
                  await templateManagementService.updateTemplate(editingTemplate.id, templateData);
                  showToast('Template updated successfully', 'success');
                } else {
                  await templateManagementService.createTemplate(templateData);
                  showToast('Template created successfully', 'success');
                }
                await loadTemplates();
                setEditingTemplate(null);
                setShowBuilder(false);
                // activeTab will be automatically set to 'library' by the useEffect above
              } catch (error) {
                console.error('Error saving template:', error);
                showToast('Failed to save template', 'error');
              }
            }}
            onCancel={() => {
              setEditingTemplate(null);
              setShowBuilder(false);
              // activeTab will be automatically set to 'library' by the useEffect above
            }}
            isEditing={!!editingTemplate}
          />
        )}
      </div>
  );
}

export default function TemplatesPage() {
  const { userProfile, signOut } = useAuth();

  return (
    <AdminLayout userProfile={userProfile} onLogout={signOut}>
      <TemplatesPageContent />
    </AdminLayout>
  );
}