# Phase 9: Security & Rate Limits - Deployment Guide

## Overview
Phase 9 implements production-ready security measures and rate limiting for the messaging system. This includes Redis-based rate limiting, enhanced error handling, input validation, and comprehensive security logging.

## New Files Created

### Security Utilities
- `src/lib/security/rate-limiter.ts` - Redis-based rate limiting with configurable limits
- `src/lib/security/security-utils.ts` - Input validation, sanitization, and security utilities
- `src/lib/security/error-handler.ts` - Enhanced error handling with severity levels and logging

### Enhanced API Routes
- `src/app/api/messages/send/route.ts` - Updated with rate limiting and security validation
- `src/app/api/messages/threads/route.ts` - Updated with rate limiting and security validation
- `src/app/api/messages/messages/route.ts` - Updated with rate limiting and security validation
- `src/app/api/webhooks/whatsapp/route-enhanced.ts` - Enhanced webhook with security measures

### Updated Firestore Rules
- `firestore.rules` - Added comprehensive security rules for all messaging collections

## Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Rate Limiting Configuration
REDIS_URL=redis://localhost:6379
RATE_LIMIT_ENABLED=true

# Security Configuration
ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com
SECURITY_LOG_LEVEL=INFO
INCLUDE_ERROR_DETAILS=false

# Webhook Security
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token
INSTAGRAM_WEBHOOK_VERIFY_TOKEN=your_instagram_webhook_verify_token

# Security Monitoring (Optional)
SENTRY_DSN=your_sentry_dsn
SECURITY_MONITORING_ENABLED=true
```

## Rate Limiting Configuration

The system implements different rate limits for different endpoints:

### Message Sending
- **Per Thread**: 5 messages per 10 seconds
- **Global**: 100 messages per minute
- **Key**: `msg_send:{clientIp}:{threadId}`

### Thread Fetching
- **Per IP**: 30 requests per minute
- **Key**: `msg_threads:{clientIp}`

### Message History
- **Per IP**: 50 requests per minute
- **Key**: `msg_history:{clientIp}`

### Webhooks
- **WhatsApp**: 100 webhooks per minute
- **Instagram**: 100 webhooks per minute
- **Key**: `webhook_{platform}:{clientIp}`

### Template Management
- **Template Creation**: 10 requests per 5 minutes
- **Key**: `template_create:{clientIp}`

### Campaign Management
- **Campaign Creation**: 5 campaigns per 10 minutes
- **Key**: `campaign_create:{clientIp}`

## Security Features

### Input Validation & Sanitization
- Request body size limits (10MB max)
- String sanitization (removes control characters, limits length)
- Deep object sanitization
- Content-Type validation

### Error Handling
- Custom error classes with severity levels
- Structured error responses
- Request ID tracking
- Error logging with context

### Security Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Content-Security-Policy
- Strict-Transport-Security
- Permissions-Policy

### Webhook Security
- Signature verification (HMAC SHA-256)
- Raw body parsing for security
- Rate limiting per IP
- Comprehensive logging

## Firestore Security Rules

The updated rules include:

### Customer Collection
- Admin-only access
- Validation for creation/updates
- Timestamp validation

### Thread Collection
- Admin-only access
- Validation for creation/updates
- Messages subcollection with validation

### Provider Seen Collection
- Admin-only access (for idempotency)

### Template Requests
- Admin-only access
- Creator validation
- Timestamp validation

### Campaigns
- Admin-only access
- Creator validation
- Timestamp validation

### Notifications
- Admin-only access
- Timestamp validation

### SLA Rules & Violations
- Admin-only access
- Creator validation
- Timestamp validation

## Testing

### Rate Limiting Tests

```bash
# Test message sending rate limit
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/messages/send \
    -H "Content-Type: application/json" \
    -d '{"channel":"whatsapp","threadId":"test","text":"test"}'
done

# Test thread fetching rate limit
for i in {1..40}; do
  curl "http://localhost:3000/api/messages/threads?limit=10"
done
```

### Security Tests

```bash
# Test invalid signature
curl -X POST http://localhost:3000/api/webhooks/whatsapp \
  -H "x-hub-signature-256: invalid_signature" \
  -d '{"test":"data"}'

# Test missing headers
curl -X POST http://localhost:3000/api/messages/send \
  -d '{"channel":"whatsapp","threadId":"test","text":"test"}'

# Test oversized request
curl -X POST http://localhost:3000/api/messages/send \
  -H "Content-Type: application/json" \
  -d "$(printf 'a%.0s' {1..11000000})"
