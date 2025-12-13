'use client';
import { useEffect, useState } from 'react';
import { getToursByType, getTourTypeInfo } from '@/lib/wordpress';
import { TourCard } from '@/components/TourCard';
import { type Locale } from '@/i18n/config';
import { useParams, useSearchParams } from 'next/navigation';

export default function TourTypePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const type = params.slug as string;
  const lang = params.lang as Locale;
  const page = parseInt(searchParams.get('page') || '1');
  
  const [tours, setTours] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tours
  useEffect(() => {
    if (!type || !lang) return;

    const fetchTours = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getToursByType(type, {}, lang);
        setTours(result);
      } catch (e) {
        console.error('Error fetching tours:', e);
        setError('Failed to load tours. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTours();
  }, [type, lang]);

  const typeInfo = getTourTypeInfo(type);

  if (!typeInfo) {
    return (
      <div className="container-qualitour py-8">
        <h1 className="text-3xl font-bold mb-4">Tour Type Not Found</h1>
        <p className="text-gray-600">The tour type you're looking for doesn't exist.</p>
      </div>
    );
  }

  const perPage = 12;
  const totalTours = tours.length;
  const totalPages = Math.ceil(totalTours / perPage);
  const startIdx = (page - 1) * perPage;
  const endIdx = startIdx + perPage;
  const paginatedTours = tours.slice(startIdx, endIdx);

  return (
    <div className="container-qualitour py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{typeInfo.label}</h1>
        <p className="text-lg text-gray-600 mb-4">{typeInfo.description}</p>
        <p className="text-sm text-gray-500">
          {isLoading ? 'Loading...' : `${totalTours} tours found`}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading tours...</p>
        </div>
      ) : tours.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginatedTours.map((tour: any) => (
              <TourCard
                key={tour.id}
                tour={tour}
                lang={lang}
                style="grid-with-frame"
                showRating={true}
                showInfo={['duration-text']}
                excerptWords={14}
                imageSize="large"
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              {/* Previous Button */}
              {page > 1 && (
                <a
                  href={`/${lang}/tours/type/${type}?page=${page - 1}`}
                  className="px-4 py-2 rounded border border-gray-300 hover:border-[#f7941e] text-gray-700 hover:text-[#f7941e] transition"
                >
                  ← Previous
                </a>
              )}

              {/* Page Numbers */}
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <a
                    key={p}
                    href={`/${lang}/tours/type/${type}?page=${p}`}
                    className={`px-3 py-2 rounded transition ${
                      p === page
                        ? 'bg-[#f7941e] text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {p}
                  </a>
                ))}
              </div>

              {/* Next Button */}
              {page < totalPages && (
                <a
                  href={`/${lang}/tours/type/${type}?page=${page + 1}`}
                  className="px-4 py-2 rounded border border-gray-300 hover:border-[#f7941e] text-gray-700 hover:text-[#f7941e] transition"
                >
                  Next →
                </a>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">
            No {typeInfo.label.toLowerCase()} available at the moment.
          </p>
        </div>
      )}
    </div>
  );
}
