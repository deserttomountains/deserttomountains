# Messaging System Documentation

## Overview

This messaging system provides a comprehensive solution for handling WhatsApp and Instagram messaging in the admin dashboard. It includes webhook processing, message sending, policy enforcement, and a complete admin interface.

## Architecture

### Core Components

1. **Data Models** (`/lib/messaging/types.ts`)
   - Customer, Thread, Message interfaces
   - Webhook event types
   - API request/response types

2. **Policy System** (`/lib/messaging/policy.ts`)
   - 24-hour customer care window enforcement
   - 72-hour ad grace window enforcement
   - Freeform vs template message validation

3. **Security** (`/lib/messaging/security.ts`)
   - Webhook signature verification (HMAC SHA-256)
   - Raw body parsing for Next.js App Router
   - Constant-time comparison for security

4. **Templates** (`/lib/messaging/templates.ts`)
   - WhatsApp template validation
   - Required variable checking
   - Template registry

5. **Graph API Client** (`/lib/messaging/graph.ts`)
   - Meta Graph API communication
   - Retry logic with exponential backoff
   - Rate limiting handling

6. **Messaging Service** (`/lib/messaging/service.ts`)
   - Core business logic
   - Database operations
   - Policy enforcement

7. **Mappers** (`/lib/messaging/mappers.ts`)
   - Webhook data to internal format conversion
   - Idempotency handling
   - Customer/thread creation

## API Endpoints

### Webhook Endpoints

#### WhatsApp Webhook
- **URL**: `/api/webhooks/whatsapp`
- **GET**: Webhook verification
- **POST**: Incoming message processing

#### Instagram Webhook
- **URL**: `/api/webhooks/instagram`
- **GET**: Webhook verification
- **POST**: Incoming message processing

### Messaging APIs

#### Send Message
- **URL**: `/api/messages/send`
- **Method**: POST
- **Body**: `SendMessageRequest`

#### Get Threads
- **URL**: `/api/messages/threads`
- **Method**: GET
- **Query Params**: status, assignee, channels, limit, offset

#### Get Messages
- **URL**: `/api/messages/messages`
- **Method**: GET
- **Query Params**: threadId, limit, offset

### Test API
- **URL**: `/api/test/webhook`
- **Method**: POST
- **Body**: `{ type: 'whatsapp|instagram', fixture: 'fixture_name' }`

## Data Flow

### Inbound Message Flow

1. **Webhook Reception**
   - Meta sends webhook to `/api/webhooks/whatsapp` or `/api/webhooks/instagram`
   - Signature verification using HMAC SHA-256
   - Raw body parsing for security

2. **Data Mapping**
   - Webhook data converted to internal format via mappers
   - Idempotency check using `providerSeen` collection
   - Customer and thread creation/update

3. **Database Storage**
   - Message stored in `threads/{threadId}/messages`
   - Thread updated with last inbound timestamp
   - Unread count incremented

4. **Admin Interface**
   - Real-time updates via API calls
   - Thread list shows new conversations
   - Message history displayed

### Outbound Message Flow

1. **Admin Interface**
   - User selects thread and composes message
   - Policy validation (freeform vs template)
   - Template variable validation

2. **Message Sending**
   - Graph API call to Meta
   - WhatsApp: `sendWhatsAppText` or `sendWhatsAppTemplate`
   - Instagram: `sendInstagramReply`

3. **Database Storage**
   - Outbound message stored
   - Thread updated with last message timestamp
   - Provider ID (wamid/mid) stored for tracking

4. **Status Updates**
   - Delivery/read status updates via webhooks
   - Message status updated in database

## Policy Enforcement

### Messaging Windows

- **Customer Care Window**: 24 hours from last inbound message
- **Ad Grace Window**: 72 hours from ad click
- **Freeform Messages**: Only allowed within windows
- **Templates**: Always allowed (policy compliant)

### Template System

