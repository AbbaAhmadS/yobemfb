import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate HTML content that can be printed as PDF
function generatePDFHTML(application: any, guarantors: any[], passportPhotoBase64: string | null): string {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const getLoanRange = (range: string) => {
    const ranges: Record<string, string> = {
      '100k_300k': '₦100,000 - ₦300,000',
      '300k_600k': '₦300,000 - ₦600,000',
      '600k_1m': '₦600,000 - ₦1,000,000',
      'above_1m': 'Above ₦1,000,000'
    };
    return ranges[range] || range;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': '#f59e0b',
      'under_review': '#3b82f6',
      'approved': '#10b981',
      'declined': '#ef4444',
      'flagged': '#f97316'
    };
    return colors[status] || '#6b7280';
  };

  let guarantorHTML = '';
  if (guarantors && guarantors.length > 0) {
    guarantors.forEach((g, index) => {
      guarantorHTML += `
        <div class="section">
          <h3>Guarantor ${index + 1}</h3>
          <table>
            <tr><td class="label">Full Name:</td><td>${g.full_name}</td></tr>
            <tr><td class="label">Phone Number:</td><td>${g.phone_number}</td></tr>
            <tr><td class="label">Address:</td><td>${g.address}</td></tr>
            <tr><td class="label">Organization:</td><td>${g.organization}</td></tr>
            <tr><td class="label">Position:</td><td>${g.position}</td></tr>
            <tr><td class="label">Employee ID:</td><td>${g.employee_id}</td></tr>
            <tr><td class="label">BVN:</td><td>${g.bvn}</td></tr>
            <tr><td class="label">Monthly Salary:</td><td>${formatCurrency(g.salary)}</td></tr>
            <tr><td class="label">Allowances:</td><td>${formatCurrency(g.allowances || 0)}</td></tr>
            <tr><td class="label">Other Income:</td><td>${formatCurrency(g.other_income || 0)}</td></tr>
            <tr><td class="label">Acknowledged:</td><td>${g.acknowledged ? '✓ Yes' : '✗ No'}</td></tr>
          </table>
        </div>
      `;
    });
  } else {
    guarantorHTML = '<p class="no-data">No guarantors on file.</p>';
  }

  const passportSection = passportPhotoBase64 
    ? `<img src="${passportPhotoBase64}" alt="Passport Photo" class="passport-photo" />`
    : '<div class="passport-placeholder">No Photo</div>';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Loan Application - ${application.application_id}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 12px;
      line-height: 1.5;
      color: #1a1a1a;
      background: white;
      padding: 20px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #1e40af;
      padding-bottom: 20px;
      margin-bottom: 20px;
    }
    .header h1 {
      color: #1e40af;
      font-size: 24px;
      margin-bottom: 5px;
    }
    .header h2 {
      font-size: 16px;
      color: #4b5563;
      font-weight: normal;
    }
    .applicant-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      border: 1px solid #e5e7eb;
      padding: 15px;
      border-radius: 8px;
      background: #f9fafb;
    }
    .applicant-info {
      flex: 1;
    }
    .applicant-info h3 {
      font-size: 18px;
      color: #1e40af;
      margin-bottom: 10px;
    }
    .passport-photo {
      width: 120px;
      height: 150px;
      object-fit: cover;
      border: 2px solid #1e40af;
      border-radius: 8px;
    }
    .passport-placeholder {
      width: 120px;
      height: 150px;
      background: #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #9ca3af;
      border: 2px dashed #9ca3af;
      border-radius: 8px;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      color: white;
      font-weight: bold;
      font-size: 11px;
      text-transform: uppercase;
    }
    .section {
      margin-bottom: 20px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }
    .section h3 {
      background: #1e40af;
      color: white;
      padding: 10px 15px;
      font-size: 14px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    table td {
      padding: 8px 15px;
      border-bottom: 1px solid #e5e7eb;
    }
    table tr:last-child td {
      border-bottom: none;
    }
    .label {
      font-weight: 600;
      color: #4b5563;
      width: 200px;
      background: #f9fafb;
    }
    .approval-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      padding: 15px;
    }
    .approval-item {
      text-align: center;
      padding: 10px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }
    .approval-item.approved {
      background: #ecfdf5;
      border-color: #10b981;
    }
    .approval-item.declined {
      background: #fef2f2;
      border-color: #ef4444;
    }
    .approval-item.pending {
      background: #fffbeb;
      border-color: #f59e0b;
    }
    .approval-label {
      font-size: 10px;
      color: #6b7280;
      text-transform: uppercase;
    }
    .approval-status {
      font-size: 14px;
      font-weight: bold;
      margin-top: 5px;
    }
    .no-data {
      padding: 15px;
      color: #6b7280;
      font-style: italic;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 10px;
    }
    @media print {
      body { padding: 0; }
      .container { max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>YOBE MICROFINANCE BANK LIMITED</h1>
      <h2>LOAN APPLICATION FORM</h2>
    </div>

    <div class="applicant-header">
      <div class="applicant-info">
        <h3>${application.full_name}</h3>
        <p><strong>Application ID:</strong> ${application.application_id}</p>
        <p><strong>Application Date:</strong> ${formatDate(application.created_at)}</p>
        <p><strong>Status:</strong> <span class="status-badge" style="background: ${getStatusColor(application.status)}">${(application.status || 'pending').toUpperCase()}</span></p>
      </div>
      ${passportSection}
    </div>

    <div class="section">
      <h3>Application Details</h3>
      <table>
        <tr><td class="label">Application Type:</td><td>${(application.application_type || 'N/A').toUpperCase()}</td></tr>
        <tr><td class="label">Product Type:</td><td>${application.product_type === 'short_term' ? 'Short Term Loan' : 'Long Term Loan'}</td></tr>
      </table>
    </div>

    <div class="section">
      <h3>Applicant Information</h3>
      <table>
        <tr><td class="label">Full Name:</td><td>${application.full_name}</td></tr>
        <tr><td class="label">Phone Number:</td><td>${application.phone_number}</td></tr>
        <tr><td class="label">Address:</td><td>${application.address}</td></tr>
        <tr><td class="label">Employee ID:</td><td>${application.employee_id}</td></tr>
        <tr><td class="label">Ministry/Department:</td><td>${application.ministry_department}</td></tr>
        <tr><td class="label">BVN:</td><td>${application.bvn}</td></tr>
        <tr><td class="label">NIN:</td><td>${application.nin}</td></tr>
      </table>
    </div>

    <div class="section">
      <h3>Loan Details</h3>
      <table>
        <tr><td class="label">Loan Amount Range:</td><td>${getLoanRange(application.loan_amount_range)}</td></tr>
        <tr><td class="label">Specific Amount:</td><td>${formatCurrency(application.specific_amount)}</td></tr>
        <tr><td class="label">Repayment Period:</td><td>${application.repayment_period_months} months</td></tr>
      </table>
    </div>

    <div class="section">
      <h3>Bank Details</h3>
      <table>
        <tr><td class="label">Bank Name:</td><td>${application.bank_name}</td></tr>
        <tr><td class="label">Account Number:</td><td>${application.bank_account_number}</td></tr>
      </table>
    </div>

    <div class="section">
      <h3>Guarantors</h3>
      ${guarantorHTML}
    </div>

    <div class="section">
      <h3>Approval Status</h3>
      <div class="approval-grid">
        <div class="approval-item ${application.credit_approval ? 'approved' : application.credit_approval === false ? 'declined' : 'pending'}">
          <div class="approval-label">Credit</div>
          <div class="approval-status">${application.credit_approval ? '✓ Approved' : application.credit_approval === false ? '✗ Declined' : '⏳ Pending'}</div>
          ${application.credit_approved_at ? `<div style="font-size: 9px; color: #6b7280;">${formatDate(application.credit_approved_at)}</div>` : ''}
        </div>
        <div class="approval-item ${application.audit_approval ? 'approved' : application.audit_approval === false ? 'declined' : 'pending'}">
          <div class="approval-label">Audit</div>
          <div class="approval-status">${application.audit_approval ? '✓ Approved' : application.audit_approval === false ? '✗ Declined' : '⏳ Pending'}</div>
          ${application.audit_approved_at ? `<div style="font-size: 9px; color: #6b7280;">${formatDate(application.audit_approved_at)}</div>` : ''}
        </div>
        <div class="approval-item ${application.coo_approval ? 'approved' : application.coo_approval === false ? 'declined' : 'pending'}">
          <div class="approval-label">COO</div>
          <div class="approval-status">${application.coo_approval ? '✓ Approved' : application.coo_approval === false ? '✗ Declined' : '⏳ Pending'}</div>
          ${application.coo_approved_at ? `<div style="font-size: 9px; color: #6b7280;">${formatDate(application.coo_approved_at)}</div>` : ''}
        </div>
      </div>
    </div>

    <div class="section">
      <h3>Terms and Conditions</h3>
      <table>
        <tr><td class="label">Terms Accepted:</td><td>${application.terms_accepted ? '✓ Yes' : '✗ No'}</td></tr>
      </table>
    </div>

    ${application.notes ? `
    <div class="section">
      <h3>Notes</h3>
      <p style="padding: 15px;">${application.notes}</p>
    </div>
    ` : ''}

    <div class="footer">
      <p>Document Generated: ${formatDate(new Date().toISOString())}</p>
      <p>Yobe Microfinance Bank Limited - All Rights Reserved</p>
    </div>
  </div>
</body>
</html>
  `;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // 1. Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error('PDF generation request missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // 2. Create client with user's token to enforce RLS
    const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    // 3. Verify user authentication
    const { data: { user }, error: authError } = await userSupabase.auth.getUser();
    if (authError || !user) {
      console.error('PDF generation auth failed:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { applicationId } = await req.json();

    if (!applicationId) {
      return new Response(
        JSON.stringify({ error: 'Application ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Verify user has RLS access to this application
    const { data: accessCheck, error: accessError } = await userSupabase
      .from('loan_applications')
      .select('id')
      .eq('id', applicationId)
      .maybeSingle();
    
    if (accessError || !accessCheck) {
      console.error(`PDF generation access denied for user ${user.id} to application ${applicationId}`);
      return new Response(
        JSON.stringify({ error: 'Forbidden - you do not have access to this application' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating PDF for application ${applicationId} by user ${user.id}`);

    // 5. Now safe to use service key for full data fetch
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch loan application
    const { data: application, error: appError } = await supabase
      .from('loan_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (appError) {
      console.error('Error fetching application:', appError);
      return new Response(
        JSON.stringify({ error: 'Application not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch guarantors
    const { data: guarantors, error: guarError } = await supabase
      .from('guarantors')
      .select('*')
      .eq('loan_application_id', applicationId);

    if (guarError) {
      console.error('Error fetching guarantors:', guarError);
    }

    // Fetch passport photo and convert to base64
    let passportPhotoBase64: string | null = null;
    if (application.passport_photo_url) {
      try {
        const { data: photoData, error: photoError } = await supabase
          .storage
          .from('passport-photos')
          .download(application.passport_photo_url);

        if (!photoError && photoData) {
          const arrayBuffer = await photoData.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const base64 = btoa(binary);
          const mimeType = photoData.type || 'image/jpeg';
          passportPhotoBase64 = `data:${mimeType};base64,${base64}`;
        }
      } catch (photoErr) {
        console.error('Error fetching passport photo:', photoErr);
      }
    }

    // Generate HTML content
    const htmlContent = generatePDFHTML(application, guarantors || [], passportPhotoBase64);

    // Return as HTML file that can be saved/printed as PDF
    return new Response(htmlContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="loan-application-${application.application_id}.html"`,
      },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating PDF:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
