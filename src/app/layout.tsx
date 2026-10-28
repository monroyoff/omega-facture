import type { Metadata, Viewport } from 'next';
import './globals.css';
import { InvoiceProvider } from '@/lib/store/invoice-context';
import { AuthGuard } from '@/components/layout/AuthGuard';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://omegafacture.site';

export const viewport: Viewport = {
  themeColor: '#0284c7',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'OMEGA FACTURE — SaaS de Facturation, Devis & Pilotage Financier UEMOA',
    template: '%s | OMEGA FACTURE',
  },
  description:
    "Solution de facturation professionnelle pour l'Afrique francophone. Conforme UEMOA, montants en FCFA, devis, TVA, acomptes et partage WhatsApp.",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: 'OMEGA FACTURE — SaaS de Facturation & Devis UEMOA',
    description: "Solution de facturation professionnelle pour l'Afrique francophone. Conforme UEMOA, montants en FCFA, devis, TVA et partage WhatsApp.",
    url: siteUrl,
    siteName: 'OMEGA FACTURE',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OMEGA FACTURE — SaaS de Facturation & Devis UEMOA',
    description: "Solution de facturation professionnelle pour l'Afrique francophone. Conforme UEMOA, montants en FCFA, devis, TVA et partage WhatsApp.",
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'OMEGA FACTURE',
  },
  verification: {
    google: ['3cD17ybVzPuK91mNz6HBh7NQBv1UelD7HFhikEMBOFc', '5a187ae36d30dd48'],
  },
};

import { GlobalUpgradeModal } from '@/components/subscription/GlobalUpgradeModal';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className="h-full"
      suppressHydrationWarning
      style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Auto-récupération instantanée en cas d'erreur de chunk ou de cache corrompu
              window.addEventListener('error', function(event) {
                var target = event && event.target;
                var isAssetError = target && (target.tagName === 'SCRIPT' || target.tagName === 'LINK');
                var isChunkError = event && event.message && event.message.indexOf('Loading chunk') !== -1;
                if (isAssetError || isChunkError) {
                  var lockKey = 'facturo_asset_reload_timestamp';
                  var last = sessionStorage.getItem(lockKey);
                  var now = Date.now();
                  if (!last || now - parseInt(last, 10) > 8000) {
                    sessionStorage.setItem(lockKey, now.toString());
                    window.location.reload();
                  }
                }
              }, true);

              // Enregistrement du Service Worker PWA (Android / Chrome)
              if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.warn('[SW Registration Error] :', err);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body
        className="h-full bg-slate-50/70 dark:bg-[#070a0f] text-slate-900 dark:text-slate-100 antialiased font-sans"
        suppressHydrationWarning
      >
        <InvoiceProvider>
          <AuthGuard>{children}</AuthGuard>
          <GlobalUpgradeModal />
        </InvoiceProvider>
      </body>
    </html>
  );
}
