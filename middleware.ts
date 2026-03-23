import { NextRequest, NextResponse } from "next/server";
import { verifyTokenFromString } from "@/lib/auth";

const publicApiPrefixes = [
  "/api/auth/register",
  "/api/auth/login",
  "/api/auth/logout",
];
const protectedPages = ["/feed", "/profile/me"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;
  const user = token ? await verifyTokenFromString(token) : null;

  if (pathname === "/login" || pathname === "/register") {
    if (user) return NextResponse.redirect(new URL("/feed", req.url));
    return NextResponse.next();
  }

  const isProtectedPage = protectedPages.some((route) =>
    pathname.startsWith(route),
  );
  if (isProtectedPage && !user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/api/")) {
    const isPublicApi = publicApiPrefixes.some((route) =>
      pathname.startsWith(route),
    );
    if (!isPublicApi && !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
