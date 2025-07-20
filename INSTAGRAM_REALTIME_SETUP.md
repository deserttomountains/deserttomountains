# Instagram Real-Time Messaging Setup Guide

## 🚀 Complete Instagram Real-Time Messaging Integration

This guide will help you set up **real-time Instagram Direct Messaging** with your CRM system. The implementation includes WebSocket support, media handling, typing indicators, and message status tracking.

## 📋 Prerequisites

### 1. Instagram Business Account
- Convert your Instagram account to a Business account
- Connect it to a Facebook Page
- Ensure you have admin access to the Facebook Page

### 2. Facebook Developer Account
- Create a Facebook Developer account
- Set up a Facebook App with Instagram Graph API permissions
- Complete app review process for messaging permissions

### 3. Required Permissions
You need the following Instagram Graph API permissions:
- `instagram_basic` - Basic Instagram account access
- `instagram_manage_comments` - Manage comments on posts
- `instagram_manage_insights` - Access to insights and analytics
- `pages_show_list` - Access to Facebook pages
- `pages_manage_metadata` - Manage page metadata
- `pages_messaging` - Send and receive messages (requires app review)

## 🔧 Step-by-Step Setup

### Phase 1: Facebook App Configuration

#### 1. Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **"Create App"**
3. Select **"Business"** as app type
4. Fill in app details:
   - App Name: "Desert to Mountains CRM"
   - App Contact Email: Your business email
   - Business Account: Select your business

#### 2. Add Instagram Graph API
1. In your app dashboard, go to **"Add Product"**
2. Find and add **"Instagram Graph API"**
3. Complete the setup wizard

#### 3. Configure Instagram Graph API
1. Go to **Instagram Graph API** → **Getting Started**
2. Connect your Instagram Business account
3. Note down your **Instagram Business Account ID**

#### 4. Set Up Webhooks
1. Go to **Instagram Graph API** → **Webhooks**
2. Add webhook URL: `https://yourdomain.com/api/instagram/webhook`
3. Subscribe to these events:
   - `messages`
   - `messaging_postbacks`
   - `message_deliveries`
   - `message_reads`
   - `message_reactions`

#### 5. Generate Access Token
1. Go to **Instagram Graph API** → **Getting Started**
2. Click **"Generate Token"**
3. Select your Instagram Business account
4. Copy the **Access Token** (keep it secure!)

### Phase 2: Environment Configuration

#### 1. Update Environment Variables
Add these to your `.env.local` file:

```env
# Instagram Graph API Configuration
INSTAGRAM_CLIENT_ID=your_facebook_app_id
INSTAGRAM_CLIENT_SECRET=your_facebook_app_secret
INSTAGRAM_ACCESS_TOKEN=your_instagram_graph_api_access_token
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_instagram_business_account_id
INSTAGRAM_PAGE_ID=your_facebook_page_id

# Webhook Configuration
INSTAGRAM_WEBHOOK_VERIFY_TOKEN=your_custom_webhook_verify_token
INSTAGRAM_WEBHOOK_SECRET=your_webhook_secret

# Public Variables
NEXT_PUBLIC_INSTAGRAM_CLIENT_ID=your_facebook_app_id
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

#### 2. Install Dependencies
```bash
npm install socket.io socket.io-client
```

### Phase 3: Backend Implementation

#### 1. WebSocket Server Setup
The WebSocket server is already implemented in:
- `src/lib/socket.ts` - Main Socket.IO server
- `src/app/api/instagram/websocket/route.ts` - Instagram WebSocket handlers
- `src/app/api/instagram/webhook/route.ts` - Instagram webhook endpoint

#### 2. Instagram Service
The enhanced Instagram service is implemented in:
- `src/services/instagramService.ts` - Complete Instagram API integration

### Phase 4: Frontend Implementation

#### 1. Real-Time UI Components
The real-time messaging UI is implemented in:
- `src/app/admin/MockChatCRM.tsx` - Complete Instagram messaging interface

#### 2. WebSocket Client Integration
The frontend automatically connects to the WebSocket server and handles:
- Real-time message sending/receiving
- Typing indicators
- Message status updates
- Media uploads
- Reactions and postbacks

## 🔄 Real-Time Features

### ✅ Implemented Features

#### 1. **Real-Time Messaging**
- Send and receive messages instantly
- Message status tracking (sent, delivered, read)
- Typing indicators
- Read receipts

#### 2. **Media Support**
- Send images and videos
- Upload media to Instagram
- Media preview and display
- File size validation

#### 3. **Message Types**
- Text messages
- Image messages
- Video messages
- Story replies
- Reactions
- Quick replies

#### 4. **Advanced Features**
- Message reactions (emojis)
- Postback handling
- Delivery confirmations
- Read receipts
- Typing indicators
- Message threading

#### 5. **UI/UX Features**
- Real-time message updates
- Message status indicators
- Typing animations
- Media previews
- Emoji picker
- File attachments
- Search functionality
- Unread message counts

### 🔄 WebSocket Events

#### Client to Server
- `authenticate` - Authenticate WebSocket connection
- `send_message` - Send a message
- `upload_media` - Upload media file
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator
- `mark_read` - Mark message as read

#### Server to Client
- `authenticated` - Authentication successful
- `new_message` - New message received
- `message_sent` - Message sent successfully
- `message_delivered` - Message delivered
- `message_read` - Message read
- `typing_start` - User started typing
- `typing_stop` - User stopped typing
- `postback_received` - Quick reply received
- `reaction_received` - Message reaction received

## 🛠️ Testing the Integration

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Access the Admin Dashboard
- Go to `http://localhost:3000/admin`
- Navigate to the **Messages** section
- Switch to the **Instagram** tab

