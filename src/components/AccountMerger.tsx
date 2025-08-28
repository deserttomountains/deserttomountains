'use client';
import { useState, useEffect } from 'react';
import { Phone, Mail, User, CheckCircle, AlertCircle, Loader2, ArrowRight, Shield } from 'lucide-react';
import { AuthService } from '@/lib/firebase';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import app from '@/lib/firebase';

interface AccountMergerProps {
  email?: string;
  phone?: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

interface ExistingAccount {
  uid: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

export default function AccountMerger({ email, phone, onClose, onSuccess }: AccountMergerProps) {
  const auth = getAuth(app);
  const [step, setStep] = useState<'initial' | 'verify-phone' | 'merge-accounts' | 'success'>('initial');
  const [existingAccounts, setExistingAccounts] = useState<ExistingAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const [verificationId, setVerificationId] = useState('');
  
  // Phone verification state
  const [selectedCountryCode, setSelectedCountryCode] = useState('+91'); // Default to India
  const [phoneNumberToVerify, setPhoneNumberToVerify] = useState('');

  // Load existing accounts
  useEffect(() => {
    loadExistingAccounts();
  }, []);
  
  // Cleanup reCAPTCHA on unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifier) {
        try {
          recaptchaVerifier.clear();
        } catch (e) {
          console.log('Error clearing reCAPTCHA on unmount:', e);
        }
      }
    };
  }, [recaptchaVerifier]);

  const loadExistingAccounts = async () => {
    try {
      setIsLoading(true);
      const accounts: ExistingAccount[] = [];
      
      // Get current user's UID to exclude from duplicate check
      const currentUser = auth.currentUser;
      const currentUid = currentUser?.uid;
      
      if (email) {
        const emailCheck = await AuthService.checkUserExistsByEmail(email);
        if (emailCheck.exists && emailCheck.uid !== currentUid) {
          const profile = await AuthService.getUserProfile(emailCheck.uid!);
          if (profile) {
            accounts.push({
              uid: emailCheck.uid!,
              email: profile.email,
              phone: profile.phone,
              firstName: profile.firstName,
              lastName: profile.lastName,
              createdAt: profile.createdAt
            });
          }
        }
      }
      
      if (phone) {
        const phoneCheck = await AuthService.checkUserExistsByPhone(phone);
        if (phoneCheck.exists && phoneCheck.uid !== currentUid) {
          const profile = await AuthService.getUserProfile(phoneCheck.uid!);
          if (profile) {
            // Check if this account is already in the list
            const exists = accounts.some(acc => acc.uid === phoneCheck.uid);
            if (!exists) {
              accounts.push({
                uid: phoneCheck.uid!,
                email: profile.email,
                phone: profile.phone,
                firstName: profile.firstName,
                lastName: profile.lastName,
                createdAt: profile.createdAt
              });
            }
          }
        }
      }
      
      setExistingAccounts(accounts);
    } catch (error) {
      console.error('Error loading existing accounts:', error);
      setError('Failed to load existing accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (!phone) return;
    
    if (!selectedCountryCode) {
      setError('Please select a country code');
      return;
    }
    
    // Extract phone number from the full phone string (remove country code if present)
    let extractedPhoneNumber = phone;
    if (phone.startsWith('+')) {
      // If phone starts with +, extract the number part
      if (phone.startsWith('+91')) {
        extractedPhoneNumber = phone.substring(3);
        setSelectedCountryCode('+91');
      } else if (phone.startsWith('+1')) {
        extractedPhoneNumber = phone.substring(2);
        setSelectedCountryCode('+1');
      } else if (phone.startsWith('+44')) {
        extractedPhoneNumber = phone.substring(3);
        setSelectedCountryCode('+44');
      } else if (phone.startsWith('+61')) {
        extractedPhoneNumber = phone.substring(3);
        setSelectedCountryCode('+61');
      } else if (phone.startsWith('+49')) {
        extractedPhoneNumber = phone.substring(3);
        setSelectedCountryCode('+49');
      } else if (phone.startsWith('+33')) {
        extractedPhoneNumber = phone.substring(3);
        setSelectedCountryCode('+33');
      } else if (phone.startsWith('+81')) {
        extractedPhoneNumber = phone.substring(3);
        setSelectedCountryCode('+81');
      } else if (phone.startsWith('+65')) {
        extractedPhoneNumber = phone.substring(3);
        setSelectedCountryCode('+65');
      } else if (phone.startsWith('+971')) {
        extractedPhoneNumber = phone.substring(4);
        setSelectedCountryCode('+971');
      }
    }
    
    // Update the state with extracted phone number
    setPhoneNumberToVerify(extractedPhoneNumber);
    
    // Validate phone number format before sending
    const fullPhoneNumber = selectedCountryCode + extractedPhoneNumber;
    if (!/^\+\d{10,15}$/.test(fullPhoneNumber)) {
      setError('Please enter a valid phone number (10-15 digits)');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // Wait for the DOM to be ready and reCAPTCHA container to exist
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if reCAPTCHA container exists
      const recaptchaContainer = document.getElementById('recaptcha-container');
      if (!recaptchaContainer) {
        setError('reCAPTCHA container not found. Please try again.');
        return;
      }
      
      // Clear any existing reCAPTCHA
      if (recaptchaVerifier) {
        try {
          recaptchaVerifier.clear();
        } catch (e) {
          console.log('Clearing existing reCAPTCHA:', e);
        }
      }
      
      // Initialize reCAPTCHA
      try {
        const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'normal',
          callback: () => {
            console.log('reCAPTCHA solved');
          },
          'expired-callback': () => {
            setError('reCAPTCHA expired. Please try again.');
          }
        });
        
        // Render the reCAPTCHA
        await verifier.render();
        setRecaptchaVerifier(verifier);
        
        // Wait a bit more for reCAPTCHA to fully initialize
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (recaptchaError) {
        console.error('reCAPTCHA initialization error:', recaptchaError);
        setError('Failed to initialize reCAPTCHA. Please refresh and try again.');
        return;
      }
      
      // Ensure reCAPTCHA is initialized
      if (!recaptchaVerifier) {
        setError('reCAPTCHA not initialized. Please try again.');
        return;
      }
      
      // Send verification code using the full phone number
      const confirmationResult = await signInWithPhoneNumber(auth, fullPhoneNumber, recaptchaVerifier);
      setVerificationId(confirmationResult.verificationId);
      setStep('verify-phone');
      
    } catch (error: any) {
      console.error('Error sending verification code:', error);
      if (error.code === 'auth/argument-error') {
        setError('reCAPTCHA not properly initialized. Please refresh and try again.');
      } else if (error.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number format. Please check the number.');
      } else {
        setError('Failed to send verification code. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || !verificationId) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      // Verify the code
      const credential = await AuthService.verifyPhoneNumber(verificationId, verificationCode);
      
      if (credential) {
        setStep('merge-accounts');
      } else {
        setError('Invalid verification code. Please try again.');
      }
      
    } catch (error) {
      console.error('Error verifying code:', error);
      setError('Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMergeAccounts = async () => {
    if (!selectedAccount) {
      setError('Please select an account to merge with.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // Here you would implement the actual account merging logic
      // For now, we'll just show success
      setStep('success');
      onSuccess('Phone number verified successfully! You can now log in to your existing account.');
      
    } catch (error) {
      console.error('Error merging accounts:', error);
      setError('Failed to merge accounts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getAccountDisplayName = (account: ExistingAccount) => {
    if (account.firstName && account.lastName) {
      return `${account.firstName} ${account.lastName}`;
    } else if (account.firstName) {
      return account.firstName;
    } else if (account.email) {
      return account.email.split('@')[0];
    } else {
      return 'Unknown User';
    }
  };

  if (step === 'initial') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-[#E6DCC0]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#F5F2E8] rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#8B7A1A]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#5E4E06]">Account Verification Required</h2>
                <p className="text-sm text-[#8B7A1A]">We found existing accounts with these credentials</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
              </div>
            ) : (
              <>
                {/* Existing Accounts */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-[#8B7A1A] mb-3">Existing Accounts Found:</h3>
                  <div className="space-y-3">
                    {existingAccounts.map((account) => (
                      <div key={account.uid} className="p-3 bg-[#F5F2E8] rounded-xl border border-[#E6DCC0]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-[#5E4E06]">{getAccountDisplayName(account)}</p>
                            <div className="text-xs text-[#8B7A1A] space-y-1">
                              {account.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {account.email}
                                </div>
                              )}
                              {account.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {account.phone}
                                </div>
                              )}
                              <div>Created: {formatDate(account.createdAt)}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action */}
                <div className="text-center">
                  <p className="text-sm text-[#8B7A1A] mb-4">
                    To proceed, we need to verify your phone number to ensure account security.
                  </p>
                  <button
                    onClick={handleVerifyPhone}
                    disabled={isLoading || !phone}
                    className="w-full bg-[#D4AF37] text-white py-3 px-6 rounded-xl font-semibold hover:bg-[#B8941F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Phone className="w-5 h-5" />
                        Verify Phone Number
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[#E6DCC0]">
            <button
              onClick={onClose}
              className="w-full text-[#8B7A1A] py-2 hover:text-[#5E4E06] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'verify-phone') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
          {/* Header */}
          <div className="p-6 border-b border-[#E6DCC0]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#F5F2E8] rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-[#8B7A1A]" />
              </div>
              <div>
                                 <h2 className="text-xl font-bold text-[#5E4E06]">Verify Phone Number</h2>
                 <p className="text-sm text-[#8B7A1A]">Enter the 6-digit code sent to {selectedCountryCode} {phoneNumberToVerify}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* reCAPTCHA */}
            <div id="recaptcha-container" className="mb-6 flex justify-center"></div>
            
            {/* Verification Code Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#8B7A1A] mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="w-full border border-[#E6DCC0] rounded-xl px-4 py-3 text-center text-lg font-mono focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* Action */}
            <button
              onClick={handleVerifyCode}
              disabled={isLoading || verificationCode.length !== 6}
              className="w-full bg-[#D4AF37] text-white py-3 px-6 rounded-xl font-semibold hover:bg-[#B8941F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Verify Code
                </>
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[#E6DCC0]">
            <button
              onClick={() => setStep('initial')}
              className="w-full text-[#8B7A1A] py-2 hover:text-[#5E4E06] transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'merge-accounts') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
          {/* Header */}
          <div className="p-6 border-b border-[#E6DCC0]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#F5F2E8] rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-[#8B7A1A]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#5E4E06]">Phone Verified!</h2>
                <p className="text-sm text-[#8B7A1A]">Select which account to use</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-[#8B7A1A] mb-3">Choose Account:</h3>
              <div className="space-y-3">
                {existingAccounts.map((account) => (
                  <label key={account.uid} className="flex items-center gap-3 p-3 bg-[#F5F2E8] rounded-xl border border-[#E6DCC0] cursor-pointer hover:bg-[#E6DCC0] transition-colors">
                    <input
                      type="radio"
                      name="selectedAccount"
                      value={account.uid}
                      checked={selectedAccount === account.uid}
                      onChange={(e) => setSelectedAccount(e.target.value)}
                      className="text-[#D4AF37] focus:ring-[#D4AF37]"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-[#5E4E06]">{getAccountDisplayName(account)}</p>
                      <div className="text-xs text-[#8B7A1A]">
                        Created: {formatDate(account.createdAt)}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* Action */}
            <button
              onClick={handleMergeAccounts}
              disabled={isLoading || !selectedAccount}
              className="w-full bg-[#D4AF37] text-white py-3 px-6 rounded-xl font-semibold hover:bg-[#B8941F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <ArrowRight className="w-5 h-5" />
                  Continue with Selected Account
                </>
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[#E6DCC0]">
            <button
              onClick={() => setStep('verify-phone')}
              className="w-full text-[#8B7A1A] py-2 hover:text-[#5E4E06] transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
          {/* Header */}
          <div className="p-6 border-b border-[#E6DCC0] text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-[#5E4E06] mb-2">Success!</h2>
            <p className="text-sm text-[#8B7A1A]">Your phone number has been verified</p>
          </div>

          {/* Content */}
          <div className="p-6 text-center">
            <p className="text-[#5E4E06] mb-6">
              You can now log in to your existing account using your email or phone number.
            </p>
            
            <button
              onClick={onClose}
              className="w-full bg-[#D4AF37] text-white py-3 px-6 rounded-xl font-semibold hover:bg-[#B8941F] transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
