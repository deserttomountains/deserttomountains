import axios from 'axios';

export interface WhatsAppBusinessContact {
  id: string;
  name: string;
  number: string;
  avatar?: string;
  status: 'online' | 'offline';
  lastSeen?: Date;
}

export interface WhatsAppBusinessMessage {
  id: string;
  from: string;
  to: string;
  body: string;
  timestamp: Date;
  type: 'text' | 'image' | 'video' | 'audio' | 'document';
  status: 'sending' | 'delivered' | 'read';
  isFromMe: boolean;
}

export interface WhatsAppBusinessChat {
  id: string;
  name: string;
  number: string;
  avatar?: string;
  status: 'online' | 'offline';
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  messages: WhatsAppBusinessMessage[];
}

export interface WhatsAppBusinessConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  webhookVerifyToken: string;
  apiVersion: string;
}

class WhatsAppBusinessService {
  private config: WhatsAppBusinessConfig | null = null;
  private baseUrl: string = 'https://graph.facebook.com';
  private chats: Map<string, WhatsAppBusinessChat> = new Map();
  private messageCallbacks: ((message: WhatsAppBusinessMessage) => void)[] = [];
  private statusCallbacks: ((status: string) => void)[] = [];

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    // Load configuration from environment variables
    this.config = {
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
      webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || '',
      apiVersion: process.env.WHATSAPP_API_VERSION || 'v18.0'
    };
  }

  private getApiUrl(endpoint: string): string {
    return `${this.baseUrl}/${this.config?.apiVersion}/${endpoint}`;
  }

  private async makeRequest(method: 'GET' | 'POST', endpoint: string, data?: any) {
    if (!this.config?.accessToken) {
      throw new Error('WhatsApp Business API not configured. Please set up your access token.');
    }

    try {
      const url = this.getApiUrl(endpoint);
      const response = await axios({
        method,
        url,
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json',
        },
        data: method === 'POST' ? data : undefined,
        params: method === 'GET' ? data : undefined,
      });

      return response.data;
    } catch (error: any) {
      console.error('WhatsApp Business API Error:', error.response?.data || error.message);
      throw new Error(`WhatsApp API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Public methods
  public async connect(): Promise<void> {
    if (!this.config?.accessToken) {
      throw new Error('WhatsApp Business API not configured. Please set up your access token.');
    }

    try {
      // Verify the connection by getting phone number info
      await this.makeRequest('GET', `${this.config.phoneNumberId}`);
      this.notifyStatus('ready');
    } catch (error) {
      console.error('Error connecting to WhatsApp Business API:', error);
      this.notifyStatus('auth_failure');
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    this.notifyStatus('disconnected');
  }

  public async sendMessage(phoneNumber: string, message: string): Promise<WhatsAppBusinessMessage> {
    if (!this.config?.phoneNumberId) {
      throw new Error('Phone number ID not configured');
    }

    try {
      const response = await this.makeRequest('POST', `${this.config.phoneNumberId}/messages`, {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: {
          body: message
        }
      });

      const whatsappMessage: WhatsAppBusinessMessage = {
        id: response.messages[0].id,
        from: this.config.phoneNumberId,
        to: phoneNumber,
        body: message,
        timestamp: new Date(),
        type: 'text',
        status: 'sending',
        isFromMe: true
      };

      // Add to chat
      const chatId = phoneNumber;
      const chat = this.chats.get(chatId) || this.createChat(chatId, phoneNumber);
      chat.messages.push(whatsappMessage);
      chat.lastMessage = message;
      chat.lastMessageTime = whatsappMessage.timestamp;
      this.chats.set(chatId, chat);

      return whatsappMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  public async sendTemplateMessage(phoneNumber: string, templateName: string, language: string = 'en_US', components?: any[]): Promise<WhatsAppBusinessMessage> {
    if (!this.config?.phoneNumberId) {
      throw new Error('Phone number ID not configured');
    }

    try {
      const messageData: any = {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: language
          }
        }
      };

      if (components) {
        messageData.template.components = components;
      }

      const response = await this.makeRequest('POST', `${this.config.phoneNumberId}/messages`, messageData);

      const whatsappMessage: WhatsAppBusinessMessage = {
        id: response.messages[0].id,
        from: this.config.phoneNumberId,
        to: phoneNumber,
        body: `Template: ${templateName}`,
        timestamp: new Date(),
        type: 'text',
        status: 'sending',
        isFromMe: true
      };

      return whatsappMessage;
    } catch (error) {
      console.error('Error sending template message:', error);
      throw error;
    }
  }

  public async getPhoneNumberInfo(): Promise<any> {
    if (!this.config?.phoneNumberId) {
      throw new Error('Phone number ID not configured');
    }

    return await this.makeRequest('GET', this.config.phoneNumberId);
  }

  public async getBusinessProfile(): Promise<any> {
    if (!this.config?.businessAccountId) {
      throw new Error('Business account ID not configured');
    }

    return await this.makeRequest('GET', this.config.businessAccountId);
  }

  public async getMessageStatus(messageId: string): Promise<any> {
    return await this.makeRequest('GET', messageId);
  }

  public async getMedia(mediaId: string): Promise<any> {
    return await this.makeRequest('GET', mediaId);
  }

  public async uploadMedia(file: Buffer, type: string): Promise<any> {
    if (!this.config?.phoneNumberId) {
      throw new Error('Phone number ID not configured');
    }

    const formData = new FormData();
    formData.append('messaging_product', 'whatsapp');
    formData.append('file', new Blob([file]), 'file');

    try {
      const response = await axios({
        method: 'POST',
        url: this.getApiUrl(`${this.config.phoneNumberId}/media`),
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
        },
        data: formData,
      });

      return response.data;
    } catch (error: any) {
      console.error('Error uploading media:', error.response?.data || error.message);
      throw error;
    }
  }

  // Chat management
  private createChat(chatId: string, phoneNumber: string): WhatsAppBusinessChat {
    const chat: WhatsAppBusinessChat = {
      id: chatId,
      name: phoneNumber, // We'll update this when we get contact info
      number: phoneNumber,
      avatar: undefined,
      status: 'offline',
      lastMessage: '',
      lastMessageTime: new Date(),
      unreadCount: 0,
      messages: []
    };

    this.chats.set(chatId, chat);
    return chat;
  }

  public getChats(): WhatsAppBusinessChat[] {
    return Array.from(this.chats.values());
  }

  public getChat(chatId: string): WhatsAppBusinessChat | undefined {
    return this.chats.get(chatId);
  }

  public isClientConnected(): boolean {
    return !!this.config?.accessToken;
  }

  public getQRCode(): string | null {
    // WhatsApp Business API doesn't use QR codes
    return null;
  }

  // Webhook handling
  public handleWebhook(body: any): void {
    if (body.object === 'whatsapp_business_account') {
      body.entry?.forEach((entry: any) => {
        entry.changes?.forEach((change: any) => {
          if (change.value?.messages) {
            change.value.messages.forEach((message: any) => {
              this.handleIncomingMessage(message);
            });
          }
        });
      });
    }
  }

  private handleIncomingMessage(message: any): void {
    const whatsappMessage: WhatsAppBusinessMessage = {
      id: message.id,
      from: message.from,
      to: message.to,
      body: message.text?.body || '',
      timestamp: new Date(message.timestamp * 1000),
      type: message.type,
      status: 'delivered',
      isFromMe: false
    };

    // Add to chat
    const chatId = message.from;
    const chat = this.chats.get(chatId) || this.createChat(chatId, message.from);
    chat.messages.push(whatsappMessage);
    chat.lastMessage = whatsappMessage.body;
    chat.lastMessageTime = whatsappMessage.timestamp;
    chat.unreadCount++;
    this.chats.set(chatId, chat);

    // Notify listeners
    this.messageCallbacks.forEach(callback => callback(whatsappMessage));
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

  // Cleanup
  public removeMessageListener(callback: (message: WhatsAppBusinessMessage) => void): void {
    this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
  }

  public removeStatusListener(callback: (status: string) => void): void {
    this.statusCallbacks = this.statusCallbacks.filter(cb => cb !== callback);
  }

  // Configuration
  public updateConfig(config: Partial<WhatsAppBusinessConfig>): void {
    this.config = { ...this.config, ...config } as WhatsAppBusinessConfig;
  }

  public getConfig(): WhatsAppBusinessConfig | null {
    return this.config;
  }
}

// Create singleton instance
const whatsappBusinessService = new WhatsAppBusinessService();
export default whatsappBusinessService; 