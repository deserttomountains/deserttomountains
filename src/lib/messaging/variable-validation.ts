/**
 * Template Variable Validation & Suggestions
 * Provides smart validation and suggestions for template variables
 */

export interface VariableSuggestion {
  name: string;
  displayName: string;
  description: string;
  type: 'text' | 'number' | 'date' | 'currency' | 'url' | 'email' | 'phone';
  required: boolean;
  examples: string[];
  category: 'customer' | 'order' | 'product' | 'system' | 'custom';
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: VariableSuggestion[];
}

export interface VariableUsage {
  variable: string;
  count: number;
  contexts: string[];
  suggestions: string[];
}

// Predefined variable suggestions organized by category
export const VARIABLE_SUGGESTIONS: Record<string, VariableSuggestion[]> = {
  customer: [
    {
      name: 'customer_name',
      displayName: 'Customer Name',
      description: 'Full name of the customer',
      type: 'text',
      required: true,
      examples: ['John Doe', 'Jane Smith', 'राम शर्मा'],
      category: 'customer'
    },
    {
      name: 'first_name',
      displayName: 'First Name',
      description: 'Customer\'s first name',
      type: 'text',
      required: true,
      examples: ['John', 'Jane', 'राम'],
      category: 'customer'
    },
    {
      name: 'last_name',
      displayName: 'Last Name',
      description: 'Customer\'s last name',
      type: 'text',
      required: false,
      examples: ['Doe', 'Smith', 'शर्मा'],
      category: 'customer'
    },
    {
      name: 'email',
      displayName: 'Email Address',
      description: 'Customer\'s email address',
      type: 'email',
      required: false,
      examples: ['john@example.com', 'jane@company.com'],
      category: 'customer'
    },
    {
      name: 'phone',
      displayName: 'Phone Number',
      description: 'Customer\'s phone number',
      type: 'phone',
      required: false,
      examples: ['+1234567890', '+919876543210'],
      category: 'customer'
    },
    {
      name: 'customer_id',
      displayName: 'Customer ID',
      description: 'Unique customer identifier',
      type: 'text',
      required: false,
      examples: ['CUST-12345', 'C123456'],
      category: 'customer'
    }
  ],
  order: [
    {
      name: 'order_id',
      displayName: 'Order ID',
      description: 'Unique order identifier',
      type: 'text',
      required: true,
      examples: ['ORD-12345', 'ORDER-67890', 'ऑर्डर-12345'],
      category: 'order'
    },
    {
      name: 'order_number',
      displayName: 'Order Number',
      description: 'Order number for reference',
      type: 'text',
      required: true,
      examples: ['#12345', '#ORD-67890', '#ऑर्डर-12345'],
      category: 'order'
    },
    {
      name: 'order_date',
      displayName: 'Order Date',
      description: 'Date when the order was placed',
      type: 'date',
      required: true,
      examples: ['2024-01-15', '15 Jan 2024', '15 जनवरी 2024'],
      category: 'order'
    },
    {
      name: 'order_total',
      displayName: 'Order Total',
      description: 'Total amount of the order',
      type: 'currency',
      required: true,
      examples: ['$99.99', '₹1,299.00', '₹1,299'],
      category: 'order'
    },
    {
      name: 'order_status',
      displayName: 'Order Status',
      description: 'Current status of the order',
      type: 'text',
      required: true,
      examples: ['Confirmed', 'Shipped', 'Delivered', 'पुष्टि', 'भेजा गया', 'डिलीवर'],
      category: 'order'
    },
    {
      name: 'delivery_date',
      displayName: 'Delivery Date',
      description: 'Expected or actual delivery date',
      type: 'date',
      required: false,
      examples: ['2024-01-20', '20 Jan 2024', '20 जनवरी 2024'],
      category: 'order'
    },
    {
      name: 'tracking_number',
      displayName: 'Tracking Number',
      description: 'Package tracking number',
      type: 'text',
      required: false,
      examples: ['TRK123456789', '1Z999AA1234567890'],
      category: 'order'
    },
    {
      name: 'payment_method',
      displayName: 'Payment Method',
      description: 'Method used for payment',
      type: 'text',
      required: false,
      examples: ['Credit Card', 'UPI', 'Net Banking', 'क्रेडिट कार्ड', 'UPI'],
      category: 'order'
    },
    {
      name: 'shipping_address',
      displayName: 'Shipping Address',
      description: 'Delivery address',
      type: 'text',
      required: false,
      examples: ['123 Main St, City', 'मुख्य सड़क, शहर'],
      category: 'order'
    }
  ],
  product: [
    {
      name: 'product_name',
      displayName: 'Product Name',
      description: 'Name of the product',
      type: 'text',
      required: true,
      examples: ['iPhone 15 Pro', 'Samsung Galaxy S24'],
      category: 'product'
    },
    {
      name: 'product_quantity',
      displayName: 'Product Quantity',
      description: 'Quantity of the product',
      type: 'number',
      required: true,
      examples: ['1', '2', '5'],
      category: 'product'
    },
    {
      name: 'product_price',
      displayName: 'Product Price',
      description: 'Price of the product',
      type: 'currency',
      required: true,
      examples: ['$999.00', '₹89,999'],
      category: 'product'
    },
    {
      name: 'product_category',
      displayName: 'Product Category',
      description: 'Category of the product',
      type: 'text',
      required: false,
      examples: ['Electronics', 'Clothing', 'Books'],
      category: 'product'
    }
  ],
  system: [
    {
      name: 'company_name',
      displayName: 'Company Name',
      description: 'Your company name',
      type: 'text',
      required: true,
      examples: ['Desert to Mountains', 'Your Company', 'डेजर्ट टू माउंटेन्स'],
      category: 'system'
    },
    {
      name: 'support_email',
      displayName: 'Support Email',
      description: 'Customer support email',
      type: 'email',
      required: false,
      examples: ['support@company.com', 'help@deserttomountains.com'],
      category: 'system'
    },
    {
      name: 'support_phone',
      displayName: 'Support Phone',
      description: 'Customer support phone number',
      type: 'phone',
      required: false,
      examples: ['+1-800-123-4567', '+91-98765-43210'],
      category: 'system'
    },
    {
      name: 'website_url',
      displayName: 'Website URL',
      description: 'Your company website',
      type: 'url',
      required: false,
      examples: ['https://company.com', 'https://deserttomountains.com'],
      category: 'system'
    },
    {
      name: 'current_date',
      displayName: 'Current Date',
      description: 'Today\'s date',
      type: 'date',
      required: false,
      examples: ['2024-01-15', '15 Jan 2024', '15 जनवरी 2024'],
      category: 'system'
    },
    {
      name: 'current_time',
      displayName: 'Current Time',
      description: 'Current time',
      type: 'text',
      required: false,
      examples: ['2:30 PM', '14:30', 'दोपहर 2:30'],
      category: 'system'
    },
    {
      name: 'business_hours',
      displayName: 'Business Hours',
      description: 'Company business hours',
      type: 'text',
      required: false,
      examples: ['9 AM - 6 PM', '9:00 AM - 6:00 PM', 'सुबह 9 - शाम 6'],
      category: 'system'
    },
    {
      name: 'contact_person',
      displayName: 'Contact Person',
      description: 'Name of contact person',
      type: 'text',
      required: false,
      examples: ['John Smith', 'Jane Doe', 'राम शर्मा'],
      category: 'system'
    }
  ]
};

