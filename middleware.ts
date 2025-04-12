import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)"
])

// Routes that require organization selection
const requiresOrganization = createRouteMatcher([
  "/dashboard(.*)",
  "/transactions(.*)",
  "/report(.*)",
  "/data-master(.*)"
])

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgId } = await auth()

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // Protect all non-public routes
  if (!userId) {
    await auth.protect()
  }

  // Check if route requires organization
  if (requiresOrganization(req)) {
    // If no organization is selected and we're not already on organization-related pages
    if (!orgId && 
        !req.nextUrl.pathname.startsWith('/create-organization') && 
        !req.nextUrl.pathname.startsWith('/switch-organization')) {
      return NextResponse.redirect(new URL('/switch-organization', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}