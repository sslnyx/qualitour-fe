import { getTourDestinationBySlug, searchToursAdvanced } from '@/lib/wordpress';
import { TourCard } from '@/components/TourCard';
import { type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';
import Link from 'next/link';

interface Props {
  params: Promise<{ lang: Locale; slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug, lang } = await params;
  const term = await getTourDestinationBySlug(slug);
  
  // Fallback title if term not found
  const name = term ? term.name : slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return {
    title: `${name} Tours | Qualitour`,
    description: term?.description || `Explore our tours in ${name}`,
  };
}

export default async function DestinationPage({ params, searchParams }: Props) {
  const { lang, slug } = await params;
  const { page } = await searchParams;
  const dict = await getDictionary(lang);
  const currentPage = page ? parseInt(page) : 1;
  const perPage = 12;

  // Get the destination term for metadata with language-specific count
  let term = await getTourDestinationBySlug(slug);
  
  // If term doesn't exist in WP, create a virtual one for display
  if (!term) {
    term = {
      id: 0,
      name: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      slug: slug,
      taxonomy: 'tour-destination',
      count: 0,
      description: '',
      link: '',
      parent: 0,
      meta: [],
      acf: [],
      _links: {}
    };
  }

  let tours: any[] = [];
  let totalPages = 0;
  let totalTourCount = 0;

  // Use taxonomy-only filtering to fetch tours for this destination.
  // WP assignments include parent-chain terms, so continent/country pages work without
  // expanding children or keyword fallbacks.
  try {
    const result = await searchToursAdvanced({
      destination: slug,
      page: currentPage,
      per_page: perPage,
      lang,
    });

    tours = result.tours;
    totalTourCount = result.total;
    totalPages = result.totalPages;

    console.log(`[DestinationPage] Slug: ${slug}, Found ${totalTourCount} tours (taxonomy-only)`);
  } catch (e) {
    console.error('Error fetching tours:', e);
  }

  const localePrefix = lang === 'en' ? '' : `/${lang}`;

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
            <TourCard key={tour.id} tour={tour} lang={lang} />
          ))}
        </div>
      ) : (
        <p>No tours found for this destination.</p>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`${localePrefix}/tours/destination/${slug}?page=${p}`}
              className={`px-4 py-2 rounded ${
                p === currentPage
                  ? 'bg-[#f7941e] text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}