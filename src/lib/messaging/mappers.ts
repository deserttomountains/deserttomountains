/**
 * Inbound Message Mappers
 * Converts webhook data to internal data models with idempotency
 */

import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { 
  Customer, 
  Thread, 
  Message, 
  WhatsAppWebhookEvent,
  InstagramWebhookEvent
} from './types';
import { notifyNewMessage, checkSLACompliance } from './notifications';

export interface MappedData {
  customer: Customer;
  thread: Thread;
  message: Message;
  ids: {
    wamid?: string;
    mid?: string;
  };
}

/**
 * Map WhatsApp inbound message to internal format
 */
export async function mapWhatsAppInbound(data: {
  message: any;
  metadata: any;
  contacts: any[];
}): Promise<MappedData | null> {
  try {
    const { message, metadata, contacts } = data;
    
    // Check idempotency first
    const isDuplicate = await checkIdempotency('whatsapp', message.id);
    if (isDuplicate) {
      console.log('Duplicate WhatsApp message ignored:', message.id);
      return null;
    }
    
    // Extract customer info
    const contact = contacts.find(c => c.wa_id === message.from);
    const customerName = contact?.profile?.name || 'Unknown Customer';
    
    // Create or update customer
    const customer = await getOrCreateCustomer({
      phone: message.from,
      name: customerName,
      channels: ['whatsapp']
    });
    
    // Create or update thread
    const thread = await getOrCreateThread({
      customerId: customer.id,
      channels: ['whatsapp'],
      lastInboundAt: new Date(parseInt(message.timestamp) * 1000)
    });
    
    // Create message
    const messageData = {
      threadId: thread.id,
      dir: 'in' as const,
      channel: 'whatsapp' as const,
      body: {
        text: message.text?.body || '',
        attachments: message.image || message.document ? [{
          type: message.image ? 'image' : 'document',
          url: '', // Would need to download from WhatsApp API
          filename: message.document?.filename,
          size: message.document?.sha256 ? 0 : undefined,
          mimeType: message.image?.mime_type || message.document?.mime_type
        }] : []
      },
      provider: {
        wa: {
          wamid: message.id,
          delivery: 'delivered' as const
        }
      },
      sentAt: new Date(parseInt(message.timestamp) * 1000),
      createdAt: serverTimestamp()
    };
    
    const messageRef = await addDoc(
      collection(db, 'threads', thread.id, 'messages'),
      messageData
    );
    
    // Mark as seen for idempotency
    await markAsSeen('whatsapp', message.id);
    
    // Update thread
    await updateThreadLastInbound(thread.id);
    
    // Create notification for new message
    await notifyNewMessage(
      thread.id,
      customer.id,
      messageRef.id,
      customerName,
      message.text?.body || 'New message'
    );
    
    // Check SLA compliance
    await checkSLACompliance(thread.id);
    
    return {
      customer,
      thread,
      message: {
        id: messageRef.id,
        ...messageData,
        sentAt: new Date(parseInt(message.timestamp) * 1000),
        createdAt: new Date()
      } as Message,
      ids: {
        wamid: message.id
      }
    };
  } catch (error) {
    console.error('Error mapping WhatsApp inbound:', error);
    return null;
  }
}

/**
 * Map Instagram inbound message to internal format
 */
export async function mapInstagramInbound(data: {
  messaging: any;
  entry: any;
}): Promise<MappedData | null> {
  try {
    const { messaging, entry } = data;
    const message = messaging.message;
    
    // Check idempotency first
    const isDuplicate = await checkIdempotency('instagram', message.mid);
    if (isDuplicate) {
      console.log('Duplicate Instagram message ignored:', message.mid);
      return null;
    }
    
    // Create or update customer
    const customer = await getOrCreateCustomer({
      igHandle: entry.id,
      name: `Instagram User ${entry.id.slice(-6)}`,
      channels: ['instagram']
    });
    
    // Create or update thread
    const thread = await getOrCreateThread({
      customerId: customer.id,
      channels: ['instagram'],
      lastInboundAt: new Date(messaging.timestamp * 1000)
    });
    
    // Create message
    const messageData = {
      threadId: thread.id,
      dir: 'in' as const,
      channel: 'instagram' as const,
      body: {
        text: message.text || '',
        attachments: message.attachments ? message.attachments.map((att: any) => ({
          type: att.type,
          url: att.payload.url,
          filename: undefined,
          size: undefined,
          mimeType: undefined
        })) : []
      },
      provider: {
        ig: {
          mid: message.mid,
          delivery: 'delivered' as const
        }
      },
      sentAt: new Date(messaging.timestamp * 1000),
      createdAt: serverTimestamp()
    };
    
    const messageRef = await addDoc(
      collection(db, 'threads', thread.id, 'messages'),
      messageData
    );
    
    // Mark as seen for idempotency
    await markAsSeen('instagram', message.mid);
    
    // Update thread
    await updateThreadLastInbound(thread.id);
    
    // Create notification for new message
    await notifyNewMessage(
      thread.id,
      customer.id,
      messageRef.id,
      customer.name,
      message.text || 'New message'
    );
    
    // Check SLA compliance
    await checkSLACompliance(thread.id);
    
    return {
      customer,
      thread,
      message: {
        id: messageRef.id,
        ...messageData,
        sentAt: new Date(messaging.timestamp * 1000),
        createdAt: new Date()
      } as Message,
      ids: {
        mid: message.mid
      }
    };
  } catch (error) {
    console.error('Error mapping Instagram inbound:', error);
    return null;
  }
}

