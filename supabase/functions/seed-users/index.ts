import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const results: string[] = [];

    // Create user account
    const { data: userData, error: userErr } = await admin.auth.admin.createUser({
      email: "user@user.com",
      password: "user123",
      email_confirm: true,
      user_metadata: { full_name: "User Demo" },
    });
    if (userErr && !userErr.message.includes("already been registered")) {
      throw userErr;
    }
    if (userData?.user) {
      await admin.from("user_roles").upsert({ user_id: userData.user.id, role: "user" }, { onConflict: "user_id,role" });
      results.push("User created: user@user.com");
    } else {
      // User exists, get their ID and ensure role
      const { data: { users } } = await admin.auth.admin.listUsers();
      const existingUser = users?.find((u) => u.email === "user@user.com");
      if (existingUser) {
        await admin.from("user_roles").upsert({ user_id: existingUser.id, role: "user" }, { onConflict: "user_id,role" });
        results.push("User already exists, role ensured");
      }
    }

    // Create admin account
    const { data: adminData, error: adminErr } = await admin.auth.admin.createUser({
      email: "admin@admin.com",
      password: "admin123",
      email_confirm: true,
      user_metadata: { full_name: "Admin CAMPCER" },
    });
    if (adminErr && !adminErr.message.includes("already been registered")) {
      throw adminErr;
    }
    if (adminData?.user) {
      await admin.from("user_roles").upsert({ user_id: adminData.user.id, role: "admin" }, { onConflict: "user_id,role" });
      results.push("Admin created: admin@admin.com");
    } else {
      const { data: { users } } = await admin.auth.admin.listUsers();
      const existingAdmin = users?.find((u) => u.email === "admin@admin.com");
      if (existingAdmin) {
        await admin.from("user_roles").upsert({ user_id: existingAdmin.id, role: "admin" }, { onConflict: "user_id,role" });
        results.push("Admin already exists, role ensured");
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
