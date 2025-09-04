"use client";

import { useState, useEffect } from 'react';
import { AuthService, auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastContext';
import AdminLayout from '../components/AdminLayout';
import { 
  Clock, 
  Plus, 
  AlertTriangle, 
  CheckCircle, 
  Settings,
  BarChart3,
  Filter,
  Search
} from 'lucide-react';
import { 
  SLARule, 
  SLAViolation,
  createSLARule,
  getActiveSLARules,
  getSLAViolations,
  getSLAStats,
  resolveSLAViolation
} from '@/lib/messaging/notifications';

function SLAManagementPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [rules, setRules] = useState<SLARule[]>([]);
  const [violations, setViolations] = useState<SLAViolation[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [showCreateRule, setShowCreateRule] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const router = useRouter();
  const { showToast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'FIRST_RESPONSE' as 'FIRST_RESPONSE' | 'RESOLUTION' | 'FOLLOW_UP',
    timeLimitMinutes: 30,
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
    channels: ['whatsapp'] as ('whatsapp' | 'instagram')[],
    conditions: {
      customerType: [] as string[],
      threadStatus: [] as string[],
      businessHours: false
    },
    actions: {
      notifyUsers: [] as string[],
      notifyRoles: [] as string[],
      autoAssign: false,
      escalateAfterMinutes: undefined as number | undefined
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
        await loadRules();
        await loadViolations();
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

  // Load SLA rules
  const loadRules = async () => {
    try {
      const slaRules = await getActiveSLARules();
      setRules(slaRules);
    } catch (error) {
      console.error('Error loading SLA rules:', error);
      showToast('Error loading SLA rules', 'error');
    }
  };

  // Load SLA violations
  const loadViolations = async () => {
    try {
      const slaViolations = await getSLAViolations();
      setViolations(slaViolations);
    } catch (error) {
      console.error('Error loading SLA violations:', error);
      showToast('Error loading SLA violations', 'error');
    }
  };

  // Load SLA stats
  const loadStats = async () => {
    try {
      const slaStats = await getSLAStats();
      setStats(slaStats);
    } catch (error) {
      console.error('Error loading SLA stats:', error);
    }
  };

  // Filter violations
  const filteredViolations = violations.filter(violation => {
    const matchesStatus = !filterStatus || violation.status === filterStatus;
    const matchesSearch = !searchQuery || 
      violation.ruleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      violation.threadId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const ruleId = await createSLARule(formData);
      showToast('SLA rule created successfully', 'success');
      setShowCreateRule(false);
      resetForm();
      await loadRules();
    } catch (error) {
      console.error('Error creating SLA rule:', error);
      showToast('Error creating SLA rule', 'error');
    }
  };

  // Resolve violation
  const handleResolveViolation = async (violationId: string, notes?: string) => {
    try {
      await resolveSLAViolation(violationId, userProfile?.uid || '', notes);
      showToast('SLA violation resolved', 'success');
      await loadViolations();
      await loadStats();
    } catch (error) {
      console.error('Error resolving SLA violation:', error);
      showToast('Error resolving SLA violation', 'error');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'FIRST_RESPONSE',
      timeLimitMinutes: 30,
      priority: 'MEDIUM',
      channels: ['whatsapp'],
      conditions: {
        customerType: [],
        threadStatus: [],
        businessHours: false
      },
      actions: {
        notifyUsers: [],
        notifyRoles: [],
        autoAssign: false,
        escalateAfterMinutes: undefined
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
            <h1 className="text-2xl font-bold text-gray-900">SLA Management</h1>
            <p className="text-gray-600">Monitor and manage Service Level Agreements</p>
          </div>
          <button
            onClick={() => setShowCreateRule(true)}
            className="bg-[#D4AF37] text-white px-4 py-2 rounded-md hover:bg-[#8B7A1A] transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create SLA Rule
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-2xl font-bold text-gray-900">{stats.totalViolations}</div>
              <div className="text-sm text-gray-600">Total Violations</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-2xl font-bold text-red-600">{stats.activeViolations}</div>
              <div className="text-sm text-gray-600">Active Violations</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-2xl font-bold text-green-600">{stats.resolvedViolations}</div>
              <div className="text-sm text-gray-600">Resolved</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">{Math.round(stats.averageResolutionTime)}m</div>
              <div className="text-sm text-gray-600">Avg Resolution Time</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-2xl font-bold text-purple-600">{Math.round(stats.complianceRate)}%</div>
              <div className="text-sm text-gray-600">Compliance Rate</div>
            </div>
          </div>
        )}

        {/* SLA Rules */}
        <div className="bg-white rounded-lg border mb-6">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">SLA Rules</h2>
          </div>
          <div className="divide-y">
            {rules.map((rule) => (
              <div key={rule.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        rule.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                        rule.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                        rule.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {rule.priority}
                      </span>
                      <span className="text-sm text-gray-500">{rule.type}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Time Limit: {rule.timeLimitMinutes} minutes</span>
                      <span>Channels: {rule.channels.join(', ')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

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
                <option value="ACTIVE">Active</option>
                <option value="RESOLVED">Resolved</option>
                <option value="ESCALATED">Escalated</option>
              </select>
            </div>
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-5 h-5 text-gray-600" />
              <input
                type="text"
                placeholder="Search violations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              />
            </div>
          </div>
        </div>

        {/* SLA Violations */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">SLA Violations</h2>
          </div>
          <div className="divide-y">
            {filteredViolations.map((violation) => (
              <div key={violation.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{violation.ruleName}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        violation.status === 'ACTIVE' ? 'bg-red-100 text-red-800' :
                        violation.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {violation.status}
                      </span>
                      <span className="text-sm text-gray-500">{violation.violationType}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Thread {violation.threadId} breached SLA by {violation.breachMinutes} minutes
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Breached: {violation.breachTime.toLocaleString()}</span>
                      <span>Created: {violation.createdAt.toLocaleString()}</span>
                      {violation.resolvedAt && (
                        <span>Resolved: {violation.resolvedAt.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {violation.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleResolveViolation(violation.id)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create SLA Rule Modal */}
        {showCreateRule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Create SLA Rule</h2>
                <button
                  onClick={() => setShowCreateRule(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                      placeholder="e.g., First Response SLA"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                    >
                      <option value="FIRST_RESPONSE">First Response</option>
                      <option value="RESOLUTION">Resolution</option>
                      <option value="FOLLOW_UP">Follow Up</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                    rows={3}
                    placeholder="Describe the SLA rule..."
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (minutes)</label>
                    <input
                      type="number"
                      value={formData.timeLimitMinutes}
                      onChange={(e) => setFormData(prev => ({ ...prev, timeLimitMinutes: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Channels</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.channels.includes('whatsapp')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({ ...prev, channels: [...prev.channels, 'whatsapp'] }));
                            } else {
                              setFormData(prev => ({ ...prev, channels: prev.channels.filter(c => c !== 'whatsapp') }));
                            }
                          }}
                          className="mr-2"
                        />
                        WhatsApp
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.channels.includes('instagram')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({ ...prev, channels: [...prev.channels, 'instagram'] }));
                            } else {
                              setFormData(prev => ({ ...prev, channels: prev.channels.filter(c => c !== 'instagram') }));
                            }
                          }}
                          className="mr-2"
                        />
                        Instagram
                      </label>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => setShowCreateRule(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-[#D4AF37] text-white rounded-md hover:bg-[#8B7A1A]"
                  >
                    Create Rule
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

export default SLAManagementPage;
