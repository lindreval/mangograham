import { Skeleton } from "@/components/ui/skeleton";
import PhraseCardSkeleton from "@/components/PhraseCardSkeleton";

export default function LanguageLoading() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="grid gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <PhraseCardSkeleton key={i} />
        ))}
      </div>
    </main>
  );
}