import { 
  User, 
  linkWithPhoneNumber, 
  linkWithCredential, 
  PhoneAuthProvider, 
  EmailAuthProvider,
  GoogleAuthProvider,
  AuthError,
  signInWithCredential
} from 'firebase/auth';
import { auth } from './firebase';

export interface LinkingResult {
  success: boolean;
  message: string;
  error?: string;
  user?: User;
}

export interface CredentialVerification {
  email?: string;
  password?: string;
  phone?: string;
  verificationCode?: string;
}

export class AuthLinkingService {
  /**
   * Link a phone number to an existing user account
   */
  static async linkPhoneNumber(
    user: User, 
    phoneNumber: string, 
    confirmationResult: any
  ): Promise<LinkingResult> {
    try {
      console.log('AuthLinkingService: Linking phone number to user:', user.uid);
      
      // For phone linking, we need to use the confirmation result to verify the code
      // The confirmationResult should have a confirm method that takes the verification code
      if (!confirmationResult || typeof confirmationResult.confirm !== 'function') {
        return {
          success: false,
          message: 'Invalid phone verification. Please try again.',
          error: 'invalid_confirmation_result'
        };
      }
      
      // The phone linking is actually handled in the UI component
      // This method just validates that we have the right confirmation result
      return {
        success: true,
        message: 'Phone verification ready. Please enter the verification code.',
        user: user
      };
    } catch (error) {
      console.error('AuthLinkingService: Error in phone linking:', error);
      return this.handleLinkingError(error as AuthError);
    }
  }

  /**
   * Link an email and password to an existing user account
   */
  static async linkEmailAndPassword(
    user: User, 
    email: string, 
    password: string
  ): Promise<LinkingResult> {
    try {
      console.log('AuthLinkingService: Linking email to user:', user.uid);
      
      // Create email credential
      const emailCredential = EmailAuthProvider.credential(email, password);
      
      // Link the credential
      const result = await linkWithCredential(user, emailCredential);
      
      console.log('AuthLinkingService: Email linked successfully');
      
      return {
        success: true,
        message: 'Email linked successfully!',
        user: result.user
      };
    } catch (error) {
      console.error('AuthLinkingService: Error linking email:', error);
      return this.handleLinkingError(error as AuthError);
    }
  }

  /**
   * Link a Google account to an existing user account
   */
  static async linkGoogleAccount(
    user: User, 
    googleCredential: any
  ): Promise<LinkingResult> {
    try {
      console.log('AuthLinkingService: Linking Google account to user:', user.uid);
      
      // Link the Google credential
      const result = await linkWithCredential(user, googleCredential);
      
      console.log('AuthLinkingService: Google account linked successfully');
      
      return {
        success: true,
        message: 'Google account linked successfully!',
        user: result.user
      };
    } catch (error) {
      console.error('AuthLinkingService: Error linking Google account:', error);
      return this.handleLinkingError(error as AuthError);
    }
  }

  /**
   * Verify credentials before linking (for email/password)
   */
  static async verifyCredentials(
    user: User, 
    email: string, 
    password: string
  ): Promise<LinkingResult> {
    try {
      console.log('AuthLinkingService: Verifying credentials for user:', user.uid);
      
      // Create email credential
      const emailCredential = EmailAuthProvider.credential(email, password);
      
      // Try to sign in with these credentials to verify they're correct
      const result = await signInWithCredential(auth, emailCredential);
      
      // If successful, sign back in as the original user
      await auth.updateCurrentUser(user);
      
      console.log('AuthLinkingService: Credentials verified successfully');
      
      return {
        success: true,
        message: 'Credentials verified successfully!',
        user: result.user
      };
    } catch (error) {
      console.error('AuthLinkingService: Error verifying credentials:', error);
      return this.handleLinkingError(error as AuthError);
    }
  }

  /**
   * Handle linking errors and provide user-friendly messages
   */
  private static handleLinkingError(error: AuthError): LinkingResult {
    let message = 'An error occurred while linking accounts.';
    
    switch (error.code) {
      case 'auth/credential-already-in-use':
        message = 'This account is already linked to another user. Please use a different account.';
        break;
      case 'auth/email-already-in-use':
        message = 'This email is already linked to another account.';
        break;
      case 'auth/phone-number-already-in-use':
        message = 'This phone number is already linked to another account.';
        break;
      case 'auth/invalid-credential':
        message = 'Invalid credentials. Please check your email and password.';
        break;
      case 'auth/weak-password':
        message = 'Password is too weak. Please choose a stronger password.';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address. Please enter a valid email.';
        break;
      case 'auth/invalid-phone-number':
        message = 'Invalid phone number. Please enter a valid phone number.';
        break;
      case 'auth/too-many-requests':
        message = 'Too many attempts. Please try again later.';
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Please check your internet connection.';
        break;
      default:
        message = `Linking failed: ${error.message}`;
    }
    
    return {
      success: false,
      message,
      error: error.code
    };
  }

  /**
   * Check if a user can link additional credentials
   */
  static canLinkCredentials(user: User): boolean {
    // Check if user has multiple providers or can add more
    const providers = user.providerData;
    return providers.length < 3; // Firebase allows up to 3 providers per user
  }

  /**
   * Get the current linking status for a user
   */
  static getLinkingStatus(user: User): {
    hasEmail: boolean;
    hasPhone: boolean;
    hasGoogle: boolean;
    canAddMore: boolean;
  } {
    const providers = user.providerData;
    
    return {
      hasEmail: providers.some(p => p.providerId === 'password'),
      hasPhone: providers.some(p => p.providerId === 'phone'),
      hasGoogle: providers.some(p => p.providerId === 'google.com'),
      canAddMore: providers.length < 3
    };
  }
}
