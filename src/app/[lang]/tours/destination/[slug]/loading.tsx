import {
  Skeleton,
  TourCardSkeleton,
  PageHeaderSkeleton
} from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header skeleton */}
      <PageHeaderSkeleton />

      {/* Tours Grid skeleton */}
      <div className="container-qualitour py-10">
        {/* Filter chips skeleton */}
        <div className="flex flex-wrap gap-2 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full" />
          ))}
        </div>

        {/* Results count skeleton */}
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>

        {/* Tour cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 12 }).map((_, idx) => (
            <TourCardSkeleton key={idx} />
          ))}
        </div>

        {/* Pagination skeleton */}
        <div className="flex justify-center items-center gap-2 mt-12">
          <Skeleton className="h-10 w-10 rounded-lg" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-10 rounded-lg" />
          ))}
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
