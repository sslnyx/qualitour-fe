/**
 * Get WordPress base URL for static assets (images, etc.)
 * 
 * In production, this should point to the production WordPress server.
 * In development, this points to the local WordPress instance.
 * 
 * Usage:
 *   const imageUrl = `${getWpBaseUrl()}/wp-content/uploads/2020/10/image.jpg`;
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

    // Fallback for production - update this if your production WP URL is different
    if (process.env.NODE_ENV === 'production') {
        // This should be your production WordPress URL
        console.warn('[getWpBaseUrl] No WordPress origin configured. Using fallback.');
        return 'https://handsome-cellar.localsite.io';
    }

    // Development fallback
    return 'http://qualitour.local';
}

/**
 * Convert a local WordPress URL to use the current environment's WordPress base.
 * Useful for hardcoded local URLs that need to work in production.
 * 
 * @param localUrl - URL like 'http://qualitour.local/wp-content/uploads/...'
 * @returns Fixed URL using the current environment's WordPress base
 */
export function wpUrl(localUrl: string): string {
    // If it's a relative path, just return it
    if (localUrl.startsWith('/')) {
        return `${getWpBaseUrl()}${localUrl}`;
    }

    // If it's already a full URL, extract the path and rebuild
    try {
        const parsed = new URL(localUrl);
        const path = parsed.pathname + parsed.search + parsed.hash;
        return `${getWpBaseUrl()}${path}`;
    } catch {
        return localUrl;
    }
}
