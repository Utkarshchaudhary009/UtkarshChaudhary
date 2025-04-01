"use client";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type for user data in Supabase
export type UserData = {
  id: string;
  clerk_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  profile_image_url: string | null;
  public_metadata: any | null;
  is_admin: boolean;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
};
