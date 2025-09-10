/**
 * Script to create test data for the messaging system
 * Run with: node scripts/create-test-data.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    // Use default credentials in development
  });
}

const db = admin.firestore();

async function createTestData() {
  try {
    console.log('Creating test data...');

    // Create test customers
    const customer1 = await db.collection('customers').add({
      name: 'John Doe',
      phone: '+1234567890',
      email: 'john@example.com',
      channels: ['whatsapp'],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const customer2 = await db.collection('customers').add({
      name: 'Jane Smith',
      phone: '+0987654321',
      email: 'jane@example.com',
      channels: ['instagram'],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('Created customers:', customer1.id, customer2.id);

    // Create test threads
    const thread1 = await db.collection('threads').add({
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

    const thread2 = await db.collection('threads').add({
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
    await db.collection('threads').doc(thread1.id).collection('messages').add({
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

    await db.collection('threads').doc(thread1.id).collection('messages').add({
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
    await db.collection('threads').doc(thread2.id).collection('messages').add({
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

    console.log('Created test messages');
    console.log('Test data created successfully!');
    console.log('You can now refresh the Messages page to see the test threads.');

  } catch (error) {
    console.error('Error creating test data:', error);
  }
}

createTestData();
