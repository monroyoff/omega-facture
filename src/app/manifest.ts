import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'OMEGA FACTURE — Facturation, Devis & Pilotage UEMOA',
    short_name: 'OMEGA FACTURE',
    description: 'SaaS B2B de facturation, devis et pilotage financier pour les entreprises de la zone UEMOA en FCFA.',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#070a0f',
    theme_color: '#0284c7',
    categories: ['finance', 'business', 'productivity'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
