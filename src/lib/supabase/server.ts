import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export function createServerClient() {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_ANON_KEY || ""
  );

  return { supabase };
}
