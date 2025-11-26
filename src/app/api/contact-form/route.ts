import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { EmailService } from '@/lib/email/service';

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
    
    // Send emails (non-blocking - don't fail if email fails)
    try {
      await EmailService.sendContactFormEmails({
        name,
        email,
        phone,
        subject,
        message,
      });
    } catch (emailError) {
      console.error('Error sending contact form emails:', emailError);
      // Don't fail the request - form submission succeeded, email is secondary
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit contact form.' }, { status: 500 });
  }
} 