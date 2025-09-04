"use client";

import { useState, useEffect } from 'react';
import { AuthService, auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastContext';
import AdminLayout from '../components/AdminLayout';
import { 
  FileText, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Edit, 
  Eye,
  Filter,
  Search
} from 'lucide-react';
import { 
  TemplateRequest, 
  TemplateComponent,
  createTemplateRequest,
  getTemplateRequests,
  submitTemplateForApproval,
  reviewTemplate,
  validateTemplate,
  generateTemplatePreview,
  getTemplateStats
} from '@/lib/messaging/template-management';

function TemplateManagementPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [templates, setTemplates] = useState<TemplateRequest[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateRequest | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const router = useRouter();
  const { showToast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    language: 'en',
    category: 'UTILITY' as 'UTILITY' | 'MARKETING',
    components: [] as TemplateComponent[],
    meta: {
      description: '',
      exampleVariables: {} as Record<string, string>,
      useCase: '',
      targetAudience: ''
    }
  });

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

    const loadData = async () => {
      try {
        await loadTemplates();
        await loadStats();
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoading(false);
      }
    };

    loadUserProfile();
    loadData();
  }, []);

  // Load templates
  const loadTemplates = async () => {
    try {
      const allTemplates = await getTemplateRequests();
      setTemplates(allTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      showToast('Error loading templates', 'error');
    }
  };

  // Load stats
  const loadStats = async () => {
    try {
      const templateStats = await getTemplateStats();
      setStats(templateStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesStatus = !filterStatus || template.status === filterStatus;
    const matchesSearch = !searchQuery || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.meta.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const validation = validateTemplate(formData);
      if (!validation.isValid) {
        showToast(`Validation errors: ${validation.errors.join(', ')}`, 'error');
        return;
      }

      const templateId = await createTemplateRequest(formData);
      showToast('Template created successfully', 'success');
      setShowCreateForm(false);
      resetForm();
      await loadTemplates();
      await loadStats();
    } catch (error) {
      console.error('Error creating template:', error);
      showToast('Error creating template', 'error');
    }
  };

  // Submit for approval
  const handleSubmitForApproval = async (templateId: string) => {
    try {
      await submitTemplateForApproval(templateId);
      showToast('Template submitted for approval', 'success');
      await loadTemplates();
      await loadStats();
    } catch (error) {
      console.error('Error submitting template:', error);
      showToast('Error submitting template', 'error');
    }
  };

  // Review template
  const handleReview = async (templateId: string, status: 'APPROVED' | 'REJECTED', comments: string) => {
    try {
      await reviewTemplate(templateId, userProfile?.uid || '', userProfile?.name || 'Admin', status, comments);
      showToast(`Template ${status.toLowerCase()}`, 'success');
      await loadTemplates();
      await loadStats();
    } catch (error) {
      console.error('Error reviewing template:', error);
      showToast('Error reviewing template', 'error');
    }
  };

  // Add component
  const addComponent = () => {
    setFormData(prev => ({
      ...prev,
      components: [...prev.components, {
        type: 'BODY',
        text: '',
        variables: []
      }]
    }));
  };

  // Update component
  const updateComponent = (index: number, field: keyof TemplateComponent, value: any) => {
    setFormData(prev => ({
      ...prev,
      components: prev.components.map((comp, i) => 
        i === index ? { ...comp, [field]: value } : comp
      )
    }));
  };

  // Remove component
  const removeComponent = (index: number) => {
    setFormData(prev => ({
      ...prev,
      components: prev.components.filter((_, i) => i !== index)
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      language: 'en',
      category: 'UTILITY',
      components: [],
      meta: {
        description: '',
        exampleVariables: {},
        useCase: '',
        targetAudience: ''
      }
    });
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
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Template Management</h1>
            <p className="text-gray-600">Manage WhatsApp templates and approval workflow</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-[#D4AF37] text-white px-4 py-2 rounded-md hover:bg-[#8B7A1A] transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Template
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Templates</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">{stats.draft}</div>
              <div className="text-sm text-gray-600">Draft</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              >
                <option value="">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-5 h-5 text-gray-600" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              />
            </div>
          </div>
        </div>

        {/* Templates List */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Templates</h2>
          </div>
          <div className="divide-y">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        template.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        template.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        template.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {template.status}
                      </span>
                      <span className="text-sm text-gray-500">{template.category}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{template.meta.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Language: {template.language}</span>
                      <span>Created: {template.createdAt.toLocaleDateString()}</span>
                      {template.submittedAt && (
                        <span>Submitted: {template.submittedAt.toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedTemplate(template);
                        setShowPreview(true);
                      }}
                      className="p-2 text-gray-600 hover:text-gray-900"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {template.status === 'DRAFT' && (
                      <button
                        onClick={() => handleSubmitForApproval(template.id)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Submit
                      </button>
                    )}
                    {template.status === 'PENDING' && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleReview(template.id, 'APPROVED', 'Approved')}
                          className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                        >
                          <CheckCircle className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleReview(template.id, 'REJECTED', 'Rejected')}
                          className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                        >
                          <XCircle className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create Template Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Create New Template</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                      placeholder="e.g., order_update"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="es">Spanish</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as 'UTILITY' | 'MARKETING' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  >
                    <option value="UTILITY">Utility</option>
                    <option value="MARKETING">Marketing</option>
                  </select>
                </div>

                {/* Components */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Components</label>
                    <button
                      onClick={addComponent}
                      className="px-3 py-1 bg-[#D4AF37] text-white text-sm rounded hover:bg-[#8B7A1A]"
                    >
                      Add Component
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.components.map((component, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <select
                            value={component.type}
                            onChange={(e) => updateComponent(index, 'type', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="HEADER">Header</option>
                            <option value="BODY">Body</option>
                            <option value="FOOTER">Footer</option>
                            <option value="BUTTONS">Buttons</option>
                          </select>
                          <button
                            onClick={() => removeComponent(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            ✕
                          </button>
                        </div>
                        <textarea
                          value={component.text || ''}
                          onChange={(e) => updateComponent(index, 'text', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Enter component text..."
                          rows={3}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Meta Information */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.meta.description}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        meta: { ...prev.meta, description: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                      rows={3}
                      placeholder="Describe the template's purpose..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Use Case</label>
                    <input
                      type="text"
                      value={formData.meta.useCase}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        meta: { ...prev.meta, useCase: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                      placeholder="e.g., Order status updates"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                    <input
                      type="text"
                      value={formData.meta.targetAudience}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        meta: { ...prev.meta, targetAudience: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                      placeholder="e.g., Customers with active orders"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-[#D4AF37] text-white rounded-md hover:bg-[#8B7A1A]"
                  >
                    Create Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && selectedTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Template Preview</h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedTemplate.name}</h3>
                  <p className="text-sm text-gray-600">{selectedTemplate.meta.description}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">
                    {generateTemplatePreview(selectedTemplate)}
                  </pre>
                </div>
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default TemplateManagementPage;
