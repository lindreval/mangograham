import { Skeleton } from "./ui/skeleton";

export default function SearchResultSkeleton() {
  return (
    <li className="rounded border p-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
    </li>
  );
}