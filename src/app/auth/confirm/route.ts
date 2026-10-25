import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  // Next destination
  const redirectTarget = new URL('/confirm-email', origin);
  if (token) redirectTarget.searchParams.set('token', token);
  if (email) redirectTarget.searchParams.set('email', email);
  redirectTarget.searchParams.set('verified', 'true');

  if (code) {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(redirectTarget.toString());
      }
    } catch (e) {
      console.error('[Auth Confirm] Code exchange error:', e);
    }
  }

  if (token_hash && type) {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        type: type as any,
        token_hash,
      });
      if (!error) {
        return NextResponse.redirect(redirectTarget.toString());
      }
    } catch (e) {
      console.error('[Auth Confirm] verifyOtp error:', e);
    }
  }

  return NextResponse.redirect(redirectTarget.toString());
}
