import type { NextConfig } from "next";

/*
  Daily note 2026-09-25, "security and standard web practices". Response
  headers every page and route carries. The content security policy is kept
  to the directives that cannot break the room model, the GSAP and Lenis
  scripts, the LinkedIn embeds or the map: it forbids framing by other sites,
  plugins, and a rewritten base URL, and pins form posts to this origin.
  Widening it to script-src is a change to make with the preview open, not
  here by guesswork.
*/
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'; form-action 'self'" },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  // The admin dashboard uploads photographs through server actions.
  experimental: {
    serverActions: { bodySizeLimit: "8mb" },
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      // Internal tooling: never indexed, never cached by a shared cache.
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "Cache-Control", value: "private, no-store" }] },
    ];
  },
};

export default nextConfig;
