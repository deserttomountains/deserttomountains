/**
 * Firebase Storage Test Script
 * Run this to test if Firebase Storage is working properly
 */

// Test Firebase Storage connectivity
async function testFirebaseStorage() {
  console.log('🧪 Testing Firebase Storage...');
  
  try {
    // Import Firebase modules
    const { initializeApp } = await import('firebase/app');
    const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
    
    // Firebase configuration (replace with your actual config)
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'demo-app-id'
    };
    
    console.log('📋 Firebase Config:', {
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
      apiKey: firebaseConfig.apiKey ? '✅ Set' : '❌ Missing'
    });
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const storage = getStorage(app);
    
    console.log('✅ Firebase Storage initialized successfully');
    
    // Test creating a reference
    const testRef = ref(storage, 'test/test-file.txt');
    console.log('✅ Storage reference created:', testRef.fullPath);
    
    // Test uploading a simple text file
    const testContent = 'Hello Firebase Storage!';
    const blob = new Blob([testContent], { type: 'text/plain' });
    
    console.log('📤 Attempting to upload test file...');
    const snapshot = await uploadBytes(testRef, blob);
    console.log('✅ File uploaded successfully:', snapshot.ref.fullPath);
    
    // Test getting download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('✅ Download URL generated:', downloadURL);
    
    console.log('🎉 Firebase Storage test completed successfully!');
    console.log('📝 Next steps:');
    console.log('   1. Deploy the updated storage rules');
    console.log('   2. Test template media upload in the admin panel');
    
  } catch (error) {
    console.error('❌ Firebase Storage test failed:', error);
    console.log('🔍 Troubleshooting steps:');
    console.log('   1. Check your Firebase configuration in .env.local');
    console.log('   2. Ensure Firebase Storage is enabled in console');
    console.log('   3. Deploy the updated storage rules');
    console.log('   4. Check Firebase project permissions');
  }
}

// Run the test
testFirebaseStorage();

