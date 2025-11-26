/**
 * Email Templates
 * HTML and text templates for transactional emails
 */

const BASE_STYLES = `
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #5E4E06 0%, #D4AF37 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #D4AF37; color: #5E4E06; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .info-box { background: white; padding: 15px; border-left: 4px solid #D4AF37; margin: 15px 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    table td { padding: 10px; border-bottom: 1px solid #eee; }
    table td:first-child { font-weight: bold; color: #5E4E06; }
  </style>
`;

const HEADER_HTML = `
  <div class="header">
    <h1>Desert to Mountains</h1>
    <p>Natural Wall Plaster Solutions</p>
  </div>
`;

const FOOTER_HTML = `
  <div class="footer">
    <p>Desert to Mountains | Natural Wall Plaster Solutions</p>
    <p>Email: contact@deserttomountains.com | Phone: +91 81711 89456</p>
    <p>149, Shikargarh, Jodhpur, Rajasthan</p>
  </div>
`;

/**
 * Lead Created Email Templates
 */
export const sendLeadCreatedEmails = {
  user: (leadData: {
    name: string;
    email?: string;
    phone: string;
    source?: string;
    interest?: string;
  }) => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        ${BASE_STYLES}
      </head>
      <body>
        <div class="container">
          ${HEADER_HTML}
          <div class="content">
            <h2>Thank You for Your Interest!</h2>
            <p>Dear ${leadData.name},</p>
            <p>Thank you for expressing interest in our natural wall plaster solutions. We have received your inquiry and our team will get back to you shortly.</p>
            
            <div class="info-box">
              <h3>Your Inquiry Details:</h3>
              <table>
                <tr><td>Name:</td><td>${leadData.name}</td></tr>
                ${leadData.email ? `<tr><td>Email:</td><td>${leadData.email}</td></tr>` : ''}
                <tr><td>Phone:</td><td>${leadData.phone}</td></tr>
                ${leadData.interest ? `<tr><td>Interest:</td><td>${leadData.interest}</td></tr>` : ''}
                ${leadData.source ? `<tr><td>Source:</td><td>${leadData.source}</td></tr>` : ''}
              </table>
            </div>
            
            <p>We typically respond within 24 hours. If you have any urgent questions, please feel free to contact us directly.</p>
            <p>Best regards,<br>The Desert to Mountains Team</p>
          </div>
          ${FOOTER_HTML}
        </div>
      </body>
      </html>
    `;

    const text = `
Thank You for Your Interest!

Dear ${leadData.name},

Thank you for expressing interest in our natural wall plaster solutions. We have received your inquiry and our team will get back to you shortly.

Your Inquiry Details:
Name: ${leadData.name}
${leadData.email ? `Email: ${leadData.email}\n` : ''}Phone: ${leadData.phone}
${leadData.interest ? `Interest: ${leadData.interest}\n` : ''}${leadData.source ? `Source: ${leadData.source}\n` : ''}

We typically respond within 24 hours. If you have any urgent questions, please feel free to contact us directly.

Best regards,
The Desert to Mountains Team

---
Desert to Mountains | Natural Wall Plaster Solutions
Email: contact@deserttomountains.com | Phone: +91 81711 89456
149, Shikargarh, Jodhpur, Rajasthan
    `;

    return {
      subject: 'Thank You for Your Interest - Desert to Mountains',
      html,
      text,
    };
  },

  admin: (leadData: {
    name: string;
    email?: string;
    phone: string;
    source?: string;
    interest?: string;
  }) => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        ${BASE_STYLES}
      </head>
      <body>
        <div class="container">
          ${HEADER_HTML}
          <div class="content">
            <h2>New Lead Created</h2>
            <p>A new lead has been created in the system.</p>
            
            <div class="info-box">
              <h3>Lead Details:</h3>
              <table>
                <tr><td>Name:</td><td>${leadData.name}</td></tr>
                ${leadData.email ? `<tr><td>Email:</td><td>${leadData.email}</td></tr>` : ''}
                <tr><td>Phone:</td><td>${leadData.phone}</td></tr>
                ${leadData.interest ? `<tr><td>Interest:</td><td>${leadData.interest}</td></tr>` : ''}
                ${leadData.source ? `<tr><td>Source:</td><td>${leadData.source}</td></tr>` : ''}
                <tr><td>Date:</td><td>${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td></tr>
              </table>
            </div>
            
            <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://deserttomountains.com'}/admin/leads" class="button">View Lead in Dashboard</a></p>
          </div>
          ${FOOTER_HTML}
        </div>
      </body>
      </html>
    `;

    const text = `
New Lead Created

A new lead has been created in the system.

Lead Details:
Name: ${leadData.name}
${leadData.email ? `Email: ${leadData.email}\n` : ''}Phone: ${leadData.phone}
${leadData.interest ? `Interest: ${leadData.interest}\n` : ''}${leadData.source ? `Source: ${leadData.source}\n` : ''}Date: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

View Lead: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://deserttomountains.com'}/admin/leads
    `;

    return {
      subject: `New Lead: ${leadData.name} - Desert to Mountains`,
      html,
      text,
    };
  },
};

