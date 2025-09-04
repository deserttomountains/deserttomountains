/**
 * Notification System
 * Handles real-time notifications for new messages and SLA alerts
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
  onSnapshot,
  Timestamp
} from 'firebase/firestore';

export interface Notification {
  id: string;
  type: 'NEW_MESSAGE' | 'SLA_BREACH' | 'TEMPLATE_APPROVAL' | 'CAMPAIGN_COMPLETE' | 'SYSTEM_ALERT';
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'UNREAD' | 'READ' | 'ACKNOWLEDGED';
  targetUserId?: string;
  targetRole?: string;
  metadata: {
    threadId?: string;
    customerId?: string;
    messageId?: string;
    slaBreachMinutes?: number;
    campaignId?: string;
    templateId?: string;
    [key: string]: any;
  };
  createdAt: Date;
  readAt?: Date;
  acknowledgedAt?: Date;
  expiresAt?: Date;
}

export interface SLARule {
  id: string;
  name: string;
  description: string;
  type: 'FIRST_RESPONSE' | 'RESOLUTION' | 'FOLLOW_UP';
  timeLimitMinutes: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  channels: ('whatsapp' | 'instagram')[];
  conditions: {
    customerType?: string[];
    threadStatus?: string[];
    businessHours?: boolean;
  };
  actions: {
    notifyUsers: string[];
    notifyRoles: string[];
    autoAssign?: boolean;
    escalateAfterMinutes?: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SLAViolation {
  id: string;
  ruleId: string;
  ruleName: string;
  threadId: string;
  customerId: string;
  violationType: 'FIRST_RESPONSE' | 'RESOLUTION' | 'FOLLOW_UP';
  breachTime: Date;
  breachMinutes: number;
  status: 'ACTIVE' | 'RESOLVED' | 'ESCALATED';
  assignedTo?: string;
  resolvedAt?: Date;
  resolutionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create a new notification
 */
export async function createNotification(data: Omit<Notification, 'id' | 'status' | 'createdAt'>): Promise<string> {
  try {
    const notificationData = {
      ...data,
      status: 'UNREAD' as const,
      createdAt: serverTimestamp()
    };
    
    const notificationRef = await addDoc(collection(db, 'notifications'), notificationData);
    return notificationRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      status: 'READ',
      readAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Acknowledge notification
 */
export async function acknowledgeNotification(notificationId: string): Promise<void> {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      status: 'ACKNOWLEDGED',
      acknowledgedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error acknowledging notification:', error);
    throw error;
  }
}

/**
 * Get notifications for a user
 */
export async function getUserNotifications(
  userId: string, 
  status?: Notification['status'],
  limit: number = 50
): Promise<Notification[]> {
  try {
    let q = query(
      collection(db, 'notifications'),
      where('targetUserId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    if (status) {
      q = query(q, where('status', '==', status));
    }
    
    const snapshot = await getDocs(q);
    const notifications: Notification[] = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      notifications.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        readAt: data.readAt?.toDate(),
        acknowledgedAt: data.acknowledgedAt?.toDate(),
        expiresAt: data.expiresAt?.toDate()
      } as Notification);
    });
    
    return notifications.slice(0, limit);
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('targetUserId', '==', userId),
      where('status', '==', 'UNREAD')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
}

/**
 * Create SLA rule
 */
export async function createSLARule(data: Omit<SLARule, 'id' | 'createdAt' | 'updatedAt' | 'isActive'> & { isActive?: boolean }): Promise<string> {
  try {
    const ruleData = {
      ...data,
      isActive: data.isActive ?? true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const ruleRef = await addDoc(collection(db, 'slaRules'), ruleData);
    return ruleRef.id;
  } catch (error) {
    console.error('Error creating SLA rule:', error);
    throw error;
  }
}

/**
 * Get active SLA rules
 */
export async function getActiveSLARules(): Promise<SLARule[]> {
  try {
    const q = query(
      collection(db, 'slaRules'),
      where('isActive', '==', true),
      orderBy('priority', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const rules: SLARule[] = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      rules.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as SLARule);
    });
    
    return rules;
  } catch (error) {
    console.error('Error getting active SLA rules:', error);
    throw error;
  }
}

/**
 * Check SLA compliance for a thread
 */
