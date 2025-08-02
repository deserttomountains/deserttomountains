import { WhatsAppBusinessChat, WhatsAppBusinessMessage, WhatsAppBusinessConfig } from './whatsappBusinessService';

class WhatsAppBusinessClientService {
  private baseUrl: string = '/api/whatsapp-business';
  private messageCallbacks: ((message: WhatsAppBusinessMessage) => void)[] = [];
  private statusCallbacks: ((status: string) => void)[] = [];
  private connectionStatus: string = 'disconnected';

  // Connection management
  public async connect(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'connect' })
      });

      if (!response.ok) {
        throw new Error('Failed to connect');
      }

      this.connectionStatus = 'connected';
      this.notifyStatus('connected');
    } catch (error) {
      console.error('Connection error:', error);
      this.connectionStatus = 'error';
      this.notifyStatus('error');
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disconnect' })
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect');
      }

      this.connectionStatus = 'disconnected';
      this.notifyStatus('disconnected');
    } catch (error) {
      console.error('Disconnection error:', error);
      throw error;
    }
  }

  public async getStatus(): Promise<{ connected: boolean; status: string }> {
    try {
      const response = await fetch(`${this.baseUrl}?action=status`);
      if (!response.ok) {
        throw new Error('Failed to get status');
      }
      return await response.json();
    } catch (error) {
      console.error('Status check error:', error);
      return { connected: false, status: 'error' };
    }
  }

  // Message sending
  public async sendMessage(phoneNumber: string, message: string): Promise<WhatsAppBusinessMessage> {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-message',
          phoneNumber,
          message
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      const result = await response.json();
      return result.message;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }

  public async sendTemplateMessage(
    phoneNumber: string, 
    templateName: string, 
    language: string = 'en_US',
    components?: any[]
  ): Promise<WhatsAppBusinessMessage> {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-template',
          phoneNumber,
          templateName,
          language,
          components
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send template message');
      }

      const result = await response.json();
      return result.message;
    } catch (error) {
      console.error('Send template message error:', error);
      throw error;
    }
  }

  // Chat management
  public async getChats(): Promise<WhatsAppBusinessChat[]> {
    try {
      const response = await fetch(`${this.baseUrl}?action=chats`);
      if (!response.ok) {
        throw new Error('Failed to get chats');
      }
      const result = await response.json();
      return result.chats || [];
    } catch (error) {
      console.error('Get chats error:', error);
      return [];
    }
  }

  public async getChat(chatId: string): Promise<WhatsAppBusinessChat | null> {
    try {
      const response = await fetch(`${this.baseUrl}?action=chat&chatId=${chatId}`);
      if (!response.ok) {
        throw new Error('Failed to get chat');
      }
      const result = await response.json();
      return result.chat || null;
    } catch (error) {
      console.error('Get chat error:', error);
      return null;
    }
  }

  // Business information
  public async getPhoneNumberInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}?action=phone-info`);
      if (!response.ok) {
        throw new Error('Failed to get phone number info');
      }
      const result = await response.json();
      return result.phoneInfo;
    } catch (error) {
      console.error('Get phone info error:', error);
      throw error;
    }
  }

  public async getBusinessProfile(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}?action=business-profile`);
      if (!response.ok) {
        throw new Error('Failed to get business profile');
      }
      const result = await response.json();
      return result.businessProfile;
    } catch (error) {
      console.error('Get business profile error:', error);
      throw error;
    }
  }

  // Load existing chats and conversation history
  public async loadExistingChats(): Promise<WhatsAppBusinessChat[]> {
    try {
      const response = await fetch(`${this.baseUrl}?action=load-existing-chats`);
      if (!response.ok) {
        throw new Error('Failed to load existing chats');
      }
      const result = await response.json();
      return result.chats || [];
    } catch (error) {
      console.error('Load existing chats error:', error);
      return [];
    }
  }

  // Get chat history for a specific conversation
  public async getChatHistory(phoneNumber: string, limit: number = 50): Promise<WhatsAppBusinessMessage[]> {
    try {
      const response = await fetch(`${this.baseUrl}?action=chat-history&phoneNumber=${phoneNumber}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to get chat history');
      }
      const result = await response.json();
      return result.messages || [];
    } catch (error) {
      console.error('Get chat history error:', error);
      return [];
    }
  }

  // Get contact information
  public async getContactInfo(phoneNumber: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}?action=contact-info&phoneNumber=${phoneNumber}`);
      if (!response.ok) {
        throw new Error('Failed to get contact info');
      }
      const result = await response.json();
      return result.contactInfo;
    } catch (error) {
      console.error('Get contact info error:', error);
      throw error;
    }
  }

  // Configuration
  public async updateConfig(config: Partial<WhatsAppBusinessConfig>): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-config',
          config
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update config');
      }
    } catch (error) {
      console.error('Update config error:', error);
      throw error;
    }
  }

  // Event listeners
  public onMessage(callback: (message: WhatsAppBusinessMessage) => void): void {
    this.messageCallbacks.push(callback);
  }

  public onStatus(callback: (status: string) => void): void {
    this.statusCallbacks.push(callback);
  }

  private notifyStatus(status: string): void {
    this.statusCallbacks.forEach(callback => callback(status));
  }

  public notifyMessage(message: WhatsAppBusinessMessage): void {
    this.messageCallbacks.forEach(callback => callback(message));
  }

  // Cleanup
  public removeMessageListener(callback: (message: WhatsAppBusinessMessage) => void): void {
    this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
  }

  public removeStatusListener(callback: (status: string) => void): void {
    this.statusCallbacks = this.statusCallbacks.filter(cb => cb !== callback);
  }

  // Utility methods
  public isConnected(): boolean {
    return this.connectionStatus === 'connected';
  }

  public getConnectionStatus(): string {
    return this.connectionStatus;
  }
}

// Create singleton instance
const whatsappBusinessClientService = new WhatsAppBusinessClientService();
export default whatsappBusinessClientService; 