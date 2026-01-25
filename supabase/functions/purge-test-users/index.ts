import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_ROLES = [
  "credit",
  "audit",
  "coo",
  "managing_director",
] as const;

const STORAGE_BUCKETS = ["documents", "signatures", "loan-uploads", "passport-photos"] as const;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    // 1) Verify caller is authenticated
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();
    if (userError || !user) return json({ error: "Unauthorized" }, 401);

    // 2) Verify caller is an admin (server-side)
    const { data: isAdmin, error: isAdminError } = await userClient.rpc("is_admin", {
      _user_id: user.id,
    });
    if (isAdminError) {
      console.error("is_admin rpc error:", isAdminError);
      return json({ error: "Authorization check failed" }, 500);
    }
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    // 3) Service client for destructive operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // 4) Determine admin user ids
    const { data: adminRoleRows, error: adminRoleError } = await adminClient
      .from("user_roles")
      .select("user_id, role")
      .in("role", [...ADMIN_ROLES])
      .eq("is_active", true);

    if (adminRoleError) {
      console.error("user_roles fetch error:", adminRoleError);
      return json({ error: "Failed to load admin roles" }, 500);
    }

    const adminUserIds = new Set((adminRoleRows ?? []).map((r) => r.user_id));

    // 5) Find all profiles that are NOT admins => these users will be purged
    const { data: profiles, error: profilesError } = await adminClient
      .from("profiles")
      .select("user_id");

    if (profilesError) {
      console.error("profiles fetch error:", profilesError);
      return json({ error: "Failed to load profiles" }, 500);
    }

    const purgeUserIds = (profiles ?? [])
      .map((p) => p.user_id)
      .filter((uid) => !adminUserIds.has(uid));

    if (purgeUserIds.length === 0) {
      return json({ ok: true, purgedUsers: 0, message: "No non-admin users found to purge." });
    }

    // 6) Delete user uploads from storage (by user folder convention: {userId}/...)
    // Note: deleting storage.objects rows removes the underlying objects.
    let deletedStorageObjects = 0;
    for (const bucket of STORAGE_BUCKETS) {
      for (const uid of purgeUserIds) {
        const { data, error } = await adminClient
          .schema("storage")
          .from("objects")
          .delete()
          .eq("bucket_id", bucket)
          .like("name", `${uid}/%`)
          .select("id");

        if (error) {
          // Continue best-effort, but report
          console.error(`storage delete error bucket=${bucket} uid=${uid}:`, error);
          continue;
        }
        deletedStorageObjects += (data ?? []).length;
      }
    }

    // 7) Delete user-generated rows (best-effort; order matters)
    const deleteByUserId = async (table: string) => {
      const { data, error } = await adminClient.from(table).delete().in("user_id", purgeUserIds).select("id");
      if (error) {
        console.error(`${table} delete error:`, error);
        return 0;
      }
      return (data ?? []).length;
    };

    const deletedLoanApps = await deleteByUserId("loan_applications");

    // Remove any access logs tied to those profiles/users
    const { data: logsData, error: logsError } = await adminClient
      .from("profile_access_logs")
      .delete()
      .or(
        `accessed_profile_id.in.(${purgeUserIds.join(",")}),accessor_user_id.in.(${purgeUserIds.join(",")})`,
      )
      .select("id");
    if (logsError) console.error("profile_access_logs delete error:", logsError);

    // Delete any roles for those users (typically none, but safe)
    const { data: rolesData, error: rolesError } = await adminClient
      .from("user_roles")
      .delete()
      .in("user_id", purgeUserIds)
      .select("id");
    if (rolesError) console.error("user_roles delete error:", rolesError);

    // Delete profiles
    const { data: profilesDeleted, error: profilesDelError } = await adminClient
      .from("profiles")
      .delete()
      .in("user_id", purgeUserIds)
      .select("id");
    if (profilesDelError) console.error("profiles delete error:", profilesDelError);

    // 8) Delete auth users (logins)
    let deletedAuthUsers = 0;
    for (const uid of purgeUserIds) {
      const { error } = await adminClient.auth.admin.deleteUser(uid);
      if (error) {
        console.error(`auth deleteUser error uid=${uid}:`, error);
        continue;
      }
      deletedAuthUsers += 1;
    }

    return json({
      ok: true,
      purgedUsers: purgeUserIds.length,
      deletedAuthUsers,
      deletedLoanApps,
      deletedProfiles: (profilesDeleted ?? []).length,
      deletedProfileAccessLogs: (logsData ?? []).length,
      deletedRoles: (rolesData ?? []).length,
      deletedStorageObjects,
    });
  } catch (error) {
    console.error("purge-test-users error:", error);
    return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});
