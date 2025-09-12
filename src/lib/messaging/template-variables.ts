/**
 * Enhanced Template Variable System
 * Provides smart variable types, validation, and predefined values
 */

export interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'phone' | 'email' | 'url' | 'currency';
  label: string;
  description: string;
  required: boolean;
  category: 'utility' | 'marketing';
  placeholder?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number | string; // For numbers or date strings
    max?: number | string; // For numbers or date strings
  };
  options?: Array<{ value: string; label: string; description?: string }>;
  defaultValue?: string;
  examples?: string[];
}

export interface TemplateVariableConfig {
  [variableName: string]: TemplateVariable;
}

// Predefined variable configurations
export const TEMPLATE_VARIABLE_CONFIGS: TemplateVariableConfig = {
  // UTILITY VARIABLES (Order and Customer-related)
  order_id: {
    name: 'order_id',
    type: 'text',
    label: 'Order ID',
    description: 'The unique order identifier',
    required: true,
    category: 'utility',
    placeholder: 'e.g., ORD-2024-001',
    validation: {
      pattern: '^[A-Z0-9-_]+$',
      minLength: 3,
      maxLength: 20
    },
    examples: ['ORD-2024-001', 'WP-12345', 'ORDER-789']
  },
  
  order_status: {
    name: 'order_status',
    type: 'select',
    label: 'Order Status',
    description: 'Current status of the order',
    required: true,
    category: 'utility',
    options: [
      { value: 'confirmed', label: 'Confirmed', description: 'Order has been confirmed' },
      { value: 'processing', label: 'Processing', description: 'Order is being prepared' },
      { value: 'shipped', label: 'Shipped', description: 'Order has been shipped' },
      { value: 'out_for_delivery', label: 'Out for Delivery', description: 'Order is out for delivery' },
      { value: 'delivered', label: 'Delivered', description: 'Order has been delivered' },
      { value: 'cancelled', label: 'Cancelled', description: 'Order has been cancelled' },
      { value: 'refunded', label: 'Refunded', description: 'Order has been refunded' }
    ],
    defaultValue: 'confirmed'
  },
  
  estimated_delivery: {
    name: 'estimated_delivery',
    type: 'date',
    label: 'Estimated Delivery Date',
    description: 'Expected delivery date for the order',
    required: true,
    category: 'utility',
    validation: {
      min: new Date().toISOString().split('T')[0] // Today or later
    },
    examples: ['2024-12-25', '2024-01-15']
  },
  
  
  // UTILITY VARIABLES (Order and Customer-related)
  customer_name_utility: {
    name: 'customer_name_utility',
    type: 'text',
    label: 'Customer Name',
    description: 'Full name of the customer',
    required: true,
    category: 'utility',
    placeholder: 'e.g., John Doe',
    validation: {
      minLength: 2,
      maxLength: 50
    },
    examples: ['John Doe', 'Priya Sharma', 'Ahmed Ali']
  },

  // MARKETING VARIABLES (Customer-related)
  customer_name_marketing: {
    name: 'customer_name_marketing',
    type: 'text',
    label: 'Customer Name',
    description: 'Full name of the customer for marketing messages',
    required: true,
    category: 'marketing',
    placeholder: 'e.g., John Doe',
    validation: {
      minLength: 2,
      maxLength: 50
    },
    examples: ['John Doe', 'Priya Sharma', 'Ahmed Ali']
  },
};

/**
 * Get variable configuration for a specific variable name
 */
export function getVariableConfig(variableName: string): TemplateVariable | null {
  return TEMPLATE_VARIABLE_CONFIGS[variableName] || null;
}

/**
 * Validate a variable value against its configuration
 */
