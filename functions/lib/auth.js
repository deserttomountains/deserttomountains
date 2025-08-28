"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidE164 = exports.normalizePhoneNumber = exports.syncUserProfile = exports.onAuthDelete = exports.onAuthCreate = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();
/**
 * Cloud Function triggered when a new user is created in Firebase Auth
 * This ensures Firestore user profile is always in sync with Auth
 */
exports.onAuthCreate = functions.auth.user().onCreate(async (user) => {
    try {
        console.log(`onAuthCreate triggered for user: ${user.uid}`);
        // Extract user information from the Auth user object
        const email = user.email || '';
        const phone = user.phoneNumber || '';
        // Get display name parts if available
        const displayNameParts = user.displayName ? user.displayName.split(' ') : [];
        const firstName = displayNameParts[0] || '';
        const lastName = displayNameParts.slice(1).join(' ') || '';
        // Create user profile document
        const userProfile = {
            uid: user.uid,
            email: email,
            role: 'customer', // Default role
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            address: {},
            createdAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now()
        };
        // Save to Firestore
        await db.collection('users').doc(user.uid).set(userProfile);
        console.log(`User profile created in Firestore for: ${user.uid}`);
        return null;
    }
    catch (error) {
        console.error('Error in onAuthCreate:', error);
        throw error;
    }
});
/**
 * Cloud Function triggered when a user is deleted from Firebase Auth
 * This cleans up the corresponding Firestore user profile
 */
exports.onAuthDelete = functions.auth.user().onDelete(async (user) => {
    try {
        console.log(`onAuthDelete triggered for user: ${user.uid}`);
        // Delete the user profile from Firestore
        await db.collection('users').doc(user.uid).delete();
        console.log(`User profile deleted from Firestore for: ${user.uid}`);
        return null;
    }
    catch (error) {
        console.error('Error in onAuthDelete:', error);
        throw error;
    }
});
/**
 * HTTP Cloud Function to manually sync user profiles
 * This can be called to update Firestore profiles when Auth changes
 * Call with POST: { uid: "user-id" }
 */
exports.syncUserProfile = functions.https.onCall(async (data, context) => {
    try {
        // Verify user is authenticated
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
        }
        const uid = data.uid || context.auth.uid;
        // Only allow users to sync their own profile, or admins to sync any profile
        if (uid !== context.auth.uid) {
            // Check if user is admin
            const userDoc = await db.collection('users').doc(context.auth.uid).get();
            const userData = userDoc.data();
            if (!userData || userData.role !== 'admin') {
                throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
            }
        }
        console.log(`syncUserProfile called for user: ${uid}`);
        // Get the current Auth user
        const authUser = await admin.auth().getUser(uid);
        // Get current user profile from Firestore
        const userDoc = await db.collection('users').doc(uid).get();
        if (!userDoc.exists) {
            // Create new profile if it doesn't exist
            console.log('User profile does not exist in Firestore, creating new one');
            const displayNameParts = authUser.displayName ? authUser.displayName.split(' ') : [];
            const firstName = displayNameParts[0] || '';
            const lastName = displayNameParts.slice(1).join(' ') || '';
            const userProfile = {
                uid: authUser.uid,
                email: authUser.email || '',
                role: 'customer',
                firstName: firstName,
                lastName: lastName,
                phone: authUser.phoneNumber || '',
                address: {},
                createdAt: admin.firestore.Timestamp.now(),
                updatedAt: admin.firestore.Timestamp.now()
            };
            await db.collection('users').doc(uid).set(userProfile);
            return { success: true, action: 'created' };
        }
        else {
            // Update existing profile
            console.log('Updating existing user profile');
            const displayNameParts = authUser.displayName ? authUser.displayName.split(' ') : [];
            const updates = {
                email: authUser.email || '',
                phone: authUser.phoneNumber || '',
                firstName: displayNameParts[0] || '',
                lastName: displayNameParts.slice(1).join(' ') || '',
                updatedAt: admin.firestore.Timestamp.now()
            };
            await db.collection('users').doc(uid).update(updates);
            return { success: true, action: 'updated' };
        }
    }
    catch (error) {
        console.error('Error in syncUserProfile:', error);
        throw new functions.https.HttpsError('internal', 'Failed to sync user profile');
    }
});
/**
 * Utility function to validate and normalize phone numbers
 * Ensures phone numbers are in E.164 format
 */
const normalizePhoneNumber = (phone) => {
    if (!phone)
        return '';
    // Remove all non-digit characters except +
    let normalized = phone.replace(/[^\d+]/g, '');
    // If it doesn't start with +, assume it's missing the country code
    if (!normalized.startsWith('+')) {
        // Default to India (+91) if no country code - adjust as needed
        normalized = '+91' + normalized;
    }
    return normalized;
};
exports.normalizePhoneNumber = normalizePhoneNumber;
/**
 * Helper function to check if a phone number is valid E.164 format
 */
const isValidE164 = (phone) => {
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phone);
};
exports.isValidE164 = isValidE164;
//# sourceMappingURL=auth.js.map