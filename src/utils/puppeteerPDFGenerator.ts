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
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Quote - ${quote.quoteNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background: #fff;
        }
        
        .page {
          width: 210mm;
          min-height: 297mm;
          padding: 20mm;
          margin: 0 auto;
          background: white;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 3px solid #D4AF37;
        }
        
        .company-info h1 {
          font-size: 24px;
          font-weight: bold;
          color: #5E4E06;
          margin-bottom: 10px;
        }
        
        .company-details {
          font-size: 12px;
          color: #8B7A1A;
          line-height: 1.4;
        }
        
        .logo {
          width: 120px;
          height: 60px;
          object-fit: contain;
        }
        
        .quote-header {
          background: #F8F6F0;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 25px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .quote-title {
          font-size: 28px;
          font-weight: bold;
          color: #5E4E06;
          margin-bottom: 5px;
        }
        
        .quote-number {
          font-size: 14px;
          color: #8B7A1A;
          font-weight: bold;
        }
        
        .quote-info {
          text-align: right;
          font-size: 12px;
          color: #8B7A1A;
        }
        
        .valid-until {
          background: #FFF2E8;
          padding: 15px;
          border: 2px solid #FFB366;
          border-radius: 8px;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .valid-until-text {
          font-size: 14px;
          color: #D46B08;
          font-weight: bold;
        }
        
        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: #5E4E06;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 2px solid #D4AF37;
        }
        
        .customer-info {
          background: #FFFBE6;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 25px;
        }
        
        .customer-name {
          font-size: 16px;
          font-weight: bold;
          color: #5E4E06;
          margin-bottom: 8px;
        }
        
        .customer-details {
          font-size: 12px;
          color: #8B7A1A;
          margin-bottom: 5px;
        }
        
        .items-table {
          margin-bottom: 25px;
        }
        
        .table-header {
          background: #D4AF37;
          color: white;
          padding: 12px;
          border-radius: 8px 8px 0 0;
          display: grid;
          grid-template-columns: 5% 45% 15% 15% 20%;
          gap: 10px;
          font-weight: bold;
          font-size: 12px;
        }
        
        .table-row {
          display: grid;
          grid-template-columns: 5% 45% 15% 15% 20%;
          gap: 10px;
          padding: 12px;
          border-bottom: 1px solid #F5F2E8;
          align-items: center;
        }
        
        .table-row:nth-child(even) {
          background: #FFFBE6;
        }
        
        .cell-text {
          font-size: 11px;
          color: #5E4E06;
        }
        
        .cell-text-bold {
          font-size: 11px;
          color: #5E4E06;
          font-weight: bold;
        }
        
        .totals-section {
          margin-top: 20px;
          margin-bottom: 25px;
          display: flex;
          justify-content: flex-end;
        }
        
        .totals-table {
          width: 300px;
          background: #F8F6F0;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 15px;
          border-bottom: 1px solid #F5F2E8;
        }
        
        .total-row-final {
          background: #D4AF37;
          color: white;
          font-weight: bold;
          border-bottom: none;
        }
        
        .payment-section {
          background: #E6F7FF;
          padding: 20px;
          border-radius: 8px;
          border: 2px solid #91D5FF;
          margin-bottom: 25px;
        }
        
        .payment-title {
          font-size: 14px;
          font-weight: bold;
          color: #1890FF;
          margin-bottom: 15px;
          text-align: center;
        }
        
        .payment-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .payment-link {
          font-size: 12px;
          color: #1890FF;
          text-decoration: underline;
          word-break: break-all;
          max-width: 70%;
        }
        
        .qr-code {
          width: 80px;
          height: 80px;
        }
        
        .terms-section {
          margin-bottom: 20px;
        }
        
        .terms-text {
          font-size: 10px;
          color: #8B7A1A;
          line-height: 1.5;
          background: #F8F6F0;
          padding: 15px;
          border-radius: 8px;
        }
        
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 10px;
          color: #8B7A1A;
          border-top: 2px solid #F5F2E8;
          padding-top: 15px;
        }
        
        @media print {
          .page {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 20mm;
          }
        }
      </style>
    </head>
    <body>
      <div class="page">
        <!-- Header -->
        <div class="header">
          <div class="company-info">
            <h1>${companyDetails.name}</h1>
            <div class="company-details">
              <div>${companyDetails.address}</div>
              <div>Phone: ${companyDetails.phone}</div>
              <div>Email: ${companyDetails.email}</div>
              <div>GST: ${companyDetails.gst}</div>
            </div>
          </div>
          <img src="${companyDetails.logo}" alt="Company Logo" class="logo" onerror="this.style.display='none'">
        </div>

        <!-- Quote Header -->
        <div class="quote-header">
          <div>
            <div class="quote-title">QUOTATION</div>
            <div class="quote-number">${quote.quoteNumber}</div>
            ${quote.version > 1 ? `<div class="quote-number">Version: ${quote.version}</div>` : ''}
          </div>
          <div class="quote-info">
            <div>Date: ${formatDate(quote.createdAt)}</div>
            <div>Status: ${quote.status.toUpperCase()}</div>
          </div>
        </div>

        <!-- Valid Until Notice -->
        <div class="valid-until">
          <div class="valid-until-text">
            Valid Until: ${formatDate(quote.validUntil)}
          </div>
        </div>

        <!-- Customer Information -->
        <div class="customer-info">
          <div class="section-title">CUSTOMER DETAILS</div>
          <div class="customer-name">${quote.customerName}</div>
          ${quote.customerEmail ? `<div class="customer-details">Email: ${quote.customerEmail}</div>` : ''}
          ${quote.customerPhone ? `<div class="customer-details">Phone: ${quote.customerPhone}</div>` : ''}
          <div class="customer-details">Interest: ${quote.customerInterest}</div>
        </div>

        <!-- Items Table -->
        <div class="items-table">
          <div class="section-title">QUOTE ITEMS</div>
          
          <!-- Table Header -->
          <div class="table-header">
            <div>#</div>
            <div>Product & Description</div>
            <div>Quantity</div>
            <div>Unit Price</div>
            <div>Total</div>
          </div>

          <!-- Table Rows -->
          ${quote.items.map((item, index) => {
            const product = products.find(p => p.id === item.productId);
            const lineTotal = getLineTotal(item);
            
            return `
              <div class="table-row">
                <div class="cell-text">${index + 1}</div>
                <div>
                  <div class="cell-text-bold">${product?.name || 'Unknown Product'}</div>
                  <div class="cell-text">${product?.description || ''}</div>
                  <div class="cell-text">(${product?.unit || 'unit'})</div>
                </div>
                <div class="cell-text">${item.quantity}</div>
                <div class="cell-text">${formatCurrency(product?.price || 0)}</div>
                <div class="cell-text-bold">${formatCurrency(lineTotal)}</div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Totals Section -->
        <div class="totals-section">
          <div class="totals-table">
            <div class="total-row">
              <div>Subtotal:</div>
              <div>${formatCurrency(quote.subtotal)}</div>
            </div>
            
            ${quote.discount > 0 ? `
              <div class="total-row">
                <div>Discount (${quote.discountType === 'percentage' ? `${quote.discount}%` : 'Amount'}):</div>
                <div>-${formatCurrency(
                  quote.discountType === 'percentage' 
                    ? (quote.subtotal * quote.discount) / 100
                    : quote.discount
                )}</div>
              </div>
            ` : ''}
            
            <div class="total-row total-row-final">
              <div>TOTAL:</div>
              <div>${formatCurrency(quote.total)}</div>
            </div>
          </div>
        </div>

        <!-- Payment Section -->
        ${quote.paymentLink ? `
          <div class="payment-section">
            <div class="payment-title">💳 PAYMENT INFORMATION</div>
            <div class="payment-info">
              <div>
                <div class="cell-text">Pay securely online using the link below:</div>
                <div class="payment-link">${quote.paymentLink}</div>
                <div class="cell-text">Or scan the QR code →</div>
              </div>
              ${qrCodeDataUrl ? `<img src="${qrCodeDataUrl}" alt="QR Code" class="qr-code">` : ''}
            </div>
          </div>
        ` : ''}

        <!-- Terms & Conditions -->
        <div class="terms-section">
          <div class="section-title">TERMS & CONDITIONS</div>
          <div class="terms-text">
            • Payment terms: 50% advance, 50% on completion<br>
            • All prices are inclusive of GST<br>
            • This quotation is valid until ${formatDate(quote.validUntil)}<br>
            • Delivery charges may apply based on location<br>
            • Installation services available on request<br>
            • Any changes to the scope of work may affect the quoted price
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <div>Thank you for choosing ${companyDetails.name}! For any queries, contact us at ${companyDetails.email} or ${companyDetails.phone}</div>
          <div style="margin-top: 10px;">This is a computer-generated quotation and does not require a signature.</div>
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
