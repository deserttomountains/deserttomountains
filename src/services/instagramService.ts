// Instagram API Service for CRM Integration
// This service handles Instagram Basic Display API and Graph API integration

export interface InstagramUser {
  id: string;
  username: string;
  full_name: string;
  profile_picture_url: string;
  is_verified: boolean;
  is_private: boolean;
  follower_count: number;
  following_count: number;
  media_count: number;
}

export interface InstagramMessage {
  id: string;
  from: InstagramUser;
  to: InstagramUser;
  text: string;
  timestamp: Date;
  type: 'text' | 'image' | 'video' | 'story_reply' | 'reaction' | 'audio' | 'document';
  media_url?: string;
  reaction?: string;
  is_from_me: boolean;
  status: 'sent' | 'delivered' | 'read';
  reply_to?: string;
  mentions?: string[];
  hashtags?: string[];
  media_thumbnail?: string;
  media_duration?: number;
  file_size?: number;
  file_name?: string;
}

export interface InstagramConversation {
  id: string;
  participants: InstagramUser[];
  last_message: InstagramMessage;
  unread_count: number;
  updated_time: Date;
  messages: InstagramMessage[];
  is_group: boolean;
  group_name?: string;
  group_avatar?: string;
}

export interface InstagramAuthResponse {
  access_token: string;
  user_id: string;
  expires_in: number;
  token_type: string;
}

export interface InstagramWebhookEvent {
  object: string;
  entry: Array<{
    id: string;
    time: number;
    messaging?: Array<{
      sender: { id: string };
      recipient: { id: string };
      timestamp: number;
      message?: {
        mid: string;
        text?: string;
        attachments?: Array<{
          type: string;
          payload: { url?: string; sticker_id?: number };
        }>;
        quick_reply?: { payload: string };
        reply_to?: { mid: string };
      };
      postback?: { payload: string };
      reaction?: { mid: string; action: string; emoji?: string };
    }>;
  }>;
}

