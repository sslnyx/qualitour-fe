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
  try {
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
      // Some origins block unknown UAs.
      'User-Agent': 'Mozilla/5.0 (compatible; Qualitour-MediaProxy/1.0)',
      // Optional: pass through accept to help origin choose correct format.
      Accept: request.headers.get('Accept') || '*/*',
    };

    if (hasAuth) {
      headers.Authorization = `Basic ${toBase64(`${username}:${password}`)}`;
    }

    let upstream: Response;
    try {
      upstream = await fetch(target.toString(), {
        headers,
        // Cache at the edge where possible (Cloudflare Workers fetch option).
        cf: { cacheEverything: true, cacheTtl: 60 * 60 * 24 * 7 },
      } as any);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      return new Response(
        `Fetch failed. host=${target.hostname} path=${target.pathname}\n` +
          `hasAuth=${hasAuth}\n` +
          `error=${message}`,
        { status: 502, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (!upstream.ok) {
      const wwwAuth = upstream.headers.get('www-authenticate') || '';
      return new Response(
        `Upstream error: ${upstream.status}\n` +
          `host=${target.hostname} path=${target.pathname}\n` +
          `hasAuth=${hasAuth}\n` +
          (wwwAuth ? `www-authenticate=${wwwAuth}\n` : ''),
        { status: upstream.status, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    const cacheControl = upstream.headers.get('cache-control');

    return new Response(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // Prefer origin cache-control if present, otherwise allow long-term caching.
        'Cache-Control': cacheControl || 'public, max-age=31536000, immutable',
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return new Response(`Internal error: ${message}`, {
      status: 500,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}
