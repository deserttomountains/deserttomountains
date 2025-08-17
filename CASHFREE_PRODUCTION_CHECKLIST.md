# Cashfree Production Deployment Checklist

## ✅ Pre-Production Requirements

### 1. Environment Variables Setup
Make sure these are set in your production environment:

```env
# Production Cashfree Configuration
NEXT_PUBLIC_CASHFREE_CLIENT_ID=your_production_client_id
CASHFREE_CLIENT_SECRET=your_production_client_secret
NEXT_PUBLIC_CASHFREE_ENV=PROD
CASHFREE_WEBHOOK_SECRET=your_production_webhook_secret
```

### 2. Cashfree Dashboard Configuration
- [ ] **Account Verification**: Complete KYC and business verification in Cashfree dashboard
- [ ] **Production API Keys**: Generate and use production API keys (not test keys)
- [ ] **Webhook URL**: Set webhook URL to `https://yourdomain.com/api/payment/cashfree/webhook`
- [ ] **Webhook Secret**: Generate and configure webhook secret for signature verification
- [ ] **Payment Methods**: Enable required payment methods (UPI, Cards, Netbanking, etc.)

### 3. Domain & SSL Requirements
- [ ] **HTTPS**: Ensure your domain has valid SSL certificate
- [ ] **Domain Verification**: Verify your domain in Cashfree dashboard
- [ ] **Return URLs**: Configure allowed return URLs in Cashfree settings

### 4. Testing Requirements
- [ ] **Test Transactions**: Complete test transactions with small amounts
- [ ] **Webhook Testing**: Verify webhook notifications are working
- [ ] **Error Handling**: Test various failure scenarios
- [ ] **Mobile Testing**: Test on mobile devices and different browsers

## 🔧 Code Changes Made

### ✅ Fixed Issues:
1. **Dynamic Mode Selection**: Cashfree SDK now uses environment-based mode
2. **Signature Verification**: Implemented proper webhook signature verification
3. **Production Security**: Added signature validation for production environment

### 📍 Key Code Locations:
- **Payment Page**: `src/app/payment/page.tsx` (Line 251)
- **Cashfree Service**: `src/services/cashfreeService.ts`
- **Webhook Handler**: `src/app/api/payment/cashfree/webhook/route.ts`

## 🚀 Production Deployment Steps

### 1. Environment Setup
```bash
# Set production environment variables
NEXT_PUBLIC_CASHFREE_ENV=PROD
NEXT_PUBLIC_CASHFREE_CLIENT_ID=your_production_client_id
CASHFREE_CLIENT_SECRET=your_production_client_secret
CASHFREE_WEBHOOK_SECRET=your_production_webhook_secret
```

### 2. Cashfree Dashboard Actions
1. **Switch to Production Mode** in Cashfree dashboard
2. **Update Webhook URL** to your production domain
3. **Configure Webhook Secret** for signature verification
4. **Enable Payment Methods** you want to accept

### 3. Testing Checklist
- [ ] Test with ₹1 transaction first
- [ ] Verify webhook notifications
- [ ] Test payment failures and cancellations
- [ ] Verify order status updates in your database
- [ ] Test on different devices and browsers

### 4. Monitoring Setup
- [ ] Set up logging for payment events
- [ ] Monitor webhook delivery status
- [ ] Set up alerts for failed payments
- [ ] Monitor transaction success rates

## ⚠️ Important Notes

### Security Considerations:
- **Never expose** `CASHFREE_CLIENT_SECRET` in client-side code
- **Always verify** webhook signatures in production
- **Use HTTPS** for all payment-related communications
- **Monitor** for suspicious activities

### Compliance Requirements:
- **PCI DSS**: Ensure compliance if storing card data
- **GST**: Verify GST calculation and reporting
- **Data Protection**: Follow data protection regulations

### Support & Documentation:
- **Cashfree Support**: Available through merchant dashboard
- **Documentation**: [https://docs.cashfree.com/](https://docs.cashfree.com/)
- **API Reference**: [https://docs.cashfree.com/reference](https://docs.cashfree.com/reference)

## 🔍 Post-Deployment Verification

### 1. Transaction Flow Test
1. Create test order
2. Complete payment with test amount
3. Verify webhook received
4. Check order status updated
5. Verify customer notification

### 2. Error Scenarios Test
1. Payment cancellation
2. Payment failure
3. Network timeout
4. Invalid payment data

### 3. Monitoring Verification
1. Check logs for payment events
2. Verify webhook delivery
3. Monitor transaction success rates
4. Check for any error patterns

## 📞 Emergency Contacts

- **Cashfree Support**: Available through merchant dashboard
- **Technical Issues**: Check Cashfree documentation first
- **Business Issues**: Contact Cashfree business support

---

**⚠️ IMPORTANT**: Always test with small amounts before processing real transactions!

