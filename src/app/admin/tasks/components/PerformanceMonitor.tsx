'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Zap, Clock, Database } from 'lucide-react';

interface PerformanceMonitorProps {
  taskCount: number;
  filteredCount: number;
  renderTime?: number;
  isVisible?: boolean;
}

export default function PerformanceMonitor({
  taskCount,
  filteredCount,
  renderTime,
  isVisible = false
}: PerformanceMonitorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">Performance</span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isExpanded ? '−' : '+'}
          </button>
        </div>
        
        {isExpanded && (
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Database className="w-3 h-3" />
                Total Tasks
              </span>
              <span className="font-medium">{taskCount}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Filtered
              </span>
              <span className="font-medium">{filteredCount}</span>
            </div>
            
            {renderTime && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Render Time
                </span>
                <span className="font-medium">{renderTime}ms</span>
              </div>
            )}
            
            <div className="pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                Performance optimizations active:
                <ul className="mt-1 space-y-1">
                  <li>• Debounced search</li>
                  <li>• Memoized filters</li>
                  <li>• Virtual scrolling</li>
                  <li>• Optimized callbacks</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
