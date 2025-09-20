'use client';

import React from 'react';
import { Activity, TrendingUp, BarChart3, Clock, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Task } from '@/lib/firebase';

interface TaskAnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  stats: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
    completedThisWeek: number;
    completedThisMonth: number;
  };
}

export default function TaskAnalytics({
  isOpen,
  onClose,
  tasks,
  stats
}: TaskAnalyticsProps) {
  if (!isOpen) return null;

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const overdueRate = stats.total > 0 ? Math.round((stats.overdue / stats.total) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[calc(100vh-2rem)] sm:max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8 border-b border-[#D4AF37] flex-shrink-0">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#D4AF37] rounded-xl sm:rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#5E4E06]">
                Task Analytics
              </h3>
              <p className="text-xs sm:text-sm text-[#8B7A1A]">
                Overview of task performance and trends
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 sm:p-3 hover:bg-[#F5F2E8] rounded-lg sm:rounded-xl transition-colors duration-200 cursor-pointer"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#8B7A1A]" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Tasks</p>
                    <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
                  </div>
                  <Activity className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Completed</p>
                    <p className="text-2xl font-bold text-green-800">{stats.completed}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-600">In Progress</p>
                    <p className="text-2xl font-bold text-yellow-800">{stats.inProgress}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">Overdue</p>
                    <p className="text-2xl font-bold text-red-800">{stats.overdue}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-[#5E4E06] mb-4">Completion Rate</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Overall Completion</span>
                    <span className="text-lg font-bold text-[#5E4E06]">{completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#D4AF37] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${completionRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-[#5E4E06] mb-4">Overdue Rate</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Overdue Tasks</span>
                    <span className="text-lg font-bold text-red-600">{overdueRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${overdueRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-[#5E4E06] mb-4">Recent Activity</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Completed This Week</span>
                  <span className="text-sm font-medium text-green-600">{stats.completedThisWeek}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Completed This Month</span>
                  <span className="text-sm font-medium text-green-600">{stats.completedThisMonth}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Pending Tasks</span>
                  <span className="text-sm font-medium text-yellow-600">{stats.pending}</span>
                </div>
              </div>
            </div>

            {/* Task Distribution */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-[#5E4E06] mb-4">Task Distribution</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Completed</span>
                    <span className="text-sm font-medium text-green-600">{stats.completed}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-green-500 h-1 rounded-full"
                      style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">In Progress</span>
                    <span className="text-sm font-medium text-yellow-600">{stats.inProgress}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-yellow-500 h-1 rounded-full"
                      style={{ width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pending</span>
                    <span className="text-sm font-medium text-blue-600">{stats.pending}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-blue-500 h-1 rounded-full"
                      style={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Overdue</span>
                    <span className="text-sm font-medium text-red-600">{stats.overdue}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-red-500 h-1 rounded-full"
                      style={{ width: `${stats.total > 0 ? (stats.overdue / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
