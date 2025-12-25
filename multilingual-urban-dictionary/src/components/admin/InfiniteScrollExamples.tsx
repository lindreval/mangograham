"use client";

import { Checkbox } from "@/components/ui/checkbox";
import StaggeredList from "@/components/ui/staggered-list";
import PhraseCardSkeleton from "../PhraseCardSkeleton";
import { useAdminInfiniteScroll } from "@/hooks/useAdminInfiniteScroll";
import { AdminInfiniteScrollHeader } from "./AdminInfiniteScrollHeader";

type PendingExample = {
  id: string;
  text: string;
  translation: string | null;
  status: string;
  definition: {
    body: string;
    phrase: {
      textOriginal: string;
      language: {
        name: string;
      };
    };
  };
};

export function InfiniteScrollExamples() {
  const {
    items: examples,
    loading,
    hasMore,
    totalCount,
    selectedItems: selectedExamples,
    bulkActionLoading,
    allSelected,
    someSelected,
    ref,
    handleSelectItem,
    handleSelectAll,
    handleAction,
    handleBulkAction,
  } = useAdminInfiniteScroll<PendingExample>({
    fetchUrl: "/api/admin/examples",
    dataKey: "examples",
    actionUrl: "/api/admin/examples/action",
    bulkActionUrl: "/api/admin/examples/bulk-action",
    entityIdKey: "exampleId",
    bulkIdsKey: "exampleIds",
  });

  if (!examples.length && loading) {
    return (
      <div className="space-y-4">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <PhraseCardSkeleton key={i} />
          ))}
      </div>
    );
  }

  if (!examples.length && !loading) {
    return <p className="text-muted-foreground">No examples awaiting review</p>;
  }

  return (
    <div className="space-y-4">
      <AdminInfiniteScrollHeader
        entityType="example"
        totalCount={totalCount}
        itemCount={examples.length}
        selectedCount={selectedExamples.size}
        allSelected={allSelected}
        someSelected={someSelected}
        loading={loading}
        bulkActionLoading={bulkActionLoading}
        onSelectAll={handleSelectAll}
        onBulkAction={handleBulkAction}
      />

      <StaggeredList
        className="space-y-4"
        staggerDelay={50}
        animationDuration={350}
      >
        {examples.map((ex) => (
          <div
            key={ex.id}
            className="rounded border p-4 shadow-sm bg-orange-50 transition-all duration-300 hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <Checkbox
                id={`example-${ex.id}`}
                checked={selectedExamples.has(ex.id)}
                onCheckedChange={(checked) =>
                  handleSelectItem(ex.id, checked as boolean)
                }
                className="mt-1"
              />
              <div className="flex-1">
                <div className="mb-2 text-sm text-muted-foreground">
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full mr-2 ${
                      ex.status === "needs review"
                        ? "bg-red-100 text-red-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {ex.status === "needs review"
                      ? "Needs Review"
                      : "Pending Example"}
                  </span>
                  <strong>{ex.definition.phrase.textOriginal}</strong> —{" "}
                  {ex.definition.phrase.language.name}
                </div>
                <div className="mb-2 text-sm text-muted-foreground">
                  <strong>Definition:</strong>{" "}
                  <span className="whitespace-pre-wrap">
                    {ex.definition.body}
                  </span>
                </div>
                <p className="mb-2 italic whitespace-pre-wrap">
                  &ldquo;{ex.text}&rdquo;
                </p>
                {ex.translation && (
                  <p className="mb-2 text-sm text-muted-foreground">
                    <strong>Translation:</strong>{" "}
                    <span className="whitespace-pre-wrap">{ex.translation}</span>
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(ex.id, "approved")}
                    className="rounded bg-green-600 px-4 py-1 text-white hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(ex.id, "rejected")}
                    className="rounded bg-red-600 px-4 py-1 text-white hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </StaggeredList>

      {hasMore && (
        <div ref={ref} className="flex justify-center py-4">
          {loading && <PhraseCardSkeleton />}
        </div>
      )}
    </div>
  );
}