// Common variable patterns and their suggestions
export const VARIABLE_PATTERNS = {
  // Customer-related patterns
  customer: /customer|client|user|buyer/i,
  name: /name|first|last|full/i,
  contact: /email|phone|mobile|contact/i,
  
  // Order-related patterns
  order: /order|purchase|transaction|booking/i,
  id: /id|number|ref|reference/i,
  date: /date|time|when|created/i,
  amount: /total|amount|price|cost|sum/i,
  status: /status|state|condition/i,
  
  // Product-related patterns
  product: /product|item|service|goods/i,
  quantity: /quantity|qty|count|amount/i,
  
  // System-related patterns
  company: /company|business|organization|firm/i,
  support: /support|help|assistance|service/i,
  website: /website|site|url|link/i
};

/**
 * Get variable suggestions based on context
 */
export function getVariableSuggestions(context: string, category?: string): VariableSuggestion[] {
  const suggestions: VariableSuggestion[] = [];
  
  // If specific category requested, return that category
  if (category && VARIABLE_SUGGESTIONS[category]) {
    suggestions.push(...VARIABLE_SUGGESTIONS[category]);
  } else {
    // Analyze context to suggest relevant variables
    const contextLower = context.toLowerCase();
    
    // Check for customer-related context
    if (VARIABLE_PATTERNS.customer.test(contextLower) || VARIABLE_PATTERNS.name.test(contextLower)) {
      suggestions.push(...VARIABLE_SUGGESTIONS.customer);
    }
    
    // Check for order-related context
    if (VARIABLE_PATTERNS.order.test(contextLower) || VARIABLE_PATTERNS.id.test(contextLower)) {
      suggestions.push(...VARIABLE_SUGGESTIONS.order);
    }
    
    // Check for product-related context
    if (VARIABLE_PATTERNS.product.test(contextLower)) {
      suggestions.push(...VARIABLE_SUGGESTIONS.product);
    }
    
    // Always include system variables
    suggestions.push(...VARIABLE_SUGGESTIONS.system);
  }
  
  // Remove duplicates
  const uniqueSuggestions = suggestions.filter((suggestion, index, self) => 
    index === self.findIndex(s => s.name === suggestion.name)
  );
  
  return uniqueSuggestions;
}

