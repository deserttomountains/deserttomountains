# Phase 7: Templates & Campaign Hygiene - Deployment Guide

## Overview

This guide covers the deployment of the template management system and campaign hygiene features for WhatsApp and Instagram messaging.

## Prerequisites

- ✅ Messaging system core components implemented
- ✅ Webhook endpoints functional
- ✅ Admin interface operational
- ✅ Firebase project configured
- ✅ Meta Business Manager access

## Step 1: Environment Configuration

### Required Environment Variables

Add these to your `.env.local`:

```bash
# WhatsApp Business API (Required for templates)
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_APP_SECRET=your_app_secret
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_verify_token

# Instagram Business API
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token
INSTAGRAM_APP_SECRET=your_app_secret
INSTAGRAM_WEBHOOK_VERIFY_TOKEN=your_verify_token

# Base URL for webhooks
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Template Management
TEMPLATE_APPROVAL_ENABLED=true
CAMPAIGN_TRACKING_ENABLED=true
```

### Meta Business Manager Setup

1. **Access Meta Business Manager**
   - Go to [business.facebook.com](https://business.facebook.com)
   - Navigate to your WhatsApp Business Account

2. **Configure Webhook URLs**
   - WhatsApp: `https://yourdomain.com/api/webhooks/whatsapp`
   - Instagram: `https://yourdomain.com/api/webhooks/instagram`
   - Set verification tokens in environment variables

3. **Enable Messaging Permissions**
   - WhatsApp: Enable messaging API
   - Instagram: Enable Instagram messaging permissions

## Step 2: Template Creation Process

### 2.1 Create Initial Templates

Use the admin interface at `/admin/templates` to create these essential templates:

#### Utility Templates (Always Approved)
```json
{
  "name": "order_update",
  "category": "UTILITY",
  "language": "en",
  "components": [
    {
      "type": "BODY",
      "text": "Hi {{customer_name}}, your order #{{order_number}} has been {{status}}. Estimated delivery: {{estimated_delivery}}."
    }
  ],
  "meta": {
    "description": "Order status update notifications",
    "useCase": "Order tracking and updates",
    "targetAudience": "Customers with active orders"
  }
}
```

```json
{
  "name": "shipping_update",
  "category": "UTILITY",
  "language": "en",
  "components": [
    {
      "type": "BODY",
      "text": "Your order #{{order_number}} is on its way! Tracking: {{tracking_number}} via {{carrier}}."
    }
  ],
  "meta": {
    "description": "Shipping and delivery updates",
    "useCase": "Shipping notifications",
    "targetAudience": "Customers with shipped orders"
  }
}
```

#### Marketing Templates (Require Approval)
```json
{
  "name": "welcome_offer",
  "category": "MARKETING",
  "language": "en",
  "components": [
    {
      "type": "BODY",
      "text": "Welcome {{customer_name}}! Enjoy {{discount_percentage}} off your first order. Valid until {{valid_until}}."
    }
  ],
  "meta": {
    "description": "Welcome offer for new customers",
    "useCase": "Customer acquisition",
    "targetAudience": "New customers"
  }
}
```

### 2.2 Template Approval Workflow

1. **Create Template** → Status: DRAFT
2. **Review & Submit** → Status: PENDING
3. **Admin Review** → Status: APPROVED/REJECTED
4. **Meta Review** (if marketing template) → External approval

### 2.3 Template Validation Rules

- **Name**: 3-512 characters, alphanumeric + underscore
- **Language**: Supported language codes (en, hi, es)
- **Category**: UTILITY (auto-approved) or MARKETING (requires review)
- **Components**: At least one BODY component required
- **Text Limits**: 1024 characters per component
- **Variables**: Use {{variable_name}} format

## Step 3: Campaign Management Setup

### 3.1 Campaign Types

1. **Broadcast Campaigns**
   - Send to all customers
   - Use for announcements, updates

2. **Targeted Campaigns**
   - Filter by customer attributes
   - Use for personalized messaging

3. **Sequence Campaigns**
   - Multi-step automated flows
   - Use for onboarding, follow-ups

### 3.2 Campaign Creation Process

1. **Define Target Audience**
   - Customer status filters
   - Channel preferences
   - Activity-based targeting

2. **Create Content**
   - Message text with variables
   - Template selection (if applicable)
   - Attachment uploads

3. **Schedule Campaign**
   - Start date/time
   - Frequency (once, daily, weekly)
   - Timezone settings

4. **Review & Launch**
   - Preview message
   - Estimate reach
   - Final approval

### 3.3 Campaign Tracking

Monitor these metrics:
- **Sent**: Messages successfully sent
- **Delivered**: Messages delivered to recipient
- **Read**: Messages read by recipient
- **Replies**: Customer responses received
- **Opt-outs**: Unsubscribe requests
- **Failed**: Delivery failures

## Step 4: Policy Compliance

### 4.1 WhatsApp Policy Enforcement

- **24-Hour Window**: Freeform messages only within 24h of last inbound
- **Template Usage**: Templates always allowed (policy compliant)
- **Opt-out Handling**: Respect customer opt-out requests
- **Content Guidelines**: No spam, misleading content, or prohibited content

### 4.2 Instagram Policy Compliance

- **Messaging Permissions**: Only reply to customer-initiated conversations
- **Content Standards**: Follow Instagram's community guidelines
- **Rate Limits**: Respect API rate limits and quotas

### 4.3 Data Protection

- **PII Handling**: Minimize personal data in logs
- **Consent Management**: Track customer consent status
- **Data Retention**: Implement appropriate retention policies

## Step 5: Testing & Validation

### 5.1 Template Testing

```bash
# Test template creation
curl -X POST http://localhost:3000/api/templates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test_template",
    "category": "UTILITY",
    "language": "en",
    "components": [{"type": "BODY", "text": "Test message"}],
    "meta": {"description": "Test template", "useCase": "Testing"}
  }'

# Test template preview
curl -X GET "http://localhost:3000/api/templates/test_template/preview?variables={\"customer_name\":\"John\"}"
```

### 5.2 Campaign Testing

```bash
# Test campaign creation
curl -X POST http://localhost:3000/api/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Campaign",
    "type": "BROADCAST",
    "channel": "whatsapp",
    "content": {"message": "Test campaign message"},
    "schedule": {"startDate": "2024-01-01T10:00:00Z", "timezone": "UTC", "frequency": "ONCE"}
  }'

# Test campaign analytics
curl -X GET "http://localhost:3000/api/campaigns/test_campaign_id/analytics"
```

### 5.3 Webhook Testing

```bash
# Test WhatsApp webhook with template message
curl -X POST http://localhost:3000/api/test/webhook \
  -H "Content-Type: application/json" \
  -d '{"type": "whatsapp", "fixture": "whatsapp_template_message"}'
```

## Step 6: Production Deployment

### 6.1 Pre-deployment Checklist

- [ ] Environment variables configured
- [ ] Firestore indexes deployed
- [ ] Template approval workflow tested
- [ ] Campaign tracking functional
- [ ] Policy enforcement working
- [ ] Error handling implemented
- [ ] Monitoring configured

### 6.2 Deployment Steps

1. **Deploy to Production**
   ```bash
   npm run build
   npm run start
   ```

2. **Verify Webhook Registration**
   - Test webhook verification
   - Confirm signature validation
   - Check event processing

3. **Test Template System**
   - Create test template
   - Submit for approval
   - Verify approval workflow

4. **Test Campaign System**
   - Create test campaign
   - Verify targeting
   - Check metrics tracking

### 6.3 Post-deployment Verification

1. **Template Management**
   - [ ] Template creation works
   - [ ] Approval workflow functional
   - [ ] Template usage in messaging

2. **Campaign Management**
   - [ ] Campaign creation works
   - [ ] Targeting filters functional
   - [ ] Metrics tracking accurate

3. **Policy Compliance**
   - [ ] 24-hour window enforced
   - [ ] Template validation working
   - [ ] Opt-out handling correct

## Step 7: Monitoring & Maintenance

### 7.1 Key Metrics to Monitor

- **Template Usage**: Templates used per day
- **Approval Rate**: Template approval success rate
- **Campaign Performance**: Delivery, read, reply rates
- **Policy Violations**: Attempted freeform outside window
- **Error Rates**: Failed sends, webhook errors

### 7.2 Regular Maintenance

1. **Template Review**
   - Monthly template performance review
   - Update underperforming templates
   - Archive unused templates

2. **Campaign Optimization**
   - Analyze campaign performance
   - Optimize targeting criteria
   - A/B test message content

3. **Policy Updates**
   - Monitor Meta policy changes
   - Update validation rules
   - Retrain approval team

### 7.3 Troubleshooting

#### Common Issues

1. **Template Rejection**
   - Check content against Meta guidelines
   - Verify variable usage
   - Review language requirements

2. **Campaign Delivery Issues**
   - Check rate limits
   - Verify target audience filters
   - Review message content

3. **Policy Violations**
   - Check messaging window calculations
   - Verify template validation
   - Review opt-out handling

## Next Steps

After successful deployment of Phase 7:

1. **Phase 8**: Implement real-time notifications and SLA monitoring
2. **Phase 9**: Add advanced security features and rate limiting
3. **Phase 10**: Prepare for Instagram app review
4. **Phase 11**: Implement comprehensive testing suite
5. **Phase 12**: Add observability and monitoring
6. **Phase 13**: Plan production rollout

## Support & Resources

- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)
- [Instagram Messaging API](https://developers.facebook.com/docs/instagram-api)
- [Meta Business Manager](https://business.facebook.com)
- [WhatsApp Policy Guidelines](https://www.whatsapp.com/legal/business-policy)
