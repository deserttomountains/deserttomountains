# Phase 2: End-to-End Testing Guide

## 🎯 **Testing Overview**

This guide covers comprehensive testing of the credential linking functionality implemented in Phase 2. Test all scenarios to ensure the system works correctly.

## 📋 **Pre-Testing Setup**

### 1. **Firebase Configuration**
- ✅ Ensure Firebase project is properly configured
- ✅ Cloud Functions are deployed (`firebase deploy --only functions`)
- ✅ Security rules are deployed (`firebase deploy --only firestore:rules`)
- ✅ Authentication methods are enabled (Email/Password, Phone, Google)

### 2. **Test Environment**
- ✅ Use a test Firebase project (not production)
- ✅ Have multiple test email addresses ready
- ✅ Have multiple test phone numbers ready
- ✅ Clear browser cache and cookies between tests

## 🧪 **Test Scenarios**

### **Test 1: Email → Add Phone Linking Flow**

#### **Setup:**
1. Create a new account with email/password
2. Sign out
3. Go to Settings → Phone Authentication

#### **Test Steps:**
1. **Click "Verify Phone for Sign-in"**
   - ✅ Modal opens
   - ✅ Country dropdown shows
   - ✅ Phone input is clean (no country code visible)

2. **Select Country & Enter Phone**
   - ✅ Country dropdown works
   - ✅ Phone input accepts only digits
   - ✅ E.164 format is constructed correctly

3. **Send Verification Code**
   - ✅ "Send Verification Code" button works
   - ✅ SMS is received
   - ✅ Modal shows verification step

4. **Enter Verification Code**
   - ✅ Code input accepts 6 digits
   - ✅ "Verify & Link" button works
   - ✅ Success message shows
   - ✅ Phone appears in user's auth methods

#### **Expected Results:**
- ✅ Phone number is linked to Firebase Auth
- ✅ User can sign in with phone number
- ✅ Settings page shows phone as verified

---

### **Test 2: Google → Add Phone Linking Flow**

#### **Setup:**
1. Sign up with Google account
2. Go to Settings → Phone Authentication

#### **Test Steps:**
1. **Follow same steps as Test 1**
2. **Verify phone linking works for Google users**

#### **Expected Results:**
- ✅ Phone linking works for Google accounts
- ✅ User can sign in with either Google or phone
- ✅ No conflicts between auth methods

---

### **Test 3: Phone → Add Email Linking Flow**

#### **Setup:**
1. Create account with phone number
2. Go to Settings → Phone Authentication

#### **Test Steps:**
1. **Click "Add Another Sign-in Method"**
   - ✅ Modal opens with method selection

2. **Select "Email & Password"**
   - ✅ Email and password fields appear

3. **Enter Email & Password**
   - ✅ Form validation works
   - ✅ "Link Email" button works

4. **Complete Linking**
   - ✅ Success message shows
   - ✅ Email appears in auth methods

#### **Expected Results:**
- ✅ Email is linked to Firebase Auth
- ✅ User can sign in with email/password
- ✅ User can sign in with phone number

---

### **Test 4: Phone → Add Google Linking Flow**

#### **Setup:**
1. Create account with phone number
2. Go to Settings → Phone Authentication

#### **Test Steps:**
1. **Click "Add Another Sign-in Method"**
2. **Select "Google Account"**
3. **Complete Google linking**

#### **Expected Results:**
- ✅ Google account is linked
- ✅ User can sign in with Google
- ✅ User can sign in with phone

---

### **Test 5: Duplicate Detection in Signup**

#### **Setup:**
1. Create an account with email: `test@example.com`
2. Sign out

#### **Test Steps:**
1. **Try to sign up with same email**
   - ✅ Duplicate detection triggers
   - ✅ DuplicateAccountHandler shows

2. **Click "Link These Credentials Now"**
   - ✅ CredentialLinkingModal opens
   - ✅ User can link credentials

3. **Complete linking process**
   - ✅ Success message shows
   - ✅ Redirect to login

#### **Expected Results:**
- ✅ Duplicate detection works
- ✅ Linking option is available
- ✅ User can consolidate accounts

---

### **Test 6: Duplicate Detection in Login**

#### **Setup:**
1. Create account with phone: `+1234567890`
2. Sign out