/**
 * Validate template variables
 */
export function validateTemplateVariables(
  templateText: string,
  providedVariables: Record<string, string> = {}
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: VariableSuggestion[] = [];
  
  // Extract variables from template text
  const variableMatches = templateText.match(/\{\{([^}]+)\}\}/g) || [];
  const usedVariables = variableMatches.map(match => match.slice(2, -2).trim());
  
  // Check for duplicate variables
  const duplicateVariables = usedVariables.filter((variable, index) => 
    usedVariables.indexOf(variable) !== index
  );
  
  if (duplicateVariables.length > 0) {
    errors.push(`Duplicate variables found: ${duplicateVariables.join(', ')}`);
  }
  
  // Check for missing required variables
  const missingVariables = usedVariables.filter(variable => 
    !providedVariables.hasOwnProperty(variable)
  );
  
  if (missingVariables.length > 0) {
    warnings.push(`Missing variable values: ${missingVariables.join(', ')}`);
    
    // Generate suggestions for missing variables
    missingVariables.forEach(variable => {
      const suggestion = findVariableSuggestion(variable);
      if (suggestion) {
        suggestions.push(suggestion);
      }
    });
  }
  
  // Check for unused provided variables
  const unusedVariables = Object.keys(providedVariables).filter(variable => 
    !usedVariables.includes(variable)
  );
  
  if (unusedVariables.length > 0) {
    warnings.push(`Unused variables: ${unusedVariables.join(', ')}`);
  }
  
  // Validate variable names
  usedVariables.forEach(variable => {
    if (!isValidVariableName(variable)) {
      errors.push(`Invalid variable name: ${variable}. Use lowercase letters, numbers, and underscores only.`);
    }
  });
  
  // Check for common mistakes
  const commonMistakes = findCommonMistakes(usedVariables);
  if (commonMistakes.length > 0) {
    warnings.push(...commonMistakes);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  };
}

