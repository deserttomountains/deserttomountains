import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name, email, phone, subject, message } = data;
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }
    await addDoc(collection(db, 'contactFormSubmissions'), {
      name,
      email,
      phone,
      subject,
      message,
      createdAt: Timestamp.now(),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit contact form.' }, { status: 500 });
  }
} 