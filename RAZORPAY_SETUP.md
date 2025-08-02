# Razorpay Integration Setup Guide

## Overview
This guide covers the complete setup and configuration of Razorpay payment gateway integration for the Desert to Mountains website.

## Prerequisites
- Razorpay account (test/live)
- Next.js project with Firebase integration
- Environment variables configured

## 1. Environment Variables Setup

Create or update your `.env.local` file in the project root:

```bash
# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=test_secret_xxxxxxxxxxxxx

# For Production (replace with live keys)
# NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
# RAZORPAY_KEY_SECRET=live_secret_xxxxxxxxxxxxx
```

### Security Notes:
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` is exposed to the frontend (this is safe for Razorpay)
- `RAZORPAY_KEY_SECRET` must NEVER be exposed to the frontend
- Use test keys for development, live keys for production
- Never commit `.env.local` to version control

## 2. Razorpay Dashboard Configuration

### 2.1 API Keys
1. Log in to your Razorpay Dashboard
2. Go to Settings → API Keys
3. Generate new API keys or use existing ones
4. Copy the Key ID and Key Secret to your `.env.local`

### 2.2 Webhook Configuration
1. Go to Settings → Webhooks
2. Add a new webhook with the following URL:
   ```
   https://yourdomain.com/api/payment/razorpay/webhook
   ```
3. Select the following events:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
4. Save the webhook configuration

### 2.3 Webhook Security
- Razorpay will send a signature in the `x-razorpay-signature` header
- The webhook endpoint automatically verifies this signature
- Only process webhooks with valid signatures

## 3. Integration Features

### 3.1 Payment Flow
1. **Order Creation**: Customer creates order in your system
2. **Razorpay Order**: Backend creates Razorpay order via API
3. **Payment Gateway**: Customer completes payment on Razorpay
4. **Webhook Processing**: Razorpay sends webhook with payment status
5. **Order Update**: Backend updates order status in Firebase

### 3.2 Supported Payment Methods
- UPI (Unified Payments Interface)
- Credit/Debit Cards
- Net Banking
- Digital Wallets
- EMI (Equated Monthly Installments)

### 3.3 Amount Limits
- **Minimum**: ₹1 (100 paise)
- **Maximum**: ₹10,00,000 (10 Lakh INR)
- **Currency**: INR only

## 4. Security Features

### 4.1 Signature Verification
- All payments are verified using HMAC SHA256 signatures
- Webhook signatures are verified to prevent tampering
- Payment signatures are verified before processing

### 4.2 Input Validation
- Amount validation (min/max limits)
- Currency validation (INR only)
- Receipt validation (required, non-empty)
- Order ID format validation

### 4.3 Error Handling
- Comprehensive error messages
- Network error handling
- API error handling
- Validation error handling

## 5. Testing

### 5.1 Test Cards
Use these test cards for testing:

**Successful Payment:**
- Card Number: 4111 1111 1111 1111
- Expiry: Any future date
- CVV: Any 3 digits
- Name: Any name

**Failed Payment:**
- Card Number: 4000 0000 0000 0002
- Expiry: Any future date
- CVV: Any 3 digits
- Name: Any name

### 5.2 Test UPI
- UPI ID: success@razorpay (successful payment)
- UPI ID: failure@razorpay (failed payment)

### 5.3 Test Net Banking
- Bank: HDFC Bank
- Username: razorpay
- Password: razorpay

## 6. Troubleshooting

### 6.1 Common Issues

**"Invalid signature" error:**
- Check if `RAZORPAY_KEY_SECRET` is correct
- Ensure webhook URL is accessible
- Verify webhook signature verification

**"Amount validation failed":**
- Ensure amount is in paise (multiply by 100)
- Check minimum/maximum amount limits
- Verify currency is 'INR'

**"Order creation failed":**
- Check API keys are correct
- Verify network connectivity
- Check Razorpay account status

**Webhook not received:**
- Verify webhook URL is accessible
- Check webhook configuration in Razorpay dashboard
- Ensure webhook events are selected

### 6.2 Debug Mode
Enable debug logging by adding to your `.env.local`:
```bash
DEBUG=razorpay:*
```

### 6.3 Logs
Check these locations for logs:
- Browser console (frontend errors)
- Server logs (backend errors)
- Razorpay dashboard (webhook delivery)

## 7. Production Checklist

Before going live:

- [ ] Replace test keys with live keys
- [ ] Update webhook URL to production domain
- [ ] Test with real payment methods
- [ ] Verify webhook signature verification
- [ ] Test error scenarios
- [ ] Monitor webhook delivery
- [ ] Set up logging and monitoring
- [ ] Configure backup webhook URLs
- [ ] Test refund functionality
- [ ] Verify order status updates

## 8. Monitoring

### 8.1 Key Metrics to Monitor
- Payment success rate
- Webhook delivery success rate
- Average payment processing time
- Failed payment reasons
- Order status update success rate

### 8.2 Alerts to Set Up
- Webhook delivery failures
- High payment failure rate
- Order status update failures
- API error rate spikes

## 9. Best Practices

### 9.1 Security
- Always verify webhook signatures
- Never expose secret keys to frontend
- Use HTTPS for all webhook URLs
- Implement rate limiting
- Log security events

### 9.2 Reliability
- Implement webhook retry logic
- Use idempotent operations
- Handle duplicate webhooks
- Implement fallback mechanisms
- Monitor webhook delivery

### 9.3 User Experience
- Show clear payment status
- Provide helpful error messages
- Implement payment retry options
- Send confirmation emails
- Update order status promptly

## 10. Support

For issues with:
- **Razorpay Integration**: Check this guide and logs
- **Razorpay API**: Contact Razorpay support
- **Firebase Integration**: Check Firebase documentation
- **Next.js Issues**: Check Next.js documentation

## 11. API Reference

### Create Order
```typescript
POST /api/payment/razorpay/create-order
{
  "amount": 10000, // in paise (₹100)
  "currency": "INR",
  "receipt": "order_123",
  "notes": {
    "customerName": "John Doe",
    "customerEmail": "john@example.com"
  }
}
```

### Webhook Endpoint
```typescript
POST /api/payment/razorpay/webhook
// Headers: x-razorpay-signature
// Body: Razorpay webhook payload
```

### Payment Verification
```typescript
// Frontend payment verification
const isValid = razorpayService.verifyPaymentSignature(
  orderId,
  paymentId,
  signature
);
```

## 12. Changelog

### v1.0.0 (Current)
- Initial Razorpay integration
- Webhook signature verification
- Comprehensive error handling
- Input validation
- Security improvements
- Production-ready implementation 