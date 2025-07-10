import { Client, LocalAuth, Message, Contact } from 'whatsapp-web.js';
import qrcode from 'qrcode';

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

class WhatsAppServerService {
  private client: Client | null = null;
  private isConnected = false;
  private qrCode: string | null = null;
  private chats: Map<string, WhatsAppChat> = new Map();
  private messageCallbacks: ((message: WhatsAppMessage) => void)[] = [];
  private statusCallbacks: ((status: string) => void)[] = [];

  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.client) return;

    // QR Code generation
    this.client.on('qr', async (qr) => {
      try {
        this.qrCode = await qrcode.toDataURL(qr);
        this.notifyStatus('qr_ready');
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    });

    // Client ready
    this.client.on('ready', () => {
      this.isConnected = true;
      this.qrCode = null;
      this.notifyStatus('ready');
      this.loadChats();
    });

    // Authentication failure
    this.client.on('auth_failure', () => {
      this.isConnected = false;
      this.notifyStatus('auth_failure');
    });

    // Disconnected
    this.client.on('disconnected', () => {
      this.isConnected = false;
      this.notifyStatus('disconnected');
    });

    // New message
    this.client.on('message', async (message) => {
      await this.handleNewMessage(message);
    });

    // Message status updates
    this.client.on('message_ack', async (msg, ack) => {
      await this.handleMessageAck(msg, ack);
    });
  }

  private async handleNewMessage(message: Message) {
    if (message.fromMe) return; // Skip our own messages

    const chatId = message.from;
    const chat = await this.getOrCreateChat(chatId);
    
    const whatsappMessage: WhatsAppMessage = {
      id: message.id._serialized,
      from: message.from,
      to: message.to,
      body: message.body,
      timestamp: new Date(message.timestamp * 1000),
      type: message.type as any,
      status: 'delivered',
      isFromMe: false
    };

    // Add message to chat
    chat.messages.push(whatsappMessage);
    chat.lastMessage = message.body;
    chat.lastMessageTime = whatsappMessage.timestamp;
    chat.unreadCount++;

    // Update chat in map
    this.chats.set(chatId, chat);

    // Notify listeners
    this.messageCallbacks.forEach(callback => callback(whatsappMessage));
  }

  private async handleMessageAck(message: Message, ack: number) {
    const chatId = message.from;
    const chat = this.chats.get(chatId);
    
    if (chat) {
      const msg = chat.messages.find(m => m.id === message.id._serialized);
      if (msg) {
        switch (ack) {
          case 1: // ACK_ERROR
            msg.status = 'sending';
            break;
          case 2: // ACK_PENDING
            msg.status = 'sending';
            break;
          case 3: // ACK_SERVER
            msg.status = 'delivered';
            break;
          case 4: // ACK_DEVICE
            msg.status = 'delivered';
            break;
          case 5: // ACK_READ
            msg.status = 'read';
            break;
          case 6: // ACK_PLAYED
            msg.status = 'read';
            break;
        }
      }
    }
  }

  private async getOrCreateChat(chatId: string): Promise<WhatsAppChat> {
    if (this.chats.has(chatId)) {
      return this.chats.get(chatId)!;
    }

    // Get contact info
    const contact = await this.client?.getContactById(chatId);
    const chat = await this.client?.getChatById(chatId);

    const avatar = contact ? await contact.getProfilePicUrl() : undefined;
    const whatsappChat: WhatsAppChat = {
      id: chatId,
      name: contact?.name || contact?.pushname || chatId,
      number: chatId,
      avatar,
      status: 'offline', // We'll update this when we get presence updates
      lastMessage: '',
      lastMessageTime: new Date(),
      unreadCount: 0,
      messages: []
    };

    this.chats.set(chatId, whatsappChat);
    return whatsappChat;
  }

  private async loadChats() {
    if (!this.client) return;

    try {
      const chats = await this.client.getChats();
      
      for (const chat of chats) {
        if (chat.isGroup) continue; // Skip groups for now
        
        const contact = await this.client.getContactById(chat.id._serialized);
        const messages = await chat.fetchMessages({ limit: 50 });
        
        const avatar = contact ? await contact.getProfilePicUrl() : undefined;
        const whatsappChat: WhatsAppChat = {
          id: chat.id._serialized,
          name: contact?.name || contact?.pushname || chat.id._serialized,
          number: chat.id._serialized,
          avatar,
          status: 'offline',
          lastMessage: messages[messages.length - 1]?.body || '',
          lastMessageTime: messages[messages.length - 1]?.timestamp ? new Date(messages[messages.length - 1].timestamp * 1000) : new Date(),
          unreadCount: chat.unreadCount,
          messages: messages.map(msg => ({
            id: msg.id._serialized,
            from: msg.from,
            to: msg.to,
            body: msg.body,
            timestamp: new Date(msg.timestamp * 1000),
            type: msg.type as any,
            status: msg.fromMe ? 'read' : 'delivered',
            isFromMe: msg.fromMe
          }))
        };

        this.chats.set(chat.id._serialized, whatsappChat);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  }

  // Public methods
  public async connect(): Promise<void> {
    if (!this.client) {
      this.initializeClient();
    }
    
    try {
      await this.client?.initialize();
    } catch (error) {
      console.error('Error connecting to WhatsApp:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.destroy();
      this.client = null;
      this.isConnected = false;
    }
  }

  public async sendMessage(chatId: string, message: string): Promise<WhatsAppMessage> {
    if (!this.client || !this.isConnected) {
      throw new Error('WhatsApp client not connected');
    }

    try {
      const sentMessage = await this.client.sendMessage(chatId, message);
      
      const whatsappMessage: WhatsAppMessage = {
        id: sentMessage.id._serialized,
        from: sentMessage.from,
        to: sentMessage.to,
        body: sentMessage.body,
        timestamp: new Date(sentMessage.timestamp * 1000),
        type: sentMessage.type as any,
        status: 'sending',
        isFromMe: true
      };

      // Add to chat
      const chat = this.chats.get(chatId);
      if (chat) {
        chat.messages.push(whatsappMessage);
        chat.lastMessage = message;
        chat.lastMessageTime = whatsappMessage.timestamp;
        this.chats.set(chatId, chat);
      }

      return whatsappMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  public getChats(): WhatsAppChat[] {
    return Array.from(this.chats.values());
  }

  public getChat(chatId: string): WhatsAppChat | undefined {
    return this.chats.get(chatId);
  }

  public getQRCode(): string | null {
    return this.qrCode;
  }

  public isClientConnected(): boolean {
    return this.isConnected;
  }

  // Event listeners
  public onMessage(callback: (message: WhatsAppMessage) => void): void {
    this.messageCallbacks.push(callback);
  }

  public onStatus(callback: (status: string) => void): void {
    this.statusCallbacks.push(callback);
  }

  private notifyStatus(status: string): void {
    this.statusCallbacks.forEach(callback => callback(status));
  }

  // Cleanup
  public removeMessageListener(callback: (message: WhatsAppMessage) => void): void {
    this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
  }

  public removeStatusListener(callback: (status: string) => void): void {
    this.statusCallbacks = this.statusCallbacks.filter(cb => cb !== callback);
  }
}

// Create singleton instance
const whatsappServerService = new WhatsAppServerService();
export default whatsappServerService; 