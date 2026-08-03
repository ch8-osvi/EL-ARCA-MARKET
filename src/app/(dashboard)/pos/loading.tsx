import { Skeleton } from "@/components/ui/Skeleton";

export default function POSLoading() {
  return (
    <div className="h-[calc(100vh-100px)] grid grid-cols-1 lg:grid-cols-12 gap-4 animate-pulse">
      {/* Left Product Catalog Grid Skeleton */}
      <div className="lg:col-span-7 flex flex-col space-y-4">
        <Skeleton className="h-12 rounded-2xl" />
        <Skeleton className="h-10 rounded-xl w-3/4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Right Cart & Checkout Skeleton */}
      <div className="lg:col-span-5">
        <Skeleton className="h-full rounded-3xl" />
      </div>
    </div>
  );
}
