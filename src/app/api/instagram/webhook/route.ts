import { NextRequest, NextResponse } from 'next/server';
import { emitInstagramEvent } from '@/lib/instagramSocket';

// Webhook verification token
const VERIFY_TOKEN = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || 'your_webhook_verify_token';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Handle webhook verification
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Instagram webhook verified successfully');
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Instagram webhook received:', JSON.stringify(body, null, 2));

    // Verify webhook signature (implement proper verification)
    const signature = request.headers.get('x-hub-signature-256');
    // TODO: Implement signature verification using crypto module
    
    // Process webhook events
    if (body.object === 'instagram' && body.entry) {
      for (const entry of body.entry) {
        await processInstagramEntry(entry);
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Instagram webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function processInstagramEntry(entry: any) {
  try {
    // Handle messaging events
    if (entry.messaging) {
      for (const messaging of entry.messaging) {
        await processMessagingEvent(messaging);
      }
    }

    // Handle postback events
    if (entry.postback) {
      for (const postback of entry.postback) {
        await processPostbackEvent(postback);
      }
    }

    // Handle reaction events
    if (entry.reaction) {
      for (const reaction of entry.reaction) {
        await processReactionEvent(reaction);
      }
    }

    // Handle delivery events
    if (entry.delivery) {
      for (const delivery of entry.delivery) {
        await processDeliveryEvent(delivery);
      }
    }

    // Handle read events
    if (entry.read) {
      for (const read of entry.read) {
        await processReadEvent(read);
      }
    }

  } catch (error) {
    console.error('Error processing Instagram entry:', error);
  }
}

async function processMessagingEvent(messaging: any) {
  try {
    const message = {
      id: messaging.message?.mid || Date.now().toString(),
      from: messaging.sender.id,
      to: messaging.recipient.id,
      text: messaging.message?.text || '',
      timestamp: new Date(messaging.timestamp * 1000),
      type: messaging.message?.attachments?.[0]?.type || 'text',
      media_url: messaging.message?.attachments?.[0]?.payload?.url,
      is_from_me: false,
      status: 'delivered',
      quick_reply: messaging.message?.quick_reply?.payload,
      reply_to: messaging.message?.reply_to?.mid,
    };

    // Emit to all connected Instagram clients
    emitInstagramEvent('new_message', message);
    console.log(`Instagram message broadcasted: ${message.text}`);

    // Store message in database (optional)
    await storeInstagramMessage(message);

  } catch (error) {
    console.error('Error processing messaging event:', error);
  }
}

async function processPostbackEvent(postback: any) {
  try {
    const postbackEvent = {
      id: Date.now().toString(),
      from: postback.sender.id,
      to: postback.recipient.id,
      payload: postback.postback.payload,
      timestamp: new Date(postback.timestamp * 1000),
      type: 'postback',
      is_from_me: false,
      status: 'delivered',
    };

    // Emit postback event
    emitInstagramEvent('postback_received', postbackEvent);

  } catch (error) {
    console.error('Error processing postback event:', error);
  }
}

async function processReactionEvent(reaction: any) {
  try {
    const reactionEvent = {
      id: Date.now().toString(),
      messageId: reaction.reaction.mid,
      from: reaction.sender.id,
      to: reaction.recipient.id,
      action: reaction.reaction.action,
      emoji: reaction.reaction.emoji,
      timestamp: new Date(reaction.timestamp * 1000),
      type: 'reaction',
      is_from_me: false,
    };

    // Emit reaction event
    emitInstagramEvent('reaction_received', reactionEvent);

  } catch (error) {
    console.error('Error processing reaction event:', error);
  }
}

async function processDeliveryEvent(delivery: any) {
  try {
    const deliveryEvent = {
      messageIds: delivery.delivery.mids,
      watermark: delivery.delivery.watermark,
      timestamp: new Date(delivery.timestamp * 1000),
      type: 'delivery',
    };

    // Emit delivery event
    emitInstagramEvent('message_delivered', deliveryEvent);

  } catch (error) {
    console.error('Error processing delivery event:', error);
  }
}

async function processReadEvent(read: any) {
  try {
    const readEvent = {
      watermark: read.read.watermark,
      timestamp: new Date(read.timestamp * 1000),
      type: 'read',
    };

    // Emit read event
    emitInstagramEvent('message_read', readEvent);

  } catch (error) {
    console.error('Error processing read event:', error);
  }
}

async function storeInstagramMessage(message: any) {
  try {
    // Store message in Firebase or your preferred database
    // This is optional but recommended for message history
    const messageData = {
      id: message.id,
      from: message.from,
      to: message.to,
      text: message.text,
      timestamp: message.timestamp,
      type: message.type,
      media_url: message.media_url,
      is_from_me: message.is_from_me,
      status: message.status,
      platform: 'instagram',
      created_at: new Date(),
    };

    // Example: Store in Firebase
    // const { AuthService } = await import('@/lib/firebase');
    // await AuthService.addInstagramMessage(messageData);

    console.log('Instagram message stored:', message.id);
  } catch (error) {
    console.error('Error storing Instagram message:', error);
  }
}

export const dynamic = 'force-dynamic'; 