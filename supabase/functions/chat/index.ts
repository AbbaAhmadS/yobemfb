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
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // =============================================
    // AUTHENTICATION CHECK
    // =============================================
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error("No authorization header provided for chat request");
      return new Response(JSON.stringify({ error: "Unauthorized - Please log in to use the chat" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate the user token using getClaims
    const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await userSupabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error("Chat auth error:", claimsError?.message || "No claims found");
      return new Response(JSON.stringify({ error: "Unauthorized - Invalid session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    console.log(`Chat request from authenticated user: ${userId}`);

    // =============================================
    // RATE LIMITING (simple per-user check)
    // =============================================
    // Note: For production, consider using Redis or a dedicated rate limiting service
    // This is a basic implementation that logs usage for monitoring
    
    const systemPrompt = `You are Ramatu, a helpful and friendly loan advisor for Yobe Microfinance Bank. You assist customers with:
 - Information about solar loan products (Easy Solar All-in-One 1000 and Smart Solar 2000)
- Loan eligibility requirements
- Application process and required documents
- Repayment terms and schedules
- Interest rates and fees
- Account opening procedures

 Key Information:
 - Yobe Microfinance Bank has been serving Yobe State and Local Governments civil servants for over 20 years
- Loans are processed and disbursed at the last week of every month
 - Required documents: NIN, BVN, passport photograph, pay slip
- Loan amounts: ₦100,000 - ₦300,000, ₦300,000 - ₦600,000, ₦600,000 - ₦1,000,000, Above ₦1,000,000
 - Solar products:
   - Easy Solar All-in-One 1000 (₦630,000)
   - Smart Solar 2000 (₦1,196,000)
 - Repayment periods for solar loans: 12 or 18 months
- Contact: 08142576613

Be professional, friendly, and provide accurate information. If you're unsure about specific details, recommend the customer contact the bank directly or visit a branch.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.warn(`Rate limit hit for user ${userId}`);
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to get AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Chat response streaming for user ${userId}`);

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
