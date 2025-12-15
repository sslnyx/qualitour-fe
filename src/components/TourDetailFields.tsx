import { WPTour } from '@/lib/wordpress';
import { proxyIfProtectedMedia } from '@/lib/wp-url';
import { ContentWithImageCarousel } from './ContentWithImageCarousel';

interface DetailField {
  label: string;
  content?: string;
  imageUrl?: string;
  type: 'text' | 'image';
}

// Helper function to check if HTML content is empty
function isContentEmpty(html: string): boolean {
  if (!html) return true;

  // Remove HTML tags and common empty content
  const stripped = html
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/\s+/g, '') // Remove all whitespace
    .trim();

  return stripped.length === 0;
}

// Helper function to clean up HTML content by removing empty paragraphs
function cleanHTML(html: string): string {
  if (!html) return '';

  return html
    // Remove <p>&nbsp;</p> and variations
    .replace(/<p[^>]*>(\s|&nbsp;)*<\/p>/gi, '')
    // Remove empty <p></p> tags
    .replace(/<p[^>]*><\/p>/gi, '')
    // Clean up multiple consecutive line breaks
    .replace(/(<br\s*\/?\s*>){3,}/gi, '<br><br>')
    .trim();
}

export default function TourDetailFields({ tour }: { tour: WPTour }) {
  // Get sections - works with both old page_builder and new optimized sections
  const sections = tour.goodlayers_data?.sections || (tour.goodlayers_data as any)?.page_builder || [];

  // Extract label:value pairs from detail or details section
  const detailSection = sections.find(
    (section: any) => section.value?.id === 'detail' || section.value?.id === 'details'
  );

  const fields: DetailField[] = [];

  if (detailSection && 'items' in detailSection) {
    const items = detailSection.items;

    // Iterate through items to find column pairs (label + value)
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // Check if this is a column with a title (label)
      if (item.template === 'wrapper' && item.type === 'column') {
        const colItems = item.items || [];

        for (const colItem of colItems) {
          if (colItem.type === 'title' && colItem.value?.title) {
            const label = colItem.value.title;

            // Look for the next column with content (may need to skip empty columns and spacers)
            let foundContent = false;
            for (let j = i + 1; j < items.length && j < i + 5; j++) {
              const nextItem = items[j];

              // Skip non-column elements (spacers, dividers, etc.)
              if (nextItem.template !== 'wrapper' || nextItem.type !== 'column') {
                continue;
              }

              const nextColItems = nextItem.items || [];

              // Skip empty columns
              if (nextColItems.length === 0) {
                continue;
              }

              // Check for text-box or image content
              for (const nextColItem of nextColItems) {
                if (nextColItem.type === 'text-box' && nextColItem.value?.content) {
                  // Clean and check if content is not empty
                  const cleanedContent = cleanHTML(nextColItem.value.content);
                  if (!isContentEmpty(cleanedContent)) {
                    fields.push({
                      label,
                      content: cleanedContent,
                      type: 'text',
                    });
                    foundContent = true;
                    break;
                  }
                } else if (nextColItem.type === 'image' && nextColItem.value?.url) {
                  // Add image field
                  fields.push({
                    label,
                    imageUrl: nextColItem.value.url,
                    type: 'image',
                  });
                  foundContent = true;
                  break;
                }
              }

              // If we found content, stop looking
              if (foundContent) {
                break;
              }
            }

            break; // Only process first title in column
          }
        }
      }
    }
  }

  if (fields.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        <span className="w-1 h-8 bg-[#f7941e] rounded-full"></span>
        Tour Details
      </h3>
      <div className="grid gap-6">
        {fields.map((field, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <h4 className="text-lg font-bold text-[#f7941e] mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              {field.label}
            </h4>
            {field.type === 'text' && field.content && (
              <ContentWithImageCarousel
                content={field.content}
                className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
              />
            )}
            {field.type === 'image' && field.imageUrl && (
              <img
                src={proxyIfProtectedMedia(field.imageUrl)}
                alt={field.label}
                className="w-full h-auto rounded-lg"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
