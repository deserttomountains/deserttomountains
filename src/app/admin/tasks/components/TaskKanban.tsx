'use client';

import React, { useState } from 'react';
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
import { Task } from '@/lib/firebase';
import TaskCard from './TaskCard';

interface TaskKanbanProps {
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
}

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
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
}

interface SortableTaskProps {
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
}

function SortableTask({
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
  formatEstimatedTime
}: SortableTaskProps) {
  // Ensure task.id exists (should be guaranteed by parent filter, but TypeScript needs this)
  if (!task.id) {
    return null;
  }

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
      <TaskCard
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
      />
    </div>
  );
}

function KanbanColumn({
  id,
  title,
  tasks,
  color,
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
  formatEstimatedTime
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div className={`bg-[#F5F2E8] rounded-xl p-4 min-h-[600px] transition-all duration-300 ease-out border-2 ${
      isOver 
        ? 'bg-[#E6DCC0] scale-[1.02] border-[#D4AF37] border-dashed shadow-lg' 
        : 'border-transparent'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold text-lg ${color} transition-colors duration-200 ${
          isOver ? 'text-[#D4AF37]' : ''
        }`}>{title}</h3>
        <span className={`bg-white text-gray-600 px-2 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
          isOver ? 'bg-[#D4AF37] text-white scale-110' : ''
        }`}>
          {tasks.length}
        </span>
      </div>
      
      <div ref={setNodeRef} className="space-y-3 min-h-[400px]">
        {isOver && (
          <div className="border-2 border-dashed border-[#D4AF37] rounded-lg p-4 text-center text-[#D4AF37] font-medium animate-pulse">
            Drop task here to move to {title}
          </div>
        )}
        <SortableContext 
          items={tasks.map(task => task.id).filter((id): id is string => id !== undefined)} 
          strategy={verticalListSortingStrategy}
        >
          {tasks
            .filter((task): task is Task & { id: string } => task.id !== undefined)
            .map((task) => (
              <SortableTask
                key={task.id}
                task={task}
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
              />
            ))}
        </SortableContext>
      </div>
    </div>
  );
}

export default function TaskKanban({
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
  formatEstimatedTime
}: TaskKanbanProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columns = [
    { id: 'pending', title: 'Pending', color: 'text-yellow-600' },
    { id: 'in_progress', title: 'In Progress', color: 'text-blue-600' },
    { id: 'completed', title: 'Completed', color: 'text-green-600' },
  ];

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setIsDragging(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const activeTask = tasks.find(task => task.id === active.id);
      if (activeTask && over.id !== activeTask.status) {
        // Optimistic update - immediately update the UI
        onStatusChange(active.id as string, over.id as Task['status']);
      }
    }
    
    setActiveId(null);
    setIsDragging(false);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Handle drag over logic if needed
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            tasks={getTasksByStatus(column.id as Task['status'])}
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
          />
        ))}
      </div>

      <DragOverlay>
        {activeId ? (
          <div className="opacity-90 scale-105 rotate-2 shadow-2xl border-2 border-[#D4AF37] rounded-xl">
            <TaskCard
              task={tasks.find(task => task.id === activeId)!}
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
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