/**
 * Find variable suggestion by name
 */
function findVariableSuggestion(variableName: string): VariableSuggestion | null {
  const allSuggestions = Object.values(VARIABLE_SUGGESTIONS).flat();
  return allSuggestions.find(suggestion => suggestion.name === variableName) || null;
}

/**
 * Check if variable name is valid
 */
function isValidVariableName(name: string): boolean {
  // Variable names should be lowercase, contain only letters, numbers, and underscores
  return /^[a-z][a-z0-9_]*$/.test(name);
}

/**
 * Find common mistakes in variable usage
 */
function findCommonMistakes(variables: string[]): string[] {
  const mistakes: string[] = [];
  
  variables.forEach(variable => {
    // Check for common typos
    const suggestions = getSimilarVariableNames(variable);
    if (suggestions.length > 0) {
      mistakes.push(`Did you mean "${suggestions[0]}" instead of "${variable}"?`);
    }
    
    // Check for inconsistent naming
    if (variable.includes('_') && variable.includes('-')) {
      mistakes.push(`Variable "${variable}" mixes underscores and hyphens. Use underscores consistently.`);
    }
    
    // Check for camelCase
    if (/[A-Z]/.test(variable)) {
      mistakes.push(`Variable "${variable}" contains uppercase letters. Use lowercase with underscores.`);
    }
  });
  
  return mistakes;
}

/**
 * Get similar variable names for typo detection
 */
function getSimilarVariableNames(variable: string): string[] {
  const allSuggestions = Object.values(VARIABLE_SUGGESTIONS).flat();
  const similar: string[] = [];
  
  allSuggestions.forEach(suggestion => {
    if (isSimilar(variable, suggestion.name)) {
      similar.push(suggestion.name);
    }
  });
  
  return similar;
}

/**
 * Check if two strings are similar (simple Levenshtein distance)
 */
function isSimilar(str1: string, str2: string): boolean {
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  return distance <= Math.floor(maxLength * 0.3); // 30% similarity threshold
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }
  
  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Get variable usage statistics
 */
export function getVariableUsageStats(templates: string[]): VariableUsage[] {
  const variableCounts: Record<string, { count: number; contexts: string[] }> = {};
  
  templates.forEach(template => {
    const variables = template.match(/\{\{([^}]+)\}\}/g) || [];
    variables.forEach(match => {
      const variable = match.slice(2, -2).trim();
      if (!variableCounts[variable]) {
        variableCounts[variable] = { count: 0, contexts: [] };
      }
      variableCounts[variable].count++;
      variableCounts[variable].contexts.push(template);
    });
  });
  
  return Object.entries(variableCounts).map(([variable, data]) => ({
    variable,
    count: data.count,
    contexts: data.contexts,
    suggestions: getVariableSuggestions(variable).map(s => s.name)
  }));
}

/**
 * Generate variable suggestions based on template content
 */
export function generateContextualSuggestions(templateText: string): VariableSuggestion[] {
  const suggestions: VariableSuggestion[] = [];
  const textLower = templateText.toLowerCase();
  
  // Analyze template content for context
  if (textLower.includes('order') || textLower.includes('purchase')) {
    suggestions.push(...VARIABLE_SUGGESTIONS.order);
  }
  
  if (textLower.includes('customer') || textLower.includes('client')) {
    suggestions.push(...VARIABLE_SUGGESTIONS.customer);
  }
  
  if (textLower.includes('product') || textLower.includes('item')) {
    suggestions.push(...VARIABLE_SUGGESTIONS.product);
  }
  
  // Always include system variables
  suggestions.push(...VARIABLE_SUGGESTIONS.system);
  
  // Remove duplicates
  const uniqueSuggestions = suggestions.filter((suggestion, index, self) => 
    index === self.findIndex(s => s.name === suggestion.name)
  );
  
  return uniqueSuggestions;
}
