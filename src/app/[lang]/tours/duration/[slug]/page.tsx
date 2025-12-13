import { getToursByDuration, getDurationTypeInfo } from '@/lib/wordpress';
import { TourCard } from '@/components/TourCard';
import { type Locale } from '@/i18n/config';
import { notFound } from 'next/navigation';

export const runtime = 'edge';

interface Props {
  params: Promise<{ lang: Locale; slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function TourDurationPage({ params, searchParams }: Props) {
  const { lang, slug } = await params;
  const { page } = await searchParams;
  const currentPage = page ? parseInt(page) : 1;

  const durationInfo = getDurationTypeInfo(slug);

  if (!durationInfo) {
    notFound();
  }

  console.log(`[DurationPage] Fetching ${slug} tours, page ${currentPage}, lang ${lang}`);
  let tours: any[] = [];
  let error: string | null = null;

  try {
    tours = await getToursByDuration(slug, {}, lang);
    console.log(`[DurationPage] Got ${tours.length} tours for ${slug}`);
  } catch (e) {
    console.error(`[DurationPage] Error fetching tours:`, e);
    error = e instanceof Error ? e.message : 'Failed to fetch tours';
  }

  const perPage = 12;
  const totalTours = tours.length;
  const totalPages = Math.ceil(totalTours / perPage);
  const startIdx = (currentPage - 1) * perPage;
  const endIdx = startIdx + perPage;
  const paginatedTours = tours.slice(startIdx, endIdx);

  return (
    <div className="container-qualitour py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{durationInfo.label}</h1>
        {durationInfo.description && (
          <div 
            className="text-lg text-gray-600 mb-4"
            dangerouslySetInnerHTML={{ __html: durationInfo.description }}
          />
        )}
        <p className="text-sm text-gray-500">
          {totalTours} tours found
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {totalTours === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No tours found in this duration category.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginatedTours.map((tour) => (
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

          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <a
                  key={pageNum}
                  href={`?page=${pageNum}`}
                  className={`px-3 py-2 rounded ${
                    pageNum === currentPage
                      ? 'bg-[#f7941e] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {pageNum}
                </a>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
