# Phase 8: Notifications & SLA Monitoring - Deployment Guide

## Overview

This guide covers the deployment of the real-time notification system and SLA monitoring features for the messaging platform.

## Prerequisites

- ✅ Messaging system core components implemented
- ✅ Webhook endpoints functional
- ✅ Admin interface operational
- ✅ Firebase project configured
- ✅ Phase 7 (Templates & Campaigns) completed

## Step 1: Environment Configuration

### Required Environment Variables

Add these to your `.env.local`:

```bash
# Notification System
NOTIFICATION_ENABLED=true
SLA_MONITORING_ENABLED=true
NOTIFICATION_POLLING_INTERVAL=30000

# SLA Configuration
DEFAULT_FIRST_RESPONSE_SLA_MINUTES=30
DEFAULT_RESOLUTION_SLA_MINUTES=240
DEFAULT_FOLLOW_UP_SLA_MINUTES=60

# Business Hours (for SLA calculations)
BUSINESS_HOURS_START=09:00
BUSINESS_HOURS_END=17:00
BUSINESS_TIMEZONE=UTC
```

### Firestore Collections

The notification system creates these new collections:

- `notifications` - User notifications
- `slaRules` - SLA rule definitions
- `slaViolations` - SLA violation records

## Step 2: Notification System Setup

### 2.1 Default SLA Rules

Create these essential SLA rules via the admin interface:

#### First Response SLA
```json
{
  "name": "First Response SLA",
  "description": "Ensure first response within 30 minutes",
  "type": "FIRST_RESPONSE",
  "timeLimitMinutes": 30,
  "priority": "HIGH",
  "channels": ["whatsapp", "instagram"],
  "conditions": {
    "threadStatus": ["open", "pending"],
    "businessHours": true
  },
  "actions": {
    "notifyUsers": [],
    "notifyRoles": ["admin", "support"],
    "autoAssign": true,
    "escalateAfterMinutes": 60
  }
}
```

#### Resolution SLA
```json
{
  "name": "Resolution SLA",
  "description": "Ensure issue resolution within 4 hours",
  "type": "RESOLUTION",
  "timeLimitMinutes": 240,
  "priority": "MEDIUM",
  "channels": ["whatsapp", "instagram"],
  "conditions": {
    "threadStatus": ["open", "pending"],
    "businessHours": true
  },
  "actions": {
    "notifyUsers": [],
    "notifyRoles": ["admin"],
    "autoAssign": false,
    "escalateAfterMinutes": 300
  }
}
```

### 2.2 Notification Types

The system supports these notification types:

- **NEW_MESSAGE**: New customer message received
- **SLA_BREACH**: SLA violation detected
- **TEMPLATE_APPROVAL**: Template approval required
- **CAMPAIGN_COMPLETE**: Campaign completed
- **SYSTEM_ALERT**: System-wide alerts

### 2.3 Priority Levels

- **LOW**: Informational notifications
- **MEDIUM**: Standard alerts
- **HIGH**: Important alerts
- **URGENT**: Critical alerts

## Step 3: SLA Monitoring Configuration

### 3.1 SLA Rule Types

1. **FIRST_RESPONSE**: Time to first agent response
2. **RESOLUTION**: Time to issue resolution
3. **FOLLOW_UP**: Time to follow-up actions

### 3.2 SLA Conditions

Configure conditions for when SLA rules apply:

- **Customer Type**: Filter by customer segments
- **Thread Status**: Filter by conversation status
- **Business Hours**: Only apply during business hours
- **Channels**: Apply to specific channels

### 3.3 SLA Actions

Define actions when SLA is breached:

- **Notify Users**: Send notifications to specific users
- **Notify Roles**: Send notifications to user roles
- **Auto Assign**: Automatically assign to available agent
- **Escalate**: Escalate after additional time

## Step 4: Testing & Validation

### 4.1 Notification Testing

```bash
# Test notification creation
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "type": "NEW_MESSAGE",
    "title": "Test Notification",
    "message": "This is a test notification",
    "priority": "MEDIUM",
    "targetUserId": "user123",
    "metadata": {"threadId": "thread123"}
  }'

# Test notification retrieval
curl -X GET "http://localhost:3000/api/notifications?userId=user123&status=UNREAD"

# Test notification count
curl -X GET "http://localhost:3000/api/notifications/count?userId=user123"
```

### 4.2 SLA Testing

