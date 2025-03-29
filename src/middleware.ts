// Middleware for Clerk authentication
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from "next/server";
const isPublicRoute = createRouteMatcher(["/home", "/blog(.*)", "/projects(.*)","/sign-in(.*)"])
const isAdminRoute = createRouteMatcher(['/admin(.*)'])

export default clerkMiddleware(async (auth, req) => {
    
    if (isAdminRoute(req) && (await auth()).sessionClaims?.metadata?.role !== 'admin') {
        const url = new URL('/', req.url)
        return NextResponse.redirect(url)
      }

  if (!isPublicRoute(req)) {
    await auth.protect()
  }

})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
// Middleware for Clerk authentication
// import { clerkMiddleware } from '@clerk/nextjs/server'

// export default clerkMiddleware()

// export const config = {
//   matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
// }