export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back button skeleton */}
      <div className="bg-white border-b">
        <div className="container-qualitour py-4">
          <div className="animate-pulse h-5 bg-gray-200 rounded w-40" />
        </div>
      </div>

      {/* Hero skeleton */}
      <div className="relative h-96 bg-gray-200">
        <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container-qualitour">
            <div className="animate-pulse">
              <div className="h-10 bg-white/30 rounded w-3/4" />
              <div className="mt-3 h-6 bg-white/30 rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container-qualitour py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-48" />
                <div className="mt-4 h-4 bg-gray-200 rounded w-full" />
                <div className="mt-2 h-4 bg-gray-200 rounded w-11/12" />
                <div className="mt-2 h-4 bg-gray-200 rounded w-10/12" />
                <div className="mt-6 h-10 bg-gray-200 rounded w-full" />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded border border-gray-200 p-6 sticky top-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-32 mx-auto" />
                <div className="mt-3 h-10 bg-gray-200 rounded w-40 mx-auto" />
                <div className="mt-6 space-y-4">
                  <div className="h-14 bg-gray-200 rounded" />
                  <div className="h-14 bg-gray-200 rounded" />
                  <div className="h-14 bg-gray-200 rounded" />
                </div>
                <div className="mt-6 h-10 bg-gray-200 rounded w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
