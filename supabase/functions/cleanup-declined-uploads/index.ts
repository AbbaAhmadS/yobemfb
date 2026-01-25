import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STORAGE_BUCKETS = ["documents", "signatures", "loan-uploads", "passport-photos"] as const;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting cleanup-declined-uploads job...");

    // 1) Fetch retention policy settings
    const { data: settingsRow, error: settingsError } = await supabase
      .from("admin_settings")
      .select("value")
      .eq("key", "retention_policy")
      .maybeSingle();

    if (settingsError) {
      console.error("Failed to fetch retention_policy setting:", settingsError);
      return new Response(JSON.stringify({ error: "Settings fetch failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const policyEnabled = settingsRow?.value?.enabled ?? true;
    const retentionDays = settingsRow?.value?.declined_retention_days ?? 5;

    if (!policyEnabled) {
      console.log("Retention policy is disabled. Skipping cleanup.");
      return new Response(JSON.stringify({ ok: true, message: "Policy disabled", deletedFiles: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Retention policy enabled: delete declined uploads after ${retentionDays} days.`);

    // 2) Find declined loan applications older than retentionDays
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const cutoffISO = cutoffDate.toISOString();

    const { data: declinedLoans, error: loansError } = await supabase
      .from("loan_applications")
      .select("id, user_id, updated_at, status")
      .eq("status", "declined")
      .lt("updated_at", cutoffISO);

    if (loansError) {
      console.error("Failed to fetch declined loans:", loansError);
      return new Response(JSON.stringify({ error: "Failed to fetch loans" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const declinedUserIds = new Set<string>();
    (declinedLoans ?? []).forEach((loan) => declinedUserIds.add(loan.user_id));

    if (declinedUserIds.size === 0) {
      console.log("No declined applications older than retention period. Nothing to delete.");
      return new Response(JSON.stringify({ ok: true, deletedFiles: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${declinedUserIds.size} user(s) with old declined applications.`);

    // 3) Delete storage objects for these users (best-effort)
    let totalDeleted = 0;
    for (const bucket of STORAGE_BUCKETS) {
      for (const uid of declinedUserIds) {
        const { data, error } = await supabase
          .schema("storage")
          .from("objects")
          .delete()
          .eq("bucket_id", bucket)
          .like("name", `${uid}/%`)
          .select("id");

        if (error) {
          console.error(`storage delete error bucket=${bucket} uid=${uid}:`, error);
          continue;
        }
        const count = (data ?? []).length;
        if (count > 0) {
          console.log(`Deleted ${count} file(s) from ${bucket} for user ${uid}`);
          totalDeleted += count;
        }
      }
    }

    console.log(`Cleanup completed. Total files deleted: ${totalDeleted}`);

    return new Response(
      JSON.stringify({
        ok: true,
        declinedLoans: (declinedLoans ?? []).length,
        deletedFiles: totalDeleted,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("cleanup-declined-uploads error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});