#### **Test Steps:**
1. **Try to sign up with same phone**
   - ✅ Duplicate detection triggers
   - ✅ DuplicateAccountHandler shows

2. **Use linking functionality**
   - ✅ Same as Test 5

#### **Expected Results:**
- ✅ Phone duplicate detection works
- ✅ Linking works for phone duplicates

---

### **Test 7: AccountMerger Component**

#### **Setup:**
1. Create two accounts with different credentials
2. Try to link conflicting credentials

#### **Test Steps:**
1. **Trigger AccountMerger**
   - ✅ Component shows existing accounts
   - ✅ Phone verification works

2. **Complete merging**
   - ✅ Real Firebase Auth linking works
   - ✅ Success message shows

#### **Expected Results:**
- ✅ AccountMerger uses real Firebase Auth
- ✅ Credentials are properly linked
- ✅ No fake merging

---

### **Test 8: Error Handling**

#### **Test Cases:**
1. **Invalid phone number**
   - ✅ Error message shows
   - ✅ User can retry

2. **Invalid verification code**
   - ✅ Error message shows
   - ✅ User can retry

3. **Credential already in use**
   - ✅ Specific error message
   - ✅ User understands the issue

4. **reCAPTCHA failures**
   - ✅ Error handling works
   - ✅ User can retry

#### **Expected Results:**
- ✅ All errors are handled gracefully
- ✅ User-friendly error messages
- ✅ Retry mechanisms work

---

### **Test 9: Mobile Responsiveness**

#### **Test Steps:**
1. **Test on mobile device**
   - ✅ Modal fits screen
   - ✅ No clipping issues
   - ✅ Touch targets are appropriate

2. **Test on tablet**
   - ✅ Layout adapts correctly
   - ✅ All functionality works

#### **Expected Results:**
- ✅ Mobile-optimized design
- ✅ No UI issues on small screens
- ✅ All functionality accessible

---

### **Test 10: Security Rules**

#### **Test Steps:**
1. **Try to update email/phone in profile settings**
   - ✅ Direct updates are blocked
   - ✅ User must use linking flows

2. **Verify Cloud Functions work**
   - ✅ Profile creation on signup
   - ✅ Profile sync on auth changes

#### **Expected Results:**
- ✅ Security rules prevent direct updates
- ✅ Cloud Functions handle auth changes
- ✅ Data consistency maintained

## 🔧 **Debugging Tips**

### **Common Issues:**
1. **reCAPTCHA not working**
   - Check domain configuration in Firebase Console
   - Verify reCAPTCHA container exists

2. **Phone verification fails**
   - Check phone number format (E.164)
   - Verify SMS is enabled in Firebase Console

3. **Linking doesn't work**
   - Check Firebase Auth configuration
   - Verify Cloud Functions are deployed

### **Logs to Check:**
- Browser console for frontend errors
- Firebase Functions logs for backend errors
- Firestore rules for permission issues

## 📊 **Test Results Template**

```
## Test Results - [Date]

### ✅ Passed Tests:
- [ ] Test 1: Email → Add Phone
- [ ] Test 2: Google → Add Phone  
- [ ] Test 3: Phone → Add Email
- [ ] Test 4: Phone → Add Google
- [ ] Test 5: Duplicate Detection (Signup)
- [ ] Test 6: Duplicate Detection (Login)
- [ ] Test 7: AccountMerger Component
- [ ] Test 8: Error Handling
- [ ] Test 9: Mobile Responsiveness
- [ ] Test 10: Security Rules

### ❌ Failed Tests:
- [ ] Test X: [Description]
  - Issue: [Description]
  - Fix: [Action taken]

### 📝 Notes:
- [Additional observations]
- [Performance notes]
- [User experience feedback]
```

## 🚀 **Production Readiness Checklist**

- ✅ All tests pass
- ✅ Error handling is robust
- ✅ Mobile experience is good
- ✅ Security rules are enforced
- ✅ Cloud Functions are deployed
- ✅ Documentation is complete
- ✅ Migration script is ready

## 🎉 **Success Criteria**

Phase 2 is complete when:
1. **All linking flows work correctly**
2. **Duplicate detection prevents conflicts**
3. **AccountMerger uses real Firebase Auth**
4. **Mobile experience is excellent**
5. **Error handling is comprehensive**
6. **Security is maintained**

**Ready for production deployment!** 🚀
