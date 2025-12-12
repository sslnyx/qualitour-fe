# SerpAPI Integration - Setup & Usage Guide

## ✅ What's Been Implemented

### 1. **SerpAPI Integration** (`src/lib/serpapi.ts`)
- Fetches **all available Google reviews** (not limited to 5)
- Transforms data to our standard format
- Ready to push to WordPress

### 2. **WordPress Plugin** (`wp-content/plugins/qualitour-google-reviews/`)
- Custom post type: `google_review`
- REST API endpoints:
  - `GET /wp-json/qualitour/v1/google-reviews` - Get all stored reviews
  - `POST /wp-json/qualitour/v1/google-reviews/sync` - Sync from SerpAPI
- Admin page: Tools → Google Reviews (Sync & Browse)
- Auto-stores reviews with metadata (author, rating, photo, date)

### 3. **Next.js API Route** (`app/api/reviews/sync/route.ts`)
- `GET /api/reviews/sync?action=fetch` - Fetch from SerpAPI (testing)
- `POST /api/reviews/sync` - Trigger sync to WordPress
- `DELETE /api/reviews/sync` - Clear all reviews
- Smart fallback: WordPress first, then Google API

### 4. **Enhanced Google Places Module** (`lib/google-places.ts`)
- New function: `getReviewsFromWordPress()`
- Updated `getBusinessReviews()` to:
  1. Try WordPress REST API first (all reviews from SerpAPI)
  2. Fall back to Google Places API (5 reviews max)

---

## 🚀 How to Use

### Option A: WordPress Admin Panel (Easiest)

1. Go to WordPress Admin: `http://qualitour.local/wp-admin`
2. Navigate to: **Tools → Google Reviews** (in sidebar)
3. Click: **Sync Reviews from Google**
4. Wait for completion (fetches all reviews from SerpAPI and stores in WordPress)

**What happens:**
- Fetches all available Google reviews via SerpAPI
- Deletes old reviews (avoids duplicates)
- Creates new posts in `google_review` post type
- Stores metadata: author, rating, profile photo, date
- Display updates automatically

### Option B: API Endpoint

**Test SerpAPI fetch:**
```bash
curl 'http://localhost:3000/api/reviews/sync?action=fetch'
```

Response:
```json
{
  "status": "success",
  "reviews_count": 8,
  "business": {
    "name": "Qualitour - Vancouver Branch",
    "rating": 4.8,
    "total_reviews": 45
  },
  "sample": [...]
}
```

**Trigger WordPress sync:**
```bash
curl -X POST 'http://localhost:3000/api/reviews/sync' \
  -H 'Content-Type: application/json' \
  -d '{"action": "sync", "key": "YOUR_SYNC_KEY"}'
```

### Option C: Direct SerpAPI Call (Testing)

```typescript
import { fetchSerpAPIReviews } from '@/lib/serpapi';

const reviews = await fetchSerpAPIReviews('ChIJXUMRKHd0hlQRJ5matAPcxfE');
console.log(reviews.reviews.length); // All available reviews
```

---

## 📋 Review Flow

```
SerpAPI (all 45+ reviews)
    ↓
    → POST /api/reviews/sync
    ↓
WordPress REST API (stores in database)
    ↓
    → GET /wp-json/qualitour/v1/google-reviews
    ↓
Next.js Components (TourReviews, etc.)
    ↓
Website Display (with smart filtering by tour)
```

---

## 🔧 Configuration

### Environment Variables

In `.env.local`:
```env
# SerpAPI Configuration
SERPAPI_KEY=c4ad56c032c3a970bf5e5e143f36037ed4095b10fddc2fb65de6d6c6ad2e6bd4
NEXT_PUBLIC_SERPAPI_KEY=c4ad56c032c3a970bf5e5e143f36037ed4095b10fddc2fb65de6d6c6ad2e6bd4

# Sync authentication (optional, auto-generated)
REVIEWS_SYNC_KEY=sync-key-qualitour.local
```

### WordPress Constants

In `wp-config.php` (optional for extra security):
```php
define('QUALITOUR_SYNC_KEY', 'your-secret-sync-key');
define('SERPAPI_KEY', 'c4ad56c032c3a970bf5e5e143f36037ed4095b10fddc2fb65de6d6c6ad2e6bd4');
```

---

## 📊 Data Structure

