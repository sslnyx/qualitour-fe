"use client";

import { useCallback, useEffect, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import { WPTour } from "@/lib/wordpress/types";

interface FeaturedToursCarouselProps {
  tours: WPTour[];
  lang: string;
}

export default function FeaturedToursCarousel({
  tours,
  lang,
}: FeaturedToursCarouselProps) {
  const autoplay = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      slidesToScroll: 1,
    },
    [autoplay.current]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Get badge display logic
  const getBadgeInfo = (tour: WPTour) => {
    const tourTags = tour._embedded?.["wp:term"]?.[1] || [];

    // Check for specific tags
    const bestSellerTag = tourTags.find(
      (tag: any) =>
        tag.slug === "best-seller" ||
        tag.name.toLowerCase().includes("best seller")
    );
    const winterTag = tourTags.find(
      (tag: any) =>
        tag.slug.includes("winter") || tag.name.toLowerCase().includes("winter")
    );

    if (bestSellerTag) {
      return { icon: "fa-bolt", show: true };
    }
    if (winterTag) {
      return { icon: "fa-snowflake", show: true };
    }

    // Default: show duration badge
    return { icon: "fa-clock", show: !!tour.tour_meta?.duration };
  };

  return (
    <div className="relative">
      {/* Carousel Container */}
      <div className="relative overflow-hidden py-6 px-4" ref={emblaRef}>
        <div className="flex">
          {tours.map((tour) => {
            const badgeInfo = getBadgeInfo(tour);
            const imageUrl =
              typeof tour.featured_image_url?.large === "string"
                ? tour.featured_image_url.large
                : tour.featured_image_url?.large?.url ||
                  (typeof tour.featured_image_url?.medium === "string"
                    ? tour.featured_image_url.medium
                    : tour.featured_image_url?.medium?.url) ||
                  (typeof tour.featured_image_url?.thumbnail === "string"
                    ? tour.featured_image_url.thumbnail
                    : tour.featured_image_url?.thumbnail?.url) ||
                  "/placeholder-tour.jpg";

            return (
              <div
                key={tour.id}
                className="embla__slide flex-[0_0_calc(100%)] min-w-0 md:flex-[0_0_calc(50%-1rem)] lg:flex-[0_0_calc(25%-1rem)]"
              >
                <Link
                  prefetch={false}
                  href={`/${lang === 'en' ? '' : lang + '/'}tours/${tour.slug}`}
                  className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 block h-full"
                >
                {/* Image */}
                  <div className="relative h-64 bg-gray-200 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={tour.title.rendered}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Discount badge - top priority */}
                    {tour.tour_meta?.has_discount &&
                      tour.tour_meta?.discount_percent && (
                        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                          -{tour.tour_meta.discount_percent}% OFF
                        </div>
                      )}
                    {/* Other badges - only show if no discount */}
                    {!tour.tour_meta?.has_discount && badgeInfo.show && (
                      <div className="absolute top-4 right-4 bg-[#f7941e] text-white px-3 py-1 rounded-full text-sm font-semibold">
                        <i className={`fa ${badgeInfo.icon} mr-1`}></i>
                        {badgeInfo.icon === "fa-clock" &&
                          tour.tour_meta?.duration}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col h-[calc(100%-16rem)] relative">
                    {/* Ribbon - Season/Availability */}
                    {tour.tour_meta?.ribbon && (
                      <div className="absolute top-0 left-6 -translate-y-1/2">
                        <div className="relative bg-[#f7941e] text-white px-4 py-1.5 text-xs font-semibold shadow-md">
                          {tour.tour_meta.ribbon}
                        </div>
                      </div>
                    )}

                    {/* Title with icon */}
                    <div className={`flex items-start gap-3 mb-3 ${tour.tour_meta?.ribbon ? 'mt-2' : ''}`}>
                      <i className="fa fa-bolt text-[#f7941e] text-xl mt-1 shrink-0"></i>
                      <h3
                        className="text-lg font-semibold text-gray-900 group-hover:text-[#f7941e] transition-colors line-clamp-2 leading-tight"
                        dangerouslySetInnerHTML={{
                          __html: tour.title.rendered,
                        }}
                      />
                    </div>

                    {/* Excerpt */}
                    {tour.excerpt?.rendered && (
                      <div
                        className="text-sm text-gray-600 line-clamp-2 mb-4"
                        dangerouslySetInnerHTML={{
                          __html: tour.excerpt.rendered,
                        }}
                      />
                    )}

                    {/* Duration & Location */}
                    {(tour.tour_meta?.duration ||
                      tour.tour_meta?.duration_text ||
                      tour.tour_meta?.location) && (
                      <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                        {(tour.tour_meta.duration_text || tour.tour_meta.duration) && (
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 shrink-0"
                              fill="currentColor"
                              viewBox="0 0 465 465"
                            >
                              <path d="M221.124,83.198c-8.363,0-15.137,6.78-15.137,15.131v150.747l137.87,71.271c2.219,1.149,4.595,1.69,6.933,1.69c5.476,0,10.765-2.982,13.454-8.185c3.835-7.426,0.933-16.549-6.493-20.384l-121.507-62.818V98.329C236.243,89.978,229.477,83.198,221.124,83.198z"/>
                              <path d="M197.999,426.402c-16.72-3.002-32.759-8.114-47.968-15.244c-0.18-0.094-0.341-0.201-0.53-0.287c-3.584-1.687-7.162-3.494-10.63-5.382c-0.012-0.014-0.034-0.023-0.053-0.031c-6.363-3.504-12.573-7.381-18.606-11.628C32.24,331.86,11.088,209.872,73.062,121.901c13.476-19.122,29.784-35.075,47.965-47.719c0.224-0.156,0.448-0.311,0.67-0.468c64.067-44.144,151.06-47.119,219.089-1.757l-14.611,21.111c-4.062,5.876-1.563,10.158,5.548,9.518l63.467-5.682c7.12-0.64,11.378-6.799,9.463-13.675L387.61,21.823c-1.908-6.884-6.793-7.708-10.859-1.833l-14.645,21.161C312.182,7.638,252.303-5.141,192.87,5.165c-5.986,1.036-11.888,2.304-17.709,3.78c-0.045,0.008-0.081,0.013-0.117,0.021c-0.225,0.055-0.453,0.128-0.672,0.189C123.122,22.316,78.407,52.207,46.5,94.855c-0.269,0.319-0.546,0.631-0.8,0.978c-1.061,1.429-2.114,2.891-3.145,4.353c-1.686,2.396-3.348,4.852-4.938,7.308c-0.199,0.296-0.351,0.597-0.525,0.896C10.762,149.191-1.938,196.361,0.24,244.383c0.005,0.158-0.004,0.317,0,0.479c0.211,4.691,0.583,9.447,1.088,14.129c0.027,0.302,0.094,0.588,0.145,0.89c0.522,4.708,1.177,9.427,1.998,14.145c8.344,48.138,31.052,91.455,65.079,125.16c0.079,0.079,0.161,0.165,0.241,0.247c0.028,0.031,0.059,0.047,0.086,0.076c9.142,9.017,19.086,17.357,29.793,24.898c28.02,19.744,59.221,32.795,92.729,38.808c10.167,1.827,19.879-4.941,21.703-15.103C214.925,437.943,208.163,428.223,197.999,426.402z"/>
                            </svg>
                            <span className="font-medium">
                              {tour.tour_meta.duration_text ||
                                `${tour.tour_meta.duration} days`}
                            </span>
                          </div>
                        )}
                        {tour.tour_meta.location && (
                          <div className="flex items-center gap-2">
                            <i className="fa fa-map-marker text-gray-400"></i>
                            <span className="line-clamp-1">
                              {tour.tour_meta.location}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Rating */}
                    {tour.tour_meta?.rating &&
                      typeof tour.tour_meta.rating === "object" &&
                      tour.tour_meta.rating.score > 0 && (
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <i
                                key={i}
                                className={`fa fa-star text-sm ${
                                  i <
                                  (typeof tour.tour_meta?.rating === "object"
                                    ? tour.tour_meta.rating.score
                                    : 0)
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              ></i>
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            (
                            {typeof tour.tour_meta.rating === "object"
                              ? tour.tour_meta.rating.reviewer
                              : 0}
                            )
                          </span>
                        </div>
                      )}

                    {/* Price - pushed to bottom */}
                    <div className="border-t border-gray-200 pt-4 mt-auto">
                      {/* Show original price if discounted */}
                      {tour.tour_meta?.has_discount &&
                        tour.tour_meta?.original_price && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-gray-400">Was</span>
                            <span className="text-lg text-gray-400 line-through font-medium">
                              ${tour.tour_meta.original_price}
                            </span>
                            {tour.tour_meta.discount_percent && (
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-semibold">
                                Save {tour.tour_meta.discount_percent}%
                              </span>
                            )}
                          </div>
                        )}
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm text-gray-500">
                          {tour.tour_meta?.has_discount ? "Now" : "From"}
                        </span>
                        <span
                          className={`text-2xl font-bold ${
                            tour.tour_meta?.has_discount
                              ? "text-red-600"
                              : "text-[#f7941e]"
                          }`}
                        >
                          ${tour.tour_meta?.price || "0"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
      <div className="absolute top-[50%] w-full">
        {/* Navigation Buttons */}
        <button
          onClick={scrollPrev}
          className="absolute -left-6 top-1/2 -translate-y-1/2 bg-white hover:bg-[#f7941e] text-gray-800 hover:text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-10 group"
          aria-label="Previous tours"
        >
          <i className="fa fa-chevron-left"></i>
        </button>

        <button
          onClick={scrollNext}
          className="absolute -right-6 top-1/2 -translate-y-1/2 bg-white hover:bg-[#f7941e] text-gray-800 hover:text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-10 group"
          aria-label="Next tours"
        >
          <i className="fa fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
}
