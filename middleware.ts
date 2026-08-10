import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Neon Auth middleware — protects quiz and progress routes
// Routes are public by default. Add paths to `protectedPaths` to require auth.
// Set NEON_AUTH_PUBLIC_KEY env var in Vercel for production.

const protectedPaths = ["/api/irt-score", "/api/progress"];

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check if this is a protected path
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  if (!isProtected) return NextResponse.next();

  // For now, allow all requests — auth enforcement is additive
  // Uncomment below to require Neon Auth token:
  // const authHeader = req.headers.get("authorization");
  // if (!authHeader) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
