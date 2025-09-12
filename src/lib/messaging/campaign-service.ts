/**
 * Campaign Service
 * Handles campaign creation, management, and execution
 */

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Campaign, 
  CampaignMessage, 
  Contact, 
  CreateCampaignRequest, 
  CampaignListRequest, 
  CampaignListResponse,
  ContactListRequest,
  ContactListResponse,
  CampaignStats,
  CampaignAnalyticsRequest,
  CampaignAnalytics,
  ChannelStats
} from './types';
import { messagingService } from './service';

export class CampaignService {
  /**
   * Create a new campaign
   */
  async createCampaign(request: CreateCampaignRequest, userId: string): Promise<Campaign> {
    try {
      // Get recipient count based on filters or contact IDs
      const recipientCount = await this.getRecipientCount(request.recipients);
      
      const campaign: Omit<Campaign, 'id'> = {
        name: request.name,
        description: request.description,
        type: request.type,
        channel: request.channel,
        template: request.template,
        recipients: {
          contactIds: request.recipients.contactIds || [],
          filters: request.recipients.filters || {},
          totalCount: recipientCount
        },
        status: 'draft',
        scheduledAt: request.scheduledAt,
        stats: {
          totalRecipients: recipientCount,
          sent: 0,
          delivered: 0,
          read: 0,
          failed: 0,
          pending: recipientCount,
          deliveryRate: 0,
          readRate: 0,
          failureRate: 0
        },
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'campaigns'), campaign);
      
      return {
        id: docRef.id,
        ...campaign
      };
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  }

  /**
   * Get campaigns with filtering and pagination
   */
  async getCampaigns(request: CampaignListRequest): Promise<CampaignListResponse> {
    try {
      const campaignsRef = collection(db, 'campaigns');
      let q = query(campaignsRef, orderBy('createdAt', 'desc'));

      // Apply filters
      if (request.status) {
        q = query(q, where('status', '==', request.status));
      }
      if (request.type) {
        q = query(q, where('type', '==', request.type));
      }
      if (request.channel) {
        q = query(q, where('channel', '==', request.channel));
      }
      if (request.createdBy) {
        q = query(q, where('createdBy', '==', request.createdBy));
      }

      // Apply pagination
      const limitCount = request.limit || 20;
      q = query(q, limit(limitCount));

      if (request.offset) {
        // For offset-based pagination, we'd need to implement cursor-based pagination
        // For now, we'll use limit only
      }

      const snapshot = await getDocs(q);
      const campaigns: Campaign[] = [];

      snapshot.forEach((doc) => {
        campaigns.push({
          id: doc.id,
          ...doc.data()
        } as Campaign);
      });

      return {
        campaigns,
        total: campaigns.length, // This would need to be calculated separately for accurate total
        hasMore: campaigns.length === limitCount
      };
    } catch (error) {
      console.error('Error getting campaigns:', error);
      throw error;
    }
  }

