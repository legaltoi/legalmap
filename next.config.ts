import type { NextConfig } from "next";

// Content Security Policy stricte (Défense en profondeur)
const cspHeader = `
  default-src 'self';
  script-src 'self' 'wasm-unsafe-eval';
  worker-src 'self' blob:;
  child-src 'self' blob:;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://*.basemaps.cartocdn.com https://*.tile.openstreetmap.org;
  font-src 'self' data:;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.basemaps.cartocdn.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
`
  .replace(/\s{2,}/g, " ")
  .trim();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // Supprime l'en-tête X-Powered-By pour réduire l'empreinte de reconnaissance
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "no-referrer",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), payment=(), usb=(), bluetooth=(), geolocation=(self)",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "off",
          },
        ],
      },
      {
        source: "/tiles/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "Accept-Ranges",
            value: "bytes",
          },
        ],
      },
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Content-Type",
            value: "application/manifest+json",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
