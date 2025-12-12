/**
 * TourGrid Component
 * 
 * Grid container for displaying multiple tour cards.
 * Mimics WordPress Tourmaster page builder "tour-item" element layout options.
 * 
 * Column Size Logic (from WordPress):
 * - 60 = 1 column (full width)
 * - 30 = 2 columns  
 * - 20 = 3 columns
 * - 15 = 4 columns
 * 
 * Formula: columns = 60 / columnSize
 */

import { WPTour } from '@/lib/wordpress';
import { TourCard, TourCardProps } from './TourCard';

export interface TourGridProps {
  tours: WPTour[];
  /** Column size (60/columnSize = number of columns) */
  columnSize?: 60 | 30 | 20 | 15;
  /** Layout style */
  style?: TourCardProps['style'];
  /** Show ratings */
  showRating?: boolean;
  /** Tour info fields to display */
  showInfo?: TourCardProps['showInfo'];
  /** Excerpt word count */
  excerptWords?: number;
  /** Remove spacing between cards */
  noSpace?: boolean;
}

export function TourGrid({
  tours,
  columnSize = 20,
  style = 'grid-with-frame',
  showRating = true,
  showInfo = ['duration-text'],
  excerptWords = 14,
  noSpace = false,
}: TourGridProps) {
  // Calculate columns from column size (WordPress logic: 60 / columnSize)
  const columns = 60 / columnSize;
  
  // Build responsive grid classes
  const gridClasses = [
    'grid',
    'grid-cols-1', // Mobile: always 1 column
  ];

  // Add responsive column classes based on calculated columns
  if (columns >= 2) {
    gridClasses.push('sm:grid-cols-2'); // Tablet: 2 columns
  }
  if (columns >= 3) {
    gridClasses.push('lg:grid-cols-3'); // Desktop: 3 columns
  }
  if (columns >= 4) {
    gridClasses.push('xl:grid-cols-4'); // Large desktop: 4 columns
  }

  // Gap spacing (matches WordPress "no-space" option)
  if (!noSpace) {
    gridClasses.push('gap-8');
  } else {
    gridClasses.push('gap-0');
  }

  return (
    <div className={gridClasses.join(' ')}>
      {tours.map((tour) => (
        <TourCard
          key={tour.id}
          tour={tour}
          style={style}
          showRating={showRating}
          showInfo={showInfo}
          excerptWords={excerptWords}
        />
      ))}
    </div>
  );
}

/**
 * Usage Examples:
 * 
 * // Default: 3-column grid with frame
 * <TourGrid tours={tours} />
 * 
 * // 2-column grid
 * <TourGrid tours={tours} columnSize={30} />
 * 
 * // 4-column grid without frame
 * <TourGrid 
 *   tours={tours} 
 *   columnSize={15}
 *   style="grid"
 * />
 * 
 * // Horizontal list (1 column)
 * <TourGrid 
 *   tours={tours}
 *   columnSize={60}
 *   style="medium-with-frame"
 *   showInfo={['duration-text', 'location']}
 *   excerptWords={30}
 * />
 * 
 * // Tight grid with no spacing
 * <TourGrid
 *   tours={tours}
 *   columnSize={20}
 *   noSpace
 * />
 */
