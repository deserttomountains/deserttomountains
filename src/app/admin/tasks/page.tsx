'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter, Calendar, Clock, Tag, User, CheckCircle, AlertCircle, Clock as ClockIcon, Calendar as CalendarIcon, Tag as TagIcon, User as UserIcon, Activity, TrendingUp, BarChart3, FileText, Settings, Repeat, X, Edit, Target, Flag, Truck, UserCheck, Phone, SortAsc, SortDesc, MoreVertical, Trash2, Play, Pause, Square, Move } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  useDroppable,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AuthService, auth } from '@/lib/firebase';
import { Task } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/components/ToastContext';
import AdminLayout from '../components/AdminLayout';

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

  // Task Actions State
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const [showTaskActions, setShowTaskActions] = useState<string | null>(null); // Task ID for which actions are shown
  
  // View State
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'kanban'>('cards');
  
  // Handle view mode for mobile devices
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 1024; // lg breakpoint
      if (isMobile && viewMode === 'kanban') {
        setViewMode('cards'); // Switch to cards view on mobile
      }
    };

    // Check on mount
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);
  
  // Kanban State
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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

  // Task Actions Functions
  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    
    // Helper function to safely format date for input field
    const formatDateForInput = (date: any): string => {
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
        
        // Check if the date is valid
        if (isNaN(dateObj.getTime())) {
          return '';
        }
        
        return dateObj.toISOString().split('T')[0];
      } catch (error) {
        console.error('Error formatting date:', error);
        return '';
      }
    };

    setTaskForm({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      category: task.category,
      dueDate: formatDateForInput(task.dueDate),
      estimatedTime: task.estimatedTime?.toString() || '',
      tags: task.tags.join(', '),
      notes: task.notes,
      relatedToType: task.relatedTo?.type || '',
      relatedToId: task.relatedTo?.id || '',
      relatedToName: task.relatedTo?.name || '',
      isRecurring: !!task.recurring,
      recurringType: task.recurring?.type || 'weekly',
      recurringInterval: task.recurring?.interval || 1,
      recurringEndDate: task.recurring?.endDate ? formatDateForInput(task.recurring.endDate) : ''
    });
    setShowEditTaskModal(true);
    setShowTaskActions(null);
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !user) return;
    
    setIsUpdatingTask(true);
    
    try {
      const updatedTaskData: any = {
        title: taskForm.title,
        description: taskForm.description,
        status: taskForm.status,
        priority: taskForm.priority,
        category: taskForm.category,
        dueDate: new Date(taskForm.dueDate),
        tags: taskForm.tags ? taskForm.tags.split(',').map(tag => tag.trim()) : [],
        notes: taskForm.notes,
        updatedAt: new Date()
      };

      // Only add estimatedTime if it has a value
      if (taskForm.estimatedTime) {
        updatedTaskData.estimatedTime = parseInt(taskForm.estimatedTime);
      }

      // Only add relatedTo if all required fields are present
      if (taskForm.relatedToType && taskForm.relatedToId && taskForm.relatedToName) {
        updatedTaskData.relatedTo = {
          type: taskForm.relatedToType as 'lead' | 'order' | 'customer',
          id: taskForm.relatedToId,
          name: taskForm.relatedToName
        };
      }

      // Only add recurring if it's enabled and has valid data
      if (taskForm.isRecurring) {
        updatedTaskData.recurring = {
          type: taskForm.recurringType,
          interval: taskForm.recurringInterval
        };
        
        // Only add endDate if it has a value
        if (taskForm.recurringEndDate) {
          updatedTaskData.recurring.endDate = new Date(taskForm.recurringEndDate);
        }
      }

      // If status is being changed to completed, add completedAt
      if (taskForm.status === 'completed' && selectedTask.status !== 'completed') {
        updatedTaskData.completedAt = new Date();
      }

      // Update task in Firebase
      await AuthService.updateTask(selectedTask.id!, updatedTaskData);
      
      // Update task in local state
      setTasks(prev => prev.map(task => 
        task.id === selectedTask.id 
          ? { ...task, ...updatedTaskData }
          : task
      ));
      
      setShowEditTaskModal(false);
      setSelectedTask(null);
      showToast('Task updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating task:', error);
      showToast('Failed to update task', 'error');
    } finally {
      setIsUpdatingTask(false);
    }
  };

  const handleDeleteTask = (task: Task) => {
    setSelectedTask(task);
    setShowDeleteConfirmModal(true);
    setShowTaskActions(null);
  };

  const confirmDeleteTask = async () => {
    if (!selectedTask) return;
    
    setIsDeletingTask(true);
    
    try {
      await AuthService.deleteTask(selectedTask.id!);
      
      // Remove task from local state
      setTasks(prev => prev.filter(task => task.id !== selectedTask.id));
      
      setShowDeleteConfirmModal(false);
      setSelectedTask(null);
      showToast('Task deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting task:', error);
      showToast('Failed to delete task', 'error');
    } finally {
      setIsDeletingTask(false);
    }
  };

  const handleStatusChange = async (task: Task, newStatus: Task['status']) => {
    try {
      const updatedTaskData: any = {
        status: newStatus,
        updatedAt: new Date()
      };

      // If status is being changed to completed, add completedAt
      if (newStatus === 'completed' && task.status !== 'completed') {
        updatedTaskData.completedAt = new Date();
      }

      // Update task in Firebase
      await AuthService.updateTask(task.id!, updatedTaskData);
      
      // Update task in local state
      setTasks(prev => prev.map(t => 
        t.id === task.id 
          ? { ...t, ...updatedTaskData }
          : t
      ));
      
      showToast(`Task status updated to ${newStatus.replace('_', ' ')}`, 'success');
    } catch (error) {
      console.error('Error updating task status:', error);
      showToast('Failed to update task status', 'error');
    }
  };

  const toggleTaskActions = (taskId: string) => {
    setShowTaskActions(showTaskActions === taskId ? null : taskId);
  };

  // Smart dropdown positioning to prevent clipping
  const [dropdownPosition, setDropdownPosition] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    if (showTaskActions) {
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        const button = document.querySelector(`[data-task-id="${showTaskActions}"]`);
        if (!button) return;
        
        const buttonRect = button.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const dropdownHeight = 250; // Estimate for dropdown height
        
        // Check if there's enough space below
        const spaceBelow = viewportHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;
        
        // Add buffer to ensure dropdown doesn't touch viewport edges
        if (spaceBelow >= (dropdownHeight + 20) || spaceBelow > spaceAbove) {
          // Position below
          setDropdownPosition({
            [showTaskActions]: { top: '100%', marginTop: '8px' }
          });
        } else {
          // Position above
          setDropdownPosition({
            [showTaskActions]: { bottom: '100%', marginBottom: '8px' }
          });
        }
      }, 0);
    } else {
      setDropdownPosition({});
    }
  }, [showTaskActions]);

  const getDropdownPosition = (taskId: string) => {
    return dropdownPosition[taskId] || { top: '100%', marginTop: '8px' };
  };

  // Close actions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showTaskActions && !(event.target as Element).closest('.task-actions-dropdown')) {
        setShowTaskActions(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTaskActions]);

  // DnD Sensors - Optimized for smooth dragging like Trello
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Reduced for more responsive dragging
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // DnD Handlers - Optimized for smooth real-time movement
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setIsDragging(true);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active && over && active.id !== over.id) {
      const activeTask = tasks.find(task => task.id === active.id);
      
      // Map column IDs to status values
      const statusMap: { [key: string]: Task['status'] } = {
        'pending': 'pending',
        'in_progress': 'in_progress',
        'completed': 'completed'
      };
      
      const newStatus = statusMap[over.id as string];
      
      if (activeTask && newStatus && activeTask.status !== newStatus) {
        await handleStatusChange(activeTask, newStatus);
      }
    }
    
    setActiveId(null);
    setIsDragging(false);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Real-time visual feedback during drag over
    const { active, over } = event;
    if (active && over) {
      // Add smooth visual feedback for the drop zone
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

  // Droppable Column Component for Kanban - Trello-like drop zones
  const DroppableColumn = ({ 
    id, 
    title, 
    icon, 
    color, 
    tasks, 
    children 
  }: { 
    id: string; 
    title: string; 
    icon: React.ReactNode; 
    color: string; 
    tasks: Task[]; 
    children: React.ReactNode; 
  }) => {
    const { setNodeRef, isOver } = useDroppable({ id });
    
    return (
      <div className={`bg-[#F5F2E8] rounded-xl p-4 min-h-[600px] transition-all duration-150 ease-out ${
        isOver 
          ? 'bg-[#E6DCC0] border-2 border-[#D4AF37] shadow-lg scale-[1.02]' 
          : 'border-2 border-transparent hover:border-[#D4AF37]/30'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#5E4E06] flex items-center gap-2">
            {icon}
            {title}
          </h3>
          <span className={`${color} text-xs font-medium px-2 py-1 rounded-full transition-all duration-150 ${
            isOver ? 'scale-110' : ''
          }`}>
            {tasks.length}
          </span>
        </div>
        <div 
          ref={setNodeRef} 
          className={`space-y-3 min-h-[500px] transition-all duration-150 ${
            isOver ? 'bg-[#D4AF37]/5 rounded-lg p-2' : ''
          }`}
        >
          {children}
        </div>
      </div>
    );
  };

  // Sortable Task Card Component for Kanban - Trello-like smooth dragging
  const SortableTaskCard = ({ task }: { task: Task }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ 
      id: task.id!,
      transition: {
        duration: 150,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition: isDragging ? 'none' : transition, // No transition during drag for smooth movement
      opacity: isDragging ? 0.9 : 1,
      zIndex: isDragging ? 9999 : 'auto',
      position: isDragging ? ('relative' as const) : ('static' as const),
      cursor: isDragging ? 'grabbing' : 'grab',
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`group relative bg-white border-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-150 ease-out cursor-grab active:cursor-grabbing ${
          isDragging 
            ? 'shadow-2xl scale-[1.02] rotate-1 border-[#D4AF37] bg-white' 
            : task.status === 'completed' 
              ? 'border-green-200 bg-green-50 hover:shadow-lg' 
              : isTaskOverdue(task) 
                ? 'border-red-200 bg-red-50 hover:shadow-lg' 
                : task.status === 'in_progress'
                  ? 'border-blue-200 bg-blue-50 hover:shadow-lg'
                  : 'border-[#D4AF37] bg-gradient-to-br from-white to-[#FDFCF7] hover:shadow-lg'
        }`}
        {...attributes}
        {...listeners}
      >
        {/* Drag Handle */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Move className="w-4 h-4 text-[#8B7A1A]" />
        </div>

        {/* Status Indicator */}
        <div className={`absolute top-2 left-2 w-2 h-2 rounded-full ${
          task.status === 'completed' 
            ? 'bg-green-500' 
            : isTaskOverdue(task) 
              ? 'bg-red-500' 
              : task.status === 'in_progress'
                ? 'bg-blue-500'
                : 'bg-yellow-500'
        }`}></div>

        <div className="p-3">
          {/* Task Title */}
          <h4 className="font-medium text-[#5E4E06] text-sm mb-1 line-clamp-2">
            {task.title}
          </h4>

          {/* Task Description */}
          <p className="text-xs text-[#8B7A1A] mb-2 line-clamp-2">
            {task.description}
          </p>

          {/* Priority and Category */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            <div className={`p-1 rounded ${getCategoryColor(task.category)}`}>
              {getCategoryIcon(task.category)}
            </div>
          </div>

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {task.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-[#F5F2E8] text-[#8B7A1A]"
                >
                  {tag}
                </span>
              ))}
              {task.tags.length > 2 && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-[#F5F2E8] text-[#8B7A1A]">
                  +{task.tags.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Due Date */}
          <div className="flex items-center justify-between text-xs text-[#8B7A1A]">
            <div className="flex items-center gap-1">
              <CalendarIcon className="w-3 h-3" />
              <span className={isTaskOverdue(task) ? 'text-red-600 font-medium' : ''}>
                {formatDate(task.dueDate)}
              </span>
            </div>
            
            {task.estimatedTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatTime(task.estimatedTime)}</span>
              </div>
            )}
          </div>

          {/* Overdue Warning */}
          {isTaskOverdue(task) && task.status !== 'completed' && (
            <div className="absolute top-1 left-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
              OVERDUE
            </div>
          )}

          {/* Completion Badge */}
          {task.status === 'completed' && (
            <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              DONE
            </div>
          )}
        </div>
      </div>
    );
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
      {/* Development Warning Banner */}
      <div className="bg-yellow-500 border-b border-yellow-600 rounded-xl mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-3">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-900 mr-2" />
              <p className="text-yellow-900 font-semibold text-sm">
                ⚠️ This page is currently under development. Features may be incomplete or subject to change.
              </p>
            </div>
          </div>
        </div>
      </div>
      
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
            {/* View Toggle */}
            <div className="flex items-center bg-[#F5F2E8] rounded-xl p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  viewMode === 'cards'
                    ? 'bg-white text-[#5E4E06] shadow-sm'
                    : 'text-[#8B7A1A] hover:text-[#5E4E06]'
                }`}
              >
                <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  viewMode === 'table'
                    ? 'bg-white text-[#5E4E06] shadow-sm'
                    : 'text-[#8B7A1A] hover:text-[#5E4E06]'
                }`}
              >
                <div className="flex flex-col gap-0.5 w-4 h-4">
                  <div className="bg-current rounded-sm h-0.5"></div>
                  <div className="bg-current rounded-sm h-0.5"></div>
                  <div className="bg-current rounded-sm h-0.5"></div>
                </div>
                <span className="hidden sm:inline">Table</span>
              </button>
              {/* Kanban button - hidden on mobile */}
              <button
                onClick={() => setViewMode('kanban')}
                className={`hidden lg:flex px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 items-center gap-2 ${
                  viewMode === 'kanban'
                    ? 'bg-white text-[#5E4E06] shadow-sm'
                    : 'text-[#8B7A1A] hover:text-[#5E4E06]'
                }`}
              >
                <div className="flex gap-0.5 w-4 h-4">
                  <div className="bg-current rounded-sm w-1"></div>
                  <div className="bg-current rounded-sm w-1"></div>
                  <div className="bg-current rounded-sm w-1"></div>
                </div>
                Kanban
              </button>
            </div>

            <button
              onClick={() => setShowTaskAnalytics(true)}
              className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all duration-200 text-sm font-medium flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>

            <button
              onClick={() => setShowAddTaskModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-xl hover:scale-105 transition-all duration-200 text-sm font-medium flex items-center gap-2 shadow-lg cursor-pointer"
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
              className="p-2 hover:bg-[#F5F2E8] rounded-lg transition-colors cursor-pointer"
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
        ) : viewMode === 'cards' ? (
          // Card View
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {paginatedTasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`group relative bg-white border-2 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${
                    task.status === 'completed' 
                      ? 'border-green-200 bg-green-50' 
                      : isTaskOverdue(task) 
                        ? 'border-red-200 bg-red-50' 
                        : task.status === 'in_progress'
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-[#D4AF37] bg-gradient-to-br from-white to-[#FDFCF7]'
                  }`}
                >
                  {/* Status Indicator */}
                  <div className={`absolute top-3 right-3 w-3 h-3 rounded-full ${
                    task.status === 'completed' 
                      ? 'bg-green-500' 
                      : isTaskOverdue(task) 
                        ? 'bg-red-500' 
                        : task.status === 'in_progress'
                          ? 'bg-blue-500'
                          : 'bg-yellow-500'
                  }`}></div>

                  {/* Card Header */}
                  <div className="p-4 sm:p-5">
                    {/* Category and Priority Row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${getCategoryColor(task.category)}`}>
                          {getCategoryIcon(task.category)}
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      
                      {/* Task Actions */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTaskActions(task.id!);
                          }}
                          className="p-2 hover:bg-[#F5F2E8] rounded-lg transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical className="w-4 h-4 text-[#8B7A1A]" />
                        </button>
                        
                        {/* Actions Dropdown */}
                        {showTaskActions === task.id && (
                          <div className="task-actions-dropdown absolute right-0 z-10 bg-white border border-[#D4AF37] rounded-lg shadow-lg py-2 min-w-[160px]" style={getDropdownPosition(task.id!)}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditTask(task);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#5E4E06] hover:bg-[#F5F2E8] transition-colors cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                              Edit Task
                            </button>
                            
                            {task.status !== 'pending' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(task, 'pending');
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#5E4E06] hover:bg-[#F5F2E8] transition-colors cursor-pointer"
                              >
                                <Clock className="w-4 h-4" />
                                Mark Pending
                              </button>
                            )}
                            
                            {task.status !== 'in_progress' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(task, 'in_progress');
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#5E4E06] hover:bg-[#F5F2E8] transition-colors cursor-pointer"
                              >
                                <Play className="w-4 h-4" />
                                Start Progress
                              </button>
                            )}
                            
                            {task.status !== 'completed' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(task, 'completed');
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#5E4E06] hover:bg-[#F5F2E8] transition-colors cursor-pointer"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Mark Complete
                              </button>
                            )}
                            
                            <div className="border-t border-[#F5F2E8] my-1"></div>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(task);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Task
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Task Title */}
                    <h3 className="font-semibold text-[#5E4E06] text-lg mb-2 line-clamp-2 group-hover:text-[#8B7A1A] transition-colors">
                      {task.title}
                    </h3>

                    {/* Task Description */}
                    <p className="text-sm text-[#8B7A1A] mb-4 line-clamp-3">
                      {task.description}
                    </p>

                    {/* Tags */}
                    {task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
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

                    {/* Quick Status Actions */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                        {task.status === 'completed' && <CheckCircle className="w-4 h-4 mr-1" />}
                        {task.status === 'in_progress' && <Activity className="w-4 h-4 mr-1" />}
                        {task.status === 'pending' && <Clock className="w-4 h-4 mr-1" />}
                        {task.status.replace('_', ' ')}
                      </span>
                      
                      <div className="flex gap-1">
                        {task.status !== 'pending' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(task, 'pending');
                            }}
                            className="p-2 bg-yellow-100 hover:bg-yellow-200 rounded-lg text-yellow-700 transition-colors cursor-pointer"
                            title="Mark as Pending"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        )}
                        {task.status !== 'in_progress' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(task, 'in_progress');
                            }}
                            className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg text-blue-700 transition-colors cursor-pointer"
                            title="Start Progress"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        {task.status !== 'completed' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(task, 'completed');
                            }}
                            className="p-2 bg-green-100 hover:bg-green-200 rounded-lg text-green-700 transition-colors cursor-pointer"
                            title="Mark Complete"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="flex items-center justify-between text-sm text-[#8B7A1A]">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        <span className={isTaskOverdue(task) ? 'text-red-600 font-medium' : ''}>
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                      
                      {task.estimatedTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(task.estimatedTime)}</span>
                        </div>
                      )}
                    </div>

                    {/* Overdue Warning */}
                    {isTaskOverdue(task) && task.status !== 'completed' && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        OVERDUE
                      </div>
                    )}

                    {/* Completion Badge */}
                    {task.status === 'completed' && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        COMPLETED
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : viewMode === 'table' ? (
          // Table View - Responsive for Mobile
          <>
            {/* Tasks Header - Hidden on Mobile */}
            <div className="hidden md:block px-3 sm:px-6 py-4 bg-[#F5F2E8] border-b border-[#E6DCC0]">
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
                <div className="col-span-2">
                  <span className="whitespace-nowrap text-xs sm:text-sm">Due Date</span>
                </div>
                <div className="col-span-1">
                  <span className="whitespace-nowrap text-xs sm:text-sm">Actions</span>
                </div>
              </div>
            </div>

            {/* Tasks - Responsive Layout */}
            <div className="divide-y divide-[#F5F2E8]">
              {paginatedTasks.map((task) => (
                <div key={task.id} className="px-3 sm:px-6 py-4 hover:bg-[#FDFCF7] transition-colors relative">
                  {/* Mobile Layout - Card Style */}
                  <div className="md:hidden">
                    <div className="flex items-start gap-3 mb-3">
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
                        <h3 className="font-medium text-[#5E4E06] text-sm">{task.title}</h3>
                        <p className="text-xs text-[#8B7A1A] mt-1 line-clamp-2">{task.description}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <button
                          data-task-id={task.id}
                          onClick={() => toggleTaskActions(task.id!)}
                          className="p-2 hover:bg-[#F5F2E8] rounded-lg transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4 text-[#8B7A1A]" />
                        </button>
                      </div>
                    </div>

                    {/* Mobile Status and Quick Actions */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {task.status !== 'pending' && (
                          <button
                            onClick={() => handleStatusChange(task, 'pending')}
                            className="p-1.5 bg-yellow-100 hover:bg-yellow-200 rounded text-yellow-700 transition-colors cursor-pointer"
                            title="Mark as Pending"
                          >
                            <Clock className="w-3 h-3" />
                          </button>
                        )}
                        {task.status !== 'in_progress' && (
                          <button
                            onClick={() => handleStatusChange(task, 'in_progress')}
                            className="p-1.5 bg-blue-100 hover:bg-blue-200 rounded text-blue-700 transition-colors cursor-pointer"
                            title="Start Progress"
                          >
                            <Play className="w-3 h-3" />
                          </button>
                        )}
                        {task.status !== 'completed' && (
                          <button
                            onClick={() => handleStatusChange(task, 'completed')}
                            className="p-1.5 bg-green-100 hover:bg-green-200 rounded text-green-700 transition-colors cursor-pointer"
                            title="Mark Complete"
                          >
                            <CheckCircle className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Mobile Category and Due Date */}
                    <div className="flex items-center justify-between text-xs text-[#8B7A1A]">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(task.category)}`}>
                          {task.category.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        <span className={isTaskOverdue(task) ? 'text-red-600 font-medium' : ''}>
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                    </div>

                    {/* Mobile Tags */}
                    {task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {task.tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#F5F2E8] text-[#8B7A1A]"
                          >
                            {tag}
                          </span>
                        ))}
                        {task.tags.length > 2 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#F5F2E8] text-[#8B7A1A]">
                            +{task.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                                         {/* Mobile Actions Dropdown */}
                     {showTaskActions === task.id && (
                       <div className="task-actions-dropdown absolute right-3 z-10 bg-white border border-[#D4AF37] rounded-lg shadow-lg py-2 min-w-[160px]" style={getDropdownPosition(task.id!)}>
                        <button
                          onClick={() => handleEditTask(task)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#5E4E06] hover:bg-[#F5F2E8] transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                          Edit Task
                        </button>
                        
                        {task.status !== 'pending' && (
                          <button
                            onClick={() => handleStatusChange(task, 'pending')}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#5E4E06] hover:bg-[#F5F2E8] transition-colors cursor-pointer"
                          >
                            <Clock className="w-4 h-4" />
                            Mark Pending
                          </button>
                        )}
                        
                        {task.status !== 'in_progress' && (
                          <button
                            onClick={() => handleStatusChange(task, 'in_progress')}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#5E4E06] hover:bg-[#F5F2E8] transition-colors cursor-pointer"
                          >
                            <Play className="w-4 h-4" />
                            Start Progress
                          </button>
                        )}
                        
                        {task.status !== 'completed' && (
                          <button
                            onClick={() => handleStatusChange(task, 'completed')}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#5E4E06] hover:bg-[#F5F2E8] transition-colors cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Mark Complete
                          </button>
                        )}
                        
                        <div className="border-t border-[#F5F2E8] my-1"></div>
                        
                        <button
                          onClick={() => handleDeleteTask(task)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Task
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Desktop Layout - Table Style */}
                  <div className="hidden md:grid grid-cols-12 gap-2 sm:gap-4 items-center">
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

                    {/* Status with Quick Actions */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                        {/* Quick Status Change Buttons */}
                        <div className="flex gap-1">
                          {task.status !== 'pending' && (
                            <button
                              onClick={() => handleStatusChange(task, 'pending')}
                              className="p-1 bg-yellow-100 hover:bg-yellow-200 rounded text-yellow-700 transition-colors cursor-pointer"
                              title="Mark as Pending"
                            >
                              <Clock className="w-3 h-3" />
                            </button>
                          )}
                          {task.status !== 'in_progress' && (
                            <button
                              onClick={() => handleStatusChange(task, 'in_progress')}
                              className="p-1 bg-blue-100 hover:bg-blue-200 rounded text-blue-700 transition-colors cursor-pointer"
                              title="Start Progress"
                            >
                              <Play className="w-3 h-3" />
                            </button>
                          )}
                          {task.status !== 'completed' && (
                            <button
                              onClick={() => handleStatusChange(task, 'completed')}
                              className="p-1 bg-green-100 hover:bg-green-200 rounded text-green-700 transition-colors cursor-pointer"
                              title="Mark Complete"
                            >
                              <CheckCircle className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
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
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-[#8B7A1A]" />
                        <span className={`text-sm ${isTaskOverdue(task) ? 'text-red-600 font-medium' : 'text-[#8B7A1A]'}`}>
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                    </div>

                    {/* Task Actions */}
                    <div className="col-span-1 relative">
                      <div className="flex items-center justify-end">
                        <button
                          data-task-id={task.id}
                          onClick={() => toggleTaskActions(task.id!)}
                          className="p-2 hover:bg-[#F5F2E8] rounded-lg transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4 text-[#8B7A1A]" />
                        </button>
                        
                        {/* Actions Dropdown */}
                        {showTaskActions === task.id && (
                          <div className="task-actions-dropdown absolute right-0 z-10 bg-white border border-[#D4AF37] rounded-lg shadow-lg py-2 min-w-[160px]" style={getDropdownPosition(task.id!)}>
                            <button
                              onClick={() => handleEditTask(task)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#5E4E06] hover:bg-[#F5F2E8] transition-colors cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                              Edit Task
                            </button>
                            
                            {task.status !== 'pending' && (
                              <button
                                onClick={() => handleStatusChange(task, 'pending')}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#5E4E06] hover:bg-[#F5F2E8] transition-colors cursor-pointer"
                              >
                                <Clock className="w-4 h-4" />
                                Mark Pending
                              </button>
                            )}
                            
                            {task.status !== 'in_progress' && (
                              <button
                                onClick={() => handleStatusChange(task, 'in_progress')}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#5E4E06] hover:bg-[#F5F2E8] transition-colors cursor-pointer"
                              >
                                <Play className="w-4 h-4" />
                                Start Progress
                              </button>
                            )}
                            
                            {task.status !== 'completed' && (
                              <button
                                onClick={() => handleStatusChange(task, 'completed')}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#5E4E06] hover:bg-[#F5F2E8] transition-colors cursor-pointer"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Mark Complete
                              </button>
                            )}
                            
                            <div className="border-t border-[#F5F2E8] my-1"></div>
                            
                            <button
                              onClick={() => handleDeleteTask(task)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Task
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : viewMode === 'kanban' ? (
           // Kanban View
           <DndContext
             sensors={sensors}
             collisionDetection={closestCenter}
             onDragStart={handleDragStart}
             onDragEnd={handleDragEnd}
             onDragOver={handleDragOver}
           >
             <DragOverlay>
               {activeId ? (
                 <div className="bg-white border-2 border-[#D4AF37] rounded-lg shadow-2xl scale-[1.02] rotate-1 p-3 opacity-90">
                   <div className="font-medium text-[#5E4E06] text-sm mb-1">
                     {tasks.find(t => t.id === activeId)?.title}
                   </div>
                   <div className="text-xs text-[#8B7A1A]">
                     {tasks.find(t => t.id === activeId)?.description}
                   </div>
                 </div>
               ) : null}
             </DragOverlay>
             <div className="p-4 sm:p-6">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                 {/* Pending Column */}
                 <DroppableColumn
                   id="pending"
                   title="Pending"
                   icon={<Clock className="w-5 h-5 text-yellow-600" />}
                   color="bg-yellow-100 text-yellow-800"
                   tasks={filteredTasks.filter(t => t.status === 'pending')}
                 >
                   <SortableContext
                     items={filteredTasks.filter(t => t.status === 'pending').map(t => t.id!)}
                     strategy={verticalListSortingStrategy}
                   >
                     {filteredTasks
                       .filter(task => task.status === 'pending')
                       .map((task) => (
                         <SortableTaskCard key={task.id} task={task} />
                       ))}
                   </SortableContext>
                 </DroppableColumn>

                 {/* In Progress Column */}
                 <DroppableColumn
                   id="in_progress"
                   title="In Progress"
                   icon={<Activity className="w-5 h-5 text-blue-600" />}
                   color="bg-blue-100 text-blue-800"
                   tasks={filteredTasks.filter(t => t.status === 'in_progress')}
                 >
                   <SortableContext
                     items={filteredTasks.filter(t => t.status === 'in_progress').map(t => t.id!)}
                     strategy={verticalListSortingStrategy}
                   >
                     {filteredTasks
                       .filter(task => task.status === 'in_progress')
                       .map((task) => (
                         <SortableTaskCard key={task.id} task={task} />
                       ))}
                   </SortableContext>
                 </DroppableColumn>

                 {/* Completed Column */}
                 <DroppableColumn
                   id="completed"
                   title="Completed"
                   icon={<CheckCircle className="w-5 h-5 text-green-600" />}
                   color="bg-green-100 text-green-800"
                   tasks={filteredTasks.filter(t => t.status === 'completed')}
                 >
                   <SortableContext
                     items={filteredTasks.filter(t => t.status === 'completed').map(t => t.id!)}
                     strategy={verticalListSortingStrategy}
                   >
                     {filteredTasks
                       .filter(task => task.status === 'completed')
                       .map((task) => (
                         <SortableTaskCard key={task.id} task={task} />
                       ))}
                   </SortableContext>
                 </DroppableColumn>


               </div>
             </div>
           </DndContext>
         ) : null}
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
              className="px-3 py-2 text-sm font-medium text-[#5E4E06] bg-white border border-[#D4AF37] rounded-lg hover:bg-[#F5F2E8] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg cursor-pointer ${
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
              className="px-3 py-2 text-sm font-medium text-[#5E4E06] bg-white border border-[#D4AF37] rounded-lg hover:bg-[#F5F2E8] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Task Analytics Modal */}
      {showTaskAnalytics && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[calc(100vh-2rem)] sm:max-h-[90vh] flex flex-col">
            {/* Modal Header - Fixed */}
            <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8 border-b border-[#D4AF37] flex-shrink-0">
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
                className="p-2 sm:p-3 hover:bg-[#F5F2E8] rounded-lg sm:rounded-xl transition-colors duration-200 cursor-pointer"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#8B7A1A]" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
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

              {/* Modal Footer - Fixed */}
              <div className="flex items-center justify-end p-4 sm:p-6 lg:p-8 border-t border-[#D4AF37] flex-shrink-0">
                <div className="text-sm text-[#8B7A1A]">
                  Analytics data updated in real-time
                </div>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[calc(100vh-2rem)] sm:max-h-[90vh] flex flex-col">
            {/* Modal Header - Fixed */}
            <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8 border-b border-[#D4AF37] flex-shrink-0">
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
                className="p-2 sm:p-3 hover:bg-[#F5F2E8] rounded-lg sm:rounded-xl transition-colors duration-200 cursor-pointer"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#8B7A1A]" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <form onSubmit={handleSubmitTask} className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
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

              {/* Modal Footer - Fixed */}
              <div className="flex items-center justify-end space-x-4 p-4 sm:p-6 lg:p-8 border-t border-[#D4AF37] flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-6 py-3 text-[#8B7A1A] bg-[#F5F2E8] hover:bg-[#E6DCC0] rounded-xl transition-colors duration-200 font-medium cursor-pointer"
                  disabled={isSubmittingTask}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-xl hover:scale-105 transition-all duration-200 shadow-lg font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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

      {/* Edit Task Modal */}
      {showEditTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[calc(100vh-2rem)] sm:max-h-[90vh] flex flex-col">
            {/* Modal Header - Fixed */}
            <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8 border-b border-[#D4AF37] flex-shrink-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <Edit className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#5E4E06]">
                    Edit Task: {selectedTask.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#8B7A1A]">
                    Update the details of this task
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowEditTaskModal(false)}
                className="p-2 sm:p-3 hover:bg-[#F5F2E8] rounded-lg sm:rounded-xl transition-colors duration-200 cursor-pointer"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#8B7A1A]" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <form onSubmit={handleUpdateTask} className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
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

              {/* Modal Footer - Fixed */}
              <div className="flex items-center justify-end space-x-4 p-4 sm:p-6 lg:p-8 border-t border-[#D4AF37] flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowEditTaskModal(false)}
                  className="px-6 py-3 text-[#8B7A1A] bg-[#F5F2E8] hover:bg-[#E6DCC0] rounded-xl transition-colors duration-200 font-medium cursor-pointer"
                  disabled={isUpdatingTask}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-xl hover:scale-105 transition-all duration-200 shadow-lg font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  disabled={isUpdatingTask}
                >
                  {isUpdatingTask ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4" />
                      <span>Update Task</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl w-full max-w-md max-h-[calc(100vh-2rem)] sm:max-h-[90vh] flex flex-col">
            {/* Modal Header - Fixed */}
            <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8 border-b border-[#D4AF37] flex-shrink-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500 rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#5E4E06]">
                    Delete Task: {selectedTask.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#8B7A1A]">
                    Are you sure you want to delete this task? This action cannot be undone.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowDeleteConfirmModal(false)}
                className="p-2 sm:p-3 hover:bg-[#F5F2E8] rounded-lg sm:rounded-xl transition-colors duration-200 cursor-pointer"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#8B7A1A]" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 text-center">
              <p className="text-lg text-[#5E4E06]">This action will permanently delete the task.</p>
              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirmModal(false)}
                  className="px-8 py-3 text-[#8B7A1A] bg-[#F5F2E8] hover:bg-[#E6DCC0] rounded-xl transition-colors duration-200 font-medium cursor-pointer"
                  disabled={isDeletingTask}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteTask}
                  className="px-8 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-200 font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isDeletingTask}
                >
                  {isDeletingTask ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  {isDeletingTask ? 'Deleting...' : 'Delete Task'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
