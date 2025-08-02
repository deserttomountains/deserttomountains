// WhatsApp Business API Test Script
// Run this with: node test-whatsapp.js

const axios = require('axios');

// Configuration - Update these with your actual values
const config = {
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || 'your_access_token_here',
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || 'your_phone_number_id_here',
  businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || 'your_business_account_id_here',
  apiVersion: process.env.WHATSAPP_API_VERSION || 'v18.0'
};

const baseUrl = `https://graph.facebook.com/${config.apiVersion}`;

async function testWhatsAppConnection() {
  console.log('🔍 Testing WhatsApp Business API Connection...\n');

  try {
    // Test 1: Check phone number info
    console.log('📞 Testing Phone Number Info...');
    const phoneResponse = await axios.get(`${baseUrl}/${config.phoneNumberId}`, {
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Phone Number Info:', phoneResponse.data);
    console.log('');

    // Test 2: Check business profile
    console.log('🏢 Testing Business Profile...');
    const businessResponse = await axios.get(`${baseUrl}/${config.businessAccountId}`, {
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Business Profile:', businessResponse.data);
    console.log('');

    // Test 3: Send a test message (commented out for safety)
    console.log('📤 Test Message Sending (commented out for safety)');
    console.log('To test message sending, uncomment the code below and add a test phone number');
    /*
    const testPhoneNumber = '1234567890'; // Add your test phone number here
    const messageResponse = await axios.post(`${baseUrl}/${config.phoneNumberId}/messages`, {
      messaging_product: 'whatsapp',
      to: testPhoneNumber,
      type: 'text',
      text: {
        body: 'Hello from Desert to Mountains! This is a test message.'
      }
    }, {
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Message Sent:', messageResponse.data);
    */

    console.log('🎉 All tests passed! Your WhatsApp Business API is configured correctly.');
    console.log('');
    console.log('Next steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Go to http://localhost:3000/admin');
    console.log('3. Navigate to Messages section');
    console.log('4. Click "Configure WhatsApp" to set up credentials');
    console.log('5. Test sending messages from the dashboard');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.log('');
    console.log('Troubleshooting:');
    console.log('1. Check your access token is correct');
    console.log('2. Verify your phone number ID');
    console.log('3. Ensure your business account ID is valid');
    console.log('4. Make sure your app has WhatsApp Business API enabled');
    console.log('5. Check that your phone number is verified');
  }
}

// Run the test
testWhatsAppConnection(); 