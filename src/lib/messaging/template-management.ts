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
    exampleVariables: Record<string, string>;
    useCase: string;
    targetAudience: string;
  };
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  approvedAt?: Date;
}

export interface TemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  text?: string;
  example?: string;
  variables?: string[];
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
    
    if (component.type === 'BODY' && !component.text) {
      errors.push(`Component ${index + 1}: Body text is required`);
    }
    
    if (component.text && component.text.length > 1024) {
      errors.push(`Component ${index + 1}: Text exceeds 1024 character limit`);
    }
  });
  
  // Check meta information
  if (!template.meta.description || template.meta.description.length < 10) {
    errors.push('Description must be at least 10 characters long');
  }
  
  if (!template.meta.useCase) {
    errors.push('Use case is required');
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
    
    if (component.example) {
      preview += `  Example: ${component.example}\n`;
    }
    
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
