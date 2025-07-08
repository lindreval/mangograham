import { Skeleton } from "./ui/skeleton";

export default function PhraseCardSkeleton() {
  return (
    <article className="rounded-lg border p-4 shadow-sm">
      <header className="mb-3 flex items-center justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-20" />
      </header>

      <Skeleton className="h-6 w-32 mb-2" />

      <div className="space-y-1">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </article>
  );
}