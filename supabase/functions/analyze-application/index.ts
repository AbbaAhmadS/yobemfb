import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { applicationId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // =============================================
    // AUTHORIZATION CHECK - Verify caller has access
    // =============================================
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(JSON.stringify({ error: "Unauthorized - No auth token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create client with user's token to verify RLS access
    const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get the authenticated user
    const { data: { user }, error: authError } = await userSupabase.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError?.message || "No user found");
      return new Response(JSON.stringify({ error: "Unauthorized - Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`User ${user.id} requesting analysis for application ${applicationId}`);

    // Verify user has RLS access to this application
    // This respects the RLS policies (user owns app OR has admin role)
    const { data: accessCheck, error: accessError } = await userSupabase
      .from('loan_applications')
      .select('id')
      .eq('id', applicationId)
      .maybeSingle();

    if (accessError) {
      console.error("Access check error:", accessError.message);
      return new Response(JSON.stringify({ error: "Authorization check failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!accessCheck) {
      console.error(`User ${user.id} denied access to application ${applicationId}`);
      return new Response(JSON.stringify({ error: "Forbidden - You don't have access to this application" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`User ${user.id} authorized to analyze application ${applicationId}`);

    // =============================================
    // AUTHORIZED - Now fetch full data with service key
    // =============================================
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch application data
    const { data: application, error: appError } = await supabase
      .from("loan_applications")
      .select("*")
      .eq("id", applicationId)
      .single();

    if (appError || !application) {
      throw new Error("Application not found");
    }

    // Fetch guarantor data
    const { data: guarantor } = await supabase
      .from("guarantors")
      .select("*")
      .eq("loan_application_id", applicationId)
      .single();

    const analysisPrompt = `Analyze this loan application and provide a risk assessment with recommendations:

APPLICANT DETAILS:
- Name: ${application.full_name}
- Ministry/Department: ${application.ministry_department}
- Employee ID: ${application.employee_id}
- Application Type: ${application.application_type}

LOAN DETAILS:
- Product Type: ${application.product_type}
- Amount Requested: ₦${application.specific_amount.toLocaleString()}
- Loan Range: ${application.loan_amount_range}
- Repayment Period: ${application.repayment_period_months} months
- Bank: ${application.bank_name}

GUARANTOR DETAILS:
${guarantor ? `
- Name: ${guarantor.full_name}
- Organization: ${guarantor.organization}
- Position: ${guarantor.position}
- Monthly Salary: ₦${guarantor.salary.toLocaleString()}
- Allowances: ₦${(guarantor.allowances || 0).toLocaleString()}
- Other Income: ₦${(guarantor.other_income || 0).toLocaleString()}
` : 'No guarantor information available'}

Please provide:
1. Risk Level (Low, Medium, High)
2. Key Observations (3-5 bullet points)
3. Recommendations for the credit officer
4. Any red flags or concerns
5. Approval recommendation (Approve, Conditional Approve, Further Review, Decline)

Be concise and professional.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a professional loan risk analyst for a microfinance bank. Provide objective, data-driven analysis of loan applications.",
          },
          { role: "user", content: analysisPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("Failed to analyze application");
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || "Unable to generate analysis";

    // Log successful analysis for audit
    console.log(`Analysis completed for application ${applicationId} by user ${user.id}`);

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
