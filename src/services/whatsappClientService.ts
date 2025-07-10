export interface WhatsAppContact {
  id: string;
  name: string;
  number: string;
  avatar?: string;
  status: 'online' | 'offline';
  lastSeen?: Date;
}

export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  body: string;
  timestamp: Date;
  type: 'text' | 'image' | 'video' | 'audio' | 'document';
  status: 'sending' | 'delivered' | 'read';
  isFromMe: boolean;
}

export interface WhatsAppChat {
  id: string;
  name: string;
  number: string;
  avatar?: string;
  status: 'online' | 'offline';
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  messages: WhatsAppMessage[];
}

class WhatsAppClientService {
  private messageCallbacks: ((message: WhatsAppMessage) => void)[] = [];
  private statusCallbacks: ((status: string) => void)[] = [];

  // API methods
  async connect(): Promise<void> {
    try {
      const response = await fetch('/api/whatsapp?action=connect', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to connect');
      }
    } catch (error) {
      console.error('Error connecting to WhatsApp:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      const response = await fetch('/api/whatsapp?action=disconnect', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to disconnect');
      }
    } catch (error) {
      console.error('Error disconnecting from WhatsApp:', error);
      throw error;
    }
  }

  async sendMessage(chatId: string, message: string): Promise<WhatsAppMessage> {
    try {
      const response = await fetch('/api/whatsapp?action=send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId, message }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async getStatus(): Promise<{ connected: boolean; qrCode: string | null }> {
    try {
      const response = await fetch('/api/whatsapp?action=status');
      if (!response.ok) {
        throw new Error('Failed to get status');
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting status:', error);
      return { connected: false, qrCode: null };
    }
  }

  async getChats(): Promise<WhatsAppChat[]> {
    try {
      const response = await fetch('/api/whatsapp?action=chats');
      if (!response.ok) {
        throw new Error('Failed to get chats');
      }
      const data = await response.json();
      return data.chats || [];
    } catch (error) {
      console.error('Error getting chats:', error);
      return [];
    }
  }

  async getChat(chatId: string): Promise<WhatsAppChat | undefined> {
    try {
      const response = await fetch(`/api/whatsapp?action=chat&chatId=${chatId}`);
      if (!response.ok) {
        throw new Error('Failed to get chat');
      }
      const data = await response.json();
      return data.chat;
    } catch (error) {
      console.error('Error getting chat:', error);
      return undefined;
    }
  }

  // Event listeners
  onMessage(callback: (message: WhatsAppMessage) => void): void {
    this.messageCallbacks.push(callback);
  }

  onStatus(callback: (status: string) => void): void {
    this.statusCallbacks.push(callback);
  }

  removeMessageListener(callback: (message: WhatsAppMessage) => void): void {
    this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
  }

  removeStatusListener(callback: (status: string) => void): void {
    this.statusCallbacks = this.statusCallbacks.filter(cb => cb !== callback);
  }

  // Simulate real-time updates (in a real app, you'd use WebSockets)
  startPolling() {
    const pollStatus = async () => {
      try {
        const status = await this.getStatus();
        if (status.connected) {
          this.statusCallbacks.forEach(callback => callback('ready'));
        } else if (status.qrCode) {
          this.statusCallbacks.forEach(callback => callback('qr_ready'));
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    // Poll every 2 seconds
    setInterval(pollStatus, 2000);
  }
}

// Create singleton instance
const whatsappClientService = new WhatsAppClientService();
export default whatsappClientService; 