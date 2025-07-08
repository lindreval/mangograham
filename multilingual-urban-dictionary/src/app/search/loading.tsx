import { Skeleton } from "@/components/ui/skeleton";
import SearchResultSkeleton from "@/components/SearchResultSkeleton";

export default function SearchLoading() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4">
      {/* Search results header */}
      <Skeleton className="h-6 w-64" />

      {/* Search results list */}
      <ul className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <SearchResultSkeleton key={i} />
        ))}
      </ul>
    </main>
  );
}