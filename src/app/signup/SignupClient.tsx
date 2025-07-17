'use client';

import { useState, useEffect, useRef } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Sparkles, User, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import styles from '../login/PhoneInputCustom.module.css';
import { RecaptchaVerifier } from 'firebase/auth';
import { AuthService, auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';

export default function SignupClient() {
  const { user, role, loading, redirectBasedOnRole } = useAuth();
  const [signupMethod, setSignupMethod] = useState<'email' | 'phone'>('email');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agreeToTerms: false,
    newsletter: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [phoneVerificationSent, setPhoneVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const router = useRouter();

  // Redirect logged-in users to their appropriate dashboard
  useEffect(() => {
    if (!loading && user) {
      // Use setTimeout to ensure the redirect happens after the current render cycle
      const timer = setTimeout(() => {
        if (role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [user, role, loading, router]);

  useEffect(() => {
    // Only initialize reCAPTCHA if user is not logged in and we're not loading
    if (!loading && !user && !recaptchaVerifierRef.current && typeof window !== 'undefined') {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container-signup', {
        size: 'invisible',
        callback: () => {},
        'expired-callback': () => {
          setErrors(prev => ({ ...prev, phone: 'reCAPTCHA expired. Please try again.' }));
        }
      });
    }
    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    };
  }, [loading, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (signupMethod === 'email') {
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must contain uppercase, lowercase, and number';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = 'You must agree to the terms and conditions';
      }
    } else {
      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\+\d{10,15}$/.test(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }
      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = 'You must agree to the terms and conditions';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const userCredential = await AuthService.createUserWithEmail(
          formData.email, 
          formData.password,
          {
            firstName: formData.firstName,
            lastName: formData.lastName
          }
        );
        await redirectBasedOnRole(userCredential.user.uid);
      } catch (error) {
        setErrors({ email: (error as Error).message });
      } finally {
      setIsSubmitting(false);
      }
    }
  };

  const handlePhoneSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const result = await AuthService.signInWithPhone(formData.phone, recaptchaVerifierRef.current!);
        setConfirmationResult(result);
        setPhoneVerificationSent(true);
      } catch (error) {
        setErrors({ phone: (error as Error).message });
      } finally {
        setIsSubmitting(false);
      }
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
      const userCredential = await confirmationResult.confirm(verificationCode);
      
      // Create user profile for phone signup
      await AuthService.createUserProfile(userCredential.user, {
        phone: formData.phone
      });
      
      await redirectBasedOnRole(userCredential.user.uid);
    } catch (error) {
      setErrors({ verificationCode: (error as Error).message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsSubmitting(true);
    try {
      const userCredential = await AuthService.signInWithGoogle();
      
      // Create user profile for Google signup
      await AuthService.createUserProfile(userCredential.user);
      
      await redirectBasedOnRole(userCredential.user.uid);
    } catch (error) {
      setErrors({ general: (error as Error).message });
    } finally {
    setIsSubmitting(false);
    }
  };

  const benefits = [
    "10% off your first order",
    "Exclusive member-only offers",
    "Early access to new products",
    "Personalized wellness recommendations"
  ];

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F6F0] via-[#F5F2E8] to-[#E6DCC0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  // Don't render signup form if user is already authenticated
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F6F0] via-[#F5F2E8] to-[#E6DCC0] relative overflow-hidden">
      {!loading && !user && <div id="recaptcha-container-signup" ref={recaptchaRef}></div>}
      <Navigation />
      <div className="pt-24 pb-16 px-6 relative z-10">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#5E4E06]/10 to-[#8B7A1A]/10 border border-[#D4AF37]/30 text-[#5E4E06] rounded-full text-sm font-bold shadow-lg mb-8 animate-fade-in">
              <Sparkles className="w-5 h-5 text-[#8B7A1A]" />
              <span>Join Desert to Mountains</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-[#5E4E06] mb-6 leading-tight">
              Create Your Account
            </h1>
            <p className="text-[#8B7A1A] text-xl font-medium leading-relaxed max-w-lg mx-auto">
              Sign up to start your journey with authentic natural plaster
            </p>
          </div>
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-[#D4AF37] p-8 md:p-10 animate-fade-in">
            <div className="flex bg-[#F5F2E8] rounded-2xl p-2 mb-8">
              <button
                onClick={() => setSignupMethod('email')}
                className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all duration-300 cursor-pointer ${
                  signupMethod === 'email'
                    ? 'bg-white text-[#5E4E06] shadow-lg'
                    : 'text-[#8B7A1A] hover:text-[#5E4E06]'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Mail className="w-5 h-5" />
                  <span>Email</span>
                </div>
              </button>
              <button
                onClick={() => setSignupMethod('phone')}
                className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all duration-300 cursor-pointer ${
                  signupMethod === 'phone'
                    ? 'bg-white text-[#5E4E06] shadow-lg'
                    : 'text-[#8B7A1A] hover:text-[#5E4E06]'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <User className="w-5 h-5" />
                  <span>Phone</span>
                </div>
              </button>
            </div>
            {
              <>
                {signupMethod === 'email' && !phoneVerificationSent && (
                  <form onSubmit={handleEmailSignup} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-lg font-bold text-[#5E4E06] mb-3">
                          First Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <User className="w-6 h-6 text-[#8B7A1A]" />
                          </div>
                          <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className={`w-full pl-14 pr-4 py-5 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-offset-0 transition-all duration-300 placeholder:text-[#8B7A1A] placeholder:font-medium text-[#5E4E06] font-medium text-lg ${
                              errors.firstName ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500 bg-red-50' : 'border-[#D4AF37] focus:ring-[#8B7A1A]/20 focus:border-[#8B7A1A] hover:border-[#8B7A1A] hover:shadow-xl bg-white/90 backdrop-blur-sm'
                            }`}
                            placeholder="First name"
                          />
                        </div>
                        {errors.firstName && (
                          <p className="mt-3 text-sm text-red-600 font-medium">{errors.firstName}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-lg font-bold text-[#5E4E06] mb-3">
                          Last Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <User className="w-6 h-6 text-[#8B7A1A]" />
                          </div>
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className={`w-full pl-14 pr-4 py-5 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-offset-0 transition-all duration-300 placeholder:text-[#8B7A1A] placeholder:font-medium text-[#5E4E06] font-medium text-lg ${
                              errors.lastName ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500 bg-red-50' : 'border-[#D4AF37] focus:ring-[#8B7A1A]/20 focus:border-[#8B7A1A] hover:border-[#8B7A1A] hover:shadow-xl bg-white/90 backdrop-blur-sm'
                            }`}
                            placeholder="Last name"
                          />
                        </div>
                        {errors.lastName && (
                          <p className="mt-3 text-sm text-red-600 font-medium">{errors.lastName}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-lg font-bold text-[#5E4E06] mb-3">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                          <Mail className="w-6 h-6 text-[#8B7A1A]" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full pl-14 pr-4 py-5 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-offset-0 transition-all duration-300 placeholder:text-[#8B7A1A] placeholder:font-medium text-[#5E4E06] font-medium text-lg ${
                            errors.email ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500 bg-red-50' : 'border-[#D4AF37] focus:ring-[#8B7A1A]/20 focus:border-[#8B7A1A] hover:border-[#8B7A1A] hover:shadow-xl bg-white/90 backdrop-blur-sm'
                          }`}
                          placeholder="your@email.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-3 text-sm text-red-600 font-medium">{errors.email}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="password" className="block text-lg font-bold text-[#5E4E06] mb-3">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                          <Lock className="w-6 h-6 text-[#8B7A1A]" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={`w-full pl-14 pr-14 py-5 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-offset-0 transition-all duration-300 placeholder:text-[#8B7A1A] placeholder:font-medium text-[#5E4E06] font-medium text-lg ${
                            errors.password ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500 bg-red-50' : 'border-[#D4AF37] focus:ring-[#8B7A1A]/20 focus:border-[#8B7A1A] hover:border-[#8B7A1A] hover:shadow-xl bg-white/90 backdrop-blur-sm'
                          }`}
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-5 flex items-center cursor-pointer"
                        >
                          {showPassword ? (
                            <EyeOff className="w-6 h-6 text-[#8B7A1A] hover:text-[#5E4E06] transition-colors" />
                          ) : (
                            <Eye className="w-6 h-6 text-[#8B7A1A] hover:text-[#5E4E06] transition-colors" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="mt-3 text-sm text-red-600 font-medium">{errors.password}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-lg font-bold text-[#5E4E06] mb-3">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                          <Lock className="w-6 h-6 text-[#8B7A1A]" />
                        </div>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={`w-full pl-14 pr-14 py-5 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-offset-0 transition-all duration-300 placeholder:text-[#8B7A1A] placeholder:font-medium text-[#5E4E06] font-medium text-lg ${
                            errors.confirmPassword ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500 bg-red-50' : 'border-[#D4AF37] focus:ring-[#8B7A1A]/20 focus:border-[#8B7A1A] hover:border-[#8B7A1A] hover:shadow-xl bg-white/90 backdrop-blur-sm'
                          }`}
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-5 flex items-center cursor-pointer"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-6 h-6 text-[#8B7A1A] hover:text-[#5E4E06] transition-colors" />
                          ) : (
                            <Eye className="w-6 h-6 text-[#8B7A1A] hover:text-[#5E4E06] transition-colors" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="mt-3 text-sm text-red-600 font-medium">{errors.confirmPassword}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="agreeToTerms"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleInputChange}
                        className="w-5 h-5 rounded border-2 border-[#D4AF37] focus:ring-2 focus:ring-[#8B7A1A]/20 focus:border-[#8B7A1A] cursor-pointer"
                      />
                      <label htmlFor="agreeToTerms" className="text-[#8B7A1A] font-semibold cursor-pointer">
                        I agree to the <Link href="#" className="underline decoration-2 underline-offset-4">terms and conditions</Link>
                      </label>
                      {errors.agreeToTerms && (
                        <p className="text-sm text-red-600 font-medium ml-2">{errors.agreeToTerms}</p>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-5 bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white font-bold text-lg rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Signing Up...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign Up with Email</span>
                          <ArrowRight className="w-6 h-6" />
                        </>
                      )}
                    </button>
                  </form>
                )}
                {signupMethod === 'phone' && !phoneVerificationSent && (
                  <form onSubmit={handlePhoneSignup} className="space-y-6">
                    <div>
                      <label htmlFor="phone" className="block text-lg font-bold text-[#5E4E06] mb-3">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                          <User className="w-6 h-6 text-[#8B7A1A]" />
                        </div>
                        <div className="pl-14">
                          <PhoneInput
                            country={'in'}
                            value={formData.phone}
                            onChange={(value, country, e, formattedValue) => {
                              let fullNumber = value;
                              if (value && value[0] !== '+') {
                                fullNumber = `+${value}`;
                              }
                              setFormData(prev => ({
                                ...prev,
                                phone: fullNumber
                              }));
                              if (errors.phone) {
                                setErrors(prev => ({ ...prev, phone: '' }));
                              }
                            }}
                            inputProps={{
                              name: 'phone',
                              required: true,
                              autoFocus: true,
                              className: `${styles.phoneInput} ${errors.phone ? styles.error : ''}`
                            }}
                            containerClass={styles.phoneContainer}
                            buttonClass={styles.phoneButton}
                            dropdownClass={styles.phoneDropdown}
                            specialLabel=""
                            inputStyle={{ width: '100%' }}
                            dropdownStyle={{ zIndex: 1000 }}
                            isValid={(value, country) => {
                              return /^\+\d{10,15}$/.test(value);
                            }}
                          />
                        </div>
                      </div>
                      {errors.phone && (
                        <p className="mt-3 text-sm text-red-600 font-medium">{errors.phone}</p>
                      )}
                      <p className="mt-2 text-sm text-[#8B7A1A]">
                        We'll send you a verification code via SMS
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="agreeToTermsPhone"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleInputChange}
                        className="w-5 h-5 rounded border-2 border-[#D4AF37] focus:ring-2 focus:ring-[#8B7A1A]/20 focus:border-[#8B7A1A] cursor-pointer"
                      />
                      <label htmlFor="agreeToTermsPhone" className="text-[#8B7A1A] font-semibold cursor-pointer">
                        I agree to the <Link href="#" className="underline decoration-2 underline-offset-4">terms and conditions</Link>
                      </label>
                      {errors.agreeToTerms && (
                        <p className="text-sm text-red-600 font-medium ml-2">{errors.agreeToTerms}</p>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-5 bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white font-bold text-lg rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Sending Code...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Verification Code</span>
                          <ArrowRight className="w-6 h-6" />
                        </>
                      )}
                    </button>
                  </form>
                )}
                {phoneVerificationSent && (
                  <form onSubmit={handleVerificationCode} className="space-y-6">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-[#5E4E06] mb-2">Enter Verification Code</h3>
                      <p className="text-[#8B7A1A] text-lg">
                        We've sent a 6-digit code to <span className="font-bold">{formData.phone}</span>
                      </p>
                    </div>
                    <div>
                      <label htmlFor="verificationCode" className="block text-lg font-bold text-[#5E4E06] mb-3">
                        Verification Code
                      </label>
                      <input
                        type="text"
                        id="verificationCode"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className={`w-full px-5 py-5 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-offset-0 transition-all duration-300 text-center text-2xl font-bold tracking-widest ${
                          errors.verificationCode ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500 bg-red-50' : 'border-[#D4AF37] focus:ring-[#8B7A1A]/20 focus:border-[#8B7A1A] hover:border-[#8B7A1A] hover:shadow-xl bg-white/90 backdrop-blur-sm'
                        }`}
                        placeholder="000000"
                        maxLength={6}
                      />
                      {errors.verificationCode && (
                        <p className="mt-3 text-sm text-red-600 font-medium">{errors.verificationCode}</p>
                      )}
                    </div>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setPhoneVerificationSent(false)}
                        className="flex-1 py-5 border-2 border-[#D4AF37] text-[#5E4E06] font-bold text-lg rounded-2xl hover:bg-[#F5F2E8] transition-all duration-300 cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 py-5 bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white font-bold text-lg rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <>
                            <span>Verify & Sign Up</span>
                            <ArrowRight className="w-6 h-6" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
                {/* Social Signup Divider */}
                {!phoneVerificationSent && (
                  <>
                    <div className="flex items-center my-8">
                      <div className="flex-1 h-px bg-[#D4AF37]/30"></div>
                      <span className="px-4 text-[#8B7A1A] font-semibold">Or sign up with</span>
                      <div className="flex-1 h-px bg-[#D4AF37]/30"></div>
                    </div>
                    <div className="flex justify-center">
                      <button
                        onClick={handleGoogleSignup}
                        className="w-full max-w-xs flex items-center justify-center gap-3 py-4 px-6 border-2 border-[#D4AF37] rounded-2xl bg-white shadow-lg hover:bg-[#F5F2E8] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-lg font-bold"
                        type="button"
                        disabled={isSubmitting}
                      >
                        <svg className="w-7 h-7" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span className="font-bold text-[#5E4E06] text-lg">Continue with Google</span>
                      </button>
                    </div>
                    <div className="text-center pt-6 border-t border-[#D4AF37]/30 mt-8">
                      <p className="text-[#8B7A1A] text-lg font-medium">
                        Already have an account?{' '}
                        <Link href="/login" className="text-[#5E4E06] hover:text-[#8B7A1A] font-bold transition-colors underline decoration-2 underline-offset-4">
                          Sign in here
                        </Link>
                      </p>
                    </div>
                  </>
                )}
              </>
            }
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
} 