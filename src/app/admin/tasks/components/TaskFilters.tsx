'use client';

import React from 'react';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { Task } from '@/lib/firebase';
import { useMobileDetection } from '../hooks/useMobileDetection';

interface TaskFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStatusFilter: Task['status'] | 'all';
  onStatusFilterChange: (status: Task['status'] | 'all') => void;
  selectedPriorityFilter: Task['priority'] | 'all';
  onPriorityFilterChange: (priority: Task['priority'] | 'all') => void;
  selectedCategoryFilter: Task['category'] | 'all';
  onCategoryFilterChange: (category: Task['category'] | 'all') => void;
  selectedDateFilter: 'all' | 'today' | 'tomorrow' | 'this_week' | 'next_week' | 'overdue';
  onDateFilterChange: (date: 'all' | 'today' | 'tomorrow' | 'this_week' | 'next_week' | 'overdue') => void;
  sortBy: 'dueDate' | 'priority' | 'createdAt' | 'title' | 'category';
  onSortByChange: (sortBy: 'dueDate' | 'priority' | 'createdAt' | 'title' | 'category') => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  viewMode: 'cards' | 'table' | 'kanban';
  onViewModeChange: (mode: 'cards' | 'table' | 'kanban') => void;
  onAddTask: () => void;
  onShowAnalytics: () => void;
}

export default function TaskFilters({
  searchQuery,
  onSearchChange,
  selectedStatusFilter,
  onStatusFilterChange,
  selectedPriorityFilter,
  onPriorityFilterChange,
  selectedCategoryFilter,
  onCategoryFilterChange,
  selectedDateFilter,
  onDateFilterChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  viewMode,
  onViewModeChange,
  onAddTask,
  onShowAnalytics
}: TaskFiltersProps) {
  const isMobile = useMobileDetection();
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-[#5E4E06]">Tasks</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onShowAnalytics}
              className="p-2 hover:bg-[#F5F2E8] rounded-lg transition-colors cursor-pointer"
              aria-label="View task analytics"
              type="button"
            >
              <Filter className="w-4 h-4 text-[#8B7A1A]" aria-hidden="true" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#F5F2E8] rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('cards')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                viewMode === 'cards' 
                  ? 'bg-[#D4AF37] text-white' 
                  : 'text-[#8B7A1A] hover:text-[#5E4E06]'
              }`}
              aria-label="Switch to cards view"
              aria-pressed={viewMode === 'cards'}
              type="button"
            >
              Cards
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                viewMode === 'table' 
                  ? 'bg-[#D4AF37] text-white' 
                  : 'text-[#8B7A1A] hover:text-[#5E4E06]'
              }`}
              aria-label="Switch to table view"
              aria-pressed={viewMode === 'table'}
              type="button"
            >
              Table
            </button>
            {!isMobile && (
              <button
                onClick={() => onViewModeChange('kanban')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  viewMode === 'kanban' 
                    ? 'bg-[#D4AF37] text-white' 
                    : 'text-[#8B7A1A] hover:text-[#5E4E06]'
                }`}
                aria-label="Switch to kanban view"
                aria-pressed={viewMode === 'kanban'}
                type="button"
              >
                Kanban
              </button>
            )}
          </div>
          
          <button
            onClick={onAddTask}
            className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8941F] transition-colors font-medium cursor-pointer"
            aria-label="Add new task"
            type="button"
          >
            Add Task
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors"
            aria-label="Search tasks"
          />
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Status Filter */}
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-[#5E4E06] mb-1">
              Status
            </label>
            <select
              id="status-filter"
              value={selectedStatusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value as Task['status'] | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors text-sm"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-[#5E4E06] mb-1">
              Priority
            </label>
            <select
              value={selectedPriorityFilter}
              onChange={(e) => onPriorityFilterChange(e.target.value as Task['priority'] | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors text-sm"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-[#5E4E06] mb-1">
              Category
            </label>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => onCategoryFilterChange(e.target.value as Task['category'] | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors text-sm"
            >
              <option value="all">All Categories</option>
              <option value="follow_up">Follow Up</option>
              <option value="meeting">Meeting</option>
              <option value="delivery">Delivery</option>
              <option value="marketing">Marketing</option>
              <option value="support">Support</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-[#5E4E06] mb-1">
              Date Range
            </label>
            <select
              value={selectedDateFilter}
              onChange={(e) => onDateFilterChange(e.target.value as 'all' | 'today' | 'tomorrow' | 'this_week' | 'next_week' | 'overdue')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors text-sm"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="this_week">This Week</option>
              <option value="next_week">Next Week</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-[#5E4E06] mb-1">
              Sort By
            </label>
            <div className="flex gap-1">
              <select
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value as 'dueDate' | 'priority' | 'createdAt' | 'title' | 'category')}
                className="flex-1 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors text-sm"
              >
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="createdAt">Created</option>
                <option value="title">Title</option>
                <option value="category">Category</option>
              </select>
              <button
                onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-2 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {sortOrder === 'asc' ? (
                  <SortAsc className="w-4 h-4 text-gray-600" />
                ) : (
                  <SortDesc className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
