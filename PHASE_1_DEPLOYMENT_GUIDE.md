# Phase 1: Backend Infrastructure - Deployment Guide

## ✅ Completed Tasks

### 1. **Firebase Cloud Functions Structure** ✅
- Created `functions/` directory with proper TypeScript setup
- Added `firebase.json` and `.firebaserc` configuration files
- Set up `package.json` with necessary dependencies
- Created main `index.ts` and `auth.ts` files

### 2. **Auth Trigger Functions** ✅
- **`onAuthCreate`**: Automatically creates Firestore user profile when Firebase Auth user is created
- **`onAuthUpdate`**: Keeps Firestore profile in sync when Auth user is updated (email, phone, displayName)
- **Helper functions**: Phone number normalization and E.164 validation

### 3. **Security Rules** ✅
- **Email/Phone Protection**: Clients cannot directly write to `email` and `phone` fields
- **Server-Only Updates**: Only Cloud Functions can modify email/phone in Firestore
- **Duplicate Checking**: Maintained `list` permission for duplicate detection
- **Role-Based Access**: Proper admin/customer separation for other collections

## 🚀 Deployment Steps

### Step 1: Update Firebase Project ID
```bash
# Edit .firebaserc and replace "your-firebase-project-id" with your actual project ID
```

### Step 2: Install Dependencies
```bash
cd functions
npm install
cd ..
```

### Step 3: Build Functions
```bash
cd functions
npm run build
cd ..
```

### Step 4: Deploy to Firebase
```bash
# Deploy functions
firebase deploy --only functions

# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

### Step 5: Test the Setup
1. Create a new user via your app
2. Check Firebase Auth console - user should appear
3. Check Firestore console - user profile should be automatically created
4. Try updating user email in Firebase Auth console - Firestore should sync

## 🔒 Security Improvements

### Before (Vulnerable):
```javascript
// Clients could directly modify email/phone
allow write: if request.auth != null && request.auth.uid == userId;
```

### After (Secure):
```javascript
// Clients cannot modify email/phone - only server functions can
allow update: if request.auth != null && 
             request.auth.uid == userId &&
             (!('email' in request.resource.data) || 
              request.resource.data.email == resource.data.email) &&
             (!('phone' in request.resource.data) || 
              request.resource.data.phone == resource.data.phone);
```

## 🔧 Key Features

### Automatic Profile Creation
- No more manual `createUserProfile` calls needed
- Handles all auth methods (email, phone, Google, etc.)
- Consistent data structure

### Real-Time Sync
- Email changes in Firebase Auth → automatically updates Firestore
- Phone changes in Firebase Auth → automatically updates Firestore
- Display name changes → updates firstName/lastName in Firestore

### E.164 Phone Formatting
- Built-in phone number normalization
- Validation for proper E.164 format
- Default country code handling (currently set to +91 for India)

## ⚠️ Important Notes

1. **Existing Users**: Current users won't be affected, but new auth changes will trigger the functions
2. **Client Code**: Your existing client-side code will continue to work
3. **Migration**: You may want to run a one-time migration to ensure all existing users have proper profiles
4. **Country Code**: Update the default country code in `functions/src/auth.ts` if needed

## 🔄 Next Steps (Phase 2)

With the backend infrastructure complete, you can now proceed to:
1. Implement proper E.164 phone number formatting in the frontend
2. Create the AuthLinking service
3. Update error handling for credential conflicts

The backend is now ready to support proper Firebase Auth linking!

