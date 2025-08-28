"use client";
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { useState, useEffect, useRef } from 'react';
import { getAuth, updateProfile, updateEmail, sendPasswordResetEmail, deleteUser } from 'firebase/auth';
import app from '@/lib/firebase';
import { AuthService } from '@/lib/firebase';
import DashboardLayout from '../DashboardLayout';
import { User as UserIcon, Trash2, Loader2, Save, AlertCircle, Phone } from 'lucide-react';
import { useToast } from '@/components/ToastContext';
// Import country list from UniversalAddressForm
import { COUNTRIES } from '@/components/UniversalAddressForm';
import { Globe } from 'lucide-react';
import AccountMerger from '@/components/AccountMerger';

export default function AccountSettingsPage() {
  const auth = getAuth(app);
  const user = auth.currentUser;
  const { showToast } = useToast();
  
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState("");
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  
  // Account merger state
  const [showAccountMerger, setShowAccountMerger] = useState(false);
  const [duplicateCredentials, setDuplicateCredentials] = useState<{ email?: string; phone?: string }>({});
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Add state for country dropdown
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const filteredCountries = COUNTRIES.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()) || c.code.toLowerCase().includes(countrySearch.toLowerCase()));
  
  // Ref for the country dropdown container
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  // Phone input state
  const [selectedCountryCode, setSelectedCountryCode] = useState('+91'); // Default to India
  const [showPhoneCountryDropdown, setShowPhoneCountryDropdown] = useState(false);
  const [phoneCountrySearch, setPhoneCountrySearch] = useState('');
  

  
  // Filter countries for phone input (focus on common ones first)
  const commonPhoneCountries = [
    { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
    { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
    { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
    { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
    { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
    { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
    { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
    { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
    { code: 'AE', name: 'UAE', dialCode: '+971', flag: '🇦🇪' },
  ];
  
  const filteredPhoneCountries = commonPhoneCountries.filter(c => 
    c.name.toLowerCase().includes(phoneCountrySearch.toLowerCase()) || 
    c.dialCode.includes(phoneCountrySearch) ||
    c.code.toLowerCase().includes(phoneCountrySearch.toLowerCase())
  );

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
            
            // Load email and phone from Firestore if available
            if (profile.email) {
              setEmail(profile.email);
            }
            if (profile.phone) {
              // Simple extraction: remove country code and show only phone number
              if (profile.phone.startsWith('+91')) {
                setSelectedCountryCode('+91');
                setPhone(profile.phone.substring(3)); // Remove +91
              } else if (profile.phone.startsWith('+1')) {
                setSelectedCountryCode('+1');
                setPhone(profile.phone.substring(2)); // Remove +1
              } else if (profile.phone.startsWith('+44')) {
                setSelectedCountryCode('+44');
                setPhone(profile.phone.substring(3)); // Remove +44
              } else if (profile.phone.startsWith('+61')) {
                setSelectedCountryCode('+61');
                setPhone(profile.phone.substring(3)); // Remove +61
              } else if (profile.phone.startsWith('+49')) {
                setSelectedCountryCode('+49');
                setPhone(profile.phone.substring(3)); // Remove +49
              } else if (profile.phone.startsWith('+33')) {
                setSelectedCountryCode('+33');
                setPhone(profile.phone.substring(3)); // Remove +33
              } else if (profile.phone.startsWith('+81')) {
                setSelectedCountryCode('+81');
                setPhone(profile.phone.substring(3)); // Remove +81
              } else if (profile.phone.startsWith('+65')) {
                setSelectedCountryCode('+65');
                setPhone(profile.phone.substring(3)); // Remove +65
              } else if (profile.phone.startsWith('+971')) {
                setSelectedCountryCode('+971');
                setPhone(profile.phone.substring(4)); // Remove +971
              } else {
                // Unknown country code, just show the full number
                setPhone(profile.phone);
              }
            }
            
            // Load address fields
            if (profile.address) {
              setStreet(profile.address.street || "");
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

  // Handle click outside to close phone country dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target?.closest('.phone-country-dropdown')) {
        setShowPhoneCountryDropdown(false);
        setPhoneCountrySearch('');
      }
    };

    if (showPhoneCountryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPhoneCountryDropdown]);

  // For Google sign-in users, email is always primary, phone is always editable
  const isPhonePrimary = !!user?.phoneNumber && user.providerData.some(p => p.providerId === 'phone');
  const isEmailPrimary = !!user?.email && user.providerData.some(p => p.providerId === 'password' || p.providerId === 'google.com');
  
  // For Google sign-in users, always allow phone editing
  const canEditPhone = !isPhonePrimary || user?.providerData.some(p => p.providerId === 'google.com');

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
    
    // Phone validation - simple length check
    if (phone) {
      if (phone.length < 7 || phone.length > 15) {
        newErrors.phone = 'Phone number must be between 7-15 digits';
      }
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

  // Simple phone number handling - just numbers, no formatting
  const handlePhoneChange = (value: string) => {
    // Only allow digits
    const cleaned = value.replace(/\D/g, '');
    setPhone(cleaned);
    if (errors.phone) clearErrors();
  };

  const handleCountryCodeChange = (countryCode: string) => {
    setSelectedCountryCode(countryCode);
    setShowPhoneCountryDropdown(false);
    setPhoneCountrySearch('');
    
    // Don't modify the phone number when changing country code
    // Let the user manually enter the number
  };

  const handleDuplicateCredentials = (email?: string, phone?: string) => {
    setDuplicateCredentials({ email, phone });
    setShowAccountMerger(true);
  };

  const handleAccountMergerClose = () => {
    setShowAccountMerger(false);
    setDuplicateCredentials({});
  };

  const handleAccountMergerSuccess = (message: string) => {
    showToast(message, 'success');
    setShowAccountMerger(false);
    setDuplicateCredentials({});
  };

  const resetPhoneInput = () => {
    setPhone('');
    setSelectedCountryCode('+91');
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
      
      // Update email in Firebase Auth if it's a secondary field
      if (user && isPhonePrimary && email && email !== user.email) {
        await updateEmail(user, email);
      }
      
      // Update Firestore profile with all data
      if (user) {
        // Check for duplicate credentials before updating
        const duplicateCheck = await AuthService.checkDuplicateCredentialsForUpdate(
          user.uid,
          email,
          selectedCountryCode + phone.replace(/\s/g, '')
        );
        
        if (duplicateCheck.hasDuplicates) {
          if (duplicateCheck.duplicates.phone) {
            handleDuplicateCredentials(email, selectedCountryCode + phone.replace(/\s/g, ''));
            return;
          }
          if (duplicateCheck.duplicates.email) {
            handleDuplicateCredentials(email, selectedCountryCode + phone.replace(/\s/g, ''));
            return;
          }
        }

        const firestoreProfile = await AuthService.getUserProfile(user.uid);
        const updatedProfile = {
          ...firestoreProfile,
          uid: user.uid, // Ensure uid is always a string
          role: (firestoreProfile?.role ?? 'customer') as 'customer' | 'admin', // Always a valid UserRole
          firstName: name.split(' ')[0] || '',
          lastName: name.split(' ').slice(1).join(' '),
          phone: selectedCountryCode + phone.replace(/\s/g, ''), // Remove spaces for storage
          email: email,
          address: {
            street,
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

  async function handleDeleteAccount() {
    if (deleteConfirm !== 'DELETE') {
      showToast("Please type 'DELETE' to confirm account deletion", 'error');
      return;
    }
    
    if (!user) {
      showToast("No user found", 'error');
      return;
    }
    
    try {
      // Delete from Firestore first
      await AuthService.deleteUserProfile(user.uid);
      // Then delete from Firebase Auth
      await deleteUser(user);
      showToast("Account deleted successfully", 'success');
    } catch (e: any) {
      console.error('Error deleting account:', e);
      showToast(e.message || "Failed to delete account", 'error');
    }
  }

  if (loading) {
    return (
      <DashboardLayout active="Settings">
        <div className="max-w-5xl mx-auto pt-24 pb-12 px-2 md:px-0">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-[#D4AF37] p-10 md:p-14">
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center gap-4">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
                <span className="text-lg font-semibold text-[#5E4E06]">Loading your profile...</span>
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
                  <div className="text-[#8B7A1A] text-sm">{isPhonePrimary ? phone : email}</div>
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
                  {/* Email field - always editable for Google users */}
                  <div>
                    <label className="block text-sm font-semibold text-[#8B7A1A] mb-1">
                      {isPhonePrimary ? 'Email (Secondary)' : 'Email (Primary)'}
                    </label>
                    {isPhonePrimary ? (
                      <input
                        className={`w-full border rounded-xl px-3 py-2 bg-white text-[#5E4E06] focus:ring-2 focus:outline-none ${
                          errors.email 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-[#E6DCC0] focus:ring-[#D4AF37]'
                        }`}
                        value={email}
                        onChange={e => {
                          setEmail(e.target.value);
                          if (errors.email) clearErrors();
                        }}
                        placeholder="Add your email"
                      />
                    ) : (
                      <input
                        className="w-full border border-[#E6DCC0] rounded-xl px-3 py-2 bg-gray-100 text-[#5E4E06] cursor-not-allowed"
                        value={email}
                        disabled
                      />
                    )}
                    {errors.email && (
                      <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {errors.email}
                      </div>
                    )}
                  </div>

                  {/* Phone field - always editable for Google users */}
                  <div>
                    <label className="block text-sm font-semibold text-[#8B7A1A] mb-1">
                      {isPhonePrimary ? 'Phone (Primary)' : 'Phone Number'}
                    </label>
                    {isPhonePrimary ? (
                      <input
                        className="w-full border border-[#E6DCC0] rounded-xl px-3 py-2 bg-gray-100 text-[#5E4E06] cursor-not-allowed"
                        value={phone}
                        disabled
                      />
                    ) : (
                      <div className="relative">
                        {/* Country Code Dropdown */}
                        <div className="absolute inset-y-0 left-0 z-10">
                          <button
                            type="button"
                            onClick={() => setShowPhoneCountryDropdown(!showPhoneCountryDropdown)}
                            className="h-full px-3 flex items-center gap-2 bg-[#F5F2E8] border-r border-[#E6DCC0] rounded-l-xl hover:bg-[#E6DCC0] transition-colors"
                          >
                            <span className="text-sm font-medium text-[#5E4E06]">{selectedCountryCode}</span>
                            <svg className="w-4 h-4 text-[#8B7A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          
                          {/* Country Code Dropdown Menu */}
                          {showPhoneCountryDropdown && (
                            <div className="phone-country-dropdown absolute top-full left-0 mt-1 w-64 bg-white border border-[#D4AF37] rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                              {/* Search */}
                              <div className="p-3 border-b border-[#D4AF37]/30">
                                <input
                                  type="text"
                                  value={phoneCountrySearch}
                                  onChange={(e) => setPhoneCountrySearch(e.target.value)}
                                  placeholder="Search countries..."
                                  className="w-full px-3 py-2 text-sm border border-[#E6DCC0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] bg-white text-[#5E4E06] placeholder:text-[#8B7A1A]"
                                />
                              </div>
                              
                              {/* Country List */}
                              <div className="py-2">
                                {filteredPhoneCountries.map((country) => (
                                  <button
                                    key={country.code}
                                    type="button"
                                    onClick={() => handleCountryCodeChange(country.dialCode)}
                                    className="w-full px-3 py-2 text-left hover:bg-[#F5F2E8] transition-colors flex items-center gap-3"
                                  >
                                    <span className="text-lg">{country.flag}</span>
                                    <span className="text-sm font-medium text-[#5E4E06]">{country.name}</span>
                                    <span className="text-sm text-[#8B7A1A] ml-auto">{country.dialCode}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Phone Input */}
                        <input
                          className={`w-full border rounded-xl py-3 pl-24 pr-3 bg-white text-[#5E4E06] focus:ring-2 focus:outline-none ${
                            errors.phone 
                              ? 'border-red-500 focus:ring-red-500' 
                              : 'border-[#E6DCC0] focus:border-[#D4AF37] focus:ring-[#D4AF37]/20'
                          }`}
                          value={phone}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          placeholder="Enter phone number"
                        />
                        
                        {/* Reset Button */}
                        {phone && (
                          <button
                            type="button"
                            onClick={resetPhoneInput}
                            className="absolute inset-y-0 right-0 px-3 text-[#8B7A1A] hover:text-[#5E4E06] transition-colors"
                            title="Reset phone number"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    )}
                    {errors.phone && (
                      <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {errors.phone}
                      </div>
                    )}
                    {!isPhonePrimary && (
                      <div className="text-xs text-[#8B7A1A] mt-1">
                        💡 <strong>Tip:</strong> Select your country code and enter your phone number. The system will automatically format it for you. This will be used for account verification and communications.
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
                    <label className="block text-sm font-semibold text-[#8B7A1A] mb-1">Street</label>
                    <input
                      className="w-full border border-[#E6DCC0] rounded-xl px-3 py-2 bg-white text-[#5E4E06] focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                      value={street}
                      onChange={e => setStreet(e.target.value)}
                      placeholder="Street address"
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
                {!user?.email && <div className="text-xs text-[#8B7A1A] mt-1">Password reset is only available for email accounts.</div>}
              </div>
              <div className="border-t border-red-200 pt-8">
                <h2 className="font-bold text-red-700 text-base mb-2 flex items-center gap-2"><Trash2 className="w-5 h-5" /> Danger Zone</h2>
                <div className="mb-4 text-red-700 text-sm">Deleting your account is irreversible. All your data will be permanently removed.</div>
                <AlertDialog.Root open={showDelete} onOpenChange={setShowDelete}>
                  <AlertDialog.Trigger asChild>
                    <button className="w-full px-4 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition cursor-pointer">Delete Account</button>
                  </AlertDialog.Trigger>
                  <AlertDialog.Portal>
                    <AlertDialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
                    <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-8 z-50 w-full max-w-xs flex flex-col items-center">
                      <AlertDialog.Title className="text-lg font-bold mb-2 text-red-700">Delete Account?</AlertDialog.Title>
                      <AlertDialog.Description className="mb-6 text-center text-red-700">Type <b>DELETE</b> below to confirm. This action cannot be undone.</AlertDialog.Description>
                      <input
                        className="w-full border border-red-300 rounded px-3 py-2 mb-4 text-red-700 focus:ring-2 focus:ring-red-400"
                        value={deleteConfirm}
                        onChange={e => setDeleteConfirm(e.target.value)}
                        placeholder="Type here..."
                        autoFocus
                      />
                      <div className="flex gap-4 w-full justify-center">
                        <AlertDialog.Cancel asChild>
                          <button className="px-4 py-2 rounded font-bold text-gray-700 bg-gray-100 border hover:bg-gray-200 transition cursor-pointer">Cancel</button>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action asChild>
                          <button
                            className="px-4 py-2 rounded font-bold text-white bg-red-600 hover:bg-red-700 transition cursor-pointer"
                            onClick={handleDeleteAccount}
                            disabled={deleteConfirm !== 'DELETE'}
                          >
                            Delete
                          </button>
                        </AlertDialog.Action>
                      </div>
                    </AlertDialog.Content>
                  </AlertDialog.Portal>
                </AlertDialog.Root>
              </div>

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

      {/* Account Merger Modal */}
      {showAccountMerger && (
        <AccountMerger
          email={duplicateCredentials.email}
          phone={duplicateCredentials.phone}
          onClose={handleAccountMergerClose}
          onSuccess={handleAccountMergerSuccess}
        />
      )}
    </DashboardLayout>
  );
} 