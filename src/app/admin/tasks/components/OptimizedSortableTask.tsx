'use client';

import React, { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/lib/firebase';
import OptimizedTaskCard from './OptimizedTaskCard';

interface OptimizedSortableTaskProps {
  task: Task;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onShowActions: (taskId: string) => void;
  showActions: string | null;
  isOverdue: (task: Task) => boolean;
  getPriorityColor: (priority: Task['priority']) => string;
  getStatusColor: (status: Task['status']) => string;
  getCategoryColor: (category: Task['category']) => string;
  getCategoryIcon: (category: Task['category']) => React.ReactNode;
  formatEstimatedTime: (time: string) => string;
  onViewTask?: (task: Task) => void;
}

/**
 * Optimized Sortable Task with memoization
 */
const OptimizedSortableTask = memo(function OptimizedSortableTask({
  task,
  onStatusChange,
  onEdit,
  onDelete,
  onShowActions,
  showActions,
  isOverdue,
  getPriorityColor,
  getStatusColor,
  getCategoryColor,
  getCategoryIcon,
  formatEstimatedTime,
  onViewTask
}: OptimizedSortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${isDragging ? 'opacity-50 scale-105 z-50' : 'hover:scale-102'} cursor-grab active:cursor-grabbing transition-all duration-200`}
    >
      <OptimizedTaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
        onShowActions={onShowActions}
        showActions={showActions === task.id}
        isOverdue={isOverdue}
        getPriorityColor={getPriorityColor}
        getStatusColor={getStatusColor}
        getCategoryColor={getCategoryColor}
        getCategoryIcon={getCategoryIcon}
        formatEstimatedTime={formatEstimatedTime}
        showActionsDropdown={false}
        compact={true}
        onViewTask={onViewTask}
      />
    </div>
  );
});

export default OptimizedSortableTask;
