"use client";

import { Checkbox } from "@/components/ui/checkbox";
import StaggeredList from "@/components/ui/staggered-list";
import PhraseCardSkeleton from "../PhraseCardSkeleton";
import { useAdminInfiniteScroll } from "@/hooks/useAdminInfiniteScroll";
import { AdminInfiniteScrollHeader } from "./AdminInfiniteScrollHeader";

type PendingDefinition = {
  id: string;
  body: string;
  status: string;
  phrase: {
    textOriginal: string;
    language: {
      name: string;
    };
  };
  examples: {
    text: string;
    translation: string | null;
  }[];
};

export function InfiniteScrollDefinitions() {
  const {
    items: definitions,
    loading,
    hasMore,
    totalCount,
    selectedItems: selectedDefinitions,
    bulkActionLoading,
    allSelected,
    someSelected,
    ref,
    handleSelectItem,
    handleSelectAll,
    handleAction,
    handleBulkAction,
  } = useAdminInfiniteScroll<PendingDefinition>({
    fetchUrl: "/api/admin/definitions",
    dataKey: "definitions",
    actionUrl: "/api/admin/definitions/action",
    bulkActionUrl: "/api/admin/definitions/bulk-action",
    entityIdKey: "definitionId",
    bulkIdsKey: "definitionIds",
  });

  if (!definitions.length && loading) {
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

  if (!definitions.length && !loading) {
    return (
      <p className="text-muted-foreground">No definitions awaiting review</p>
    );
  }

  return (
    <div className="space-y-4">
      <AdminInfiniteScrollHeader
        entityType="definition"
        totalCount={totalCount}
        itemCount={definitions.length}
        selectedCount={selectedDefinitions.size}
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
        {definitions.map((def) => (
          <div
            key={def.id}
            className="rounded border p-4 shadow-sm bg-blue-50 transition-all duration-300 hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <Checkbox
                id={`definition-${def.id}`}
                checked={selectedDefinitions.has(def.id)}
                onCheckedChange={(checked) =>
                  handleSelectItem(def.id, checked as boolean)
                }
                className="mt-1"
              />
              <div className="flex-1">
                <div className="mb-2 text-sm text-muted-foreground">
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full mr-2 ${
                      def.status === "needs review"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {def.status === "needs review"
                      ? "Needs Review"
                      : "Pending Definition"}
                  </span>
                  <strong>{def.phrase.textOriginal}</strong> —{" "}
                  {def.phrase.language.name}
                </div>
                <p className="mb-2 whitespace-pre-wrap">{def.body}</p>
                {def.examples.length > 0 && (
                  <div className="mb-2 text-sm italic space-y-1">
                    {def.examples.map((ex, i) => (
                      <p key={i}>
                        Example: {ex.text}
                        {ex.translation && <> — Translation: {ex.translation}</>}
                      </p>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(def.id, "approved")}
                    className="rounded bg-green-600 px-4 py-1 text-white hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(def.id, "rejected")}
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
