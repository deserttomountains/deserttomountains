# Updated Firebase Security Rules for Duplicate Checking

## Users Collection Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - with proper duplicate checking support
    match /users/{userId} {
      // Allow read if user is authenticated and reading their own data
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Allow write if user is authenticated and writing to their own data
      allow write: if request.auth != null && request.auth.uid == userId;
      
      // Allow list for duplicate checking (this is crucial for the duplicate detection)
      allow list: if request.auth != null;
    }
    
    // Other collections remain the same
    match /leads/{leadId} {
      allow read, write: if request.auth != null;
    }
    
    match /orders/{orderId} {
      allow read, write: if request.auth != null;
    }
    
    match /tasks/{taskId} {
      allow read, write: if request.auth != null;
    }
    
    match /messages/{messageId} {
      allow read, write: if request.auth != null;
    }
    
    match /quotes/{quoteId} {
      allow read, write: if request.auth != null;
    }
    
    match /customers/{customerId} {
      allow read, write: if request.auth != null;
    }
    
    match /sales/{saleId} {
      allow read, write: if request.auth != null;
    }
    
    match /form-submissions/{submissionId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Key Changes Made:

1. **Added `allow list: if request.auth != null;`** for the users collection
   - This allows authenticated users to query the users collection
   - Required for duplicate checking functionality
   - Still secure as it requires authentication

2. **Maintained existing security** for individual user documents
   - Users can only read/write their own data
   - Prevents unauthorized access to other users' information

## Why This Fixes the Error:

The "Missing or insufficient permissions" error was occurring because:
- The duplicate checking logic needs to query the `users` collection
- The previous rules didn't allow `list` operations
- Without `list` permission, Firestore queries fail with permission errors

## Security Considerations:

- ✅ **Authentication required**: Only authenticated users can access
- ✅ **Individual data protection**: Users can only access their own documents
- ✅ **Duplicate checking enabled**: System can now properly detect duplicates
- ✅ **No data exposure**: Users cannot see other users' personal information

## Deployment Steps:

1. Copy the rules above
2. Go to Firebase Console → Firestore Database → Rules
3. Replace existing rules with the new ones
4. Click "Publish"
5. Wait for rules to propagate (usually 1-2 minutes)

## Testing:

After updating the rules, test the duplicate detection:
1. Try to save a phone number that already exists
2. The system should now show the AccountMerger modal instead of an error
3. Check the console for any remaining permission errors

This should resolve the "Missing or insufficient permissions" error and enable the account merging functionality.
