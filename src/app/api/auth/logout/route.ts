import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST() {
  const response = NextResponse.json({ success: true });

  try {
    const supabase = createClient();
    await supabase.auth.signOut({ scope: 'global' });
  } catch (e) {
    console.warn('[API logout] Supabase signOut error:', e);
  }

  try {
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();
    for (const c of allCookies) {
      if (
        c.name.startsWith('sb-') ||
        c.name.includes('auth-token') ||
        c.name.includes('supabase')
      ) {
        response.cookies.set(c.name, '', {
          path: '/',
          maxAge: 0,
          expires: new Date(0),
          sameSite: 'lax',
        });
      }
    }
  } catch (e) {
    console.warn('[API logout] Cookie clear error:', e);
  }

  return response;
}
