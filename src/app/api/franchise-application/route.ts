import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { EmailService } from '@/lib/email/service';

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
    
    // Send emails (non-blocking - don't fail if email fails)
    try {
      await EmailService.sendFranchiseFormEmails({
        name,
        email,
        phone,
        city,
        state,
        message,
      });
    } catch (emailError) {
      console.error('Error sending franchise form emails:', emailError);
      // Don't fail the request - form submission succeeded, email is secondary
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit application.' }, { status: 500 });
  }
} 