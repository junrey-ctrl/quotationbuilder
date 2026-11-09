import { next } from '@vercel/functions';

const ALLOWED_EMAILS = new Set(['junrey@skylarasia.com']);
const COOKIE_NAME = 'skylar_access_token';

function cookieValue(header, name) {
  for (const part of String(header || '').split(';')) {
    const index = part.indexOf('=');
    if (index < 0) continue;
    if (part.slice(0, index).trim() === name) {
      try { return decodeURIComponent(part.slice(index + 1).trim()); } catch { return ''; }
    }
  }
  return '';
}

function unauthorized(request, api = false, clearCookie = false) {
  const headers = new Headers({ 'Cache-Control': 'no-store' });
  if (clearCookie) headers.append('Set-Cookie', COOKIE_NAME + '=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Lax');
  if (api) {
    headers.set('Content-Type', 'application/json; charset=utf-8');
    return new Response(JSON.stringify({ error: 'Authentication required' }), { status: 401, headers });
  }
  const url = new URL('/login.html', request.url);
  url.searchParams.set('next', request.nextUrl?.pathname || new URL(request.url).pathname);
  headers.set('Location', url.toString());
  return new Response(null, { status: 307, headers });
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  if (path === '/login.html') return next();

  // OAuth provider callbacks and the public Supabase bootstrap config must be reachable
  // before a user has an application session. Every other API operation is guarded.
  const socialPublic = path === '/api/social' && ['config', 'callback'].includes(url.searchParams.get('op') || 'config');
  if (socialPublic) return next();

  const supabaseUrl = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !publishableKey) {
    return new Response('Authentication is temporarily unavailable. Contact the Skylar administrator.', {
      status: 503,
      headers: { 'Cache-Control': 'no-store', 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const api = path.startsWith('/api/');
  const token = cookieValue(request.headers.get('cookie'), COOKIE_NAME);
  if (!token || token.length > 8192) return unauthorized(request, api);

  try {
    const response = await fetch(supabaseUrl.replace(/\/$/, '') + '/auth/v1/user', {
      method: 'GET',
      headers: { apikey: publishableKey, Authorization: 'Bearer ' + token },
      cache: 'no-store',
    });
    if (!response.ok) return unauthorized(request, api, true);
    const user = await response.json();
    const email = String(user.email || '').toLowerCase();
    if (!user.email_confirmed_at || !ALLOWED_EMAILS.has(email)) return unauthorized(request, api, true);
    return next();
  } catch {
    return new Response(api ? JSON.stringify({ error: 'Unable to verify session' }) : 'Unable to verify your Skylar Desk session. Please retry.', {
      status: 503,
      headers: { 'Cache-Control': 'no-store', 'Content-Type': api ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8' },
    });
  }
}

export const config = {
  matcher: ['/((?!login\\.html$).*)'],
};

[executed on device: MSI (864cdbb2-925e-4012-9a0d-c0374f6639f0)]