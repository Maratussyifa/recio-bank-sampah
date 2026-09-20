import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value?.toUpperCase();
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isUserRoute = pathname.startsWith("/nasabah");
  const isAuthRoute = pathname === "/login" || pathname === "/register";

  // 1. Jika mencoba akses halaman terproteksi tanpa token ATAU tanpa role valid
  if ((isAdminRoute || isUserRoute) && (!token || !role)) {
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete("token");
    res.cookies.delete("role");
    return res;
  }

  // 2. Jika sudah login (punya token & role), cegah masuk ke halaman login/register
  if (isAuthRoute && token && role) {
    const target = role === "ADMIN" ? "/admin/dashboard" : "/nasabah/dashboard";
    return NextResponse.redirect(new URL(target, req.url));
  }

  // 3. Jika Nasabah mencoba akses rute khusus Admin (/admin/*)
  if (isAdminRoute && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/nasabah/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/nasabah/:path*", "/admin/:path*", "/login", "/register"],
};