export function validateVariableValue(
  variableName: string, 
  value: string
): { isValid: boolean; error?: string } {
  const config = getVariableConfig(variableName);
  if (!config) {
    return { isValid: true }; // Unknown variable, allow it
  }
  
  if (config.required && (!value || value.trim() === '')) {
    return { isValid: false, error: `${config.label} is required` };
  }
  
  if (!value || value.trim() === '') {
    return { isValid: true }; // Empty optional field is valid
  }
  
  const trimmedValue = value.trim();
  
  // Type-specific validation
  switch (config.type) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedValue)) {
        return { isValid: false, error: 'Please enter a valid email address' };
      }
      break;
      
    case 'phone':
      const phoneRegex = /^[+]?[0-9\s-()]{10,15}$/;
      if (!phoneRegex.test(trimmedValue)) {
        return { isValid: false, error: 'Please enter a valid phone number' };
      }
      break;
      
    case 'url':
      try {
        new URL(trimmedValue);
      } catch {
        return { isValid: false, error: 'Please enter a valid URL' };
      }
      break;
      
    case 'number':
    case 'currency':
      const numValue = parseFloat(trimmedValue);
      if (isNaN(numValue)) {
        return { isValid: false, error: 'Please enter a valid number' };
      }
      if (config.validation?.min !== undefined) {
        const minValue = typeof config.validation.min === 'number' ? config.validation.min : parseFloat(config.validation.min);
        if (!isNaN(minValue) && numValue < minValue) {
          return { isValid: false, error: `Value must be at least ${config.validation.min}` };
        }
      }
      if (config.validation?.max !== undefined) {
        const maxValue = typeof config.validation.max === 'number' ? config.validation.max : parseFloat(config.validation.max);
        if (!isNaN(maxValue) && numValue > maxValue) {
          return { isValid: false, error: `Value must be at most ${config.validation.max}` };
        }
      }
      break;
      
    case 'date':
      const dateValue = new Date(trimmedValue);
      if (isNaN(dateValue.getTime())) {
        return { isValid: false, error: 'Please enter a valid date' };
      }
      if (config.validation?.min) {
        const minDate = new Date(config.validation.min);
        if (dateValue < minDate) {
          return { isValid: false, error: `Date must be ${minDate.toLocaleDateString()} or later` };
        }
      }
      break;
      
    case 'select':
      if (config.options && !config.options.some(opt => opt.value === trimmedValue)) {
        return { isValid: false, error: 'Please select a valid option' };
      }
      break;
  }
  
  // General validation rules
  if (config.validation?.minLength && trimmedValue.length < config.validation.minLength) {
    return { isValid: false, error: `Must be at least ${config.validation.minLength} characters` };
  }
  
  if (config.validation?.maxLength && trimmedValue.length > config.validation.maxLength) {
    return { isValid: false, error: `Must be at most ${config.validation.maxLength} characters` };
  }
  
  if (config.validation?.pattern) {
    const regex = new RegExp(config.validation.pattern);
    if (!regex.test(trimmedValue)) {
      return { isValid: false, error: 'Invalid format' };
    }
  }
  
  return { isValid: true };
}

/**
 * Get all variable configurations for a list of variable names
 */
export function getVariableConfigs(variableNames: string[]): TemplateVariable[] {
  return variableNames
    .map(name => getVariableConfig(name))
    .filter((config): config is TemplateVariable => config !== null);
}

/**
 * Get variables by category (utility or marketing)
 */
export function getVariablesByCategory(category: 'utility' | 'marketing'): TemplateVariable[] {
  return Object.values(TEMPLATE_VARIABLE_CONFIGS)
    .filter(variable => variable.category === category);
}

/**
 * Get utility variables (order-related)
 */
export function getUtilityVariables(): TemplateVariable[] {
  return getVariablesByCategory('utility');
}

/**
 * Get marketing variables (customer-related)
 */
export function getMarketingVariables(): TemplateVariable[] {
  return getVariablesByCategory('marketing');
}

/**
 * Format a variable value for display
 */
export function formatVariableValue(variableName: string, value: string): string {
  const config = getVariableConfig(variableName);
  if (!config) return value;
  
  switch (config.type) {
    case 'date':
      try {
        return new Date(value).toLocaleDateString();
      } catch {
        return value;
      }
      
    case 'currency':
      try {
        const numValue = parseFloat(value);
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR'
        }).format(numValue);
      } catch {
        return value;
      }
      
    case 'select':
      const option = config.options?.find(opt => opt.value === value);
      return option ? option.label : value;
      
    default:
      return value;
  }
}
