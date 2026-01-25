import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate HTML content for admin PDF with full details
function generateAdminPDFHTML(
  application: any, 
  guarantors: any[], 
  passportPhotoBase64: string | null,
  activeApprovalRoles: { audit: boolean; coo: boolean }
): string {
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

  const getSolarProductName = (productType: string) => {
    const products: Record<string, string> = {
      'short_term': 'Easy Solar All-in-One 1000 (1kWh) - ₦630,000',
      'long_term': 'Smart Solar 2000 (2kWh) - ₦1,196,000'
    };
    return products[productType] || productType;
  };

  const getAccountType = (type: string) => {
    const types: Record<string, string> = {
      'savings': 'Savings Account',
      'current': 'Current Account',
      'corporate': 'Corporate Account'
    };
    return types[type] || type;
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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pending': 'Pending',
      'under_review': 'Under Review',
      'approved': 'Approved',
      'declined': 'Declined',
      'flagged': 'Flagged'
    };
    return labels[status] || status;
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
  <title>Solar Loan Application - ${application.application_id}</title>
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
    .app-type-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: bold;
      margin-left: 8px;
    }
    .app-type-internal { background: #dbeafe; color: #1e40af; }
    .app-type-external { background: #fef3c7; color: #92400e; }
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
      <h2>SOLAR LOAN APPLICATION FORM (ADMIN COPY)</h2>
    </div>

    <div class="applicant-header">
      <div class="applicant-info">
        <h3>${application.full_name}</h3>
        <p><strong>Application ID:</strong> ${application.application_id}</p>
        <p><strong>Application Date:</strong> ${formatDate(application.created_at)}</p>
        <p>
          <strong>Type:</strong> 
          <span class="app-type-badge ${application.application_type === 'internal' ? 'app-type-internal' : 'app-type-external'}">
            ${(application.application_type || 'external').toUpperCase()}
          </span>
          ${application.created_by_admin ? '<span class="app-type-badge app-type-internal">CREDIT DEPT</span>' : ''}
        </p>
        <p><strong>Status:</strong> <span class="status-badge" style="background: ${getStatusColor(application.status)}">${getStatusLabel(application.status)}</span></p>
      </div>
      ${passportSection}
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
      <h3>Solar Product Details</h3>
      <table>
        <tr><td class="label">Solar Product:</td><td>${getSolarProductName(application.product_type)}</td></tr>
        <tr><td class="label">Product Price:</td><td>${formatCurrency(application.specific_amount)}</td></tr>
        <tr><td class="label">Repayment Period:</td><td>${application.repayment_period_months} months</td></tr>
      </table>
    </div>

    <div class="section">
      <h3>Disbursement Account (YobeMFB)</h3>
      <table>
        <tr><td class="label">Account Type:</td><td>${getAccountType(application.bank_name)}</td></tr>
        <tr><td class="label">Account Number:</td><td>${application.bank_account_number}</td></tr>
      </table>
    </div>

    <div class="section">
      <h3>Guarantors</h3>
      ${guarantorHTML}
    </div>

    <div class="section">
      <h3>Approval Chain</h3>
      <div class="approval-grid">
        <div class="approval-item ${application.credit_approval ? 'approved' : application.credit_approval === false ? 'declined' : 'pending'}">
          <div class="approval-label">Credit</div>
          <div class="approval-status">${application.credit_approval ? '✓ Approved' : application.credit_approval === false ? '✗ Declined' : '⏳ Pending'}</div>
          ${application.credit_approved_at ? `<div style="font-size: 9px; color: #6b7280;">${formatDate(application.credit_approved_at)}</div>` : ''}
        </div>
        <div class="approval-item ${!activeApprovalRoles.audit ? 'pending' : application.audit_approval ? 'approved' : application.audit_approval === false ? 'declined' : 'pending'}" ${!activeApprovalRoles.audit ? 'style="opacity: 0.5;"' : ''}>
          <div class="approval-label">Audit</div>
          <div class="approval-status">${!activeApprovalRoles.audit ? '⊘ Skipped' : application.audit_approval ? '✓ Approved' : application.audit_approval === false ? '✗ Declined' : '⏳ Pending'}</div>
          ${activeApprovalRoles.audit && application.audit_approved_at ? `<div style="font-size: 9px; color: #6b7280;">${formatDate(application.audit_approved_at)}</div>` : ''}
          ${!activeApprovalRoles.audit ? `<div style="font-size: 9px; color: #6b7280;">Role Inactive</div>` : ''}
        </div>
        <div class="approval-item ${!activeApprovalRoles.coo ? 'pending' : application.coo_approval ? 'approved' : application.coo_approval === false ? 'declined' : 'pending'}" ${!activeApprovalRoles.coo ? 'style="opacity: 0.5;"' : ''}>
          <div class="approval-label">COO</div>
          <div class="approval-status">${!activeApprovalRoles.coo ? '⊘ Skipped' : application.coo_approval ? '✓ Approved' : application.coo_approval === false ? '✗ Declined' : '⏳ Pending'}</div>
          ${activeApprovalRoles.coo && application.coo_approved_at ? `<div style="font-size: 9px; color: #6b7280;">${formatDate(application.coo_approved_at)}</div>` : ''}
          ${!activeApprovalRoles.coo ? `<div style="font-size: 9px; color: #6b7280;">Role Inactive</div>` : ''}
        </div>
      </div>
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
      <p>FOR INTERNAL USE ONLY</p>
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
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
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
    
    // 3. Get current user
    const { data: { user }, error: userError } = await userSupabase.auth.getUser();
    
    if (userError || !user) {
      console.error('PDF generation auth failed:', userError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;
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
      console.error(`PDF generation access denied for user ${userId} to application ${applicationId}`);
      return new Response(
        JSON.stringify({ error: 'Forbidden - you do not have access to this application' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating PDF for application ${applicationId} by user ${userId}`);

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

    // Fetch active approval chain roles (audit and coo)
    const { data: activeRoles } = await supabase
      .from('user_roles')
      .select('role')
      .in('role', ['audit', 'coo'])
      .eq('is_active', true);

    const activeRolesSet = new Set(activeRoles?.map((r: any) => r.role) || []);
    const activeApprovalRoles = {
      audit: activeRolesSet.has('audit'),
      coo: activeRolesSet.has('coo'),
    };

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
    const htmlContent = generateAdminPDFHTML(application, guarantors || [], passportPhotoBase64, activeApprovalRoles);

    // Return as HTML with proper headers for PDF printing
    return new Response(htmlContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
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
