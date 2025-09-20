'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Task } from '@/lib/firebase';
import OptimizedTaskCard from './OptimizedTaskCard';
import OptimizedKanbanColumn from './OptimizedKanbanColumn';
import OptimizedSortableTask from './OptimizedSortableTask';
import { useKanbanOptimization } from '../hooks/useKanbanOptimization';

interface OptimizedTaskKanbanProps {
  tasks: Task[];
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
 * High-performance Kanban board with advanced optimizations
 */
export default function OptimizedTaskKanban({
  tasks,
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
}: OptimizedTaskKanbanProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Use optimization hook
  const { columnData, debouncedStatusUpdate, cleanup } = useKanbanOptimization(tasks);
  
  // Optimized sensors with reduced sensitivity for better performance
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Memoized drag handlers to prevent unnecessary re-renders
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const activeTask = tasks.find(task => task.id === active.id);
      const validStatuses: Task['status'][] = ['pending', 'in_progress', 'completed'];
      
      // Validate that over.id is a valid status
      if (activeTask && validStatuses.includes(over.id as Task['status']) && over.id !== activeTask.status) {
        // Use debounced update for better performance
        debouncedStatusUpdate(active.id as string, over.id as Task['status'], onStatusChange);
      }
    }
    
    setActiveId(null);
    setIsDragging(false);
  }, [tasks, debouncedStatusUpdate, onStatusChange]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Minimal drag over handling for performance
  }, []);

  // Memoized active task for drag overlay
  const activeTask = useMemo(() => 
    activeId ? tasks.find(task => task.id === activeId) : null,
    [activeId, tasks]
  );

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columnData.map((column) => (
          <OptimizedKanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            tasks={column.tasks}
            color={column.color}
            onStatusChange={onStatusChange}
            onEdit={onEdit}
            onDelete={onDelete}
            onShowActions={onShowActions}
            showActions={showActions}
            isOverdue={isOverdue}
            getPriorityColor={getPriorityColor}
            getStatusColor={getStatusColor}
            getCategoryColor={getCategoryColor}
            getCategoryIcon={getCategoryIcon}
            formatEstimatedTime={formatEstimatedTime}
            onViewTask={onViewTask}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="opacity-90 scale-105 rotate-2 shadow-2xl border-2 border-[#D4AF37] rounded-lg">
            <OptimizedTaskCard
              task={activeTask}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
              onShowActions={onShowActions}
              showActions={false}
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
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
