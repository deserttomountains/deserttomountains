'use client';

import React from 'react';
import { 
  Calendar, 
  Clock, 
  Tag, 
  User, 
  CheckCircle, 
  AlertCircle, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Target, 
  Flag, 
  Truck, 
  UserCheck, 
  Phone, 
  FileText 
} from 'lucide-react';
import { Task } from '@/lib/firebase';
import { safeFormatDate, isTaskOverdue } from '../utils/dateUtils';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
  onShowActions: (taskId: string) => void;
  showActions: boolean;
  isOverdue: (task: Task) => boolean;
  getPriorityColor: (priority: Task['priority']) => string;
  getStatusColor: (status: Task['status']) => string;
  getCategoryColor: (category: Task['category']) => string;
  getCategoryIcon: (category: Task['category']) => React.ReactNode;
  formatEstimatedTime: (time: string) => string;
}

export default function TaskCard({
  task,
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
  formatEstimatedTime
}: TaskCardProps) {
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!task.id) return;
    onStatusChange(task.id, e.target.value as Task['status']);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-gray-600 text-xs sm:text-sm mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
        
        {/* Actions Dropdown */}
        <div className="relative ml-2" data-task-actions>
          <button
            onClick={() => {
              if (task.id) {
                onShowActions(task.id);
              }
            }}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>
          
          {showActions && (
            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
              <button
                onClick={() => onEdit(task)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => onDelete(task)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status and Priority */}
      <div className="flex items-center gap-2 mb-3">
        <select
          value={task.status}
          onChange={handleStatusChange}
          className={`text-xs px-2 py-1 rounded-full border-0 font-medium ${getStatusColor(task.status)}`}
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
      </div>

      {/* Category */}
      <div className="flex items-center gap-2 mb-3">
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${getCategoryColor(task.category)}`}>
          {getCategoryIcon(task.category)}
          <span>{task.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
        </div>
      </div>

      {/* Task Details */}
      <div className="space-y-2 text-xs text-gray-600">
        {task.dueDate && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>
              {safeFormatDate(task.dueDate)}
              {isOverdue(task) && (
                <span className="text-red-500 ml-1">(Overdue)</span>
              )}
            </span>
          </div>
        )}
        
        {task.estimatedTime && (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatEstimatedTime(String(task.estimatedTime))}</span>
          </div>
        )}
        
        {task.tags && (
          <div className="flex items-center gap-1">
            <Tag className="w-3 h-3" />
            <span>{task.tags}</span>
          </div>
        )}
        
        {task.relatedTo?.name && (
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>{task.relatedTo.name}</span>
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      {task.status === 'in_progress' && (
        <div className="mt-3">
          <div className="flex items-center gap-2 text-xs text-blue-600">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span>In Progress</span>
          </div>
        </div>
      )}
      
      {task.status === 'completed' && (
        <div className="mt-3">
          <div className="flex items-center gap-2 text-xs text-green-600">
            <CheckCircle className="w-3 h-3" />
            <span>Completed</span>
          </div>
        </div>
      )}
    </div>
  );
}
