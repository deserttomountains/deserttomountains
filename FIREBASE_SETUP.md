# Firebase Setup Guide

## Firestore Security Rules

Add these security rules to your Firestore database in the Firebase Console:

### Go to Firebase Console > Firestore Database > Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Leads collection - only admin users can read/write
    match /leads/{leadId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### Alternative: More Permissive Rules (for testing)

If you want to test without role-based restrictions temporarily:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Leads collection - allow all authenticated users (for testing)
    match /leads/{leadId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Steps to Update Rules:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database** in the left sidebar
4. Click on the **Rules** tab
5. Replace the existing rules with one of the above rule sets
6. Click **Publish**

## Testing the Rules:

After updating the rules, try adding a lead again. The errors should be resolved.

## Security Note:

The first rule set is more secure as it only allows admin users to access leads. The second rule set allows any authenticated user to access leads (useful for testing but less secure for production). 