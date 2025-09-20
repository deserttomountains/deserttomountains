/**
 * Utility functions for safe date handling in tasks
 */

/**
 * Safely formats a date, handling invalid dates gracefully
 * @param date - Date object, string, or timestamp
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string or fallback text
 */
export function safeFormatDate(
  date: Date | string | number | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }
): string {
  if (!date) return 'No date set';
  
  try {
    const dateObj = new Date(date);
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    return dateObj.toLocaleDateString('en-US', options);
  } catch (error) {
    console.warn('Date formatting error:', error);
    return 'Invalid date';
  }
}

/**
 * Safely converts a date to ISO string for form inputs
 * @param date - Date object, string, or timestamp
 * @returns ISO date string (YYYY-MM-DD) or empty string
 */
export function safeToISOString(date: Date | string | number | null | undefined): string {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.warn('Date conversion error:', error);
    return '';
  }
}

/**
 * Safely checks if a date is valid
 * @param date - Date object, string, or timestamp
 * @returns boolean indicating if date is valid
 */
export function isValidDate(date: Date | string | number | null | undefined): boolean {
  if (!date) return false;
  
  try {
    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime());
  } catch (error) {
    return false;
  }
}

/**
 * Safely checks if a task is overdue
 * @param dueDate - Task due date
 * @param status - Task status
 * @returns boolean indicating if task is overdue
 */
export function isTaskOverdue(
  dueDate: Date | string | number | null | undefined,
  status: string
): boolean {
  if (!dueDate || status === 'completed') return false;
  
  try {
    const dateObj = new Date(dueDate);
    if (isNaN(dateObj.getTime())) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dateObj.setHours(0, 0, 0, 0);
    
    return dateObj < today;
  } catch (error) {
    return false;
  }
}