  /**
   * Get a single campaign by ID
   */
  async getCampaign(campaignId: string): Promise<Campaign | null> {
    try {
      const docRef = doc(db, 'campaigns', campaignId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Campaign;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting campaign:', error);
      throw error;
    }
  }

  /**
   * Update campaign status
   */
  async updateCampaignStatus(campaignId: string, status: Campaign['status']): Promise<void> {
    try {
      const docRef = doc(db, 'campaigns', campaignId);
      await updateDoc(docRef, {
        status,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating campaign status:', error);
      throw error;
    }
  }

  /**
   * Delete a campaign
   */
  async deleteCampaign(campaignId: string): Promise<void> {
    try {
      const docRef = doc(db, 'campaigns', campaignId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    }
  }

  /**
   * Execute a campaign (send messages to all recipients)
   */
  async executeCampaign(campaignId: string): Promise<void> {
    try {
      const campaign = await this.getCampaign(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
        throw new Error('Campaign cannot be executed in current status');
      }

      // Update campaign status to sending
      await this.updateCampaignStatus(campaignId, 'sending');

      // Get recipients
      const recipients = await this.getRecipients(campaign.recipients);
      
      // Create campaign messages
      const batch = writeBatch(db);
      const campaignMessages: CampaignMessage[] = [];

      for (const contact of recipients) {
        const campaignMessage: Omit<CampaignMessage, 'id'> = {
          campaignId,
          contactId: contact.id,
          channel: this.getContactChannel(contact, campaign.channel),
          status: 'pending',
          createdAt: new Date()
        };

        const messageRef = doc(collection(db, 'campaignMessages'));
        batch.set(messageRef, campaignMessage);
        
        campaignMessages.push({
          id: messageRef.id,
          ...campaignMessage
        });
      }

      await batch.commit();

      // Send messages (this would be done in background)
      await this.sendCampaignMessages(campaign, campaignMessages);

      // Update campaign status to sent
      await this.updateCampaignStatus(campaignId, 'sent');
      await this.updateCampaignStats(campaignId, { sentAt: new Date() });

    } catch (error) {
      console.error('Error executing campaign:', error);
      await this.updateCampaignStatus(campaignId, 'failed');
      throw error;
    }
  }

  /**
   * Get campaign statistics
   */
  async getCampaignStats(campaignId: string): Promise<CampaignStats> {
    try {
      const campaignMessagesRef = collection(db, 'campaignMessages');
      const q = query(campaignMessagesRef, where('campaignId', '==', campaignId));
      const snapshot = await getDocs(q);

      const stats: CampaignStats = {
        totalRecipients: 0,
        sent: 0,
        delivered: 0,
        read: 0,
        failed: 0,
        pending: 0,
        deliveryRate: 0,
        readRate: 0,
        failureRate: 0
      };

      snapshot.forEach((doc) => {
        const message = doc.data() as CampaignMessage;
        stats.totalRecipients++;
        
        switch (message.status) {
          case 'sent':
            stats.sent++;
            break;
          case 'delivered':
            stats.delivered++;
            break;
          case 'read':
            stats.read++;
            break;
          case 'failed':
            stats.failed++;
            break;
          case 'pending':
            stats.pending++;
            break;
        }
      });

      // Calculate rates
      if (stats.totalRecipients > 0) {
        stats.deliveryRate = (stats.delivered / stats.totalRecipients) * 100;
        stats.readRate = (stats.read / stats.totalRecipients) * 100;
        stats.failureRate = (stats.failed / stats.totalRecipients) * 100;
      }

      return stats;
    } catch (error) {
      console.error('Error getting campaign stats:', error);
      throw error;
    }
  }

  /**
   * Get a specific contact by ID
   */
  async getContact(contactId: string): Promise<Contact | null> {
    try {
      const contactRef = doc(db, 'contacts', contactId);
      const contactSnap = await getDoc(contactRef);
      
      if (!contactSnap.exists()) {
        return null;
      }
      
      return {
        id: contactSnap.id,
        ...contactSnap.data()
      } as Contact;
    } catch (error) {
      console.error('Error getting contact:', error);
      throw error;
    }
  }

  /**
   * Update a specific contact
   */
  async updateContact(contactId: string, contactData: Partial<Contact>): Promise<Contact> {
    try {
      const contactRef = doc(db, 'contacts', contactId);
      
      // Check if contact exists
      const contactSnap = await getDoc(contactRef);
      if (!contactSnap.exists()) {
        throw new Error('Contact not found');
      }
      
      // Prepare update data
      const updateData = {
        ...contactData,
        updatedAt: new Date()
      };
      
      // Update contact
      await updateDoc(contactRef, updateData);
      
      // Return updated contact
      const updatedSnap = await getDoc(contactRef);
      return {
        id: updatedSnap.id,
        ...updatedSnap.data()
      } as Contact;
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  }

  /**
   * Delete a specific contact
   */
  async deleteContact(contactId: string): Promise<void> {
    try {
      const contactRef = doc(db, 'contacts', contactId);
      
      // Check if contact exists
      const contactSnap = await getDoc(contactRef);
      if (!contactSnap.exists()) {
        throw new Error('Contact not found');
      }
      
      // Delete contact
      await deleteDoc(contactRef);
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  }

  /**
   * Get contacts with filtering
   */
  async getContacts(request: ContactListRequest): Promise<ContactListResponse> {
    try {
      const contactsRef = collection(db, 'contacts');
      let q = query(contactsRef, orderBy('createdAt', 'desc'));

      // Apply filters
      if (request.status) {
        q = query(q, where('status', '==', request.status));
      }
      if (request.channels && request.channels.length > 0) {
        // This would need to be implemented with array-contains-any
        // For now, we'll filter in memory
      }

      const limitCount = request.limit || 50;
      q = query(q, limit(limitCount));

      const snapshot = await getDocs(q);
      const contacts: Contact[] = [];

      snapshot.forEach((doc) => {
        const contact = {
          id: doc.id,
          ...doc.data()
        } as Contact;

        // Apply additional filters in memory
        if (request.tags && request.tags.length > 0) {
          if (!request.tags.some(tag => contact.tags.includes(tag))) {
            return;
          }
        }

        if (request.groups && request.groups.length > 0) {
          if (!request.groups.some(group => contact.groups.includes(group))) {
            return;
          }
        }

        if (request.search) {
          const searchLower = request.search.toLowerCase();
          if (!contact.name.toLowerCase().includes(searchLower) &&
              !contact.email?.toLowerCase().includes(searchLower) &&
              !contact.phone?.includes(searchLower)) {
            return;
          }
        }

        contacts.push(contact);
      });

      return {
        contacts,
        total: contacts.length,
        hasMore: contacts.length === limitCount
      };
    } catch (error) {
      console.error('Error getting contacts:', error);
      throw error;
    }
  }

  /**
   * Create a new contact
   */
  async createContact(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact> {
    try {
      const newContact: Omit<Contact, 'id'> = {
        ...contact,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'contacts'), newContact);
      
      return {
        id: docRef.id,
        ...newContact
      };
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  }

  /**
   * Get recipient count based on filters or contact IDs
   */
  private async getRecipientCount(recipients: CreateCampaignRequest['recipients']): Promise<number> {
    if (recipients.contactIds && recipients.contactIds.length > 0) {
      return recipients.contactIds.length;
    }

    if (recipients.filters) {
      const request: ContactListRequest = {
        tags: recipients.filters.tags,
        groups: recipients.filters.groups,
        status: recipients.filters.status?.[0], // Take first status
        channels: recipients.filters.channels,
        limit: 1000 // Get a large number to count
      };

      const result = await this.getContacts(request);
      return result.total;
    }

    return 0;
  }

  /**
   * Get recipients based on campaign configuration
   */
  private async getRecipients(recipients: Campaign['recipients']): Promise<Contact[]> {
    if (recipients.contactIds.length > 0) {
      // Get specific contacts by IDs
      const contacts: Contact[] = [];
      for (const contactId of recipients.contactIds) {
        const docRef = doc(db, 'contacts', contactId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          contacts.push({
            id: docSnap.id,
            ...docSnap.data()
          } as Contact);
        }
      }
      return contacts;
    }

    // Get contacts by filters
    const request: ContactListRequest = {
      tags: recipients.filters.tags,
      groups: recipients.filters.groups,
      status: recipients.filters.status?.[0],
      channels: recipients.filters.channels,
      limit: 1000
    };

    const result = await this.getContacts(request);
    return result.contacts;
  }

  /**
   * Get the appropriate channel for a contact
   */
  private getContactChannel(contact: Contact, campaignChannel: Campaign['channel']): 'whatsapp' | 'instagram' | 'email' {
    if (campaignChannel === 'multi') {
      // Prefer WhatsApp, then Instagram, then email
      if (contact.channels.whatsapp) return 'whatsapp';
      if (contact.channels.instagram) return 'instagram';
      if (contact.channels.email) return 'email';
      return 'whatsapp'; // Default fallback
    }

    return campaignChannel as 'whatsapp' | 'instagram' | 'email';
  }

  /**
   * Send campaign messages
   */
  private async sendCampaignMessages(campaign: Campaign, messages: CampaignMessage[]): Promise<void> {
    // This would be implemented to send messages in batches
    // For now, we'll just update the status
    console.log(`Sending ${messages.length} campaign messages for campaign ${campaign.id}`);
    
    // In a real implementation, this would:
    // 1. Send messages in batches to avoid rate limits
    // 2. Update message statuses as they're sent
    // 3. Handle failures and retries
    // 4. Update campaign statistics
  }

  /**
   * Update campaign statistics
   */
  private async updateCampaignStats(campaignId: string, updates: Partial<Campaign>): Promise<void> {
    try {
      const docRef = doc(db, 'campaigns', campaignId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating campaign stats:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive campaign analytics
   */
  async getCampaignAnalytics(request: CampaignAnalyticsRequest): Promise<CampaignAnalytics> {
    try {
      const { period, campaignId, channel, status } = request;
      
      // Calculate date range based on period
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Build query for campaigns
      let campaignsQuery = query(
        collection(db, 'campaigns'),
        where('createdAt', '>=', startDate),
        where('createdAt', '<=', endDate)
      );

      if (campaignId) {
        campaignsQuery = query(campaignsQuery, where('id', '==', campaignId));
      }
      if (channel) {
        campaignsQuery = query(campaignsQuery, where('channel', '==', channel));
      }
      if (status) {
        campaignsQuery = query(campaignsQuery, where('status', '==', status));
      }

      const campaignsSnapshot = await getDocs(campaignsQuery);
      const campaigns = campaignsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Campaign[];

      // Calculate overview stats
      const totalCampaigns = campaigns.length;
      const activeCampaigns = campaigns.filter(c => c.status === 'sending' || c.status === 'scheduled').length;
      const completedCampaigns = campaigns.filter(c => c.status === 'sent').length;
      
      const totalRecipients = campaigns.reduce((sum, c) => sum + (c.recipients?.totalCount || 0), 0);
      const totalSent = campaigns.reduce((sum, c) => sum + (c.stats?.sent || 0), 0);
      const totalDelivered = campaigns.reduce((sum, c) => sum + (c.stats?.delivered || 0), 0);
      const totalRead = campaigns.reduce((sum, c) => sum + (c.stats?.read || 0), 0);
      const totalFailed = campaigns.reduce((sum, c) => sum + (c.stats?.failed || 0), 0);
      
      const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
      const readRate = totalDelivered > 0 ? (totalRead / totalDelivered) * 100 : 0;
      const failureRate = totalSent > 0 ? (totalFailed / totalSent) * 100 : 0;

      // Calculate channel breakdown
      const channelBreakdown = {
        whatsapp: this.calculateChannelStats(campaigns, 'whatsapp'),
        instagram: this.calculateChannelStats(campaigns, 'instagram'),
        email: this.calculateChannelStats(campaigns, 'email')
      };

      // Get top performing campaigns
      const topCampaigns = campaigns
        .filter(c => c.stats && c.stats.sent > 0)
        .sort((a, b) => (b.stats?.deliveryRate || 0) - (a.stats?.deliveryRate || 0))
        .slice(0, 5)
        .map(c => ({
          id: c.id,
          name: c.name,
          type: c.type,
          channel: c.channel,
          recipients: c.recipients?.totalCount || 0,
          sent: c.stats?.sent || 0,
          delivered: c.stats?.delivered || 0,
          read: c.stats?.read || 0,
          failed: c.stats?.failed || 0,
          deliveryRate: c.stats?.deliveryRate || 0,
          readRate: c.stats?.readRate || 0
        }));

      // Generate trends data (simplified - in real implementation, you'd group by date)
      const trends = this.generateTrendsData(campaigns, period);

      // Generate insights
      const insights = this.generateInsights(campaigns, channelBreakdown);

      return {
        overview: {
          totalCampaigns,
          activeCampaigns,
          completedCampaigns,
          totalRecipients,
          totalSent,
          totalDelivered,
          totalRead,
          totalFailed,
          deliveryRate: Math.round(deliveryRate * 100) / 100,
          readRate: Math.round(readRate * 100) / 100,
          failureRate: Math.round(failureRate * 100) / 100
        },
        performance: {
          period,
          campaigns: totalCampaigns,
          sent: totalSent,
          delivered: totalDelivered,
          read: totalRead,
          failed: totalFailed,
          deliveryRate: Math.round(deliveryRate * 100) / 100,
          readRate: Math.round(readRate * 100) / 100,
          failureRate: Math.round(failureRate * 100) / 100
        },
        channelBreakdown,
        topCampaigns,
        trends,
        insights
      };

    } catch (error) {
      console.error('Error getting campaign analytics:', error);
      throw error;
    }
  }

  /**
   * Calculate stats for a specific channel
   */
  private calculateChannelStats(campaigns: Campaign[], channel: string): ChannelStats {
    const channelCampaigns = campaigns.filter(c => c.channel === channel);
    
    const campaignCount = channelCampaigns.length;
    const sent = channelCampaigns.reduce((sum, c) => sum + (c.stats?.sent || 0), 0);
    const delivered = channelCampaigns.reduce((sum, c) => sum + (c.stats?.delivered || 0), 0);
    const read = channelCampaigns.reduce((sum, c) => sum + (c.stats?.read || 0), 0);
    const failed = channelCampaigns.reduce((sum, c) => sum + (c.stats?.failed || 0), 0);
    
    const deliveryRate = sent > 0 ? (delivered / sent) * 100 : 0;
    const readRate = delivered > 0 ? (read / delivered) * 100 : 0;
    const failureRate = sent > 0 ? (failed / sent) * 100 : 0;

    return {
      campaigns: campaignCount,
      sent,
      delivered,
      read,
      failed,
      deliveryRate: Math.round(deliveryRate * 100) / 100,
      readRate: Math.round(readRate * 100) / 100,
      failureRate: Math.round(failureRate * 100) / 100
    };
  }

  /**
   * Generate trends data for the specified period
   */
  private generateTrendsData(campaigns: Campaign[], period: string) {
    // Simplified implementation - in real scenario, you'd group by actual dates
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const trends = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // For demo purposes, distribute campaign data across days
      const dayCampaigns = campaigns.filter(c => {
        const campaignDate = new Date(c.createdAt);
        return campaignDate.toDateString() === date.toDateString();
      });
      
      const sent = dayCampaigns.reduce((sum, c) => sum + (c.stats?.sent || 0), 0);
      const delivered = dayCampaigns.reduce((sum, c) => sum + (c.stats?.delivered || 0), 0);
      const read = dayCampaigns.reduce((sum, c) => sum + (c.stats?.read || 0), 0);
      const failed = dayCampaigns.reduce((sum, c) => sum + (c.stats?.failed || 0), 0);
      
      trends.push({
        date: date.toISOString().split('T')[0],
        campaigns: dayCampaigns.length,
        sent,
        delivered,
        read,
        failed
      });
    }
    
    return trends;
  }

  /**
   * Generate insights and recommendations
   */
  private generateInsights(campaigns: Campaign[], channelBreakdown: any) {
    const bestPerformingChannel = Object.entries(channelBreakdown)
      .sort(([,a], [,b]) => (b as ChannelStats).deliveryRate - (a as ChannelStats).deliveryRate)[0][0];
    
    const bestPerformingCampaign = campaigns
      .filter(c => c.stats && c.stats.sent > 0)
      .sort((a, b) => (b.stats?.deliveryRate || 0) - (a.stats?.deliveryRate || 0))[0]?.name || 'N/A';
    
    const averageDeliveryRate = campaigns.length > 0 
      ? campaigns.reduce((sum, c) => sum + (c.stats?.deliveryRate || 0), 0) / campaigns.length 
      : 0;
    
    const averageReadRate = campaigns.length > 0 
      ? campaigns.reduce((sum, c) => sum + (c.stats?.readRate || 0), 0) / campaigns.length 
      : 0;
    
    // Calculate costs (simplified - in real implementation, you'd have actual cost data)
    const totalSent = campaigns.reduce((sum, c) => sum + (c.stats?.sent || 0), 0);
    const totalCost = totalSent * 0.05; // $0.05 per message
    const costPerMessage = totalSent > 0 ? totalCost / totalSent : 0;
    
    const recommendations = [];
    if (averageDeliveryRate < 80) {
      recommendations.push('Consider improving message content and timing for better delivery rates');
    }
    if (averageReadRate < 60) {
      recommendations.push('Optimize message content and subject lines to increase read rates');
    }
    if (channelBreakdown.whatsapp.deliveryRate > channelBreakdown.instagram.deliveryRate) {
      recommendations.push('WhatsApp shows better performance - consider focusing more campaigns on this channel');
    }
    if (recommendations.length === 0) {
      recommendations.push('Campaigns are performing well! Consider scaling successful campaigns');
    }
    
    return {
      bestPerformingChannel,
      bestPerformingCampaign,
      averageDeliveryRate: Math.round(averageDeliveryRate * 100) / 100,
      averageReadRate: Math.round(averageReadRate * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      costPerMessage: Math.round(costPerMessage * 100) / 100,
      recommendations
    };
  }
}

export const campaignService = new CampaignService();
