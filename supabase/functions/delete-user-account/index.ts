import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// User-scoped tables in foreign-key-safe delete order (children before parents).
// `parent_invites` and `student_state` reference public.profiles, so they MUST
// be deleted before `profiles`. Each entry maps the table to the column holding
// the user id (profiles keys on `id`, parent_invites on `student_user_id`).
const USER_TABLES: { table: string; column: string }[] = [
  { table: "notifications", column: "user_id" },
  { table: "mission_lessons", column: "user_id" },
  { table: "mission_projects", column: "user_id" },
  { table: "koko_roadmaps", column: "user_id" },
  { table: "user_roles", column: "user_id" },
  { table: "parent_invites", column: "student_user_id" },
  { table: "student_state", column: "user_id" },
  { table: "profiles", column: "id" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const ANON = Deno.env.get("SUPABASE_ANON_KEY");
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !ANON || !SERVICE) {
      console.error("delete-user-account: missing env", {
        hasUrl: !!SUPABASE_URL, hasAnon: !!ANON, hasService: !!SERVICE,
      });
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Identify the caller ONLY from their verified JWT — never from the request
    // body. This guarantees a user can only ever delete their own account.
    const token = authHeader.replace("Bearer ", "");
    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(token);
    const userId = claimsData?.claims?.sub as string | undefined;
    if (claimsErr || !userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE);

    // (a+b) Delete user-scoped rows in FK-safe order. Each of these tables also
    // cascades on auth-user deletion, so a per-table failure is logged but not
    // fatal — the final deleteUser is the source of truth for success.
    for (const { table, column } of USER_TABLES) {
      const { error } = await admin.from(table).delete().eq(column, userId);
      if (error) console.error(`delete-user-account: ${table} delete failed: ${error.message}`);
    }

    // (c) Remove the user's storage objects (profile pictures live under <userId>/).
    try {
      const { data: files } = await admin.storage
        .from("profile-pictures")
        .list(userId, { limit: 1000 });
      if (files && files.length > 0) {
        await admin.storage
          .from("profile-pictures")
          .remove(files.map((f) => `${userId}/${f.name}`));
      }
    } catch (e) {
      console.error(`delete-user-account: storage cleanup failed: ${(e as Error).message}`);
    }

    // (d) Finally remove the auth user itself (cascades anything missed above).
    const { error: delErr } = await admin.auth.admin.deleteUser(userId);
    if (delErr) {
      console.error(`delete-user-account: deleteUser failed: ${delErr.message}`);
      return new Response(JSON.stringify({ error: delErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(`delete-user-account: unexpected error: ${(e as Error).message}`);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
