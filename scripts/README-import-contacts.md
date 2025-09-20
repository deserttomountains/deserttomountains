# 📞 Bulk Contact Import Script

This script allows you to bulk import contacts from CSV or Excel files into your database.

## 📋 File Format Requirements

Your CSV or Excel file must have these columns:

| Column Name | Required | Description | Example |
|-------------|----------|-------------|---------|
| **Name** | ✅ Yes | Full name of the contact | `John Doe` |
| **Phone Number** | ❌ No | Phone number(s) - can be single or dual format | `1234567890` or `1234567890/9876543210` |
| **Email** | ❌ No | Email address | `john@example.com` |

### 📱 Phone Number Format

The script handles two phone number formats:

1. **Single Phone Number**: `1234567890`
   - Will be stored as the primary phone number
   - Will be used for WhatsApp channel if valid

2. **Dual Phone Numbers**: `1234567890/9876543210`
   - First number (before `/`) → Primary phone number
   - Second number (after `/`) → Alternate phone number
   - Both will be used for WhatsApp channels if valid

### 📧 Email Format

- Must be a valid email format
- Will be stored in the email channel
- Optional field

## 🚀 Usage

### Basic Usage

```bash
# Import from CSV file
npm run import-contacts contacts.csv

# Import from Excel file
npm run import-contacts contacts.xlsx --format excel
```

### Advanced Options

```bash
# Preview what will be imported (dry run)
npm run import-contacts contacts.csv --dry-run

# Skip duplicate contacts
npm run import-contacts contacts.csv --skip-duplicates

# Process in smaller batches
npm run import-contacts contacts.csv --batch-size 5

# Combine options
npm run import-contacts contacts.csv --dry-run --skip-duplicates --batch-size 3
```

## 📊 Options

| Option | Description | Default |
|--------|-------------|---------|
| `--format csv\|excel` | File format (auto-detected if not specified) | Auto-detect |
| `--batch-size <number>` | Number of contacts to process at once | `10` |
| `--dry-run` | Preview import without saving to database | `false` |
| `--skip-duplicates` | Skip contacts that already exist | `false` |
| `--help` | Show help message | - |

## 🔍 Duplicate Detection

When using `--skip-duplicates`, the script checks for duplicates based on:

1. **Phone Number** - Exact match with existing contacts
2. **Email Address** - Exact match with existing contacts  
3. **WhatsApp Number** - Exact match with existing WhatsApp channels

## 📝 Example Files

### Sample CSV File
```csv
Name,Phone Number,Email
John Doe,1234567890,john.doe@example.com
Jane Smith,9876543210/1122334455,jane.smith@example.com
Bob Johnson,,bob.johnson@example.com
Alice Brown,5555555555,
Charlie Wilson,9999999999/8888888888,charlie@example.com
```

### Sample Excel File
Create an Excel file with the same column structure:
- Column A: Name
- Column B: Phone Number  
- Column C: Email

## 🛠️ Setup Requirements

1. **Environment Variables**: Ensure your `.env.local` file contains Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

2. **Dependencies**: The required packages are automatically installed:
   - `csv-parser` - For CSV file processing
   - `xlsx` - For Excel file processing

## 📈 Import Process

1. **Validation**: Each row is validated for required fields and format
2. **Duplicate Check**: If `--skip-duplicates` is used, checks for existing contacts
3. **Batch Processing**: Contacts are processed in batches to avoid overwhelming the database
4. **Error Handling**: Invalid rows are logged but don't stop the import process
5. **Progress Reporting**: Real-time feedback on import progress

## 📊 Output Example

```
🚀 Starting bulk contact import...
📁 File: contacts.csv
📋 Format: csv
📦 Batch size: 10
🔍 Dry run: false
⚠️  Skip duplicates: true

📊 Import Summary:
Total rows processed: 10
Valid contacts: 9
Errors: 1

❌ Errors found:
  Row 5: Invalid email format

📦 Processing batch 1/1
  ✅ Row 1: Created contact John Doe (ID: abc123)
  ✅ Row 2: Created contact Jane Smith (ID: def456)
  ⚠️  Row 3: Skipped duplicate (phone number)
  ✅ Row 4: Created contact Bob Johnson (ID: ghi789)

🎉 Import completed!
✅ Successfully created: 7 contacts
⚠️  Duplicates skipped: 2 contacts
❌ Errors: 1 contacts
```

## 🚨 Troubleshooting

### Common Issues

1. **File not found**: Ensure the file path is correct
2. **Invalid format**: Use `--format` to specify csv or excel
3. **Firebase errors**: Check your environment variables
4. **Permission errors**: Ensure the script has write access to the database

### Error Messages

- `Name is required` - Contact name cannot be empty
- `At least one contact method is required` - Must have phone or email
- `Invalid email format` - Email doesn't match standard format
- `Invalid phone format` - Phone number doesn't match expected format

## 🔒 Security Notes

- The script uses your existing Firebase configuration
- No sensitive data is logged to console
- Duplicate checking respects existing data privacy
- Batch processing prevents database overload

## 📞 Support

If you encounter issues:

1. Check the error messages in the console output
2. Verify your file format matches the requirements
3. Ensure Firebase configuration is correct
4. Try with `--dry-run` first to preview the import