/**
 * Franchise Form Email Templates
 */
export const sendFranchiseFormEmails = {
  user: (formData: {
    name: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    message: string;
  }) => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        ${BASE_STYLES}
      </head>
      <body>
        <div class="container">
          ${HEADER_HTML}
          <div class="content">
            <h2>Franchise Application Received</h2>
            <p>Dear ${formData.name},</p>
            <p>Thank you for your interest in becoming a franchise partner with Desert to Mountains. We have received your application and our team will review it carefully.</p>
            
            <div class="info-box">
              <h3>Your Application Details:</h3>
              <table>
                <tr><td>Name:</td><td>${formData.name}</td></tr>
                <tr><td>Email:</td><td>${formData.email}</td></tr>
                <tr><td>Phone:</td><td>${formData.phone}</td></tr>
                <tr><td>Location:</td><td>${formData.city}, ${formData.state}</td></tr>
                <tr><td>Message:</td><td>${formData.message}</td></tr>
              </table>
            </div>
            
            <p>We will get back to you within 24-48 hours with next steps. If you have any questions in the meantime, please don't hesitate to contact us.</p>
            <p>Best regards,<br>The Desert to Mountains Team</p>
          </div>
          ${FOOTER_HTML}
        </div>
      </body>
      </html>
    `;

    const text = `
Franchise Application Received

Dear ${formData.name},

Thank you for your interest in becoming a franchise partner with Desert to Mountains. We have received your application and our team will review it carefully.

Your Application Details:
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Location: ${formData.city}, ${formData.state}
Message: ${formData.message}

We will get back to you within 24-48 hours with next steps. If you have any questions in the meantime, please don't hesitate to contact us.

Best regards,
The Desert to Mountains Team

---
Desert to Mountains | Natural Wall Plaster Solutions
Email: contact@deserttomountains.com | Phone: +91 81711 89456
149, Shikargarh, Jodhpur, Rajasthan
    `;

    return {
      subject: 'Franchise Application Received - Desert to Mountains',
      html,
      text,
    };
  },

  admin: (formData: {
    name: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    message: string;
  }) => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        ${BASE_STYLES}
      </head>
      <body>
        <div class="container">
          ${HEADER_HTML}
          <div class="content">
            <h2>New Franchise Application</h2>
            <p>A new franchise application has been submitted.</p>
            
            <div class="info-box">
              <h3>Application Details:</h3>
              <table>
                <tr><td>Name:</td><td>${formData.name}</td></tr>
                <tr><td>Email:</td><td>${formData.email}</td></tr>
                <tr><td>Phone:</td><td>${formData.phone}</td></tr>
                <tr><td>Location:</td><td>${formData.city}, ${formData.state}</td></tr>
                <tr><td>Message:</td><td>${formData.message}</td></tr>
                <tr><td>Date:</td><td>${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td></tr>
              </table>
            </div>
            
            <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://deserttomountains.com'}/admin/form-submissions" class="button">View Application in Dashboard</a></p>
          </div>
          ${FOOTER_HTML}
        </div>
      </body>
      </html>
    `;

    const text = `
New Franchise Application

A new franchise application has been submitted.

Application Details:
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Location: ${formData.city}, ${formData.state}
Message: ${formData.message}
Date: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

View Application: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://deserttomountains.com'}/admin/form-submissions
    `;

    return {
      subject: `New Franchise Application: ${formData.name} from ${formData.city}, ${formData.state}`,
      html,
      text,
    };
  },
};

/**
 * Contact Form Email Templates
 */
export const sendContactFormEmails = {
  user: (formData: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }) => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        ${BASE_STYLES}
      </head>
      <body>
        <div class="container">
          ${HEADER_HTML}
          <div class="content">
            <h2>Thank You for Contacting Us</h2>
            <p>Dear ${formData.name},</p>
            <p>Thank you for reaching out to Desert to Mountains. We have received your message and will respond as soon as possible.</p>
            
            <div class="info-box">
              <h3>Your Message:</h3>
              <table>
                <tr><td>Subject:</td><td>${formData.subject}</td></tr>
                <tr><td>Message:</td><td>${formData.message}</td></tr>
              </table>
            </div>
            
            <p>We typically respond within 24 hours. For urgent matters, please call us at +91 81711 89456.</p>
            <p>Best regards,<br>The Desert to Mountains Team</p>
          </div>
          ${FOOTER_HTML}
        </div>
      </body>
      </html>
    `;

    const text = `
