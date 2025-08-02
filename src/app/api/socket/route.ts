import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // This is a placeholder for the socket route
  // The actual socket setup should be done in a different way for Next.js 13+ App Router
  return NextResponse.json({ message: 'Socket endpoint - use WebSocket connection instead' });
}

export async function POST(request: NextRequest) {
  // This is a placeholder for the socket route
  // The actual socket setup should be done in a different way for Next.js 13+ App Router
  return NextResponse.json({ message: 'Socket endpoint - use WebSocket connection instead' });
} 