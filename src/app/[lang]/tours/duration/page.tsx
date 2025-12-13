import { type Locale } from '@/i18n/config';
import { getLocalePrefix } from '@/i18n/config';
import { getTourDurations } from '@/lib/wordpress';
import Link from 'next/link';

interface Props {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({ params }: Props) {
  return {
    title: 'Tours by Duration | Qualitour',
    description: 'Browse tours by duration: Single-Day Tickets, Short Breaks, Weeklong, Extended Journeys, and Grand Voyages.',
  };
}

export default async function TourDurationPage({ params }: Props) {
  const { lang } = await params;
  const localePrefix = getLocalePrefix(lang);

  let durations: Awaited<ReturnType<typeof getTourDurations>> = [];
  try {
    durations = await getTourDurations({ per_page: 100, lang });
  } catch (e) {
    console.error('[DurationIndex] Failed to fetch tour durations:', e);
  }

  const DURATION_BUCKETS: Array<{ slug: string; fallbackName: string; fallbackDescription: string }> = [
    {
      slug: 'single-day',
      fallbackName: 'Single-Day Tickets',
      fallbackDescription: 'Quick attractions and day activities',
    },
    {
      slug: 'short-breaks',
      fallbackName: '1–4 Days (Short Breaks)',
      fallbackDescription: 'Weekend getaways and short trips',
    },
    {
      slug: 'weeklong',
      fallbackName: '5–8 Days (Weeklong)',
      fallbackDescription: 'Full week vacations and tours',
    },
    {
      slug: 'extended-journeys',
      fallbackName: '9–29 Days (Extended Journeys)',
      fallbackDescription: 'In-depth explorations and adventures',
    },
    {
      slug: 'grand-voyages',
      fallbackName: '30+ Days (Grand Voyages)',
      fallbackDescription: 'Epic journeys and world tours',
    },
  ];

  const categoriesBySlug = new Map(durations.map((term) => [term.slug, term]));
  const durationCategories = DURATION_BUCKETS.map((bucket) => {
    const term = categoriesBySlug.get(bucket.slug);
    return {
      slug: bucket.slug,
      name: term?.name || bucket.fallbackName,
      description: term?.description || bucket.fallbackDescription,
    };
  });

  return (
    <div className="container-qualitour py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Tours by Duration</h1>
        <p className="text-lg text-gray-600">
          Find the perfect tour based on how much time you have
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {durationCategories.map((duration) => (
          <Link
            key={duration.slug}
            href={`${localePrefix}/tours/duration/${duration.slug}`}
            className="group block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-[#f7941e] transition-all"
          >
            <h2 className="text-xl font-bold mb-2 group-hover:text-[#f7941e] transition-colors">
              {duration.name}
            </h2>
            <p className="text-gray-600 text-sm mb-4">{duration.description}</p>
            <div className="text-[#f7941e] font-semibold text-sm group-hover:underline">
              Browse Tours →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
