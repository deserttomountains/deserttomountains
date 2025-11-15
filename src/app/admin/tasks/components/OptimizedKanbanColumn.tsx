'use client';

import React, { memo, useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task } from '@/lib/firebase';
import OptimizedSortableTask from './OptimizedSortableTask';

interface OptimizedKanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
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
}

/**
 * Optimized Kanban Column with memoization and efficient rendering
 * Only re-renders when column data actually changes
 */
const OptimizedKanbanColumn = memo(function OptimizedKanbanColumn({
  id,
  title,
  tasks,
  color,
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
  onViewTask
}: OptimizedKanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  
  // Memoize task IDs to prevent unnecessary re-renders
  // Filter out undefined IDs to satisfy SortableContext type requirements
  const taskIds = useMemo(() => 
    tasks.map(task => task.id).filter((id): id is string => id !== undefined), 
    [tasks]
  );
  
  // Memoize column styling to prevent recalculation
  const columnClasses = useMemo(() => 
    `bg-[#F5F2E8] rounded-xl p-4 min-h-[600px] transition-all duration-300 ease-out border-2 ${
      isOver 
        ? 'bg-[#E6DCC0] scale-[1.02] border-[#D4AF37] border-dashed shadow-lg' 
        : 'border-transparent'
    }`, [isOver]
  );
  
  const titleClasses = useMemo(() => 
    `font-semibold text-lg ${color} transition-colors duration-200 ${
      isOver ? 'text-[#D4AF37]' : ''
    }`, [color, isOver]
  );
  
  const countClasses = useMemo(() => 
    `bg-white text-gray-600 px-2 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
      isOver ? 'bg-[#D4AF37] text-white scale-110' : ''
    }`, [isOver]
  );

  return (
    <div className={columnClasses}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={titleClasses}>{title}</h3>
        <span className={countClasses}>
          {tasks.length}
        </span>
      </div>
      
      <div ref={setNodeRef} className="space-y-3 min-h-[400px]">
        {isOver && (
          <div className="border-2 border-dashed border-[#D4AF37] rounded-lg p-4 text-center text-[#D4AF37] font-medium animate-pulse">
            Drop task here to move to {title}
          </div>
        )}
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <OptimizedSortableTask
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
              onViewTask={onViewTask}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
});

export default OptimizedKanbanColumn;
