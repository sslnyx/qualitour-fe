import {
  Skeleton,
  TourHeroSkeleton,
  TourContentSkeleton
} from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back button skeleton */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-qualitour py-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
      </div>

      {/* Hero skeleton */}
      <TourHeroSkeleton />

      {/* Content skeleton */}
      <TourContentSkeleton />

      {/* Related tours skeleton */}
      <div className="bg-white border-t border-gray-100">
        <div className="container-qualitour py-16">
          <div className="text-center mb-10">
            <Skeleton className="h-8 w-64 mx-auto mb-3" />
            <Skeleton className="h-5 w-96 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="bg-gray-50 rounded-2xl p-4">
                <Skeleton className="h-48 w-full rounded-xl mb-4" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-10 w-24 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
