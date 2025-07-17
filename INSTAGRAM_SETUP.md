# Instagram API Integration Setup Guide

## 🚀 Instagram API Integration

Your CRM now supports **real Instagram integration**! Here's how to set it up:

### 📋 Prerequisites

1. **Instagram Account**: You need an Instagram account (personal or business)
2. **Facebook Developer Account**: Required to create Instagram apps
3. **Domain Verification**: Your domain needs to be verified with Facebook
4. **Environment Variables**: Configure your Instagram app credentials

### 🔧 Step-by-Step Setup

#### 1. Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **"Create App"**
3. Select **"Consumer"** or **"Business"** app type
4. Fill in your app details and create the app

#### 2. Add Instagram Basic Display

1. In your Facebook app dashboard, go to **"Add Product"**
2. Find and add **"Instagram Basic Display"**
3. Complete the setup wizard

#### 3. Configure Instagram Basic Display

1. Go to **Instagram Basic Display** → **Basic Display**
2. Add your **Valid OAuth Redirect URIs**:
   ```
   http://localhost:3000/api/instagram/callback
   https://yourdomain.com/api/instagram/callback
   ```
3. Save the changes

#### 4. Get Your App Credentials

1. Go to **App Settings** → **Basic**
2. Copy your **App ID** and **App Secret**
3. Note down your **App ID** for the next step

#### 5. Configure Environment Variables

Create or update your `.env.local` file:

```env
# Instagram API Configuration
INSTAGRAM_CLIENT_ID=your_instagram_app_id_here
INSTAGRAM_CLIENT_SECRET=your_instagram_app_secret_here
NEXT_PUBLIC_INSTAGRAM_CLIENT_ID=your_instagram_app_id_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

#### 6. Test the Integration

1. Start your development server: `npm run dev`
2. Go to your admin dashboard: `http://localhost:3000/admin`
3. Navigate to the **Messages** section
4. Switch to the **Instagram** tab
5. Click **"Connect"** to authenticate with Instagram

### 🔐 Authentication Flow

1. **User clicks "Connect"** → Opens Instagram OAuth popup
2. **User authorizes** → Instagram redirects with authorization code
3. **Code exchange** → Your app exchanges code for access token
4. **Token storage** → Access token stored in localStorage
5. **Profile loading** → Instagram user profile loaded
6. **Ready to use** → Instagram integration is active

### 📱 Features Available

#### ✅ Currently Supported:
- **User Profile**: Display Instagram user info
- **Media Access**: View user's posts and stories
- **Comments**: Read and reply to comments
- **Mentions**: View posts where you're tagged
- **Mock DMs**: Simulated direct messages (for development)

#### 🔄 Coming Soon:
- **Real Direct Messages**: Requires Instagram Graph API permissions
- **Story Replies**: Reply to story mentions
- **Automated Responses**: AI-powered reply suggestions
- **Analytics**: Message metrics and engagement tracking

### 🛠️ API Permissions

#### Basic Display API (Current):
- `user_profile`: Access to user's profile information
- `user_media`: Access to user's media (posts, stories)

#### Graph API (Future - Requires Approval):
- `instagram_basic`: Basic Instagram account access
- `instagram_manage_comments`: Manage comments on posts
- `instagram_manage_insights`: Access to insights and analytics
- `pages_show_list`: Access to Facebook pages
- `pages_manage_metadata`: Manage page metadata

### 🔒 Security Considerations

1. **Token Storage**: Access tokens are stored in localStorage (client-side)
2. **Token Expiry**: Long-lived tokens expire in 60 days
3. **Token Refresh**: Automatic token refresh when needed
4. **Scope Limitation**: Only request necessary permissions
5. **HTTPS Required**: Production must use HTTPS

### 🚨 Troubleshooting

#### Common Issues:

1. **"Invalid redirect URI"**
   - Ensure your redirect URI matches exactly in Facebook app settings
   - Check for trailing slashes or protocol mismatches

2. **"App not approved"**
   - Instagram Basic Display apps need to go through app review
   - For development, you can add test users in app settings

3. **"Token expired"**
   - Tokens automatically refresh when possible
   - If refresh fails, user needs to re-authenticate

4. **"Permission denied"**
   - Check that your app has the required permissions
   - Ensure user granted all requested permissions

#### Debug Steps:

1. **Check Console**: Look for error messages in browser console
2. **Verify Environment Variables**: Ensure all Instagram credentials are set
3. **Test OAuth Flow**: Try the authentication flow step by step
4. **Check Network**: Monitor network requests for API errors
5. **Clear Storage**: Clear localStorage if tokens are corrupted

### 📊 Production Deployment

#### Environment Variables for Production:

```env
# Production Instagram Configuration
INSTAGRAM_CLIENT_ID=your_production_app_id
INSTAGRAM_CLIENT_SECRET=your_production_app_secret
NEXT_PUBLIC_INSTAGRAM_CLIENT_ID=your_production_app_id
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

#### Required Steps:

1. **Domain Verification**: Verify your domain with Facebook
2. **App Review**: Submit your app for review if needed
3. **Privacy Policy**: Ensure you have a privacy policy
4. **Terms of Service**: Include terms of service
5. **Data Usage**: Follow Instagram's data usage guidelines

### 🔄 Token Management

#### Automatic Token Refresh:

```typescript
// The service automatically handles token refresh
const refreshResponse = await instagramService.refreshToken();
```

#### Manual Token Management:

```typescript
// Check if token is valid
if (instagramService.isInitialized()) {
  // Token is valid and service is ready
}

// Clear authentication
instagramService.clearAuth();
```

### 📈 Next Steps

1. **Test Basic Integration**: Ensure authentication works
2. **Implement Real DMs**: Apply for Instagram Graph API permissions
3. **Add Analytics**: Track message engagement and response times
4. **Automation**: Implement automated response workflows
5. **Multi-Account**: Support multiple Instagram accounts

### 📞 Support

If you encounter issues:

1. Check the [Instagram Basic Display Documentation](https://developers.facebook.com/docs/instagram-basic-display-api/)
2. Review [Facebook App Review Guidelines](https://developers.facebook.com/docs/app-review/)
3. Check the browser console for detailed error messages
4. Verify all environment variables are correctly set

---

**Note**: Instagram API access is subject to Facebook's platform policies and may require app review for certain features. Always follow Instagram's data usage and privacy guidelines. 