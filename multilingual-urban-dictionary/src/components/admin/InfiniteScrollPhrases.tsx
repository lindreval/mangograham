"use client";

import { useState, useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import PhraseCardSkeleton from "../PhraseCardSkeleton";

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
  const [phrases, setPhrases] = useState<PendingPhrase[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedPhrases, setSelectedPhrases] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  const fetchPhrases = useCallback(async (pageNum: number) => {
    try {
      const response = await fetch(`/api/admin/phrases?page=${pageNum}&limit=10`);
      const data = await response.json();
      
      if (pageNum === 1) {
        setPhrases(data.phrases);
        setTotalCount(data.totalCount);
      } else {
        setPhrases(prev => [...prev, ...data.phrases]);
      }
      
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching phrases:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhrases(1);
  }, [fetchPhrases]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      setLoading(true);
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPhrases(nextPage);
    }
  }, [inView, hasMore, loading, page, fetchPhrases]);

  const handleAction = async (phraseId: string, action: "approved" | "rejected") => {
    const response = await fetch("/api/admin/phrases/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phraseId, action }),
    });

    if (response.ok) {
      setPhrases(prev => prev.filter(phrase => phrase.id !== phraseId));
      setTotalCount(prev => prev - 1);
      setSelectedPhrases(prev => {
        const newSet = new Set(prev);
        newSet.delete(phraseId);
        return newSet;
      });
    }
  };

  const handleBulkAction = async (action: "approved" | "rejected") => {
    if (selectedPhrases.size === 0) return;
    
    setBulkActionLoading(true);
    try {
      const response = await fetch("/api/admin/phrases/bulk-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          phraseIds: Array.from(selectedPhrases), 
          action 
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setPhrases(prev => prev.filter(phrase => !selectedPhrases.has(phrase.id)));
        setTotalCount(prev => prev - result.updatedCount);
        setSelectedPhrases(new Set());
      }
    } catch (error) {
      console.error("Error with bulk action:", error);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleSelectPhrase = (phraseId: string, checked: boolean) => {
    setSelectedPhrases(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(phraseId);
      } else {
        newSet.delete(phraseId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedPhrases.size === phrases.length) {
      setSelectedPhrases(new Set());
    } else {
      setSelectedPhrases(new Set(phrases.map(phrase => phrase.id)));
    }
  };

  const allSelected = phrases.length > 0 && selectedPhrases.size === phrases.length;
  const someSelected = selectedPhrases.size > 0;

  if (!phrases.length && loading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <PhraseCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!phrases.length && !loading) {
    return <p className="text-muted-foreground">No phrases awaiting review 🎉</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          Total: {totalCount} phrases awaiting review
        </div>
        
        {phrases.length > 0 && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all-phrases"
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                disabled={loading}
              />
              <label 
                htmlFor="select-all-phrases" 
                className="text-sm font-medium cursor-pointer"
              >
                Select All ({phrases.length})
              </label>
            </div>
            
            {someSelected && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedPhrases.size} selected
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
                      <AlertDialogTitle>Approve Selected Phrases</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to approve {selectedPhrases.size} phrase(s)? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleBulkAction("approved")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve {selectedPhrases.size} Phrase(s)
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
                      <AlertDialogTitle>Reject Selected Phrases</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to reject {selectedPhrases.size} phrase(s)? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleBulkAction("rejected")}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Reject {selectedPhrases.size} Phrase(s)
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        )}
      </div>
      
      {phrases.map((phrase) => (
        <div key={phrase.id} className="rounded border p-4 shadow-sm bg-purple-50">
          <div className="flex items-start gap-3">
            <Checkbox
              id={`phrase-${phrase.id}`}
              checked={selectedPhrases.has(phrase.id)}
              onCheckedChange={(checked) => handleSelectPhrase(phrase.id, checked as boolean)}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="mb-2 text-sm text-muted-foreground">
                <span className={`inline-block px-2 py-1 text-xs rounded-full mr-2 ${
                  phrase.status === 'needs review' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {phrase.status === 'needs review' ? 'Needs Review' : 'Pending Phrase'}
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
                    <p key={i} className="ml-4 italic whitespace-pre-wrap">• {def.body}</p>
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

      {hasMore && (
        <div ref={ref} className="flex justify-center py-4">
          {loading && <PhraseCardSkeleton />}
        </div>
      )}
    </div>
  );
}