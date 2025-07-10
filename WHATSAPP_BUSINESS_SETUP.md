# WhatsApp Business API Setup Guide

## 🏢 **WhatsApp Business API vs WhatsApp Web**

| Feature | WhatsApp Web (Previous) | WhatsApp Business API |
|---------|------------------------|----------------------|
| **Official Support** | ❌ Unofficial | ✅ Official Meta/Facebook |
| **Reliability** | ⚠️ Can break anytime | ✅ Stable & supported |
| **Business Features** | ❌ Limited | ✅ Full business features |
| **Scalability** | ❌ Single device | ✅ Multi-device, cloud-based |
| **Security** | ⚠️ Unofficial | ✅ Enterprise-grade |
| **Cost** | ✅ Free | 💰 Pay-per-message |
| **24/7 Support** | ❌ No support | ✅ Official support |

## 📋 **Prerequisites**

1. **Meta Developer Account**
   - Go to [developers.facebook.com](https://developers.facebook.com)
   - Create a new app or use existing one
   - Add WhatsApp Business API product

2. **Business Verification**
   - Verify your business with Meta
   - Complete business profile setup

3. **Phone Number**
   - Get a dedicated business phone number
   - Verify ownership with Meta

## 🚀 **Step-by-Step Setup**

### 1. **Create Meta App**

1. Visit [developers.facebook.com](https://developers.facebook.com)
2. Click "Create App"
3. Select "Business" as app type
4. Fill in app details:
   - App Name: "Desert to Mountains CRM"
   - App Contact Email: Your business email
   - Business Account: Select your business

### 2. **Add WhatsApp Business API**

1. In your app dashboard, click "Add Product"
2. Find "WhatsApp" and click "Set Up"
3. Follow the setup wizard

### 3. **Configure Phone Number**

1. Go to WhatsApp > Getting Started
2. Click "Add phone number"
3. Enter your business phone number
4. Verify via SMS/call
5. Note down the **Phone Number ID** (you'll need this)

### 4. **Generate Access Token**

1. Go to WhatsApp > Getting Started
2. Click "Generate token"
3. Copy the **Access Token** (keep it secure!)
4. Set token permissions:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`

### 5. **Set Up Webhook**

1. Go to WhatsApp > Configuration
2. Click "Configure webhook"
3. Set webhook URL: `https://yourdomain.com/api/whatsapp-business`
4. Set verify token: Create a secure random string
5. Subscribe to events:
   - `messages`
   - `message_status`
   - `message_template_status`

### 6. **Environment Variables**

Add these to your `.env.local` file:

```env
# WhatsApp Business API Configuration
WHATSAPP_ACCESS_TOKEN=your_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token_here
WHATSAPP_API_VERSION=v18.0
```

### 7. **Test Connection**

1. Start your development server: `npm run dev`
2. Go to admin dashboard > Messages
3. Click "Configure" button
4. Enter your API credentials
5. Click "Connect" to test

## 💰 **Pricing & Costs**

### **Free Tier (First 1,000 messages/month)**
- ✅ 1,000 free messages per month
- ✅ Basic templates included
- ✅ Standard support

### **Paid Tier**
- **$0.005 per message** (after free tier)
- **$0.01 per template message** (first 1,000 free)
- **$0.02 per media message**

### **Example Costs**
- 5,000 messages/month = $20
- 10,000 messages/month = $45
- 50,000 messages/month = $245

## 🔧 **Features Available**

### **Message Types**
- ✅ Text messages
- ✅ Media messages (images, videos, documents)
- ✅ Template messages
- ✅ Interactive messages
- ✅ Location sharing

### **Business Features**
- ✅ Message templates (pre-approved)
- ✅ Business profile management
- ✅ Message status tracking
- ✅ Webhook notifications
- ✅ Multi-device support
- ✅ Analytics & insights

### **Template Messages**
```javascript
// Example template message
await whatsappBusinessService.sendTemplateMessage(
  '1234567890',
  'hello_world',
  'en_US',
  [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: 'John' }
      ]
    }
  ]
);
```

## 🛡️ **Security Best Practices**

### **1. Token Security**
- ✅ Store tokens in environment variables
- ✅ Never commit tokens to version control
- ✅ Rotate tokens regularly
- ✅ Use least privilege principle

### **2. Webhook Security**
- ✅ Use HTTPS only
- ✅ Verify webhook signatures
- ✅ Implement rate limiting
- ✅ Validate all incoming data

### **3. Data Protection**
- ✅ Encrypt sensitive data
- ✅ Implement proper logging
- ✅ Follow GDPR compliance
- ✅ Regular security audits

## 📱 **Testing Your Integration**

### **1. Sandbox Testing**
```javascript
// Test with sandbox number
const testNumber = '1234567890'; // Your sandbox number
await whatsappBusinessService.sendMessage(testNumber, 'Hello from CRM!');
```

### **2. Template Testing**
```javascript
// Test template message
await whatsappBusinessService.sendTemplateMessage(
  testNumber,
  'hello_world',
  'en_US'
);
```

### **3. Webhook Testing**
- Use tools like ngrok for local testing
- Test webhook verification
- Verify message delivery

## 🔍 **Troubleshooting**

### **Common Issues**

#### **1. Authentication Error**
```
Error: WhatsApp API Error: Invalid access token
```
**Solution:**
- Verify access token is correct
- Check token hasn't expired
- Ensure proper permissions

#### **2. Phone Number Error**
```
Error: Phone number ID not configured
```
**Solution:**
- Verify phone number ID in environment
- Check phone number is verified
- Ensure number is active

#### **3. Webhook Error**
```
Error: Webhook verification failed
```
**Solution:**
- Check webhook URL is accessible
- Verify webhook token matches
- Ensure HTTPS is used

#### **4. Rate Limiting**
```
Error: Rate limit exceeded
```
**Solution:**
- Implement exponential backoff
- Check message limits
- Monitor usage metrics

## 📊 **Monitoring & Analytics**

### **Key Metrics to Track**
- Message delivery rates
- Response times
- Error rates
- Cost per message
- User engagement

### **Logging Example**
```javascript
// Add logging to your service
console.log('WhatsApp Business API:', {
  action: 'send_message',
  phoneNumber: maskedNumber,
  timestamp: new Date(),
  status: 'success'
});
```

## 🚀 **Production Deployment**

### **1. Environment Setup**
```bash
# Production environment variables
WHATSAPP_ACCESS_TOKEN=prod_token_here
WHATSAPP_PHONE_NUMBER_ID=prod_phone_id_here
WHATSAPP_BUSINESS_ACCOUNT_ID=prod_business_id_here
WHATSAPP_WEBHOOK_VERIFY_TOKEN=prod_webhook_token_here
WHATSAPP_API_VERSION=v18.0
```

### **2. SSL Certificate**
- Ensure HTTPS is enabled
- Use valid SSL certificate
- Configure proper redirects

### **3. Monitoring**
- Set up error tracking (Sentry)
- Configure uptime monitoring
- Implement health checks

### **4. Backup & Recovery**
- Regular data backups
- Disaster recovery plan
- Test recovery procedures

## 📞 **Support Resources**

### **Official Documentation**
- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp)
- [Meta for Developers](https://developers.facebook.com)
- [API Reference](https://developers.facebook.com/docs/whatsapp/api/reference)

### **Community Support**
- [Meta Developer Community](https://developers.facebook.com/community/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/whatsapp-business-api)
- [GitHub Issues](https://github.com/facebook/WhatsApp-Business-API/issues)

### **Contact Support**
- **Business Support**: [business.facebook.com/support](https://business.facebook.com/support)
- **Developer Support**: [developers.facebook.com/support](https://developers.facebook.com/support)
- **WhatsApp Business Support**: [business.whatsapp.com/support](https://business.whatsapp.com/support)

## 🎯 **Next Steps**

1. **Complete Setup**: Follow all steps above
2. **Test Integration**: Use sandbox environment
3. **Go Live**: Submit for production approval
4. **Monitor**: Track performance and costs
5. **Optimize**: Improve based on usage data

## 💡 **Pro Tips**

- **Start Small**: Begin with basic messaging
- **Use Templates**: Pre-approved templates are faster
- **Monitor Costs**: Keep track of message usage
- **Test Thoroughly**: Test all scenarios before going live
- **Document Everything**: Keep detailed setup notes
- **Plan for Scale**: Design for future growth

---

**Need Help?** Contact our support team or refer to the official Meta documentation for the most up-to-date information. 