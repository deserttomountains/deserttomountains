'use client';

import React, { useEffect } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { Task } from '@/lib/firebase';
import { safeFormatDate } from '../utils/dateUtils';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  task: Task | null;
  isDeleting: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  task,
  isDeleting
}: DeleteConfirmModalProps) {
  if (!isOpen || !task) return null;

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
      aria-labelledby="delete-modal-title"
      aria-describedby="delete-modal-description"
    >
      <div 
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-out my-2 sm:my-0"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center" aria-hidden="true">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h2 id="delete-modal-title" className="text-xl font-semibold text-gray-900">Delete Task</h2>
              <p id="delete-modal-description" className="text-sm text-gray-500">This action cannot be undone</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            disabled={isDeleting}
            aria-label="Close modal"
            type="button"
          >
            <X className="w-5 h-5 text-gray-400" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <div className="mb-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-gray-900 mb-1">{task.title}</h3>
              {task.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <span className="px-2 py-1 bg-gray-200 rounded-full">
                  {task.status.replace('_', ' ')}
                </span>
                <span className="px-2 py-1 bg-gray-200 rounded-full">
                  {task.priority}
                </span>
                {task.category && (
                  <span className="px-2 py-1 bg-gray-200 rounded-full">
                    {task.category.replace('_', ' ')}
                  </span>
                )}
              </div>
            </div>
            <p className="text-gray-600 text-center">
              Are you sure you want to delete this task? All associated data will be permanently removed.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium cursor-pointer"
              disabled={isDeleting}
              aria-label="Cancel and close modal"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={isDeleting}
              aria-label="Delete this task permanently"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
                  <span aria-live="polite">Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                  Delete Task
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