Thank You for Contacting Us

Dear ${formData.name},

Thank you for reaching out to Desert to Mountains. We have received your message and will respond as soon as possible.

Your Message:
Subject: ${formData.subject}
Message: ${formData.message}

We typically respond within 24 hours. For urgent matters, please call us at +91 81711 89456.

Best regards,
The Desert to Mountains Team

---
Desert to Mountains | Natural Wall Plaster Solutions
Email: contact@deserttomountains.com | Phone: +91 81711 89456
149, Shikargarh, Jodhpur, Rajasthan
    `;

    return {
      subject: 'Thank You for Contacting Us - Desert to Mountains',
      html,
      text,
    };
  },

  admin: (formData: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }) => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        ${BASE_STYLES}
      </head>
      <body>
        <div class="container">
          ${HEADER_HTML}
          <div class="content">
            <h2>New Contact Form Submission</h2>
            <p>A new contact form has been submitted.</p>
            
            <div class="info-box">
              <h3>Contact Details:</h3>
              <table>
                <tr><td>Name:</td><td>${formData.name}</td></tr>
                <tr><td>Email:</td><td>${formData.email}</td></tr>
                ${formData.phone ? `<tr><td>Phone:</td><td>${formData.phone}</td></tr>` : ''}
                <tr><td>Subject:</td><td>${formData.subject}</td></tr>
                <tr><td>Message:</td><td>${formData.message}</td></tr>
                <tr><td>Date:</td><td>${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td></tr>
              </table>
            </div>
            
            <p><a href="mailto:${formData.email}" class="button">Reply to ${formData.name}</a></p>
            <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://deserttomountains.com'}/admin/form-submissions" class="button">View in Dashboard</a></p>
          </div>
          ${FOOTER_HTML}
        </div>
      </body>
      </html>
    `;

    const text = `
New Contact Form Submission

A new contact form has been submitted.

Contact Details:
Name: ${formData.name}
Email: ${formData.email}
${formData.phone ? `Phone: ${formData.phone}\n` : ''}Subject: ${formData.subject}
Message: ${formData.message}
Date: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

Reply to: ${formData.email}
View in Dashboard: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://deserttomountains.com'}/admin/form-submissions
    `;

    return {
      subject: `New Contact Form: ${formData.subject} - ${formData.name}`,
      html,
      text,
    };
  },
};

/**
 * Order Confirmation Email Templates
 */
