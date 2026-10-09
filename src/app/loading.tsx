
export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f0f5f1]">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 h-12 w-64 animate-pulse rounded-lg bg-gray-200"></div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-xl bg-white p-5"
            >
              <div className="mb-4 h-10 w-10 rounded-lg bg-gray-200"></div>
              <div className="mb-3 h-4 w-40 rounded bg-gray-200"></div>
              <div className="mb-4 h-3 w-24 rounded bg-gray-200"></div>

              <div className="flex items-center justify-between">
                <div className="h-5 w-20 rounded bg-gray-200"></div>
                <div className="h-5 w-12 rounded bg-gray-200"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
