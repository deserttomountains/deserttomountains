"use client";

import QRCode from 'qrcode';

// Types
interface Quote {
  id?: string;
  quoteNumber: string;
  version: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerInterest: string;
  items: { productId: string; quantity: number }[];
  subtotal: number;
  discount: number;
  discountType: 'percentage' | 'amount';
  shippingCharges: number;
  includeShipping: boolean;
  total: number;
  validUntil: string;
  paymentLink: string;
  status: string;
  createdAt: Date;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  description: string;
}

interface CompanyDetails {
  name: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  gst: string;
}

// Generate QR Code for payment link
export const generateQRCode = async (paymentLink: string): Promise<string> => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(paymentLink, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      width: 256,
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
};

// Generate HTML template for the quote
const generateQuoteHTML = (
  quote: Quote,
  products: Product[],
  companyDetails: CompanyDetails,
  qrCodeDataUrl: string
): string => {
  // Calculate line totals
  const getLineTotal = (item: { productId: string; quantity: number }) => {
    const product = products.find(p => p.id === item.productId);
    return item.quantity * (product?.price || 0);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Format date
  const formatDate = (date: string | Date) => {
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'N/A';
      }
      return dateObj.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      console.warn('Date formatting error:', error, 'Date value:', date);
      return 'N/A';
    }
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Quote - ${quote.quoteNumber}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.4;
          color: #1f2937;
          background: #ffffff;
          font-size: 12px;
        }
        
        .page {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          background: white;
        }
        
        /* Header Section - Full Width */
        .header {
          background: #d4af37;
          padding: 35px 50px;
          margin: 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .company-info {
          display: flex;
          align-items: center;
        }
        
        .company-details h1 {
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 2px;
        }
        
        .company-details p {
          font-size: 11px;
          color: #374151;
          margin: 0;
        }
        
        .company-contact {
          text-align: right;
          font-size: 11px;
          color: #374151;
          line-height: 1.3;
        }
        
        /* Ensure text doesn't overflow */
        .company-details, .company-contact {
          max-width: 100%;
          word-wrap: break-word;
        }
        
        /* Main Title Section */
        .main-title {
          margin-bottom: 20px;
        }
        
        .title {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 5px;
        }
        
        .created-date {
          font-size: 12px;
          color: #6b7280;
        }
        
        /* Quote Details Section - Two Columns */
        .quote-details-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        
        .quote-details {
          flex: 1;
        }
        
        .prepared-for {
          flex: 1;
          text-align: right;
        }
        
        .section-label {
          font-size: 11px;
          color: #6b7280;
          margin-bottom: 5px;
        }
        
        .section-value {
          font-size: 12px;
          color: #1f2937;
          font-weight: 500;
          margin-bottom: 3px;
        }
        
        /* Items Table - Compact */
        .items-table {
          margin-bottom: 20px;
        }
        
        .table-header {
          background: #d4af37;
          color: #1f2937;
          padding: 8px 12px;
          font-weight: 600;
          font-size: 11px;
          display: grid;
          grid-template-columns: 3fr 1fr 1fr 1fr;
          gap: 10px;
          align-items: center;
        }
        
        .table-row {
          display: grid;
          grid-template-columns: 3fr 1fr 1fr 1fr;
          gap: 10px;
          padding: 8px 12px;
          border-bottom: 1px solid #e5e7eb;
          align-items: center;
          font-size: 11px;
        }
        
        .table-row:nth-child(even) {
          background: #f9fafb;
        }
        
        .product-name {
          font-weight: 500;
          color: #1f2937;
        }
        
        .product-description {
          font-size: 10px;
          color: #6b7280;
          margin-top: 2px;
        }
        
        .text-right {
          text-align: right;
        }
        
        .text-center {
          text-align: center;
        }
        
        /* Financial Summary - Two Columns */
        .financial-section {
          display: flex;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 20px;
        }
        
        .terms-section {
          flex: 1;
        }
        
        .financial-summary {
          flex: 1;
          max-width: 250px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        /* Ensure Total row container is properly sized */
        .financial-summary .financial-row.total {
          margin-top: 8px !important;
          margin-bottom: 8px !important;
        }
        
        .terms-title {
          font-size: 12px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 8px;
        }
        
        .terms-list {
          list-style: none;
          padding: 0;
        }
        
        .terms-list li {
          font-size: 10px;
          color: #6b7280;
          margin-bottom: 4px;
          padding-left: 15px;
          position: relative;
        }
        
        .terms-list li::before {
          content: '•';
          color: #d4af37;
          position: absolute;
          left: 0;
        }
        
        .financial-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 11px;
          border-bottom: 1px solid #f3f4f6;
          align-items: center;
          min-height: 20px;
          box-sizing: border-box;
        }
        
        .financial-row:last-child {
          border-bottom: none;
        }
        
        .financial-row.total {
          background: #d4af37 !important;
          color: #1f2937 !important;
          font-weight: 700 !important;
          font-size: 12px !important;
          padding: 8px 12px !important;
          margin: 8px -12px !important;
          border-radius: 4px !important;
          border: none !important;
          line-height: 1.4 !important;
          box-sizing: border-box !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          min-height: 24px !important;
          position: relative !important;
        }
        
        /* Force vertical centering for Total row text */
        .financial-row.total > div {
          display: flex !important;
          align-items: center !important;
          height: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        
        /* Payment Section - Redesigned for QR Focus */
        .payment-section {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border: 2px solid #0ea5e9;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 16px rgba(14, 165, 233, 0.1);
        }
        
        .payment-info {
          flex: 1;
          margin-right: 20px;
        }
        
        .payment-title {
          font-size: 14px;
          font-weight: 700;
          color: #0c4a6e;
          margin-bottom: 8px;
        }
        

        
        .qr-code {
          width: 120px;
          height: 120px;
          border-radius: 12px;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          background: white;
          padding: 8px;
        }
        
        /* Footer Section */
        .footer {
          margin-top: 20px;
          text-align: center;
          font-size: 10px;
          color: #6b7280;
          border-top: 1px solid #e5e7eb;
          padding-top: 15px;
        }
        
        /* Responsive Design */
        @media print {
          .page {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 15mm;
          }
        }
        

      </style>
    </head>
    <body>
      <div class="page">
        <!-- Header -->
        <div class="header">
          <div class="company-info">
            <div class="company-details">
              <h1>${companyDetails.name}</h1>
            </div>
          </div>
          <div class="company-contact">
            <div>${companyDetails.address}</div>
            <div>Phone: ${companyDetails.phone}</div>
            <div>Email: ${companyDetails.email}</div>
            <div>GST: ${companyDetails.gst}</div>
          </div>
        </div>

        <!-- Main Title -->
        <div class="main-title" style="padding: 0 15mm;">
          <div class="title">Sales Quote</div>
          <div class="created-date">Created Date: ${formatDate(quote.createdAt)}</div>
        </div>

                         <!-- Quote Details Section -->
        <div class="quote-details-section" style="padding: 0 15mm;">
           <div class="quote-details">
             <div class="section-label">Quote No.:</div>
             <div class="section-value">${quote.quoteNumber}</div>
             ${quote.version > 1 ? `<div class="section-value">Version: ${quote.version}</div>` : ''}
             <div class="section-label">Exp. Date:</div>
             <div class="section-value">${formatDate(quote.validUntil)}</div>
           </div>
          <div class="prepared-for">
            <div class="section-label">Prepared for:</div>
            <div class="section-value">${quote.customerName}</div>
            ${quote.customerEmail ? `<div class="section-value">${quote.customerEmail}</div>` : ''}
            ${quote.customerPhone ? `<div class="section-value">${quote.customerPhone}</div>` : ''}
            <div class="section-value">Interest: ${quote.customerInterest}</div>
          </div>
        </div>

        <!-- Items Table -->
        <div class="items-table" style="padding: 0 15mm;">
          <div class="table-header">
            <div>Product Name</div>
            <div class="text-right">Price</div>
            <div class="text-center">QTY</div>
            <div class="text-right">Amount</div>
          </div>
          
          ${quote.items.map((item, index) => {
            const product = products.find(p => p.id === item.productId);
            const lineTotal = getLineTotal(item);
            
            return `
              <div class="table-row">
                <div>
                  <div class="product-name">${product?.name || 'Unknown Product'}</div>
                  <div class="product-description">${product?.description || ''} (${product?.unit || 'unit'})</div>
                </div>
                <div class="text-right">${formatCurrency(product?.price || 0)}</div>
                <div class="text-center">${item.quantity}</div>
                <div class="text-right">${formatCurrency(lineTotal)}</div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Financial Summary Section -->
        <div class="financial-section" style="padding: 0 15mm;">
          <div class="terms-section">
            <div class="terms-title">This quotation is subject to the following terms and conditions:</div>
                         <ul class="terms-list">
               <li>100% advance payment required</li>
               <li>All prices quoted are inclusive of GST (Goods and Services Tax)</li>
               <li>This quotation remains valid until ${formatDate(quote.validUntil)}</li>
               ${quote.includeShipping ? 
                 '<li>Shipping charges of ' + formatCurrency(quote.shippingCharges) + ' are included in the total</li>' : 
                 '<li>Shipping charges are not included in this quotation</li>'
               }

               <li>Professional installation services available upon request at additional cost</li>
               <li>Any modifications to the project scope may affect the quoted price</li>
               <li>Materials used are eco-friendly and sustainable as per company standards</li>
             </ul>
          </div>
          
                     <div class="financial-summary">
             <div class="financial-row">
               <div>Subtotal:</div>
               <div>${formatCurrency(quote.subtotal)}</div>
             </div>
             
             ${quote.discount > 0 ? `
               <div class="financial-row">
                 <div>Discount (${quote.discountType === 'percentage' ? `${quote.discount}%` : 'Amount'}):</div>
                 <div>-${formatCurrency(
                   quote.discountType === 'percentage' 
                     ? (quote.subtotal * quote.discount) / 100
                     : quote.discount
                 )}</div>
               </div>
             ` : ''}
             ${quote.includeShipping ? `
               <div class="financial-row">
                 <div>Shipping Charges:</div>
                 <div>${formatCurrency(quote.shippingCharges)}</div>
               </div>
             ` : `
               <div class="financial-row">
                 <div>Shipping Charges:</div>
                 <div style="color: #9ca3af; font-style: italic;">Not included</div>
               </div>
             `}
             
             <div class="financial-row total">
               <div>Total:</div>
               <div>${formatCurrency(quote.total)}</div>
             </div>
           </div>
        </div>

        <!-- Payment Section -->
        ${quote.paymentLink ? `
          <div class="payment-section" style="margin: 0 15mm 20px 15mm;">
            <div class="payment-info">
                             <div class="payment-title">💳 Payment Information</div>
               <div style="font-size: 11px; color: #0c4a6e; font-weight: 600; margin-bottom: 12px;">Scan QR code to access payment page</div>
            </div>
            ${qrCodeDataUrl ? `<img src="${qrCodeDataUrl}" alt="QR Code" class="qr-code">` : ''}
          </div>
        ` : ''}

        <!-- Footer -->
        <div class="footer" style="padding: 0 15mm;">
          <div style="margin-bottom: 8px; font-weight: 500; color: #5e4e06;">Thank you for choosing ${companyDetails.name}!</div>
          <div style="margin-bottom: 5px;">For any queries, contact us at ${companyDetails.email} or ${companyDetails.phone}</div>
          <div style="font-style: italic; color: #9ca3af;">This is a computer-generated quotation and does not require a signature.</div>
        </div>
      </div>
    </body>
    </html>
  `;
};



// Generate PDF using Puppeteer (server-side) with client-side fallback
export const generateQuotePDF = async (
  quote: Quote,
  products: Product[],
  companyDetails: CompanyDetails
): Promise<Blob> => {
  try {
    // Validate required data
    if (!quote || !products || !companyDetails) {
      throw new Error('Missing required data for PDF generation');
    }

    // Ensure quote has required fields
    if (!quote.customerName || !quote.items || quote.items.length === 0) {
      throw new Error('Quote missing required customer or item information');
    }

    // Generate QR code if payment link exists
    let qrCodeDataUrl = '';
    if (quote.paymentLink) {
      try {
        qrCodeDataUrl = await generateQRCode(quote.paymentLink);
      } catch (qrError) {
        console.warn('Failed to generate QR code, continuing without it:', qrError);
        qrCodeDataUrl = '';
      }
    }

    // Generate HTML template
    const htmlContent = generateQuoteHTML(quote, products, companyDetails, qrCodeDataUrl);
    
    // Try server-side Puppeteer first
    try {
      console.log('Attempting server-side PDF generation...');
      
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          htmlContent,
          filename: `${quote.quoteNumber}-${quote.customerName.replace(/\s+/g, '-')}.pdf`
        }),
      });

      if (response.ok) {
        console.log('Server-side PDF generation successful');
        return await response.blob();
      } else {
        console.warn('Server-side PDF generation failed, falling back to client-side');
        throw new Error('Server-side generation failed');
      }
    } catch (serverError) {
      console.warn('Server-side PDF generation failed, using client-side fallback:', serverError);
      
      // Fallback to client-side jsPDF solution
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
      
      // Create a temporary div to render the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      document.body.appendChild(tempDiv);
      
      try {
        // Convert HTML to canvas
        const canvas = await html2canvas(tempDiv, {
          useCORS: true,
          allowTaint: true,
          width: 794, // A4 width in pixels at 96 DPI
          height: 1123, // A4 height in pixels at 96 DPI
        });
        
        // Create PDF
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');
        
        // Calculate dimensions
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add image to PDF
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        
        // Clean up
        document.body.removeChild(tempDiv);
        
        return pdf.output('blob');
      } catch (canvasError) {
        console.warn('Canvas conversion failed, using simple PDF:', canvasError);
        
        // Fallback to simple text-based PDF
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // Add basic content
        pdf.setFontSize(20);
        pdf.text('QUOTATION', 105, 30, { align: 'center' });
        
        pdf.setFontSize(12);
        pdf.text(`Quote Number: ${quote.quoteNumber}`, 20, 50);
        pdf.text(`Customer: ${quote.customerName}`, 20, 60);
        pdf.text(`Total: ₹${quote.total.toLocaleString()}`, 20, 70);
        pdf.text(`Status: ${quote.status}`, 20, 80);
        
        // Clean up
        document.body.removeChild(tempDiv);
        
        return pdf.output('blob');
      }
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

// Download PDF file
export const downloadQuotePDF = async (
  quote: Quote,
  products: Product[],
  companyDetails: CompanyDetails
): Promise<void> => {
  try {
    const pdfBlob = await generateQuotePDF(quote, products, companyDetails);
    
    // Create download link
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${quote.quoteNumber}-${quote.customerName.replace(/\s+/g, '-')}.pdf`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw new Error('Failed to download PDF');
  }
};

// Preview PDF in new tab
export const previewQuotePDF = async (
  quote: Quote,
  products: Product[],
  companyDetails: CompanyDetails
): Promise<void> => {
  try {
    const pdfBlob = await generateQuotePDF(quote, products, companyDetails);
    
    // Create blob URL and open in new tab
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');
    
    // Clean up after a delay
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  } catch (error) {
    console.error('Error previewing PDF:', error);
    throw new Error('Failed to preview PDF');
  }
};

export default {
  generateQRCode,
  generateQuotePDF,
  downloadQuotePDF,
  previewQuotePDF,
};
