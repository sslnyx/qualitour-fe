'use client';

import { useState } from 'react';
import Image from 'next/image';
import { WPTour } from '@/lib/wordpress';

export default function TourPhotos({ tour }: { tour: WPTour }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Get sections - works with both old page_builder and new optimized sections
  const sections = tour.goodlayers_data?.sections || (tour.goodlayers_data as any)?.page_builder || [];
  
  // Extract gallery images from page builder
  const galleryImages: string[] = [];
  
  sections.forEach((section: any) => {
    section.items?.forEach((item: any) => {
      // Check for gallery elements
      if (item.type === 'gallery' && item.value?.gallery) {
        item.value.gallery.forEach((img: any) => {
          // Gallery images can have 'url' or 'thumbnail' field
          const imageUrl = img.url || img.thumbnail;
          if (imageUrl) {
            // Convert thumbnail URL to full-size by removing size suffix like -150x150
            const fullUrl = imageUrl.replace(/-\d+x\d+\.(jpg|jpeg|png|gif|webp)$/i, '.$1');
            if (!galleryImages.includes(fullUrl)) {
              galleryImages.push(fullUrl);
            }
          }
        });
      }
      
      // Check for image elements
      if (item.type === 'image' && item.value?.url) {
        galleryImages.push(item.value.url);
      }
      
      // Check for images embedded in text-box content
      if (item.type === 'text-box' && item.value?.content) {
        const content = item.value.content;
        // Extract img src URLs using regex
        const imgMatches = content.match(/src=["']([^"']+)["']/g);
        if (imgMatches) {
          imgMatches.forEach((match: string) => {
            const url = match.replace(/src=["']/, '').replace(/["']$/, '');
            if (url && !galleryImages.includes(url)) {
              galleryImages.push(url);
            }
          });
        }
      }
    });
  });

  // Add featured image if not already in gallery
  const featuredImageUrl = tour.featured_image_url?.full?.url;
  
  if (featuredImageUrl && !galleryImages.includes(featuredImageUrl)) {
    galleryImages.unshift(featuredImageUrl);
  }

  if (galleryImages.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No photos available.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-900">Tour Photos</h3>
        
        {/* Photo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {galleryImages.map((imageUrl, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(imageUrl)}
              className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer"
            >
              <Image
                src={imageUrl}
                alt={`${tour.title.rendered} - Photo ${idx + 1}`}
                fill
                className="object-cover transition-transform group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={() => setSelectedImage(null)}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="relative max-w-5xl max-h-[90vh] w-full h-full">
            <Image
              src={selectedImage}
              alt="Tour photo"
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
        </div>
      )}
    </>
  );
}
