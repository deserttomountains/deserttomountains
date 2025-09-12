/**
 * Template Management System
 * Handles WhatsApp template creation, validation, and approval workflow
 */

import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  updateDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';

export interface TemplateRequest {
  id: string;
  name: string;
  language: string;
  category: 'UTILITY' | 'MARKETING';
  components: TemplateComponent[];
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  meta: {
    description: string;
    useCase: string;
    exampleVariables: Record<string, string>;
  };
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  approvedAt?: Date;
}

export interface TemplateComponent {
  type: 'TEXT' | 'BUTTONS';
  text?: string;
  variables?: string[];
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  mediaUrl?: string;
  mediaFileName?: string;
  mediaFileSize?: number;
  mediaStorageId?: string; // Firebase Storage file ID
  buttons?: TemplateButton[];
}

export interface TemplateButton {
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
  text: string;
  url?: string;
  phone_number?: string;
}


export interface CreateTemplateRequest {
  name: string;
  language: string;
  category: 'UTILITY' | 'MARKETING';
  components: TemplateComponent[];
  meta: {
    description: string;
    useCase: string;
    exampleVariables: Record<string, string>;
  };
}

export interface UpdateTemplateRequest {
  components?: TemplateComponent[];
  meta?: {
    description?: string;
    useCase?: string;
    exampleVariables?: Record<string, string>;
  };
  status?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface ListTemplatesRequest {
  status?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  category?: 'UTILITY' | 'MARKETING';
  language?: string;
  limit?: number;
  offset?: number;
}

export interface ListTemplatesResponse {
  templates: TemplateRequest[];
  total: number;
  hasMore: boolean;
}

export interface TemplateApproval {
  id: string;
  templateId: string;
  reviewerId: string;
  reviewerName: string;
  status: 'APPROVED' | 'REJECTED';
  comments: string;
  reviewedAt: Date;
}

/**
 * Create a new template request
 */
export async function createTemplateRequest(data: Omit<TemplateRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const templateData = {
      ...data,
      status: 'DRAFT' as const,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const templateRef = await addDoc(collection(db, 'templateRequests'), templateData);
    return templateRef.id;
  } catch (error) {
    console.error('Error creating template request:', error);
    throw error;
  }
}

/**
 * Submit template for approval
 */
export async function submitTemplateForApproval(templateId: string): Promise<void> {
  try {
    const templateRef = doc(db, 'templateRequests', templateId);
    await updateDoc(templateRef, {
      status: 'PENDING',
      submittedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error submitting template for approval:', error);
    throw error;
  }
}

/**
 * Approve or reject template
 */
export async function reviewTemplate(
  templateId: string, 
  reviewerId: string, 
  reviewerName: string,
  status: 'APPROVED' | 'REJECTED',
  comments: string
): Promise<void> {
  try {
    const batch = writeBatch(db);
    
    // Update template status
    const templateRef = doc(db, 'templateRequests', templateId);
    const templateUpdate: any = {
      status,
      updatedAt: serverTimestamp()
    };
    
    if (status === 'APPROVED') {
      templateUpdate.approvedAt = serverTimestamp();
    } else {
      templateUpdate.rejectionReason = comments;
    }
    
    batch.update(templateRef, templateUpdate);
    
    // Create approval record
    const approvalData = {
      templateId,
      reviewerId,
      reviewerName,
      status,
      comments,
      reviewedAt: serverTimestamp()
    };
    
    const approvalRef = doc(collection(db, 'templateApprovals'));
    batch.set(approvalRef, approvalData);
    
    await batch.commit();
  } catch (error) {
    console.error('Error reviewing template:', error);
    throw error;
  }
}

/**
 * Get template requests by status
 */
export async function getTemplateRequests(status?: TemplateRequest['status']): Promise<TemplateRequest[]> {
  try {
    let q = query(collection(db, 'templateRequests'), orderBy('createdAt', 'desc'));
    
    if (status) {
      q = query(q, where('status', '==', status));
    }
    
    const snapshot = await getDocs(q);
    const templates: TemplateRequest[] = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      templates.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        submittedAt: data.submittedAt?.toDate(),
        approvedAt: data.approvedAt?.toDate()
      } as TemplateRequest);
    });
    
    return templates;
  } catch (error) {
    console.error('Error getting template requests:', error);
    throw error;
  }
}

/**
 * Get approved templates for use in messaging
 */
export async function getApprovedTemplates(): Promise<TemplateRequest[]> {
  return getTemplateRequests('APPROVED');
}

/**
 * Validate template before submission
 */
