import { NextRequest, NextResponse } from 'next/server';

// Import server-side WhatsApp service only on server
let whatsappService: any = null;

// Initialize WhatsApp service only on server side
if (typeof window === 'undefined') {
  try {
    const { default: WhatsAppServerService } = require('@/services/whatsappServerService');
    whatsappService = WhatsAppServerService;
  } catch (error) {
    console.error('Failed to load WhatsApp service:', error);
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (!whatsappService) {
    return NextResponse.json({ error: 'WhatsApp service not available' }, { status: 503 });
  }

  try {
    switch (action) {
      case 'status':
        return NextResponse.json({
          connected: whatsappService.isClientConnected(),
          qrCode: whatsappService.getQRCode()
        });

      case 'chats':
        const chats = whatsappService.getChats();
        return NextResponse.json({ chats });

      case 'chat':
        const chatId = searchParams.get('chatId');
        if (!chatId) {
          return NextResponse.json({ error: 'Chat ID required' }, { status: 400 });
        }
        const chat = whatsappService.getChat(chatId);
        return NextResponse.json({ chat });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('WhatsApp API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (!whatsappService) {
    return NextResponse.json({ error: 'WhatsApp service not available' }, { status: 503 });
  }

  try {
    switch (action) {
      case 'connect':
        await whatsappService.connect();
        return NextResponse.json({ success: true, message: 'Connecting to WhatsApp...' });

      case 'disconnect':
        await whatsappService.disconnect();
        return NextResponse.json({ success: true, message: 'Disconnected from WhatsApp' });

      case 'send':
        const { chatId, message } = await request.json();
        if (!chatId || !message) {
          return NextResponse.json({ error: 'Chat ID and message required' }, { status: 400 });
        }
        const sentMessage = await whatsappService.sendMessage(chatId, message);
        return NextResponse.json({ success: true, message: sentMessage });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('WhatsApp API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 