import { type Locale } from '@/i18n/config';
import { i18n } from '@/i18n/config';
import Link from 'next/link';

export const runtime = 'edge';

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

interface Props {
  params: Promise<{ lang: Locale }>;
}

const TOUR_TYPES = [
  {
    slug: 'attraction-tickets',
    label: 'Attraction Tickets',
    description: 'Admission and activity tickets for popular attractions',
    icon: '🎫',
  },
  {
    slug: 'land-tours',
    label: 'Package Tours',
    description: 'Multi-day package tours and vacation packages',
    icon: '🚌',
  },
  {
    slug: 'cruises',
    label: 'Cruises',
    description: 'River cruises, ocean cruises, and expedition cruises',
    icon: '⛴️',
  },
];

export async function generateMetadata({ params }: Props) {
  return {
    title: 'Tour Types | Qualitour',
    description: 'Browse tours by type: Attraction Tickets, Package Tours, and Cruises',
  };
}

export default async function TourTypesPage({ params }: Props) {
  const { lang } = await params;

  return (
    <div className="container-qualitour py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Tour Types</h1>
        <p className="text-lg text-gray-600">
          Explore our collection of tours organized by type
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {TOUR_TYPES.map((type) => (
          <Link
            key={type.slug}
            href={`/${lang}/tours/type/${type.slug}`}
            className="group p-8 border border-gray-200 rounded-lg hover:border-[#f7941e] hover:shadow-lg transition-all duration-300"
          >
            <div className="text-5xl mb-4">{type.icon}</div>
            <h2 className="text-2xl font-bold mb-2 group-hover:text-[#f7941e] transition">
              {type.label}
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
