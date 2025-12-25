"use client";

import { Checkbox } from "@/components/ui/checkbox";
import StaggeredList from "@/components/ui/staggered-list";
import PhraseCardSkeleton from "../PhraseCardSkeleton";
import { useAdminInfiniteScroll } from "@/hooks/useAdminInfiniteScroll";
import { AdminInfiniteScrollHeader } from "./AdminInfiniteScrollHeader";

type PendingPhrase = {
  id: string;
  textOriginal: string;
  status: string;
  partOfSpeech?: string | null;
  pronunciation?: string | null;
  transliteration?: string | null;
  language: {
    name: string;
  };
  definitions: {
    body: string;
  }[];
};

export function InfiniteScrollPhrases() {
  const {
    items: phrases,
    loading,
    hasMore,
    totalCount,
    selectedItems: selectedPhrases,
    bulkActionLoading,
    allSelected,
    someSelected,
    ref,
    handleSelectItem,
    handleSelectAll,
    handleAction,
    handleBulkAction,
  } = useAdminInfiniteScroll<PendingPhrase>({
    fetchUrl: "/api/admin/phrases",
    dataKey: "phrases",
    actionUrl: "/api/admin/phrases/action",
    bulkActionUrl: "/api/admin/phrases/bulk-action",
    entityIdKey: "phraseId",
    bulkIdsKey: "phraseIds",
  });

  if (!phrases.length && loading) {
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

  if (!phrases.length && !loading) {
    return <p className="text-muted-foreground">No phrases awaiting review</p>;
  }

  return (
    <div className="space-y-4">
      <AdminInfiniteScrollHeader
        entityType="phrase"
        totalCount={totalCount}
        itemCount={phrases.length}
        selectedCount={selectedPhrases.size}
        allSelected={allSelected}
        someSelected={someSelected}
        loading={loading}
        bulkActionLoading={bulkActionLoading}
        onSelectAll={handleSelectAll}
        onBulkAction={handleBulkAction}
      />

      <StaggeredList className="space-y-4" staggerDelay={50} animationDuration={350}>
        {phrases.map((phrase) => (
          <div
            key={phrase.id}
            className="rounded border p-4 shadow-sm bg-purple-50 transition-all duration-300 hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <Checkbox
                id={`phrase-${phrase.id}`}
                checked={selectedPhrases.has(phrase.id)}
                onCheckedChange={(checked) =>
                  handleSelectItem(phrase.id, checked as boolean)
                }
                className="mt-1"
              />
              <div className="flex-1">
                <div className="mb-2 text-sm text-muted-foreground">
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full mr-2 ${
                      phrase.status === "needs review"
                        ? "bg-red-100 text-red-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {phrase.status === "needs review"
                      ? "Needs Review"
                      : "Pending Phrase"}
                  </span>
                  <strong>{phrase.textOriginal}</strong> — {phrase.language.name}
                </div>
                {phrase.partOfSpeech && (
                  <p className="mb-2 text-sm text-muted-foreground">
                    <strong>Part of Speech:</strong> {phrase.partOfSpeech}
                  </p>
                )}
                {phrase.pronunciation && (
                  <p className="mb-2 text-sm text-muted-foreground">
                    <strong>Pronunciation:</strong> {phrase.pronunciation}
                  </p>
                )}
                {phrase.transliteration && (
                  <p className="mb-2 text-sm text-muted-foreground">
                    <strong>Transliteration:</strong> {phrase.transliteration}
                  </p>
                )}
                {phrase.definitions.length > 0 && (
                  <div className="mb-2 text-sm space-y-1">
                    <strong>Definitions:</strong>
                    {phrase.definitions.map((def, i) => (
                      <p key={i} className="ml-4 italic whitespace-pre-wrap">
                        {def.body}
                      </p>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(phrase.id, "approved")}
                    className="rounded bg-green-600 px-4 py-1 text-white hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(phrase.id, "rejected")}
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
