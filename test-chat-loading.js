// Test script for WhatsApp chat loading functionality
// Run with: node test-chat-loading.js

const axios = require('axios');

// Configuration - Update these with your actual values
const config = {
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || 'your_access_token_here',
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || 'your_phone_number_id_here',
  apiVersion: process.env.WHATSAPP_API_VERSION || 'v18.0'
};

const baseUrl = `https://graph.facebook.com/${config.apiVersion}`;

async function testChatLoading() {
  console.log('🔍 Testing WhatsApp Chat Loading...\n');

  try {
    // Test 1: Check if we can access conversations
    console.log('📞 Testing Conversations Access...');
    const conversationsResponse = await axios.get(`${baseUrl}/${config.phoneNumberId}/conversations`, {
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Conversations Response:', conversationsResponse.data);
    console.log('');

    // Test 2: Check if we can get messages for a conversation
    if (conversationsResponse.data.data && conversationsResponse.data.data.length > 0) {
      const firstConversation = conversationsResponse.data.data[0];
      const phoneNumber = firstConversation.phone_number;
      
      console.log(`📱 Testing Message History for ${phoneNumber}...`);
      const messagesResponse = await axios.get(`${baseUrl}/${config.phoneNumberId}/messages?to=${phoneNumber}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Messages Response:', messagesResponse.data);
      console.log('');
    }

    // Test 3: Test contact info retrieval
    if (conversationsResponse.data.data && conversationsResponse.data.data.length > 0) {
      const firstConversation = conversationsResponse.data.data[0];
      const phoneNumber = firstConversation.phone_number;
      
      console.log(`👤 Testing Contact Info for ${phoneNumber}...`);
      try {
        const contactResponse = await axios.get(`${baseUrl}/${phoneNumber}`, {
          headers: {
            'Authorization': `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('✅ Contact Info Response:', contactResponse.data);
      } catch (error) {
        console.log('⚠️ Contact info not available (this is normal for some numbers)');
      }
      console.log('');
    }

    console.log('🎉 Chat loading tests completed!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Go to http://localhost:3000/admin');
    console.log('3. Navigate to Messages section');
    console.log('4. Configure WhatsApp and test chat loading');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.log('');
    console.log('Troubleshooting:');
    console.log('1. Check your access token is correct');
    console.log('2. Verify your phone number ID');
    console.log('3. Ensure your app has proper permissions');
    console.log('4. Check that you have existing conversations');
  }
}

// Run the test
testChatLoading(); 