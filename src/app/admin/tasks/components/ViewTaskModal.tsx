'use client';

import React, { useEffect } from 'react';
import { X, Edit, Trash2, Calendar, Clock, Tag, User, FileText, AlertTriangle } from 'lucide-react';
import { Task } from '@/lib/firebase';
import { safeFormatDate, isTaskOverdue } from '../utils/dateUtils';

interface ViewTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  isOverdue: (task: Task) => boolean;
  getPriorityColor: (priority: Task['priority']) => string;
  getStatusColor: (status: Task['status']) => string;
  getCategoryColor: (category: Task['category']) => string;
  getCategoryIcon: (category: Task['category']) => React.ReactNode;
  formatEstimatedTime: (time: string) => string;
}

export default function ViewTaskModal({
  task,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  isOverdue,
  getPriorityColor,
  getStatusColor,
  getCategoryColor,
  getCategoryIcon,
  formatEstimatedTime
}: ViewTaskModalProps) {
  if (!isOpen || !task) return null;

  const handleEdit = () => {
    onEdit(task);
    onClose();
  };

  const handleDelete = () => {
    onDelete(task);
    onClose();
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      // Close modal on Escape key
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="view-modal-title"
      aria-describedby="view-modal-description"
    >
      <div 
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl min-h-[calc(100vh-1rem)] sm:min-h-0 sm:max-h-[90vh] overflow-hidden my-2 sm:my-0"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center" aria-hidden="true">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 id="view-modal-title" className="text-xl font-semibold text-gray-900">Task Details</h2>
              <p id="view-modal-description" className="text-sm text-gray-500">View and manage task information</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
            type="button"
          >
            <X className="w-5 h-5 text-gray-400" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* Task Title */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h3>
            {task.description && (
              <p className="text-gray-600 leading-relaxed">{task.description}</p>
            )}
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Status</span>
              </div>
              <span className={`text-sm px-3 py-1 rounded-full font-medium ${getStatusColor(task.status)}`}>
                {task.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-gray-700">Priority</span>
              </div>
              <span className={`text-sm px-3 py-1 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            </div>
          </div>

          {/* Category */}
          <div className="mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                {getCategoryIcon(task.category)}
                <span className="text-sm font-medium text-gray-700">Category</span>
              </div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium ${getCategoryColor(task.category)}`}>
                {getCategoryIcon(task.category)}
                <span>{task.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
              </div>
            </div>
          </div>

          {/* Task Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {task.dueDate && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Due Date</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-900">
                    {safeFormatDate(task.dueDate)}
                  </span>
                  {isOverdue(task) && (
                    <span className="text-red-500 text-sm font-medium">(Overdue)</span>
                  )}
                </div>
              </div>
            )}
            
            {task.estimatedTime && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Estimated Time</span>
                </div>
                <span className="text-gray-900">{formatEstimatedTime(String(task.estimatedTime))}</span>
              </div>
            )}
          </div>

          {/* Additional Details */}
          {(task.tags || task.relatedTo?.name) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {task.tags && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Tags</span>
                  </div>
                  <span className="text-gray-900">{task.tags}</span>
                </div>
              )}
              
              {task.relatedTo?.name && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Related To</span>
                  </div>
                  <span className="text-gray-900">{task.relatedTo.name}</span>
                </div>
              )}
            </div>
          )}

          {/* Progress Indicator */}
          {task.status === 'in_progress' && (
            <div className="mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-blue-700 font-medium">Task is currently in progress</span>
                </div>
              </div>
            </div>
          )}
          
          {task.status === 'completed' && (
            <div className="mb-6">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 font-medium">Task has been completed</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50">
          <button
            type="button"
            onClick={handleEdit}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium cursor-pointer flex items-center justify-center gap-2"
            aria-label="Edit this task"
          >
            <Edit className="w-4 h-4" aria-hidden="true" />
            Edit Task
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors font-medium cursor-pointer flex items-center justify-center gap-2"
            aria-label="Delete this task"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
}
