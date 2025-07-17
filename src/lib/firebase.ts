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
  street?: string;
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
  source: string;
  status: string;
  interest: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // Admin UID who created the lead
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
  static async createUserProfile(user: User, additionalData?: { firstName?: string; lastName?: string; phone?: string; address?: Address }): Promise<void> {
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
        address: additionalData?.address || {},
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

  // Save or update user address in Firestore profile
  static async saveUserAddress(uid: string, address: Address): Promise<void> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }
    try {
      await setDoc(doc(db, 'users', uid), {
        address,
        updatedAt: new Date()
      }, { merge: true });
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
        ...doc.data()
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
      const cleanOrderData = removeUndefined(orderData);
      const orderRef = await addDoc(collection(db, 'orders'), {
        ...cleanOrderData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
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
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
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

  // Get order by ID
  static async getOrderById(orderId: string): Promise<Order | null> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }

    try {
      const { getDoc, doc } = await import('firebase/firestore');
      const orderDoc = await getDoc(doc(db, 'orders', orderId));
      if (orderDoc.exists()) {
        return { id: orderDoc.id, ...orderDoc.data() } as Order;
      }
      return null;
    } catch (error) {
      console.error('Error getting order by ID:', error);
      throw new Error('Failed to get order');
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
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
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