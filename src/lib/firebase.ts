import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signInWithPhoneNumber, 
  GoogleAuthProvider, 
  signInWithPopup,
  RecaptchaVerifier,
  PhoneAuthProvider,
  UserCredential,
  AuthError,
  Auth,
  createUserWithEmailAndPassword,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection,
  Firestore
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'demo-app-id',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'demo-measurement-id'
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (error) {
  console.warn('Firebase initialization failed:', error);
  // Create a mock auth object for development
  auth = {
    currentUser: null,
    onAuthStateChanged: () => () => {},
    signOut: async () => {},
  } as any;
  app = {} as FirebaseApp;
  db = {} as Firestore;
  storage = {};
}

// Initialize provider
export const googleProvider = new GoogleAuthProvider();

// Export auth and db
export { auth, db, storage };

// User role types
export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Lead interface
export interface Lead {
  id?: string;
  name: string;
  email?: string;
  phone: string;
  source: string;
  status: string;
  interest: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // Admin UID who created the lead
}

// Configure provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Authentication service class
export class AuthService {
  // Check if Firebase is properly configured
  private static isFirebaseConfigured(): boolean {
    return !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
           process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'demo-api-key';
  }

  // Create user profile in Firestore
  static async createUserProfile(user: User, additionalData?: { firstName?: string; lastName?: string; phone?: string }): Promise<void> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        role: 'customer', // Default role
        firstName: additionalData?.firstName || '',
        lastName: additionalData?.lastName || '',
        phone: additionalData?.phone || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw new Error('Failed to create user profile');
    }
  }

  // Get user role from Firestore
  static async getUserRole(uid: string): Promise<UserRole> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data().role as UserRole;
      }
      return 'customer'; // Default role if no profile exists
    } catch (error) {
      console.error('Error getting user role:', error);
      return 'customer'; // Default role on error
    }
  }

  // Get user profile from Firestore
  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Update user profile
  static async updateUserProfile(uid: string, updatedProfile: UserProfile): Promise<void> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      await setDoc(doc(db, 'users', uid), updatedProfile);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
  }

  // Update user role (utility function for testing)
  static async updateUserRole(uid: string, role: UserRole): Promise<void> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const userProfile = await this.getUserProfile(uid);
      if (userProfile) {
        await setDoc(doc(db, 'users', uid), {
          ...userProfile,
          role,
          updatedAt: new Date()
        });
      } else {
        throw new Error('User profile not found');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      throw new Error('Failed to update user role');
    }
  }

  // Lead Management Methods
  static async createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>, createdBy: string): Promise<string> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const lead: Lead = {
        ...leadData,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy
      };

      const leadRef = doc(collection(db, 'leads'));
      await setDoc(leadRef, lead);
      return leadRef.id;
    } catch (error) {
      console.error('Error creating lead:', error);
      throw new Error('Failed to create lead');
    }
  }

  static async getLeads(): Promise<Lead[]> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const { getDocs, query, orderBy } = await import('firebase/firestore');
      const leadsQuery = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(leadsQuery);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Lead[];
    } catch (error) {
      console.error('Error getting leads:', error);
      throw new Error('Failed to get leads');
    }
  }

  static async updateLead(leadId: string, updatedData: Partial<Lead>): Promise<void> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      await setDoc(doc(db, 'leads', leadId), {
        ...updatedData,
        updatedAt: new Date()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating lead:', error);
      throw new Error('Failed to update lead');
    }
  }

  static async deleteLead(leadId: string): Promise<void> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'leads', leadId));
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw new Error('Failed to delete lead');
    }
  }

  // Email/Password authentication
  static async signInWithEmail(email: string, password: string): Promise<UserCredential> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }
    
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  // Phone number authentication
  static async signInWithPhone(phoneNumber: string, appVerifier: RecaptchaVerifier): Promise<any> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }
    
    try {
      return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  // Google authentication
  static async signInWithGoogle(): Promise<UserCredential> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }
    
    try {
      return await signInWithPopup(auth, googleProvider);
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  // Sign out
  static async signOut(): Promise<void> {
    try {
      await auth.signOut();
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  // Email/Password signup
  static async createUserWithEmail(email: string, password: string, additionalData?: { firstName?: string; lastName?: string; phone?: string }): Promise<UserCredential> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      await this.createUserProfile(userCredential.user, additionalData);
      
      return userCredential;
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  // Fetch all customers
  static async getCustomers(): Promise<UserProfile[]> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }
    try {
      const { getDocs, query, collection, where, orderBy } = await import('firebase/firestore');
      const customersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'customer'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(customersQuery);
      return querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as UserProfile[];
    } catch (error) {
      console.error('Error getting customers:', error);
      throw new Error('Failed to get customers');
    }
  }

  // Paginated fetch for customers
  static async getCustomersPaginated(pageSize: number, startAfterDoc?: any): Promise<{ customers: UserProfile[]; lastDoc: any; }> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }
    try {
      const { getDocs, query, collection, where, orderBy, limit, startAfter } = await import('firebase/firestore');
      let customersQuery;
      if (startAfterDoc) {
        customersQuery = query(
          collection(db, 'users'),
          where('role', '==', 'customer'),
          orderBy('createdAt', 'desc'),
          startAfter(startAfterDoc),
          limit(pageSize)
        );
      } else {
        customersQuery = query(
          collection(db, 'users'),
          where('role', '==', 'customer'),
          orderBy('createdAt', 'desc'),
          limit(pageSize)
        );
      }
      const querySnapshot = await getDocs(customersQuery);
      const customers = querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as UserProfile[];
      const lastDoc = querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null;
      return { customers, lastDoc };
    } catch (error) {
      console.error('Error getting paginated customers:', error);
      throw new Error('Failed to get paginated customers');
    }
  }

  // Delete user profile
  static async deleteUser(uid: string): Promise<void> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }
    try {
      const { deleteDoc, doc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'users', uid));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  // Handle authentication errors
  private static handleAuthError(error: AuthError): Error {
    let message = 'An error occurred during authentication.';
    
    switch (error.code) {
      case 'auth/user-not-found':
        message = 'No account found with this email address.';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password. Please try again.';
        break;
      case 'auth/invalid-email':
        message = 'Please enter a valid email address.';
        break;
      case 'auth/weak-password':
        message = 'Password should be at least 6 characters long.';
        break;
      case 'auth/email-already-in-use':
        message = 'An account with this email already exists.';
        break;
      case 'auth/invalid-phone-number':
        message = 'Please enter a valid phone number.';
        break;
      case 'auth/invalid-verification-code':
        message = 'Invalid verification code. Please try again.';
        break;
      case 'auth/captcha-check-failed':
        message = 'Captcha verification failed. Please try again.';
        break;
      case 'auth/too-many-requests':
        message = 'Too many failed attempts. Please try again later.';
        break;
      case 'auth/popup-closed-by-user':
        message = 'Login popup was closed. Please try again.';
        break;
      case 'auth/popup-blocked':
        message = 'Login popup was blocked. Please allow popups and try again.';
        break;
      case 'auth/account-exists-with-different-credential':
        message = 'An account already exists with the same email but different sign-in credentials.';
        break;
      case 'auth/operation-not-allowed':
        message = 'This sign-in method is not enabled. Please contact support.';
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Please check your connection and try again.';
        break;
      default:
        message = error.message || 'An unexpected error occurred.';
    }
    
    return new Error(message);
  }
}

export default app; 