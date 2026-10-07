import type { NextConfig } from "next";

// Détecte si le build est exécuté pour GitHub Pages
const isGitHubPages =
  process.env.GITHUB_PAGES === "true" ||
  process.env.GITHUB_ACTIONS === "true" ||
  process.env.NEXT_PUBLIC_BASE_PATH === "/legalmap";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || (isGitHubPages ? "/legalmap" : "");

// Content Security Policy stricte (Défense en profondeur - Zéro tiers cartographiques)
const cspHeader = `
  default-src 'self';
  script-src 'self' 'wasm-unsafe-eval';
  worker-src 'self' blob:;
  child-src 'self' blob:;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://*.openfreemap.org https://demotiles.maplibre.org;
  font-src 'self' data: https://*.openfreemap.org https://demotiles.maplibre.org;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.openfreemap.org https://demotiles.maplibre.org;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
`
  .replace(/\s{2,}/g, " ")
  .trim();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  basePath: basePath || undefined,
  // Export statique strict pour GitHub Pages
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Les en-têtes HTTP ne sont applicables qu'en mode serveur (hors export statique strict)
  ...(isGitHubPages
    ? {}
    : {
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
                  value:
                    "camera=(), microphone=(), payment=(), usb=(), bluetooth=(), geolocation=(self)",
                },
                {
                  key: "X-DNS-Prefetch-Control",
                  value: "off",
                },
              ],
            },
          ];
        },
      }),
};

export default nextConfig;
