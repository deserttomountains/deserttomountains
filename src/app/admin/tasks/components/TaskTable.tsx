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
  FileText,
  Eye
} from 'lucide-react';
import { Task } from '@/lib/firebase';
import { safeFormatDate } from '../utils/dateUtils';

interface TaskTableProps {
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
}

export default function TaskTable({
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
  onViewTask
}: TaskTableProps) {
  const handleStatusChange = (taskId: string, e: React.ChangeEvent<HTMLSelectElement>) => {
    onStatusChange(taskId, e.target.value as Task['status']);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-[600px] flex flex-col">
      <div className="overflow-auto flex-1">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Task
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                {/* Task Details */}
                <td className="px-4 py-4">
                  <div className="font-medium text-gray-900 text-sm">
                    {task.title}
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-4">
                  <select
                    value={task.status}
                    onChange={(e) => {
                      if (task.id) {
                        handleStatusChange(task.id, e);
                      }
                    }}
                    className={`text-xs px-2 py-1 rounded-full border-0 font-medium ${getStatusColor(task.status)}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </td>

                {/* Priority */}
                <td className="px-4 py-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                </td>

                {/* Category */}
                <td className="px-4 py-4">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${getCategoryColor(task.category)}`}>
                    {getCategoryIcon(task.category)}
                    <span>{task.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                  </div>
                </td>

                {/* Due Date */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {task.dueDate ? (
                        <>
                          {safeFormatDate(task.dueDate)}
                          {isOverdue(task) && (
                            <span className="text-red-500 ml-1">(Overdue)</span>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-400">No due date</span>
                      )}
                    </span>
                  </div>
                </td>


                {/* Actions */}
                <td className="px-4 py-4">
                  <div className="relative" data-task-actions>
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
                    
                    {showActions === task.id && (
                      <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                        {onViewTask && (
                          <button
                            onClick={() => onViewTask(task)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                        )}
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {tasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <FileText className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-500 text-lg">No tasks found</p>
          <p className="text-gray-400 text-sm">Try adjusting your filters or create a new task</p>
        </div>
      )}
    </div>
  );
}
