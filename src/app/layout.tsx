import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LEGALMAPS | Nantes - Information & Sécurité Citoyenne",
  description:
    "Application citoyenne d'orientation, sécurité et réduction des risques pour manifestations et mouvements sociaux à Nantes.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LEGALMAPS",
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark bg-black text-white h-full">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="h-full w-full overflow-hidden select-none antialiased bg-black text-white overscroll-none">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  var base = window.location.pathname.startsWith('/legalmap') ? '/legalmap' : '';
                  navigator.serviceWorker.register(base + '/sw.js').then(function(reg) {
                    console.log('[LEGALMAPS] ServiceWorker actif:', reg.scope);
                  }).catch(function(err) {
                    console.warn('[LEGALMAPS] Erreur ServiceWorker:', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}

