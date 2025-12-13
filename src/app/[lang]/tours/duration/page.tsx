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

const DURATION_TYPES = [
  {
    slug: 'single-day',
    label: 'Single-Day Tickets',
    description: 'Quick attractions and day activities',
    icon: '🎫',
  },
  {
    slug: 'short-breaks',
    label: '1–4 Days (Short Breaks)',
    description: 'Weekend getaways and short trips',
    icon: '🛫',
  },
  {
    slug: 'weeklong',
    label: '5–8 Days (Weeklong)',
    description: 'Full week vacations and tours',
    icon: '📅',
  },
  {
    slug: 'extended-journeys',
    label: '9–29 Days (Extended Journeys)',
    description: 'In-depth explorations and adventures',
    icon: '🧭',
  },
  {
    slug: 'grand-voyages',
    label: '30+ Days (Grand Voyages)',
    description: 'Epic journeys and world tours',
    icon: '🌍',
  },
];

export async function generateMetadata({ params }: Props) {
  return {
    title: 'Tours by Duration | Qualitour',
    description: 'Browse tours by length: Single-Day Tickets, Short Breaks, Weeklong, Extended Journeys, and Grand Voyages',
  };
}

export default async function TourDurationPage({ params }: Props) {
  const { lang } = await params;
  const localePrefix = lang === 'en' ? '' : `/${lang}`;

  return (
    <div className="container-qualitour py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Tours by Duration</h1>
        <p className="text-lg text-gray-600">
          Find the perfect tour based on how much time you have
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DURATION_TYPES.map((duration) => (
          <Link
            key={duration.slug}
            href={`${localePrefix}/tours/duration/${duration.slug}`}
            className="group block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-[#f7941e] transition-all"
          >
            <div className="text-4xl mb-4">{duration.icon}</div>
            <h2 className="text-xl font-bold mb-2 group-hover:text-[#f7941e] transition-colors">
              {duration.label}
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
