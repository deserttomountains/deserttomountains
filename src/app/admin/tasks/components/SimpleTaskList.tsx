'use client';

import React from 'react';
import { Task } from '@/lib/firebase';
import OptimizedTaskCard from './OptimizedTaskCard';

interface SimpleTaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
  onShowActions: (taskId: string) => void;
  showActions: string | null;
  isOverdue: (task: Task) => boolean;
  getPriorityColor: (priority: Task['priority']) => string;
  getStatusColor: (status: Task['status']) => string;
  getCategoryColor: (category: Task['category']) => string;
  getCategoryIcon: (category: Task['category']) => React.ReactNode;
  formatEstimatedTime: (time: string) => string;
  onViewTask?: (task: Task) => void;
  height?: number;
}

export default function SimpleTaskList({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
  onShowActions,
  showActions,
  isOverdue,
  getPriorityColor,
  getStatusColor,
  getCategoryColor,
  getCategoryIcon,
  formatEstimatedTime,
  onViewTask,
  height = 600
}: SimpleTaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-gray-200">
        <div className="text-center">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg">No tasks found</p>
          <p className="text-gray-400 text-sm">Try adjusting your filters or create a new task</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 overflow-y-auto"
        style={{ maxHeight: height }}
      >
        {tasks.map((task) => (
          <OptimizedTaskCard
            key={task.id}
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
            showActionsDropdown={true}
            compact={true}
            onViewTask={onViewTask}
          />
        ))}
      </div>
    </div>
  );
}
