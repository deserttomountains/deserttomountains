"use client";

import { useState, useEffect, useRef } from 'react';
import { getAuth, updateProfile, updateEmail, sendPasswordResetEmail } from 'firebase/auth';
import app from '@/lib/firebase';
import { AuthService } from '@/lib/firebase';
import DashboardLayout from '../DashboardLayout';
import { User as UserIcon, Loader2, Save, AlertCircle, Phone, Shield, Mail } from 'lucide-react';
import { useToast } from '@/components/ToastContext';
// Import country list from UniversalAddressForm
import { COUNTRIES } from '@/components/UniversalAddressForm';
import { Globe } from 'lucide-react';

export default function AccountSettingsPage() {
  const auth = getAuth(app);
  const user = auth.currentUser;
  const { showToast } = useToast();
  
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState("");
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Add state for country dropdown
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const filteredCountries = COUNTRIES.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()) || c.code.toLowerCase().includes(countrySearch.toLowerCase()));
  
  // Ref for the country dropdown container
  const countryDropdownRef = useRef<HTMLDivElement>(null);


  



  // Load Firestore profile for all fields
  useEffect(() => {
    if (user?.uid) {
      setLoading(true);
      AuthService.getUserProfile(user.uid)
        .then(profile => {
          if (profile) {
            // Load name from Firestore (firstName + lastName)
            const fullName = profile.firstName && profile.lastName 
              ? `${profile.firstName} ${profile.lastName}`.trim()
              : profile.firstName || profile.lastName || user?.displayName || "";
            setName(fullName);
            
            // Load email from Firestore if available
            if (profile.email) {
              setEmail(profile.email);
            }
            
            // Load phone from Firestore if available
            if (profile.phone) {
              setPhone(profile.phone);
            }
            
            // Load address fields
            if (profile.address) {
              setAddressLine1(profile.address.street || profile.address.addressLine1 || "");
              setAddressLine2(profile.address.addressLine2 || "");
              setCity(profile.address.city || "");
              setStateVal(profile.address.state || "");
              setPincode(profile.address.pincode || "");
              setCountry(profile.address.country || "");
            }
          }
        })
        .catch(error => {
          console.error('Error loading profile:', error);
          showToast('Failed to load profile data', 'error');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user?.uid, user?.displayName, showToast]);

  // Handle click outside to close country dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
        setCountrySearch('');
      }
    };

    if (showCountryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCountryDropdown]);



  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Name validation
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    // Email validation
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    

    
    // Pincode validation (6 digits for India)
    if (pincode && !/^\d{6}$/.test(pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearErrors = () => {
    setErrors({});
  };









  async function handleSave() {
    // Clear previous errors and validate form
    clearErrors();
    if (!validateForm()) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    setSaving(true);
    try {
      // Update Firebase Auth profile
      if (user && name !== user.displayName) {
        await updateProfile(user, { displayName: name });
      }
      
      // Update Firestore profile with all data
      if (user) {
        const firestoreProfile = await AuthService.getUserProfile(user.uid);
        
        // Don't update email if it's the primary login credential
        const emailToSave = isEmailPrimaryLogin() ? firestoreProfile?.email || user.email || '' : email;
        
        // Don't update phone if it's the primary login credential
        const phoneToSave = isPhonePrimaryLogin() ? firestoreProfile?.phone || user.phoneNumber || '' : phone;
        
        const updatedProfile = {
          ...firestoreProfile,
          uid: user.uid, // Ensure uid is always a string
          role: (firestoreProfile?.role ?? 'customer') as 'customer' | 'admin', // Always a valid UserRole
          firstName: name.split(' ')[0] || '',
          lastName: name.split(' ').slice(1).join(' '),
          phone: phoneToSave, // Use the phone from form state or keep existing if primary
          email: emailToSave, // Use the email from form state or keep existing if primary
          address: {
            addressLine1,
            addressLine2,
            city,
            state: stateVal,
            pincode,
            country
          },
          updatedAt: new Date(),
          createdAt: firestoreProfile?.createdAt ?? new Date(), // Ensure createdAt is always a Date
        };
        
        await AuthService.updateUserProfile(user.uid, updatedProfile);
      }
      
      showToast('Profile updated successfully!', 'success');
    } catch (e: any) {
      console.error('Error updating profile:', e);
      showToast(e.message || "Failed to update profile", 'error');
    } finally {
      setSaving(false);
    }
  }

  // Check if user has email or Google-based authentication
  function hasEmailOrGoogleAuth() {
    if (!user) return false;
    
    const providers = user.providerData;
    const hasEmailProvider = providers.find(p => p.providerId === 'password');
    const hasGoogleProvider = providers.find(p => p.providerId === 'google.com');
    
    return hasEmailProvider || hasGoogleProvider;
  }

  // Check if current email is the primary login credential
  function isEmailPrimaryLogin() {
    if (!user) return false;
    
    const providers = user.providerData;
    const emailProvider = providers.find(p => p.providerId === 'password');
    const googleProvider = providers.find(p => p.providerId === 'google.com');
    
    // If user has email/password provider and the email matches, it's primary
    // OR if user has Google provider (which uses email as primary credential)
    const isPrimary = (emailProvider && emailProvider.email === user.email) || 
                     (googleProvider && googleProvider.email === user.email);
    
    return isPrimary;
  }

  // Check if current phone is the primary login credential
  function isPhonePrimaryLogin() {
    if (!user) return false;
    
    const providers = user.providerData;
    const phoneProvider = providers.find(p => p.providerId === 'phone');
    
    // If user has phone provider and the phone matches, it's primary
    const isPrimary = phoneProvider && phoneProvider.phoneNumber === user.phoneNumber;
    return isPrimary;
  }

  async function handleResetPassword() {
    if (!user?.email) {
      showToast("No email associated with this account", 'error');
      return;
    }
    
    try {
      await sendPasswordResetEmail(auth, user.email);
      showToast("Password reset email sent to your email address", 'success');
    } catch (e: any) {
      console.error('Error sending password reset:', e);
      showToast(e.message || "Failed to send reset email", 'error');
    }
  }



  if (loading || !user) {
    return (
      <DashboardLayout active="Settings">
        <div className="max-w-5xl mx-auto pt-24 pb-12 px-2 md:px-0">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-[#D4AF37] p-10 md:p-14">
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center gap-4">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
                <span className="text-lg font-semibold text-[#5E4E06]">
                  {!user ? 'Please log in to view settings...' : 'Loading your profile...'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout active="Settings">
      <div className="max-w-5xl mx-auto pt-24 pb-20 px-2 md:px-0">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-[#D4AF37] p-10 md:p-14">
          <div className="flex flex-col md:flex-row gap-10">
            {/* Left Column: Profile & Contact */}
            <div className="flex-1 min-w-0">
              {/* Profile Card */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] flex items-center justify-center shadow-lg border-4 border-white">
                  <UserIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="font-black text-xl text-[#5E4E06]">{name || 'Your Name'}</div>
                  <div className="text-[#8B7A1A] text-sm">{email || 'No email'}</div>
                  {phone && <div className="text-[#8B7A1A] text-sm">{phone}</div>}
                </div>
              </div>
              <div className="mb-8">
                <h2 className="text-lg font-bold text-[#5E4E06] mb-4">Profile Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#8B7A1A] mb-1">Name</label>
                    <input
                      className={`w-full border rounded-xl px-3 py-2 bg-white text-[#5E4E06] focus:ring-2 focus:outline-none ${
                        errors.name 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-[#E6DCC0] focus:ring-[#D4AF37]'
                      }`}
                      value={name}
                      onChange={e => {
                        setName(e.target.value);
                        if (errors.name) clearErrors();
                      }}
                      placeholder="Your name"
                    />
                    {errors.name && (
                      <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {errors.name}
                      </div>
                    )}
                  </div>
                  {/* Email field - disabled if it's the primary login credential */}
                  <div>
                    <label className="block text-sm font-semibold text-[#8B7A1A] mb-1">
                      Email Address
                      {isEmailPrimaryLogin() && (
                        <span className="ml-2 text-xs text-[#D4AF37] bg-[#F5F2E8] px-2 py-1 rounded-full">
                          Primary Login
                        </span>
                      )}
                    </label>
                    <input
                      className={`w-full border rounded-xl px-3 py-2 focus:ring-2 focus:outline-none ${
                        isEmailPrimaryLogin()
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300'
                          : errors.email 
                            ? 'bg-white text-[#5E4E06] border-red-500 focus:ring-red-500' 
                            : 'bg-white text-[#5E4E06] border-[#E6DCC0] focus:ring-[#D4AF37]'
                      }`}
                      value={email}
                      onChange={e => {
                        if (!isEmailPrimaryLogin()) {
                          setEmail(e.target.value);
                          if (errors.email) clearErrors();
                        }
                      }}
                      placeholder="Enter your email"
                      disabled={isEmailPrimaryLogin()}
                    />
                    {isEmailPrimaryLogin() && (
                      <div className="flex items-center gap-1 mt-1 text-[#8B7A1A] text-sm">
                        <Shield className="w-4 h-4" />
                        This email is used for login and cannot be changed here
                      </div>
                    )}
                    {errors.email && (
                      <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {errors.email}
                      </div>
                    )}
                  </div>
                  
                  {/* Phone Number Field - disabled if it's the primary login credential */}
                  <div>
                    <label className="block text-sm font-semibold text-[#8B7A1A] mb-1">
                      Phone Number
                      {isPhonePrimaryLogin() && (
                        <span className="ml-2 text-xs text-[#D4AF37] bg-[#F5F2E8] px-2 py-1 rounded-full">
                          Primary Login
                        </span>
                      )}
                    </label>
                    <input
                      className={`w-full border rounded-xl px-3 py-2 focus:ring-2 focus:outline-none ${
                        isPhonePrimaryLogin()
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300'
                          : 'bg-white text-[#5E4E06] border-[#E6DCC0] focus:ring-[#D4AF37]'
                      }`}
                      value={phone}
                      onChange={e => {
                        if (!isPhonePrimaryLogin()) {
                          setPhone(e.target.value);
                        }
                      }}
                      placeholder="Enter your phone number"
                      disabled={isPhonePrimaryLogin()}
                    />
                    {isPhonePrimaryLogin() && (
                      <div className="flex items-center gap-1 mt-1 text-[#8B7A1A] text-sm">
                        <Shield className="w-4 h-4" />
                        This phone number is used for login and cannot be changed here
                      </div>
                    )}
                  </div>


                </div>
              </div>
              {/* Address Section */}
              <div className="mb-8">
                <h2 className="text-lg font-bold text-[#5E4E06] mb-4">Address</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#8B7A1A] mb-1">Address Line 1</label>
                    <input
                      className="w-full border border-[#E6DCC0] rounded-xl px-3 py-2 bg-white text-[#5E4E06] focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                      value={addressLine1}
                      onChange={e => setAddressLine1(e.target.value)}
                      placeholder="Street address, apartment, suite, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#8B7A1A] mb-1">Address Line 2 (Optional)</label>
                    <input
                      className="w-full border border-[#E6DCC0] rounded-xl px-3 py-2 bg-white text-[#5E4E06] focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                      value={addressLine2}
                      onChange={e => setAddressLine2(e.target.value)}
                      placeholder="Apartment, suite, unit, etc."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#8B7A1A] mb-1">City</label>
                      <input
                        className="w-full border border-[#E6DCC0] rounded-xl px-3 py-2 bg-white text-[#5E4E06] focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#8B7A1A] mb-1">State</label>
                      <input
                        className="w-full border border-[#E6DCC0] rounded-xl px-3 py-2 bg-white text-[#5E4E06] focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                        value={stateVal}
                        onChange={e => setStateVal(e.target.value)}
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#8B7A1A] mb-1">Pincode</label>
                      <input
                        className={`w-full border rounded-xl px-3 py-2 bg-white text-[#5E4E06] focus:ring-2 focus:outline-none ${
                          errors.pincode 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-[#E6DCC0] focus:ring-[#D4AF37]'
                        }`}
                        value={pincode}
                        onChange={e => {
                          setPincode(e.target.value);
                          if (errors.pincode) clearErrors();
                        }}
                        placeholder="Pincode"
                      />
                      {errors.pincode && (
                        <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          {errors.pincode}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="relative" ref={countryDropdownRef}>
                    <label className="block text-sm font-semibold text-[#8B7A1A] mb-1">Country</label>
                    <button
                      type="button"
                      onClick={() => setShowCountryDropdown((v) => !v)}
                      className="w-full pl-12 pr-12 py-2 rounded-xl border border-[#E6DCC0] bg-white text-[#5E4E06] text-base text-left focus:ring-2 focus:ring-[#D4AF37] focus:outline-none hover:border-[#D4AF37] transition-all flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-[#8B7A1A] flex-shrink-0" />
                        <span className="truncate">{country || 'Select country'}</span>
                      </span>
                      <svg 
                        className={`w-5 h-5 text-[#8B7A1A] transition-transform duration-300 flex-shrink-0 ${showCountryDropdown ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                                        {showCountryDropdown && (
                      <div className="absolute z-50 w-full mt-2 bg-white border border-[#D4AF37] rounded-xl shadow-2xl overflow-hidden" style={{ maxHeight: '300px' }}>
                        <div className="p-2 border-b border-[#D4AF37]/30 bg-white">
                          <input
                            type="text"
                            value={countrySearch}
                            onChange={e => setCountrySearch(e.target.value)}
                            placeholder="Search countries..."
                            className="w-full px-3 py-2 text-base border border-[#E6DCC0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] bg-white text-[#5E4E06] placeholder:text-[#8B7A1A]"
                            autoFocus
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto bg-white">
                          {filteredCountries.map((c) => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => {
                                setCountry(c.name);
                                setShowCountryDropdown(false);
                                setCountrySearch('');
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-[#F5F2E8] transition-colors duration-200 cursor-pointer bg-white"
                            >
                              <div className="font-semibold text-[#5E4E06]">{c.name}</div>
                              <div className="text-xs text-[#8B7A1A]">{c.code}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Right Column: Security & Danger Zone */}
            <div className="flex-1 min-w-0 flex flex-col gap-8">
              {hasEmailOrGoogleAuth() && (
                <div className="mb-8">
                  <h2 className="text-lg font-bold text-[#5E4E06] mb-4">Security</h2>
                  <button
                    className="w-full px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white font-bold rounded-xl hover:scale-105 transition-all duration-300 cursor-pointer text-base shadow"
                    onClick={handleResetPassword}
                    disabled={!user?.email}
                    type="button"
                  >
                    Reset Password
                  </button>
                  <div className="text-xs text-[#8B7A1A] mt-1">Password reset is available for email and Google accounts.</div>
                  
                  {/* Information about changing primary login credentials */}
                  {(isEmailPrimaryLogin() || isPhonePrimaryLogin()) && (
                    <div className="mt-4 p-4 bg-[#F5F2E8] rounded-xl border border-[#D4AF37]/30">
                      <h3 className="font-semibold text-[#5E4E06] mb-2 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Primary Login Credentials
                      </h3>
                      <p className="text-sm text-[#8B7A1A] mb-3">
                        Your primary login credentials cannot be changed from this page for security reasons.
                      </p>
                      <div className="text-xs text-[#8B7A1A] space-y-1">
                        {isEmailPrimaryLogin() && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            <span>Email: {user?.email}</span>
                          </div>
                        )}
                        {isPhonePrimaryLogin() && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3" />
                            <span>Phone: {user?.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-[#8B7A1A] mt-2">
                        To change your primary login credentials, please contact support or create a new account.
                      </p>
                    </div>
                  )}
                </div>
              )}

                </div>
              </div>
          {/* Save Button */}
          <div className="flex justify-end mt-10">
            <button
              className={`px-8 py-3 bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white font-bold rounded-xl transition-all duration-300 cursor-pointer text-lg shadow-lg flex items-center gap-2 ${
                saving 
                  ? 'opacity-70 cursor-not-allowed' 
                  : 'hover:scale-105'
              }`}
              onClick={handleSave}
              disabled={saving}
              type="button"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 