import { useMemo } from 'react';
import { Task } from '@/lib/firebase';

interface UseTaskFiltersProps {
  tasks: Task[];
  searchQuery: string;
  selectedStatusFilter: Task['status'] | 'all';
  selectedPriorityFilter: Task['priority'] | 'all';
  selectedCategoryFilter: Task['category'] | 'all';
  selectedDateFilter: 'all' | 'today' | 'tomorrow' | 'this_week' | 'next_week' | 'overdue';
  sortBy: 'dueDate' | 'priority' | 'createdAt' | 'title' | 'category';
  sortOrder: 'asc' | 'desc';
}

/**
 * Custom hook for filtering and sorting tasks
 * Memoizes the expensive filtering and sorting operations
 */
export function useTaskFilters({
  tasks,
  searchQuery,
  selectedStatusFilter,
  selectedPriorityFilter,
  selectedCategoryFilter,
  selectedDateFilter,
  sortBy,
  sortOrder
}: UseTaskFiltersProps) {
  return useMemo(() => {
    let filtered = tasks.filter(task => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          (Array.isArray(task.tags) ? task.tags.join(' ').toLowerCase().includes(query) : (task.tags as string)?.toLowerCase().includes(query)) ||
          task.relatedTo?.name?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (selectedStatusFilter !== 'all' && task.status !== selectedStatusFilter) {
        return false;
      }

      // Priority filter
      if (selectedPriorityFilter !== 'all' && task.priority !== selectedPriorityFilter) {
        return false;
      }

      // Category filter
      if (selectedCategoryFilter !== 'all' && task.category !== selectedCategoryFilter) {
        return false;
      }

      // Date filter
      if (selectedDateFilter !== 'all') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(today.getDate() - today.getDay());
        const thisWeekEnd = new Date(thisWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
        const nextWeekStart = new Date(thisWeekEnd.getTime() + 24 * 60 * 60 * 1000);
        const nextWeekEnd = new Date(nextWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000);

        if (!task.dueDate) return false;
        
        try {
          const dueDate = new Date(task.dueDate);
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
      }

      return true;
    });

    // Sort tasks
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'dueDate':
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
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
}
