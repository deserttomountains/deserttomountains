#!/usr/bin/env node

/**
 * Bulk Contact Import Script
 * Imports contacts from CSV/Excel files into the database
 * 
 * Usage:
 * node scripts/bulk-import-contacts.js <file-path> [options]
 * 
 * Options:
 * --format csv|excel    File format (default: csv)
 * --batch-size <number> Batch size for processing (default: 10)
 * --dry-run            Preview what will be imported without saving
 * --skip-duplicates    Skip contacts that already exist
 * --help               Show this help message
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const axios = require('axios');

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Contact validation and processing functions
function validateEmail(email) {
  if (!email || email.trim() === '') return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim()) ? email.trim() : null;
}

function validatePhone(phone) {
  if (!phone || phone.trim() === '') return null;
  // Remove spaces and validate phone format
  const cleanPhone = phone.trim().replace(/\s/g, '');
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(cleanPhone) ? cleanPhone : null;
}

function parsePhoneNumbers(phoneString) {
  if (!phoneString || phoneString.trim() === '') {
    return { primary: null, alternate: null };
  }

  const phoneStr = phoneString.trim();
  
  // Check if phone numbers are separated by slash
  if (phoneStr.includes('/')) {
    const phones = phoneStr.split('/').map(p => p.trim()).filter(p => p);
    const primary = phones[0] ? validatePhone(phones[0]) : null;
    const alternate = phones[1] ? validatePhone(phones[1]) : null;
    return { primary, alternate };
  }
  
  // Single phone number
  const phone = validatePhone(phoneStr);
  return { primary: phone, alternate: null };
}

function createContactData(row, rowNumber) {
  const { Name, 'Phone Number': PhoneNumber, Email } = row;
  
  // Validate required fields
  if (!Name || Name.trim() === '') {
    throw new Error(`Row ${rowNumber}: Name is required`);
  }

  // Clean and validate name - remove extra spaces and ensure it's not empty
  const cleanName = Name.trim().replace(/\s+/g, ' '); // Replace multiple spaces with single space
  if (!cleanName) {
    throw new Error(`Row ${rowNumber}: Name cannot be empty after cleaning`);
  }

  // Parse phone numbers
  const { primary, alternate } = parsePhoneNumbers(PhoneNumber);
  
  // Validate email
  const email = validateEmail(Email);
  
  // Create channels object
  const channels = {};
  if (primary) channels.whatsapp = primary;
  if (email) channels.email = email;

  // At least one channel is required
  if (Object.keys(channels).length === 0) {
    throw new Error(`Row ${rowNumber}: At least one contact method (phone or email) is required`);
  }

  // Validate that all fields are Firebase-compatible
  const contactData = {
    name: cleanName,
    email: email,
    phone: primary,
    alternatePhone: alternate,
    channels: channels,
    tags: [],
    groups: [],
    status: 'active',
    source: 'import',
    metadata: {
      customFields: {},
      notes: `Contact saved by Initial Bulk Upload`
    }
  };

  // Additional validation for Firebase compatibility
  if (contactData.name && contactData.name.length > 1500) {
    throw new Error(`Row ${rowNumber}: Name is too long (max 1500 characters)`);
  }

  return contactData;
}

async function checkDuplicateContact(contactData) {
  try {
    // Check for duplicates using the API
    const searchParams = new URLSearchParams();
    if (contactData.phone) searchParams.append('search', contactData.phone);
    if (contactData.email) searchParams.append('search', contactData.email);
    
    const response = await axios.get(`${API_BASE_URL}/api/contacts?${searchParams.toString()}`);
    
    if (response.data.success && response.data.data.contacts.length > 0) {
      const existingContact = response.data.data.contacts[0];
      
      // Check for exact matches
      if (contactData.phone && existingContact.phone === contactData.phone) {
        return { isDuplicate: true, reason: 'phone number', existingId: existingContact.id };
      }
      if (contactData.email && existingContact.email === contactData.email) {
        return { isDuplicate: true, reason: 'email', existingId: existingContact.id };
      }
      if (contactData.channels.whatsapp && existingContact.channels?.whatsapp === contactData.channels.whatsapp) {
        return { isDuplicate: true, reason: 'WhatsApp number', existingId: existingContact.id };
      }
    }

    return { isDuplicate: false };
  } catch (error) {
    console.warn(`Warning: Could not check for duplicates: ${error.message}`);
    return { isDuplicate: false };
  }
}

async function importContactsFromCSV(filePath, options = {}) {
  const { batchSize = 10, dryRun = false, skipDuplicates = false } = options;
  
  return new Promise((resolve, reject) => {
    const contacts = [];
    const errors = [];
    const duplicates = [];
    let rowNumber = 0;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        rowNumber++;
        try {
          const contactData = createContactData(row, rowNumber);
          contacts.push({ contactData, rowNumber });
        } catch (error) {
          errors.push({ row: rowNumber, error: error.message, data: row });
        }
      })
      .on('end', async () => {
        console.log(`\n📊 Import Summary:`);
        console.log(`Total rows processed: ${rowNumber}`);
        console.log(`Valid contacts: ${contacts.length}`);
        console.log(`Errors: ${errors.length}`);
        
        if (errors.length > 0) {
          console.log(`\n❌ Errors found:`);
          errors.forEach(err => {
            console.log(`  Row ${err.row}: ${err.error}`);
          });
        }

        if (dryRun) {
          console.log(`\n🔍 Dry run preview (first 5 contacts):`);
          contacts.slice(0, 5).forEach(({ contactData, rowNumber }) => {
            console.log(`  Row ${rowNumber}: ${contactData.name} - ${contactData.phone || 'No phone'} - ${contactData.email || 'No email'}`);
          });
          resolve({ contacts, errors, duplicates: [] });
          return;
        }

        // Process contacts in batches
        let successCount = 0;
        let duplicateCount = 0;
        
        for (let i = 0; i < contacts.length; i += batchSize) {
          const batch = contacts.slice(i, i + batchSize);
          console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(contacts.length / batchSize)}`);
          
          for (const { contactData, rowNumber } of batch) {
            try {
              // Check for duplicates if requested
              if (skipDuplicates) {
                const duplicateCheck = await checkDuplicateContact(contactData);
                if (duplicateCheck.isDuplicate) {
                  duplicates.push({
                    row: rowNumber,
                    contact: contactData,
                    reason: duplicateCheck.reason,
                    existingId: duplicateCheck.existingId
                  });
                  duplicateCount++;
                  console.log(`  ⚠️  Row ${rowNumber}: Skipped duplicate (${duplicateCheck.reason})`);
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
                    const waitTime = Math.pow(2, retryCount) * 1000; // Exponential backoff
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
                console.log(`  ✅ Row ${rowNumber}: Created contact ${contactData.name} (ID: ${response.data.data.id})`);
                
                // Longer delay between requests to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 2500));
              } else {
                throw new Error(response.data.error || 'API returned unsuccessful response');
              }
              
            } catch (error) {
              errors.push({ row: rowNumber, error: error.message, contact: contactData });
              console.log(`  ❌ Row ${rowNumber}: Failed to create contact - ${error.message}`);
              console.log(`     Contact data: ${JSON.stringify(contactData, null, 2)}`);
              
              // Check for specific Firebase errors
              if (error.message.includes('INVALID_ARGUMENT')) {
                console.log(`     ⚠️  Firebase validation error - check field values`);
              }
            }
          }
          
          // Add delay between batches to avoid overwhelming the API
          if (i + batchSize < contacts.length) {
            console.log(`  ⏳ Waiting 2 seconds before next batch...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }

        console.log(`\n🎉 Import completed!`);
        console.log(`✅ Successfully created: ${successCount} contacts`);
        console.log(`⚠️  Duplicates skipped: ${duplicateCount} contacts`);
        console.log(`❌ Errors: ${errors.length} contacts`);

        resolve({ contacts, errors, duplicates });
      })
      .on('error', reject);
  });
}

async function importContactsFromExcel(filePath, options = {}) {
  const { batchSize = 10, dryRun = false, skipDuplicates = false } = options;
  
  try {
    // Read Excel file
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    console.log(`\n📊 Import Summary:`);
    console.log(`Total rows processed: ${data.length}`);

    const contacts = [];
    const errors = [];
    const duplicates = [];

    // Process each row
    data.forEach((row, index) => {
      const rowNumber = index + 1;
      try {
        const contactData = createContactData(row, rowNumber);
        contacts.push({ contactData, rowNumber });
      } catch (error) {
        errors.push({ row: rowNumber, error: error.message, data: row });
      }
    });

    console.log(`Valid contacts: ${contacts.length}`);
    console.log(`Errors: ${errors.length}`);

    if (errors.length > 0) {
      console.log(`\n❌ Errors found:`);
      errors.forEach(err => {
        console.log(`  Row ${err.row}: ${err.error}`);
      });
    }

    if (dryRun) {
      console.log(`\n🔍 Dry run preview (first 5 contacts):`);
      contacts.slice(0, 5).forEach(({ contactData, rowNumber }) => {
        console.log(`  Row ${rowNumber}: ${contactData.name} - ${contactData.phone || 'No phone'} - ${contactData.email || 'No email'}`);
      });
      return { contacts, errors, duplicates: [] };
    }

    // Process contacts in batches
    let successCount = 0;
    let duplicateCount = 0;
    
    for (let i = 0; i < contacts.length; i += batchSize) {
      const batch = contacts.slice(i, i + batchSize);
      console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(contacts.length / batchSize)}`);
      
      for (const { contactData, rowNumber } of batch) {
        try {
          // Check for duplicates if requested
          if (skipDuplicates) {
            const duplicateCheck = await checkDuplicateContact(contactData);
            if (duplicateCheck.isDuplicate) {
              duplicates.push({
                row: rowNumber,
                contact: contactData,
                reason: duplicateCheck.reason,
                existingId: duplicateCheck.existingId
              });
              duplicateCount++;
              console.log(`  ⚠️  Row ${rowNumber}: Skipped duplicate (${duplicateCheck.reason})`);
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
                 const waitTime = Math.pow(2, retryCount) * 1000; // Exponential backoff
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
             console.log(`  ✅ Row ${rowNumber}: Created contact ${contactData.name} (ID: ${response.data.data.id})`);
             
             // Longer delay between requests to avoid rate limiting
             await new Promise(resolve => setTimeout(resolve, 2500));
           } else {
             throw new Error(response.data.error || 'API returned unsuccessful response');
           }
           
         } catch (error) {
           errors.push({ row: rowNumber, error: error.message, contact: contactData });
           console.log(`  ❌ Row ${rowNumber}: Failed to create contact - ${error.message}`);
           console.log(`     Contact data: ${JSON.stringify(contactData, null, 2)}`);
           
           // Check for specific Firebase errors
           if (error.message.includes('INVALID_ARGUMENT')) {
             console.log(`     ⚠️  Firebase validation error - check field values`);
           }
         }
      }
      
      // Add delay between batches to avoid overwhelming the API
      if (i + batchSize < contacts.length) {
        console.log(`  ⏳ Waiting 2 seconds before next batch...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`\n🎉 Import completed!`);
    console.log(`✅ Successfully created: ${successCount} contacts`);
    console.log(`⚠️  Duplicates skipped: ${duplicateCount} contacts`);
    console.log(`❌ Errors: ${errors.length} contacts`);

    return { contacts, errors, duplicates };

  } catch (error) {
    throw new Error(`Failed to read Excel file: ${error.message}`);
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    console.log(`
📞 Bulk Contact Import Script

Usage:
  node scripts/bulk-import-contacts.js <file-path> [options]

Required:
  file-path           Path to CSV or Excel file

Options:
  --format csv|excel  File format (default: auto-detect)
  --batch-size <n>    Batch size for processing (default: 10)
  --dry-run           Preview what will be imported without saving
  --skip-duplicates   Skip contacts that already exist
  --help              Show this help message

File Format Requirements:
  CSV/Excel files must have these columns:
  - Name (required)
  - Phone Number (optional, can be "phone1/phone2" format)
  - Email (optional)

Examples:
  node scripts/bulk-import-contacts.js contacts.csv
  node scripts/bulk-import-contacts.js contacts.xlsx --format excel
  node scripts/bulk-import-contacts.js contacts.csv --dry-run
  node scripts/bulk-import-contacts.js contacts.csv --skip-duplicates --batch-size 5
    `);
    return;
  }

  const filePath = args[0];
  const format = args.includes('--format') ? args[args.indexOf('--format') + 1] : null;
  const batchSize = args.includes('--batch-size') ? parseInt(args[args.indexOf('--batch-size') + 1]) : 10;
  const dryRun = args.includes('--dry-run');
  const skipDuplicates = args.includes('--skip-duplicates');

  // Validate file exists
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Error: File not found: ${filePath}`);
    process.exit(1);
  }

  // Auto-detect format if not specified
  let detectedFormat = format;
  if (!detectedFormat) {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.csv') {
      detectedFormat = 'csv';
    } else if (ext === '.xlsx' || ext === '.xls') {
      detectedFormat = 'excel';
    } else {
      console.error(`❌ Error: Cannot determine file format. Please specify --format csv or --format excel`);
      process.exit(1);
    }
  }

  console.log(`🚀 Starting bulk contact import...`);
  console.log(`📁 File: ${filePath}`);
  console.log(`📋 Format: ${detectedFormat}`);
  console.log(`📦 Batch size: ${batchSize}`);
  console.log(`🔍 Dry run: ${dryRun}`);
  console.log(`⚠️  Skip duplicates: ${skipDuplicates}`);

  try {
    let result;
    if (detectedFormat === 'csv') {
      result = await importContactsFromCSV(filePath, { batchSize, dryRun, skipDuplicates });
    } else {
      result = await importContactsFromExcel(filePath, { batchSize, dryRun, skipDuplicates });
    }

    if (dryRun) {
      console.log(`\n💡 To actually import the contacts, run the script without --dry-run`);
    }

  } catch (error) {
    console.error(`❌ Import failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  importContactsFromCSV,
  importContactsFromExcel,
  validateEmail,
  validatePhone,
  parsePhoneNumbers,
  createContactData,
  checkDuplicateContact
};
