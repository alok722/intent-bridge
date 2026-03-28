import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Security middleware — attaches hardened HTTP headers to every response.
 *
 * Headers applied:
 *  - X-Frame-Options: DENY (clickjacking protection)
 *  - X-Content-Type-Options: nosniff (MIME sniffing prevention)
 *  - Referrer-Policy: strict-origin-when-cross-origin
 *  - Permissions-Policy: restricts camera/geolocation, allows mic for voice input
 *  - Content-Security-Policy: allowlist for self, Gemini API, fonts, and GA4
 *  - Strict-Transport-Security: enforce HTTPS in production
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function middleware(_request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(self), geolocation=()",
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://www.google-analytics.com https://www.googletagmanager.com",
      "media-src 'self' blob:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://generativelanguage.googleapis.com https://www.google-analytics.com https://analytics.google.com https://firestore.googleapis.com https://translation.googleapis.com",
    ].join("; "),
  );

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
