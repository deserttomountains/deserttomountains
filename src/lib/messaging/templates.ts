/**
 * WhatsApp Template Validation
 * Ensures all required template variables are provided
 */

export interface WhatsAppTemplate {
  name: string;
  language: string;
  requiredVars: string[];
  category: 'UTILITY' | 'MARKETING';
  description: string;
}

// Registry of approved WhatsApp templates
export const WHATSAPP_TEMPLATES: Record<string, WhatsAppTemplate> = {
  utility_order_update: {
    name: 'utility_order_update',
    language: 'en',
    requiredVars: ['order_number', 'status', 'estimated_delivery'],
    category: 'UTILITY',
    description: 'Order status update notification'
  },
  utility_shipping_update: {
    name: 'utility_shipping_update',
    language: 'en',
    requiredVars: ['order_number', 'tracking_number', 'carrier'],
    category: 'UTILITY',
    description: 'Shipping update notification'
  },
  marketing_offer: {
    name: 'marketing_offer',
    language: 'en',
    requiredVars: ['discount_percentage', 'valid_until', 'product_name'],
    category: 'MARKETING',
    description: 'Marketing offer notification'
  },
  welcome_message: {
    name: 'welcome_message',
    language: 'en',
    requiredVars: ['customer_name'],
    category: 'UTILITY',
    description: 'Welcome message for new customers'
  }
};

/**
 * Assert that all required template variables are provided
 */
export function assertTemplateVars(
  templateName: string,
  vars: Record<string, string>
): void {
  const template = WHATSAPP_TEMPLATES[templateName];
  
  if (!template) {
    throw new Error(`Unknown template: ${templateName}`);
  }

  const missingVars = template.requiredVars.filter(
    requiredVar => !vars[requiredVar]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required template variables: ${missingVars.join(', ')}`
    );
  }
}

/**
 * Validate template variables and return any issues
 */
export function validateTemplateVars(
  templateName: string,
  vars: Record<string, string>
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  try {
    assertTemplateVars(templateName, vars);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof Error) {
      errors.push(error.message);
    }
    return { isValid: false, errors };
  }
}

/**
 * Get template preview with variables
 */
export function getTemplatePreview(
  templateName: string,
  vars: Record<string, string>
): string {
  const template = WHATSAPP_TEMPLATES[templateName];
  
  if (!template) {
    return `Unknown template: ${templateName}`;
  }

  // This would typically call the WhatsApp API to get the actual template
  // For now, return a simple preview
  return `Template: ${template.name}\nVariables: ${JSON.stringify(vars, null, 2)}`;
}

/**
 * Get all available templates
 */
export function getAvailableTemplates(): WhatsAppTemplate[] {
  return Object.values(WHATSAPP_TEMPLATES);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: 'UTILITY' | 'MARKETING'): WhatsAppTemplate[] {
  return Object.values(WHATSAPP_TEMPLATES).filter(
    template => template.category === category
  );
}
