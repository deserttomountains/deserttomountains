'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, Phone, Truck, Target, UserCheck, FileText } from 'lucide-react';
import { AuthService } from '@/lib/firebase';
import { Task } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/components/ToastContext';
import AdminLayout from '../components/AdminLayout';

// Import components
import TaskFilters from './components/TaskFilters';
import TaskCard from './components/TaskCard';
import TaskTable from './components/TaskTable';
import TaskKanban from './components/TaskKanban';
import OptimizedTaskKanban from './components/OptimizedTaskKanban';
import TaskModal from './components/TaskModal';
import TaskAnalytics from './components/TaskAnalytics';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import ViewTaskModal from './components/ViewTaskModal';
import SimpleTaskList from './components/SimpleTaskList';

// Import hooks
import { useDebounce } from './hooks/useDebounce';
import { useTaskFilters } from './hooks/useTaskFilters';
import { useTaskStats } from './hooks/useTaskStats';
import { useMobileDetection } from './hooks/useMobileDetection';
import { isTaskOverdue } from './utils/dateUtils';

export default function TasksPage() {
  const { userProfile, signOut } = useAuth();

  return (
    <AdminLayout userProfile={userProfile} onLogout={signOut}>
      <TasksPageContent />
    </AdminLayout>
  );
}

function TasksPageContent() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isMobile = useMobileDetection();
  
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
  
  // Performance optimizations
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const filteredTasks = useTaskFilters({
    tasks,
    searchQuery: debouncedSearchQuery,
    selectedStatusFilter,
    selectedPriorityFilter,
    selectedCategoryFilter,
    selectedDateFilter,
    sortBy,
    sortOrder
  });
  const stats = useTaskStats(tasks);
  
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

  // Task Actions State
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showViewTaskModal, setShowViewTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const [showTaskActions, setShowTaskActions] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  
  // View State
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'kanban'>('cards');
  
  // Handle view mode for mobile devices
  useEffect(() => {
      if (isMobile && viewMode === 'kanban') {
        setViewMode('cards'); // Switch to cards view on mobile
      }
  }, [isMobile, viewMode]);

  // Load tasks on component mount
  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, selectedStatusFilter, selectedPriorityFilter, selectedCategoryFilter, selectedDateFilter, sortBy, sortOrder]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const fetchedTasks = await AuthService.getTasks();
      
      // Sanitize task data to fix any corrupted status values
      const sanitizedTasks = fetchedTasks.map(task => {
        const validStatuses: Task['status'][] = ['pending', 'in_progress', 'completed'];
        if (!validStatuses.includes(task.status)) {
          console.warn('Found corrupted status for task:', task.id, 'Status:', task.status, 'Resetting to pending');
          return {
            ...task,
            status: 'pending' as Task['status']
          };
        }
        return task;
      });
      
      setTasks(sanitizedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      showToast('Error loading tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Silent background refresh without loading indicator
  const silentRefreshTasks = useCallback(async () => {
    try {
      // Small delay to ensure server has processed the update
      await new Promise(resolve => setTimeout(resolve, 100));
      const fetchedTasks = await AuthService.getTasks();
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error refreshing tasks:', error);
      // Don't show error toast for silent refresh
    }
  }, []);

  // Task form handling functions
  const handleAddTask = async (taskData: typeof taskForm) => {
    if (!user) return;
    
    setIsSubmittingTask(true);
    try {
      const newTask = {
        ...taskData,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await AuthService.createTask(newTask as any, user.uid);
      showToast('Task created successfully', 'success');
      setShowAddTaskModal(false);
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
      loadTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      showToast('Error creating task', 'error');
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleEditTask = async (taskData: typeof taskForm) => {
    if (!selectedTask || !user) return;
    
    setIsUpdatingTask(true);
    try {
      const updatedTask = {
        ...selectedTask,
        ...taskData,
        updatedAt: new Date().toISOString(),
      };
      
      await AuthService.updateTask(selectedTask.id!, updatedTask as any);
      showToast('Task updated successfully', 'success');
      setShowEditTaskModal(false);
      setSelectedTask(null);
      silentRefreshTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      showToast('Error updating task', 'error');
    } finally {
      setIsUpdatingTask(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    
    setIsDeletingTask(true);
    try {
      await AuthService.deleteTask(selectedTask.id!);
      showToast('Task deleted successfully', 'success');
      setShowDeleteConfirmModal(false);
      setSelectedTask(null);
      silentRefreshTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      showToast('Error deleting task', 'error');
    } finally {
      setIsDeletingTask(false);
    }
  };

  const handleStatusChange = useCallback(async (taskId: string, newStatus: Task['status']) => {
    if (isUpdatingStatus) return; // Prevent multiple simultaneous updates
    
    // Validate status value
    const validStatuses: Task['status'][] = ['pending', 'in_progress', 'completed'];
    if (!validStatuses.includes(newStatus)) {
      console.error('Invalid status value:', newStatus);
      showToast('Invalid status value. Please try again.', 'error');
      return;
    }
    
    try {
      setIsUpdatingStatus(true);
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      
      // Optimistic update - immediately update the UI
      const updatedTask = {
        ...task,
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
        updatedAt: new Date().toISOString(),
      };
      
      // Update local state immediately for instant feedback
      setTasks(prevTasks => 
        prevTasks.map(t => t.id === taskId ? updatedTask as unknown as Task : t)
      );
      
      // Show success toast immediately
      showToast(`Task moved to ${newStatus.replace('_', ' ')}`, 'success');
      
      // Update in background
      await AuthService.updateTask(taskId, updatedTask as any);
      
      // Silent refresh to ensure consistency without showing loading
      silentRefreshTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      showToast('Error updating task status', 'error');
      // Revert optimistic update on error - use silent refresh to avoid loading flash
      silentRefreshTasks();
    } finally {
      setIsUpdatingStatus(false);
    }
  }, [tasks, showToast, isUpdatingStatus]);

  // Close actions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-task-actions]')) {
        setShowTaskActions(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Optimized callback functions
  const handleEdit = useCallback((task: Task) => {
    try {
      setSelectedTask(task);
      setShowEditTaskModal(true);
    } catch (error) {
      console.error('Error opening edit modal:', error);
      showToast('Error opening edit form', 'error');
    }
  }, [showToast]);

  // Reset selectedTask when any modal closes
  useEffect(() => {
    if (!showEditTaskModal && !showViewTaskModal && !showDeleteConfirmModal && selectedTask) {
      setSelectedTask(null);
    }
  }, [showEditTaskModal, showViewTaskModal, showDeleteConfirmModal, selectedTask]);

  const handleDelete = useCallback((task: Task) => {
    try {
      setSelectedTask(task);
      setShowDeleteConfirmModal(true);
    } catch (error) {
      console.error('Error opening delete modal:', error);
      showToast('Error opening delete confirmation', 'error');
    }
  }, [showToast]);

  const handleViewTask = useCallback((task: Task) => {
    setSelectedTask(task);
    setShowViewTaskModal(true);
  }, []);

  const handleShowActions = useCallback((taskId: string) => {
    setShowTaskActions(taskId);
  }, []);

  // Utility functions with memoization
  const getPriorityColor = useCallback((priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }, []);

  const getStatusColor = useCallback((status: Task['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }, []);

  const getCategoryColor = useCallback((category: Task['category']) => {
    switch (category) {
      case 'follow_up': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'meeting': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'delivery': return 'bg-green-50 text-green-700 border-green-200';
      case 'marketing': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'support': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'other': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  }, []);

  const getCategoryIcon = useCallback((category: Task['category']) => {
    switch (category) {
      case 'follow_up': return <Phone className="w-4 h-4" />;
      case 'meeting': return <Calendar className="w-4 h-4" />;
      case 'delivery': return <Truck className="w-4 h-4" />;
      case 'marketing': return <Target className="w-4 h-4" />;
      case 'support': return <UserCheck className="w-4 h-4" />;
      case 'other': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  }, []);

  const formatEstimatedTime = useCallback((time: string) => {
    const minutes = parseInt(time);
    if (isNaN(minutes)) return 'N/A';
    
    if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
      if (mins === 0) {
        return `${hours}h`;
      }
      return `${hours}h ${mins}m`;
    }
    return `${minutes}m`;
  }, []);

  const isOverdue = useCallback((task: Task) => {
    return isTaskOverdue(task.dueDate, task.status);
  }, []);


  // Pagination
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
  const startIndex = (currentPage - 1) * tasksPerPage;
  const endIndex = startIndex + tasksPerPage;
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#8B7A1A]">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      {/* Filters and Controls */}
      <TaskFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStatusFilter={selectedStatusFilter}
        onStatusFilterChange={setSelectedStatusFilter}
        selectedPriorityFilter={selectedPriorityFilter}
        onPriorityFilterChange={setSelectedPriorityFilter}
        selectedCategoryFilter={selectedCategoryFilter}
        onCategoryFilterChange={setSelectedCategoryFilter}
        selectedDateFilter={selectedDateFilter}
        onDateFilterChange={setSelectedDateFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddTask={() => setShowAddTaskModal(true)}
        onShowAnalytics={() => setShowTaskAnalytics(true)}
      />

      {/* Task Views */}
      {viewMode === 'cards' && (
        <SimpleTaskList
          tasks={filteredTasks}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          onShowActions={handleShowActions}
          showActions={showTaskActions}
          isOverdue={isOverdue}
          getPriorityColor={getPriorityColor}
          getStatusColor={getStatusColor}
          getCategoryColor={getCategoryColor}
          getCategoryIcon={getCategoryIcon}
          formatEstimatedTime={formatEstimatedTime}
          onViewTask={handleViewTask}
          height={600}
        />
      )}

      {viewMode === 'table' && (
        <TaskTable
          tasks={paginatedTasks}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          onShowActions={handleShowActions}
          showActions={showTaskActions}
          isOverdue={isOverdue}
          getPriorityColor={getPriorityColor}
          getStatusColor={getStatusColor}
          getCategoryColor={getCategoryColor}
          getCategoryIcon={getCategoryIcon}
          formatEstimatedTime={formatEstimatedTime}
          onViewTask={handleViewTask}
        />
      )}

      {viewMode === 'kanban' && !isMobile && (
        <OptimizedTaskKanban
          tasks={filteredTasks}
          onStatusChange={handleStatusChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onShowActions={handleShowActions}
          showActions={showTaskActions}
          isOverdue={isOverdue}
          getPriorityColor={getPriorityColor}
          getStatusColor={getStatusColor}
          getCategoryColor={getCategoryColor}
          getCategoryIcon={getCategoryIcon}
          formatEstimatedTime={formatEstimatedTime}
          onViewTask={handleViewTask}
        />
      )}

      {/* Mobile message for Kanban view */}
      {viewMode === 'kanban' && isMobile && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
                          </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Kanban View Not Available on Mobile</h3>
              <p className="text-blue-700 mb-4">
                The Kanban board is optimized for desktop and tablet views. Please use Cards or Table view on mobile devices.
              </p>
              <div className="flex gap-2 justify-center">
                          <button
                  onClick={() => setViewMode('cards')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer"
                >
                  Switch to Cards
                          </button>
                          <button
                  onClick={() => setViewMode('table')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium cursor-pointer"
                >
                  Switch to Table
                          </button>
                      </div>
                    </div>
                      </div>
                        </div>
                      )}

      {/* Pagination */}
      {viewMode !== 'kanban' && totalPages > 1 && (
        <div className="flex items-center justify-center mt-8">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </button>
            
            <span className="px-3 py-2 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <TaskModal
        isOpen={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
        onSubmit={handleAddTask}
        isSubmitting={isSubmittingTask}
        title="Create New Task"
      />

      <TaskModal
        key={selectedTask?.id || 'new-task'}
        isOpen={showEditTaskModal}
        onClose={() => {
          setShowEditTaskModal(false);
        }}
        onSubmit={handleEditTask}
        task={selectedTask}
        isSubmitting={isUpdatingTask}
        title="Edit Task"
      />

      <TaskAnalytics
        isOpen={showTaskAnalytics}
        onClose={() => setShowTaskAnalytics(false)}
        tasks={tasks}
        stats={stats}
      />

      <DeleteConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={() => {
          setShowDeleteConfirmModal(false);
        }}
        onConfirm={handleDeleteTask}
        task={selectedTask}
        isDeleting={isDeletingTask}
      />

      <ViewTaskModal
        task={selectedTask}
        isOpen={showViewTaskModal}
        onClose={() => {
          setShowViewTaskModal(false);
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isOverdue={isOverdue}
        getPriorityColor={getPriorityColor}
        getStatusColor={getStatusColor}
        getCategoryColor={getCategoryColor}
        getCategoryIcon={getCategoryIcon}
        formatEstimatedTime={formatEstimatedTime}
      />

    </div>
  );
}