- **Utility Templates**: Order updates, shipping updates
- **Marketing Templates**: Offers, promotions
- **Variable Validation**: Required variables checked before sending
- **Language Support**: Multi-language template support

## Security Features

### Webhook Security

- **Signature Verification**: HMAC SHA-256 with app secret
- **Raw Body Parsing**: Prevents signature bypass attacks
- **Constant-time Comparison**: Prevents timing attacks
- **Token Validation**: Webhook verification token checking

### Data Protection

- **PII Redaction**: Sensitive data not logged
- **Access Control**: Admin-only access to messaging
- **Rate Limiting**: Per-thread and global limits
- **Error Handling**: Secure error responses

## Environment Variables

```bash
# WhatsApp Business API
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
```

## Testing

### Local Development

1. **Test Fixtures**: Sample webhook payloads in `/lib/messaging/fixtures.ts`
2. **Test API**: `/api/test/webhook` for local testing
3. **Idempotency**: Duplicate messages automatically ignored

### Test Commands

```bash
# Test WhatsApp inbound message
curl -X POST http://localhost:3000/api/test/webhook \
  -H "Content-Type: application/json" \
  -d '{"type": "whatsapp", "fixture": "whatsapp_inbound"}'

# Test Instagram inbound message
curl -X POST http://localhost:3000/api/test/webhook \
  -H "Content-Type: application/json" \
  -d '{"type": "instagram", "fixture": "instagram_inbound"}'
```

## Deployment Checklist

### Pre-deployment

- [ ] Environment variables configured
- [ ] Firestore indexes deployed
- [ ] WhatsApp templates approved in Meta Business Manager
- [ ] Instagram app permissions granted
- [ ] Webhook URLs registered in Meta dashboard

### Post-deployment

- [ ] Webhook verification successful
- [ ] Test messages sent and received
- [ ] Policy enforcement working
- [ ] Admin interface functional
- [ ] Error monitoring configured

## Monitoring & Analytics

### Key Metrics

- **Inbound Volume**: Messages received per day
- **Response Time**: Time to first response
- **Template Usage**: Template vs freeform ratio
- **Error Rates**: Failed sends and webhook errors
- **SLA Compliance**: Response time within windows

### Logging

- **Security Events**: Signature verification, token validation
- **API Usage**: Graph API calls and responses
- **Policy Violations**: Attempted freeform outside window
- **Error Tracking**: Failed operations with context

## Troubleshooting

### Common Issues

1. **Webhook Verification Fails**
   - Check `WEBHOOK_VERIFY_TOKEN` environment variable
   - Verify webhook URL in Meta dashboard

2. **Signature Verification Fails**
   - Check `APP_SECRET` environment variable
   - Ensure raw body parsing is working

3. **Messages Not Sending**
   - Verify `ACCESS_TOKEN` and `PHONE_NUMBER_ID`
   - Check Graph API rate limits
   - Validate template variables

4. **Policy Errors**
   - Check messaging window calculations
   - Verify template validation logic

### Debug Commands

```bash
# Check webhook verification
curl "http://localhost:3000/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=your_token&hub.challenge=test"

# Test message sending
curl -X POST http://localhost:3000/api/messages/send \
  -H "Content-Type: application/json" \
  -d '{"channel": "whatsapp", "threadId": "test", "text": "Hello"}'
```

## Future Enhancements

### Planned Features

1. **Real-time Notifications**: WebSocket-based live updates
2. **SLA Monitoring**: Automated response time tracking
3. **Advanced Analytics**: Customer behavior analysis
4. **Multi-language Support**: International template support
5. **Integration APIs**: Third-party CRM integration

### Scalability Considerations

1. **Database Optimization**: Index optimization for large datasets
2. **Caching**: Redis-based caching for frequently accessed data
3. **Queue Processing**: Background job processing for high volume
4. **Microservices**: Service decomposition for better scaling
5. **CDN Integration**: Media file delivery optimization
