import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
admin.initializeApp();

// Export auth functions
export { onAuthCreate, onAuthDelete, syncUserProfile } from "./auth";

