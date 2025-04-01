// Middleware for Clerk authentication
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getCurrentUserData } from "@/utils/auth";

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
  "/api/users",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Protect admin routes with Supabase role check
  if (isAdminRoute(req) && userId) {
    // Check if admin in Supabase
    try {
      const data = await getCurrentUserData();

      // Redirect if banned
      if (data && data.is_banned) {
        const url = new URL("/trash/ban", req.url);
        return NextResponse.redirect(url);
      }

      // Redirect if not admin
      if (!data || !data.is_admin) {
        const url = new URL("/", req.url);
        return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error("Error checking admin status in middleware:", error);
      const url = new URL("/", req.url);
      return NextResponse.redirect(url);
    }
  }

  // Check if user is banned for all protected routes
  if (!isPublicRoute(req) && userId) {

    try {
      const data = await getCurrentUserData();
      if (data && data.is_banned) {
        const url = new URL("/trash/ban", req.url);
        return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error("Error checking ban status in middleware:", error);
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
