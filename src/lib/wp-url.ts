/**
 * Cloudflare R2 CDN URL for media assets.
 * This serves images directly from the edge without going through the Worker.
 */
const R2_MEDIA_URL = 'https://qualitour-assets.isquarestudio.com';

/**
 * Get WordPress base URL for API calls (not for media).
 * 
 * Usage:
 *   const apiUrl = `${getWpBaseUrl()}/wp-json/qualitour/v1/tours`;
 */
export function getWpBaseUrl(): string {
    // First try explicit origin variable
    if (process.env.NEXT_PUBLIC_WORDPRESS_ORIGIN) {
        return process.env.NEXT_PUBLIC_WORDPRESS_ORIGIN.replace(/\/$/, '');
    }

    // Derive from API URL
    const apiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || process.env.WORDPRESS_API_URL;

    if (apiUrl) {
        try {
            const parsed = new URL(apiUrl);
            return parsed.origin;
        } catch {
            // fallback
        }
    }

    // Fallback for production
    if (process.env.NODE_ENV === 'production') {
        console.warn('[getWpBaseUrl] No WordPress origin configured. Using fallback.');
        return 'https://handsome-cellar.localsite.io';
    }

    // Development fallback
    return 'http://qualitour.local';
}

/**
 * Check if a path is a WordPress media upload path.
 */
function isMediaPath(path: string): boolean {
    return path.startsWith('/wp-content/uploads/');
}

/**
 * Check if a path is a YouTube thumbnail path (simulated by some WP plugins).
 * Pattern: /vi/{video_id}/{quality}.jpg
 */
function isYouTubeThumbnail(path: string): boolean {
    return path.startsWith('/vi/');
}

/**
 * Convert a WordPress URL to use R2 CDN for media files.
 * Non-media URLs are passed through unchanged.
 * 
 * @param localUrl - URL like 'http://qualitour.local/wp-content/uploads/...' or '/wp-content/uploads/...'
 * @returns CDN URL for media, or original URL for non-media
 */
export function wpUrl(localUrl: string): string {
    // Handle relative paths
    if (localUrl.startsWith('/')) {
        if (isYouTubeThumbnail(localUrl)) {
            // Serve directly from YouTube CDN
            return `https://img.youtube.com${localUrl}`;
        }
        if (isMediaPath(localUrl)) {
            // Serve media from R2 CDN
            return `${R2_MEDIA_URL}${localUrl}`;
        }
        // Non-media paths go to WordPress
        return `${getWpBaseUrl()}${localUrl}`;
    }

    // Handle full URLs
    try {
        const parsed = new URL(localUrl);
        const path = parsed.pathname + parsed.search + parsed.hash;

        if (isYouTubeThumbnail(path)) {
            // Serve directly from YouTube CDN
            return `https://img.youtube.com${path}`;
        }

        if (isMediaPath(path)) {
            // Serve media from R2 CDN
            return `${R2_MEDIA_URL}${path}`;
        }
        // Non-media paths go to WordPress
        return `${getWpBaseUrl()}${path}`;
    } catch {
        return localUrl;
    }
}

/**
 * @deprecated Use wpUrl() instead - proxy is no longer needed with R2 CDN
 */
export function proxyIfProtectedMedia(url: string): string {
    // Keep for backwards compatibility but just return the URL
    return url;
}
