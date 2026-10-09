
export default function Loading() {
  return (
    <main className="min-h-[calc(100vh-190px)] bg-[#F1F6F2] px-4 pb-20 pt-6">
      <div className="mx-auto w-full max-w-6xl animate-pulse">

        {/* Category Header Skeleton */}
        <div className="flex items-center gap-4 rounded-2xl border border-[#DFE8E1] bg-white px-5 py-6">
          <div className="h-12 w-12 rounded-xl bg-gray-200" />

          <div className="space-y-3">
            <div className="h-6 w-24 rounded bg-gray-200" />
            <div className="h-3 w-48 rounded bg-gray-200" />
          </div>
        </div>

        {/* Sorting Bar Skeleton */}
        <div className="mt-6 flex h-[66px] items-center justify-end rounded-2xl border border-[#DFE8E1] bg-white px-6">
          <div className="h-8 w-24 rounded-lg bg-gray-200" />
        </div>

        {/* Product Count Skeleton */}
        <div className="mb-4 mt-5 h-4 w-40 rounded bg-gray-200" />

        {/* Product Cards Skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-[#DFE8E1] bg-white p-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gray-200" />

                <div className="space-y-2">
                  <div className="h-4 w-28 rounded bg-gray-200" />
                  <div className="h-3 w-20 rounded bg-gray-200" />
                </div>
              </div>

              <div className="mt-5 flex items-end justify-between">
                <div className="space-y-2">
                  <div className="h-3 w-20 rounded bg-gray-200" />
                  <div className="h-6 w-24 rounded bg-gray-200" />
                </div>

                <div className="h-6 w-16 rounded-full bg-gray-200" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}

