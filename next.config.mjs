import fs from 'fs';
import path from 'path';

let appVersion = 'dev';
let appBuildTime = 0;
try {
  const versionFile = path.join(process.cwd(), 'public', 'version.json');
  if (fs.existsSync(versionFile)) {
    const raw = fs.readFileSync(versionFile, 'utf8');
    const parsed = JSON.parse(raw);
    appVersion = parsed.version || 'dev';
    appBuildTime = parsed.buildTime || 0;
  }
} catch (e) {}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_APP_VERSION: appVersion,
    NEXT_PUBLIC_BUILD_TIME: String(appBuildTime),
  },
  async headers() {
    return [
      // 1. Pages HTML et routes dynamiques : jamais de cache agressif pour garantir l'auto-mise à jour immédiate
      {
        source: '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
      // 2. Fichiers de validation Google Search Console
      {
        source: '/google:hash*.html',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
      // 3. Digital Asset Links pour Android App Links (Google Play Store)
      {
        source: '/.well-known/assetlinks.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
      // 4. Service Worker PWA v2.0
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
        ],
      },
      // 5. Surveillance continue de version JSON (Heartbeat Auto-Update)
      {
        source: '/version.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
          {
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
      },
      // 6. Endpoint API de versioning
      {
        source: '/api/version',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