/**
 * Check if message has already been processed (idempotency)
 */
async function checkIdempotency(channel: 'whatsapp' | 'instagram', providerId: string): Promise<boolean> {
  try {
    const seenRef = doc(db, 'providerSeen', `${channel}_${providerId}`);
    const seenSnap = await getDoc(seenRef);
    return seenSnap.exists();
  } catch (error) {
    console.error('Error checking idempotency:', error);
    return false;
  }
}

/**
 * Mark message as seen for idempotency
 */
async function markAsSeen(channel: 'whatsapp' | 'instagram', providerId: string): Promise<void> {
  try {
    const seenRef = doc(db, 'providerSeen', `${channel}_${providerId}`);
    await setDoc(seenRef, {
      providerId,
      channel,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error marking as seen:', error);
  }
}

/**
 * Get or create customer
 */
async function getOrCreateCustomer(data: {
  phone?: string;
  igHandle?: string;
  name: string;
  channels: ('whatsapp' | 'instagram')[];
}): Promise<Customer> {
  try {
    let customerId: string | null = null;
    
    // Try to find existing customer by phone or IG handle
    if (data.phone) {
      const phoneQuery = query(
        collection(db, 'customers'),
        where('phone', '==', data.phone)
      );
      const phoneSnap = await getDocs(phoneQuery);
      if (!phoneSnap.empty) {
        customerId = phoneSnap.docs[0].id;
      }
    }
    
    if (!customerId && data.igHandle) {
      const igQuery = query(
        collection(db, 'customers'),
        where('igHandle', '==', data.igHandle)
      );
      const igSnap = await getDocs(igQuery);
      if (!igSnap.empty) {
        customerId = igSnap.docs[0].id;
      }
    }
    
    if (customerId) {
      // Update existing customer
      const customerRef = doc(db, 'customers', customerId);
      await updateDoc(customerRef, {
        channels: data.channels,
        updatedAt: serverTimestamp()
      });
      
      const customerSnap = await getDoc(customerRef);
      const customerData = customerSnap.data();
      return {
        id: customerId,
        ...customerData,
        adClickAt: customerData?.adClickAt?.toDate(),
        createdAt: customerData?.createdAt?.toDate(),
        updatedAt: customerData?.updatedAt?.toDate()
      } as Customer;
    } else {
      // Create new customer
      const customerData = {
        name: data.name,
        phone: data.phone,
        igHandle: data.igHandle,
        channels: data.channels,
        consent: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const customerRef = await addDoc(collection(db, 'customers'), customerData);
      return {
        id: customerRef.id,
        ...customerData,
        createdAt: new Date(),
        updatedAt: new Date()
      } as Customer;
    }
  } catch (error) {
    console.error('Error getting/creating customer:', error);
    throw error;
  }
}

/**
 * Get or create thread
 */
async function getOrCreateThread(data: {
  customerId: string;
  channels: ('whatsapp' | 'instagram')[];
  lastInboundAt: Date;
}): Promise<Thread> {
  try {
    // Try to find existing thread for this customer
    const threadQuery = query(
      collection(db, 'threads'),
      where('customerId', '==', data.customerId)
    );
    const threadSnap = await getDocs(threadQuery);
    
    if (!threadSnap.empty) {
      // Update existing thread
      const threadDoc = threadSnap.docs[0];
      await updateDoc(threadDoc.ref, {
        channels: data.channels,
        lastInboundAt: serverTimestamp(),
        unreadCount: (threadDoc.data().unreadCount || 0) + 1,
        updatedAt: serverTimestamp()
      });
      
      const updatedSnap = await getDoc(threadDoc.ref);
      const threadData = updatedSnap.data();
      return {
        id: threadDoc.id,
        ...threadData,
        lastMessageAt: threadData?.lastMessageAt?.toDate(),
        lastInboundAt: threadData?.lastInboundAt?.toDate(),
        createdAt: threadData?.createdAt?.toDate(),
        updatedAt: threadData?.updatedAt?.toDate()
      } as Thread;
    } else {
      // Create new thread
      const threadData = {
        customerId: data.customerId,
        channels: data.channels,
        status: 'open' as const,
        priority: 'medium' as const,
        lastMessageAt: serverTimestamp(),
        lastInboundAt: serverTimestamp(),
        unreadCount: 1,
        meta: {},
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const threadRef = await addDoc(collection(db, 'threads'), threadData);
      return {
        id: threadRef.id,
        ...threadData,
        lastMessageAt: new Date(),
        lastInboundAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      } as Thread;
    }
  } catch (error) {
    console.error('Error getting/creating thread:', error);
    throw error;
  }
}

/**
 * Update thread's last inbound timestamp
 */
async function updateThreadLastInbound(threadId: string): Promise<void> {
  try {
    const threadRef = doc(db, 'threads', threadId);
    await updateDoc(threadRef, {
      lastInboundAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating thread last inbound:', error);
  }
}
