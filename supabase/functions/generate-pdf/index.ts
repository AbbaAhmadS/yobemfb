import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple PDF generation using raw PDF format
function generatePDF(application: any, guarantors: any[]): Uint8Array {
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

  // Build text content for the PDF
  let content = `
YOBE MICROFINANCE BANK LIMITED
LOAN APPLICATION FORM

================================================================================
APPLICATION DETAILS
================================================================================

Application ID: ${application.application_id}
Application Date: ${formatDate(application.created_at)}
Status: ${application.status?.toUpperCase() || 'PENDING'}
Application Type: ${application.application_type?.toUpperCase() || 'N/A'}
Product Type: ${application.product_type === 'short_term' ? 'Short Term Loan' : 'Long Term Loan'}

================================================================================
APPLICANT INFORMATION
================================================================================

Full Name: ${application.full_name}
Phone Number: ${application.phone_number}
Address: ${application.address}
Employee ID: ${application.employee_id}
Ministry/Department: ${application.ministry_department}
BVN: ${application.bvn}
NIN: ${application.nin}

================================================================================
LOAN DETAILS
================================================================================

Loan Amount Range: ${getLoanRange(application.loan_amount_range)}
Specific Amount Requested: ${formatCurrency(application.specific_amount)}
Repayment Period: ${application.repayment_period_months} months

================================================================================
BANK DETAILS
================================================================================

Bank Name: ${application.bank_name}
Account Number: ${application.bank_account_number}

================================================================================
GUARANTORS
================================================================================
`;

  if (guarantors && guarantors.length > 0) {
    guarantors.forEach((g, index) => {
      content += `
GUARANTOR ${index + 1}
--------------------------------------------------------------------------------
Full Name: ${g.full_name}
Phone Number: ${g.phone_number}
Address: ${g.address}
Organization: ${g.organization}
Position: ${g.position}
Employee ID: ${g.employee_id}
BVN: ${g.bvn}
Monthly Salary: ${formatCurrency(g.salary)}
Allowances: ${formatCurrency(g.allowances || 0)}
Other Income: ${formatCurrency(g.other_income || 0)}
Acknowledged: ${g.acknowledged ? 'Yes' : 'No'}
`;
    });
  } else {
    content += '\nNo guarantors on file.\n';
  }

  content += `
================================================================================
APPROVAL STATUS
================================================================================

Credit Approval: ${application.credit_approval ? 'APPROVED' : application.credit_approval === false ? 'DECLINED' : 'PENDING'}
${application.credit_approved_at ? `Credit Approved At: ${formatDate(application.credit_approved_at)}` : ''}

Audit Approval: ${application.audit_approval ? 'APPROVED' : application.audit_approval === false ? 'DECLINED' : 'PENDING'}
${application.audit_approved_at ? `Audit Approved At: ${formatDate(application.audit_approved_at)}` : ''}

COO Approval: ${application.coo_approval ? 'APPROVED' : application.coo_approval === false ? 'DECLINED' : 'PENDING'}
${application.coo_approved_at ? `COO Approved At: ${formatDate(application.coo_approved_at)}` : ''}

================================================================================
TERMS AND CONDITIONS
================================================================================

Terms Accepted: ${application.terms_accepted ? 'Yes' : 'No'}

${application.notes ? `
================================================================================
NOTES
================================================================================

${application.notes}
` : ''}

================================================================================
Document Generated: ${formatDate(new Date().toISOString())}
Yobe Microfinance Bank Limited - All Rights Reserved
================================================================================
`;

  // Encode content as UTF-8
  const encoder = new TextEncoder();
  return encoder.encode(content);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { applicationId } = await req.json();

    if (!applicationId) {
      throw new Error('Application ID is required');
    }

    console.log('Generating PDF for application:', applicationId);

    // Fetch loan application
    const { data: application, error: appError } = await supabase
      .from('loan_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (appError) {
      console.error('Error fetching application:', appError);
      throw new Error('Application not found');
    }

    // Fetch guarantors
    const { data: guarantors, error: guarError } = await supabase
      .from('guarantors')
      .select('*')
      .eq('loan_application_id', applicationId);

    if (guarError) {
      console.error('Error fetching guarantors:', guarError);
    }

    // Generate PDF content
    const pdfContent = generatePDF(application, guarantors || []);

    // Return as downloadable text file (formatted as document)
    const textContent = new TextDecoder().decode(pdfContent);
    return new Response(textContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="loan-application-${application.application_id}.txt"`,
      },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating PDF:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});