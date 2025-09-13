/**
 * Messaging Service
 * Core service for handling WhatsApp and Instagram messaging
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
  limit, 
  startAfter,
  updateDoc,
  addDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { 
  Customer, 
  Thread, 
  Message, 
  SendMessageRequest, 
  SendMessageResponse,
  ThreadListRequest,
  ThreadListResponse,
  MessageListRequest,
  MessageListResponse
} from './types';
import { guardSend } from './policy';
import { assertTemplateVars } from './templates';
import { 
  sendWhatsAppText, 
  sendWhatsAppTemplate, 
  sendInstagramReply,
  logGraphApiUsage
} from './graph';
import { notifyNewMessage, checkSLACompliance } from './notifications';

export class MessagingService {
  private phoneNumberId: string;

  constructor() {
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    if (!this.phoneNumberId) {
      console.warn('WHATSAPP_PHONE_NUMBER_ID not configured');
    }
  }

  /**
   * Send a message (text or template)
   */
  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    try {
      // Get thread and validate
      const thread = await this.getThread(request.threadId);
      if (!thread) {
        return { success: false, error: 'Thread not found' };
      }

      // Apply messaging policy
      const now = new Date();
      guardSend({
        now,
        lastInboundAt: thread.lastInboundAt,
        adClickAt: thread.adClickAt,
        payload: request
      });

      // Validate template if provided
      if (request.template) {
        assertTemplateVars(request.template.name, request.template.vars);
      }

      let providerId: string | undefined;

      // Send based on channel
      if (request.channel === 'whatsapp') {
        const customer = await this.getCustomer(thread.customerId);
        if (!customer?.phone) {
          return { success: false, error: 'Customer phone number not found' };
        }

        if (request.template) {
          const response = await sendWhatsAppTemplate(
            this.phoneNumberId,
            customer.phone,
            request.template.name,
            request.template.lang,
            this.buildTemplateComponents(request.template.vars)
          );
          
          if (response.error) {
            logGraphApiUsage('sendWhatsAppTemplate', 'POST', false, response.error.message);
            return { success: false, error: response.error.message };
          }
          
          providerId = response.data?.messages?.[0]?.id;
        } else if (request.text) {
          const response = await sendWhatsAppText(
            this.phoneNumberId,
            customer.phone,
            request.text
          );
          
          if (response.error) {
            logGraphApiUsage('sendWhatsAppText', 'POST', false, response.error.message);
            return { success: false, error: response.error.message };
          }
          
          providerId = response.data?.messages?.[0]?.id;
        }
      } else if (request.channel === 'instagram') {
        // For Instagram, we need the conversation ID
        // This would typically be stored in the thread metadata
        const conversationId = thread.meta?.conversationId;
        if (!conversationId) {
          return { success: false, error: 'Instagram conversation ID not found' };
        }

        if (request.text) {
          const response = await sendInstagramReply(conversationId, request.text);
          
          if (response.error) {
            logGraphApiUsage('sendInstagramReply', 'POST', false, response.error.message);
            return { success: false, error: response.error.message };
          }
          
          providerId = response.data?.message_id;
        }
      }

      // Store message in database
      const messageId = await this.storeOutboundMessage(request, providerId);

      // Update thread
      await this.updateThreadLastMessage(request.threadId);

      logGraphApiUsage(`send${request.channel.charAt(0).toUpperCase() + request.channel.slice(1)}`, 'POST', true);

      return {
        success: true,
        messageId,
        providerId
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get threads with filtering and pagination
   */
  async getThreads(request: ThreadListRequest): Promise<ThreadListResponse> {
    try {
      const threadsRef = collection(db, 'threads');
      let q = query(threadsRef);

      // Apply filters
      if (request.status) {
        q = query(q, where('status', '==', request.status));
      }
      if (request.assignee) {
        q = query(q, where('assignee', '==', request.assignee));
      }
      if (request.channels && request.channels.length > 0) {
        q = query(q, where('channels', 'array-contains-any', request.channels));
      }

      // Order by last message time
      q = query(q, orderBy('lastMessageAt', 'desc'));

      // Apply pagination
      if (request.limit) {
        q = query(q, limit(request.limit));
      }

      const snapshot = await getDocs(q);
      const threads: Thread[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        threads.push({
          id: doc.id,
          ...data,
          lastMessageAt: data.lastMessageAt?.toDate(),
          lastInboundAt: data.lastInboundAt?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as Thread);
      });

      return {
        threads,
        total: threads.length,
        hasMore: false // TODO: Implement proper pagination
      };
    } catch (error) {
      console.error('Error getting threads:', error);
      throw error;
    }
  }

  /**
   * Get messages for a thread
   */
  async getMessages(request: MessageListRequest): Promise<MessageListResponse> {
    try {
      const messagesRef = collection(db, 'threads', request.threadId, 'messages');
      let q = query(messagesRef, orderBy('sentAt', 'asc'));

      if (request.limit) {
        q = query(q, limit(request.limit));
      }

      const snapshot = await getDocs(q);
      const messages: Message[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          ...data,
          sentAt: data.sentAt?.toDate(),
          deliveredAt: data.deliveredAt?.toDate(),
          readAt: data.readAt?.toDate(),
          createdAt: data.createdAt?.toDate()
        } as Message);
      });

      return {
        messages,
        total: messages.length,
        hasMore: false // TODO: Implement proper pagination
      };
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }

  /**
   * Get a single thread
   */
  async getThread(threadId: string): Promise<Thread | null> {
    try {
      const threadRef = doc(db, 'threads', threadId);
      const threadSnap = await getDoc(threadRef);

      if (!threadSnap.exists()) {
        return null;
      }

      const data = threadSnap.data();
      return {
        id: threadSnap.id,
        ...data,
        lastMessageAt: data.lastMessageAt?.toDate(),
        lastInboundAt: data.lastInboundAt?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as Thread;
    } catch (error) {
      console.error('Error getting thread:', error);
      throw error;
    }
  }

  /**
   * Get a single customer
   */
  async getCustomer(customerId: string): Promise<Customer | null> {
    try {
      const customerRef = doc(db, 'customers', customerId);
      const customerSnap = await getDoc(customerRef);

      if (!customerSnap.exists()) {
        return null;
      }

      const data = customerSnap.data();
      return {
        id: customerSnap.id,
        ...data,
        adClickAt: data.adClickAt?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as Customer;
    } catch (error) {
      console.error('Error getting customer:', error);
      throw error;
    }
  }

  /**
   * Store outbound message in database
   */
  private async storeOutboundMessage(
    request: SendMessageRequest,
    providerId?: string
  ): Promise<string> {
    const messageData = {
      threadId: request.threadId,
      dir: 'out' as const,
      channel: request.channel,
      body: {
        text: request.text || '',
        attachments: []
      },
      provider: {
        ...(request.channel === 'whatsapp' && providerId && {
          wa: {
            wamid: providerId,
            delivery: 'sent' as const
          }
        }),
        ...(request.channel === 'instagram' && providerId && {
          ig: {
            mid: providerId,
            delivery: 'sent' as const
          }
        })
      },
      sentAt: serverTimestamp(),
      createdAt: serverTimestamp()
    };

    const messageRef = await addDoc(
      collection(db, 'threads', request.threadId, 'messages'),
      messageData
    );

    return messageRef.id;
  }

  /**
   * Update thread's last message timestamp
   */
  private async updateThreadLastMessage(threadId: string): Promise<void> {
    const threadRef = doc(db, 'threads', threadId);
    await updateDoc(threadRef, {
      lastMessageAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  /**
   * Build template components for WhatsApp
   */
  private buildTemplateComponents(vars: Record<string, string>): any[] {
    const components = [];
    
    // Add body component with variables (including fallbacks for missing values)
    const bodyParams = Object.entries(vars).map(([key, value]) => ({
      type: 'text',
      text: value && value.trim() ? value : this.getFallbackValue(key)
    }));

    if (bodyParams.length > 0) {
      components.push({
        type: 'body',
        parameters: bodyParams
      });
    }

    return components;
  }

  /**
   * Get fallback value for missing variables
   */
  private getFallbackValue(varName: string): string {
    // Check if this is a customer name variable (numbered or named)
    const isCustomerName = varName === '1' || 
      varName.toLowerCase().includes('customer_name') ||
      varName.toLowerCase().includes('user_name') ||
      varName.toLowerCase().includes('name') ||
      varName.toLowerCase().includes('first_name');
    
    if (isCustomerName) {
      return "Sir/Ma'am";
    }
    
    // For other variables, return empty string
    return '';
  }
}

// Export singleton instance
export const messagingService = new MessagingService();