export const sendOrderConfirmationEmails = {
  customer: (orderData: {
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
  }) => {
    const itemsHtml = orderData.items.map(item => `
      <tr>
        <td>${item.productName}</td>
        <td>${item.quantity}</td>
        <td>₹${item.unitPrice.toLocaleString('en-IN')}</td>
        <td>₹${item.totalPrice.toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        ${BASE_STYLES}
      </head>
      <body>
        <div class="container">
          ${HEADER_HTML}
          <div class="content">
            <h2>Order Confirmation</h2>
            <p>Dear ${orderData.customerName},</p>
            <p>Thank you for your order! We have received your order and it is being processed.</p>
            
            <div class="info-box">
              <h3>Order Details:</h3>
              <table>
                <tr><td>Order ID:</td><td><strong>${orderData.orderId}</strong></td></tr>
                <tr><td>Order Date:</td><td>${orderData.orderDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td></tr>
              </table>
            </div>
            
            <div class="info-box">
              <h3>Order Items:</h3>
              <table>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
                ${itemsHtml}
              </table>
              <table>
                <tr><td>Subtotal:</td><td>₹${orderData.totalAmount.toLocaleString('en-IN')}</td></tr>
                <tr><td><strong>Total Amount:</strong></td><td><strong>₹${orderData.finalAmount.toLocaleString('en-IN')}</strong></td></tr>
              </table>
            </div>
            
            ${orderData.shippingAddress ? `
            <div class="info-box">
              <h3>Shipping Address:</h3>
              <p>
                ${orderData.shippingAddress.name || ''}<br>
                ${orderData.shippingAddress.address || ''}<br>
                ${orderData.shippingAddress.city || ''}, ${orderData.shippingAddress.state || ''} ${orderData.shippingAddress.pincode || ''}<br>
                ${orderData.shippingAddress.phone ? `Phone: ${orderData.shippingAddress.phone}` : ''}
              </p>
            </div>
            ` : ''}
            
            <p>We will send you a tracking number once your order ships. If you have any questions, please contact us.</p>
            <p>Best regards,<br>The Desert to Mountains Team</p>
          </div>
          ${FOOTER_HTML}
        </div>
      </body>
      </html>
    `;

    const itemsText = orderData.items.map(item => 
      `${item.productName} x ${item.quantity} = ₹${item.totalPrice.toLocaleString('en-IN')}`
    ).join('\n');

    const text = `
Order Confirmation

Dear ${orderData.customerName},

Thank you for your order! We have received your order and it is being processed.

Order Details:
Order ID: ${orderData.orderId}
Order Date: ${orderData.orderDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

Order Items:
${itemsText}

Subtotal: ₹${orderData.totalAmount.toLocaleString('en-IN')}
Total Amount: ₹${orderData.finalAmount.toLocaleString('en-IN')}

${orderData.shippingAddress ? `
Shipping Address:
${orderData.shippingAddress.name || ''}
${orderData.shippingAddress.address || ''}
${orderData.shippingAddress.city || ''}, ${orderData.shippingAddress.state || ''} ${orderData.shippingAddress.pincode || ''}
${orderData.shippingAddress.phone ? `Phone: ${orderData.shippingAddress.phone}` : ''}
` : ''}

We will send you a tracking number once your order ships. If you have any questions, please contact us.

Best regards,
The Desert to Mountains Team

---
Desert to Mountains | Natural Wall Plaster Solutions
Email: contact@deserttomountains.com | Phone: +91 81711 89456
149, Shikargarh, Jodhpur, Rajasthan
    `;

    return {
      subject: `Order Confirmation - ${orderData.orderId} - Desert to Mountains`,
      html,
      text,
    };
  },

  admin: (orderData: {
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
  }) => {
    const itemsHtml = orderData.items.map(item => `
      <tr>
        <td>${item.productName}</td>
        <td>${item.quantity}</td>
        <td>₹${item.unitPrice.toLocaleString('en-IN')}</td>
        <td>₹${item.totalPrice.toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        ${BASE_STYLES}
      </head>
      <body>
        <div class="container">
          ${HEADER_HTML}
          <div class="content">
            <h2>New Order Received</h2>
            <p>A new order has been placed.</p>
            
            <div class="info-box">
              <h3>Order Details:</h3>
              <table>
                <tr><td>Order ID:</td><td><strong>${orderData.orderId}</strong></td></tr>
                <tr><td>Customer:</td><td>${orderData.customerName}</td></tr>
                <tr><td>Email:</td><td>${orderData.customerEmail}</td></tr>
                <tr><td>Order Date:</td><td>${orderData.orderDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td></tr>
                <tr><td>Total Amount:</td><td><strong>₹${orderData.finalAmount.toLocaleString('en-IN')}</strong></td></tr>
              </table>
            </div>
            
            <div class="info-box">
              <h3>Order Items:</h3>
              <table>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
                ${itemsHtml}
              </table>
            </div>
            
            ${orderData.shippingAddress ? `
            <div class="info-box">
              <h3>Shipping Address:</h3>
              <p>
                ${orderData.shippingAddress.name || ''}<br>
                ${orderData.shippingAddress.address || ''}<br>
                ${orderData.shippingAddress.city || ''}, ${orderData.shippingAddress.state || ''} ${orderData.shippingAddress.pincode || ''}<br>
                ${orderData.shippingAddress.phone ? `Phone: ${orderData.shippingAddress.phone}` : ''}
              </p>
            </div>
            ` : ''}
            
            <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://deserttomountains.com'}/admin/sales" class="button">View Order in Dashboard</a></p>
          </div>
          ${FOOTER_HTML}
        </div>
      </body>
      </html>
    `;

    const itemsText = orderData.items.map(item => 
      `${item.productName} x ${item.quantity} = ₹${item.totalPrice.toLocaleString('en-IN')}`
    ).join('\n');

    const text = `
New Order Received

A new order has been placed.

Order Details:
Order ID: ${orderData.orderId}
Customer: ${orderData.customerName}
Email: ${orderData.customerEmail}
Order Date: ${orderData.orderDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
Total Amount: ₹${orderData.finalAmount.toLocaleString('en-IN')}

Order Items:
${itemsText}

${orderData.shippingAddress ? `
Shipping Address:
${orderData.shippingAddress.name || ''}
${orderData.shippingAddress.address || ''}
${orderData.shippingAddress.city || ''}, ${orderData.shippingAddress.state || ''} ${orderData.shippingAddress.pincode || ''}
${orderData.shippingAddress.phone ? `Phone: ${orderData.shippingAddress.phone}` : ''}
` : ''}

View Order: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://deserttomountains.com'}/admin/sales
    `;

    return {
      subject: `New Order: ${orderData.orderId} - ₹${orderData.finalAmount.toLocaleString('en-IN')}`,
      html,
      text,
    };
  },
};


