import { useMemo, useCallback, useRef } from 'react';
import { Task } from '@/lib/firebase';

/**
 * Custom hook for Kanban performance optimizations
 * Implements memoization, debouncing, and efficient state management
 */
export function useKanbanOptimization(tasks: Task[]) {
  const updateTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastUpdateRef = useRef<number>(0);
  
  // Memoize tasks by status to prevent unnecessary re-renders
  const tasksByStatus = useMemo(() => {
    const statusGroups = {
      pending: [] as Task[],
      in_progress: [] as Task[],
      completed: [] as Task[]
    };
    
    tasks.forEach(task => {
      if (task.status in statusGroups) {
        statusGroups[task.status as keyof typeof statusGroups].push(task);
      }
    });
    
    return statusGroups;
  }, [tasks]);
  
  // Debounced status update to prevent rapid API calls
  const debouncedStatusUpdate = useCallback((
    taskId: string, 
    newStatus: Task['status'], 
    onUpdate: (taskId: string, status: Task['status']) => void
  ) => {
    const now = Date.now();
    
    // Clear previous timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    // Only allow updates every 100ms to prevent spam
    if (now - lastUpdateRef.current < 100) {
      updateTimeoutRef.current = setTimeout(() => {
        onUpdate(taskId, newStatus);
        lastUpdateRef.current = Date.now();
      }, 100);
    } else {
      onUpdate(taskId, newStatus);
      lastUpdateRef.current = now;
    }
  }, []);
  
  // Memoized column data to prevent unnecessary re-renders
  const columnData = useMemo(() => [
    { id: 'pending', title: 'Pending', color: 'text-yellow-600', tasks: tasksByStatus.pending },
    { id: 'in_progress', title: 'In Progress', color: 'text-blue-600', tasks: tasksByStatus.in_progress },
    { id: 'completed', title: 'Completed', color: 'text-green-600', tasks: tasksByStatus.completed }
  ], [tasksByStatus]);
  
  // Cleanup timeout on unmount
  const cleanup = useCallback(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
  }, []);
  
  return {
    tasksByStatus,
    columnData,
    debouncedStatusUpdate,
    cleanup
  };
}
