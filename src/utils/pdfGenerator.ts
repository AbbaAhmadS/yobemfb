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
  credit_approval?: boolean;
  credit_approved_at?: string;
  audit_approval?: boolean;
  audit_approved_at?: string;
  coo_approval?: boolean;
  coo_approved_at?: string;
  notes?: string;
  terms_accepted?: boolean;
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
  acknowledged?: boolean;
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

function getLoanRange(range: string): string {
  const ranges: Record<string, string> = {
    '100k_300k': '₦100,000 - ₦300,000',
    '300k_600k': '₦300,000 - ₦600,000',
    '600k_1m': '₦600,000 - ₦1,000,000',
    'above_1m': 'Above ₦1,000,000'
  };
  return ranges[range] || range;
}

export async function generateApplicationPDF(
  application: ApplicationData, 
  guarantors: GuarantorData[],
  passportDataUrl?: string
): Promise<Blob> {
  // Create HTML content for PDF
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Loan Application - ${application.application_id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.5; padding: 40px; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1a5d2e; padding-bottom: 20px; }
    .header h1 { color: #1a5d2e; font-size: 24px; margin-bottom: 5px; }
    .header h2 { color: #333; font-size: 16px; font-weight: normal; }
    .passport-section { float: right; margin-left: 20px; }
    .passport-photo { width: 120px; height: 150px; border: 1px solid #ccc; object-fit: cover; }
    .section { margin-bottom: 25px; clear: both; }
    .section-title { background: #1a5d2e; color: white; padding: 8px 12px; font-size: 14px; font-weight: bold; margin-bottom: 15px; }
    .row { display: flex; margin-bottom: 8px; }
    .label { width: 180px; color: #666; }
    .value { flex: 1; font-weight: 500; }
    .two-column { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .guarantor { background: #f5f5f5; padding: 15px; margin-bottom: 10px; border-radius: 4px; }
    .guarantor-title { font-weight: bold; margin-bottom: 10px; color: #1a5d2e; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-weight: bold; }
    .status-pending { background: #ffc107; color: #000; }
    .status-approved { background: #28a745; color: #fff; }
    .status-declined { background: #dc3545; color: #fff; }
    .status-under_review { background: #17a2b8; color: #fff; }
    .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ccc; padding-top: 20px; }
    .approval-section { margin-top: 20px; }
    .approval-item { display: inline-block; margin-right: 30px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    ${passportDataUrl ? `<div class="passport-section"><img src="${passportDataUrl}" class="passport-photo" alt="Passport Photo" /></div>` : ''}
    <h1>YOBE MICROFINANCE BANK LIMITED</h1>
    <h2>LOAN APPLICATION FORM</h2>
  </div>

  <div class="section">
    <div class="section-title">APPLICATION DETAILS</div>
    <div class="two-column">
      <div class="row"><span class="label">Application ID:</span><span class="value">${application.application_id}</span></div>
      <div class="row"><span class="label">Date:</span><span class="value">${formatDate(application.created_at)}</span></div>
      <div class="row"><span class="label">Status:</span><span class="value"><span class="status-badge status-${application.status}">${application.status?.toUpperCase()}</span></span></div>
      <div class="row"><span class="label">Application Type:</span><span class="value">${application.application_type?.toUpperCase()}</span></div>
      <div class="row"><span class="label">Product Type:</span><span class="value">${application.product_type === 'short_term' ? 'Short Term Loan' : 'Long Term Loan'}</span></div>
    </div>
  </div>

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
    <div class="section-title">LOAN DETAILS</div>
    <div class="two-column">
      <div class="row"><span class="label">Loan Amount Range:</span><span class="value">${getLoanRange(application.loan_amount_range)}</span></div>
      <div class="row"><span class="label">Specific Amount:</span><span class="value">${formatCurrency(application.specific_amount)}</span></div>
      <div class="row"><span class="label">Repayment Period:</span><span class="value">${application.repayment_period_months} months</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">BANK DETAILS</div>
    <div class="two-column">
      <div class="row"><span class="label">Bank Name:</span><span class="value">${application.bank_name}</span></div>
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
        <div class="row"><span class="label">Acknowledged:</span><span class="value">${g.acknowledged ? 'Yes' : 'No'}</span></div>
      </div>
    `).join('') : '<p>No guarantors on file.</p>'}
  </div>

  <div class="section">
    <div class="section-title">APPROVAL STATUS</div>
    <div class="approval-section">
      <div class="approval-item">
        <strong>Credit:</strong> ${application.credit_approval ? '✅ APPROVED' : application.credit_approval === false ? '❌ DECLINED' : '⏳ PENDING'}
        ${application.credit_approved_at ? `<br><small>${formatDate(application.credit_approved_at)}</small>` : ''}
      </div>
      <div class="approval-item">
        <strong>Audit:</strong> ${application.audit_approval ? '✅ APPROVED' : application.audit_approval === false ? '❌ DECLINED' : '⏳ PENDING'}
        ${application.audit_approved_at ? `<br><small>${formatDate(application.audit_approved_at)}</small>` : ''}
      </div>
      <div class="approval-item">
        <strong>COO:</strong> ${application.coo_approval ? '✅ APPROVED' : application.coo_approval === false ? '❌ DECLINED' : '⏳ PENDING'}
        ${application.coo_approved_at ? `<br><small>${formatDate(application.coo_approved_at)}</small>` : ''}
      </div>
    </div>
  </div>

  ${application.notes ? `
  <div class="section">
    <div class="section-title">NOTES</div>
    <p>${application.notes}</p>
  </div>
  ` : ''}

  <div class="footer">
    <p>Document Generated: ${formatDate(new Date().toISOString())}</p>
    <p>Yobe Microfinance Bank Limited - All Rights Reserved</p>
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
  bucket: string = 'loan-uploads'
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

    // Create download link
    const url = window.URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loan-application-${application.application_id}.html`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    // Open print dialog for PDF printing
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