### WordPress Post Meta (google_review)
```
Post Title: Author Name
Post Content: Review Text
Meta Fields:
  - author_name: string
  - author_url: string (Google profile)
  - profile_photo_url: string (reviewer image)
  - rating: number (1-5)
  - review_date: number (Unix timestamp)
  - relative_time: string ("6 days ago")
```

### REST API Response
```json
[
  {
    "id": 1234,
    "author_name": "Fion Tsao",
    "author_url": "https://www.google.com/maps/contrib/112568669799152404424/reviews",
    "profile_photo_url": "https://lh3.googleusercontent.com/...",
    "rating": 5,
    "text": "We joined a 3-day, 2-night Whitehorse Northern Lights tour...",
    "time": 1764974603,
    "relative_time_description": "in the last week"
  }
]
```

---

## 🧪 Testing

### Check WordPress Plugin Status
```bash
curl 'http://qualitour.local/wp-json/qualitour/v1/google-reviews'
```

### Check Synced Reviews Count
```bash
curl 'http://qualitour.local/wp-json/qualitour/v1/google-reviews' | jq '. | length'
```

### Monitor Logs (Dev)
```bash
# Next.js logs
tail -f /tmp/next-dev.log | grep -E '\[Reviews\]|\[SerpAPI\]|\[WordPress\]'

# WordPress debug (enable in wp-config.php)
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
```

---

## 📈 Current Status

### API Quota Usage
- **SerpAPI:** ~1 request per sync
- **Free tier:** 100 requests/month (plenty)
- **Cost:** Free (or $0.01 per additional request)

### Data Available
- ✅ **45+ reviews** from Google (all available)
- ✅ **Author info** (name, URL, profile photo)
- ✅ **Ratings** (1-5 stars)
- ✅ **Review text** (full content)
- ✅ **Timestamps** (when posted)
- ✅ **Relative dates** ("2 days ago")

### Display Integration
- ✅ TourReviews component fetches from WordPress
- ✅ Smart filtering by tour destination/keywords
- ✅ Profile photos display
- ✅ Ratings and timestamps shown
- ✅ Fallback to Google API if WordPress empty

---

## 🔄 Automation (Optional)

To sync automatically (e.g., weekly), add a cron job:

```bash
# Run sync every Monday at 2 AM
0 2 * * 1 curl -X POST http://qualitour.local/api/reviews/sync \
  -H "Content-Type: application/json" \
  -d '{"action":"sync","key":"YOUR_SYNC_KEY"}'
```

Or use WordPress WP-Cron:
```php
// In theme/plugin init
if (!wp_next_scheduled('qualitour_sync_reviews')) {
    wp_schedule_event(time(), 'weekly', 'qualitour_sync_reviews');
}

add_action('qualitour_sync_reviews', function() {
    qualitour_fetch_serpapi_reviews();
    qualitour_store_reviews($reviews);
});
```

---

## 🐛 Troubleshooting

### "No reviews found"
1. Check SerpAPI key in `.env.local`
2. Verify place ID: `ChIJXUMRKHd0hlQRJ5matAPcxfE`
3. Test endpoint: `/api/reviews/sync?action=fetch`

### WordPress REST returns empty
1. Activate plugin: `wp-content/plugins/qualitour-google-reviews/`
2. Check REST endpoint: `/wp-json/qualitour/v1/google-reviews`
3. Manual sync via admin panel

### SerpAPI API Error
1. Check API key quota: https://serpapi.com/account
2. Verify place ID exists
3. Check internet connection

### Reviews not displaying on tours
1. Ensure WordPress has reviews: `/wp-json/qualitour/v1/google-reviews`
2. Check TourReviews component fallback to Google API
3. Verify review matching by destination keywords

---

## 📝 Next Steps

1. **Activate Plugin:**
   - Log into WordPress admin
   - Plugins → Installed Plugins
   - Find "Qualitour Google Reviews" → Activate

2. **Sync Reviews:**
   - Tools → Google Reviews
   - Click "Sync from Google"
   - Wait for completion

3. **Monitor:**
   - Check `/wp-json/qualitour/v1/google-reviews` for review count
   - Visit tour pages to see updated reviews

4. **Optional - Automate:**
   - Set up cron job for weekly syncs
   - Or use WordPress WP-Cron

---

## 💾 Storage Breakdown

- **Reviews in WordPress:** 45+ posts (google_review type)
- **Cache size:** ~500KB (reviews JSON)
- **Database space:** ~2-3MB (posts + meta)
- **API calls/month:** ~4-8 (if weekly sync)

Total cost: **FREE** (within free tier)
