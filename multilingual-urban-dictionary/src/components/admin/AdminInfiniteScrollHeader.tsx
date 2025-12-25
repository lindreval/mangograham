"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AdminInfiniteScrollHeaderProps {
  entityType: "phrase" | "definition" | "example";
  totalCount: number;
  itemCount: number;
  selectedCount: number;
  allSelected: boolean;
  someSelected: boolean;
  loading: boolean;
  bulkActionLoading: boolean;
  onSelectAll: () => void;
  onBulkAction: (action: "approved" | "rejected") => void;
}

export function AdminInfiniteScrollHeader({
  entityType,
  totalCount,
  itemCount,
  selectedCount,
  allSelected,
  someSelected,
  loading,
  bulkActionLoading,
  onSelectAll,
  onBulkAction,
}: AdminInfiniteScrollHeaderProps) {
  const plural = `${entityType}s`;
  const capitalizedSingular = entityType.charAt(0).toUpperCase() + entityType.slice(1);
  const capitalizedPlural = capitalizedSingular + "s";

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="text-sm text-muted-foreground">
        Total: {totalCount} {plural} awaiting review
      </div>

      {itemCount > 0 && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id={`select-all-${plural}`}
              checked={allSelected}
              onCheckedChange={onSelectAll}
              disabled={loading}
            />
            <label
              htmlFor={`select-all-${plural}`}
              className="text-sm font-medium cursor-pointer"
            >
              Select All ({itemCount})
            </label>
          </div>

          {someSelected && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedCount} selected
              </span>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    className="rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700 disabled:opacity-50 text-sm"
                    disabled={bulkActionLoading}
                  >
                    Bulk Approve
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Approve Selected {capitalizedPlural}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to approve {selectedCount}{" "}
                      {entityType}(s)? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onBulkAction("approved")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve {selectedCount} {capitalizedSingular}(s)
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700 disabled:opacity-50 text-sm"
                    disabled={bulkActionLoading}
                  >
                    Bulk Reject
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Reject Selected {capitalizedPlural}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to reject {selectedCount}{" "}
                      {entityType}(s)? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onBulkAction("rejected")}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Reject {selectedCount} {capitalizedSingular}(s)
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
