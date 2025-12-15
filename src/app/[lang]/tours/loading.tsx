import {
  Skeleton,
  TourCardSkeleton,
  FilterBarSkeleton,
  PageHeaderSkeleton
} from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium Filter Bar skeleton */}
      <FilterBarSkeleton />

      {/* Page Header skeleton */}
      <PageHeaderSkeleton />

      {/* Tours Grid skeleton */}
      <div className="container-qualitour py-10">
        {/* Results count skeleton */}
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-5 w-48" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
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
