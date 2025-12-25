"use client";

import { useState, useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import StaggeredList from "@/components/ui/staggered-list";
import PhraseCardSkeleton from "../PhraseCardSkeleton";

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
  const [examples, setExamples] = useState<PendingExample[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedExamples, setSelectedExamples] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  const fetchExamples = useCallback(async (pageNum: number) => {
    try {
      const response = await fetch(`/api/admin/examples?page=${pageNum}&limit=10`);
      const data = await response.json();
      
      if (pageNum === 1) {
        setExamples(data.examples);
        setTotalCount(data.totalCount);
      } else {
        setExamples(prev => [...prev, ...data.examples]);
      }
      
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching examples:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExamples(1);
  }, [fetchExamples]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      setLoading(true);
      const nextPage = page + 1;
      setPage(nextPage);
      fetchExamples(nextPage);
    }
  }, [inView, hasMore, loading, page, fetchExamples]);

  const handleAction = async (exampleId: string, action: "approved" | "rejected") => {
    const response = await fetch("/api/admin/examples/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exampleId, action }),
    });

    if (response.ok) {
      setExamples(prev => prev.filter(ex => ex.id !== exampleId));
      setTotalCount(prev => prev - 1);
      setSelectedExamples(prev => {
        const newSet = new Set(prev);
        newSet.delete(exampleId);
        return newSet;
      });
    }
  };

  const handleBulkAction = async (action: "approved" | "rejected") => {
    if (selectedExamples.size === 0) return;
    
    setBulkActionLoading(true);
    try {
      const response = await fetch("/api/admin/examples/bulk-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          exampleIds: Array.from(selectedExamples), 
          action 
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setExamples(prev => prev.filter(ex => !selectedExamples.has(ex.id)));
        setTotalCount(prev => prev - result.updatedCount);
        setSelectedExamples(new Set());
      }
    } catch (error) {
      console.error("Error with bulk action:", error);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleSelectExample = (exampleId: string, checked: boolean) => {
    setSelectedExamples(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(exampleId);
      } else {
        newSet.delete(exampleId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedExamples.size === examples.length) {
      setSelectedExamples(new Set());
    } else {
      setSelectedExamples(new Set(examples.map(ex => ex.id)));
    }
  };

  const allSelected = examples.length > 0 && selectedExamples.size === examples.length;
  const someSelected = selectedExamples.size > 0;

  if (!examples.length && loading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <PhraseCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!examples.length && !loading) {
    return <p className="text-muted-foreground">No examples awaiting review 🎉</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          Total: {totalCount} examples awaiting review
        </div>
        
        {examples.length > 0 && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all-examples"
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                disabled={loading}
              />
              <label 
                htmlFor="select-all-examples" 
                className="text-sm font-medium cursor-pointer"
              >
                Select All ({examples.length})
              </label>
            </div>
            
            {someSelected && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedExamples.size} selected
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
                      <AlertDialogTitle>Approve Selected Examples</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to approve {selectedExamples.size} example(s)? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleBulkAction("approved")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve {selectedExamples.size} Example(s)
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
                      <AlertDialogTitle>Reject Selected Examples</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to reject {selectedExamples.size} example(s)? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleBulkAction("rejected")}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Reject {selectedExamples.size} Example(s)
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        )}
      </div>
      
      <StaggeredList className="space-y-4" staggerDelay={50} animationDuration={350}>
        {examples.map((ex) => (
          <div key={ex.id} className="rounded border p-4 shadow-sm bg-orange-50 transition-all duration-300 hover:shadow-md">
            <div className="flex items-start gap-3">
              <Checkbox
                id={`example-${ex.id}`}
                checked={selectedExamples.has(ex.id)}
                onCheckedChange={(checked) => handleSelectExample(ex.id, checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="mb-2 text-sm text-muted-foreground">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full mr-2 ${
                    ex.status === 'needs review'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {ex.status === 'needs review' ? 'Needs Review' : 'Pending Example'}
                  </span>
                  <strong>{ex.definition.phrase.textOriginal}</strong> — {ex.definition.phrase.language.name}
                </div>
                <div className="mb-2 text-sm text-muted-foreground">
                  <strong>Definition:</strong> <span className="whitespace-pre-wrap">{ex.definition.body}</span>
                </div>
                <p className="mb-2 italic whitespace-pre-wrap">&ldquo;{ex.text}&rdquo;</p>
                {ex.translation && (
                  <p className="mb-2 text-sm text-muted-foreground">
                    <strong>Translation:</strong> <span className="whitespace-pre-wrap">{ex.translation}</span>
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