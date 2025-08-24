'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter, Calendar, Clock, Tag, User, CheckCircle, AlertCircle, Clock as ClockIcon, Calendar as CalendarIcon, Tag as TagIcon, User as UserIcon, Activity, TrendingUp, BarChart3, FileText, Settings, Repeat, X, Edit, Target, Flag, Truck, UserCheck, Phone, SortAsc, SortDesc } from 'lucide-react';
import { AuthService, auth } from '@/lib/firebase';
import { Task } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/components/ToastContext';
import { useRouter } from 'next/navigation';
import AdminLayout from '../components/AdminLayout';

export default function TasksPage() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const router = useRouter();

  // Load user profile
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

    loadUserProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await AuthService.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AdminLayout userProfile={userProfile} onLogout={handleLogout}>
      <TasksPageContent />
    </AdminLayout>
  );
}

function TasksPageContent() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<Task['status'] | 'all'>('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<Task['priority'] | 'all'>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<Task['category'] | 'all'>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<'all' | 'today' | 'tomorrow' | 'this_week' | 'next_week' | 'overdue'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt' | 'title' | 'category'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(10);
  
  // Task Modal State
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showTaskAnalytics, setShowTaskAnalytics] = useState(false);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'pending' as Task['status'],
    priority: 'medium' as Task['priority'],
    category: 'follow_up' as Task['category'],
    dueDate: '',
    estimatedTime: '',
    tags: '',
    notes: '',
    relatedToType: '' as 'lead' | 'order' | 'customer' | '',
    relatedToId: '',
    relatedToName: '',
    isRecurring: false,
    recurringType: 'weekly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    recurringInterval: 1,
    recurringEndDate: ''
  });

  // Load tasks on component mount
  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatusFilter, selectedPriorityFilter, selectedCategoryFilter, selectedDateFilter, sortBy, sortOrder]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      console.log('Loading tasks...');
      const fetchedTasks = await AuthService.getTasks();
      console.log('Fetched tasks:', fetchedTasks);
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      showToast('Error loading tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Task form handling functions
  const handleTaskInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTaskForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingTask(true);
    
    try {
      const newTaskData: any = {
        title: taskForm.title,
        description: taskForm.description,
        status: taskForm.status,
        priority: taskForm.priority,
        category: taskForm.category,
        dueDate: new Date(taskForm.dueDate),
        tags: taskForm.tags ? taskForm.tags.split(',').map(tag => tag.trim()) : [],
        notes: taskForm.notes
      };

      // Only add estimatedTime if it has a value
      if (taskForm.estimatedTime) {
        newTaskData.estimatedTime = parseInt(taskForm.estimatedTime);
      }

      // Only add relatedTo if all required fields are present
      if (taskForm.relatedToType && taskForm.relatedToId && taskForm.relatedToName) {
        newTaskData.relatedTo = {
          type: taskForm.relatedToType as 'lead' | 'order' | 'customer',
          id: taskForm.relatedToId,
          name: taskForm.relatedToName
        };
      }

      // Only add recurring if it's enabled and has valid data
      if (taskForm.isRecurring) {
        newTaskData.recurring = {
          type: taskForm.recurringType,
          interval: taskForm.recurringInterval
        };
        
        // Only add endDate if it has a value
        if (taskForm.recurringEndDate) {
          newTaskData.recurring.endDate = new Date(taskForm.recurringEndDate);
        }
      }

      // Check if user is authenticated
      if (!user) {
        throw new Error('User not authenticated. Please log in again.');
      }

      // Create task in Firebase
      const taskId = await AuthService.createTask(newTaskData, user.uid);
      
      // Add the new task to local state with the Firebase ID
      const newTask: Task = {
        id: taskId,
        ...newTaskData,
        createdAt: new Date(),
        createdBy: user.uid,
        updatedAt: new Date()
      };

      setTasks(prev => [...prev, newTask]);
      
      // Reset form
      setTaskForm({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        category: 'follow_up',
        dueDate: '',
        estimatedTime: '',
        tags: '',
        notes: '',
        relatedToType: '',
        relatedToId: '',
        relatedToName: '',
        isRecurring: false,
        recurringType: 'weekly',
        recurringInterval: 1,
        recurringEndDate: ''
      });
      
      setShowAddTaskModal(false);
      showToast('Task created successfully!', 'success');
    } catch (error) {
      console.error('Error creating task:', error);
      showToast('Failed to create task', 'error');
    } finally {
      setIsSubmittingTask(false);
    }
  };

  // Filter and search tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Status filter
    if (selectedStatusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === selectedStatusFilter);
    }

    // Priority filter
    if (selectedPriorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === selectedPriorityFilter);
    }

    // Category filter
    if (selectedCategoryFilter !== 'all') {
      filtered = filtered.filter(task => task.category === selectedCategoryFilter);
    }

    // Date filter
    if (selectedDateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(task => {
        try {
          let dueDate: Date;
          if (task.dueDate instanceof Date) {
            dueDate = task.dueDate;
          } else if (typeof task.dueDate === 'object' && task.dueDate !== null && 'toDate' in task.dueDate) {
            // Handle Firestore Timestamp
            dueDate = (task.dueDate as any).toDate();
          } else {
            dueDate = new Date(task.dueDate);
          }

          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
          const thisWeekStart = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000);
          const thisWeekEnd = new Date(thisWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
          const nextWeekStart = new Date(thisWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
          const nextWeekEnd = new Date(nextWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000);

          switch (selectedDateFilter) {
            case 'today':
              return dueDate >= today && dueDate < tomorrow;
            case 'tomorrow':
              return dueDate >= tomorrow && dueDate < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);
            case 'this_week':
              return dueDate >= thisWeekStart && dueDate <= thisWeekEnd;
            case 'next_week':
              return dueDate >= nextWeekStart && dueDate <= nextWeekEnd;
            case 'overdue':
              return task.status !== 'completed' && dueDate < now;
            default:
              return true;
          }
        } catch {
          return false;
        }
      });
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort tasks
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'dueDate':
          try {
            aValue = a.dueDate instanceof Date ? a.dueDate : new Date(a.dueDate);
            bValue = b.dueDate instanceof Date ? b.dueDate : new Date(b.dueDate);
          } catch {
            return 0;
          }
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
          break;
        case 'createdAt':
          try {
            aValue = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
            bValue = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
          } catch {
            return 0;
          }
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'category':
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [tasks, selectedStatusFilter, selectedPriorityFilter, selectedCategoryFilter, selectedDateFilter, searchQuery, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
  const startIndex = (currentPage - 1) * tasksPerPage;
  const paginatedTasks = filteredTasks.slice(startIndex, startIndex + tasksPerPage);

  // Task statistics
  const getTaskStats = () => {
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const overdue = tasks.filter(t => {
      if (t.status === 'completed') return false;
      
      try {
        let dueDate: Date;
        if (t.dueDate instanceof Date) {
          dueDate = t.dueDate;
        } else if (typeof t.dueDate === 'object' && t.dueDate !== null && 'toDate' in t.dueDate) {
          // Handle Firestore Timestamp
          dueDate = (t.dueDate as any).toDate();
        } else {
          dueDate = new Date(t.dueDate);
        }
        
        return dueDate < new Date();
      } catch {
        return false;
      }
    }).length;

    return { total, pending, inProgress, completed, overdue };
  };

  const stats = getTaskStats();

  // Task analytics function
  const getTaskAnalytics = () => {
    const now = new Date();
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const completedThisWeek = tasks.filter(t => {
      if (t.status !== 'completed' || !t.completedAt) return false;
      
      try {
        let completedDate: Date;
        if (t.completedAt instanceof Date) {
          completedDate = t.completedAt;
        } else if (typeof t.completedAt === 'object' && t.completedAt !== null && 'toDate' in t.completedAt) {
          // Handle Firestore Timestamp
          completedDate = (t.completedAt as any).toDate();
        } else {
          completedDate = new Date(t.completedAt);
        }
        
        return completedDate >= thisWeek;
      } catch {
        return false;
      }
    }).length;
    
    const completedThisMonth = tasks.filter(t => {
      if (t.status !== 'completed' || !t.completedAt) return false;
      
      try {
        let completedDate: Date;
        if (t.completedAt instanceof Date) {
          completedDate = t.completedAt;
        } else if (typeof t.completedAt === 'object' && t.completedAt !== null && 'toDate' in t.completedAt) {
          // Handle Firestore Timestamp
          completedDate = (t.completedAt as any).toDate();
        } else {
          completedDate = new Date(t.completedAt);
        }
        
        return completedDate >= thisMonth;
      } catch {
        return false;
      }
    }).length;
    
    const totalEstimatedTime = tasks
      .filter(t => t.estimatedTime && typeof t.estimatedTime === 'number')
      .reduce((sum, t) => sum + (t.estimatedTime || 0), 0);
    
    const totalActualTime = tasks
      .filter(t => t.actualTime && typeof t.actualTime === 'number')
      .reduce((sum, t) => sum + (t.actualTime || 0), 0);
    
    const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
    const overdueRate = stats.total > 0 ? Math.round((stats.overdue / stats.total) * 100) : 0;
    
    const categoryStats = ['follow_up', 'meeting', 'delivery', 'marketing', 'support', 'other'].map(cat => ({
      category: cat,
      count: tasks.filter(t => t.category === cat).length,
      completed: tasks.filter(t => t.category === cat && t.status === 'completed').length
    }));
    
    const priorityStats = ['urgent', 'high', 'medium', 'low'].map(priority => ({
      priority,
      count: tasks.filter(t => t.priority === priority).length,
      completed: tasks.filter(t => t.priority === priority && t.status === 'completed').length
    }));
    
    return {
      ...stats,
      completedThisWeek,
      completedThisMonth,
      totalEstimatedTime,
      totalActualTime,
      completionRate,
      overdueRate,
      categoryStats,
      priorityStats
    };
  };

  // Helper functions
  const formatDate = (date: Date) => {
    if (!date) return 'N/A';
    try {
      let dateObj: Date;
      if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === 'object' && date !== null && 'toDate' in date) {
        // Handle Firestore Timestamp
        dateObj = (date as any).toDate();
      } else {
        dateObj = new Date(date);
      }
      
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category: Task['category']) => {
    switch (category) {
      case 'follow_up': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'meeting': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'delivery': return 'bg-green-50 text-green-700 border-green-200';
      case 'marketing': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'support': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'other': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getCategoryIcon = (category: Task['category']) => {
    switch (category) {
      case 'follow_up': return <Phone className="w-4 h-4" />;
      case 'meeting': return <Calendar className="w-4 h-4" />;
      case 'delivery': return <Truck className="w-4 h-4" />;
      case 'marketing': return <Target className="w-4 h-4" />;
      case 'support': return <UserCheck className="w-4 h-4" />;
      case 'other': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const isTaskOverdue = (task: Task) => {
    if (task.status === 'completed') return false;
    
    try {
      let dueDate: Date;
      if (task.dueDate instanceof Date) {
        dueDate = task.dueDate;
      } else if (typeof task.dueDate === 'object' && task.dueDate !== null && 'toDate' in task.dueDate) {
        // Handle Firestore Timestamp
        dueDate = (task.dueDate as any).toDate();
      } else {
        dueDate = new Date(task.dueDate);
      }
      
      return dueDate < new Date();
    } catch {
      return false;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-[#8B7A1A]">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Total</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              <p className="text-xs text-blue-600">Tasks</p>
            </div>
            <div className="p-2 bg-blue-200 rounded-xl">
              <Calendar className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-4 border border-yellow-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-yellow-700 uppercase tracking-wide">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
              <p className="text-xs text-yellow-600">To Do</p>
            </div>
            <div className="p-2 bg-yellow-200 rounded-xl">
              <Clock className="w-6 h-6 text-yellow-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-4 border border-indigo-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-indigo-700 uppercase tracking-wide">In Progress</p>
              <p className="text-2xl font-bold text-indigo-900">{stats.inProgress}</p>
              <p className="text-xs text-indigo-600">Active</p>
            </div>
            <div className="p-2 bg-indigo-200 rounded-xl">
              <Activity className="w-6 h-6 text-indigo-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Completed</p>
              <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
              <p className="text-xs text-green-600">Done</p>
            </div>
            <div className="p-2 bg-green-200 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-4 border border-red-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-red-700 uppercase tracking-wide">Overdue</p>
              <p className="text-2xl font-bold text-red-900">{stats.overdue}</p>
              <p className="text-xs text-red-600">Late</p>
            </div>
            <div className="p-2 bg-red-200 rounded-xl">
              <AlertCircle className="w-6 h-6 text-red-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-700 uppercase tracking-wide">Completion</p>
              <p className="text-2xl font-bold text-purple-900">{getTaskAnalytics().completionRate}%</p>
              <p className="text-xs text-purple-600">Rate</p>
            </div>
            <div className="p-2 bg-purple-200 rounded-xl">
              <TrendingUp className="w-6 h-6 text-purple-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Task Controls with View Toggle */}
      <div className="bg-white rounded-2xl border border-[#D4AF37] p-6 shadow-lg mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#5E4E06] mb-2">Task Management</h2>
            <p className="text-[#8B7A1A]">Organize, track, and complete your business tasks efficiently</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowTaskAnalytics(true)}
              className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all duration-200 text-sm font-medium flex items-center gap-2 shadow-sm"
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>

            <button
              onClick={() => setShowAddTaskModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-xl hover:scale-105 transition-all duration-200 text-sm font-medium flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white rounded-xl p-4 sm:p-6 mb-6 shadow-sm border border-[#F5F2E8]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-[#5E4E06] mb-2">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#8B7A1A]" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#5E4E06] mb-2">Status</label>
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value as Task['status'] | 'all')}
            className="w-full px-4 py-2 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#5E4E06] mb-2">Priority</label>
          <select
            value={selectedPriorityFilter}
            onChange={(e) => setSelectedPriorityFilter(e.target.value as Task['priority'] | 'all')}
            className="w-full px-4 py-2 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#5E4E06] mb-2">Category</label>
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value as Task['category'] | 'all')}
            className="w-full px-4 py-2 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
          >
            <option value="all">All Categories</option>
            <option value="follow_up">Follow Up</option>
            <option value="meeting">Meeting</option>
            <option value="delivery">Delivery</option>
            <option value="marketing">Marketing</option>
            <option value="support">Support</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#5E4E06] mb-2">Date Range</label>
          <select
            value={selectedDateFilter}
            onChange={(e) => setSelectedDateFilter(e.target.value as 'all' | 'today' | 'tomorrow' | 'this_week' | 'next_week' | 'overdue')}
            className="w-full px-4 py-2 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="this_week">This Week</option>
            <option value="next_week">Next Week</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#5E4E06] mb-2">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'dueDate' | 'priority' | 'createdAt' | 'title' | 'category')}
            className="w-full px-4 py-2 border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
          >
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="createdAt">Created Date</option>
            <option value="title">Title</option>
            <option value="category">Category</option>
          </select>
        </div>

        </div>
        
        {/* Filter Summary and Sort Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-[#8B7A1A]">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span>
              {filteredTasks.length} of {tasks.length} tasks
              {selectedStatusFilter !== 'all' && ` • Status: ${selectedStatusFilter}`}
              {selectedPriorityFilter !== 'all' && ` • Priority: ${selectedPriorityFilter}`}
              {selectedCategoryFilter !== 'all' && ` • Category: ${selectedCategoryFilter}`}
              {selectedDateFilter !== 'all' && ` • Date: ${selectedDateFilter.replace('_', ' ')}`}
              {searchQuery && ` • Search: "${searchQuery}"`}
            </span>
          </div>
          
          {/* Sort Order Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">Sort Order:</span>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 hover:bg-[#F5F2E8] rounded-lg transition-colors"
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4 text-[#8B7A1A]" /> : <SortDesc className="w-4 h-4 text-[#8B7A1A]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-xl shadow-sm border border-[#F5F2E8] overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-[#F5F2E8] rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-[#8B7A1A]" />
            </div>
            <h3 className="text-lg font-semibold text-[#5E4E06] mb-2">No tasks found</h3>
            <p className="text-[#8B7A1A] text-sm">
              {searchQuery || selectedStatusFilter !== 'all' || selectedPriorityFilter !== 'all' || selectedCategoryFilter !== 'all' || selectedDateFilter !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'Get started by creating your first task'
              }
            </p>
          </div>
        ) : (
          <>
            {/* Tasks Header */}
            <div className="px-3 sm:px-6 py-4 bg-[#F5F2E8] border-b border-[#E6DCC0]">
              <div className="grid grid-cols-12 gap-2 sm:gap-4 text-xs sm:text-sm font-medium text-[#5E4E06]">
                <div className="col-span-3">
                  <span className="whitespace-nowrap text-xs sm:text-sm">Task</span>
                </div>
                <div className="col-span-2">
                  <span className="whitespace-nowrap text-xs sm:text-sm">Status</span>
                </div>
                <div className="col-span-2">
                  <span className="whitespace-nowrap text-xs sm:text-sm">Priority</span>
                </div>
                <div className="col-span-2">
                  <span className="whitespace-nowrap text-xs sm:text-sm">Category</span>
                </div>
                <div className="col-span-3">
                  <span className="whitespace-nowrap text-xs sm:text-sm">Due Date</span>
                </div>
              </div>
            </div>

            {/* Tasks */}
            <div className="divide-y divide-[#F5F2E8]">
              {paginatedTasks.map((task) => (
                <div key={task.id} className="px-3 sm:px-6 py-4 hover:bg-[#FDFCF7] transition-colors">
                  <div className="grid grid-cols-12 gap-2 sm:gap-4 items-center">
                    {/* Task Title and Description */}
                    <div className="col-span-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {task.status === 'completed' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : isTaskOverdue(task) ? (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                          ) : (
                            <Clock className="w-5 h-5 text-[#8B7A1A]" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-[#5E4E06] truncate">{task.title}</h3>
                          <p className="text-sm text-[#8B7A1A] truncate">{task.description}</p>
                          {task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {task.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#F5F2E8] text-[#8B7A1A]"
                                >
                                  {tag}
                                </span>
                              ))}
                              {task.tags.length > 3 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#F5F2E8] text-[#8B7A1A]">
                                  +{task.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Priority */}
                    <div className="col-span-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>

                    {/* Category */}
                    <div className="col-span-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(task.category)}`}>
                        {task.category.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Due Date */}
                    <div className="col-span-3">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-[#8B7A1A]" />
                        <span className={`text-sm ${isTaskOverdue(task) ? 'text-red-600 font-medium' : 'text-[#8B7A1A]'}`}>
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-[#8B7A1A]">
            Showing {startIndex + 1} to {Math.min(startIndex + tasksPerPage, filteredTasks.length)} of {filteredTasks.length} tasks
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-[#5E4E06] bg-white border border-[#D4AF37] rounded-lg hover:bg-[#F5F2E8] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                    currentPage === page
                      ? 'bg-[#D4AF37] text-white'
                      : 'text-[#5E4E06] bg-white border border-[#D4AF37] hover:bg-[#F5F2E8]'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-[#5E4E06] bg-white border border-[#D4AF37] rounded-lg hover:bg-[#F5F2E8] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Task Analytics Modal */}
      {showTaskAnalytics && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 pt-20 sm:pt-4">
          <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[calc(100vh-5rem)] sm:max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8 border-b border-[#D4AF37]">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#5E4E06]">Task Analytics</h3>
                  <p className="text-xs sm:text-sm text-[#8B7A1A]">Comprehensive insights into your task performance</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTaskAnalytics(false)}
                className="p-2 sm:p-3 hover:bg-[#F5F2E8] rounded-lg sm:rounded-xl transition-colors duration-200"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#8B7A1A]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
              {/* Key Metrics */}
              <div>
                <h4 className="text-lg sm:text-xl font-semibold text-[#5E4E06] mb-4 sm:mb-6 flex items-center">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-[#D4AF37]" />
                  Key Performance Metrics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Completion Rate</p>
                        <p className="text-2xl font-bold text-blue-900">{getTaskAnalytics().completionRate}%</p>
                      </div>
                      <div className="p-2 bg-blue-200 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-blue-700" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Completed This Week</p>
                        <p className="text-2xl font-bold text-green-900">{getTaskAnalytics().completedThisWeek}</p>
                      </div>
                      <div className="p-2 bg-green-200 rounded-lg">
                        <Calendar className="w-5 h-5 text-green-700" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-orange-700 uppercase tracking-wide">Completed This Month</p>
                        <p className="text-2xl font-bold text-orange-900">{getTaskAnalytics().completedThisMonth}</p>
                      </div>
                      <div className="p-2 bg-orange-200 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-orange-700" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-red-700 uppercase tracking-wide">Overdue Rate</p>
                        <p className="text-2xl font-bold text-red-900">{getTaskAnalytics().overdueRate}%</p>
                      </div>
                      <div className="p-2 bg-red-200 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-700" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Performance */}
              <div>
                <h4 className="text-lg sm:text-xl font-semibold text-[#5E4E06] mb-4 sm:mb-6 flex items-center">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-[#D4AF37]" />
                  Category Performance
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getTaskAnalytics().categoryStats.map((stat) => (
                    <div key={stat.category} className="bg-white border border-[#D4AF37] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(stat.category as Task['category'])}`}>
                          <div className="flex items-center gap-1">
                            {getCategoryIcon(stat.category as Task['category'])}
                            {stat.category.replace('_', ' ')}
                          </div>
                        </div>
                        <span className="text-sm font-medium text-[#8B7A1A]">{stat.count} tasks</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#8B7A1A]">Completed: {stat.completed}</span>
                        <span className="text-xs font-medium text-green-600">
                          {stat.count > 0 ? Math.round((stat.completed / stat.count) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority Distribution */}
              <div>
                <h4 className="text-lg sm:text-xl font-semibold text-[#5E4E06] mb-4 sm:mb-6 flex items-center">
                  <Flag className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-[#D4AF37]" />
                  Priority Distribution
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {getTaskAnalytics().priorityStats.map((stat) => (
                    <div key={stat.priority} className="bg-white border border-[#D4AF37] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(stat.priority as Task['priority'])}`}>
                          {stat.priority}
                        </div>
                        <span className="text-sm font-medium text-[#8B7A1A]">{stat.count} tasks</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#8B7A1A]">Completed: {stat.completed}</span>
                        <span className="text-xs font-medium text-green-600">
                          {stat.count > 0 ? Math.round((stat.completed / stat.count) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time Tracking */}
              <div>
                <h4 className="text-lg sm:text-xl font-semibold text-[#5E4E06] mb-4 sm:mb-6 flex items-center">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-[#D4AF37]" />
                  Time Tracking Summary
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-indigo-700 uppercase tracking-wide">Total Estimated Time</p>
                        <p className="text-xl font-bold text-indigo-900">{formatTime(getTaskAnalytics().totalEstimatedTime)}</p>
                      </div>
                      <div className="p-2 bg-indigo-200 rounded-lg">
                        <Clock className="w-5 h-5 text-indigo-700" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-purple-700 uppercase tracking-wide">Total Actual Time</p>
                        <p className="text-xl font-bold text-purple-900">{formatTime(getTaskAnalytics().totalActualTime)}</p>
                      </div>
                      <div className="p-2 bg-purple-200 rounded-lg">
                        <Activity className="w-5 h-5 text-purple-700" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end p-4 sm:p-6 lg:p-8 border-t border-[#D4AF37]">
                <button
                  onClick={() => setShowTaskAnalytics(false)}
                  className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-xl hover:scale-105 transition-all duration-200 shadow-lg font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Button */}
      <div className="fixed bottom-6 right-6">
        <button className="bg-[#D4AF37] text-white p-4 rounded-full shadow-lg hover:bg-[#B8941F] transition-colors">
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 pt-20 sm:pt-4">
          <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[calc(100vh-5rem)] sm:max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8 border-b border-[#D4AF37]">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#5E4E06]">
                    Add New Task
                  </h3>
                  <p className="text-xs sm:text-sm text-[#8B7A1A]">
                    Create a new task for your team
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddTaskModal(false)}
                className="p-2 sm:p-3 hover:bg-[#F5F2E8] rounded-lg sm:rounded-xl transition-colors duration-200"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#8B7A1A]" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitTask} className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
              {/* Basic Information */}
              <div>
                <h4 className="text-lg sm:text-xl font-semibold text-[#5E4E06] mb-4 sm:mb-6 flex items-center">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-[#D4AF37]" />
                  Task Information
                </h4>
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#5E4E06] mb-2 sm:mb-3">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={taskForm.title}
                      onChange={handleTaskInputChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] placeholder-[#8B7A1A] text-sm sm:text-base"
                      placeholder="Enter task title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#5E4E06] mb-2 sm:mb-3">Description *</label>
                    <textarea
                      name="description"
                      value={taskForm.description}
                      onChange={handleTaskInputChange}
                      required
                      rows={3}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] placeholder-[#8B7A1A] text-sm sm:text-base resize-none"
                      placeholder="Describe the task in detail"
                    />
                  </div>
                </div>
              </div>

              {/* Task Details */}
              <div>
                <h4 className="text-lg sm:text-xl font-semibold text-[#5E4E06] mb-4 sm:mb-6 flex items-center">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-[#D4AF37]" />
                  Task Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#5E4E06] mb-2 sm:mb-3">Category *</label>
                    <select
                      name="category"
                      value={taskForm.category}
                      onChange={handleTaskInputChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06]"
                    >
                      <option value="follow_up">Follow Up</option>
                      <option value="meeting">Meeting</option>
                      <option value="delivery">Delivery</option>
                      <option value="marketing">Marketing</option>
                      <option value="support">Support</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#5E4E06] mb-2 sm:mb-3">Priority *</label>
                    <select
                      name="priority"
                      value={taskForm.priority}
                      onChange={handleTaskInputChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06]"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#5E4E06] mb-2 sm:mb-3">Status *</label>
                    <select
                      name="status"
                      value={taskForm.status}
                      onChange={handleTaskInputChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06]"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#5E4E06] mb-2 sm:mb-3">Due Date *</label>
                    <input
                      type="date"
                      name="dueDate"
                      value={taskForm.dueDate}
                      onChange={handleTaskInputChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#5E4E06] mb-2 sm:mb-3">Estimated Time (minutes)</label>
                    <input
                      type="number"
                      name="estimatedTime"
                      value={taskForm.estimatedTime}
                      onChange={handleTaskInputChange}
                      min="1"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] placeholder-[#8B7A1A] text-sm sm:text-base"
                      placeholder="e.g., 30, 60, 120"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h4 className="text-lg sm:text-xl font-semibold text-[#5E4E06] mb-4 sm:mb-6 flex items-center">
                  <Tag className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-[#D4AF37]" />
                  Additional Information
                </h4>
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#5E4E06] mb-2 sm:mb-3">Tags</label>
                    <input
                      type="text"
                      name="tags"
                      value={taskForm.tags}
                      onChange={handleTaskInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] placeholder-[#8B7A1A] text-sm sm:text-base"
                      placeholder="Enter tags separated by commas (e.g., urgent, follow-up, customer)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#5E4E06] mb-2 sm:mb-3">Notes</label>
                    <textarea
                      name="notes"
                      value={taskForm.notes}
                      onChange={handleTaskInputChange}
                      rows={3}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] placeholder-[#8B7A1A] text-sm sm:text-base resize-none"
                      placeholder="Add any additional notes or context"
                    />
                  </div>
                </div>
              </div>

              {/* Recurring Task Settings */}
              <div>
                <h4 className="text-lg sm:text-xl font-semibold text-[#5E4E06] mb-4 sm:mb-6 flex items-center">
                  <Repeat className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-[#D4AF37]" />
                  Recurring Task (Optional)
                </h4>
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="isRecurring"
                      checked={taskForm.isRecurring}
                      onChange={(e) => setTaskForm(prev => ({ ...prev, isRecurring: e.target.checked }))}
                      className="w-4 h-4 text-[#D4AF37] border-[#D4AF37] rounded focus:ring-[#D4AF37]"
                    />
                    <label className="text-sm font-medium text-[#5E4E06]">Make this a recurring task</label>
                  </div>
                  
                  {taskForm.isRecurring && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pl-7">
                      <div>
                        <label className="block text-sm font-semibold text-[#5E4E06] mb-2 sm:mb-3">Repeat Every</label>
                        <input
                          type="number"
                          name="recurringInterval"
                          value={taskForm.recurringInterval}
                          onChange={handleTaskInputChange}
                          min="1"
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#5E4E06] mb-2 sm:mb-3">Period</label>
                        <select
                          name="recurringType"
                          value={taskForm.recurringType}
                          onChange={handleTaskInputChange}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] text-sm sm:text-base"
                        >
                          <option value="daily">Day(s)</option>
                          <option value="weekly">Week(s)</option>
                          <option value="monthly">Month(s)</option>
                          <option value="yearly">Year(s)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#5E4E06] mb-2 sm:mb-3">End Date (Optional)</label>
                        <input
                          type="date"
                          name="recurringEndDate"
                          value={taskForm.recurringEndDate}
                          onChange={handleTaskInputChange}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#D4AF37] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#5E4E06] text-sm sm:text-base"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-4 pt-8 border-t border-[#D4AF37]">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-6 py-3 text-[#8B7A1A] bg-[#F5F2E8] hover:bg-[#E6DCC0] rounded-xl transition-colors duration-200 font-medium"
                  disabled={isSubmittingTask}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-xl hover:scale-105 transition-all duration-200 shadow-lg font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmittingTask}
                >
                  {isSubmittingTask ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Create Task</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
