# Email Service Setup Guide

This email service uses AWS SES (Simple Email Service) to send transactional emails for various events in the application.

## Events That Trigger Emails

1. **Lead Created** - Sends confirmation to user and notification to admin
2. **Franchise Form Submitted** - Sends confirmation to applicant and notification to admin
3. **Contact Form Submitted** - Sends confirmation to user and notification to admin
4. **Order/Purchase Made** - Sends order confirmation to customer and notification to admin

## AWS SES Setup

### Step 1: Create AWS Account
1. Go to [AWS Console](https://console.aws.amazon.com/)
2. Sign up or sign in to your AWS account

### Step 2: Access SES
1. Navigate to **Simple Email Service (SES)** in AWS Console
2. Select your preferred region (e.g., `us-east-1`, `ap-south-1` for India)

### Step 3: Verify Your Email Address (Sandbox Mode)
Initially, AWS SES starts in **sandbox mode**, which means you can only send emails to verified email addresses.

1. Go to **Verified identities** in SES console
2. Click **Create identity**
3. Select **Email address**
4. Enter the email address you want to verify (e.g., `admin@deserttomountains.com`)
5. Click **Create identity**
6. Check your email and click the verification link

**Important:** Verify both:
- Your admin email address
- Your "from" email address (noreply@deserttomountains.com)

### Step 4: Verify Your Domain (Recommended for Production)
For production use, verify your entire domain:

1. Go to **Verified identities** in SES console
2. Click **Create identity**
3. Select **Domain**
4. Enter your domain (e.g., `deserttomountains.com`)
5. Follow the DNS configuration instructions:
   - Add the provided TXT records to your domain's DNS
   - Add the provided CNAME records for DKIM
6. Wait for verification (can take up to 72 hours, usually much faster)

### Step 5: Request Production Access (Move Out of Sandbox)
To send emails to any email address (not just verified ones):

1. Go to **Account dashboard** in SES console
2. Click **Request production access**
3. Fill out the form:
   - **Mail Type:** Transactional
   - **Website URL:** Your website URL
   - **Use case description:** Describe your use case (e.g., "Sending transactional emails for lead confirmations, order confirmations, and contact form submissions")
   - **Expected sending volume:** Estimate your monthly email volume
4. Submit the request
5. AWS typically approves within 24-48 hours

### Step 6: Create IAM User for SES
1. Go to **IAM** in AWS Console
2. Click **Users** → **Create user**
3. Enter username (e.g., `ses-email-service`)
4. Select **Attach policies directly**
5. Search for and select **AmazonSESFullAccess** (or create a custom policy with minimal permissions)
6. Click **Create user**
7. Click on the user → **Security credentials** tab
8. Click **Create access key**
9. Select **Application running outside AWS**
10. Copy the **Access key ID** and **Secret access key** (save these securely!)

### Step 7: Configure Environment Variables
Add these to your `.env.local` file:

```env
# AWS SES Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here

# Email Configuration
EMAIL_FROM=noreply@deserttomountains.com
ADMIN_EMAIL=admin@deserttomountains.com
EMAIL_REPLY_TO=contact@deserttomountains.com

# Site URL (for email links)
NEXT_PUBLIC_SITE_URL=https://deserttomountains.com
```

### Step 8: For Vercel Deployment
Add the same environment variables in Vercel:
1. Go to your project in Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Add all the variables listed above
4. Redeploy your application

## Testing

### Test Email Sending
1. Make sure you're in sandbox mode OR have verified the recipient email
2. Create a test lead, submit a form, or place an order
3. Check both the user email and admin email inboxes

### Check Email Logs
- AWS SES Console → **Email sending** → **Sending statistics**
- Check for bounces, complaints, and delivery rates

## Troubleshooting

### Emails Not Sending
1. **Check AWS credentials:** Ensure `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are correct
2. **Check region:** Ensure `AWS_REGION` matches your SES region
3. **Check sandbox mode:** If in sandbox, recipient email must be verified
4. **Check email verification:** Both "from" and recipient emails must be verified (in sandbox)
5. **Check IAM permissions:** Ensure IAM user has SES send permissions

### Common Errors

**"Email address is not verified"**
- Solution: Verify the email address in SES console or request production access

**"Access Denied"**
- Solution: Check IAM user permissions and credentials

**"Configuration set does not exist"**
- Solution: Remove any configuration set references (not needed for basic setup)

## Cost

- **Free Tier:** 3,000 emails/month for first 12 months (non-EC2)
- **After Free Tier:** $0.10 per 1,000 emails
- **Example:** 400 emails/month = $0.04/month

## Security Best Practices

1. **Never commit credentials to git** - Use environment variables
2. **Use IAM roles** - For production, consider using IAM roles instead of access keys
3. **Rotate credentials** - Regularly rotate access keys
4. **Monitor usage** - Set up CloudWatch alarms for unusual activity
5. **Use separate IAM user** - Don't use root AWS credentials

## Support

For AWS SES issues:
- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)
- [AWS SES Console](https://console.aws.amazon.com/ses/)


