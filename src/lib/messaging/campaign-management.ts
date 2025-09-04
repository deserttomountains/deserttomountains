/**
 * Campaign Management System
 * Handles messaging campaigns, tracking, and analytics
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
  increment,
  writeBatch
} from 'firebase/firestore';

export interface Campaign {
  id: string;
  name: string;
  description: string;
  type: 'BROADCAST' | 'TARGETED' | 'SEQUENCE';
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  channel: 'whatsapp' | 'instagram' | 'both';
  templateId?: string;
  templateName?: string;
  targetAudience: {
    filters: {
      status?: string[];
      channels?: string[];
      lastActivity?: {
        from: Date;
        to: Date;
      };
    };
    estimatedReach: number;
  };
  schedule: {
    startDate: Date;
    endDate?: Date;
    timezone: string;
    frequency: 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  };
  content: {
    message: string;
    variables?: Record<string, string>;
    attachments?: {
      type: 'image' | 'document' | 'video';
      url: string;
      filename?: string;
    }[];
  };
  metrics: {
    sent: number;
    delivered: number;
    read: number;
    failed: number;
    replies: number;
    optOuts: number;
  };
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdBy: string;
}

export interface CampaignEvent {
  id: string;
  campaignId: string;
  customerId: string;
  threadId: string;
  event: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'REPLIED' | 'OPT_OUT';
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Create a new campaign
 */
export async function createCampaign(data: Omit<Campaign, 'id' | 'metrics' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const campaignData = {
      ...data,
      metrics: {
        sent: 0,
        delivered: 0,
        read: 0,
        failed: 0,
        replies: 0,
        optOuts: 0
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const campaignRef = await addDoc(collection(db, 'campaigns'), campaignData);
    return campaignRef.id;
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
}

/**
 * Update campaign status
 */
export async function updateCampaignStatus(campaignId: string, status: Campaign['status']): Promise<void> {
  try {
    const campaignRef = doc(db, 'campaigns', campaignId);
    const updateData: any = {
      status,
      updatedAt: serverTimestamp()
    };
    
    if (status === 'ACTIVE') {
      updateData.startedAt = serverTimestamp();
    } else if (status === 'COMPLETED') {
      updateData.completedAt = serverTimestamp();
    }
    
    await updateDoc(campaignRef, updateData);
  } catch (error) {
    console.error('Error updating campaign status:', error);
    throw error;
  }
}

/**
 * Record campaign event
 */
export async function recordCampaignEvent(event: Omit<CampaignEvent, 'id' | 'timestamp'>): Promise<void> {
  try {
    const batch = writeBatch(db);
    
    // Add event record
    const eventData = {
      ...event,
      timestamp: serverTimestamp()
    };
    
    const eventRef = doc(collection(db, 'campaignEvents'));
    batch.set(eventRef, eventData);
    
    // Update campaign metrics
    const campaignRef = doc(db, 'campaigns', event.campaignId);
    const metricField = event.event.toLowerCase() as keyof Campaign['metrics'];
    
    if (metricField in { sent: 1, delivered: 1, read: 1, failed: 1, replies: 1, optOuts: 1 }) {
      batch.update(campaignRef, {
        [`metrics.${metricField}`]: increment(1),
        updatedAt: serverTimestamp()
      });
    }
    
    await batch.commit();
  } catch (error) {
    console.error('Error recording campaign event:', error);
    throw error;
  }
}

/**
 * Get campaigns by status
 */
export async function getCampaigns(status?: Campaign['status']): Promise<Campaign[]> {
  try {
    let q = query(collection(db, 'campaigns'), orderBy('createdAt', 'desc'));
    
    if (status) {
      q = query(q, where('status', '==', status));
    }
    
    const snapshot = await getDocs(q);
    const campaigns: Campaign[] = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      campaigns.push({
        id: doc.id,
        ...data,
        schedule: {
          ...data.schedule,
          startDate: data.schedule.startDate?.toDate(),
          endDate: data.schedule.endDate?.toDate()
        },
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        startedAt: data.startedAt?.toDate(),
        completedAt: data.completedAt?.toDate()
      } as Campaign);
    });
    
    return campaigns;
  } catch (error) {
    console.error('Error getting campaigns:', error);
    throw error;
  }
}

/**
 * Get campaign analytics
 */
