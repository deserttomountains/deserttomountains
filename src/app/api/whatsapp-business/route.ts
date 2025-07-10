import { NextRequest, NextResponse } from 'next/server';
import whatsappBusinessService from '@/services/whatsappBusinessService';

// GET - Get connection status and chats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'status':
        const isConnected = whatsappBusinessService.isClientConnected();
        return NextResponse.json({ 
          connected: isConnected,
          status: isConnected ? 'ready' : 'disconnected'
        });

      case 'chats':
        const chats = whatsappBusinessService.getChats();
        return NextResponse.json({ chats });

      case 'chat':
        const chatId = searchParams.get('chatId');
        if (!chatId) {
          return NextResponse.json({ error: 'Chat ID required' }, { status: 400 });
        }
        const chat = whatsappBusinessService.getChat(chatId);
        return NextResponse.json({ chat });

      case 'phone-info':
        const phoneInfo = await whatsappBusinessService.getPhoneNumberInfo();
        return NextResponse.json({ phoneInfo });

      case 'business-profile':
        const businessProfile = await whatsappBusinessService.getBusinessProfile();
        return NextResponse.json({ businessProfile });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('WhatsApp Business API Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}

// POST - Send messages and manage connection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'connect':
        await whatsappBusinessService.connect();
        return NextResponse.json({ status: 'connected' });

      case 'disconnect':
        await whatsappBusinessService.disconnect();
        return NextResponse.json({ status: 'disconnected' });

      case 'send-message':
        const { phoneNumber, message } = data;
        if (!phoneNumber || !message) {
          return NextResponse.json({ 
            error: 'Phone number and message required' 
          }, { status: 400 });
        }
        const sentMessage = await whatsappBusinessService.sendMessage(phoneNumber, message);
        return NextResponse.json({ message: sentMessage });

      case 'send-template':
        const { phoneNumber: templatePhone, templateName, language, components } = data;
        if (!templatePhone || !templateName) {
          return NextResponse.json({ 
            error: 'Phone number and template name required' 
          }, { status: 400 });
        }
        const templateMessage = await whatsappBusinessService.sendTemplateMessage(
          templatePhone, 
          templateName, 
          language, 
          components
        );
        return NextResponse.json({ message: templateMessage });

      case 'update-config':
        whatsappBusinessService.updateConfig(data.config);
        return NextResponse.json({ status: 'config_updated' });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('WhatsApp Business API Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}

// Webhook endpoint for receiving messages
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle webhook verification
    if (body.mode === 'subscribe' && body['hub.challenge']) {
      const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
      if (body['hub.verify_token'] === verifyToken) {
        return new NextResponse(body['hub.challenge'], { status: 200 });
      } else {
        return new NextResponse('Forbidden', { status: 403 });
      }
    }

    // Handle incoming messages
    whatsappBusinessService.handleWebhook(body);
    
    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
} 