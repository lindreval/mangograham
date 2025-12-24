import { Skeleton } from "./ui/skeleton";

export default function PhraseCardSkeleton() {
  return (
    <article className="rounded-[20px] border-4 border-primary/50 bg-card p-5 shadow-card overflow-hidden relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/5 before:to-transparent before:pointer-events-none">
      {/* Header with Language Badge */}
      <header className="mb-4 flex items-center justify-between relative z-10">
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </header>

      {/* Hero Title */}
      <Skeleton className="h-10 w-3/4 mb-2" />
      <Skeleton className="h-5 w-1/3 mb-4" />

      {/* Definition Text */}
      <div className="space-y-2 mb-4">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-5/6" />
        <Skeleton className="h-5 w-4/6" />
      </div>

      {/* Example Quote */}
      <div className="relative mt-4 pl-6">
        <div className="border-l-2 border-primary/20 pl-4 py-1">
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3 w-2/3 mt-2" />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 relative flex items-center justify-between">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
    </article>
  );
}
