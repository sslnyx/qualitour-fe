import SiteNav from "@/components/SiteNav";
import Footer from "@/components/layout/Footer";
import { i18n, type Locale } from '@/i18n/config';
import { getSiteNavData } from '@/lib/wordpress/api';
import { getDictionary } from '@/i18n/get-dictionary';
import { translateTaxonomyTerms } from '@/lib/taxonomy-translations';

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params as { lang: Locale };

  const dict = await getDictionary(lang);

  // OPTIMIZED: Single API call instead of 4 parallel fetches
  // This reduces CPU usage by ~75% on Cloudflare Workers during cache miss
  let siteNavData: Awaited<ReturnType<typeof getSiteNavData>> = {
    activities: [],
    destinations: [],
    durations: [],
    types: [],
  };

  try {
    siteNavData = await getSiteNavData(lang);
  } catch (e) {
    console.error('[Layout] Failed to fetch site nav data:', e);
  }

  // Apply translations to activities and destinations
  const [activities, destinations] = await Promise.all([
    translateTaxonomyTerms(siteNavData.activities, lang, 'activity'),
    translateTaxonomyTerms(siteNavData.destinations, lang, 'destination'),
  ]);

  return (
    <>
      <SiteNav
        lang={lang}
        activities={activities}
        destinations={destinations}
        durations={siteNavData.durations}
        types={siteNavData.types}
        dict={dict}
      />
      <main className="flex-1">
        {children}
      </main>
      <Footer lang={lang} />
    </>
  );
}
