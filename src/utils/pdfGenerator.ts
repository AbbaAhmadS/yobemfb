import { supabase } from '@/integrations/supabase/client';

interface ApplicationData {
  application_id: string;
  full_name: string;
  phone_number: string;
  address: string;
  employee_id: string;
  ministry_department: string;
  bvn: string;
  nin: string;
  product_type: string;
  loan_amount_range: string;
  specific_amount: number;
  repayment_period_months: number;
  bank_name: string;
  bank_account_number: string;
  application_type: string;
  status: string;
  created_at: string;
  passport_photo_url?: string;
  notes?: string;
  terms_accepted?: boolean;
  approved_amount?: number | null;
  decline_reason?: string | null;
}

interface GuarantorData {
  full_name: string;
  phone_number: string;
  address: string;
  organization: string;
  position: string;
  employee_id: string;
  bvn: string;
  salary: number;
  allowances?: number;
  other_income?: number;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(amount);
}

function getSolarProductName(productType: string): string {
  const products: Record<string, string> = {
    'short_term': 'Cola Solar 1000 Pro (1kWh) - ₦630,000',
    'long_term': 'Cola Solar 2000 (2kWh) - ₦1,232,000'
  };
  return products[productType] || productType;
}

function getAccountType(type: string): string {
  const types: Record<string, string> = {
    'savings': 'Savings Account',
    'current': 'Current Account',
    'corporate': 'Corporate Account'
  };
  return types[type] || type;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'pending': 'Pending',
    'under_review': 'Under Review',
    'approved': 'Approved',
    'declined': 'Declined',
    'flagged': 'Flagged'
  };
  return labels[status] || status;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'pending': '#f59e0b',
    'under_review': '#3b82f6',
    'approved': '#10b981',
    'declined': '#ef4444',
    'flagged': '#f97316'
  };
  return colors[status] || '#6b7280';
}

