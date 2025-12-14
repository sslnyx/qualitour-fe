export const runtime = 'edge';

function toBase64(value: string): string {
  // Node.js (in case this ever runs in node runtime)
  if (typeof (globalThis as any).Buffer !== 'undefined') {
    return (globalThis as any).Buffer.from(value).toString('base64');
  }

  if (typeof globalThis.btoa === 'function') {
    const utf8 = new TextEncoder().encode(value);
    let binary = '';
    for (const byte of utf8) binary += String.fromCharCode(byte);
    return globalThis.btoa(binary);
  }

  throw new Error('No base64 encoder available in this runtime');
}

function isAllowedMediaUrl(url: URL): boolean {
  // Prevent SSRF: only proxy WordPress uploads.
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;
  if (!url.pathname.startsWith('/wp-content/uploads/')) return false;

  // Allow Local Live Link tunnels and the configured WP origin.
  if (url.hostname.endsWith('.localsite.io')) return true;

  const apiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || process.env.WORDPRESS_API_URL;
  const customApiUrl =
    process.env.NEXT_PUBLIC_WORDPRESS_CUSTOM_API_URL ||
    process.env.WORDPRESS_CUSTOM_API_URL;

  const candidates = [apiUrl, customApiUrl].filter(Boolean) as string[];
  for (const candidate of candidates) {
    try {
      const parsed = new URL(candidate);
      if (parsed.hostname === url.hostname) return true;
    } catch {
      // ignore
    }
  }

  return false;
}

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get('url');

  if (!raw) {
    return new Response('Missing url', { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return new Response('Invalid url', { status: 400 });
  }

  if (!isAllowedMediaUrl(target)) {
    return new Response('URL not allowed', { status: 400 });
  }

  const username = process.env.WORDPRESS_AUTH_USER || '';
  const password = process.env.WORDPRESS_AUTH_PASS || '';

  const headers: Record<string, string> = {
    // Some origins block unknown UAs.
    'User-Agent': 'Mozilla/5.0 (compatible; Qualitour-MediaProxy/1.0)',
    // Optional: pass through accept to help origin choose correct format.
    Accept: request.headers.get('Accept') || '*/*',
  };

  if (username && password) {
    headers.Authorization = `Basic ${toBase64(`${username}:${password}`)}`;
  }

  const upstream = await fetch(target.toString(), {
    headers,
    // Cache at the edge where possible.
    cf: { cacheEverything: true, cacheTtl: 60 * 60 * 24 * 7 },
  } as any);

  if (!upstream.ok) {
    return new Response(`Upstream error: ${upstream.status}`, { status: upstream.status });
  }

  const contentType = upstream.headers.get('content-type') || 'application/octet-stream';

  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      // Allow shared caching; browsers can cache aggressively.
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
