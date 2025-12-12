/**
 * Utility functions for matching tours to categories by title keywords
 * Used for destination and activity pages when explicit taxonomies aren't assigned
 */

/**
 * Build a mapping of category names/keywords to category objects
 */
export function buildCategoryKeywordMap(categories: any[]) {
  const keywordMap = new Map<string, any>();
  
  categories.forEach(cat => {
    // Add category name
    keywordMap.set(cat.name.toLowerCase(), cat);
    
    // Add category slug variations
    keywordMap.set(cat.slug.toLowerCase(), cat);
    keywordMap.set(cat.slug.replace(/-/g, ' ').toLowerCase(), cat);
    keywordMap.set(cat.slug.replace(/-/g, '').toLowerCase(), cat);
  });
  
  return keywordMap;
}

/**
 * Extract category from tour title by keyword matching
 * Returns the matched category or null
 */
export function getCategoryFromTourTitle(
  tourTitle: string,
  keywordMap: Map<string, any>,
  categories: any[]
): any | null {
  const titleLower = tourTitle.toLowerCase();
  
  // Sort keywords by length (longest first) to match more specific categories first
  const sortedKeywords = Array.from(keywordMap.keys())
    .sort((a, b) => b.length - a.length);
  
  for (const keyword of sortedKeywords) {
    if (titleLower.includes(keyword)) {
      return keywordMap.get(keyword);
    }
  }
  
  return null;
}
