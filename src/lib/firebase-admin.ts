/**
 * Firebase Admin SDK Configuration
 * For server-side operations that need to bypass Firestore security rules
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
let adminApp;
let adminDb;

try {
  // Check if already initialized
  if (getApps().length === 0) {
    // For development, we'll use the default service account
    // In production, you should use a proper service account key
    adminApp = initializeApp({
      // Use default credentials in development
      // In production, use: credential: cert(serviceAccountKey)
    });
  } else {
    adminApp = getApps()[0];
  }
  
  adminDb = getFirestore(adminApp);
} catch (error) {
  console.warn('Firebase Admin initialization failed:', error);
  // Create a mock for development
  adminDb = {
    collection: () => ({
      doc: () => ({
        get: () => Promise.resolve({ exists: false }),
        set: () => Promise.resolve(),
        update: () => Promise.resolve(),
        delete: () => Promise.resolve()
      }),
      add: () => Promise.resolve({ id: 'mock-id' }),
      where: () => ({
        get: () => Promise.resolve({ docs: [], empty: true })
      })
    })
  } as any;
}

export { adminDb };
