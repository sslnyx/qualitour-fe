# Google Reviews Integration with Tours

## Overview

Google reviews are now integrated with tour pages using data synced from SerpAPI via WordPress:

### 1. **Tour-Specific Reviews** (Smart Filtering)
- Component: `TourReviews.tsx`
- Automatically filters reviews from WordPress that mention the tour destination or keywords
- Displayed on each tour detail page
- Example: A "Yellowknife Aurora" tour will show reviews mentioning "Yellowknife" or "aurora"

### 2. **Profile Images**
- Reviews display reviewer profile photos
- Source: Google's `profile_photo_url` from each review (via SerpAPI)
- Used in components: `TestGoogleReviews` and `TourReviews`

### 3. **Business Reviews**
- General reviews for the business location
- Loaded from WordPress REST API (all 45+ reviews from SerpAPI)
- Used on `/reviews` and `/about-us` pages

## Data Source

**All reviews come from WordPress** which syncs them from SerpAPI. This provides access to all Google reviews, not limited to the 5 reviews returned by Google Places API.

## Components

### `TourReviews.tsx` (Server Component)
Filters reviews by tour destination and keywords:

```tsx
import TourReviews from '@/components/TourReviews';

// On tour detail page:
<TourReviews 
  tourTitle="Yellowknife Aurora Tour"
  tourDestination="yellowknife"
  limit={3}
/>
```

**Props:**
- `tourTitle` - Used to extract keywords for matching
- `tourDestination` - Destination slug to match reviews
- `limit` - Number of reviews to display (default: 5)

**How it filters:**
1. Fetches reviews from WordPress REST API
2. Looks for destination keywords in review text
3. Looks for tour title keywords
4. Returns matching reviews, defaults to showing all if no matches

### `TestGoogleReviews.tsx` (Server Component)
Full review display with business info and stats. Used on `/reviews` page. Fetches all reviews from WordPress.

## Integration on Tour Pages

Currently integrated on `/[lang]/tours/[slug]/page.tsx`:

```tsx
{/* Tour-specific reviews (filtered by destination/keywords) */}
<div className="mb-8">
  <TourReviews 
    tourTitle={tour.title.rendered}
    tourDestination={tour.destinations?.[0]?.slug}
    limit={3}
  />
</div>
```

## Review Matching Logic

### Current Strategy (Keyword-Based)

Reviews are matched to tours using:

1. **Destination Matching**
   ```
   Tour destination: "yellowknife"
   Review text: "Amazing aurora experience in Yellowknife!"
   ✓ MATCH - Contains "yellowknife"
   ```

2. **Title Keyword Matching**
   ```
   Tour title: "Yellowknife Aurora Tour"
   Review text: "The aurora lights were incredible!"
   ✓ MATCH - Contains word "aurora"
   ```

3. **No Match = Show all reviews**
   ```
   If no destination/title provided, display all available reviews
   ```

## Customization Options

### Add More Matching Logic

Edit the `filterReviewsForTour()` function in `TourReviews.tsx`:

```tsx
function filterReviewsForTour(
  reviews: GoogleReview[] = [],
  tourTitle?: string,
  tourDestination?: string
): GoogleReview[] {
  // Add custom matching here
  // Examples:
  // - Match by activity type (hiking, wildlife, etc.)
  // - Match by season (winter, summer, aurora)
  // - Match by difficulty level
  // - Match by duration
}
```

### Advanced: Add Custom Review Categories

You could create tour-specific review sections:

```tsx
// Example: Wildlife tour reviews only
<TourReviews 
  tourTitle="Denali Wildlife Safari"
  tourDestination="alaska"
  limit={5}
/>

// Example: Winter activity reviews
<TourReviews 
  tourTitle="Whistler Ski Package"
  tourDestination="whistler"
  limit={5}
/>
```

## Performance

- **Server-side filtering**: Reviews fetched and filtered on server
- **ISR Caching**: Reviews cached for 1 hour (configurable)
- **Efficient**: Only relevant reviews displayed per tour

## Data Flow

```
Tour Page
  ↓
TourReviews Component
  ↓
getBusinessReviews() [Server]
  ↓
Google Places API
  ↓
Reviews with profile photos
  ↓
Filtered by destination/keywords
  ↓
Display top N reviews
```

## Current Reviews Data

- **Place ID**: `ChIJXUMRKHd0hlQRJ5matAPcxfE` (Qualitour Vancouver)
- **Business Rating**: [Your rating]
- **Total Reviews**: [Count from Google]
- **Data**: Name, address, rating, reviews with author photos

## Future Enhancements

1. **Review Moderation**: Filter inappropriate reviews
2. **Custom Reviews**: Add Qualitour-specific reviews system
3. **Sorting**: Sort by rating, date, relevance
4. **Pagination**: Load more reviews on demand
5. **Activity-Based Filtering**: Match by activity type
6. **Seasonal Reviews**: Show seasonal reviews prominently
7. **Review Analytics**: Track which reviews drive bookings

## Troubleshooting

### No reviews showing on tour page
- Check if reviews mention the destination/keywords
- Verify Google Place ID is correct
- Ensure API key is working (test with `/reviews` page)

### Reviews show but not filtered correctly
- Update destination slug to match review keywords
- Add more keywords to tour title
- Modify `filterReviewsForTour()` function

### Profile photos not loading
- Check image URLs are accessible
- Verify Google's photo URLs aren't blocked
- Try refreshing browser cache

## Files Modified

- ✅ `src/components/TestGoogleReviews.tsx` - Fetches from WordPress
- ✅ `src/components/TourReviews.tsx` - Filters reviews from WordPress
- ✅ `src/app/[lang]/tours/[slug]/page.tsx` - Integrated TourReviews (removed old GoogleReviews)
- ✅ `src/app/[lang]/reviews/page.tsx` - Displays all business reviews from WordPress
- ✅ `src/app/[lang]/about-us/page.tsx` - Added reviews section

## Removed (Old Google Places API)

- ❌ `src/components/GoogleReviews.tsx` - Used old `/api/google-reviews` endpoint
- ❌ `src/app/api/google-reviews/route.ts` - Direct Google Places API (5 reviews max)
- ❌ `src/app/api/cache-reviews/route.ts` - Cache management for old API
- ❌ `src/lib/reviews-cache.ts` - File-based caching system
- ❌ `src/components/ReviewsCacheManager.tsx` - Cache UI component
- ❌ Documentation files: GOOGLE-REVIEWS.md, GOOGLE-REVIEWS-LIMITATION.md, REVIEWS-CACHING.md, REVIEWS-QUICKSTART.md
