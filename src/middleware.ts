// Middleware for Clerk authentication
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/home",
  "/blog(.*)",
  "/projects(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/me(.*)",
  "/api/blogs(.*)",
  "/api/projects(.*)",
  "/api/ai/chatbot(.*)",
]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  
  // Protect admin routes with Supabase role check
  if (isAdminRoute(req) && userId) {
    // Check if admin in Supabase
    try {
      const supabase = createServerClient();
      const { data, error } = await supabase
        .from("users")
        .select("is_admin, is_banned")
        .eq("clerk_id", userId)
        .single();
      
      // Redirect if not admin or banned
      if (error || !data || !data.is_admin || data.is_banned) {
        const url = new URL("/", req.url);
        return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error("Error checking admin status in middleware:", error);
      const url = new URL("/", req.url);
      return NextResponse.redirect(url);
    }
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
// Middleware for Clerk authentication
// import { clerkMiddleware } from '@clerk/nextjs/server'

// export default clerkMiddleware()

// export const config = {
//   matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
// }
