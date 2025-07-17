# Firebase Setup Guide

## Firestore Security Rules

Add these security rules to your Firestore database in the Firebase Console:

### Go to Firebase Console > Firestore Database > Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can read/write their own profile, admins can read all
    match /users/{userId} {
      allow read, write: if request.auth != null && (
        request.auth.uid == userId || 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
      );
    }
    
    // Leads collection - only admin users can read/write
    match /leads/{leadId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Orders collection - only admin users can read/write
    match /orders/{orderId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Deals collection - only admin users can read/write
    match /deals/{dealId} {
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
    // Users collection - users can read/write their own profile, admins can read all
    match /users/{userId} {
      allow read, write: if request.auth != null && (
        request.auth.uid == userId || 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
      );
    }
    
    // Leads collection - allow all authenticated users (for testing)
    match /leads/{leadId} {
      allow read, write: if request.auth != null;
    }
    
    // Orders collection - allow all authenticated users (for testing)
    match /orders/{orderId} {
      allow read, write: if request.auth != null;
    }
    
    // Deals collection - allow all authenticated users (for testing)
    match /deals/{dealId} {
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

After updating the rules, try adding a lead or creating test orders again. The errors should be resolved.

## Collections in Firestore:

Your Firestore database should now have these collections:
- `users` - User profiles and authentication data
- `leads` - Lead management data
- `orders` - Order management data
- `deals` - Deal management data (if using deals feature)

## Security Note:

The first rule set is more secure as it only allows admin users to access leads. The second rule set allows any authenticated user to access leads (useful for testing but less secure for production).

## Temporary Testing Rules (Use Only for Development)

If you're still getting permission errors during development, you can use these very permissive rules temporarily:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all authenticated users to read/write all documents
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

⚠️ **WARNING:** These rules allow any authenticated user to access all data. Only use them for development/testing and never in production!

## Troubleshooting Permission Errors:

1. **Check User Role:** Ensure your user has `role: "admin"` in their profile
2. **Create Admin Profile:** If no profile exists, the admin page will now auto-create one
3. **Use Testing Rules:** If still having issues, temporarily use the permissive rules above
4. **Check Console:** Look for specific error messages in the browser console
5. **Customers Tab Error:** If you get "Missing or insufficient permissions" on the customers tab, make sure you've updated the Firestore rules to allow admin users to read the users collection (see the updated rules above) 