import { NextRequest } from 'next/server';
import { Server as SocketIOServer } from 'socket.io';
// import whatsappService from '@/services/whatsappService'; // TEMPORARILY COMMENTED OUT FOR BUILD: No such module yet, will implement later

export async function GET(request: NextRequest) {
  // This will be handled by Socket.IO middleware
  return new Response('WebSocket endpoint');
}

// Socket.IO setup will be handled in a separate file
export const dynamic = 'force-dynamic'; 