import { WPTourDestination } from './wordpress/types';

/**
 * Organizes destinations for the mega menu.
 *
 * Source of truth is WordPress term parents.
 */
export function organizeDestinations(destinations: WPTourDestination[]): WPTourDestination[] {
  if (!destinations) return [];

  // Exclude destination aliases that would otherwise duplicate menu entries.
  // NOTE: Keep items like `river-cruise` visible (they are real destinations).
  const excludeSlugs = new Set(['america']);

  // Clone items to avoid mutating props and filter out duplicates/aliases.
  return destinations
    .filter((d) => !excludeSlugs.has(d.slug))
    .map((d) => ({ ...d }));
}