### 3. Connect Instagram
- Click **"Connect"** to authenticate with Instagram
- Complete the OAuth flow
- Verify connection status

### 4. Test Real-Time Features
- Send a test message
- Check message status updates
- Test typing indicators
- Try media uploads
- Test reactions and quick replies

## 🔒 Security Considerations

### 1. **Token Management**
- Store access tokens securely
- Implement token refresh
- Use environment variables for sensitive data
- Rotate tokens regularly

### 2. **Webhook Security**
- Verify webhook signatures
- Use HTTPS in production
- Implement rate limiting
- Validate webhook payloads

### 3. **WebSocket Security**
- Authenticate WebSocket connections
- Validate user permissions
- Implement connection timeouts
- Handle disconnections gracefully

## 🚨 Troubleshooting

### Common Issues

#### 1. **WebSocket Connection Failed**
- Check if Socket.IO server is running
- Verify CORS configuration
- Check network connectivity
- Review browser console for errors

#### 2. **Instagram API Errors**
- Verify access token is valid
- Check Instagram Graph API permissions
- Ensure Instagram Business account is connected
- Review API rate limits

#### 3. **Webhook Not Receiving Events**
- Verify webhook URL is accessible
- Check webhook verification token
- Ensure HTTPS is used in production
- Review webhook subscription settings

#### 4. **Messages Not Sending**
- Check Instagram Business account permissions
- Verify page ID is correct
- Review message content guidelines
- Check API response for errors

### Debug Steps

#### 1. **Enable Debug Logging**
```javascript
// In your browser console
localStorage.setItem('debug', 'socket.io-client:*');
```

#### 2. **Check WebSocket Status**
```javascript
// Check connection status
console.log('Socket connected:', instagramSocket?.connected);
```

#### 3. **Monitor Network Requests**
- Open browser DevTools
- Go to Network tab
- Filter by WebSocket
- Monitor API requests

## 📊 Production Deployment

### 1. **Environment Setup**
- Set production environment variables
- Configure production webhook URLs
- Set up SSL certificates
- Configure domain verification

### 2. **Performance Optimization**
- Implement message caching
- Add connection pooling
- Optimize media uploads
- Monitor WebSocket connections

### 3. **Monitoring**
- Set up error tracking
- Monitor API rate limits
- Track message delivery rates
- Monitor WebSocket performance

## 🔄 Next Steps

### 1. **Advanced Features**
- Implement message templates
- Add automated responses
- Set up message routing
- Implement analytics dashboard

### 2. **Integration Enhancements**
- Connect with CRM workflows
- Add message scheduling
- Implement team collaboration
- Add message archiving

### 3. **Scalability**
- Implement message queuing
- Add load balancing
- Set up database optimization
- Implement caching strategies

## 📞 Support

If you encounter issues:

1. **Check Documentation**
   - [Instagram Graph API Documentation](https://developers.facebook.com/docs/instagram-api/)
   - [Socket.IO Documentation](https://socket.io/docs/)

2. **Review Logs**
   - Check browser console for errors
   - Review server logs
   - Monitor WebSocket connections

3. **Verify Configuration**
   - Confirm environment variables
   - Check API permissions
   - Verify webhook settings

4. **Test Incrementally**
   - Test basic authentication first
   - Verify WebSocket connection
   - Test message sending
   - Test real-time features

---

**🎉 Congratulations!** You now have a fully functional real-time Instagram messaging system integrated with your CRM. The system supports all modern messaging features including media, reactions, typing indicators, and real-time updates. 