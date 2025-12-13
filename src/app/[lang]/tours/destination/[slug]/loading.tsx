export default function Loading() {
  return (
    <div className="container-qualitour py-8">
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-64 mb-2" />
        <div className="h-5 bg-gray-200 rounded w-96 mb-8" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded border border-gray-200 overflow-hidden">
              <div className="h-48 bg-gray-200" />
              <div className="p-4">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="mt-3 h-4 bg-gray-200 rounded w-5/6" />
                <div className="mt-2 h-4 bg-gray-200 rounded w-2/3" />
                <div className="mt-4 h-9 bg-gray-200 rounded w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
