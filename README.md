# Qualitour Frontend

Next.js frontend for the Qualitour headless WordPress site.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **WordPress REST API** - Content management

## Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Home page (lists posts)
│   ├── posts/[slug]/        # Dynamic post pages
│   └── layout.tsx           # Root layout
├── lib/
│   └── wordpress/           # WordPress API integration
│       ├── api.ts           # API functions
│       ├── types.ts         # TypeScript types
│       └── index.ts         # Exports
```

## Getting Started

### Prerequisites

1. WordPress running at `http://qualitour.local` (via Local)
2. Node.js 18+ installed

### Installation

1. Install dependencies:
```bash
npm install
```

2. Environment variables are already set in `.env.local`:
```
NEXT_PUBLIC_WORDPRESS_API_URL=http://qualitour.local/wp-json/wp/v2
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## WordPress Configuration

Make sure your WordPress installation has:

1. **CORS enabled** - Already configured in nginx
2. **REST API enabled** - Enabled by default in WordPress
3. **Posts created** - Create some posts in WordPress admin

## Available API Functions

```typescript
import { 
  getPosts, 
  getPostBySlug,
  getPages,
  getPageBySlug,
  getCategories,
  getTags,
  searchPosts 
} from '@/lib/wordpress';

// Get all posts
const posts = await getPosts({ per_page: 10 });

// Get single post
const post = await getPostBySlug('my-post-slug');

// Search posts
const results = await searchPosts('query');
```

## Development

- **Dev server**: `npm run dev`
- **Build**: `npm run build`
- **Start production**: `npm start`
- **Lint**: `npm run lint`

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variable: `NEXT_PUBLIC_WORDPRESS_API_URL`
4. Deploy!

### Environment Variables for Production

```
NEXT_PUBLIC_WORDPRESS_API_URL=https://cms.qualitour.com/wp-json/wp/v2
```

Update WordPress CORS settings to allow your production domain.

## WordPress Plugins (Optional)

For enhanced functionality:

- **JWT Authentication for WP REST API** - For authenticated requests
- **ACF to REST API** - Expose ACF fields in REST API
- **Yoast SEO** - SEO data in REST API
- **Headless Mode** - Disable WordPress frontend

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [WordPress REST API](https://developer.wordpress.org/rest-api/)
- [Headless WordPress](https://developer.wordpress.org/rest-api/using-the-rest-api/headless-wordpress/)
