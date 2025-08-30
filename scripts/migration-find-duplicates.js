const admin = require('firebase-admin');

// Initialize Firebase Admin SDK using default credentials
// This will use the Firebase CLI credentials
admin.initializeApp();

const db = admin.firestore();

/**
 * Migration script to find and consolidate existing duplicates
 * Run this script to identify users with duplicate email/phone credentials
 */
async function findDuplicates() {
  console.log('🔍 Starting duplicate detection migration...\n');

  try {
    // Get all users from Firestore
    const usersSnapshot = await db.collection('users').get();
    const users = [];
    
    usersSnapshot.forEach(doc => {
      users.push({
        uid: doc.id,
        ...doc.data()
      });
    });

    console.log(`📊 Found ${users.length} total users\n`);

    // Find duplicates by email
    const emailMap = new Map();
    const emailDuplicates = [];

    users.forEach(user => {
      if (user.email && user.email.trim()) {
        const email = user.email.toLowerCase().trim();
        if (emailMap.has(email)) {
          emailDuplicates.push({
            email,
            existing: emailMap.get(email),
            duplicate: user
          });
        } else {
          emailMap.set(email, user);
        }
      }
    });

    // Find duplicates by phone
    const phoneMap = new Map();
    const phoneDuplicates = [];

    users.forEach(user => {
      if (user.phone && user.phone.trim()) {
        const phone = user.phone.trim();
        if (phoneMap.has(phone)) {
          phoneDuplicates.push({
            phone,
            existing: phoneMap.get(phone),
            duplicate: user
          });
        } else {
          phoneMap.set(phone, user);
        }
      }
    });

    // Report findings
    console.log('📧 Email Duplicates:');
    if (emailDuplicates.length === 0) {
      console.log('  ✅ No email duplicates found');
    } else {
      emailDuplicates.forEach((dup, index) => {
        console.log(`  ${index + 1}. Email: ${dup.email}`);
        console.log(`     Existing: ${dup.existing.uid} (${dup.existing.firstName} ${dup.existing.lastName})`);
        console.log(`     Duplicate: ${dup.duplicate.uid} (${dup.duplicate.firstName} ${dup.duplicate.lastName})`);
        console.log(`     Created: ${dup.existing.createdAt.toDate()} vs ${dup.duplicate.createdAt.toDate()}`);
        console.log('');
      });
    }

    console.log('📱 Phone Duplicates:');
    if (phoneDuplicates.length === 0) {
      console.log('  ✅ No phone duplicates found');
    } else {
      phoneDuplicates.forEach((dup, index) => {
        console.log(`  ${index + 1}. Phone: ${dup.phone}`);
        console.log(`     Existing: ${dup.existing.uid} (${dup.existing.firstName} ${dup.existing.lastName})`);
        console.log(`     Duplicate: ${dup.duplicate.uid} (${dup.duplicate.firstName} ${dup.duplicate.lastName})`);
        console.log(`     Created: ${dup.existing.createdAt.toDate()} vs ${dup.duplicate.createdAt.toDate()}`);
        console.log('');
      });
    }

    // Summary
    console.log('📋 Summary:');
    console.log(`  Total Users: ${users.length}`);
    console.log(`  Email Duplicates: ${emailDuplicates.length}`);
    console.log(`  Phone Duplicates: ${phoneDuplicates.length}`);
    console.log(`  Total Duplicate Groups: ${emailDuplicates.length + phoneDuplicates.length}`);

    if (emailDuplicates.length > 0 || phoneDuplicates.length > 0) {
      console.log('\n⚠️  Action Required:');
      console.log('  - Review the duplicate accounts above');
      console.log('  - Use the AccountMerger component to consolidate accounts');
      console.log('  - Or manually delete duplicate accounts after data transfer');
      console.log('  - Consider implementing automatic account merging');
    } else {
      console.log('\n✅ No duplicates found! Your database is clean.');
    }

  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
}

/**
 * Optional: Consolidate duplicates automatically
 * WARNING: This will delete duplicate accounts - use with caution!
 */
async function consolidateDuplicates() {
  console.log('⚠️  WARNING: This will delete duplicate accounts!');
  console.log('⚠️  Make sure you have backups before running this!');
  console.log('⚠️  This function is disabled by default for safety.');
  console.log('⚠️  Uncomment the code below to enable automatic consolidation.');
  
  // Uncomment the code below to enable automatic consolidation
  /*
  try {
    // Implementation for automatic consolidation
    // This would:
    // 1. Transfer data from duplicate to primary account
    // 2. Delete duplicate account
    // 3. Update references in other collections
    
    console.log('🔄 Starting automatic consolidation...');
    // Add your consolidation logic here
    
  } catch (error) {
    console.error('❌ Error during consolidation:', error);
  }
  */
}

// Run the migration
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'consolidate') {
    consolidateDuplicates();
  } else {
    findDuplicates();
  }
}

module.exports = { findDuplicates, consolidateDuplicates };
