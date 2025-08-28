# Duplicate Account Prevention System

## Overview

This system prevents users from creating multiple accounts with the same email address or phone number, addressing the scenario where:
- User A signs up with email `test@example.com`
- Later adds phone number `0123456789` to their account settings
- User B (or the same person) tries to sign up with phone `0123456789` and later add email `test@example.com`

## How It Works

### 1. **Pre-Signup Validation**
Before creating any new account, the system checks if the credentials are already associated with existing accounts:

- **Email Signup**: Checks both email and phone (if provided) for duplicates
- **Phone Signup**: Checks phone number for duplicates before sending verification code
- **Google Signup**: Checks for existing accounts with the same email

### 2. **Real-time Duplicate Detection**
The system uses Firestore queries to check for existing users:

```typescript
// Check by email
const emailCheck = await AuthService.checkUserExistsByEmail(email);

// Check by phone
const phoneCheck = await AuthService.checkUserExistsByPhone(phone);
```

### 3. **Profile Update Protection**
When users try to update their profile with new credentials, the system checks if those credentials belong to other accounts:

```typescript
// Excludes current user from duplicate check
const duplicateCheck = await AuthService.checkDuplicateCredentialsForUpdate(
  currentUid, 
  newEmail, 
  newPhone
);
```

## Implementation Details

### New AuthService Methods

#### `checkDuplicateCredentials(email?, phone?)`
- Checks for duplicates during signup
- Returns detailed information about any conflicts
- Used before creating new accounts

#### `checkDuplicateCredentialsForUpdate(currentUid, email?, phone?)`
- Checks for duplicates during profile updates
- Excludes the current user from duplicate detection
- Used when updating existing profiles

#### `getExistingAccountInfo(email?, phone?)`
- Retrieves information about existing accounts
- Useful for account recovery and user guidance
- Shows creation dates and account details

### User Experience Flow

#### When Duplicates Are Detected:

1. **Signup Blocked**: User cannot proceed with duplicate credentials
2. **Helpful Modal**: Shows `DuplicateAccountHandler` component
3. **Account Information**: Displays details about existing accounts
4. **Recovery Options**: Provides links to sign in with existing accounts
5. **Clear Guidance**: Explains why the signup was blocked

#### DuplicateAccountHandler Component Features:

- **Visual Alert**: Clear indication of duplicate credentials
- **Account Details**: Shows when existing accounts were created
- **Direct Links**: Quick access to login with existing credentials
- **Helpful Tips**: Guidance on password recovery and support
- **Professional Design**: Consistent with the app's visual style

## Security Benefits

### 1. **Prevents Account Proliferation**
- Users cannot create multiple accounts with the same credentials
- Reduces potential for abuse and confusion

### 2. **Data Integrity**
- Ensures unique user identification
- Prevents data fragmentation across multiple accounts

### 3. **User Experience**
- Helps users recover existing accounts
- Reduces frustration from forgotten credentials

## Error Handling

### Duplicate Detection Errors
```typescript
// Email already exists
"An account with this email already exists."

// Phone already exists  
"An account with this phone number already exists."

// Profile update conflicts
"This email is already associated with another account."
"This phone number is already associated with another account."
```

### Graceful Fallbacks
- Firebase auth users are properly cleaned up if duplicates are detected
- Users receive clear, actionable error messages
- System maintains data consistency

## Usage Examples

### Email Signup with Duplicate Check
```typescript
try {
  const userCredential = await AuthService.createUserWithEmail(
    email, 
    password,
    { firstName, lastName }
  );
  // Success - no duplicates found
} catch (error) {
  if (error.message.includes('already exists')) {
    // Show duplicate account handler
    setShowDuplicateHandler(true);
  }
}
```

### Phone Signup with Duplicate Check
```typescript
// Check before sending verification code
const duplicateCheck = await AuthService.checkDuplicateCredentials(
  undefined, 
  phone
);

if (duplicateCheck.hasDuplicates) {
  setShowDuplicateHandler(true);
  return;
}
```

### Profile Update with Duplicate Check
```typescript
try {
  await AuthService.updateUserProfile(uid, updatedProfile);
  // Success - no conflicts with other accounts
} catch (error) {
  // Handle duplicate credential errors
  setErrors({ email: error.message });
}
```

## Testing Scenarios

### 1. **New User Signup**
- ✅ Valid credentials → Account created
- ❌ Duplicate email → Signup blocked, handler shown
- ❌ Duplicate phone → Signup blocked, handler shown

### 2. **Profile Updates**
- ✅ New unique credentials → Update successful
- ❌ Credentials from other account → Update blocked
- ✅ Same credentials (no change) → Update successful

### 3. **Edge Cases**
- ✅ User updates own email to same value → Allowed
- ✅ User updates own phone to same value → Allowed
- ❌ User updates to another user's email → Blocked
- ❌ User updates to another user's phone → Blocked

## Future Enhancements

### 1. **Account Merging**
- Allow users to merge accounts with proper verification
- Transfer data between accounts before deletion

### 2. **Advanced Recovery**
- Email/phone verification for account recovery
- Admin tools for account consolidation

### 3. **Analytics**
- Track duplicate attempt patterns
- Identify potential security issues

## Conclusion

This duplicate account prevention system provides:
- **Robust security** against credential abuse
- **Excellent user experience** with helpful guidance
- **Data integrity** through unique user identification
- **Professional appearance** with consistent UI/UX

The system handles all edge cases gracefully while maintaining the security and integrity of the user database.
