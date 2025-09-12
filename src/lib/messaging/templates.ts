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
  exampleContent?: string;
  useCase?: string;
  targetAudience?: string;
}

// Registry of approved WhatsApp templates
export const WHATSAPP_TEMPLATES: Record<string, WhatsAppTemplate> = {
  utility_order_update: {
    name: 'utility_order_update',
    language: 'en',
    requiredVars: ['order_number', 'status', 'estimated_delivery'],
    category: 'UTILITY',
    description: 'Hi {{customer_name}}, your order {{order_number}} status has been updated to {{status}}. Estimated delivery: {{estimated_delivery}}. Thank you for choosing us!',
    exampleContent: 'Hi John Doe, your order ORD-2024-001 status has been updated to shipped. Estimated delivery: 2024-12-25. Thank you for choosing us!',
    useCase: 'Notify customers about order status changes',
    targetAudience: 'Customers with active orders'
  },
  utility_shipping_update: {
    name: 'utility_shipping_update',
    language: 'en',
    requiredVars: ['order_number', 'tracking_number', 'carrier'],
    category: 'UTILITY',
    description: 'Great news! Your order {{order_number}} has been shipped via {{carrier}}. Track your package: {{tracking_number}}. Expected delivery in 2-3 business days.',
    exampleContent: 'Great news! Your order ORD-2024-001 has been shipped via Blue Dart. Track your package: BD123456789. Expected delivery in 2-3 business days.',
    useCase: 'Notify customers when their order is shipped',
    targetAudience: 'Customers with shipped orders'
  },
  marketing_offer: {
    name: 'marketing_offer',
    language: 'en',
    requiredVars: ['discount_percentage', 'valid_until', 'product_name'],
    category: 'MARKETING',
    description: '🎉 Special Offer! Get {{discount_percentage}}% off on {{product_name}}. Valid until {{valid_until}}. Use code SAVE{{discount_percentage}} at checkout. Limited time offer!',
    exampleContent: '🎉 Special Offer! Get 20% off on Premium Wall Putty. Valid until 2024-12-31. Use code SAVE20 at checkout. Limited time offer!',
    useCase: 'Promote special offers and discounts',
    targetAudience: 'All customers'
  },
  welcome_message: {
    name: 'welcome_message',
    language: 'en',
    requiredVars: ['customer_name'],
    category: 'UTILITY',
    description: 'Welcome {{customer_name}}! Thank you for choosing our premium wall putty solutions. We\'re here to help with all your construction needs. Feel free to reach out anytime!',
    exampleContent: 'Welcome John Doe! Thank you for choosing our premium wall putty solutions. We\'re here to help with all your construction needs. Feel free to reach out anytime!',
    useCase: 'Welcome new customers',
    targetAudience: 'New customers'
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
