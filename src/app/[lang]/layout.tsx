import SiteNav from "@/components/SiteNav";
import Footer from "@/components/layout/Footer";
import { i18n, type Locale } from '@/i18n/config';
import { getAllTourDestinations, getTourActivities, getTourDurations, getTourTypes } from '@/lib/wordpress/api';
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

  let activitiesRaw: Awaited<ReturnType<typeof getTourActivities>> = [];
  let destinationsRaw: Awaited<ReturnType<typeof getAllTourDestinations>> = [];
  let durationsRaw: Awaited<ReturnType<typeof getTourDurations>> = [];
  let typesRaw: Awaited<ReturnType<typeof getTourTypes>> = [];

  try {
    [activitiesRaw, destinationsRaw, durationsRaw, typesRaw] = await Promise.all([
      getTourActivities({ per_page: 100, lang }),
      getAllTourDestinations({ per_page: 100, lang }),
      getTourDurations({ per_page: 100, lang }),
      getTourTypes({ per_page: 100, lang }),
    ]);
  } catch (e) {
    console.error('[Layout] Failed to fetch menu taxonomies:', e);
  }

  const [activities, destinations] = await Promise.all([
    translateTaxonomyTerms(activitiesRaw, lang, 'activity'),
    translateTaxonomyTerms(destinationsRaw, lang, 'destination'),
  ]);

  return (
    <>
      <SiteNav
        lang={lang}
        activities={activities}
        destinations={destinations}
        durations={durationsRaw}
        types={typesRaw}
        dict={dict}
      />
      <main className="flex-1">
        {children}
      </main>
      <Footer lang={lang} />
    </>
  );
}
