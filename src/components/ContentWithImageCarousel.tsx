'use client';

import React, { useMemo, useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { proxyIfProtectedMedia } from '@/lib/wp-url';

interface ContentWithImageCarouselProps {
  content: string;
  className?: string;
}

interface ImageData {
  src: string;
  alt: string;
}

// Image Carousel component using Embla
function ImageCarousel({ images }: { images: ImageData[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    containScroll: 'trimSnaps'
  });

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (images.length === 0) return null;

  return (
    <div className="relative mb-6 group">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {images.map((img, idx) => (
            <div key={idx} className="embla__slide flex-[0_0_calc(50%-0.75rem)]!">
              <img
                src={img.src}
                alt={img.alt || `Image ${idx + 1}`}
                className="w-full h-full object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
            aria-label="Previous image"
          >
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
            aria-label="Next image"
          >
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}

export function ContentWithImageCarousel({ content, className = '' }: ContentWithImageCarouselProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Parse content to find image groups and process them
  const { processedContent, imageGroups } = useMemo(() => {
    if (!mounted) {
      return { processedContent: content, imageGroups: [] };
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');

    // First, fix ALL image URLs in the content
    const allImages = doc.querySelectorAll('img');
    allImages.forEach(img => {
      const originalSrc = img.getAttribute('src');
      if (originalSrc) {
        img.src = proxyIfProtectedMedia(originalSrc);
        // Also fix srcset if present
        if (img.srcset) {
          const newSrcset = img.srcset.split(',').map(part => {
            const [url, descriptor] = part.trim().split(/\s+/);
            if (url) {
              return `${proxyIfProtectedMedia(url)} ${descriptor || ''}`;
            }
            return part;
          }).join(', ');
          img.srcset = newSrcset;
        }
      }
    });

    const imageGroups: { images: ImageData[], placeholder: string }[] = [];

    // Find all paragraphs with multiple images
    const paragraphs = doc.querySelectorAll('p');
    paragraphs.forEach((p, pIndex) => {
      const images = p.querySelectorAll('img');
      if (images.length > 1) {
        const imageData: ImageData[] = Array.from(images).map(img => ({
          src: img.src, // This is already proxied now
          alt: img.alt || ''
        }));

        const placeholder = `__IMAGE_CAROUSEL_${pIndex}__`;
        imageGroups.push({ images: imageData, placeholder });

        // Replace paragraph with placeholder
        const placeholderNode = doc.createTextNode(placeholder);
        p.replaceWith(placeholderNode);
      }
    });

    return {
      processedContent: doc.body.innerHTML,
      imageGroups
    };
  }, [content, mounted]);

  // Split content by placeholders and interleave with carousels
  const contentParts = useMemo<Array<{ type: 'html', content: string } | { type: 'carousel', images: ImageData[] }>>(() => {
    if (!mounted) {
      return [{ type: 'html', content }];
    }

    const parts: Array<{ type: 'html', content: string } | { type: 'carousel', images: ImageData[] }> = [];
    let remainingContent = processedContent;

    imageGroups.forEach(({ images, placeholder }) => {
      const [before, after] = remainingContent.split(placeholder);
      if (before) {
        parts.push({ type: 'html', content: before });
      }
      parts.push({ type: 'carousel', images });
      remainingContent = after || '';
    });

    if (remainingContent) {
      parts.push({ type: 'html', content: remainingContent });
    }

    return parts.length > 0 ? parts : [{ type: 'html', content: processedContent }];
  }, [processedContent, imageGroups, content, mounted]);

  // Show plain HTML on server, carousel on client after mount
  if (!mounted) {
    return (
      <div className={className} dangerouslySetInnerHTML={{ __html: content }} />
    );
  }

  return (
    <div className={className}>
      {contentParts.map((part, index) => {
        if (part.type === 'carousel') {
          return <ImageCarousel key={`carousel-${index}`} images={part.images} />;
        }
        return (
          <div
            key={`html-${index}`}
            dangerouslySetInnerHTML={{ __html: part.content }}
          />
        );
      })}
    </div>
  );
}
