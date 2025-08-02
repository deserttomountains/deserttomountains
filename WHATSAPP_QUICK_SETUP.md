# 🚀 WhatsApp Business API Quick Setup Guide

## 📋 What You Need

1. **Meta Developer Account** (Free)
2. **Business Phone Number** (Can use your existing number)
3. **Domain/HTTPS** (For webhooks - can use ngrok for testing)

## ⚡ Quick Setup (5 Minutes)

### Step 1: Create Meta App
1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Click "Create App" → "Business" → "Next"
3. Fill in app details:
   - App Name: "Desert to Mountains CRM"
   - Contact Email: Your email
4. Click "Create App"

### Step 2: Add WhatsApp Business API
1. In your app dashboard, click "Add Product"
2. Find "WhatsApp" and click "Set Up"
3. Follow the setup wizard

### Step 3: Configure Phone Number
1. Go to WhatsApp → Getting Started
2. Click "Add phone number"
3. Enter your business phone number
4. Verify via SMS/call
5. **Copy the Phone Number ID** (you'll need this)

### Step 4: Generate Access Token
1. In WhatsApp → Getting Started
2. Click "Generate token"
3. **Copy the Access Token** (keep it secure!)
4. Set permissions:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`

### Step 5: Get Business Account ID
1. Go to WhatsApp → Configuration
2. Note your **Business Account ID**

### Step 6: Configure Environment Variables
1. Copy `env.template` to `.env.local`
2. Fill in your credentials:
```env
WHATSAPP_ACCESS_TOKEN=your_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token_here
WHATSAPP_API_VERSION=v18.0
```

### Step 7: Test Connection
1. Start your server: `npm run dev`
2. Go to `http://localhost:3000/admin`
3. Navigate to Messages section
4. Click "Configure WhatsApp"
5. Enter your credentials and test

## 🧪 Testing Your Setup

### Option 1: Use the Test Script
```bash
cd wallputty-site
node test-whatsapp.js
```

### Option 2: Test via Dashboard
1. Go to admin dashboard
2. Click "Configure WhatsApp"
3. Enter credentials
4. Click "Test Connection"

## 🔧 Troubleshooting

### Common Issues

#### "Invalid access token"
- ✅ Check your access token is correct
- ✅ Ensure token hasn't expired
- ✅ Verify proper permissions

#### "Phone number ID not found"
- ✅ Verify phone number ID is correct
- ✅ Check phone number is verified
- ✅ Ensure number is active

#### "Business account not found"
- ✅ Verify business account ID
- ✅ Check account is active
- ✅ Ensure proper permissions

### Getting Help

1. **Check Meta Developer Console** for error details
2. **Verify all credentials** are copied correctly
3. **Test with the provided script**
4. **Check the admin dashboard** for connection status

## 💰 Cost Information

### Free Tier
- ✅ 1,000 free messages/month
- ✅ Basic templates included
- ✅ Standard support

### Paid Tier (After Free)
- **$0.005 per message**
- **$0.01 per template message**
- **$0.02 per media message**

## 🎯 Next Steps

1. **Test basic messaging** from dashboard
2. **Set up webhooks** for real-time updates
3. **Create message templates** for common responses
4. **Configure business profile** with your info
5. **Monitor usage** and costs

## 📞 Support

- **Meta Developer Docs**: [developers.facebook.com/docs/whatsapp](https://developers.facebook.com/docs/whatsapp)
- **Business Support**: [business.facebook.com/support](https://business.facebook.com/support)
- **WhatsApp Business**: [business.whatsapp.com/support](https://business.whatsapp.com/support)

---

**Need immediate help?** Check the console for detailed error messages and refer to the troubleshooting section above. 