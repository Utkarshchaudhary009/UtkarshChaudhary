import { Roles } from "@/types/global";
import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";

export const checkRoleClerk = async (role: Roles) => {
  const { sessionClaims } = await auth();

  console.log(`sessionClaims:${JSON.stringify(sessionClaims)}}`);
  const metadata: { role?: Roles } | undefined = sessionClaims?.metadata;

  if (metadata) {
    return metadata.role === role;
  } else {
    return false;
  }
};

export const checkRoleSupabase = async (role: Roles) => {
  try {
    const { userId } = await auth();

    if (!userId) return false;

    const { supabase } = createServerClient();

    // Check the role in Supabase database
    const { data, error } = await supabase
      .from("users")
      .select("is_admin, is_banned")
      .eq("clerk_id", userId)
      .single();

    if (error || !data) {
      console.error("Error checking role in Supabase:", error);
      return false;
    }

    // Check if user is banned first
    if (data.is_banned) {
      return false;
    }

    // Check for specific roles
    if (role === "admin") {
      return data.is_admin === true;
    }

    // Add more role checks here as needed

    return false;
  } catch (error) {
    console.error("Error in checkRoleSupabase:", error);
    return false;
  }
};
