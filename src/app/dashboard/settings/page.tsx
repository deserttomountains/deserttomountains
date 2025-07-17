"use client";
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { useState, useEffect } from 'react';
import { getAuth, updateProfile, updateEmail, sendPasswordResetEmail, deleteUser } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { AuthService } from '@/lib/firebase';
import DashboardLayout from '../DashboardLayout';
import { User as UserIcon, Trash2, Loader2, Save, AlertCircle } from 'lucide-react';
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
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Add state for country dropdown
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const filteredCountries = COUNTRIES.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()) || c.code.toLowerCase().includes(countrySearch.toLowerCase()));

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
              setPhone(profile.phone);
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

  const isPhonePrimary = !!user?.phoneNumber && (!user?.email || user.providerData.some(p => p.providerId === 'phone'));
  const isEmailPrimary = !!user?.email && (!user?.phoneNumber || user.providerData.some(p => p.providerId === 'password' || p.providerId === 'google.com'));

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
    
    // Phone validation (basic)
    if (phone && !/^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
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
      
      // Update email in Firebase Auth if it's a secondary field
      if (user && isPhonePrimary && email && email !== user.email) {
        await updateEmail(user, email);
      }
      
      // Update Firestore profile with all data
      if (user) {
        const firestoreProfile = await AuthService.getUserProfile(user.uid);
        const updatedProfile = {
          ...firestoreProfile,
          firstName: name.split(' ')[0] || '',
          lastName: name.split(' ').slice(1).join(' '),
          phone: phone,
          email: email,
          address: {
            street,
            city,
            state: stateVal,
            pincode,
            country
          },
          updatedAt: new Date(),
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
      <div className="max-w-5xl mx-auto pt-24 pb-12 px-2 md:px-0">
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
                  {isPhonePrimary ? (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-[#8B7A1A] mb-1">Phone (Primary)</label>
                        <input
                          className="w-full border border-[#E6DCC0] rounded-xl px-3 py-2 bg-gray-100 text-[#5E4E06] cursor-not-allowed"
                          value={phone}
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#8B7A1A] mb-1">Email (Secondary)</label>
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
                        {errors.email && (
                          <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {errors.email}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-[#8B7A1A] mb-1">Email (Primary)</label>
                        <input
                          className="w-full border border-[#E6DCC0] rounded-xl px-3 py-2 bg-gray-100 text-[#5E4E06] cursor-not-allowed"
                          value={email}
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#8B7A1A] mb-1">Phone (Secondary)</label>
                        <input
                          className={`w-full border rounded-xl px-3 py-2 bg-white text-[#5E4E06] focus:ring-2 focus:outline-none ${
                            errors.phone 
                              ? 'border-red-500 focus:ring-red-500' 
                              : 'border-[#E6DCC0] focus:ring-[#D4AF37]'
                          }`}
                          value={phone}
                          onChange={e => {
                            setPhone(e.target.value);
                            if (errors.phone) clearErrors();
                          }}
                          placeholder="Add your phone number"
                          disabled
                        />
                        {errors.phone && (
                          <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {errors.phone}
                          </div>
                        )}
                        <div className="text-xs text-[#8B7A1A] mt-1">To change your phone, please use the phone number change flow.</div>
                      </div>
                    </>
                  )}
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
                  <div className="relative">
                    <label className="block text-sm font-semibold text-[#8B7A1A] mb-1">Country</label>
                    <button
                      type="button"
                      onClick={() => setShowCountryDropdown((v) => !v)}
                      className="w-full pl-10 pr-10 py-2 rounded-xl border border-[#E6DCC0] bg-white text-[#5E4E06] text-base text-left focus:ring-2 focus:ring-[#D4AF37] focus:outline-none hover:border-[#D4AF37] transition-all"
                    >
                      {country || 'Select country'}
                    </button>
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8B7A1A]" />
                    <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8B7A1A] transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    {showCountryDropdown && (
                      <div className="absolute z-50 w-full mt-2 bg-white border border-[#D4AF37] rounded-xl shadow-2xl max-h-80 overflow-hidden">
                        <div className="p-2 border-b border-[#D4AF37]/30">
                    <input
                            type="text"
                            value={countrySearch}
                            onChange={e => setCountrySearch(e.target.value)}
                            placeholder="Search countries..."
                            className="w-full px-3 py-2 text-base border border-[#E6DCC0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] bg-white text-[#5E4E06] placeholder:text-[#8B7A1A]"
                            autoFocus
                          />
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {filteredCountries.map((c) => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => {
                                setCountry(c.name);
                                setShowCountryDropdown(false);
                                setCountrySearch('');
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-[#F5F2E8] transition-colors duration-200 cursor-pointer"
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
    </DashboardLayout>
  );
} 