export async function getCampaignAnalytics(campaignId: string): Promise<{
  campaign: Campaign;
  events: CampaignEvent[];
  summary: {
    totalSent: number;
    deliveryRate: number;
    readRate: number;
    replyRate: number;
    optOutRate: number;
  };
}> {
  try {
    // Get campaign
    const campaignRef = doc(db, 'campaigns', campaignId);
    const campaignSnap = await getDoc(campaignRef);
    
    if (!campaignSnap.exists()) {
      throw new Error('Campaign not found');
    }
    
    const campaignData = campaignSnap.data();
    const campaign: Campaign = {
      id: campaignSnap.id,
      ...campaignData,
      schedule: {
        ...campaignData.schedule,
        startDate: campaignData.schedule.startDate?.toDate(),
        endDate: campaignData.schedule.endDate?.toDate()
      },
      createdAt: campaignData.createdAt?.toDate(),
      updatedAt: campaignData.updatedAt?.toDate(),
      startedAt: campaignData.startedAt?.toDate(),
      completedAt: campaignData.completedAt?.toDate()
    } as Campaign;
    
    // Get events
    const eventsQuery = query(
      collection(db, 'campaignEvents'),
      where('campaignId', '==', campaignId),
      orderBy('timestamp', 'desc')
    );
    
    const eventsSnapshot = await getDocs(eventsQuery);
    const events: CampaignEvent[] = [];
    
    eventsSnapshot.forEach(doc => {
      const data = doc.data();
      events.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate()
      } as CampaignEvent);
    });
    
    // Calculate summary
    const metrics = campaign.metrics;
    const summary = {
      totalSent: metrics.sent,
      deliveryRate: metrics.sent > 0 ? (metrics.delivered / metrics.sent) * 100 : 0,
      readRate: metrics.delivered > 0 ? (metrics.read / metrics.delivered) * 100 : 0,
      replyRate: metrics.sent > 0 ? (metrics.replies / metrics.sent) * 100 : 0,
      optOutRate: metrics.sent > 0 ? (metrics.optOuts / metrics.sent) * 100 : 0
    };
    
    return {
      campaign,
      events,
      summary
    };
  } catch (error) {
    console.error('Error getting campaign analytics:', error);
    throw error;
  }
}

/**
 * Get campaign statistics
 */
export async function getCampaignStats(): Promise<{
  total: number;
  draft: number;
  active: number;
  completed: number;
  cancelled: number;
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalReplies: number;
}> {
  try {
    const campaigns = await getCampaigns();

    type StatusKey = 'draft' | 'active' | 'completed' | 'cancelled';
    type Stats = {
      total: number;
      totalSent: number;
      totalDelivered: number;
      totalRead: number;
      totalReplies: number;
    } & Record<StatusKey, number>;

    const initial: Stats = {
      total: 0,
      draft: 0,
      active: 0,
      completed: 0,
      cancelled: 0,
      totalSent: 0,
      totalDelivered: 0,
      totalRead: 0,
      totalReplies: 0,
    };

    const stats = campaigns.reduce<Stats>((acc, campaign) => {
      acc.total += 1;
      const statusKey = campaign.status.toLowerCase() as StatusKey;
      acc[statusKey] += 1;
      acc.totalSent += campaign.metrics.sent;
      acc.totalDelivered += campaign.metrics.delivered;
      acc.totalRead += campaign.metrics.read;
      acc.totalReplies += campaign.metrics.replies;
      return acc;
    }, initial);

    return stats;
  } catch (error) {
    console.error('Error getting campaign stats:', error);
    throw error;
  }
}

/**
 * Validate campaign before creation
 */
export function validateCampaign(campaign: Omit<Campaign, 'id' | 'metrics' | 'createdAt' | 'updatedAt'>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required fields
  if (!campaign.name || campaign.name.length < 3) {
    errors.push('Campaign name must be at least 3 characters long');
  }
  
  if (!campaign.description || campaign.description.length < 10) {
    errors.push('Description must be at least 10 characters long');
  }
  
  if (!campaign.content.message || campaign.content.message.length < 1) {
    errors.push('Message content is required');
  }
  
  if (campaign.content.message.length > 1024) {
    errors.push('Message content exceeds 1024 character limit');
  }
  
  // Check schedule
  if (campaign.schedule.startDate < new Date()) {
    errors.push('Start date cannot be in the past');
  }
  
  if (campaign.schedule.endDate && campaign.schedule.endDate <= campaign.schedule.startDate) {
    errors.push('End date must be after start date');
  }
  
  // Check target audience
  if (campaign.targetAudience.estimatedReach <= 0) {
    errors.push('Estimated reach must be greater than 0');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Estimate campaign reach based on filters
 */
export async function estimateCampaignReach(filters: Campaign['targetAudience']['filters']): Promise<number> {
  try {
    // This would typically query the customer database with filters
    // For now, return a placeholder estimate
    let estimate = 1000; // Base estimate
    
    if (filters.status && filters.status.length > 0) {
      estimate *= 0.7; // Assume 70% match for status filter
    }
    
    if (filters.channels && filters.channels.length > 0) {
      estimate *= 0.8; // Assume 80% match for channel filter
    }
    
    if (filters.lastActivity) {
      estimate *= 0.6; // Assume 60% match for activity filter
    }
    
    return Math.round(estimate);
  } catch (error) {
    console.error('Error estimating campaign reach:', error);
    return 0;
  }
}
