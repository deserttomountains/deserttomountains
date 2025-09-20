import { useMemo } from 'react';
import { Task } from '@/lib/firebase';

/**
 * Custom hook for calculating task statistics
 * Memoizes expensive calculations to prevent unnecessary re-computations
 */
export function useTaskStats(tasks: Task[]) {
  return useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const overdue = tasks.filter(t => {
      if (t.status === 'completed') return false;
      
      try {
        if (!t.dueDate) return false;
        const dueDate = new Date(t.dueDate);
        return dueDate < new Date();
      } catch {
        return false;
      }
    }).length;

    // Calculate completion stats
    const now = new Date();
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const completedThisWeek = tasks.filter(t => {
      if (t.status !== 'completed' || !t.completedAt) return false;
      
      try {
        const completedDate = new Date(t.completedAt);
        return completedDate >= thisWeek;
      } catch {
        return false;
      }
    }).length;

    const completedThisMonth = tasks.filter(t => {
      if (t.status !== 'completed' || !t.completedAt) return false;
      
      try {
        const completedDate = new Date(t.completedAt);
        return completedDate >= thisMonth;
      } catch {
        return false;
      }
    }).length;

    return {
      total,
      pending,
      inProgress,
      completed,
      overdue,
      completedThisWeek,
      completedThisMonth
    };
  }, [tasks]);
}