```bash
# Test SLA rule creation
curl -X POST http://localhost:3000/api/sla/rules \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test SLA Rule",
    "description": "Test rule for validation",
    "type": "FIRST_RESPONSE",
    "timeLimitMinutes": 30,
    "priority": "HIGH",
    "channels": ["whatsapp"],
    "conditions": {"businessHours": true},
    "actions": {"notifyUsers": [], "notifyRoles": ["admin"]}
  }'

# Test SLA compliance check
curl -X POST http://localhost:3000/api/sla/check \
  -H "Content-Type: application/json" \
  -d '{"threadId": "thread123"}'

# Test SLA violations
curl -X GET "http://localhost:3000/api/sla/violations?status=ACTIVE"

# Test SLA statistics
curl -X GET "http://localhost:3000/api/sla/stats"
```

### 4.3 Webhook Testing with Notifications

```bash
# Test WhatsApp webhook with notification
curl -X POST http://localhost:3000/api/test/webhook \
  -H "Content-Type: application/json" \
  -d '{"type": "whatsapp", "fixture": "whatsapp_inbound"}'

# Verify notification was created
curl -X GET "http://localhost:3000/api/notifications?userId=admin&status=UNREAD"
```

## Step 5: Production Deployment

### 5.1 Pre-deployment Checklist

- [ ] Environment variables configured
- [ ] Firestore collections created
- [ ] Default SLA rules configured
- [ ] Notification system tested
- [ ] SLA monitoring functional
- [ ] Real-time updates working
- [ ] Error handling implemented

### 5.2 Deployment Steps

1. **Deploy to Production**
   ```bash
   npm run build
   npm run start
   ```

2. **Verify Notification System**
   - Test notification creation
   - Verify real-time updates
   - Check notification persistence

3. **Verify SLA Monitoring**
   - Test SLA rule creation
   - Verify compliance checking
   - Check violation tracking

4. **Test Integration**
   - Send test webhook
   - Verify notification creation
   - Check SLA compliance

### 5.3 Post-deployment Verification

1. **Notification System**
   - [ ] Notifications created for new messages
   - [ ] Real-time updates working
   - [ ] Notification actions functional
   - [ ] Unread count accurate

2. **SLA Monitoring**
   - [ ] SLA rules active
   - [ ] Compliance checking working
   - [ ] Violations tracked
   - [ ] Statistics accurate

3. **Integration**
   - [ ] Webhook triggers notifications
   - [ ] SLA compliance checked
   - [ ] Admin interface functional

## Step 6: Monitoring & Maintenance

### 6.1 Key Metrics to Monitor

- **Notification Delivery**: Notifications sent vs. delivered
- **SLA Compliance**: Percentage of threads meeting SLA
- **Violation Resolution**: Time to resolve SLA violations
- **System Performance**: API response times

### 6.2 Regular Maintenance

1. **SLA Rule Review**
   - Monthly SLA rule performance review
   - Update rules based on business needs
   - Archive unused rules

2. **Notification Cleanup**
   - Archive old notifications
   - Clean up expired notifications
   - Monitor notification storage

3. **Performance Optimization**
   - Monitor database queries
   - Optimize notification polling
   - Review SLA calculation performance

### 6.3 Troubleshooting

#### Common Issues

1. **Notifications Not Appearing**
   - Check user ID in notification creation
   - Verify Firestore permissions
   - Check notification polling

2. **SLA Violations Not Detected**
   - Verify SLA rules are active
   - Check thread timestamps
   - Review SLA calculation logic

3. **Real-time Updates Not Working**
   - Check Firestore listeners
   - Verify network connectivity
   - Review polling configuration

## Step 7: Admin Interface Integration

### 7.1 Add Notification Center

Update the admin layout to include the notification center:

```tsx
// In AdminLayout.tsx
import NotificationCenter from '@/components/NotificationCenter';

// Add to header
<NotificationCenter 
  userId={userProfile?.uid} 
  onNotificationClick={handleNotificationClick}
/>
```

### 7.2 Add SLA Management

Add navigation to SLA management:

```tsx
// Add to admin navigation
{
  name: 'SLA Management',
  href: '/admin/sla',
  icon: Clock,
  current: pathname === '/admin/sla'
}
```

### 7.3 Notification Actions

Implement notification click handlers:

```tsx
const handleNotificationClick = (notification: Notification) => {
  if (notification.metadata.threadId) {
    router.push(`/admin/messages?thread=${notification.metadata.threadId}`);
  }
};
```

## Next Steps

After successful deployment of Phase 8:

1. **Phase 9**: Implement advanced security features and rate limiting
2. **Phase 10**: Prepare for Instagram app review
3. **Phase 11**: Implement comprehensive testing suite
4. **Phase 12**: Add observability and monitoring
5. **Phase 13**: Plan production rollout

## Support & Resources

- [Firebase Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Real-time Updates Guide](https://firebase.google.com/docs/firestore/query-data/listen)
- [SLA Best Practices](https://www.zendesk.com/blog/sla-best-practices/)
- [Notification UX Guidelines](https://www.nngroup.com/articles/notification-design/)