export async function checkSLACompliance(threadId: string): Promise<SLAViolation[]> {
  try {
    const rules = await getActiveSLARules();
    const violations: SLAViolation[] = [];
    
    // Get thread data
    const threadRef = doc(db, 'threads', threadId);
    const threadSnap = await getDoc(threadRef);
    
    if (!threadSnap.exists()) {
      return violations;
    }
    
    const threadData = threadSnap.data();
    const lastInboundAt = threadData.lastInboundAt?.toDate();
    const lastMessageAt = threadData.lastMessageAt?.toDate();
    
    if (!lastInboundAt) {
      return violations;
    }
    
    const now = new Date();
    const timeSinceInbound = (now.getTime() - lastInboundAt.getTime()) / (1000 * 60); // minutes
    
    // Check each rule
    for (const rule of rules) {
      // Check if rule applies to this thread
      const ruleChannels = rule.channels || [];
      const threadChannels: string[] = Array.isArray(threadData.channels) ? threadData.channels : [];
      if (ruleChannels.length > 0 && threadChannels.length > 0) {
        const threadPrimary = threadChannels[0];
        if (threadPrimary === 'whatsapp' || threadPrimary === 'instagram') {
          if (!ruleChannels.includes(threadPrimary)) {
            continue;
          }
        } else {
          // Unknown channel type, skip this rule
          continue;
        }
      }
      
      if (rule.conditions.threadStatus && !rule.conditions.threadStatus.includes(threadData.status)) {
        continue;
      }
      
      // Check if SLA is breached
      if (timeSinceInbound > rule.timeLimitMinutes) {
        // Check if violation already exists
        const existingViolation = await getExistingViolation(threadId, rule.id);
        
        if (!existingViolation) {
          // Create new violation
          const violationData = {
            ruleId: rule.id,
            ruleName: rule.name,
            threadId,
            customerId: threadData.customerId,
            violationType: rule.type,
            breachTime: now,
            breachMinutes: Math.floor(timeSinceInbound),
            status: 'ACTIVE' as const,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          
          const violationRef = await addDoc(collection(db, 'slaViolations'), violationData);
          
          // Create notification
          await createNotification({
            type: 'SLA_BREACH',
            title: `SLA Breach: ${rule.name}`,
            message: `Thread ${threadId} has exceeded ${rule.timeLimitMinutes} minute SLA for ${rule.type.toLowerCase().replace('_', ' ')}`,
            priority: rule.priority,
            targetUserId: undefined,
            targetRole: undefined,
            metadata: {
              threadId,
              customerId: threadData.customerId,
              slaBreachMinutes: Math.floor(timeSinceInbound),
              ruleId: rule.id
            }
          });
          
          violations.push({
            id: violationRef.id,
            ...violationData,
            createdAt: now,
            updatedAt: now
          } as SLAViolation);
        }
      }
    }
    
    return violations;
  } catch (error) {
    console.error('Error checking SLA compliance:', error);
    throw error;
  }
}

/**
 * Get existing SLA violation
 */
async function getExistingViolation(threadId: string, ruleId: string): Promise<SLAViolation | null> {
  try {
    const q = query(
      collection(db, 'slaViolations'),
      where('threadId', '==', threadId),
      where('ruleId', '==', ruleId),
      where('status', '==', 'ACTIVE')
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }
    
    const data = snapshot.docs[0].data();
    return {
      id: snapshot.docs[0].id,
      ...data,
      breachTime: data.breachTime?.toDate(),
      resolvedAt: data.resolvedAt?.toDate(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate()
    } as SLAViolation;
  } catch (error) {
    console.error('Error getting existing violation:', error);
    return null;
  }
}

/**
 * Resolve SLA violation
 */
export async function resolveSLAViolation(
  violationId: string, 
  resolvedBy: string, 
  notes?: string
): Promise<void> {
  try {
    const violationRef = doc(db, 'slaViolations', violationId);
    await updateDoc(violationRef, {
      status: 'RESOLVED',
      resolvedAt: serverTimestamp(),
      resolutionNotes: notes,
      updatedAt: serverTimestamp()
    });
    
    // Create resolution notification
    await createNotification({
      type: 'SYSTEM_ALERT',
      title: 'SLA Violation Resolved',
      message: `SLA violation ${violationId} has been resolved by ${resolvedBy}`,
      priority: 'MEDIUM',
      targetUserId: undefined,
      targetRole: undefined,
      metadata: {
        violationId,
        resolvedBy
      }
    });
  } catch (error) {
    console.error('Error resolving SLA violation:', error);
    throw error;
  }
}

/**
 * Get SLA violations by status
 */
export async function getSLAViolations(status?: SLAViolation['status']): Promise<SLAViolation[]> {
  try {
    let q = query(collection(db, 'slaViolations'), orderBy('createdAt', 'desc'));
    
    if (status) {
      q = query(q, where('status', '==', status));
    }
    
    const snapshot = await getDocs(q);
    const violations: SLAViolation[] = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      violations.push({
        id: doc.id,
        ...data,
        breachTime: data.breachTime?.toDate(),
        resolvedAt: data.resolvedAt?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as SLAViolation);
    });
    
    return violations;
  } catch (error) {
    console.error('Error getting SLA violations:', error);
    throw error;
  }
}

/**
 * Get SLA statistics
 */
export async function getSLAStats(): Promise<{
  totalViolations: number;
  activeViolations: number;
  resolvedViolations: number;
  averageResolutionTime: number;
  complianceRate: number;
}> {
  try {
    const violations = await getSLAViolations();
    
    const stats = violations.reduce((acc, violation) => {
      acc.totalViolations++;
      
      if (violation.status === 'ACTIVE') {
        acc.activeViolations++;
      } else if (violation.status === 'RESOLVED') {
        acc.resolvedViolations++;
        
        if (violation.resolvedAt) {
          const resolutionTime = (violation.resolvedAt.getTime() - violation.breachTime.getTime()) / (1000 * 60); // minutes
          acc.totalResolutionTime += resolutionTime;
        }
      }
      
      return acc;
    }, {
      totalViolations: 0,
      activeViolations: 0,
      resolvedViolations: 0,
      totalResolutionTime: 0
    });
    
    return {
      totalViolations: stats.totalViolations,
      activeViolations: stats.activeViolations,
      resolvedViolations: stats.resolvedViolations,
      averageResolutionTime: stats.resolvedViolations > 0 ? stats.totalResolutionTime / stats.resolvedViolations : 0,
      complianceRate: stats.totalViolations > 0 ? ((stats.totalViolations - stats.activeViolations) / stats.totalViolations) * 100 : 100
    };
  } catch (error) {
    console.error('Error getting SLA stats:', error);
    throw error;
  }
}

/**
 * Subscribe to real-time notifications
 */
export function subscribeToNotifications(
  userId: string,
  callback: (notifications: Notification[]) => void
): () => void {
  const q = query(
    collection(db, 'notifications'),
    where('targetUserId', '==', userId),
    where('status', '==', 'UNREAD'),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const notifications: Notification[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      notifications.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        readAt: data.readAt?.toDate(),
        acknowledgedAt: data.acknowledgedAt?.toDate(),
        expiresAt: data.expiresAt?.toDate()
      } as Notification);
    });
    
    callback(notifications);
  });
}