export function validateTemplate(template: Omit<TemplateRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required fields
  if (!template.name || template.name.length < 3) {
    errors.push('Template name must be at least 3 characters long');
  }
  
  if (!template.language) {
    errors.push('Language is required');
  }
  
  if (!template.category) {
    errors.push('Category is required');
  }
  
  if (!template.components || template.components.length === 0) {
    errors.push('At least one component is required');
  }
  
  // Check component validation
  template.components?.forEach((component, index) => {
    if (!component.type) {
      errors.push(`Component ${index + 1}: Type is required`);
    }
    
    if (component.type === 'TEXT' && !component.text) {
      errors.push(`Component ${index + 1}: Text content is required`);
    }
    
    if (component.text && component.text.length > 1024) {
      errors.push(`Component ${index + 1}: Text exceeds 1024 character limit`);
    }
  });
  
  // Check meta information
  if (!template.meta.description || template.meta.description.length < 10) {
    errors.push('Description must be at least 10 characters long');
  }
  
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generate template preview with variables
 */
export function generateTemplatePreview(
  template: TemplateRequest, 
  variables: Record<string, string> = {}
): string {
  let preview = `Template: ${template.name}\n`;
  preview += `Category: ${template.category}\n`;
  preview += `Language: ${template.language}\n\n`;
  
  template.components.forEach((component, index) => {
    preview += `${component.type}:\n`;
    
    if (component.text) {
      let text = component.text;
      
      // Replace variables with actual values
      Object.entries(variables).forEach(([key, value]) => {
        text = text.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });
      
      preview += `  ${text}\n`;
    }
    
    // Example content is now handled through meta.exampleVariables
    
    if (component.variables && component.variables.length > 0) {
      preview += `  Variables: ${component.variables.join(', ')}\n`;
    }
    
    preview += '\n';
  });
  
  return preview;
}

/**
 * Get template statistics
 */
export async function getTemplateStats(): Promise<{
  total: number;
  draft: number;
  pending: number;
  approved: number;
  rejected: number;
}> {
  try {
    const [draft, pending, approved, rejected] = await Promise.all([
      getTemplateRequests('DRAFT'),
      getTemplateRequests('PENDING'),
      getTemplateRequests('APPROVED'),
      getTemplateRequests('REJECTED')
    ]);
    
    return {
      total: draft.length + pending.length + approved.length + rejected.length,
      draft: draft.length,
      pending: pending.length,
      approved: approved.length,
      rejected: rejected.length
    };
  } catch (error) {
    console.error('Error getting template stats:', error);
    throw error;
  }
}

/**
 * Enhanced Template Management Service Class
 */
export class TemplateManagementService {
  /**
   * Create a new template
   */
  async createTemplate(data: CreateTemplateRequest): Promise<TemplateRequest> {
    try {
      const templateData = {
        ...data,
        status: 'DRAFT' as const,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const templateRef = await addDoc(collection(db, 'templateRequests'), templateData);
      
      return {
        id: templateRef.id,
        ...templateData,
        createdAt: new Date(),
        updatedAt: new Date()
      } as TemplateRequest;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  }

  /**
   * Get a specific template
   */
  async getTemplate(templateId: string): Promise<TemplateRequest | null> {
    try {
      const templateRef = doc(db, 'templateRequests', templateId);
      const templateSnap = await getDoc(templateRef);
      
      if (!templateSnap.exists()) {
        return null;
      }
      
      const data = templateSnap.data();
      return {
        id: templateSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        submittedAt: data.submittedAt?.toDate(),
        approvedAt: data.approvedAt?.toDate()
      } as TemplateRequest;
    } catch (error) {
      console.error('Error getting template:', error);
      throw error;
    }
  }

  /**
   * Update a template
   */
  async updateTemplate(templateId: string, updates: UpdateTemplateRequest): Promise<TemplateRequest> {
    try {
      const templateRef = doc(db, 'templateRequests', templateId);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(templateRef, updateData);
      
      // Return updated template
      const updatedTemplate = await this.getTemplate(templateId);
      if (!updatedTemplate) {
        throw new Error('Template not found after update');
      }
      
      return updatedTemplate;
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  }

  /**
   * Delete a template
   */
  async deleteTemplate(templateId: string): Promise<void> {
    try {
      const templateRef = doc(db, 'templateRequests', templateId);
      await deleteDoc(templateRef);
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  }

  /**
   * List templates with filtering and pagination
   */
  async listTemplates(request: ListTemplatesRequest): Promise<ListTemplatesResponse> {
    try {
      const { status, category, language, limit = 50, offset = 0 } = request;
      
      let q = query(
        collection(db, 'templateRequests'),
        orderBy('createdAt', 'desc')
      );
      
      if (status) {
        q = query(q, where('status', '==', status));
      }
      
      if (category) {
        q = query(q, where('category', '==', category));
      }
      
      if (language) {
        q = query(q, where('language', '==', language));
      }
      
      const snapshot = await getDocs(q);
      const templates: TemplateRequest[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        templates.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          submittedAt: data.submittedAt?.toDate(),
          approvedAt: data.approvedAt?.toDate()
        } as TemplateRequest);
      });
      
      // Apply pagination
      const paginatedTemplates = templates.slice(offset, offset + limit);
      const hasMore = offset + limit < templates.length;
      
      return {
        templates: paginatedTemplates,
        total: templates.length,
        hasMore
      };
    } catch (error) {
      console.error('Error listing templates:', error);
      throw error;
    }
  }

  /**
   * Submit template for approval
   */
  async submitForApproval(templateId: string): Promise<void> {
    return submitTemplateForApproval(templateId);
  }

  /**
   * Review template (approve/reject)
   */
  async reviewTemplate(
    templateId: string,
    reviewerId: string,
    reviewerName: string,
    status: 'APPROVED' | 'REJECTED',
    comments: string
  ): Promise<void> {
    return reviewTemplate(templateId, reviewerId, reviewerName, status, comments);
  }

  /**
   * Get template statistics
   */
  async getStats(): Promise<{
    total: number;
    draft: number;
    pending: number;
    approved: number;
    rejected: number;
  }> {
    return getTemplateStats();
  }
}

// Export singleton instance
export const templateManagementService = new TemplateManagementService();
