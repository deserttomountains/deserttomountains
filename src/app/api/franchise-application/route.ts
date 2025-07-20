import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name, email, phone, city, state, message } = data;
    if (!name || !email || !phone || !city || !state || !message) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }
    await addDoc(collection(db, 'franchiseApplications'), {
      name,
      email,
      phone,
      city,
      state,
      message,
      createdAt: Timestamp.now(),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit application.' }, { status: 500 });
  }
} 