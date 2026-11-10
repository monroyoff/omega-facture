import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  let version =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    process.env.BUILD_ID ||
    '';

  let timestamp = Date.now();

  if (!version) {
    try {
      const vPath = path.join(process.cwd(), 'public', 'version.json');
      if (fs.existsSync(vPath)) {
        const raw = fs.readFileSync(vPath, 'utf8');
        const parsed = JSON.parse(raw);
        version = parsed.version || '';
        timestamp = parsed.buildTime || timestamp;
      }
    } catch {
      version = '1.0.9';
    }
  }

  return NextResponse.json(
    {
      version: version || '1.0.9',
      timestamp,
      serverTime: new Date().toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        Pragma: 'no-cache',
        Expires: '0',
      },
    }
  );
}