```

### Error Handling Tests

```bash
# Test validation error
curl -X POST http://localhost:3000/api/messages/send \
  -H "Content-Type: application/json" \
  -d '{"invalid":"data"}'

# Test rate limit error
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/messages/send \
    -H "Content-Type: application/json" \
    -d '{"channel":"whatsapp","threadId":"test","text":"test"}'
done
```

## Monitoring

### Security Events to Monitor

1. **Rate Limit Exceeded**
   - Monitor frequency and patterns
   - Identify potential abuse

2. **Invalid Signatures**
   - Monitor webhook signature failures
   - Investigate potential attacks

3. **Validation Errors**
   - Monitor input validation failures
   - Identify malformed requests

4. **Authentication Failures**
   - Monitor unauthorized access attempts
   - Track failed login attempts

### Log Analysis

```bash
# Monitor rate limit events
grep "RATE_LIMIT_EXCEEDED" logs/app.log

# Monitor security events
grep "SECURITY_EVENT" logs/app.log

# Monitor webhook security
grep "WEBHOOK.*SIGNATURE" logs/app.log
```

## Production Deployment

### 1. Redis Setup

```bash
# Install Redis (Ubuntu/Debian)
sudo apt update
sudo apt install redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf

# Set password
requirepass your_redis_password

# Enable persistence
save 900 1
save 300 10
save 60 10000

# Restart Redis
sudo systemctl restart redis
```

### 2. Environment Configuration

```bash
# Production environment variables
REDIS_URL=redis://:your_redis_password@localhost:6379
ALLOWED_ORIGINS=https://yourdomain.com
SECURITY_LOG_LEVEL=WARN
INCLUDE_ERROR_DETAILS=false
SECURITY_MONITORING_ENABLED=true
```

### 3. Firestore Rules Deployment

```bash
# Deploy updated security rules
firebase deploy --only firestore:rules
```

### 4. Application Deployment

```bash
# Build and deploy
npm run build
npm start
```

## Security Checklist

### Before Production
- [ ] Redis configured with password
- [ ] Environment variables set
- [ ] Firestore rules deployed
- [ ] Rate limits configured
- [ ] Security headers enabled
- [ ] Error monitoring configured
- [ ] Log monitoring set up

### Ongoing Monitoring
- [ ] Monitor rate limit events
- [ ] Monitor security events
- [ ] Monitor error rates
- [ ] Monitor webhook failures
- [ ] Review security logs regularly
- [ ] Update security configurations as needed

## Troubleshooting

### Common Issues

1. **Rate Limiting Not Working**
   - Check Redis connection
   - Verify REDIS_URL environment variable
   - Check rate limit configuration

2. **Webhook Signature Failures**
   - Verify webhook secret configuration
   - Check signature header format
   - Validate raw body parsing

3. **Firestore Permission Errors**
   - Verify security rules deployment
   - Check user authentication
   - Validate timestamp fields

4. **High Error Rates**
   - Check application logs
   - Monitor rate limit events
   - Review security event logs

### Debug Commands

```bash
# Test Redis connection
redis-cli ping

# Check rate limit keys
redis-cli keys "*rate_limit*"

# Monitor Redis in real-time
redis-cli monitor

# Check application logs
tail -f logs/app.log | grep -E "(ERROR|SECURITY|RATE_LIMIT)"
```

## Performance Considerations

### Rate Limiting Performance
- Redis provides fast in-memory storage
- Rate limit checks are O(1) operations
- Minimal impact on response times

### Security Validation Performance
- Input sanitization is CPU-intensive
- Consider caching for repeated validations
- Monitor validation performance

### Logging Performance
- Security logging adds minimal overhead
- Use async logging for non-critical events
- Consider log rotation and cleanup

## Next Steps

After deploying Phase 9:

1. **Monitor Security Events**
   - Set up alerts for security incidents
   - Review logs regularly
   - Adjust rate limits based on usage

2. **Performance Optimization**
   - Monitor response times
   - Optimize rate limit configurations
   - Tune security validation

3. **Security Hardening**
   - Regular security audits
   - Penetration testing
   - Security rule updates

4. **Documentation Updates**
   - Update API documentation
   - Document security procedures
   - Create incident response plan

## Conclusion

Phase 9 provides a robust security foundation for the messaging system. The implementation includes:

- **Rate Limiting**: Prevents abuse and DoS attacks
- **Input Validation**: Protects against injection attacks
- **Error Handling**: Provides structured error responses
- **Security Logging**: Enables security monitoring
- **Firestore Rules**: Ensures data security

The system is now ready for production use with enterprise-grade security measures.
