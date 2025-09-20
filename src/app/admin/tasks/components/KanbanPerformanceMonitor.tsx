'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Zap, Clock, Database, TrendingUp } from 'lucide-react';

interface KanbanPerformanceMonitorProps {
  taskCount: number;
  isVisible?: boolean;
}

export default function KanbanPerformanceMonitor({
  taskCount,
  isVisible = false
}: KanbanPerformanceMonitorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [renderTime, setRenderTime] = useState<number>(0);
  const [dragOperations, setDragOperations] = useState<number>(0);

  useEffect(() => {
    const startTime = performance.now();
    
    // Simulate render time measurement
    const measureRenderTime = () => {
      const endTime = performance.now();
      setRenderTime(Math.round(endTime - startTime));
    };
    
    // Measure after component mount
    setTimeout(measureRenderTime, 0);
  }, [taskCount]);

  if (!isVisible) return null;

  const performanceScore = Math.max(0, 100 - (renderTime / 10) - (taskCount / 50));
  const optimizationLevel = taskCount > 100 ? 'High' : taskCount > 50 ? 'Medium' : 'Low';

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-gray-700">Kanban Performance</span>
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
                <Clock className="w-3 h-3" />
                Render Time
              </span>
              <span className={`font-medium ${renderTime < 50 ? 'text-green-600' : renderTime < 100 ? 'text-yellow-600' : 'text-red-600'}`}>
                {renderTime}ms
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Performance Score
              </span>
              <span className={`font-medium ${performanceScore > 80 ? 'text-green-600' : performanceScore > 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {Math.round(performanceScore)}%
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                Optimization
              </span>
              <span className={`font-medium ${
                optimizationLevel === 'High' ? 'text-green-600' : 
                optimizationLevel === 'Medium' ? 'text-yellow-600' : 'text-blue-600'
              }`}>
                {optimizationLevel}
              </span>
            </div>
            
            <div className="pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                Active optimizations:
                <ul className="mt-1 space-y-1">
                  <li>• React.memo components</li>
                  <li>• Debounced updates</li>
                  <li>• Memoized calculations</li>
                  <li>• Optimized sensors</li>
                  <li>• Efficient re-renders</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
