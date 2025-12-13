import { type Locale } from '@/i18n/config';
import { getLocalePrefix } from '@/i18n/config';
import { getTourTypes } from '@/lib/wordpress';
import Link from 'next/link';

interface Props {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({ params }: Props) {
  return {
    title: 'Tour Types | Qualitour',
    description: 'Browse tours by type: Tickets & Passes, Land Tours, and Cruises & Expeditions',
  };
}

export default async function TourTypesPage({ params }: Props) {
  const { lang } = await params;
  const localePrefix = getLocalePrefix(lang);

  const TYPE_SLUGS = ['attraction-tickets', 'land-tours', 'cruises'] as const;

  let typesRaw: Awaited<ReturnType<typeof getTourTypes>> = [];
  try {
    typesRaw = await getTourTypes({ per_page: 100, lang });
  } catch (e) {
    console.error('[TourTypes] Failed to fetch tour types:', e);
  }

  const typesBySlug = new Map(typesRaw.map((t) => [t.slug, t]));

  const types = TYPE_SLUGS.map((slug) => {
    const term = typesBySlug.get(slug);
    const fallback =
      slug === 'attraction-tickets'
        ? {
            name: 'Tickets & Passes',
            description: 'Attraction admissions, tickets, and passes (no packaged itinerary)',
          }
        : slug === 'land-tours'
          ? {
              name: 'Land Tours',
              description: 'Guided tours and itineraries on land (day trips and multi-day tours)',
            }
          : {
              name: 'Cruises & Expeditions',
              description: 'River cruises, ocean cruises, and expedition cruises',
            };

    return {
      slug,
      name: term?.name || fallback.name,
      description: term?.description || fallback.description,
    };
  });

  return (
    <div className="container-qualitour py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Tour Types</h1>
        <p className="text-lg text-gray-600">
          Explore our collection of tours organized by type
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {types.map((type) => (
          <Link
            key={type.slug}
            href={`${localePrefix}/tours/type/${type.slug}`}
            className="group p-8 border border-gray-200 rounded-lg hover:border-[#f7941e] hover:shadow-lg transition-all duration-300"
          >
            <h2 className="text-2xl font-bold mb-2 group-hover:text-[#f7941e] transition">
              {type.name}
            </h2>
            <p className="text-gray-600 mb-4">{type.description}</p>
            <span className="inline-block text-[#f7941e] font-semibold group-hover:translate-x-2 transition-transform">
              Browse Tours →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
