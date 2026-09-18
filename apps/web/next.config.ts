import type { NextConfig } from "next";

// Same fallback api.ts itself uses, so the CSP always whitelists whichever
// backend this build will actually call.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081";

// 'unsafe-inline' on script-src and style-src is a deliberate, pragmatic
// tradeoff, not an oversight: Next.js's own hydration bootstrap script
// needs it without a per-request nonce (which would need middleware), and
// this app uses React inline `style={{...}}` extensively for per-object
// accent colors — rewriting either to be nonce/hash-based is a much larger
// change than a security-headers pass warrants. The rest of the policy
// still blocks the actual common attack shapes: no remote script/style
// origins, no plugins, no framing, no unexpected fetch/WebSocket targets.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  `connect-src 'self' ${API_BASE_URL}`,
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          // Belt-and-suspenders alongside frame-ancestors above — some
          // older browsers honor X-Frame-Options but not CSP.
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default nextConfig;
