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
  User,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
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

// Utility function to safely convert Firestore dates
const convertFirestoreDate = (date: any): Date | null => {
  if (!date) return null;
  
  try {
    // If it's already a Date object
    if (date instanceof Date) return date;
    
    // If it's a Firestore Timestamp
    if (date && typeof date === 'object' && date.toDate) {
      return date.toDate();
    }
    
    // If it's a string or number
    if (typeof date === 'string' || typeof date === 'number') {
      const converted = new Date(date);
      if (!isNaN(converted.getTime())) {
        return converted;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error converting date:', error, date);
    return null;
  }
};

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

export interface Address {
  street?: string; // Legacy field for backward compatibility
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: Address;
  createdAt: Date;
  updatedAt: Date;
}

// Lead interface
export interface Lead {
  id?: string;
  name: string;
  email?: string;
  phone: string;
  countryCode?: string;
  source: string;
  status: string;
  interest: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // Admin UID who created the lead
  quotes?: string[]; // Array of quote IDs associated with this lead
}

// Quote interface
export interface Quote {
  id?: string;
  quoteNumber: string;
  
  // Customer info
  leadId: string | null;
  customerId: string; // Link to customer profile
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerInterest: string;
  
  // Quote details
  items: { productId: string; quantity: number }[];
  subtotal: number;
  discount: number;
  discountType: 'percentage' | 'amount';
  shippingCharges: number;
  includeShipping: boolean;
  total: number;
  validUntil: string;
  
  // Payment & company
  paymentLink: string;
  companyDetails: {
    name: string;
    logo: string;
    address: string;
    phone: string;
    email: string;
    gst: string;
  };
  
  // Status & tracking
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  
  // Auto-expiry
  isExpired: boolean;
  
  // Quote type and editing
  quoteType: 'initial' | 'revision' | 'alternative' | 'followup';
  isEditable: boolean;
  lastEditedAt?: Date;
  editHistory?: Array<{
    field: string;
    oldValue: any;
    newValue: any;
    editedAt: Date;
    editedBy: string;
  }>;
}

// Deal interface
export interface Deal {
  id?: string;
  title: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  product: string;
  amount: number;
  stage: 'lead_generation' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number; // 0-100
  expectedCloseDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // Admin UID who created the deal
}

// Order interface
export interface Order {
  id?: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  tax: number;
  shipping: number;
  finalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  shippingAddress: Address;
  orderDate: Date;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  trackingNumber?: string;
  notes?: string;
  transactionId?: string;
  paymentMode?: string;
  paymentMessage?: string;
  paymentTime?: string;
  lastUpdated?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Order Item interface
export interface OrderItem {
  productId: string;
  productName: string;
  productType: 'aura' | 'dhunee';
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variant?: string;
  shades?: string[];
}

// Task interface
export interface Task {
  id?: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'follow_up' | 'meeting' | 'delivery' | 'marketing' | 'support' | 'other';
  dueDate: Date;
  createdAt: Date;
  completedAt?: Date;
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
  tags: string[];
  notes: string;
  relatedTo?: {
    type: 'lead' | 'order' | 'customer';
    id: string;
    name: string;
  };
  recurring?: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
  };
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
  reminders?: {
    type: 'email' | 'notification';
    time: Date;
    sent: boolean;
  }[];
  createdBy: string; // Admin UID who created the task
  updatedAt: Date;
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

  // Check if user profile exists, create if not
  static async createUserProfile(user: User, additionalData?: { firstName?: string; lastName?: string; phone?: string; address?: Address }): Promise<void> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      console.log('Creating user profile for:', user.uid, user.email);
      
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        role: 'customer', // Default role
        firstName: additionalData?.firstName || '',
        lastName: additionalData?.lastName || '',
        phone: additionalData?.phone || '',
        address: additionalData?.address || {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);
      console.log('User profile created successfully for:', user.uid);
    } catch (error) {
      console.error('Error creating user profile:', error);
      
      // Enhanced error handling with specific error messages
      if (error instanceof Error) {
        if (error.message.includes('permission-denied')) {
          throw new Error('Permission denied. Please contact support for assistance.');
        } else if (error.message.includes('unavailable')) {
          throw new Error('Service temporarily unavailable. Please try again in a few minutes.');
        } else if (error.message.includes('deadline-exceeded')) {
          throw new Error('Request timed out. Please check your connection and try again.');
        }
      }
      
      throw new Error('Failed to create user profile. Please try again or contact support.');
    }
  }

  // Direct Firestore profile creation as fallback when Firebase Functions fail
  static async createUserProfileDirect(user: User, additionalData?: { firstName?: string; lastName?: string; phone?: string; address?: Address }): Promise<void> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      console.log('Creating user profile directly in Firestore for:', user.uid);
      
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        role: 'customer', // Default role
        firstName: additionalData?.firstName || '',
        lastName: additionalData?.lastName || '',
        phone: additionalData?.phone || '',
        address: additionalData?.address || {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Use setDoc with merge option to avoid overwriting existing data
      await setDoc(doc(db, 'users', user.uid), userProfile, { merge: true });
      console.log('User profile created directly in Firestore for:', user.uid);
    } catch (error) {
      console.error('Error creating user profile directly:', error);
      
      // Enhanced error handling with specific error messages
      if (error instanceof Error) {
        if (error.message.includes('permission-denied')) {
          throw new Error('Permission denied. Please contact support for assistance.');
        } else if (error.message.includes('unavailable')) {
          throw new Error('Service temporarily unavailable. Please try again in a few minutes.');
        } else if (error.message.includes('deadline-exceeded')) {
          throw new Error('Request timed out. Please check your connection and try again.');
        } else if (error.message.includes('already-exists')) {
          throw new Error('User profile already exists. Please try signing in instead.');
        }
      }
      
      throw new Error('Failed to create user profile directly. Please try again or contact support.');
    }
  }

  // Check if user exists by email
  static async checkUserExistsByEmail(email: string): Promise<{ exists: boolean; uid?: string }> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const { getDocs, query, where, collection } = await import('firebase/firestore');
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return { exists: true, uid: userDoc.id };
      }
      
      return { exists: false };
    } catch (error) {
      console.error('Error checking user by email:', error);
      throw new Error('Failed to check user existence');
    }
  }

  // Normalize phone number for comparison (remove spaces, dashes, parentheses)
  static normalizePhoneNumber(phone: string): string {
    // Remove all non-digit characters except +
    return phone.replace(/[^\d+]/g, '');
  }

  // Simple phone formatting - just add country code if missing
  static formatPhoneNumber(phone: string): string {
    if (!phone) return '';
    
    // If it already has a country code, return as is
    if (phone.startsWith('+')) {
      return phone;
    }
    
    // Otherwise, add +91 prefix for India
    const digits = phone.replace(/\D/g, '');
    return '+91' + digits;
  }

  // Alternative phone number formatting for more flexible input
  static formatPhoneNumberFlexible(phone: string): string {
    if (!phone) return '';
    
    // Remove all non-digit characters except +
    let formatted = phone.replace(/[^\d+]/g, '');
    
    // Handle different input formats
    if (formatted.startsWith('+')) {
      // Already has country code
      return formatted;
    } else if (formatted.startsWith('91') && formatted.length >= 12) {
      // Indian number starting with 91
      return '+' + formatted;
    } else if (formatted.startsWith('0') && formatted.length >= 11) {
      // Indian number starting with 0
      return '+91' + formatted.substring(1);
    } else if (formatted.length === 10) {
      // 10-digit Indian number
      return '+91' + formatted;
    } else if (formatted.length >= 10 && formatted.length <= 15) {
      // Other valid length numbers
      return '+' + formatted;
    }
    
    // If none of the above, add +91 prefix
    return '+91' + formatted;
  }

  // Simple phone validation - accept any reasonable phone number
  static validatePhoneNumber(phone: string): { isValid: boolean; error?: string } {
    if (!phone) {
      return { isValid: false, error: 'Phone number is required' };
    }
    
    // Remove any non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Very permissive validation - just check if it's not too short or too long
    if (digits.length < 7) {
      return { isValid: false, error: 'Phone number is too short' };
    }
    
    if (digits.length > 15) {
      return { isValid: false, error: 'Phone number is too long' };
    }
    
    // Accept any phone number with reasonable length
    return { isValid: true };
  }

  // Verify phone number with SMS code
  static async verifyPhoneNumber(verificationId: string, code: string): Promise<boolean> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const { PhoneAuthProvider, signInWithCredential } = await import('firebase/auth');
      const auth = getAuth(app);
      
      // Create credential
      const credential = PhoneAuthProvider.credential(verificationId, code);
      
      // Sign in with credential
      await signInWithCredential(auth, credential);
      
      return true;
    } catch (error) {
      console.error('Error verifying phone number:', error);
      return false;
    }
  }

  // Check if user exists by phone
  static async checkUserExistsByPhone(phone: string): Promise<{ exists: boolean; uid?: string }> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const { getDocs, query, where, collection } = await import('firebase/firestore');
      const usersRef = collection(db, 'users');
      
      // Normalize the input phone number
      const normalizedInputPhone = this.normalizePhoneNumber(phone);
      
      // Get all users and check for normalized phone match
      const usersSnapshot = await getDocs(usersRef);
      
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        if (userData.phone) {
          const normalizedStoredPhone = this.normalizePhoneNumber(userData.phone);
          if (normalizedStoredPhone === normalizedInputPhone) {
            return { exists: true, uid: userDoc.id };
          }
        }
      }
      
      return { exists: false };
    } catch (error) {
      console.error('Error checking user by phone:', error);
      throw new Error('Failed to check user existence');
    }
  }

  // Get user role from Firestore
  static async getUserRole(uid: string): Promise<UserRole> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    // Check global logout state
    if (this.isLoggingOut) {
      console.warn('Logout in progress, defaulting to customer role');
      return 'customer';
    }

    // Check if user is currently authenticated
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid !== uid) {
      console.warn('User not authenticated or UID mismatch, defaulting to customer role');
      return 'customer';
    }

    // Additional check: if auth state is null, don't make Firestore calls
    if (!auth.currentUser) {
      console.warn('Auth state is null, defaulting to customer role');
      return 'customer';
    }

    try {
      console.log('Getting user role for:', uid);
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (userDoc.exists()) {
        const role = userDoc.data().role as UserRole;
        console.log('User role found:', role, 'for user:', uid);
        return role;
      }
      
      console.log('No user profile found, defaulting to customer for user:', uid);
      return 'customer'; // Default role if no profile exists
    } catch (error) {
      console.error('Error getting user role:', error);
      // If it's a permission error, just return customer instead of logging error
      if (error instanceof Error && error.message.includes('permission')) {
        console.warn('Permission denied for role fetch, user may be signing out');
        return 'customer';
      }
      return 'customer'; // Default role on error
    }
  }

  // Get user profile from Firestore
  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    // Check global logout state
    if (this.isLoggingOut) {
      console.warn('Logout in progress, skipping profile fetch');
      return null;
    }

    // Check if user is currently authenticated
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid !== uid) {
      console.warn('User not authenticated or UID mismatch, skipping profile fetch');
      return null;
    }

    // Additional check: if auth state is null, don't make Firestore calls
    if (!auth.currentUser) {
      console.warn('Auth state is null, skipping profile fetch');
      return null;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      // If it's a permission error, just return null instead of logging error
      if (error instanceof Error && error.message.includes('permission')) {
        console.warn('Permission denied for profile fetch, user may be signing out');
        return null;
      }
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
      throw new Error(error instanceof Error ? error.message : 'Failed to update user profile');
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

  // Save or update user address and profile in Firestore
  static async saveUserAddress(uid: string, address: any): Promise<void> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }
    try {
      // Map address fields to match our Firestore structure
      const mappedAddress: Address = {
        addressLine1: address.addressLine1 || address.street || '',
        addressLine2: address.addressLine2 || '',
        city: address.city || '',
        state: address.state || '',
        pincode: address.pincode || address.postalCode || '',
        country: address.country || '',
        // Keep street for backward compatibility
        street: address.addressLine1 || address.street || ''
      };

      // Extract name parts from fullName
      const fullName = address.fullName || '';
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Prepare user profile data
      const userProfileData: any = {
        address: mappedAddress,
        updatedAt: new Date()
      };

      // Add profile fields if they exist
      if (firstName) userProfileData.firstName = firstName;
      if (lastName) userProfileData.lastName = lastName;
      if (address.phone) userProfileData.phone = address.phone;
      if (address.email) userProfileData.email = address.email;

      await setDoc(doc(db, 'users', uid), userProfileData, { merge: true });
    } catch (error) {
      console.error('Error saving user address:', error);
      throw new Error('Failed to save user address');
    }
  }

  // Lead Management Methods
  static async createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>, createdBy: string): Promise<string> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      // Check for duplicate leads based on email or phone
      const { getDocs, query, where, collection: firestoreCollection } = await import('firebase/firestore');
      
      // Build query conditions for duplicate check
      const duplicateConditions = [];
      
      if (leadData.email) {
        duplicateConditions.push(where('email', '==', leadData.email));
      }
      if (leadData.phone) {
        duplicateConditions.push(where('phone', '==', leadData.phone));
      }
      
      // If we have conditions to check, query for duplicates
      if (duplicateConditions.length > 0) {
        // Check for exact email match
        if (leadData.email) {
          const emailQuery = query(firestoreCollection(db, 'leads'), where('email', '==', leadData.email));
          const emailSnapshot = await getDocs(emailQuery);
          if (!emailSnapshot.empty) {
            const existingLead = emailSnapshot.docs[0].data();
            throw new Error(`A lead with email "${leadData.email}" already exists (${existingLead.name})`);
          }
        }
        
        // Check for exact phone match
        if (leadData.phone) {
          const phoneQuery = query(firestoreCollection(db, 'leads'), where('phone', '==', leadData.phone));
          const phoneSnapshot = await getDocs(phoneQuery);
          if (!phoneSnapshot.empty) {
            const existingLead = phoneSnapshot.docs[0].data();
            throw new Error(`A lead with phone "${leadData.phone}" already exists (${existingLead.name})`);
          }
        }
      }

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
      throw new Error(error instanceof Error ? error.message : 'Failed to create lead');
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
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Convert Firestore Timestamps to JavaScript Date objects
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
        };
      }) as Lead[];
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

  // Check for duplicate leads before creation
  static async checkDuplicateLead(email?: string, phone?: string): Promise<{ isDuplicate: boolean; existingLead?: Lead; reason?: string }> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const { getDocs, query, where, collection: firestoreCollection } = await import('firebase/firestore');
      
      // Check for exact email match
      if (email) {
        const emailQuery = query(firestoreCollection(db, 'leads'), where('email', '==', email));
        const emailSnapshot = await getDocs(emailQuery);
        if (!emailSnapshot.empty) {
          const existingLead = emailSnapshot.docs[0].data();
          return {
            isDuplicate: true,
            existingLead: {
              id: emailSnapshot.docs[0].id,
              ...existingLead,
              createdAt: existingLead.createdAt?.toDate ? existingLead.createdAt.toDate() : existingLead.createdAt,
              updatedAt: existingLead.updatedAt?.toDate ? existingLead.updatedAt.toDate() : existingLead.updatedAt
            } as Lead,
            reason: `Email "${email}" already exists`
          };
        }
      }
      
      // Check for exact phone match
      if (phone) {
        const phoneQuery = query(firestoreCollection(db, 'leads'), where('phone', '==', phone));
        const phoneSnapshot = await getDocs(phoneQuery);
        if (!phoneSnapshot.empty) {
          const existingLead = phoneSnapshot.docs[0].data();
          return {
            isDuplicate: true,
            existingLead: {
              id: phoneSnapshot.docs[0].id,
              ...existingLead,
              createdAt: existingLead.createdAt?.toDate ? existingLead.createdAt.toDate() : existingLead.createdAt,
              updatedAt: existingLead.updatedAt?.toDate ? existingLead.updatedAt.toDate() : existingLead.updatedAt
            } as Lead,
            reason: `Phone "${phone}" already exists`
          };
        }
      }
      
      return { isDuplicate: false };
    } catch (error) {
      console.error('Error checking for duplicate leads:', error);
      throw new Error('Failed to check for duplicate leads');
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



  // Email/Password signup
  static async createUserWithEmail(email: string, password: string, additionalData?: { firstName?: string; lastName?: string; phone?: string }): Promise<UserCredential> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Profile is automatically created by Firebase Functions
      return userCredential;
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  // Fetch all customers (no pagination)
  static async getCustomersPaginated(): Promise<{ customers: UserProfile[]; lastDoc: null; }> {
    console.log('getCustomersPaginated called (no pagination)');
    if (!this.isFirebaseConfigured()) {
      console.log('Firebase not configured, returning empty result');
      return { customers: [], lastDoc: null };
    }
    try {
      const { getDocs, collection } = await import('firebase/firestore');
      const querySnapshot = await getDocs(collection(db, 'users'));
      const allUsers = querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
        role: (doc.data().role ?? 'customer') as 'customer' | 'admin', // Ensure role is always present
      }));
      const allCustomers = allUsers.filter(user => user.role === 'customer') as UserProfile[];
      return { customers: allCustomers, lastDoc: null };
    } catch (error) {
      console.error('Error getting customers:', error);
      return { customers: [], lastDoc: null };
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

  // Delete user profile (alias for user's own account deletion)
  static async deleteUserProfile(uid: string): Promise<void> {
    return this.deleteUser(uid);
  }

  // Create deal
  static async createDeal(dealData: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>, createdBy: string): Promise<string> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const { addDoc, collection } = await import('firebase/firestore');
      const dealRef = await addDoc(collection(db, 'deals'), {
        ...dealData,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy
      });
      return dealRef.id;
    } catch (error) {
      console.error('Error creating deal:', error);
      throw new Error('Failed to create deal');
    }
  }

  // Get all deals
  static async getDeals(): Promise<Deal[]> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const { getDocs, query, collection, orderBy } = await import('firebase/firestore');
      const dealsQuery = query(
        collection(db, 'deals'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(dealsQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Deal[];
    } catch (error) {
      console.error('Error getting deals:', error);
      throw new Error('Failed to get deals');
    }
  }

  // Update deal
  static async updateDeal(dealId: string, updatedData: Partial<Deal>): Promise<void> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const { updateDoc, doc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'deals', dealId), {
        ...updatedData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating deal:', error);
      throw new Error('Failed to update deal');
    }
  }

  // Delete deal
  static async deleteDeal(dealId: string): Promise<void> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const { deleteDoc, doc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'deals', dealId));
    } catch (error) {
      console.error('Error deleting deal:', error);
      throw new Error('Failed to delete deal');
    }
  }

  // Create order
  static async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    // Remove undefined fields recursively
    function removeUndefined(obj: any): any {
      if (Array.isArray(obj)) {
        return obj.map(removeUndefined);
      } else if (obj && typeof obj === 'object') {
        return Object.entries(obj)
          .filter(([_, v]) => v !== undefined)
          .reduce((acc, [k, v]) => ({ ...acc, [k]: removeUndefined(v) }), {});
      }
      return obj;
    }

    try {
      const { addDoc, collection } = await import('firebase/firestore');
      
      // Ensure orderDate is always set
      const orderDataWithDefaults = {
        ...orderData,
        orderDate: orderData.orderDate || new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const cleanOrderData = removeUndefined(orderDataWithDefaults);
      
      // Debug logging for shades data
      console.log('Saving order to Firebase with items:', cleanOrderData.items?.map((item: any) => ({
        productName: item.productName,
        hasShades: !!item.shades,
        shadesLength: item.shades?.length || 0,
        shades: item.shades
      })));
      
      const orderRef = await addDoc(collection(db, 'orders'), cleanOrderData);
      return orderRef.id;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  }

  // Get all orders
  static async getOrders(): Promise<Order[]> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const { getDocs, query, collection, orderBy } = await import('firebase/firestore');
      const ordersQuery = query(
        collection(db, 'orders'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(ordersQuery);
      const orders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      
      // Sort locally to avoid index requirement
      orders.sort((a, b) => {
        const dateA = convertFirestoreDate(a.createdAt)?.getTime() || 0;
        const dateB = convertFirestoreDate(b.createdAt)?.getTime() || 0;
        return dateB - dateA; // Descending order (newest first)
      });
      
      return orders;
    } catch (error) {
      console.error('Error getting orders:', error);
      throw new Error('Failed to get orders');
    }
  }

  // Get orders by status
  static async getOrdersByStatus(status: Order['status']): Promise<Order[]> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const { getDocs, query, collection, where, orderBy } = await import('firebase/firestore');
      const ordersQuery = query(
        collection(db, 'orders'),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(ordersQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
    } catch (error) {
      console.error('Error getting orders by status:', error);
      throw new Error('Failed to get orders by status');
    }
  }

  // Get orders for a specific user
  static async getUserOrders(userId: string): Promise<Order[]> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const { getDocs, query, collection, where } = await import('firebase/firestore');
      const ordersQuery = query(
        collection(db, 'orders'),
        where('customerId', '==', userId)
        // Removed orderBy to avoid index requirement
      );
      const querySnapshot = await getDocs(ordersQuery);
      const orders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      
      // Sort locally to avoid index requirement
      orders.sort((a, b) => {
        const dateA = convertFirestoreDate(a.createdAt)?.getTime() || 0;
        const dateB = convertFirestoreDate(b.createdAt)?.getTime() || 0;
        return dateB - dateA; // Descending order (newest first)
      });
      
      return orders;
    } catch (error) {
      console.error('Error getting user orders:', error);
      throw new Error('Failed to get user orders');
    }
  }

  // Get order by ID
  static async getOrderById(orderId: string): Promise<Order | null> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const { getDoc, doc } = await import('firebase/firestore');
      const orderDoc = await getDoc(doc(db, 'orders', orderId));
      if (orderDoc.exists()) {
        return {
          id: orderDoc.id,
          ...orderDoc.data()
        } as Order;
      }
      return null;
    } catch (error) {
      console.error('Error getting order by ID:', error);
      throw new Error('Failed to get order');
    }
  }

  // Update order status
  static async updateOrderStatus(orderId: string, status: Order['status'], notes?: string): Promise<void> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const { updateDoc, doc } = await import('firebase/firestore');
      const updateData: any = {
        status,
        updatedAt: new Date()
      };
      
      if (status === 'delivered') {
        updateData.actualDelivery = new Date();
      }
      
      if (notes) {
        updateData.notes = notes;
      }
      
      await updateDoc(doc(db, 'orders', orderId), updateData);
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new Error('Failed to update order status');
    }
  }

  // Update order fields
  static async updateOrder(orderId: string, updatedData: Partial<Order>): Promise<void> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }
    try {
      const { updateDoc, doc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'orders', orderId), {
        ...updatedData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating order:', error);
      throw new Error('Failed to update order');
    }
  }

  // Get orders for a specific customer
  static async getCustomerOrders(customerId: string): Promise<Order[]> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const { getDocs, query, collection, where, orderBy } = await import('firebase/firestore');
      const ordersQuery = query(
        collection(db, 'orders'),
        where('customerId', '==', customerId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(ordersQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
    } catch (error) {
      console.error('Error getting customer orders:', error);
      throw new Error('Failed to get customer orders');
    }
  }

  // Send password reset email
  static async sendPasswordResetEmail(email: string): Promise<void> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  // Set auth persistence based on rememberMe
  static async setPersistence(rememberMe: boolean): Promise<void> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      console.log(`Auth persistence set to: ${rememberMe ? 'local' : 'session'}`);
    } catch (error) {
      console.error('Error setting auth persistence:', error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  // Global logout state to prevent Firestore calls during logout
  private static isLoggingOut = false;
  
  // Global listener cleanup function
  private static cleanupListeners: (() => void)[] = [];
  
  // Register a listener for cleanup during logout
  static registerListenerForCleanup(cleanupFn: () => void) {
    this.cleanupListeners.push(cleanupFn);
  }
  
  // Unregister a listener
  static unregisterListener(cleanupFn: () => void) {
    const index = this.cleanupListeners.indexOf(cleanupFn);
    if (index > -1) {
      this.cleanupListeners.splice(index, 1);
    }
  }

  // Enhanced sign out with session cleanup
  static async signOut(): Promise<void> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }
    
    // Set global logout state
    this.isLoggingOut = true;
    
    // Cleanup all registered listeners
    console.log('Cleaning up all registered listeners...');
    this.cleanupListeners.forEach(cleanupFn => {
      try {
        cleanupFn();
      } catch (error) {
        console.warn('Error cleaning up listener:', error);
      }
    });
    this.cleanupListeners = [];
    
    try {
      // Clear any stored auth data first
      if (typeof window !== 'undefined') {
        // Clear all Firebase-related localStorage items
        Object.keys(localStorage).forEach(key => {
          if (key.includes('firebase') || key.includes('auth') || key.includes('user')) {
            localStorage.removeItem(key);
          }
        });
        
        // Clear all Firebase-related sessionStorage items
        Object.keys(sessionStorage).forEach(key => {
          if (key.includes('firebase') || key.includes('auth') || key.includes('user')) {
            sessionStorage.removeItem(key);
          }
        });
        
        // Clear any reCAPTCHA instances
        const recaptchaContainers = document.querySelectorAll('[id^="recaptcha-container"]');
        recaptchaContainers.forEach(container => {
          if (container.innerHTML) {
            container.innerHTML = '';
          }
        });
        
        // Clear any cached data
        if ('caches' in window) {
          caches.keys().then(cacheNames => {
            cacheNames.forEach(cacheName => {
              if (cacheName.includes('firebase') || cacheName.includes('auth')) {
                caches.delete(cacheName);
              }
            });
          });
        }
      }
      
      // Sign out from Firebase Auth
      await auth.signOut();
      
      // Add a small delay to ensure auth state is fully updated
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      // Don't throw error during logout - just log it
      console.warn('Non-critical error during logout:', error);
    } finally {
      // Reset global logout state after a delay
      setTimeout(() => {
        this.isLoggingOut = false;
      }, 1000);
    }
  }

  // Handle authentication errors
  private static handleAuthError(error: AuthError): Error {
    let message = 'An error occurred during authentication.';
    let suggestion = '';
    
    switch (error.code) {
      case 'auth/user-not-found':
        message = 'No account found with this email address.';
        suggestion = 'Please check your email or create a new account.';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password. Please try again.';
        suggestion = 'Make sure caps lock is off and try again.';
        break;
      case 'auth/invalid-email':
        message = 'Please enter a valid email address.';
        suggestion = 'Check the format: example@domain.com';
        break;
      case 'auth/weak-password':
        message = 'Password should be at least 6 characters long.';
        suggestion = 'Use a combination of letters, numbers, and symbols.';
        break;
      case 'auth/email-already-in-use':
        message = 'An account with this email already exists.';
        suggestion = 'Try signing in instead or use a different email.';
        break;
      case 'auth/invalid-phone-number':
        message = 'Please enter a valid phone number.';
        suggestion = 'Include country code: +1 234 567 8900';
        break;
      case 'auth/invalid-verification-code':
        message = 'Invalid verification code. Please try again.';
        suggestion = 'Check your SMS and enter the 6-digit code.';
        break;
      case 'auth/captcha-check-failed':
        message = 'Captcha verification failed. Please try again.';
        suggestion = 'Refresh the page and try again.';
        break;
      case 'auth/too-many-requests':
        message = 'Too many failed attempts. Please try again later.';
        suggestion = 'Wait a few minutes before trying again.';
        break;
      case 'auth/popup-closed-by-user':
        message = 'Login popup was closed. Please try again.';
        suggestion = 'Complete the authentication in the popup window.';
        break;
      case 'auth/popup-blocked':
        message = 'Login popup was blocked. Please allow popups and try again.';
        suggestion = 'Check your browser settings and allow popups for this site.';
        break;
      case 'auth/account-exists-with-different-credential':
        message = 'An account already exists with the same email but different sign-in credentials.';
        suggestion = 'Try signing in with the method you used originally.';
        break;
      case 'auth/credential-already-in-use':
        message = 'This phone number is already associated with another account.';
        suggestion = 'Use a different phone number or sign in with the existing account.';
        break;
      case 'auth/operation-not-allowed':
        message = 'This sign-in method is not enabled. Please contact support.';
        suggestion = 'Email us at support@deserttomountains.com';
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Please check your connection and try again.';
        suggestion = 'Check your internet connection and try again.';
        break;
      case 'auth/quota-exceeded':
        message = 'SMS quota exceeded. Please try again later.';
        suggestion = 'Wait a few hours or contact support.';
        break;
      case 'auth/app-not-authorized':
        message = 'This app is not authorized to use Firebase Authentication.';
        suggestion = 'Please contact support for assistance.';
        break;
      case 'auth/user-disabled':
        message = 'This account has been disabled.';
        suggestion = 'Please contact support for assistance.';
        break;
      case 'auth/user-token-expired':
        message = 'Your session has expired. Please sign in again.';
        suggestion = 'Try signing in with your credentials.';
        break;
      case 'auth/requires-recent-login':
        message = 'This operation requires recent authentication.';
        suggestion = 'Please sign out and sign in again.';
        break;
      default:
        message = error.message || 'An unexpected error occurred.';
        suggestion = 'Please try again or contact support if the problem persists.';
    }
    
    const enhancedError = new Error(message);
    (enhancedError as any).suggestion = suggestion;
    (enhancedError as any).code = error.code;
    
    return enhancedError;
  }

  // Task Management Methods

  // Create a new task
  static async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, createdBy: string): Promise<string> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const { addDoc, collection } = await import('firebase/firestore');
      
      // Remove undefined values to prevent Firebase errors
      const cleanTaskData = Object.fromEntries(
        Object.entries(taskData).filter(([_, value]) => value !== undefined)
      );
      
      const taskToCreate = {
        ...cleanTaskData,
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, 'tasks'), taskToCreate);
      return docRef.id;
    } catch (error) {
      console.error('Error creating task:', error);
      throw new Error('Failed to create task');
    }
  }

  // Get all tasks
  static async getTasks(): Promise<Task[]> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const { getDocs, collection, orderBy } = await import('firebase/firestore');
      const tasksQuery = collection(db, 'tasks');
      const querySnapshot = await getDocs(tasksQuery);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
    } catch (error) {
      console.error('Error getting tasks:', error);
      throw new Error('Failed to get tasks');
    }
  }

  // Get tasks by status
  static async getTasksByStatus(status: Task['status']): Promise<Task[]> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const { getDocs, query, collection, where, orderBy } = await import('firebase/firestore');
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(tasksQuery);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
    } catch (error) {
      console.error('Error getting tasks by status:', error);
      throw new Error('Failed to get tasks by status');
    }
  }

  // Get tasks by priority
  static async getTasksByPriority(priority: Task['priority']): Promise<Task[]> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const { getDocs, query, collection, where, orderBy } = await import('firebase/firestore');
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('priority', '==', priority),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(tasksQuery);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
    } catch (error) {
      console.error('Error getting tasks by priority:', error);
      throw new Error('Failed to get tasks by priority');
    }
  }

  // Get tasks by category
  static async getTasksByCategory(category: Task['category']): Promise<Task[]> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const { getDocs, query, collection, where, orderBy } = await import('firebase/firestore');
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(tasksQuery);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
    } catch (error) {
      console.error('Error getting tasks by category:', error);
      throw new Error('Failed to get tasks by category');
    }
  }

  // Get overdue tasks
  static async getOverdueTasks(): Promise<Task[]> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const { getDocs, query, collection, where, orderBy } = await import('firebase/firestore');
      const now = new Date();
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('dueDate', '<', now),
        where('status', 'in', ['pending', 'in_progress']),
        orderBy('dueDate', 'asc')
      );
      const querySnapshot = await getDocs(tasksQuery);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
    } catch (error) {
      console.error('Error getting overdue tasks:', error);
      throw new Error('Failed to get overdue tasks');
    }
  }

  // Get tasks due today
  static async getTasksDueToday(): Promise<Task[]> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const { getDocs, query, collection, where, orderBy } = await import('firebase/firestore');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('dueDate', '>=', today),
        where('dueDate', '<', tomorrow),
        orderBy('dueDate', 'asc')
      );
      const querySnapshot = await getDocs(tasksQuery);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
    } catch (error) {
      console.error('Error getting tasks due today:', error);
      throw new Error('Failed to get tasks due today');
    }
  }

  // Update task
  static async updateTask(taskId: string, updatedData: Partial<Task>): Promise<void> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const { updateDoc, doc } = await import('firebase/firestore');
      
      // Remove undefined values to prevent Firebase errors
      const cleanUpdatedData = Object.fromEntries(
        Object.entries(updatedData).filter(([_, value]) => value !== undefined)
      );
      
      await updateDoc(doc(db, 'tasks', taskId), {
        ...cleanUpdatedData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating task:', error);
      throw new Error('Failed to update task');
    }
  }

  // Update task status
  static async updateTaskStatus(taskId: string, status: Task['status']): Promise<void> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const { updateDoc, doc } = await import('firebase/firestore');
      const updateData: any = {
        status,
        updatedAt: new Date()
      };
      
      if (status === 'completed') {
        updateData.completedAt = new Date();
      }
      
      await updateDoc(doc(db, 'tasks', taskId), updateData);
    } catch (error) {
      console.error('Error updating task status:', error);
      throw new Error('Failed to update task status');
    }
  }

  // Delete task
  static async deleteTask(taskId: string): Promise<void> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const { deleteDoc, doc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      throw new Error('Failed to delete task');
    }
  }

  // Get task by ID
  static async getTaskById(taskId: string): Promise<Task | null> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const { getDoc, doc } = await import('firebase/firestore');
      const taskDoc = await getDoc(doc(db, 'tasks', taskId));
      if (taskDoc.exists()) {
        return { id: taskDoc.id, ...taskDoc.data() } as Task;
      }
      return null;
    } catch (error) {
      console.error('Error getting task by ID:', error);
      throw new Error('Failed to get task');
    }
  }

  // QUOTE MANAGEMENT FUNCTIONS

  // Create a new quote
  static async createQuote(quoteData: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>, createdBy: string): Promise<string> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const { addDoc, collection, updateDoc, doc, arrayUnion } = await import('firebase/firestore');
      
      // Prepare quote data
      const newQuote: Omit<Quote, 'id'> = {
        ...quoteData,
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
        isEditable: true,
        lastEditedAt: new Date()
      };

      // Add quote to collection
      const quoteRef = await addDoc(collection(db, 'quotes'), newQuote);
      
      // If quote is linked to a lead, update the lead with quote reference
      if (quoteData.leadId) {
        try {
          await updateDoc(doc(db, 'leads', quoteData.leadId), {
            quotes: arrayUnion(quoteRef.id),
            updatedAt: new Date()
          });
        } catch (error) {
          console.warn('Failed to update lead with quote reference:', error);
        }
      }

      return quoteRef.id;
    } catch (error) {
      console.error('Error creating quote:', error);
      throw new Error('Failed to create quote');
    }
  }

  // Get all quotes
  static async getQuotes(): Promise<Quote[]> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const { getDocs, collection, orderBy, query } = await import('firebase/firestore');
      const quotesQuery = query(collection(db, 'quotes'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(quotesQuery);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Quote[];
    } catch (error) {
      console.error('Error getting quotes:', error);
      throw new Error('Failed to get quotes');
    }
  }

  // Get quotes by status
  static async getQuotesByStatus(status: Quote['status']): Promise<Quote[]> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const { getDocs, query, collection, where, orderBy } = await import('firebase/firestore');
      const quotesQuery = query(
        collection(db, 'quotes'),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(quotesQuery);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Quote[];
    } catch (error) {
      console.error('Error getting quotes by status:', error);
      throw new Error('Failed to get quotes by status');
    }
  }

  // Get quotes by lead ID
  static async getQuotesByLeadId(leadId: string): Promise<Quote[]> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const { getDocs, query, collection, where, orderBy } = await import('firebase/firestore');
      const quotesQuery = query(
        collection(db, 'quotes'),
        where('leadId', '==', leadId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(quotesQuery);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Quote[];
    } catch (error) {
      console.error('Error getting quotes by lead ID:', error);
      throw new Error('Failed to get quotes by lead ID');
    }
  }

  // Get quote by ID
  static async getQuoteById(quoteId: string): Promise<Quote | null> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const { getDoc, doc } = await import('firebase/firestore');
      const quoteDoc = await getDoc(doc(db, 'quotes', quoteId));
      
      if (quoteDoc.exists()) {
        return { id: quoteDoc.id, ...quoteDoc.data() } as Quote;
      }
      return null;
    } catch (error) {
      console.error('Error getting quote by ID:', error);
      throw new Error('Failed to get quote');
    }
  }

  // Update quote
  static async updateQuote(quoteId: string, updateData: Partial<Quote>): Promise<void> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const { updateDoc, doc, getDoc, arrayUnion } = await import('firebase/firestore');
      
      // Get current quote data to track changes
      const currentQuoteDoc = await getDoc(doc(db, 'quotes', quoteId));
      if (!currentQuoteDoc.exists()) {
        throw new Error('Quote not found');
      }
      
      const currentQuote = currentQuoteDoc.data() as Quote;
      
      // Track changes for edit history
      const changes: Array<{
        field: string;
        oldValue: any;
        newValue: any;
        editedAt: Date;
        editedBy: string;
      }> = [];
      
      // Compare fields and track changes
      Object.keys(updateData).forEach(key => {
        if (key !== 'updatedAt' && key !== 'lastEditedAt' && key !== 'editHistory') {
          const oldValue = currentQuote[key as keyof Quote];
          const newValue = updateData[key as keyof Quote];
          
          if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
            changes.push({
              field: key,
              oldValue,
              newValue,
              editedAt: new Date(),
              editedBy: updateData.createdBy || 'unknown'
            });
          }
        }
      });
      
      // Remove undefined values and prepare update data
      const cleanUpdateData = Object.entries(updateData).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      await updateDoc(doc(db, 'quotes', quoteId), {
        ...cleanUpdateData,
        updatedAt: new Date(),
        lastEditedAt: new Date(),
        editHistory: arrayUnion(...changes)
      });
    } catch (error) {
      console.error('Error updating quote:', error);
      throw new Error('Failed to update quote');
    }
  }

  // Update quote status
  static async updateQuoteStatus(quoteId: string, status: Quote['status']): Promise<void> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const { updateDoc, doc } = await import('firebase/firestore');
      
      await updateDoc(doc(db, 'quotes', quoteId), {
        status,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating quote status:', error);
      throw new Error('Failed to update quote status');
    }
  }

  // Delete quote
  static async deleteQuote(quoteId: string): Promise<void> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const { deleteDoc, doc, getDoc, updateDoc, arrayRemove } = await import('firebase/firestore');
      
      // First get the quote to check if it's linked to a lead
      const quoteDoc = await getDoc(doc(db, 'quotes', quoteId));
      if (quoteDoc.exists()) {
        const quoteData = quoteDoc.data() as Quote;
        
        // If linked to a lead, remove the quote reference from the lead
        if (quoteData.leadId) {
          try {
            await updateDoc(doc(db, 'leads', quoteData.leadId), {
              quotes: arrayRemove(quoteId),
              updatedAt: new Date()
            });
          } catch (error) {
            console.warn('Failed to remove quote reference from lead:', error);
          }
        }
      }
      
      // Delete the quote
      await deleteDoc(doc(db, 'quotes', quoteId));
    } catch (error) {
      console.error('Error deleting quote:', error);
      throw new Error('Failed to delete quote');
    }
  }

  // Get quotes by customer ID (for multiple quotes per customer)
  static async getQuotesByCustomerId(customerId: string): Promise<Quote[]> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const { getDocs, query, collection, where, orderBy } = await import('firebase/firestore');
      const quotesQuery = query(
        collection(db, 'quotes'),
        where('customerId', '==', customerId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(quotesQuery);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Quote[];
    } catch (error) {
      console.error('Error getting quotes by customer ID:', error);
      throw new Error('Failed to get quotes by customer ID');
    }
  }

  // Delete multiple quotes (for bulk operations)
  static async deleteQuotes(quoteIds: string[]): Promise<{ success: number; failed: number; errors: string[] }> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const quoteId of quoteIds) {
      try {
        await this.deleteQuote(quoteId);
        success++;
      } catch (error) {
        failed++;
        errors.push(`${quoteId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { success, failed, errors };
  }

  // Mark expired quotes
  static async markExpiredQuotes(): Promise<number> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const { getDocs, query, collection, where, updateDoc, doc } = await import('firebase/firestore');
      
      // Get all non-expired quotes
      const quotesQuery = query(
        collection(db, 'quotes'),
        where('status', 'in', ['draft', 'sent']),
        where('isExpired', '==', false)
      );
      
      const querySnapshot = await getDocs(quotesQuery);
      let updatedCount = 0;
      const currentDate = new Date();

      for (const quoteDoc of querySnapshot.docs) {
        const quote = quoteDoc.data() as Quote;
        const validUntilDate = new Date(quote.validUntil);
        
        if (validUntilDate < currentDate) {
          try {
            await updateDoc(doc(db, 'quotes', quoteDoc.id), {
              status: 'expired',
              isExpired: true,
              updatedAt: new Date()
            });
            updatedCount++;
          } catch (error) {
            console.warn(`Failed to mark quote ${quoteDoc.id} as expired:`, error);
          }
        }
      }

      return updatedCount;
    } catch (error) {
      console.error('Error marking expired quotes:', error);
      throw new Error('Failed to mark expired quotes');
    }
  }

  // Get quote analytics
  static async getQuoteAnalytics(): Promise<{
    total: number;
    byStatus: Record<Quote['status'], number>;
    totalValue: number;
    averageValue: number;
    conversionRate: number;
  }> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const quotes = await this.getQuotes();
      
      const analytics = {
        total: quotes.length,
        byStatus: {
          draft: 0,
          sent: 0,
          accepted: 0,
          rejected: 0,
          expired: 0
        } as Record<Quote['status'], number>,
        totalValue: 0,
        averageValue: 0,
        conversionRate: 0
      };

      quotes.forEach(quote => {
        analytics.byStatus[quote.status]++;
        analytics.totalValue += quote.total;
      });

      analytics.averageValue = quotes.length > 0 ? analytics.totalValue / quotes.length : 0;
      
      const sentQuotes = analytics.byStatus.sent + analytics.byStatus.accepted + analytics.byStatus.rejected + analytics.byStatus.expired;
      analytics.conversionRate = sentQuotes > 0 ? (analytics.byStatus.accepted / sentQuotes) * 100 : 0;

      return analytics;
    } catch (error) {
      console.error('Error getting quote analytics:', error);
      throw new Error('Failed to get quote analytics');
    }
  }
}

export default app; 