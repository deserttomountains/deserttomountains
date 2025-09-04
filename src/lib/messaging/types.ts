/**
 * Messaging Data Models
 * Defines the structure for customers, threads, and messages
 */

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  igHandle?: string;
  channels: ('whatsapp' | 'instagram')[];
  consent: boolean;
  adClickAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Thread {
  id: string;
  customerId: string;
  channels: ('whatsapp' | 'instagram')[];
  status: 'open' | 'closed' | 'pending';
  assignee?: string;
  priority: 'low' | 'medium' | 'high';
  lastMessageAt: Date;
  lastInboundAt: Date;
  unreadCount: number;
  adClickAt?: Date;
  meta: {
    currentOrderId?: string;
    sourceCampaignId?: string;
    conversationId?: string; // Instagram conversation ID
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  threadId: string;
  dir: 'in' | 'out';
  channel: 'whatsapp' | 'instagram';
  body: {
    text: string;
    attachments?: MessageAttachment[];
  };
  provider: {
    wa?: {
      wamid: string;
      delivery: 'sent' | 'delivered' | 'read' | 'failed';
    };
    ig?: {
      mid: string;
      delivery: 'sent' | 'delivered' | 'read' | 'failed';
    };
  };
  sentAt: Date;
  deliveredAt?: Date;
  readAt?: Date;
  createdAt: Date;
}

export interface MessageAttachment {
  type: 'image' | 'document' | 'audio' | 'video';
  url: string;
  filename?: string;
  size?: number;
  mimeType?: string;
}

export interface ThreadNote {
  id: string;
  threadId: string;
  content: string;
  authorId: string;
  createdAt: Date;
}

export interface ProviderSeen {
  id: string;
  providerId: string; // wamid or mid
  channel: 'whatsapp' | 'instagram';
  createdAt: Date;
}

// API Types
export interface SendMessageRequest {
  channel: 'whatsapp' | 'instagram';
  threadId: string;
  text?: string;
  template?: {
    name: string;
    lang: string;
    vars: Record<string, string>;
  };
}

export interface SendMessageResponse {
  success: boolean;
  messageId?: string;
  providerId?: string; // wamid or mid
  error?: string;
}

export interface ThreadListRequest {
  status?: 'open' | 'closed' | 'pending';
  assignee?: string;
  channels?: ('whatsapp' | 'instagram')[];
  limit?: number;
  offset?: number;
}

export interface ThreadListResponse {
  threads: Thread[];
  total: number;
  hasMore: boolean;
}

export interface MessageListRequest {
  threadId: string;
  limit?: number;
  offset?: number;
}

export interface MessageListResponse {
  messages: Message[];
  total: number;
  hasMore: boolean;
}

// Webhook Types
export interface WhatsAppWebhookEvent {
  object: 'whatsapp_business_account';
  entry: WhatsAppEntry[];
}

export interface WhatsAppEntry {
  id: string;
  changes: WhatsAppChange[];
}

export interface WhatsAppChange {
  value: {
    messaging_product: 'whatsapp';
    metadata: {
      display_phone_number: string;
      phone_number_id: string;
    };
    contacts?: WhatsAppContact[];
    messages?: WhatsAppMessage[];
    statuses?: WhatsAppStatus[];
  };
  field: 'messages';
}

export interface WhatsAppContact {
  profile: {
    name: string;
  };
  wa_id: string;
}

export interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  type: 'text' | 'image' | 'document' | 'audio' | 'video';
  text?: {
    body: string;
  };
  image?: {
    id: string;
    mime_type: string;
    sha256: string;
    filename?: string;
  };
  document?: {
    id: string;
    filename: string;
    mime_type: string;
    sha256: string;
  };
}

export interface WhatsAppStatus {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
}

export interface InstagramWebhookEvent {
  object: 'instagram';
  entry: InstagramEntry[];
}

export interface InstagramEntry {
  id: string;
  time: number;
  messaging?: InstagramMessaging[];
  postback?: InstagramPostback[];
  reaction?: InstagramReaction[];
  delivery?: InstagramDelivery[];
  read?: InstagramRead[];
}

export interface InstagramMessaging {
  sender: {
    id: string;
  };
  recipient: {
    id: string;
  };
  timestamp: number;
  message?: {
    mid: string;
    text?: string;
    attachments?: InstagramAttachment[];
    quick_reply?: {
      payload: string;
    };
    reply_to?: {
      mid: string;
    };
  };
}

export interface InstagramAttachment {
  type: 'image' | 'video' | 'audio' | 'file';
  payload: {
    url: string;
  };
}

export interface InstagramPostback {
  sender: {
    id: string;
  };
  recipient: {
    id: string;
  };
  timestamp: number;
  postback: {
    payload: string;
    title: string;
  };
}

export interface InstagramReaction {
  sender: {
    id: string;
  };
  recipient: {
    id: string;
  };
  timestamp: number;
  reaction: {
    mid: string;
    action: 'react' | 'unreact';
    emoji: string;
  };
}

export interface InstagramDelivery {
  sender: {
    id: string;
  };
  recipient: {
    id: string;
  };
  delivery: {
    mids: string[];
    watermark: number;
  };
}

export interface InstagramRead {
  sender: {
    id: string;
  };
  recipient: {
    id: string;
  };
  read: {
    watermark: number;
  };
}
