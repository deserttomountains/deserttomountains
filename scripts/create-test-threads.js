/**
 * Script to create test threads for the messaging system
 * This uses the Firebase client directly to create test data
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration (using the same config as your app)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'demo-app-id'
};

async function createTestData() {
  try {
    console.log('Initializing Firebase...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('Creating test customers...');
    
    // Create test customers
    const customer1 = await addDoc(collection(db, 'customers'), {
      name: 'John Doe',
      phone: '+1234567890',
      email: 'john@example.com',
      channels: ['whatsapp'],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const customer2 = await addDoc(collection(db, 'customers'), {
      name: 'Jane Smith',
      phone: '+0987654321',
      email: 'jane@example.com',
      channels: ['instagram'],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('Created customers:', customer1.id, customer2.id);

    // Create test threads
    console.log('Creating test threads...');
    
    const thread1 = await addDoc(collection(db, 'threads'), {
      customerId: customer1.id,
      channels: ['whatsapp'],
      status: 'open',
      priority: 'medium',
      assignee: null,
      unreadCount: 2,
      lastMessageAt: new Date(),
      lastInboundAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const thread2 = await addDoc(collection(db, 'threads'), {
      customerId: customer2.id,
      channels: ['instagram'],
      status: 'pending',
      priority: 'high',
      assignee: null,
      unreadCount: 1,
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      lastInboundAt: new Date(Date.now() - 1000 * 60 * 15),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('Created threads:', thread1.id, thread2.id);

    // Create test messages for thread1
    console.log('Creating test messages...');
    
    await addDoc(collection(db, 'threads', thread1.id, 'messages'), {
      threadId: thread1.id,
      dir: 'in',
      channel: 'whatsapp',
      body: {
        text: 'Hello, I need help with my order',
        attachments: []
      },
      sentAt: new Date(Date.now() - 1000 * 60 * 30),
      createdAt: new Date()
    });

    await addDoc(collection(db, 'threads', thread1.id, 'messages'), {
      threadId: thread1.id,
      dir: 'out',
      channel: 'whatsapp',
      body: {
        text: 'Hi John! I can help you with that. What\'s your order number?',
        attachments: []
      },
      sentAt: new Date(Date.now() - 1000 * 60 * 25),
      createdAt: new Date()
    });

    // Create test messages for thread2
    await addDoc(collection(db, 'threads', thread2.id, 'messages'), {
      threadId: thread2.id,
      dir: 'in',
      channel: 'instagram',
      body: {
        text: 'I love your products! Do you have any discounts?',
        attachments: []
      },
      sentAt: new Date(Date.now() - 1000 * 60 * 15),
      createdAt: new Date()
    });

    console.log('✅ Test data created successfully!');
    console.log('📱 You can now refresh the Messages page to see the test threads.');
    console.log('🔗 Thread 1 (WhatsApp):', thread1.id);
    console.log('🔗 Thread 2 (Instagram):', thread2.id);

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  }
}

createTestData();
