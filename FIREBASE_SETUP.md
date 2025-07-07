# Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication for the Desert to Mountains login system.

## Prerequisites

1. A Firebase project (create one at https://console.firebase.google.com/)
2. Firebase CLI (optional, for advanced features)

## Step 1: Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable the following providers:
     - Email/Password
     - Phone
     - Google
     - Facebook

## Step 2: Get Firebase Configuration

1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select "Web"
4. Register your app with a nickname
5. Copy the configuration object

## Step 3: Environment Variables

Create a `.env.local` file in the `wallputty-site` directory with the following variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

Replace the placeholder values with your actual Firebase configuration.

## Step 4: Configure Authentication Providers

### Email/Password Authentication
- Already enabled by default
- No additional configuration needed

### Phone Authentication
1. In Firebase Console, go to Authentication > Sign-in method
2. Enable "Phone" provider
3. Add your test phone numbers (for development)
4. Configure reCAPTCHA settings

### Google Authentication
1. In Firebase Console, go to Authentication > Sign-in method
2. Enable "Google" provider
3. Add your authorized domain
4. Configure OAuth consent screen (if needed)

### Facebook Authentication
1. In Firebase Console, go to Authentication > Sign-in method
2. Enable "Facebook" provider
3. Create a Facebook App at https://developers.facebook.com/
4. Add your Facebook App ID and App Secret
5. Configure OAuth redirect URI

## Step 5: Security Rules (Optional)

For production, consider setting up Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Step 6: Testing

1. Start your development server: `npm run dev`
2. Navigate to the login page
3. Test each authentication method:
   - Email/Password login
   - Phone number verification
   - Google OAuth
   - Facebook OAuth

## Troubleshooting

### Common Issues:

1. **"Firebase App not initialized"**
   - Check that all environment variables are set correctly
   - Ensure `.env.local` file is in the correct location

2. **"reCAPTCHA not working"**
   - Verify reCAPTCHA is enabled in Firebase Console
   - Check domain authorization settings

3. **"Google/Facebook login not working"**
   - Verify OAuth providers are properly configured
   - Check authorized domains in Firebase Console
   - Ensure OAuth consent screen is configured

4. **"Phone verification failing"**
   - Add test phone numbers in Firebase Console
   - Check SMS quota and billing setup

## Production Deployment

1. Update authorized domains in Firebase Console
2. Configure proper OAuth redirect URIs
3. Set up proper security rules
4. Enable billing for SMS verification
5. Configure proper error handling and logging

## Support

For Firebase-specific issues, refer to:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth)
- [Firebase Console](https://console.firebase.google.com/) 