class InstagramService {
  private baseUrl = 'https://graph.instagram.com/v18.0';
  private graphApiUrl = 'https://graph.facebook.com/v18.0';
  private accessToken: string | null = null;
  private userId: string | null = null;
  private pageId: string | null = null;
  private webSocket: WebSocket | null = null;
  private messageCallbacks: ((message: InstagramMessage) => void)[] = [];
  private statusCallbacks: ((status: string) => void)[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  // Initialize with access token
  initialize(accessToken: string, userId: string, pageId?: string) {
    this.accessToken = accessToken;
    this.userId = userId;
    this.pageId = pageId || null;
  }

  isInitialized(): boolean {
    return !!(this.accessToken && this.userId);
  }

  // Get current user profile
  async getCurrentUser(): Promise<InstagramUser | null> {
    if (!this.isInitialized()) {
      throw new Error('Instagram service not initialized. Please authenticate first.');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/me?fields=id,username,full_name,profile_picture_url,is_verified,is_private,follower_count,following_count,media_count&access_token=${this.accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.statusText}`);
      }

      const data = await response.json();
      return data as InstagramUser;
    } catch (error) {
      console.error('Error fetching Instagram user profile:', error);
      throw error;
    }
  }

  // Get user's media (posts, stories)
  async getUserMedia(limit: number = 20): Promise<any[]> {
    if (!this.isInitialized()) {
      throw new Error('Instagram service not initialized. Please authenticate first.');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=${limit}&access_token=${this.accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch user media: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching Instagram media:', error);
      throw error;
    }
  }

  // Get media comments
  async getMediaComments(mediaId: string): Promise<any[]> {
    if (!this.isInitialized()) {
      throw new Error('Instagram service not initialized. Please authenticate first.');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/${mediaId}/comments?fields=id,text,from,timestamp&access_token=${this.accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  // Reply to comment
  async replyToComment(mediaId: string, commentText: string): Promise<any> {
    if (!this.isInitialized()) {
      throw new Error('Instagram service not initialized. Please authenticate first.');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/${mediaId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: commentText,
            access_token: this.accessToken,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to reply to comment: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error replying to comment:', error);
      throw error;
    }
  }

  // Get mentions and tags
  async getMentions(): Promise<any[]> {
    if (!this.isInitialized()) {
      throw new Error('Instagram service not initialized. Please authenticate first.');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/me/tags?fields=id,caption,media_type,media_url,permalink,timestamp&access_token=${this.accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch mentions: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching mentions:', error);
      throw error;
    }
  }

  // Get direct messages using Instagram Graph API
  async getDirectMessages(limit: number = 50): Promise<InstagramConversation[]> {
    if (!this.isInitialized()) {
      throw new Error('Instagram service not initialized. Please authenticate first.');
    }

    if (!this.pageId) {
      // Fallback to mock data if no page ID (Graph API requires page access)
      return this.getMockDirectMessages();
    }

    try {
      // Get conversations
      const conversationsResponse = await fetch(
        `${this.graphApiUrl}/${this.pageId}/conversations?fields=id,participants,updated_time,unread_count&limit=${limit}&access_token=${this.accessToken}`
      );

      if (!conversationsResponse.ok) {
        throw new Error(`Failed to fetch conversations: ${conversationsResponse.statusText}`);
      }

      const conversationsData = await conversationsResponse.json();
      const conversations = conversationsData.data || [];

      // Get messages for each conversation
      const conversationsWithMessages = await Promise.all(
        conversations.map(async (conversation: any) => {
          const messagesResponse = await fetch(
            `${this.graphApiUrl}/${conversation.id}/messages?fields=id,from,to,message,created_time,attachments&limit=50&access_token=${this.accessToken}`
          );

          if (messagesResponse.ok) {
            const messagesData = await messagesResponse.json();
            conversation.messages = messagesData.data || [];
          } else {
            conversation.messages = [];
          }

          return this.transformConversation(conversation);
        })
      );

      return conversationsWithMessages;
    } catch (error) {
      console.error('Error fetching direct messages:', error);
      // Return mock data as fallback
      return this.getMockDirectMessages();
    }
  }

  // Send direct message using Instagram Graph API
  async sendDirectMessage(recipientId: string, message: string, messageType: 'text' | 'image' | 'video' = 'text', mediaUrl?: string): Promise<any> {
    if (!this.isInitialized()) {
      throw new Error('Instagram service not initialized. Please authenticate first.');
    }

    if (!this.pageId) {
      throw new Error('Page ID required for sending messages. Please connect your Instagram Business account.');
    }

    try {
      const messageData: any = {
        recipient: { id: recipientId },
        message: { text: message },
        access_token: this.accessToken,
      };

      // Handle media messages
      if (messageType !== 'text' && mediaUrl) {
        messageData.message = {
          attachment: {
            type: messageType === 'image' ? 'image' : 'video',
            payload: { url: mediaUrl }
          }
        };
      }

      const response = await fetch(
        `${this.graphApiUrl}/${this.pageId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messageData),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to send direct message: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Notify message callbacks
      const sentMessage: InstagramMessage = {
        id: result.message_id || Date.now().toString(),
        from: await this.getCurrentUser() || {} as InstagramUser,
        to: { id: recipientId } as InstagramUser,
        text: message,
        timestamp: new Date(),
        type: messageType,
        media_url: mediaUrl,
        is_from_me: true,
        status: 'sent',
      };

      this.messageCallbacks.forEach(callback => callback(sentMessage));
      
      return result;
    } catch (error) {
      console.error('Error sending direct message:', error);
      throw error;
    }
  }

  // Upload media for Instagram
  async uploadMedia(file: File, mediaType: 'image' | 'video'): Promise<string> {
    if (!this.isInitialized()) {
      throw new Error('Instagram service not initialized. Please authenticate first.');
    }

    try {
      // Convert file to base64 or upload to temporary storage
      const formData = new FormData();
      formData.append('source', file);
      formData.append('access_token', this.accessToken!);

      const response = await fetch(
        `${this.graphApiUrl}/me/photos`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to upload media: ${response.statusText}`);
      }

      const result = await response.json();
      return result.id;
    } catch (error) {
      console.error('Error uploading media:', error);
      throw error;
    }
  }

  // Setup real-time messaging with WebSocket
  async setupRealTimeMessaging(): Promise<void> {
    if (!this.isInitialized()) {
      throw new Error('Instagram service not initialized. Please authenticate first.');
    }

    try {
      // Connect to WebSocket for real-time updates
      this.webSocket = new WebSocket(`wss://your-websocket-server.com/instagram?token=${this.accessToken}`);
      
      this.webSocket.onopen = () => {
        console.log('Instagram WebSocket connected');
        this.reconnectAttempts = 0;
        this.statusCallbacks.forEach(callback => callback('connected'));
      };

      this.webSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.webSocket.onclose = () => {
        console.log('Instagram WebSocket disconnected');
        this.statusCallbacks.forEach(callback => callback('disconnected'));
        this.attemptReconnect();
      };

      this.webSocket.onerror = (error) => {
        console.error('Instagram WebSocket error:', error);
        this.statusCallbacks.forEach(callback => callback('error'));
      };

    } catch (error) {
      console.error('Error setting up real-time messaging:', error);
      throw error;
    }
  }

  // Handle WebSocket messages
  private handleWebSocketMessage(data: any): void {
    if (data.type === 'message') {
      const message: InstagramMessage = {
        id: data.message.id,
        from: data.message.from,
        to: data.message.to,
        text: data.message.text || '',
        timestamp: new Date(data.message.timestamp * 1000),
        type: data.message.type || 'text',
        media_url: data.message.media_url,
        is_from_me: false,
        status: 'delivered',
      };

      this.messageCallbacks.forEach(callback => callback(message));
    } else if (data.type === 'status') {
      this.statusCallbacks.forEach(callback => callback(data.status));
    }
  }

  // Attempt to reconnect WebSocket
  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.setupRealTimeMessaging();
      }, delay);
    }
  }

  // Subscribe to message events
  onMessage(callback: (message: InstagramMessage) => void): void {
    this.messageCallbacks.push(callback);
  }

  // Subscribe to status events
  onStatus(callback: (status: string) => void): void {
    this.statusCallbacks.push(callback);
  }

  // Unsubscribe from events
  offMessage(callback: (message: InstagramMessage) => void): void {
    this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
  }

  offStatus(callback: (status: string) => void): void {
    this.statusCallbacks = this.statusCallbacks.filter(cb => cb !== callback);
  }

  // Transform API response to our interface
  private transformConversation(data: any): InstagramConversation {
    return {
      id: data.id,
      participants: data.participants || [],
      last_message: data.messages?.[0] ? this.transformMessage(data.messages[0]) : {} as InstagramMessage,
      unread_count: data.unread_count || 0,
      updated_time: new Date(data.updated_time),
      messages: (data.messages || []).map((msg: any) => this.transformMessage(msg)),
      is_group: data.participants?.length > 2 || false,
      group_name: data.group_name,
      group_avatar: data.group_avatar,
    };
  }

  // Transform message data
  private transformMessage(data: any): InstagramMessage {
    return {
      id: data.id,
      from: data.from,
      to: data.to,
      text: data.message || data.text || '',
      timestamp: new Date(data.created_time || data.timestamp * 1000),
      type: data.attachments?.[0]?.type || 'text',
      media_url: data.attachments?.[0]?.payload?.url,
      is_from_me: data.from?.id === this.userId,
      status: 'delivered',
    };
  }

  // Mock direct messages for development/testing
  private getMockDirectMessages(): InstagramConversation[] {
    return [
      {
        id: 'conv1',
        participants: [
          {
            id: 'user1',
            username: 'sarah.johnson',
            full_name: 'Sarah Johnson',
            profile_picture_url: '',
            is_verified: true,
            is_private: false,
            follower_count: 1200,
            following_count: 800,
            media_count: 45,
          },
        ],
        last_message: {
          id: 'msg1',
          from: {
            id: 'user1',
            username: 'sarah.johnson',
            full_name: 'Sarah Johnson',
            profile_picture_url: '',
            is_verified: true,
            is_private: false,
            follower_count: 1200,
            following_count: 800,
            media_count: 45,
          },
          to: {
            id: 'me',
            username: 'business',
            full_name: 'Business Account',
            profile_picture_url: '',
            is_verified: true,
            is_private: false,
            follower_count: 5000,
            following_count: 100,
            media_count: 200,
          },
          text: 'Love your latest post! The colors are amazing ✨',
          timestamp: new Date(),
          type: 'text',
          is_from_me: false,
          status: 'delivered',
        },
        unread_count: 2,
        updated_time: new Date(),
        messages: [],
        is_group: false,
      },
    ];
  }

  // Get authentication URL for Instagram OAuth
  getAuthUrl(): string {
    const clientId = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/instagram/callback`;
    const scope = 'user_profile,user_media,instagram_basic,instagram_manage_comments,pages_show_list,pages_manage_metadata';
    
    return `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code: string): Promise<InstagramAuthResponse> {
    try {
      const response = await fetch('/api/instagram/exchange-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error(`Failed to exchange code for token: ${response.statusText}`);
      }

      const data = await response.json();
      return data as InstagramAuthResponse;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw error;
    }
  }

  // Refresh access token
  async refreshToken(): Promise<InstagramAuthResponse> {
    if (!this.accessToken) {
      throw new Error('No access token to refresh');
    }

    try {
      const response = await fetch('/api/instagram/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_token: this.accessToken }),
      });

      if (!response.ok) {
        throw new Error(`Failed to refresh token: ${response.statusText}`);
      }

      const data = await response.json();
      return data as InstagramAuthResponse;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }

  // Clear authentication
  clearAuth() {
    this.accessToken = null;
    this.userId = null;
    this.pageId = null;
    
    if (this.webSocket) {
      this.webSocket.close();
      this.webSocket = null;
    }
    
    this.messageCallbacks = [];
    this.statusCallbacks = [];
  }

  // Get connection status
  getConnectionStatus(): string {
    if (!this.webSocket) return 'disconnected';
    return this.webSocket.readyState === WebSocket.OPEN ? 'connected' : 'connecting';
  }
}

// Export singleton instance
const instagramService = new InstagramService();
export default instagramService; 