/**
 * Template Preview Hook
 * Provides real-time template preview functionality with debouncing
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { WhatsAppTemplate } from '@/lib/messaging/templates';
import { formatVariableValue } from '@/lib/messaging/template-variables';
import { validateTemplateVariables } from '@/lib/messaging/variable-validation';

interface UseTemplatePreviewOptions {
  debounceMs?: number;
  autoValidate?: boolean;
  onValidationChange?: (isValid: boolean, errors: string[], warnings: string[]) => void;
}

interface TemplatePreviewResult {
  previewContent: string;
  interactiveContent: string;
  validationResult: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: any[];
  };
  hasAllVariables: boolean;
  missingVariables: string[];
  unusedVariables: string[];
  variableCount: number;
  characterCount: number;
  wordCount: number;
  estimatedReadTime: number;
}

export function useTemplatePreview(
  template: WhatsAppTemplate,
  variables: Record<string, string>,
  options: UseTemplatePreviewOptions = {}
) {
  const {
    debounceMs = 300,
    autoValidate = true,
    onValidationChange
  } = options;

  const [debouncedVariables, setDebouncedVariables] = useState(variables);

  // Debounce variables to prevent excessive re-renders
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedVariables(variables);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [variables, debounceMs]);

  // Generate preview content
  const generatePreviewContent = useCallback((vars: Record<string, string>) => {
    let content = template.description;
    
    // Find all variables in the template
    const allVariables = content.match(/\{\{([^}]+)\}\}/g) || [];
    const uniqueVariables = [...new Set(allVariables.map(match => match.slice(2, -2).trim()))];
    
    // Replace variables with actual values or placeholders
    uniqueVariables.forEach(varName => {
      const value = vars[varName];
      const placeholder = `{{${varName}}}`;
      
      if (value && value.trim()) {
        const formattedValue = formatVariableValue(varName, value);
        content = content.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), formattedValue);
      } else {
        content = content.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), `[${varName}]`);
      }
    });
    
    return content;
  }, [template.description]);

  // Generate interactive content with clickable variables
  const generateInteractiveContent = useCallback((vars: Record<string, string>) => {
    let content = template.description;
    
    // Find all variables in the template
    const allVariables = content.match(/\{\{([^}]+)\}\}/g) || [];
    const uniqueVariables = [...new Set(allVariables.map(match => match.slice(2, -2).trim()))];
    
    // Replace variables with clickable elements
    uniqueVariables.forEach(varName => {
      const value = vars[varName];
      const placeholder = `{{${varName}}}`;
      
      if (value && value.trim()) {
        const formattedValue = formatVariableValue(varName, value);
        const clickableElement = `<span class="variable-value cursor-pointer hover:bg-blue-100 px-1 rounded border border-blue-200" data-variable="${varName}">${formattedValue}</span>`;
        content = content.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), clickableElement);
      } else {
        const clickableElement = `<span class="variable-placeholder cursor-pointer hover:bg-yellow-100 px-1 rounded bg-yellow-50 text-yellow-700 border border-yellow-200" data-variable="${varName}">[${varName}]</span>`;
        content = content.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), clickableElement);
      }
    });
    
    return content;
  }, [template.description]);

  // Calculate text statistics
  const calculateTextStats = useCallback((content: string) => {
    const characterCount = content.length;
    const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    const estimatedReadTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute
    
    return {
      characterCount,
      wordCount,
      estimatedReadTime
    };
  }, []);

  // Find missing and unused variables
  const analyzeVariables = useCallback((vars: Record<string, string>) => {
    const allVariables = template.description.match(/\{\{([^}]+)\}\}/g) || [];
    const usedVariables = [...new Set(allVariables.map(match => match.slice(2, -2).trim()))];
    
    const missingVariables = usedVariables.filter(varName => !vars[varName] || !vars[varName].trim());
    const unusedVariables = Object.keys(vars).filter(varName => !usedVariables.includes(varName));
    
    return {
      missingVariables,
      unusedVariables,
      variableCount: usedVariables.length
    };
  }, [template.description]);

  // Memoized preview result
  const previewResult = useMemo((): TemplatePreviewResult => {
    const previewContent = generatePreviewContent(debouncedVariables);
    const interactiveContent = generateInteractiveContent(debouncedVariables);
    const textStats = calculateTextStats(previewContent);
    const variableAnalysis = analyzeVariables(debouncedVariables);
    
    // Validation
    const validationResult = autoValidate 
      ? validateTemplateVariables(template.description, debouncedVariables)
      : { isValid: true, errors: [], warnings: [], suggestions: [] };
    
    const hasAllVariables = template.requiredVars.every(varName => 
      debouncedVariables[varName] && debouncedVariables[varName].trim()
    );

    return {
      previewContent,
      interactiveContent,
      validationResult,
      hasAllVariables,
      missingVariables: variableAnalysis.missingVariables,
      unusedVariables: variableAnalysis.unusedVariables,
      variableCount: variableAnalysis.variableCount,
      ...textStats
    };
  }, [
    debouncedVariables,
    generatePreviewContent,
    generateInteractiveContent,
    calculateTextStats,
    analyzeVariables,
    template.requiredVars,
    autoValidate,
    template.description
  ]);

  // Notify validation changes
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(
        previewResult.validationResult.isValid,
        previewResult.validationResult.errors,
        previewResult.validationResult.warnings
      );
    }
  }, [previewResult.validationResult, onValidationChange]);

  return previewResult;
}

// Hook for template statistics
export function useTemplateStats(templates: WhatsAppTemplate[]) {
  return useMemo(() => {
    const totalTemplates = templates.length;
    const categories = templates.reduce((acc, template) => {
      acc[template.category] = (acc[template.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const languages = templates.reduce((acc, template) => {
      acc[template.language] = (acc[template.language] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const totalVariables = templates.reduce((acc, template) => {
      return acc + template.requiredVars.length;
    }, 0);
    
    const averageVariables = totalTemplates > 0 ? totalVariables / totalTemplates : 0;
    
    return {
      totalTemplates,
      categories,
      languages,
      totalVariables,
      averageVariables
    };
  }, [templates]);
}

// Hook for template search and filtering
export function useTemplateSearch(
  templates: WhatsAppTemplate[],
  searchTerm: string,
  filters: {
    category?: string;
    language?: string;
    hasVariables?: boolean;
  } = {}
) {
  return useMemo(() => {
    let filteredTemplates = templates;

    // Apply search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filteredTemplates = filteredTemplates.filter(template =>
        template.name.toLowerCase().includes(term) ||
        template.description.toLowerCase().includes(term) ||
        template.requiredVars.some(varName => varName.toLowerCase().includes(term))
      );
    }

    // Apply filters
    if (filters.category) {
      filteredTemplates = filteredTemplates.filter(template => template.category === filters.category);
    }

    if (filters.language) {
      filteredTemplates = filteredTemplates.filter(template => template.language === filters.language);
    }

    if (filters.hasVariables !== undefined) {
      filteredTemplates = filteredTemplates.filter(template => 
        filters.hasVariables ? template.requiredVars.length > 0 : template.requiredVars.length === 0
      );
    }

    return filteredTemplates;
  }, [templates, searchTerm, filters]);
}

