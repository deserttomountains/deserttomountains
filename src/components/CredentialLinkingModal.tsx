'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  Link as LinkIcon,
  Shield,
  Smartphone,
  AtSign
} from 'lucide-react';
import { AuthLinkingService, LinkingResult } from '@/lib/AuthLinkingService';
import { useAuth } from '@/lib/hooks/useAuth';
import { RecaptchaVerifier, signInWithPhoneNumber, linkWithCredential, PhoneAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface CredentialLinkingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

type LinkingMethod = 'email' | 'phone' | 'google';

export default function CredentialLinkingModal({ 
  isOpen, 
  onClose, 
  onSuccess
}: CredentialLinkingModalProps) {
  const { user } = useAuth();
  const [linkingMethod, setLinkingMethod] = useState<LinkingMethod>('email');
  const [isLinking, setIsLinking] = useState(false);
  const [currentStep, setCurrentStep] = useState<'method' | 'verification' | 'success'>('method');
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCountryData, setSelectedCountryData] = useState<any>(null);
  const [showPhoneCountryDropdown, setShowPhoneCountryDropdown] = useState(false);
  const [phoneCountrySearch, setPhoneCountrySearch] = useState('');
  
  // Country data for phone input
  const phoneCountries = [
    { code: 'IN', name: 'India', dialCode: '91', flag: '🇮🇳' },
    { code: 'US', name: 'United States', dialCode: '1', flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', dialCode: '44', flag: '🇬🇧' },
    { code: 'CA', name: 'Canada', dialCode: '1', flag: '🇨🇦' },
    { code: 'AU', name: 'Australia', dialCode: '61', flag: '🇦🇺' },
    { code: 'DE', name: 'Germany', dialCode: '49', flag: '🇩🇪' },
    { code: 'FR', name: 'France', dialCode: '33', flag: '🇫🇷' },
    { code: 'JP', name: 'Japan', dialCode: '81', flag: '🇯🇵' },
    { code: 'SG', name: 'Singapore', dialCode: '65', flag: '🇸🇬' },
    { code: 'AE', name: 'UAE', dialCode: '971', flag: '🇦🇪' },
  ];
  
  const filteredPhoneCountries = phoneCountries.filter(c => 
    c.name.toLowerCase().includes(phoneCountrySearch.toLowerCase()) || 
    c.dialCode.includes(phoneCountrySearch) ||
    c.code.toLowerCase().includes(phoneCountrySearch.toLowerCase())
  );
  
  // UI states
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [phoneVerificationSent, setPhoneVerificationSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  
  // Refs
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaRef = useRef<HTMLDivElement>(null);

  // Initialize reCAPTCHA when modal opens
  useEffect(() => {
    if (isOpen && !recaptchaVerifierRef.current && typeof window !== 'undefined') {
      try {
        console.log('Initializing reCAPTCHA for phone linking...');
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container-linking', {
          size: 'invisible',
          callback: () => {
            console.log('reCAPTCHA callback triggered');
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expired');
            setErrors(prev => ({ ...prev, phone: 'reCAPTCHA expired. Please try again.' }));
          }
        });
        console.log('reCAPTCHA initialized successfully');
      } catch (error) {
        console.error('Error initializing reCAPTCHA:', error);
        setErrors(prev => ({ ...prev, phone: 'Failed to initialize reCAPTCHA. Please refresh and try again.' }));
      }
    }
    
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (error) {
          console.error('Error clearing reCAPTCHA:', error);
        }
        recaptchaVerifierRef.current = null;
      }
    };
  }, [isOpen]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setPhone('');
    setVerificationCode('');
    setErrors({});
    setCurrentStep('method');
    setPhoneVerificationSent(false);
    setConfirmationResult(null);
    setSelectedCountryData(null);
    setShowPhoneCountryDropdown(false);
    setPhoneCountrySearch('');
  };

  const clearErrors = () => {
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (linkingMethod === 'email') {
      if (!email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = 'Please enter a valid email';
      }
      if (!password) {
        newErrors.password = 'Password is required';
      } else if (password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    } else if (linkingMethod === 'phone') {
      if (!phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!selectedCountryData) {
        newErrors.phone = 'Please select your country';
      } else if (phone.length < 7 || phone.length > 15) {
        newErrors.phone = 'Please enter a valid phone number (7-15 digits)';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailLinking = async () => {
    if (!validateForm() || !user) return;
    
    setIsLinking(true);
    try {
      // First verify the credentials
      const verifyResult = await AuthLinkingService.verifyCredentials(user, email, password);
      
      if (!verifyResult.success) {
        setErrors({ email: verifyResult.message });
        return;
      }
      
      // Then link the credentials
      const linkResult = await AuthLinkingService.linkEmailAndPassword(user, email, password);
      
      if (linkResult.success) {
        setCurrentStep('success');
        onSuccess(linkResult.message);
      } else {
        setErrors({ email: linkResult.message });
      }
    } catch (error) {
      setErrors({ email: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLinking(false);
    }
  };

  const handlePhoneLinking = async () => {
    if (!validateForm() || !user) {
      console.log('Validation failed or user not found');
      return;
    }
    
    if (!recaptchaVerifierRef.current) {
      console.error('reCAPTCHA not initialized');
      setErrors({ phone: 'reCAPTCHA not ready. Please refresh and try again.' });
      return;
    }
    
    setIsLinking(true);
    try {
      console.log('Phone number format check:');
      console.log('Raw phone value:', phone);
      console.log('Selected country:', selectedCountryData);
      
      // Construct E.164 format for Firebase
      const formattedPhone = `+${selectedCountryData.dialCode}${phone}`;
      console.log('Formatted phone for Firebase:', formattedPhone);
      
      // Send verification code using signInWithPhoneNumber
      const result = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifierRef.current);
      console.log('Verification code sent successfully:', result);
      
      setConfirmationResult(result);
      setPhoneVerificationSent(true);
      setCurrentStep('verification');
    } catch (error: any) {
      console.error('Phone linking error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      if (error.code === 'auth/invalid-phone-number') {
        setErrors({ phone: 'Invalid phone number. Please check and try again.' });
      } else if (error.code === 'auth/too-many-requests') {
        setErrors({ phone: 'Too many attempts. Please try again later.' });
      } else if (error.code === 'auth/quota-exceeded') {
        setErrors({ phone: 'SMS quota exceeded. Please try again later.' });
      } else if (error.code === 'auth/captcha-check-failed') {
        setErrors({ phone: 'reCAPTCHA verification failed. Please try again.' });
      } else {
        setErrors({ phone: `Failed to send verification code: ${error.message}` });
      }
    } finally {
      setIsLinking(false);
    }
  };

  const handleVerificationCode = async () => {
    if (!verificationCode || verificationCode.length < 6 || !user || !confirmationResult) return;
    
    setIsLinking(true);
    try {
      // Verify the phone number with the confirmation result
      const userCredential = await confirmationResult.confirm(verificationCode);
      
      // Create a phone credential from the verification
      const phoneCredential = PhoneAuthProvider.credential(
        confirmationResult.verificationId,
        verificationCode
      );
      
      // Link the phone credential to the current user
      const result = await linkWithCredential(user, phoneCredential);
      
      // If successful, show success
      setCurrentStep('success');
      onSuccess('Phone number linked successfully!');
    } catch (error: any) {
      // Handle specific linking errors
      if (error.code === 'auth/credential-already-in-use') {
        setErrors({ 
          verificationCode: 'This phone number is already linked to another account.' 
        });
      } else if (error.code === 'auth/invalid-verification-code') {
        setErrors({ 
          verificationCode: 'Invalid verification code. Please try again.' 
        });
      } else if (error.code === 'auth/phone-number-already-in-use') {
        setErrors({ 
          verificationCode: 'This phone number is already linked to another account.' 
        });
      } else {
        setErrors({ 
          verificationCode: `Phone linking failed: ${error.message}` 
        });
      }
    } finally {
      setIsLinking(false);
    }
  };

  const handleGoogleLinking = async () => {
    // This would integrate with Google Sign-In
    // For now, we'll show a message
    onSuccess('Google account linking will be implemented in the next phase.');
  };

  const getLinkingStatus = () => {
    if (!user) return null;
    return AuthLinkingService.getLinkingStatus(user);
  };

  const linkingStatus = getLinkingStatus();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 pt-16 pb-20">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full max-h-[calc(100vh-8rem)] overflow-y-auto relative mx-2">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-[#F5F2E8] to-[#E6DCC0]">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-xl flex items-center justify-center shadow-lg">
              <LinkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#5E4E06]">Link Account</h2>
              <p className="text-xs sm:text-sm text-[#8B7A1A]">Add more ways to sign in</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Current Status */}
        {linkingStatus && (
          <div className="p-4 sm:p-6 bg-gradient-to-r from-[#F5F2E8] to-[#E6DCC0] border-b border-[#D4AF37]/30">
            <h3 className="font-semibold text-[#5E4E06] mb-3 text-sm sm:text-base">Current Sign-in Methods</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className={`w-4 h-4 ${linkingStatus.hasEmail ? 'text-green-600' : 'text-gray-400'}`} />
                <span className={`text-xs sm:text-sm ${linkingStatus.hasEmail ? 'text-green-700' : 'text-gray-500'}`}>
                  {linkingStatus.hasEmail ? 'Email & Password' : 'No email linked'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className={`w-4 h-4 ${linkingStatus.hasPhone ? 'text-green-600' : 'text-gray-400'}`} />
                <span className={`text-xs sm:text-sm ${linkingStatus.hasPhone ? 'text-green-700' : 'text-gray-500'}`}>
                  {linkingStatus.hasPhone ? 'Phone Number' : 'No phone linked'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className={`w-4 h-4 ${linkingStatus.hasGoogle ? 'text-green-600' : 'text-gray-400'}`} />
                <span className={`text-xs sm:text-sm ${linkingStatus.hasGoogle ? 'text-green-700' : 'text-gray-500'}`}>
                  {linkingStatus.hasGoogle ? 'Google Account' : 'No Google account linked'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Method Selection */}
        {currentStep === 'method' && (
          <div className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-[#5E4E06] mb-4">Choose Method to Link</h3>
            
            <div className="space-y-3">
              {/* Email Option */}
                                        <button
                onClick={() => setLinkingMethod('email')}
                className={`w-full p-3 sm:p-4 border-2 rounded-2xl text-left transition-all duration-300 hover:shadow-md ${
                  linkingMethod === 'email'
                    ? 'border-[#D4AF37] bg-[#F5F2E8] shadow-lg'
                    : 'border-gray-200 hover:border-[#D4AF37]/50 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                    linkingMethod === 'email' ? 'bg-[#D4AF37]' : 'bg-gray-100'
                  }`}>
                    <AtSign className={`w-4 h-4 sm:w-5 sm:h-5 ${linkingMethod === 'email' ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <div className="font-semibold text-[#5E4E06] text-sm sm:text-base">Email & Password</div>
                    <div className="text-xs sm:text-sm text-[#8B7A1A]">Link an email address</div>
                  </div>
                </div>
              </button>

              {/* Phone Option */}
              <button
                onClick={() => setLinkingMethod('phone')}
                className={`w-full p-3 sm:p-4 border-2 rounded-2xl text-left transition-all duration-300 hover:shadow-md ${
                  linkingMethod === 'phone'
                    ? 'border-[#D4AF37] bg-[#F5F2E8] shadow-lg'
                    : 'border-gray-200 hover:border-[#D4AF37]/50 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                    linkingMethod === 'phone' ? 'bg-[#D4AF37]' : 'bg-gray-100'
                  }`}>
                    <Smartphone className={`w-4 h-4 sm:w-5 sm:h-5 ${linkingMethod === 'phone' ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <div className="font-semibold text-[#5E4E06] text-sm sm:text-base">Phone Number</div>
                    <div className="text-xs sm:text-sm text-[#8B7A1A]">Link a phone number</div>
                  </div>
                </div>
              </button>

              {/* Google Option */}
              <button
                onClick={() => setLinkingMethod('google')}
                className={`w-full p-4 border-2 rounded-2xl text-left transition-all duration-300 ${
                  linkingMethod === 'google'
                    ? 'border-[#D4AF37] bg-[#F5F2E8]'
                    : 'border-gray-200 hover:border-[#D4AF37]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    linkingMethod === 'google' ? 'bg-[#D4AF37]' : 'bg-gray-100'
                  }`}>
                    <Shield className={`w-5 h-5 ${linkingMethod === 'google' ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <div className="font-semibold text-[#5E4E06]">Google Account</div>
                    <div className="text-sm text-[#8B7A1A]">Link a Google account</div>
                  </div>
                </div>
              </button>
            </div>

            {/* Form for selected method */}
            {linkingMethod === 'email' && (
              <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#5E4E06] mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D4AF37] focus:outline-none transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5E4E06] mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D4AF37] focus:outline-none transition-colors"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <button
                  onClick={handleEmailLinking}
                  disabled={isLinking}
                  className="w-full py-3 sm:py-4 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm sm:text-base"
                >
                  {isLinking ? 'Linking...' : 'Link Email'}
                </button>
              </div>
            )}

            {linkingMethod === 'phone' && (
              <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#5E4E06] mb-2">Phone Number</label>
                  
                  {/* Phone Input with Inline Country Dropdown */}
                  <div className="flex gap-2">
                    {/* Country Code Dropdown */}
                    <div className="relative flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowPhoneCountryDropdown(!showPhoneCountryDropdown)}
                        className="w-20 sm:w-24 px-2 sm:px-3 py-3 border-2 border-gray-200 rounded-xl bg-white text-left focus:border-[#D4AF37] focus:outline-none transition-colors flex items-center justify-between"
                      >
                        <span className="flex items-center gap-1">
                          {selectedCountryData ? (
                            <>
                              <span className="text-sm sm:text-base">{selectedCountryData.flag || '🌍'}</span>
                              <span className="font-medium text-[#5E4E06] text-xs sm:text-sm">+{selectedCountryData.dialCode}</span>
                            </>
                          ) : (
                            <>
                              <span className="text-sm sm:text-base">🇮🇳</span>
                              <span className="font-medium text-[#5E4E06] text-xs sm:text-sm">+91</span>
                            </>
                          )}
                        </span>
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {/* Country Dropdown */}
                      {showPhoneCountryDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-48 sm:w-64 bg-white border-2 border-[#D4AF37] rounded-xl shadow-2xl z-[9999] max-h-60 overflow-y-auto">
                          <div className="p-3 border-b border-[#D4AF37]/30">
                            <input
                              type="text"
                              placeholder="Search countries..."
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                              onChange={(e) => setPhoneCountrySearch(e.target.value)}
                            />
                          </div>
                          <div className="py-2">
                            {filteredPhoneCountries.map((country) => (
                              <button
                                key={country.code}
                                type="button"
                                onClick={() => {
                                  setSelectedCountryData(country);
                                  setShowPhoneCountryDropdown(false);
                                  setPhoneCountrySearch('');
                                }}
                                className="w-full px-2 sm:px-3 py-2 text-left hover:bg-[#F5F2E8] transition-colors flex items-center gap-1 sm:gap-2"
                              >
                                <span className="text-sm sm:text-base">{country.flag}</span>
                                <span className="font-medium text-[#5E4E06] text-xs sm:text-sm truncate">{country.name}</span>
                                <span className="text-xs text-[#8B7A1A] ml-auto">+{country.dialCode}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Clean Phone Input */}
                    <div className="relative flex-1 min-w-0">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          // Only allow digits
                          const cleaned = e.target.value.replace(/\D/g, '');
                          setPhone(cleaned);
                          if (errors.phone) clearErrors();
                        }}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D4AF37] focus:outline-none transition-colors"
                        placeholder="Enter your phone number"
                        maxLength={15}
                      />
                    </div>
                  </div>
                  
                  <p className="mt-2 text-xs text-[#8B7A1A]">
                    💡 Select your country and enter your phone number. We'll send a verification code via SMS.
                  </p>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                <button
                  onClick={handlePhoneLinking}
                  disabled={isLinking}
                  className="w-full py-3 sm:py-4 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm sm:text-base"
                >
                  {isLinking ? 'Sending Code...' : 'Send Verification Code'}
                </button>
              </div>
            )}

            {linkingMethod === 'google' && (
              <div className="mt-4 sm:mt-6">
                <button
                  onClick={handleGoogleLinking}
                  className="w-full py-3 sm:py-4 border-2 border-[#D4AF37] text-[#5E4E06] font-semibold rounded-xl hover:bg-[#F5F2E8] hover:shadow-md transition-all duration-300 shadow-sm text-sm sm:text-base"
                >
                  Link Google Account
                </button>
              </div>
            )}
          </div>
        )}

        {/* Phone Verification */}
        {currentStep === 'verification' && (
          <div className="p-4 sm:p-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Phone className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#5E4E06] mb-2">Enter Verification Code</h3>
              <p className="text-[#8B7A1A] text-sm sm:text-base">
                We've sent a 6-digit code to <span className="font-bold text-[#5E4E06]">{phone}</span>
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#5E4E06] mb-2">Verification Code</label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D4AF37] focus:outline-none text-center text-xl sm:text-2xl font-bold tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                />
                {errors.verificationCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.verificationCode}</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setCurrentStep('method')}
                  className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  Back
                </button>
                <button
                  onClick={handleVerificationCode}
                  disabled={isLinking}
                  className="flex-1 py-3 sm:py-4 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm sm:text-base"
                >
                  {isLinking ? 'Verifying...' : 'Verify & Link'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success */}
        {currentStep === 'success' && (
          <div className="p-4 sm:p-6 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-green-600 mb-3 sm:mb-4">Successfully Linked!</h3>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
              Your account has been linked successfully. You can now use this method to sign in.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 sm:py-4 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 shadow-md text-sm sm:text-base"
            >
              Continue
            </button>
          </div>
        )}

        {/* reCAPTCHA container */}
        <div id="recaptcha-container-linking" ref={recaptchaRef} className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4"></div>
      </div>
    </div>
  );
}
