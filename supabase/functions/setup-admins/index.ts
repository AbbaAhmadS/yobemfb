import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Admin credentials for testing
const ADMIN_USERS = [
  { email: 'credit@yobemfb.com', password: 'YobeMFB2025!Credit', role: 'credit', fullName: 'Credit Department' },
  { email: 'audit@yobemfb.com', password: 'YobeMFB2025!Audit', role: 'audit', fullName: 'Internal Audit' },
  { email: 'coo@yobemfb.com', password: 'YobeMFB2025!Coo', role: 'coo', fullName: 'Chief Operations Officer' },
  { email: 'operations@yobemfb.com', password: 'YobeMFB2025!Ops', role: 'operations', fullName: 'Operations Department' },
  { email: 'md@yobemfb.com', password: 'YobeMFB2025!MD', role: 'managing_director', fullName: 'Managing Director' },
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const results: { email: string; status: string; error?: string }[] = [];

    for (const admin of ADMIN_USERS) {
      try {
        console.log(`Creating admin: ${admin.email}`);
        
        // Create user using admin API
        const { data: userData, error: createError } = await supabase.auth.admin.createUser({
          email: admin.email,
          password: admin.password,
          email_confirm: true,
          user_metadata: {
            full_name: admin.fullName,
            phone_number: '08000000000',
          },
        });

        if (createError) {
          // User might already exist
          if (createError.message.includes('already') || createError.message.includes('exists')) {
            // Try to get existing user
            const { data: existingUsers } = await supabase.auth.admin.listUsers();
            const existingUser = existingUsers?.users?.find(u => u.email === admin.email);
            
            if (existingUser) {
              // Check if role exists
              const { data: existingRole } = await supabase
                .from('user_roles')
                .select('*')
                .eq('user_id', existingUser.id)
                .single();

              if (!existingRole) {
                // Add role
                await supabase.from('user_roles').insert({
                  user_id: existingUser.id,
                  role: admin.role,
                  is_active: true,
                });
              }
              
              results.push({ email: admin.email, status: 'already_exists' });
            } else {
              results.push({ email: admin.email, status: 'error', error: createError.message });
            }
          } else {
            results.push({ email: admin.email, status: 'error', error: createError.message });
          }
          continue;
        }

        if (userData.user) {
          // Add role to user_roles table
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: userData.user.id,
              role: admin.role,
              is_active: true,
            });

          if (roleError) {
            console.error(`Error adding role for ${admin.email}:`, roleError);
            results.push({ email: admin.email, status: 'user_created_role_failed', error: roleError.message });
          } else {
            results.push({ email: admin.email, status: 'created' });
          }
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error(`Error processing ${admin.email}:`, errorMessage);
        results.push({ email: admin.email, status: 'error', error: errorMessage });
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Admin setup complete',
        results,
        credentials: ADMIN_USERS.map(a => ({ email: a.email, password: a.password, role: a.role }))
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Setup error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
