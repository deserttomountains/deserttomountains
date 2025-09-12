# Firebase Storage Setup Guide

## Overview

This guide will help you set up Firebase Storage for the WhatsApp template system to store media files (images, videos, documents) securely in the cloud.

## Prerequisites

1. Firebase project created
2. Firebase Storage enabled
3. Firebase project configured in your application

## Step 1: Enable Firebase Storage

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. In the left sidebar, click **Storage**
4. Click **Get started**
5. Choose **Start in production mode** (we'll customize rules later)
6. Select a storage location (choose the closest to your users)

## Step 2: Configure Storage Security Rules

1. In Firebase Console, go to **Storage** → **Rules**
2. Replace the default rules with our custom rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Template media files
    match /templates/media/{allPaths=**} {
      // Allow read/write for authenticated users
      allow read, write: if request.auth != null;
      
      // Allow public read for template media (for WhatsApp templates)
      allow read: if true;
    }
    
    // User profile images (if needed in future)
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if true; // Public read for profile images
    }
    
    // General uploads (if needed)
    match /uploads/{allPaths=**} {
      allow read, write: if request.auth != null;
      allow read: if true;
    }
    
    // Default deny rule
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click **Publish**

## Step 3: Update Environment Variables

Add these variables to your `.env.local` file:

```env
# Firebase Storage Configuration
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
```

Replace `your-project-id` with your actual Firebase project ID.

## Step 4: Deploy Storage Rules (Optional)

If you want to deploy the storage rules via CLI:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init storage

# Deploy storage rules
firebase deploy --only storage
```

## Step 5: Test the Implementation

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Go to Admin → Templates
3. Create a new template
4. Try uploading an image file
5. Check Firebase Console → Storage to see if the file was uploaded

## Storage Structure

Files will be organized as follows:

```
templates/
├── media/
│   ├── template_1234567890_abc123.jpg
│   ├── template_1234567891_def456.png
│   └── template_1234567892_ghi789.pdf
```

## File Naming Convention

- Format: `template_{timestamp}_{randomId}.{extension}`
- Example: `template_1703123456789_abc123def.jpg`
- This ensures unique file names and prevents conflicts

## Security Features

### Authentication Required
- Only authenticated users can upload files
- Users must be logged in to access the template system

### Public Read Access
- Template media files are publicly readable
- This allows WhatsApp to access images/videos in templates
- Upload still requires authentication

### File Validation
- Client-side validation for file type and size
- Server-side validation through Firebase Storage rules
- 2MB limit for images, 10MB for videos, 5MB for documents

## Supported File Types

### Images
- JPEG/JPG
- PNG
- GIF
- WebP

### Videos
- MP4
- AVI
- MOV
- QuickTime

### Documents
- PDF
- DOC
- DOCX

## Cost Considerations

### Firebase Storage Pricing
- **Storage**: $0.026/GB/month
- **Bandwidth**: $0.12/GB (first 1GB free)
- **Operations**: $0.05/10,000 operations (first 50,000 free)

### Example Costs
- 1,000 templates with 1MB images each = 1GB storage
- Monthly storage cost: ~$0.026
- Bandwidth cost: ~$0.12 per GB downloaded

## Monitoring and Analytics

1. **Storage Usage**: Firebase Console → Storage → Usage tab
2. **File Operations**: Firebase Console → Storage → Files tab
3. **Error Logs**: Firebase Console → Functions → Logs (if using Cloud Functions)

## Troubleshooting

### Common Issues

1. **Upload Failed**
   - Check Firebase Storage is enabled
   - Verify storage rules are deployed
   - Ensure user is authenticated

2. **Permission Denied**
   - Check storage rules syntax
   - Verify user authentication status
   - Ensure file path matches rule patterns

3. **File Not Found**
   - Check if file was actually uploaded
   - Verify file path in Firebase Console
   - Check if file was deleted

### Debug Steps

1. Check browser console for errors
2. Verify Firebase configuration
3. Test with Firebase Console directly
4. Check network tab for failed requests

## Migration from Base64

If you have existing templates with base64 media:

1. Create a migration script to convert base64 to Firebase Storage
2. Upload base64 data as files to Firebase Storage
3. Update template records with new Firebase URLs
4. Remove base64 data from templates

## Best Practices

1. **File Compression**: Compress images before upload
2. **CDN Usage**: Firebase Storage includes automatic CDN
3. **Cleanup**: Implement cleanup for unused files
4. **Monitoring**: Set up alerts for storage usage
5. **Backup**: Regular backups of important files

## Support

For issues with Firebase Storage:
- [Firebase Storage Documentation](https://firebase.google.com/docs/storage)
- [Firebase Support](https://firebase.google.com/support)
- [Stack Overflow - Firebase Storage](https://stackoverflow.com/questions/tagged/firebase-storage)
