'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Tag, User, Target, Flag, Truck, UserCheck, Phone, FileText, Repeat } from 'lucide-react';
import { Task } from '@/lib/firebase';
import { safeToISOString } from '../utils/dateUtils';

interface TaskForm {
  title: string;
  description: string;
  status: Task['status'];
  priority: Task['priority'];
  category: Task['category'];
  dueDate: string;
  estimatedTime: string;
  tags: string;
  notes: string;
  relatedToType: 'lead' | 'order' | 'customer' | '';
  relatedToId: string;
  relatedToName: string;
  isRecurring: boolean;
  recurringType: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurringInterval: number;
  recurringEndDate: string;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: TaskForm) => Promise<void>;
  task?: Task | null;
  isSubmitting: boolean;
  title: string;
}

const initialFormState: TaskForm = {
  title: '',
  description: '',
  status: 'pending',
  priority: 'medium',
  category: 'follow_up',
  dueDate: '',
  estimatedTime: '',
  tags: '',
  notes: '',
  relatedToType: '',
  relatedToId: '',
  relatedToName: '',
  isRecurring: false,
  recurringType: 'weekly',
  recurringInterval: 1,
  recurringEndDate: ''
};

export default function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  task,
  isSubmitting,
  title
}: TaskModalProps) {
  const [form, setForm] = useState<TaskForm>(initialFormState);

  useEffect(() => {
    if (isOpen) {
    if (task) {
      // Set the task data directly
        setForm({
          title: task.title || '',
          description: task.description || '',
          status: task.status || 'pending',
          priority: task.priority || 'medium',
          category: task.category || 'follow_up',
          dueDate: safeToISOString(task.dueDate),
          estimatedTime: task.estimatedTime ? String(task.estimatedTime) : '',
          tags: task.tags.join(', '),
          notes: task.notes || '',
          relatedToType: task.relatedTo?.type || '',
          relatedToId: task.relatedTo?.id || '',
          relatedToName: task.relatedTo?.name || '',
          isRecurring: !!task.recurring,
          recurringType: task.recurring?.type || 'weekly',
          recurringInterval: task.recurring?.interval || 1,
          recurringEndDate: task.recurring?.endDate ? safeToISOString(task.recurring.endDate) : ''
        });
      } else {
        setForm(initialFormState);
      }
    } else {
      // Reset form when modal closes
      setForm(initialFormState);
    }
  }, [task, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
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
      // Focus the first input when modal opens
      const firstInput = document.getElementById('task-title');
      if (firstInput) {
        firstInput.focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const getCategoryIcon = (category: Task['category']) => {
    switch (category) {
      case 'follow_up': return <Phone className="w-4 h-4" />;
      case 'meeting': return <Calendar className="w-4 h-4" />;
      case 'delivery': return <Truck className="w-4 h-4" />;
      case 'marketing': return <Target className="w-4 h-4" />;
      case 'support': return <UserCheck className="w-4 h-4" />;
      case 'other': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div 
        className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl w-full max-w-2xl min-h-[calc(100vh-1rem)] sm:min-h-0 sm:max-h-[90vh] flex flex-col my-2 sm:my-0"
        tabIndex={-1}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8 border-b border-[#D4AF37] flex-shrink-0">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#D4AF37] rounded-xl sm:rounded-2xl flex items-center justify-center" aria-hidden="true">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h3 id="modal-title" className="text-lg sm:text-xl lg:text-2xl font-bold text-[#5E4E06]">
                {title}
              </h3>
              <p id="modal-description" className="text-xs sm:text-sm text-[#8B7A1A]">
                {task ? 'Update task details' : 'Create a new task'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 sm:p-3 hover:bg-[#F5F2E8] rounded-lg sm:rounded-xl transition-colors duration-200 cursor-pointer"
            aria-label="Close modal"
            type="button"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#8B7A1A]" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <form key={task?.id || 'new-task'} onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Basic Information */}
            <fieldset className="space-y-4">
              <legend className="text-lg font-semibold text-[#5E4E06] border-b border-[#D4AF37] pb-2 w-full">
                Basic Information
              </legend>
              
              <div>
                <label htmlFor="task-title" className="block text-sm font-medium text-[#5E4E06] mb-2">
                  Task Title *
                </label>
                <input
                  id="task-title"
                  type="text"
                  name="title"
                  value={form.title || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors text-base"
                  placeholder="Enter task title"
                  aria-describedby="task-title-help"
                  aria-required="true"
                />
                <div id="task-title-help" className="sr-only">
                  Enter a descriptive title for your task
                </div>
              </div>

              <div>
                <label htmlFor="task-description" className="block text-sm font-medium text-[#5E4E06] mb-2">
                  Description
                </label>
                <textarea
                  id="task-description"
                  name="description"
                  value={form.description || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors text-base resize-none"
                  placeholder="Enter task description"
                  aria-describedby="task-description-help"
                />
                <div id="task-description-help" className="sr-only">
                  Provide additional details about the task
                </div>
              </div>
            </fieldset>

            {/* Status and Priority */}
            <fieldset className="space-y-4">
              <legend className="text-lg font-semibold text-[#5E4E06] border-b border-[#D4AF37] pb-2 w-full">
                Status & Priority
              </legend>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="task-status" className="block text-sm font-medium text-[#5E4E06] mb-2">
                    Status
                  </label>
                  <select
                    id="task-status"
                    name="status"
                    value={form.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors text-base"
                    aria-describedby="task-status-help"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <div id="task-status-help" className="sr-only">
                    Select the current status of the task
                  </div>
                </div>

                <div>
                  <label htmlFor="task-priority" className="block text-sm font-medium text-[#5E4E06] mb-2">
                    Priority
                  </label>
                  <select
                    id="task-priority"
                    name="priority"
                    value={form.priority}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors text-base"
                    aria-describedby="task-priority-help"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  <div id="task-priority-help" className="sr-only">
                    Select the priority level of the task
                  </div>
                </div>
              </div>
            </fieldset>

            {/* Category and Timing */}
            <fieldset className="space-y-4">
              <legend className="text-lg font-semibold text-[#5E4E06] border-b border-[#D4AF37] pb-2 w-full">
                Category & Timing
              </legend>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="task-category" className="block text-sm font-medium text-[#5E4E06] mb-2">
                    Category
                  </label>
                  <select
                    id="task-category"
                    name="category"
                    value={form.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors text-base"
                    aria-describedby="task-category-help"
                  >
                    <option value="follow_up">Follow Up</option>
                    <option value="meeting">Meeting</option>
                    <option value="delivery">Delivery</option>
                    <option value="marketing">Marketing</option>
                    <option value="support">Support</option>
                    <option value="other">Other</option>
                  </select>
                  <div id="task-category-help" className="sr-only">
                    Select the category that best describes this task
                  </div>
                </div>

                <div>
                  <label htmlFor="task-due-date" className="block text-sm font-medium text-[#5E4E06] mb-2">
                    Due Date
                  </label>
                  <input
                    id="task-due-date"
                    type="date"
                    name="dueDate"
                    value={form.dueDate || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors text-base"
                    aria-describedby="task-due-date-help"
                  />
                  <div id="task-due-date-help" className="sr-only">
                    Select the date when this task should be completed
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="task-estimated-time" className="block text-sm font-medium text-[#5E4E06] mb-2">
                    Estimated Time (minutes)
                  </label>
                  <input
                    id="task-estimated-time"
                    type="number"
                    name="estimatedTime"
                    value={form.estimatedTime || ''}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors text-base"
                    placeholder="e.g., 30"
                    aria-describedby="task-estimated-time-help"
                  />
                  <div id="task-estimated-time-help" className="sr-only">
                    Enter the estimated time in minutes to complete this task
                  </div>
                </div>

                <div>
                  <label htmlFor="task-tags" className="block text-sm font-medium text-[#5E4E06] mb-2">
                    Tags
                  </label>
                  <input
                    id="task-tags"
                    type="text"
                    name="tags"
                    value={form.tags || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors text-base"
                    placeholder="e.g., urgent, client-meeting"
                    aria-describedby="task-tags-help"
                  />
                  <div id="task-tags-help" className="sr-only">
                    Add tags separated by commas to help categorize and find this task
                  </div>
                </div>
              </div>
            </fieldset>

            {/* Recurring Task */}
            <fieldset className="space-y-4">
              <legend className="text-lg font-semibold text-[#5E4E06] border-b border-[#D4AF37] pb-2 w-full">
                Recurring Task
              </legend>
              
              <div className="flex items-center gap-2">
                <input
                  id="task-recurring"
                  type="checkbox"
                  name="isRecurring"
                  checked={form.isRecurring}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-[#D4AF37] border-gray-300 rounded focus:ring-[#D4AF37]"
                  aria-describedby="task-recurring-help"
                />
                <label htmlFor="task-recurring" className="text-sm font-medium text-[#5E4E06]">
                  Make this a recurring task
                </label>
                <div id="task-recurring-help" className="sr-only">
                  Check this box to create a recurring task that repeats automatically
                </div>
              </div>

              {form.isRecurring && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="task-recurring-type" className="block text-sm font-medium text-[#5E4E06] mb-2">
                      Recurring Type
                    </label>
                    <select
                      id="task-recurring-type"
                      name="recurringType"
                      value={form.recurringType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors text-base"
                      aria-describedby="task-recurring-type-help"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                    <div id="task-recurring-type-help" className="sr-only">
                      Select how often this task should repeat
                    </div>
                  </div>

                  <div>
                    <label htmlFor="task-recurring-interval" className="block text-sm font-medium text-[#5E4E06] mb-2">
                      Interval
                    </label>
                    <input
                      id="task-recurring-interval"
                      type="number"
                      name="recurringInterval"
                      value={form.recurringInterval}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors text-base"
                      aria-describedby="task-recurring-interval-help"
                    />
                    <div id="task-recurring-interval-help" className="sr-only">
                      Enter the interval for repetition (e.g., every 2 weeks)
                    </div>
                  </div>

                  <div>
                    <label htmlFor="task-recurring-end-date" className="block text-sm font-medium text-[#5E4E06] mb-2">
                      End Date (Optional)
                    </label>
                    <input
                      id="task-recurring-end-date"
                      type="date"
                      name="recurringEndDate"
                      value={form.recurringEndDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors text-base"
                      aria-describedby="task-recurring-end-date-help"
                    />
                    <div id="task-recurring-end-date-help" className="sr-only">
                      Optionally set a date when the recurring task should stop
                    </div>
                  </div>
                </div>
              )}
            </fieldset>

            {/* Additional Information */}
            <fieldset className="space-y-4">
              <legend className="text-lg font-semibold text-[#5E4E06] border-b border-[#D4AF37] pb-2 w-full">
                Additional Information
              </legend>
              
              <div>
                <label htmlFor="task-notes" className="block text-sm font-medium text-[#5E4E06] mb-2">
                  Notes
                </label>
                <textarea
                  id="task-notes"
                  name="notes"
                  value={form.notes || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors text-base resize-none"
                  placeholder="Additional notes or comments"
                  aria-describedby="task-notes-help"
                />
                <div id="task-notes-help" className="sr-only">
                  Add any additional notes or comments about this task
                </div>
              </div>
            </fieldset>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 border-t border-[#D4AF37]">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 text-[#8B7A1A] bg-[#F5F2E8] hover:bg-[#E6DCC0] rounded-xl transition-colors duration-200 font-medium cursor-pointer"
                disabled={isSubmitting}
                aria-label="Cancel and close modal"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-[#D4AF37] text-white rounded-xl hover:bg-[#B8941F] transition-colors duration-200 font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
                aria-label={task ? 'Update task' : 'Create new task'}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
                    <span aria-live="polite">
                      {task ? 'Updating...' : 'Creating...'}
                    </span>
                  </div>
                ) : (
                  task ? 'Update Task' : 'Create Task'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
