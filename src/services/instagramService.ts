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
  type: 'text' | 'image' | 'video' | 'story_reply' | 'reaction';
  media_url?: string;
  reaction?: string;
  is_from_me: boolean;
  status: 'sent' | 'delivered' | 'read';
}

export interface InstagramConversation {
  id: string;
  participants: InstagramUser[];
  last_message: InstagramMessage;
  unread_count: number;
  updated_time: Date;
  messages: InstagramMessage[];
}

export interface InstagramAuthResponse {
  access_token: string;
  user_id: string;
  expires_in: number;
  token_type: string;
}

class InstagramService {
  private baseUrl = 'https://graph.instagram.com/v18.0';
  private accessToken: string | null = null;
  private userId: string | null = null;

  // Initialize with access token
  initialize(accessToken: string, userId: string) {
    this.accessToken = accessToken;
    this.userId = userId;
  }

  // Check if service is initialized
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

  // Get comments on a media item
  async getMediaComments(mediaId: string): Promise<any[]> {
    if (!this.isInitialized()) {
      throw new Error('Instagram service not initialized. Please authenticate first.');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/${mediaId}/comments?fields=id,text,from,timestamp&access_token=${this.accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch media comments: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching media comments:', error);
      throw error;
    }
  }

  // Reply to a comment
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
        throw new Error(`Failed to post comment: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error posting comment:', error);
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

  // Get direct messages (requires Instagram Graph API with permissions)
  async getDirectMessages(): Promise<InstagramConversation[]> {
    if (!this.isInitialized()) {
      throw new Error('Instagram service not initialized. Please authenticate first.');
    }

    try {
      // Note: Direct messages require Instagram Graph API with specific permissions
      // This is a placeholder for when you have the necessary permissions
      const response = await fetch(
        `${this.baseUrl}/me/conversations?fields=participants,messages{id,from,to,message,created_time}&access_token=${this.accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch direct messages: ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformConversations(data.data || []);
    } catch (error) {
      console.error('Error fetching direct messages:', error);
      // For now, return mock data since DM access requires special permissions
      return this.getMockDirectMessages();
    }
  }

  // Send direct message (requires Instagram Graph API with permissions)
  async sendDirectMessage(recipientId: string, message: string): Promise<any> {
    if (!this.isInitialized()) {
      throw new Error('Instagram service not initialized. Please authenticate first.');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/me/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipient_id: recipientId,
            message: message,
            access_token: this.accessToken,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to send direct message: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending direct message:', error);
      throw error;
    }
  }

  // Transform API response to our interface
  private transformConversations(data: any[]): InstagramConversation[] {
    return data.map(conversation => ({
      id: conversation.id,
      participants: conversation.participants || [],
      last_message: conversation.messages?.[0] || null,
      unread_count: conversation.unread_count || 0,
      updated_time: new Date(conversation.updated_time),
      messages: conversation.messages || [],
    }));
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
      },
    ];
  }

  // Get authentication URL for Instagram OAuth
  getAuthUrl(): string {
    const clientId = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/instagram/callback`;
    const scope = 'user_profile,user_media';
    
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
  }
}

// Export singleton instance
const instagramService = new InstagramService();
export default instagramService; 