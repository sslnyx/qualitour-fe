import { WPTourDestination } from './wordpress/types';

// Define the desired hierarchy (Child Slug -> Parent Slug)
// This allows us to organize the flat WordPress data into a hierarchy for the menu
const PARENT_MAP: Record<string, string> = {
  // Level 3 (Cities/Regions) -> Level 2 (Countries)
  'yellowknife': 'canada',
  'whitehorse': 'canada',
  'vancouver': 'canada',
  'banff': 'canada',
  'rockies': 'canada',
  'toronto': 'canada',
  'montreal': 'canada',
  'quebec': 'canada',
  'atlantic-canada': 'canada',
  'taipei': 'taiwan',
  'tokyo': 'japan',
  'kyoto': 'japan',
  'osaka': 'japan',
  'africa-wild': 'kenya',
  'africa-adventure': 'kenya',
  
  // Level 2 (Countries) -> Level 1 (Continents)
  'canada': 'north-america',
  'usa': 'north-america',
  // Note: 'america' is treated as alias for 'usa' in frontend, only 'usa' shows in megamenu
  'taiwan': 'asia',
  'japan': 'asia',
  'china': 'asia',
  'kenya': 'africa',
  'tanzania': 'africa',
  
  // Europe countries and regions - mapped from keyword search coverage
  'turkey': 'europe',
  'uk': 'europe',
  'france': 'europe',
  'iceland': 'europe',
  'western-europe': 'europe',
  'spain': 'europe',
  'scandinavia': 'europe',
  'italy': 'europe',
  'germany': 'europe',
  'mediterranean': 'europe',
  'norway': 'europe',
  
  // Europe cities and smaller regions
  'london': 'uk',
  'paris': 'france',
  'amsterdam': 'netherlands',
  'venice': 'italy',
  'danube': 'europe', // River, maps to Europe continent
  'rhine': 'europe', // River, maps to Europe continent
  'baltic': 'scandinavia',
  'adriatic': 'europe', // Region, maps to Europe continent
  'alps': 'europe', // Mountain range, maps to Europe continent
  'ireland': 'europe',
  'scotland': 'uk',
  'netherlands': 'europe', // Parent for Amsterdam
  
  // Special / Cruise categories (not under any continent, kept as top-level)
  'river-cruise': '',
};

/**
 * Get all child slugs for a given parent slug (recursive)
 * e.g. 'north-america' -> ['canada', 'usa', 'yellowknife', 'whitehorse', ...]
 */
export function getChildSlugs(parentSlug: string): string[] {
  const children: string[] = [];
  
  Object.entries(PARENT_MAP).forEach(([child, parent]) => {
    if (parent === parentSlug) {
      children.push(child);
      // Recursively get grandchildren
      children.push(...getChildSlugs(child));
    }
  });
  
  return children;
}

// Define top-level regions that might not exist in WP yet
// We give them high IDs to avoid conflict with real WP IDs (usually < 10000)
const VIRTUAL_REGIONS = [
  { id: 10001, name: 'North America', slug: 'north-america' },
  { id: 10002, name: 'Asia', slug: 'asia' },
  { id: 10003, name: 'Africa', slug: 'africa' },
  { id: 10004, name: 'Europe', slug: 'europe' },
  { id: 10005, name: 'South America', slug: 'south-america' },
];

/**
 * Organizes a flat list of destinations into a hierarchy based on a static map.
 * This bridges the gap between flat WordPress data and a nested Mega Menu.
 */
export function organizeDestinations(destinations: WPTourDestination[]): WPTourDestination[] {
  if (!destinations) return [];

  // Slugs to exclude from megamenu (these have dedicated sections or are aliases)
  const excludeSlugs = new Set(['america', 'river-cruise', 'river cruise']);

  // 1. Create a map of existing destinations for quick lookup (excluding megamenu-hidden items)
  const destMap = new Map<string, WPTourDestination>();
  
  // Clone items to avoid mutating the original props
  destinations.forEach(d => {
    if (!excludeSlugs.has(d.slug)) {
      destMap.set(d.slug, { ...d });
    }
  });

  // 2. Ensure Virtual Regions exist in the map
  VIRTUAL_REGIONS.forEach(region => {
    if (!destMap.has(region.slug)) {
      destMap.set(region.slug, {
        ...region,
        parent: 0,
        count: 0,
        description: '',
        link: '',
        taxonomy: 'tour-destination',
        meta: [],
        acf: [],
        _links: {}
      });
    }
  });

  // 3. Rebuild the list with updated parent IDs based on our map
  const organized: WPTourDestination[] = [];
  
  destMap.forEach(dest => {
    const parentSlug = PARENT_MAP[dest.slug];
    
    // If we have a mapping for this slug, try to find the parent
    if (parentSlug) {
      const parent = destMap.get(parentSlug);
      if (parent) {
        dest.parent = parent.id;
      }
    }
    
    organized.push(dest);
  });

  return organized;
}