export async function generateApplicationPDF(
  application: ApplicationData, 
  guarantors: GuarantorData[],
  passportDataUrl?: string
): Promise<Blob> {
  // Create HTML content for PDF - User version with approved amount and decline reason
  // Logo as base64 placeholder - will be replaced with actual logo data
  const logoBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCABkAGQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9U6KKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP/2Q==';
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Solar Loan Application - ${application.application_id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.5; padding: 40px; }
    .letterhead { display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 3px solid #1a5d2e; }
    .letterhead-logo { height: 70px; width: auto; }
    .letterhead-info { text-align: center; }
    .letterhead-info h1 { color: #1a5d2e; font-size: 22px; margin-bottom: 3px; text-transform: uppercase; letter-spacing: 1px; }
    .letterhead-info p { color: #666; font-size: 11px; margin: 2px 0; }
    .letterhead-contact { display: flex; justify-content: center; gap: 20px; margin-top: 5px; font-size: 10px; color: #444; }
    .header { text-align: center; margin-bottom: 25px; }
    .header h2 { color: #1a5d2e; font-size: 18px; font-weight: bold; text-decoration: underline; margin-top: 10px; }
    .passport-section { float: right; margin-left: 20px; }
    .passport-photo { width: 120px; height: 150px; border: 2px solid #1a5d2e; object-fit: cover; border-radius: 8px; }
    .section { margin-bottom: 25px; clear: both; }
    .section-title { background: #1a5d2e; color: white; padding: 8px 12px; font-size: 14px; font-weight: bold; margin-bottom: 15px; }
    .row { display: flex; margin-bottom: 8px; }
    .label { width: 180px; color: #666; }
    .value { flex: 1; font-weight: 500; }
    .two-column { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .guarantor { background: #f5f5f5; padding: 15px; margin-bottom: 10px; border-radius: 4px; }
    .guarantor-title { font-weight: bold; margin-bottom: 10px; color: #1a5d2e; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-weight: bold; color: white; }
    .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #666; border-top: 2px solid #1a5d2e; padding-top: 15px; }
    .footer-logo { height: 30px; margin-bottom: 5px; }
    .approved-amount { background: #d1fae5; border: 2px solid #10b981; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: center; }
    .approved-amount-label { color: #047857; font-size: 14px; margin-bottom: 5px; }
    .approved-amount-value { color: #047857; font-size: 24px; font-weight: bold; }
    .decline-reason { background: #fee2e2; border: 2px solid #ef4444; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .decline-reason-label { color: #b91c1c; font-size: 14px; font-weight: bold; margin-bottom: 5px; }
    .decline-reason-text { color: #b91c1c; font-size: 12px; }
    .sms-notice { background: #dbeafe; border: 1px solid #3b82f6; padding: 12px; border-radius: 8px; margin: 15px 0; }
    .sms-notice-text { color: #1e40af; font-size: 11px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <!-- Professional Letterhead -->
  <div class="letterhead">
    <div class="letterhead-info">
      <h1>Yobe Microfinance Bank Limited</h1>
      <p>Licensed by Central Bank of Nigeria</p>
      <div class="letterhead-contact">
        <span>📍 Yobe State, Nigeria</span>
        <span>📞 08142576613</span>
      </div>
    </div>
  </div>

  <div class="header">
    ${passportDataUrl ? `<div class="passport-section"><img src="${passportDataUrl}" class="passport-photo" alt="Passport Photo" /></div>` : ''}
    <h2>SOLAR LOAN APPLICATION FORM</h2>
  </div>

  <div class="section">
    <div class="section-title">APPLICATION DETAILS</div>
    <div class="two-column">
      <div class="row"><span class="label">Application ID:</span><span class="value">${application.application_id}</span></div>
      <div class="row"><span class="label">Date:</span><span class="value">${formatDate(application.created_at)}</span></div>
      <div class="row"><span class="label">Approval Status:</span><span class="value"><span class="status-badge" style="background: ${getStatusColor(application.status)}">${getStatusLabel(application.status)}</span></span></div>
      <div class="row"><span class="label">Application Type:</span><span class="value">${application.application_type?.toUpperCase()}</span></div>
      <div class="row"><span class="label">Solar Product:</span><span class="value">${getSolarProductName(application.product_type)}</span></div>
    </div>
  </div>

  ${application.approved_amount ? `
  <div class="approved-amount">
    <div class="approved-amount-label">✓ APPROVED LOAN AMOUNT</div>
    <div class="approved-amount-value">${formatCurrency(application.approved_amount)}</div>
  </div>
  ` : ''}

  ${application.status === 'declined' && application.decline_reason ? `
  <div class="decline-reason">
    <div class="decline-reason-label">✗ APPLICATION DECLINED</div>
    <div class="decline-reason-text">Reason: ${application.decline_reason}</div>
  </div>
  ` : ''}

  <div class="section">
    <div class="section-title">APPLICANT INFORMATION</div>
    <div class="two-column">
      <div class="row"><span class="label">Full Name:</span><span class="value">${application.full_name}</span></div>
      <div class="row"><span class="label">Phone Number:</span><span class="value">${application.phone_number}</span></div>
      <div class="row"><span class="label">Employee ID:</span><span class="value">${application.employee_id}</span></div>
      <div class="row"><span class="label">Ministry/Department:</span><span class="value">${application.ministry_department}</span></div>
      <div class="row"><span class="label">BVN:</span><span class="value">${application.bvn}</span></div>
      <div class="row"><span class="label">NIN:</span><span class="value">${application.nin}</span></div>
    </div>
    <div class="row" style="margin-top: 10px;"><span class="label">Address:</span><span class="value">${application.address}</span></div>
  </div>

  <div class="section">
    <div class="section-title">SOLAR PRODUCT DETAILS</div>
    <div class="two-column">
      <div class="row"><span class="label">Solar Product:</span><span class="value">${getSolarProductName(application.product_type)}</span></div>
      <div class="row"><span class="label">Product Price:</span><span class="value">${formatCurrency(application.specific_amount)}</span></div>
      <div class="row"><span class="label">Repayment Period:</span><span class="value">${application.repayment_period_months} months</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">DISBURSEMENT ACCOUNT (YobeMFB)</div>
    <div class="two-column">
      <div class="row"><span class="label">Account Type:</span><span class="value">${getAccountType(application.bank_name)}</span></div>
      <div class="row"><span class="label">Account Number:</span><span class="value">${application.bank_account_number}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">GUARANTOR(S)</div>
    ${guarantors && guarantors.length > 0 ? guarantors.map((g, i) => `
      <div class="guarantor">
        <div class="guarantor-title">Guarantor ${i + 1}</div>
        <div class="two-column">
          <div class="row"><span class="label">Full Name:</span><span class="value">${g.full_name}</span></div>
          <div class="row"><span class="label">Phone Number:</span><span class="value">${g.phone_number}</span></div>
          <div class="row"><span class="label">Organization:</span><span class="value">${g.organization}</span></div>
          <div class="row"><span class="label">Position:</span><span class="value">${g.position}</span></div>
          <div class="row"><span class="label">Employee ID:</span><span class="value">${g.employee_id}</span></div>
          <div class="row"><span class="label">BVN:</span><span class="value">${g.bvn}</span></div>
          <div class="row"><span class="label">Monthly Salary:</span><span class="value">${formatCurrency(g.salary)}</span></div>
          <div class="row"><span class="label">Allowances:</span><span class="value">${formatCurrency(g.allowances || 0)}</span></div>
          <div class="row"><span class="label">Other Income:</span><span class="value">${formatCurrency(g.other_income || 0)}</span></div>
        </div>
        <div class="row" style="margin-top: 10px;"><span class="label">Address:</span><span class="value">${g.address}</span></div>
      </div>
    `).join('') : '<p>No guarantors on file.</p>'}
  </div>

  <div class="sms-notice">
    <div class="sms-notice-text">
      <strong>Important:</strong> Please login to your loan application dashboard after 24-48 hours to check your loan status. 
      You will receive an SMS notification if your loan is approved. Loan disbursements are processed at the end of each month.
    </div>
  </div>

  <div class="footer">
    <p><strong>Yobe Microfinance Bank Limited</strong></p>
    <p>Document Generated: ${formatDate(new Date().toISOString())}</p>
    <p>Licensed by Central Bank of Nigeria | All Rights Reserved</p>
    <p>This is a computer-generated document and does not require a signature.</p>
  </div>
</body>
</html>
  `;

  // Create a blob from HTML content
  const blob = new Blob([htmlContent], { type: 'text/html' });
  return blob;
}

export async function downloadApplicationPDF(
  applicationId: string,
  bucket: string = 'passport-photos'
): Promise<void> {
  try {
    // Fetch application data
    const { data: application, error: appError } = await supabase
      .from('loan_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      throw new Error('Application not found');
    }

    // Fetch guarantor data
    const { data: guarantors } = await supabase
      .from('guarantors')
      .select('*')
      .eq('loan_application_id', applicationId);

    // Get passport photo as data URL if available
    let passportDataUrl: string | undefined;
    if (application.passport_photo_url) {
      try {
        const { data: signedData } = await supabase.storage
          .from(bucket)
          .createSignedUrl(application.passport_photo_url, 60);
        
        if (signedData?.signedUrl) {
          // Fetch image and convert to data URL
          const response = await fetch(signedData.signedUrl);
          const imageBlob = await response.blob();
          passportDataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(imageBlob);
          });
        }
      } catch (err) {
        console.warn('Could not load passport photo:', err);
      }
    }

    // Generate PDF
    const pdfBlob = await generateApplicationPDF(application, guarantors || [], passportDataUrl);

    // Create download link and open in new window
    const url = window.URL.createObjectURL(pdfBlob);
    
    // Open in new window for printing
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
    
    // Cleanup after a delay
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 5000);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
