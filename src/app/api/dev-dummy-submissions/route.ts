import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const cities = ['Jodhpur', 'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Ahmedabad', 'Hyderabad'];
const states = ['Rajasthan', 'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Gujarat', 'Telangana'];
const subjects = ['Product Inquiry', 'Project Consultation', 'Bulk Order', 'Partnership', 'Support', 'Other'];

function randomItem(arr: any[]) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomName() {
  const first = ['Amit', 'Priya', 'Rahul', 'Sneha', 'Vikram', 'Anjali', 'Rohit', 'Neha', 'Suresh', 'Pooja'];
  const last = ['Sharma', 'Patel', 'Singh', 'Gupta', 'Mehra', 'Jain', 'Kumar', 'Reddy', 'Chopra', 'Joshi'];
  return `${randomItem(first)} ${randomItem(last)}`;
}
function randomEmail(name: string) {
  return name.toLowerCase().replace(/ /g, '.') + Math.floor(Math.random()*1000) + '@example.com';
}
function randomPhone() {
  return '+91 ' + (9000000000 + Math.floor(Math.random() * 1000000000)).toString();
}
function randomMessage() {
  const msgs = [
    'I am interested in your products.',
    'Please contact me for more details.',
    'Looking for a partnership opportunity.',
    'Can you provide a quote for bulk order?',
    'I have a question about installation.',
    'How long does delivery take?',
    'I want to know more about your franchise.',
    'Is there support for new partners?',
    'What are the requirements to start?',
    'Please call me back at your earliest convenience.'
  ];
  return randomItem(msgs) + ' ' + Math.random().toString(36).substring(2, 15);
}

export async function POST(req: NextRequest) {
  try {
    // Franchise Applications
    for (let i = 0; i < 50; i++) {
      const name = randomName();
      await addDoc(collection(db, 'franchiseApplications'), {
        name,
        email: randomEmail(name),
        phone: randomPhone(),
        city: randomItem(cities),
        state: randomItem(states),
        message: randomMessage(),
        createdAt: Timestamp.now(),
      });
    }
    // Contact Form Submissions
    for (let i = 0; i < 50; i++) {
      const name = randomName();
      await addDoc(collection(db, 'contactFormSubmissions'), {
        name,
        email: randomEmail(name),
        phone: randomPhone(),
        subject: randomItem(subjects),
        message: randomMessage(),
        createdAt: Timestamp.now(),
      });
    }
    return NextResponse.json({ success: true, message: '50 dummy franchise and 50 dummy contact submissions created.' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create dummy data.' }, { status: 500 });
  }
} 