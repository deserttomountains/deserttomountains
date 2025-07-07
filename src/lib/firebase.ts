import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signInWithPhoneNumber, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  PhoneAuthProvider,
  UserCredential,
  AuthError
} from 'firebase/auth';

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
let app;
let auth;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} catch (error) {
  console.warn('Firebase initialization failed:', error);
  // Create a mock auth object for development
  auth = {
    currentUser: null,
    onAuthStateChanged: () => () => {},
    signOut: async () => {},
  } as any;
}

// Initialize providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// Export auth
export { auth };

// Configure providers
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

facebookProvider.setCustomParameters({
  display: 'popup'
});

// Authentication service class
export class AuthService {
  // Check if Firebase is properly configured
  private static isFirebaseConfigured(): boolean {
    return process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
           process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'demo-api-key';
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

  // Facebook authentication
  static async signInWithFacebook(): Promise<UserCredential> {
    if (!this.isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials in .env.local');
    }
    
    try {
      return await signInWithPopup(auth, facebookProvider);
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