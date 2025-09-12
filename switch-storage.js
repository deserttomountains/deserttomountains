/**
 * Storage Strategy Switcher
 * Helps switch between different storage strategies
 */

const fs = require('fs');
const path = require('path');

const fileStoragePath = path.join(__dirname, 'src', 'lib', 'storage', 'file-storage.ts');

function switchStorage(strategy) {
  try {
    let content = fs.readFileSync(fileStoragePath, 'utf8');
    
    // Replace the export line
    const currentExport = content.match(/export const fileStorage = FileStorageService\.getInstance\('([^']+)'\);/);
    
    if (currentExport) {
      const newExport = `export const fileStorage = FileStorageService.getInstance('${strategy}');`;
      content = content.replace(currentExport[0], newExport);
      
      fs.writeFileSync(fileStoragePath, content);
      console.log(`✅ Switched storage strategy to: ${strategy}`);
      console.log(`📝 Previous strategy was: ${currentExport[1]}`);
    } else {
      console.log('❌ Could not find export line in file-storage.ts');
    }
  } catch (error) {
    console.error('❌ Error switching storage strategy:', error.message);
  }
}

// Get strategy from command line argument
const strategy = process.argv[2];

if (!strategy) {
  console.log('📋 Usage: node switch-storage.js <strategy>');
  console.log('📋 Available strategies:');
  console.log('   - local (base64 encoding, no external storage)');
  console.log('   - firebase (Firebase Storage, requires rules deployment)');
  console.log('   - cloudinary (not implemented yet)');
  console.log('   - aws-s3 (not implemented yet)');
  console.log('');
  console.log('📋 Examples:');
  console.log('   node switch-storage.js local');
  console.log('   node switch-storage.js firebase');
} else if (['local', 'firebase', 'cloudinary', 'aws-s3'].includes(strategy)) {
  switchStorage(strategy);
} else {
  console.log(`❌ Invalid strategy: ${strategy}`);
  console.log('📋 Available strategies: local, firebase, cloudinary, aws-s3');
}

