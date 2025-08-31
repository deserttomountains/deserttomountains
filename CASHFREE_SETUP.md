## Troubleshooting

### Common Issues
1. **"Invalid signature" errors**: Check webhook secret configuration
2. **"Missing signature" errors**: Ensure Cashfree is sending signature header
3. **Build errors**: Verify crypto module imports are correct
4. **"payment_session_id is not present or is invalid"**: This indicates Cashfree credentials are not properly configured

### Payment Session ID Error
If you see this error:
```json
{
  "message": "payment_session_id is not present or is invalid",
  "code": "payment_session_id_invalid",
  "type": "request_failed"
}
```

**Solution Steps:**
1. **Check Environment Variables**: Ensure you have proper Cashfree credentials in `.env.local`:
   ```bash
   CASHFREE_CLIENT_ID=your_actual_client_id_here
   CASHFREE_CLIENT_SECRET=your_actual_client_secret_here
   CASHFREE_WEBHOOK_SECRET=your_actual_webhook_secret_here
   NEXT_PUBLIC_CASHFREE_ENV=TEST  # or PROD
   ```

2. **Get Real Credentials**: 
   - Log into your Cashfree Merchant Dashboard
   - Go to **Settings** → **API Keys**
   - Copy your **Client ID** and **Client Secret**
   - Replace the placeholder values in your environment file

3. **Test Mode vs Production**:
   - For testing: Use sandbox credentials and set `NEXT_PUBLIC_CASHFREE_ENV=TEST`
   - For production: Use live credentials and set `NEXT_PUBLIC_CASHFREE_ENV=PROD`

4. **Verify API Access**:
   - Ensure your Cashfree account is active
   - Check if you have the required permissions for payment processing
   - Verify your account is not suspended

5. **Alternative**: If Cashfree setup is complex, you can temporarily disable it and use Razorpay only by modifying the payment gateways array in `src/app/payment/page.tsx`.

### Debug Logging
The system logs signature verification details:
```javascript
console.log('Cashfree webhook signature verification:', {
  rawBodyLength: rawBody.length,
  expectedSignature,
  receivedSignature: signature,
  isValid
});
```

### Testing Cashfree Integration
1. **Use Test Credentials**: Cashfree provides test credentials for development
2. **Test Payment Flow**: Try with small amounts first
3. **Monitor Logs**: Check browser console and server logs for detailed error messages
4. **Verify Webhook**: Ensure webhook URL is accessible and properly configured
