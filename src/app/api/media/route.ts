function getEnv(key: string): string | undefined {
  // Cloudflare Workers may not define `process`.
  if (typeof process !== 'undefined' && (process as any).env) {
    return (process as any).env[key];
  }

  return undefined;
}

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

  const apiUrl = getEnv('NEXT_PUBLIC_WORDPRESS_API_URL') || getEnv('WORDPRESS_API_URL');
  const customApiUrl =
    getEnv('NEXT_PUBLIC_WORDPRESS_CUSTOM_API_URL') || getEnv('WORDPRESS_CUSTOM_API_URL');

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

  const username = getEnv('WORDPRESS_AUTH_USER') || '';
  const password = getEnv('WORDPRESS_AUTH_PASS') || '';
  const hasAuth = Boolean(username && password);

  const headers: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (compatible; Qualitour-MediaProxy/1.0)',
    Accept: request.headers.get('Accept') || '*/*',
  };

  if (hasAuth) {
    headers.Authorization = `Basic ${toBase64(`${username}:${password}`)}`;
  }

  // Use a short timeout to prevent CPU from being held up waiting
  // on slow upstream connections (especially Local Sites tunnels).
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  let upstream: Response;
  try {
    upstream = await fetch(target.toString(), {
      headers,
      signal: controller.signal,
      // Tell Cloudflare to cache at edge aggressively.
      cf: {
        cacheEverything: true,
        cacheTtl: 60 * 60 * 24 * 30, // 30 days
        cacheTtlByStatus: {
          '200-299': 60 * 60 * 24 * 30, // 30 days for success
          '404': 60, // 1 minute for not found
          '500-599': 0, // Don't cache errors
        },
      },
    } as any);
  } catch (e) {
    clearTimeout(timeoutId);
    const message = e instanceof Error ? e.message : String(e);
    const isTimeout = message.includes('abort') || message.includes('timeout');
    return new Response(
      isTimeout ? 'Upstream timeout' : `Fetch failed: ${message}`,
      {
        status: isTimeout ? 504 : 502,
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  }

  clearTimeout(timeoutId);

  if (!upstream.ok) {
    return new Response(`Upstream error: ${upstream.status}`, {
      status: upstream.status,
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  const contentType = upstream.headers.get('content-type') || 'application/octet-stream';

  // Stream the response body directly to minimize CPU usage.
  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      // Long-term cache for images - they rarely change.
      'Cache-Control': 'public, max-age=31536000, immutable',
      // Help Cloudflare's edge cache.
      'CDN-Cache-Control': 'public, max-age=31536000',
    },
  });
}
