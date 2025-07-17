# Cashfree Payment Gateway Setup

This guide will help you set up Cashfree Payments integration for the Desert to Mountains website.

## 1. Cashfree Account Setup

1. **Create Cashfree Account**
   - Visit [Cashfree Merchant Dashboard](https://merchant.cashfree.com/merchant/sign-up)
   - Sign up for a merchant account
   - Complete KYC verification

2. **Get API Credentials**
   - Log in to your Cashfree merchant dashboard
   - Navigate to Settings > API Keys
   - Copy your Client ID and Client Secret
   - Note: You'll have separate credentials for Test and Production environments

## 2. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Cashfree Configuration
NEXT_PUBLIC_CASHFREE_CLIENT_ID=your_client_id_here
CASHFREE_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_CASHFREE_ENV=TEST  # Change to PROD for production

# Optional: Webhook Secret (for signature verification)
CASHFREE_WEBHOOK_SECRET=your_webhook_secret_here
```

### Environment Variables Explained:

- `NEXT_PUBLIC_CASHFREE_CLIENT_ID`: Your Cashfree Client ID (public)
- `CASHFREE_CLIENT_SECRET`: Your Cashfree Client Secret (private, server-side only)
- `NEXT_PUBLIC_CASHFREE_ENV`: Environment setting (TEST/PROD)
- `CASHFREE_WEBHOOK_SECRET`: Secret for webhook signature verification

## 3. Webhook Configuration

1. **Set up Webhook URL**
   - In your Cashfree dashboard, go to Settings > Webhooks
   - Add webhook URL: `https://yourdomain.com/api/payment/cashfree/webhook`
   - Select events: `order.payment_success`, `order.payment_failed`

2. **Webhook Events**
   - `order.payment_success`: Triggered when payment is successful
   - `order.payment_failed`: Triggered when payment fails
   - `order.payment_pending`: Triggered when payment is pending

## 4. Payment Flow

### Current Implementation:

1. **Order Creation**: User selects payment method and clicks "Proceed to Payment"
2. **Cashfree Order**: System creates order in Cashfree with order details
3. **Payment Gateway**: User is redirected to Cashfree's payment gateway
4. **Payment Processing**: User completes payment on Cashfree's secure platform
5. **Webhook Notification**: Cashfree sends payment status to webhook
6. **Order Update**: System updates order status based on payment result
7. **Return URL**: User is redirected back to order confirmation page

### Payment Methods Supported:

- **UPI**: Google Pay, PhonePe, Paytm, BHIM, etc.
- **Cards**: Credit/Debit cards (Visa, MasterCard, RuPay)
- **Net Banking**: All major Indian banks
- **Pay Later**: Buy now, pay later options
- **EMI**: Easy monthly installments

## 5. Testing

### Test Mode:
- Use test credentials from Cashfree dashboard
- Test with Cashfree's test payment methods
- No real money is charged

### Test Payment Details:
- **UPI**: Use any test UPI ID (e.g., `test@upi`)
- **Cards**: Use Cashfree's test card numbers
- **Net Banking**: Use test bank credentials

## 6. Production Deployment

1. **Update Environment Variables**
   - Change `NEXT_PUBLIC_CASHFREE_ENV` to `PROD`
   - Use production Client ID and Secret
   - Update webhook URL to production domain

2. **SSL Certificate**
   - Ensure your domain has valid SSL certificate
   - Required for secure payment processing

3. **Webhook Security**
   - Implement proper signature verification
   - Use webhook secret for additional security

## 7. Security Best Practices

1. **Environment Variables**
   - Never commit `.env.local` to version control
   - Use different credentials for test and production
   - Rotate secrets regularly

2. **Webhook Verification**
   - Always verify webhook signatures
   - Implement idempotency to prevent duplicate processing
   - Log all webhook events for debugging

3. **Error Handling**
   - Implement proper error handling for failed payments
   - Provide clear error messages to users
   - Monitor payment success/failure rates

## 8. Monitoring and Analytics

### Key Metrics to Monitor:
- Payment success rate
- Payment method preferences
- Failed payment reasons
- Average transaction value
- Payment processing time

### Cashfree Dashboard Features:
- Real-time transaction monitoring
- Payment analytics and reports
- Settlement reports
- Refund management

## 9. Support and Documentation

- **Cashfree Documentation**: [https://docs.cashfree.com/](https://docs.cashfree.com/)
- **API Reference**: [https://docs.cashfree.com/reference](https://docs.cashfree.com/reference)
- **Support**: Contact Cashfree support through merchant dashboard

## 10. Troubleshooting

### Common Issues:

1. **Payment Failed**
   - Check if test credentials are being used in production
   - Verify webhook URL is accessible
   - Check order amount and currency

2. **Webhook Not Received**
   - Verify webhook URL is correct
   - Check server logs for errors
   - Ensure webhook endpoint is publicly accessible

3. **Order Status Not Updated**
   - Check Firebase connection
   - Verify webhook signature verification
   - Check order ID matching

### Debug Mode:
Enable debug logging by setting:
```env
NEXT_PUBLIC_DEBUG=true
```

This will log all Cashfree API calls and webhook events to the console. 