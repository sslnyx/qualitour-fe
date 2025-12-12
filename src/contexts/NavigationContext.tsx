import { ReactNode } from 'react';

/**
 * Navigation Context Provider
 * Shares commonly fetched data (destinations, activities) across the app
 * Prevents redundant API calls in:
 * - Navigation/Megamenu (needs destinations + activities)
 * - Tour listing pages (needs destinations + activities for filters)
 * - Dynamic route metadata (needs taxonomy data)
 */

interface NavigationContextType {
  destinations: any[];
  activities: any[];
  isLoading: boolean;
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  // Note: This is a wrapper for future implementation
  // Currently, data is fetched in layout.tsx and passed as props to components
  // To convert to true Context API with client-side state:
  // 1. Create client context in src/contexts/NavigationContext.tsx
  // 2. Wrap app in NavigationProvider in root layout
  // 3. Use useContext(NavigationContext) in components
  
  return <>{children}</>;
}

export { NavigationProvider as default };
