import PhraseCardSkeleton from "@/components/PhraseCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto flex max-w-6xl gap-6 p-4">
      {/* Language sidebar loading */}
      <aside className="w-48 shrink-0 space-y-2">
        <Skeleton className="h-6 w-20 mb-4" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </aside>
      
      {/* Main content loading */}
      <section className="flex-1 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <PhraseCardSkeleton key={i} />
        ))}
      </section>
    </main>
  );
}