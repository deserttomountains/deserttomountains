/**
 * Meta Template Status Webhook Handler
 * Handles message_template_status_update webhooks from Meta
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

interface MetaWebhookEntry {
  id: string;
  time: number;
  changes: Array<{
    value: {
      message_template_id: string;
      message_template_name: string;
      message_template_status: 'PENDING' | 'APPROVED' | 'REJECTED';
      rejection_reason?: string;
      event: 'message_template_status_update';
    };
    field: string;
  }>;
}

interface MetaWebhookData {
  object: string;
  entry: MetaWebhookEntry[];
}

export async function POST(request: NextRequest) {
  try {
    const body: MetaWebhookData = await request.json();
    
    console.log('Meta template status webhook received:', JSON.stringify(body, null, 2));

    // Verify webhook signature (implement based on your security requirements)
    // const signature = request.headers.get('x-hub-signature-256');
    // if (!verifyWebhookSignature(body, signature)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    // Process each entry
    for (const entry of body.entry) {
      for (const change of entry.changes) {
        if (change.field === 'message_templates' && change.value.event === 'message_template_status_update') {
          await processTemplateStatusUpdate(change.value);
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Error processing Meta template status webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processTemplateStatusUpdate(data: {
  message_template_id: string;
  message_template_name: string;
  message_template_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejection_reason?: string;
  event: string;
}) {
  try {
    console.log('Processing template status update:', data);

    // Find the template in our database by Meta template ID
    const templatesRef = adminDb.collection('templateRequests');
    const querySnapshot = await templatesRef
      .where('metaTemplateId', '==', data.message_template_id)
      .get();

    if (querySnapshot.empty) {
      console.log(`Template not found in database: ${data.message_template_id}`);
      return;
    }

    // Update the template status
    const templateDoc = querySnapshot.docs[0];
    const updateData: any = {
      metaStatus: data.message_template_status,
      updatedAt: FieldValue.serverTimestamp()
    };

    if (data.message_template_status === 'APPROVED') {
      updateData.status = 'APPROVED';
      updateData.approvedAt = FieldValue.serverTimestamp();
    } else if (data.message_template_status === 'REJECTED') {
      updateData.status = 'REJECTED';
      updateData.metaRejectionReason = data.rejection_reason;
      updateData.rejectionReason = data.rejection_reason;
    }

    await templateDoc.ref.update(updateData);

    console.log(`Template ${data.message_template_name} status updated to ${data.message_template_status}`);

    // Create a notification or log entry for the status change
    await createTemplateStatusNotification({
      templateId: templateDoc.id,
      templateName: data.message_template_name,
      status: data.message_template_status,
      rejectionReason: data.rejection_reason,
      metaTemplateId: data.message_template_id
    });

  } catch (error) {
    console.error('Error processing template status update:', error);
    throw error;
  }
}

async function createTemplateStatusNotification(data: {
  templateId: string;
  templateName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  metaTemplateId: string;
}) {
  try {
    const notificationData = {
      type: 'template_status_update',
      templateId: data.templateId,
      templateName: data.templateName,
      status: data.status,
      rejectionReason: data.rejectionReason,
      metaTemplateId: data.metaTemplateId,
      createdAt: FieldValue.serverTimestamp(),
      read: false
    };

    await adminDb.collection('notifications').add(notificationData);
    console.log(`Notification created for template ${data.templateName} status: ${data.status}`);
  } catch (error) {
    console.error('Error creating template status notification:', error);
  }
}

// GET endpoint for webhook verification (if needed)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Verify the webhook
  if (mode === 'subscribe' && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    console.log('Webhook verified');
    return new NextResponse(challenge);
  } else {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
}
