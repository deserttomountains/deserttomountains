/**
 * AWS SES Email Service
 * Handles sending transactional emails for various events
 */

import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { 
  sendLeadCreatedEmails, 
  sendFranchiseFormEmails, 
  sendContactFormEmails, 
  sendOrderConfirmationEmails 
} from './templates';

// Initialize SES client (lazy initialization to avoid errors if credentials not set)
let sesClient: SESClient | null = null;

function getSESClient(): SESClient {
  if (!sesClient) {
    sesClient = new SESClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }
  return sesClient;
}

// Configuration
const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@deserttomountains.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@deserttomountains.com';
const REPLY_TO_EMAIL = process.env.EMAIL_REPLY_TO || 'contact@deserttomountains.com';

/**
 * Check if email service is configured
 */
export function isEmailServiceConfigured(): boolean {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_REGION
  );
}

/**
 * Send email using AWS SES
 */
async function sendEmail(
  to: string | string[],
  subject: string,
  htmlBody: string,
  textBody?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!isEmailServiceConfigured()) {
    console.warn('Email service not configured. Skipping email send.');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const recipients = Array.isArray(to) ? to : [to];
    
    const command = new SendEmailCommand({
      Source: FROM_EMAIL,
      Destination: {
        ToAddresses: recipients,
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: htmlBody,
            Charset: 'UTF-8',
          },
          ...(textBody && {
            Text: {
              Data: textBody,
              Charset: 'UTF-8',
            },
          }),
        },
      },
      ReplyToAddresses: [REPLY_TO_EMAIL],
    });

    const client = getSESClient();
    const response = await client.send(command);
    
    return {
      success: true,
      messageId: response.MessageId,
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Email Service Class
 */
export class EmailService {
  /**
   * Send lead created emails (to user and admin)
   */
  static async sendLeadCreatedEmails(leadData: {
    name: string;
    email?: string;
    phone: string;
    source?: string;
    interest?: string;
  }): Promise<void> {
    if (!leadData.email) {
      console.log('No email provided for lead, skipping user email');
    } else {
      // Send confirmation to user
      const userEmail = sendLeadCreatedEmails.user(leadData);
      await sendEmail(
        leadData.email,
        userEmail.subject,
        userEmail.html,
        userEmail.text
      );
    }

    // Send notification to admin
    const adminEmail = sendLeadCreatedEmails.admin(leadData);
    await sendEmail(
      ADMIN_EMAIL,
      adminEmail.subject,
      adminEmail.html,
      adminEmail.text
    );
  }

  /**
   * Send franchise form submission emails
   */
  static async sendFranchiseFormEmails(formData: {
    name: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    message: string;
  }): Promise<void> {
    // Send confirmation to user
    const userEmail = sendFranchiseFormEmails.user(formData);
    await sendEmail(
      formData.email,
      userEmail.subject,
      userEmail.html,
      userEmail.text
    );

    // Send notification to admin
    const adminEmail = sendFranchiseFormEmails.admin(formData);
    await sendEmail(
      ADMIN_EMAIL,
      adminEmail.subject,
      adminEmail.html,
      adminEmail.text
    );
  }

  /**
   * Send contact form submission emails
   */
  static async sendContactFormEmails(formData: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }): Promise<void> {
    // Send confirmation to user
    const userEmail = sendContactFormEmails.user(formData);
    await sendEmail(
      formData.email,
      userEmail.subject,
      userEmail.html,
      userEmail.text
    );

    // Send notification to admin
    const adminEmail = sendContactFormEmails.admin(formData);
    await sendEmail(
      ADMIN_EMAIL,
      adminEmail.subject,
      adminEmail.html,
      adminEmail.text
    );
  }

  /**
   * Send order confirmation emails
   */
  static async sendOrderConfirmationEmails(orderData: {
    orderId: string;
    customerName: string;
    customerEmail: string;
    items: Array<{
      productName: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
    totalAmount: number;
    finalAmount: number;
    shippingAddress: any;
    orderDate: Date;
  }): Promise<void> {
    // Send confirmation to customer
    const customerEmail = sendOrderConfirmationEmails.customer(orderData);
    await sendEmail(
      orderData.customerEmail,
      customerEmail.subject,
      customerEmail.html,
      customerEmail.text
    );

    // Send notification to admin
    const adminEmail = sendOrderConfirmationEmails.admin(orderData);
    await sendEmail(
      ADMIN_EMAIL,
      adminEmail.subject,
      adminEmail.html,
      adminEmail.text
    );
  }
}

