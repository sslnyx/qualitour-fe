import { getTourActivityBySlug, searchToursAdvanced } from '@/lib/wordpress';
import { TourCard } from '@/components/TourCard';
import { notFound } from 'next/navigation';
import { type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';

interface Props {
  params: Promise<{ lang: Locale; slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const term = await getTourActivityBySlug(slug);
  
  if (!term) {
    return {
      title: 'Activity Not Found',
    };
  }

  return {
    title: `${term.name} Tours | Qualitour`,
    description: term.description || `Explore our ${term.name} tours`,
  };
}

export default async function ActivityPage({ params, searchParams }: Props) {
  const { lang, slug } = await params;
  const { page } = await searchParams;
  const dict = await getDictionary(lang);
  const currentPage = page ? parseInt(page) : 1;
  const perPage = 12;

  const term = await getTourActivityBySlug(slug);

  if (!term) {
    console.warn(`[ActivityPage] Activity not found for slug: ${slug}`);
    notFound();
  }

  let tours: any[] = [];
  let totalPages = 0;
  let totalTourCount = 0;

  try {
    console.log(`[ActivityPage] Starting search for activity: ${slug} (ID: ${term.id}), lang: ${lang}`);
    const result = await searchToursAdvanced({
      activity: slug,
      page: currentPage,
      per_page: perPage,
      lang
    });
    tours = result.tours;
    totalTourCount = result.total;
    totalPages = result.totalPages;
    console.log(`[ActivityPage] Slug: ${slug}, ID: ${term.id}, Found ${totalTourCount} tours, Tours array length: ${tours.length}`);
  } catch (e) {
    console.error('Error fetching tours:', e);
  }

  return (
    <div className="container-qualitour py-8">
      <h1 className="text-3xl font-bold mb-2">{term.name}</h1>
      {term.description && (
        <div 
          className="text-gray-600 mb-8"
          dangerouslySetInnerHTML={{ __html: term.description }}
        />
      )}
      {totalTourCount > 0 && (
        <p className="text-sm text-gray-500 mb-6">{totalTourCount} tours found</p>
      )}
      
      {tours.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour: any) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      ) : (
        <p>No tours found for this activity.</p>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/tours/activity/${slug}?page=${p}`}
              className={`px-4 py-2 rounded ${
                p === currentPage
                  ? 'bg-[#f7941e] text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
