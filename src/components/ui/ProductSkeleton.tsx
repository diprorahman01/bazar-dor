
type ProductSkeletonProps = {
  count?: number;
};

export default function ProductSkeleton({
  count = 6,
}: ProductSkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-xl border border-gray-100 bg-white p-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gray-200" />

            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 rounded bg-gray-200" />
              <div className="h-3 w-1/3 rounded bg-gray-100" />
            </div>
          </div>

          <div className="mt-6 h-3 w-20 rounded bg-gray-100" />

          <div className="mt-3 flex items-center justify-between">
            <div className="h-5 w-24 rounded bg-gray-200" />
            <div className="h-5 w-14 rounded-full bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
