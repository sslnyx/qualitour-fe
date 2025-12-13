import { getTourDestinationBySlug, searchToursAdvanced, getRelatedDestinations, getDestinationKeywords } from '@/lib/wordpress';
import { TourCard } from '@/components/TourCard';
import { type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';
import Link from 'next/link';

export const runtime = 'edge';

interface Props {
  params: Promise<{ lang: Locale; slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug, lang } = await params;
  const term = await getTourDestinationBySlug(slug, lang);
  
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
  let term = await getTourDestinationBySlug(slug, lang);
  
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

  // Use searchToursAdvanced to fetch tours for this destination
  try {
    // Get related destinations to include in search
    const relatedDestinations = await getRelatedDestinations(slug);
    const allDestinations = [slug, ...relatedDestinations.map(d => d.slug)];
    
    // Verify at least one destination exists (either the slug or a related one)
    const validDestinations: string[] = [];
    for (const dest of allDestinations) {
      const destTerm = await getTourDestinationBySlug(dest, lang);
      if (destTerm) {
        validDestinations.push(dest);
      }
    }
    
    // If we have valid destinations from taxonomy, use them
    if (validDestinations.length > 0) {
      const result = await searchToursAdvanced({
        destinations: validDestinations,
        page: currentPage,
        per_page: perPage,
        lang
      });
      
      tours = result.tours;
      totalTourCount = result.total;
      totalPages = result.totalPages;
      
      console.log(`[DestinationPage] Slug: ${slug}, Valid destinations: [${validDestinations.join(', ')}], Related: [${relatedDestinations.map(d => d.name).join(', ')}], Found ${totalTourCount} tours (taxonomy-based)`);
    }
    
    // Fallback: If taxonomy search returned no results, use keyword-based search
    if (tours.length === 0) {
      const keywords = getDestinationKeywords(slug);
      console.log(`[DestinationPage] Keyword fallback triggered for '${slug}', keywords available: ${keywords.length}`);
      
      if (keywords.length > 0) {
        // Search using multiple keywords (OR query - search each keyword separately and deduplicate)
        const seenIds = new Set<number>();
        const allTours: any[] = [];
        
        for (const keyword of keywords) {
          const result = await searchToursAdvanced({
            query: keyword,
            page: 1,
            per_page: 100, // Get max per keyword
            lang
          });
          
          if (result.tours && result.tours.length > 0) {
            for (const tour of result.tours) {
              if (!seenIds.has(tour.id)) {
                seenIds.add(tour.id);
                allTours.push(tour);
              }
            }
          }
        }
        
        // Apply pagination to the combined results
        const startIndex = (currentPage - 1) * perPage;
        const endIndex = startIndex + perPage;
        tours = allTours.slice(startIndex, endIndex);
        totalTourCount = allTours.length;
        totalPages = Math.ceil(totalTourCount / perPage);
        
        console.log(`[DestinationPage] Slug: ${slug}, Using keyword search: [${keywords.join(', ')}], Found ${totalTourCount} tours (keyword-based, combined from ${keywords.length} keywords)`);
      } else {
        console.warn(`[DestinationPage] No valid destinations or keywords found for slug: ${slug}`);
      }
    }
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