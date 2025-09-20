#!/usr/bin/env node

/**
 * Slow Contact Import Script
 * Processes contacts one by one with longer delays to avoid rate limiting
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const axios = require('axios');

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Import the contact processing functions from the main script
const { createContactData, checkDuplicateContact } = require('./bulk-import-contacts.js');

async function importContactsSlowly(filePath, options = {}) {
  const { dryRun = false, skipDuplicates = false } = options;
  
  return new Promise((resolve, reject) => {
    const contacts = [];
    const errors = [];
    const duplicates = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          const rowNumber = contacts.length + 1;
          const contactData = createContactData(row, rowNumber);
          contacts.push({ contactData, rowNumber });
        } catch (error) {
          errors.push({ row: contacts.length + 1, error: error.message, contact: null });
        }
      })
      .on('end', async () => {
        console.log(`\n📊 Import Summary:`);
        console.log(`Total rows processed: ${contacts.length}`);
        console.log(`Valid contacts: ${contacts.length - errors.length}`);
        console.log(`Errors: ${errors.length}`);

        if (dryRun) {
          console.log(`\n🔍 Dry run preview (first 5 contacts):`);
          contacts.slice(0, 5).forEach(({ contactData, rowNumber }) => {
            console.log(`  Row ${rowNumber}: ${contactData.name} - ${contactData.phone || 'No phone'} - ${contactData.email || 'No email'}`);
          });
          console.log(`\n💡 To actually import the contacts, run the script without --dry-run`);
          resolve({ contacts, errors, duplicates });
          return;
        }

        // Process contacts one by one with delays
        let successCount = 0;
        let duplicateCount = 0;
        
        for (let i = 0; i < contacts.length; i++) {
          const { contactData, rowNumber } = contacts[i];
          
          try {
            console.log(`\n📝 Processing contact ${i + 1}/${contacts.length}: ${contactData.name}`);
            
            // Check for duplicates if requested
            if (skipDuplicates) {
              const duplicateCheck = await checkDuplicateContact(contactData);
              if (duplicateCheck.isDuplicate) {
                duplicates.push({
                  row: rowNumber,
                  contact: contactData,
                  reason: duplicateCheck.reason,
                });
                console.log(`  ⚠️  Skipped duplicate (${duplicateCheck.reason})`);
                duplicateCount++;
                continue;
              }
            }

            // Add contact via API with retry logic
            let response;
            let retryCount = 0;
            const maxRetries = 3;
            
            while (retryCount <= maxRetries) {
              try {
                response = await axios.post(`${API_BASE_URL}/api/contacts`, contactData);
                break; // Success, exit retry loop
              } catch (error) {
                if (error.response?.status === 429 && retryCount < maxRetries) {
                  // Rate limited, wait and retry
                  const waitTime = Math.pow(2, retryCount) * 2000; // Longer exponential backoff
                  console.log(`  ⏳ Rate limited, waiting ${waitTime}ms before retry ${retryCount + 1}/${maxRetries}`);
                  await new Promise(resolve => setTimeout(resolve, waitTime));
                  retryCount++;
                } else {
                  throw error; // Re-throw if not rate limit or max retries reached
                }
              }
            }
            
            if (response.data.success) {
              successCount++;
              console.log(`  ✅ Created contact ${contactData.name} (ID: ${response.data.data.id})`);
            } else {
              throw new Error(response.data.error || 'API returned unsuccessful response');
            }
            
            // Wait 1 second between each contact to be very gentle with the API
            if (i < contacts.length - 1) {
              console.log(`  ⏳ Waiting 1 second before next contact...`);
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
          } catch (error) {
            errors.push({ row: rowNumber, error: error.message, contact: contactData });
            console.log(`  ❌ Failed to create contact - ${error.message}`);
            
            // Wait 2 seconds after an error before continuing
            if (i < contacts.length - 1) {
              console.log(`  ⏳ Waiting 2 seconds before next contact...`);
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
        }

        console.log(`\n🎉 Import completed!`);
        console.log(`✅ Successfully created: ${successCount} contacts`);
        console.log(`⚠️  Duplicates skipped: ${duplicateCount} contacts`);
        console.log(`❌ Errors: ${errors.length} contacts`);

        resolve({ contacts, errors, duplicates });
      })
      .on('error', (error) => {
        console.error('Error reading file:', error);
        reject(error);
      });
  });
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    console.log(`
📋 Contact Import Script (Slow Mode)

Usage: node scripts/import-contacts-slow.js <file_path> [options]

Arguments:
  file_path          Path to CSV or Excel file

Options:
  --dry-run          Preview contacts without importing
  --skip-duplicates  Skip contacts that already exist
  --help             Show this help message

Examples:
  node scripts/import-contacts-slow.js contacts.csv --dry-run
  node scripts/import-contacts-slow.js contacts.csv --skip-duplicates
`);
    return;
  }

  const filePath = args[0];
  const dryRun = args.includes('--dry-run');
  const skipDuplicates = args.includes('--skip-duplicates');

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return;
  }

  console.log('🚀 Starting slow contact import...');
  console.log(`📁 File: ${filePath}`);
  console.log(`🔍 Dry run: ${dryRun}`);
  console.log(`⚠️  Skip duplicates: ${skipDuplicates}`);

  try {
    await importContactsSlowly(filePath, { dryRun, skipDuplicates });
  } catch (error) {
    console.error('❌ Import failed:', error.message);
  }
}

if (require.main === module) {
  main();
}

module.exports = { importContactsSlowly };
