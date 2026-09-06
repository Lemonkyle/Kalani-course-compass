import { createClient } from "@supabase/supabase-js";
let client;
export function getDatabase() {
  const url=process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Database access is not configured");
  return client ||= createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
}
