'use client';

import { useState, useEffect, useRef } from 'react';
import Navigation from '@/components/Navigation';
import {Mail, Lock, Eye, EyeOff, CheckCircle, Phone, Shield } from 'lucide-react';
import Link from 'next/link';
import { AuthService, auth } from '@/lib/firebase';
import { RecaptchaVerifier } from 'firebase/auth';

import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';

export default function LoginClient() {
  const { user, role, loading, redirectBasedOnRole } = useAuth();
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [phoneVerificationSent, setPhoneVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  const recaptchaRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (user && !loading) {
      // Check if we're in checkout flow
      const isCheckoutFlow = searchParams.get('checkout') === 'true';
      const redirectPath = searchParams.get('redirect');
      
      if (isCheckoutFlow && redirectPath) {
        // Clear checkout flow flag and redirect to checkout
        localStorage.removeItem('checkoutFlow');
        router.push(redirectPath);
      } else {
        // Normal login flow - redirect based on role
        redirectBasedOnRole(user.uid);
      }
    }
  }, [user, loading, redirectBasedOnRole, searchParams, router]);

  // Cleanup reCAPTCHA on component unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
          recaptchaVerifierRef.current = null;
        } catch (error) {
          console.warn('Error cleaning up reCAPTCHA:', error);
        }
      }
    };
  }, []);



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (loginMethod === 'email') {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
      if (!formData.password) {
        newErrors.password = 'Password is required';
      }
    } else {
      // Simple phone validation - just check if it's not empty
      if (!formData.phone || !formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      }
      // No other restrictions - let users enter any phone number format
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Set persistence before authentication
      await AuthService.setPersistence(formData.rememberMe);
      
      const userCredential = await AuthService.signInWithEmail(formData.email, formData.password);
      
      // Check if we're in checkout flow
      const isCheckoutFlow = searchParams.get('checkout') === 'true';
      const redirectPath = searchParams.get('redirect');
      
      if (isCheckoutFlow && redirectPath) {
        // Clear checkout flow flag and redirect to checkout
        localStorage.removeItem('checkoutFlow');
        router.push(redirectPath);
      } else {
        // Normal login flow - redirect based on role
        await redirectBasedOnRole(userCredential.user.uid);
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      const errorSuggestion = (error as any).suggestion;
      setErrors({ 
        general: errorMessage,
        suggestion: errorSuggestion
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Initialize reCAPTCHA if not already done
      if (!recaptchaVerifierRef.current) {
        const recaptchaContainer = document.getElementById('recaptcha-container-login');
        if (!recaptchaContainer) {
          setErrors({ phone: 'reCAPTCHA container not found' });
          return;
        }

        try {
          recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container-login', {
            size: 'invisible',
            callback: () => {
              console.log('reCAPTCHA verification successful');
            },
            'expired-callback': () => {
              console.log('reCAPTCHA expired, please try again');
              setErrors({ phone: 'reCAPTCHA expired, please try again' });
            }
          });
          
          await recaptchaVerifierRef.current.render();
          console.log('reCAPTCHA rendered successfully');
        } catch (recaptchaError) {
          console.error('Error initializing reCAPTCHA:', recaptchaError);
          setErrors({ phone: 'Failed to initialize reCAPTCHA. Please refresh and try again.' });
          return;
        }
      }

      // Send verification code
      console.log('Phone number being sent to Firebase:', formData.phone);
      console.log('Phone number type:', typeof formData.phone);
      console.log('Phone number length:', formData.phone.length);
      
      // Format the phone number for Firebase (E.164 format)
      const formattedPhone = AuthService.formatPhoneNumber(formData.phone);
      console.log('Phone number formatted for Firebase:', formattedPhone);
      
      const result = await AuthService.signInWithPhone(formattedPhone, recaptchaVerifierRef.current);
      setConfirmationResult(result);
      setPhoneVerificationSent(true);
    } catch (error) {
      const errorMessage = (error as Error).message;
      const errorSuggestion = (error as any).suggestion;
      setErrors({ 
        phone: errorMessage,
        suggestion: errorSuggestion
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length < 6) {
      setErrors({ verificationCode: 'Please enter the 6-digit verification code' });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Set persistence before phone verification
      await AuthService.setPersistence(formData.rememberMe);
      
      const userCredential = await confirmationResult.confirm(verificationCode);
      
      // Check if user profile exists, create if not
      try {
        const profile = await AuthService.getUserProfile(userCredential.user.uid);
        if (!profile) {
          console.warn('User profile not found after phone login, creating basic profile');
          // Create a basic profile for phone-only users
          await AuthService.createUserProfileDirect(userCredential.user, {
            phone: AuthService.formatPhoneNumber(formData.phone)
          });
        }
      } catch (profileError) {
        console.warn('Profile check failed, continuing with login:', profileError);
      }
      
      // Check if we're in checkout flow
      const isCheckoutFlow = searchParams.get('checkout') === 'true';
      const redirectPath = searchParams.get('redirect');
      
      if (isCheckoutFlow && redirectPath) {
        // Clear checkout flow flag and redirect to checkout
        localStorage.removeItem('checkoutFlow');
        router.push(redirectPath);
      } else {
        // Normal login flow - redirect based on role
        await redirectBasedOnRole(userCredential.user.uid);
      }
    } catch (error) {
      setErrors({ verificationCode: (error as Error).message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    
    try {
      // Set persistence before Google authentication
      await AuthService.setPersistence(formData.rememberMe);
      
      const userCredential = await AuthService.signInWithGoogle();
      
      // Check if user profile exists, create if not
      try {
        const profile = await AuthService.getUserProfile(userCredential.user.uid);
        if (!profile) {
          console.warn('Profile not found after Google login, creating basic profile');
          // Create a basic profile for Google users
          await AuthService.createUserProfileDirect(userCredential.user, {
            firstName: userCredential.user.displayName?.split(' ')[0] || '',
            lastName: userCredential.user.displayName?.split(' ').slice(1).join(' ') || '',
            phone: ''
          });
          console.log('Basic profile created for Google user');
        } else {
          console.log('Profile found for Google user:', profile);
        }
      } catch (profileError) {
        console.warn('Profile check/creation failed, continuing with login:', profileError);
        // Continue with login even if profile creation fails
      }
      
      // Check if we're in checkout flow
      const isCheckoutFlow = searchParams.get('checkout') === 'true';
      const redirectPath = searchParams.get('redirect');
      
      if (isCheckoutFlow && redirectPath) {
        // Clear checkout flow flag and redirect to checkout
        localStorage.removeItem('checkoutFlow');
        router.push(redirectPath);
      } else {
        // Normal login flow - redirect based on role
        await redirectBasedOnRole(userCredential.user.uid);
      }
    } catch (error) {
      console.error('LoginClient: Google login failed:', error);
      const errorMessage = (error as Error).message;
      const errorSuggestion = (error as any).suggestion;
      setErrors({ 
        general: errorMessage,
        suggestion: errorSuggestion
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendVerificationCode = async () => {
    setIsSubmitting(true);
    
    try {
      // Show success message
    } catch (error) {
      const errorMessage = (error as Error).message;
      const errorSuggestion = (error as any).suggestion;
      setErrors({ 
        phone: errorMessage,
        suggestion: errorSuggestion
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F2E8] to-[#E8E0C8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto"></div>
          <p className="mt-4 text-[#5E4E06]">Loading...</p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F2E8] to-[#E8E0C8]">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#5E4E06] mb-4">Welcome Back!</h2>
            <p className="text-[#8B7A1A] mb-6">
              You have successfully logged in. Redirecting to your dashboard...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37] mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F2E8] to-[#E8E0C8]">
      <Navigation />
      
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="max-w-md w-full">
          {/* Form */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#5E4E06] mb-2">Welcome Back</h1>
              <p className="text-[#8B7A1A] text-sm sm:text-base">
                Sign in to your account to continue your journey
              </p>
            </div>

            {/* Login Method Toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              <button
                onClick={() => setLoginMethod('email')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                  loginMethod === 'email'
                    ? 'bg-white text-[#5E4E06] shadow-sm'
                    : 'text-gray-600 hover:text-[#5E4E06]'
                }`}
              >
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </button>
              <button
                onClick={() => setLoginMethod('phone')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                  loginMethod === 'phone'
                    ? 'bg-white text-[#5E4E06] shadow-sm'
                    : 'text-gray-600 hover:text-[#5E4E06]'
                }`}
              >
                <Phone className="w-4 h-4 inline mr-2" />
                Phone
              </button>
            </div>

            {/* Phone Verification Step */}
            {loginMethod === 'phone' && phoneVerificationSent ? (
              <form onSubmit={handleVerificationCode} className="space-y-4">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#5E4E06] mb-2">Enter Verification Code</h3>
                  <p className="text-[#8B7A1A] text-sm">
                    We've sent a 6-digit code to <span className="font-bold text-[#5E4E06]">{formData.phone}</span>
                  </p>
                </div>

                <div>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D4AF37] focus:outline-none text-center text-2xl font-bold tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                  />
                  {errors.verificationCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.verificationCode}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 sm:py-4 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm sm:text-base cursor-pointer"
                >
                  {isSubmitting ? 'Verifying...' : 'Verify & Sign In'}
                </button>

                <button
                  type="button"
                  onClick={() => setPhoneVerificationSent(false)}
                  className="w-full py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm sm:text-base cursor-pointer"
                >
                  Back to Phone Number
                </button>
              </form>
            ) : (
              /* Regular Login Form */
              <form onSubmit={loginMethod === 'email' ? handleEmailLogin : handlePhoneLogin} className="space-y-4">
                {/* Email/Phone Field */}
                {loginMethod === 'email' ? (
                  <div>
                    <label className="block text-sm font-medium text-[#5E4E06] mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D4AF37] focus:outline-none transition-colors"
                        placeholder="Enter your email"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-[#8B7A1A] mb-2">Phone Number</label>
                    <div className="flex">
                      <div className="flex items-center px-3 py-3 border-2 border-r-0 border-gray-200 rounded-l-xl bg-gray-50">
                        <span className="text-sm font-medium text-gray-700">+91</span>
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-r-xl focus:border-[#D4AF37] focus:outline-none transition-colors"
                        placeholder="Enter your phone number"
                        maxLength={10}
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-2 text-sm text-red-600 font-medium">
                        {errors.phone}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      Enter your 10-digit phone number
                    </p>
                  </div>
                )}

                {/* Password Field (only for email login) */}
                {loginMethod === 'email' && (
                  <div>
                    <label className="block text-sm font-medium text-[#5E4E06] mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D4AF37] focus:outline-none transition-colors"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>
                )}

                {/* Remember Me */}
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#D4AF37] border-gray-300 rounded focus:ring-[#D4AF37] focus:ring-2 cursor-pointer"
                  />
                  <span className="text-sm text-[#8B7A1A]">Keep me signed in</span>
                </label>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 sm:py-4 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm sm:text-base cursor-pointer"
                >
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                </button>

                {/* Google Login */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-[#8B7A1A]">Or continue with</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting}
                  className="w-full py-3 sm:py-4 border-2 border-[#D4AF37] text-[#5E4E06] font-semibold rounded-xl hover:bg-[#F5F2E8] hover:shadow-md transition-all duration-300 shadow-sm text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <svg className="w-5 h-5 inline mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                {/* Error Message */}
                {errors.general && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-600 font-medium mb-2">{errors.general}</p>
                    {errors.suggestion && (
                      <p className="text-xs text-red-500">{errors.suggestion}</p>
                    )}
                  </div>
                )}

                {/* Forgot Password & Signup Links */}
                <div className="text-center space-y-2">
                  <p className="text-[#8B7A1A] text-sm">
                    <Link href="/login/forgot-password" className="text-[#D4AF37] hover:underline cursor-pointer">
                      Forgot your password?
                    </Link>
                  </p>
                  <p className="text-[#8B7A1A] text-sm">
                    Don't have an account?{' '}
                    <Link href="/signup" className="text-[#D4AF37] hover:underline font-medium cursor-pointer">
                      Sign up here
                    </Link>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* reCAPTCHA container for phone login */}
      <div 
        id="recaptcha-container-login" 
        ref={recaptchaRef} 
        className="fixed bottom-4 right-4 z-50"
        style={{ 
          width: '300px', 
          height: '80px',
          opacity: 0,
          pointerEvents: 'none'
        }}
      ></div>
    </div>
  );
} 