import { getDictionary } from '@/i18n/get-dictionary';
import { type Locale } from '@/i18n/config';

/**
 * Get translated taxonomy term name (destination or activity)
 * Falls back to original name if translation not found
 * 
 * @param slug - The taxonomy term slug (e.g., 'city-tours', 'taiwan')
 * @param originalName - The original untranslated name from WordPress
 * @param lang - The language code (e.g., 'en', 'zh')
 * @param type - The taxonomy type: 'destination' or 'activity'
 * @returns The translated name or original name if not found
 */
export async function getTranslatedTaxonomyName(
  slug: string,
  originalName: string,
  lang: Locale,
  type: 'destination' | 'activity'
): Promise<string> {
  try {
    const dict = await getDictionary(lang);
    const taxonomies = dict?.taxonomies as any;
    
    if (!taxonomies) {
      return originalName;
    }

    const typeKey = type === 'destination' ? 'destinations' : 'activities';
    return taxonomies?.[typeKey]?.[slug] || originalName;
  } catch (error) {
    console.error(`Error translating taxonomy term: ${slug}`, error);
    return originalName;
  }
}

/**
 * Translate an array of taxonomy terms (destinations or activities)
 * 
 * @param terms - Array of taxonomy terms from WordPress API
 * @param lang - The language code (e.g., 'en', 'zh')
 * @param type - The taxonomy type: 'destination' or 'activity'
 * @returns Array of terms with translated names
 */
export async function translateTaxonomyTerms<T extends { slug: string; name: string }>(
  terms: T[],
  lang: Locale,
  type: 'destination' | 'activity'
): Promise<T[]> {
  try {
    const dict = await getDictionary(lang);
    const taxonomies = dict?.taxonomies as any;
    
    if (!taxonomies) {
      return terms;
    }

    const typeKey = type === 'destination' ? 'destinations' : 'activities';
    
    return terms.map(term => ({
      ...term,
      name: taxonomies?.[typeKey]?.[term.slug] || term.name
    }));
  } catch (error) {
    console.error(`Error translating taxonomy terms`, error);
    return terms;
  }
}
