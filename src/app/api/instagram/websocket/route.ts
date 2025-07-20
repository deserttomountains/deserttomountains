import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // This will be handled by Socket.IO middleware
  return new Response('Instagram WebSocket endpoint');
} 