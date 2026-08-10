import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/api/irt-score"];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  if (!isProtected) return NextResponse.next();

  const authBaseUrl = process.env.NEON_AUTH_BASE_URL;
  if (!authBaseUrl) return NextResponse.next();

  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const verifyUrl = `${authBaseUrl}/verify`;
    const verifyRes = await fetch(verifyUrl, {
      headers: { authorization: authHeader },
    });

    if (!verifyRes.ok) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = await verifyRes.json();
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", user.sub || user.id);

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    return NextResponse.json({ error: "Auth verification failed" }, { status: 500 });
  }
}

export const config = {
  matcher: ["/api/irt-score"],
};