/**
 * Create notification for new message
 */
export async function notifyNewMessage(
  threadId: string,
  customerId: string,
  messageId: string,
  customerName: string,
  messagePreview: string
): Promise<void> {
  try {
    // Get thread data to determine assignee
    const threadRef = doc(db, 'threads', threadId);
    const threadSnap = await getDoc(threadRef);
    
    if (!threadSnap.exists()) {
      return;
    }
    
    const threadData = threadSnap.data();
    const assignee = threadData.assignee;
    
    // Create notification for assigned user
    if (assignee) {
      await createNotification({
        type: 'NEW_MESSAGE',
        title: `New message from ${customerName}`,
        message: messagePreview.length > 100 ? `${messagePreview.substring(0, 100)}...` : messagePreview,
        priority: threadData.priority === 'high' ? 'HIGH' : 'MEDIUM',
        targetUserId: assignee,
        metadata: {
          threadId,
          customerId,
          messageId,
          customerName
        }
      });
    }
    
    // Create notification for unassigned threads (for admins)
    if (!assignee) {
      await createNotification({
        type: 'NEW_MESSAGE',
        title: `Unassigned message from ${customerName}`,
        message: `New unassigned thread requires attention`,
        priority: 'HIGH',
        targetRole: 'admin',
        metadata: {
          threadId,
          customerId,
          messageId,
          customerName
        }
      });
    }
  } catch (error) {
    console.error('Error creating new message notification:', error);
  }
}
