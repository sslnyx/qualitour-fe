import type { NextConfig } from "next";

if (process.env.NODE_ENV === "development") {
  try {
    // Cloudflare CI environments may omit dev tooling; keep this optional.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { initOpenNextCloudflareForDev } = require("@opennextjs/cloudflare");
    initOpenNextCloudflareForDev();
  } catch {
    // no-op
  }
}

const nextConfig: NextConfig = {
  // Enable CDN caching of HTML pages
  // This tells Cloudflare to cache full HTML responses at the edge
  // so the Worker only runs ONCE per cache TTL (5 min for pages)
  async headers() {
    return [
      {
        // Cache HTML pages at CDN for 5 minutes, stale-while-revalidate for 1 hour
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=3600',
          },
        ],
      },
      {
        // Static tour pages - cache longer (15 min)
        source: '/tours/:slug',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=900, stale-while-revalidate=3600',
          },
        ],
      },
      {
        // Static pages - cache even longer (1 hour)
        source: '/(about-us|contact|faq|privacy-policy|visa)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'qualitour.local',
        port: '',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'qualitour.local',
        port: '',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh4.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh5.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh6.googleusercontent.com',
      },
    ],
    // Disable Next.js image optimization (avoids requiring Cloudflare Images binding)
    unoptimized: true,
  },
};

export default nextConfig;
