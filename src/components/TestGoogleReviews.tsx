/**
 * Test component to fetch and display Google reviews
 * This demonstrates how to use the getBusinessReviews function
 */

import { getBusinessReviews } from '@/lib/wordpress/api';
import type { PlaceDetails } from '@/lib/wordpress/types';

export default async function TestGoogleReviews() {
  let placeDetails: PlaceDetails | null = null;
  let error: string | null = null;

  try {
    // Fetch reviews for Vancouver location
    placeDetails = await getBusinessReviews();
    
    if (!placeDetails) {
      error = 'Could not fetch place details. Check if Place ID is available.';
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Unknown error fetching reviews';
    console.error('Error:', error);
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
        <h2 className="font-bold mb-2">Error fetching Google reviews</h2>
        <p>{error}</p>
        <p className="text-sm mt-2">
          Make sure you have configured the Place ID for your location in 
          <code className="bg-red-100 px-2 py-1 rounded">src/lib/google-places.ts</code>
        </p>
      </div>
    );
  }

  if (!placeDetails) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-700">
        <p>No place details available</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      {/* Business Info */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{placeDetails.name}</h2>
        <p className="text-gray-600 mb-2">{placeDetails.formatted_address}</p>
        
        {placeDetails.rating && (
          <div className="flex items-center gap-2">
            <div className="flex text-yellow-400">
              {Array.from({ length: Math.round(placeDetails.rating) }).map((_, i) => (
                <span key={i}>★</span>
              ))}
            </div>
            <span className="font-semibold">{placeDetails.rating}</span>
            <span className="text-gray-600">({placeDetails.user_ratings_total} reviews)</span>
          </div>
        )}

        {placeDetails.website && (
          <p className="mt-2">
            <a 
              href={placeDetails.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Visit Website
            </a>
          </p>
        )}
      </div>

      {/* Reviews */}
      {placeDetails.reviews && placeDetails.reviews.length > 0 ? (
        <div>
          <h3 className="text-xl font-bold mb-4">Recent Reviews</h3>
          <div className="space-y-4">
            {placeDetails.reviews.map((review, index) => (
              <div key={index} className="border-l-4 border-orange-500 pl-4 py-2 bg-gray-50 p-4 rounded">
                <div className="flex items-start gap-3 mb-3">
                  {/* Profile Photo */}
                  {review.profile_photo_url && (
                    <img 
                      src={review.profile_photo_url} 
                      alt={review.author_name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{review.author_name}</p>
                        <div className="flex text-yellow-400 text-sm mt-1">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                        </div>
                      </div>
                      <span className="text-gray-500 text-sm whitespace-nowrap ml-4">
                        {review.relative_time_description}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-gray-500">No reviews available</p>
      )}
    </div>
  );
}
