"use client";

import { useState, useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import PhraseCardSkeleton from "../PhraseCardSkeleton";

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
  const [definitions, setDefinitions] = useState<PendingDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedDefinitions, setSelectedDefinitions] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  const fetchDefinitions = useCallback(async (pageNum: number) => {
    try {
      const response = await fetch(`/api/admin/definitions?page=${pageNum}&limit=10`);
      const data = await response.json();
      
      if (pageNum === 1) {
        setDefinitions(data.definitions);
        setTotalCount(data.totalCount);
      } else {
        setDefinitions(prev => [...prev, ...data.definitions]);
      }
      
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching definitions:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDefinitions(1);
  }, [fetchDefinitions]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      setLoading(true);
      const nextPage = page + 1;
      setPage(nextPage);
      fetchDefinitions(nextPage);
    }
  }, [inView, hasMore, loading, page, fetchDefinitions]);

  const handleAction = async (definitionId: string, action: "approved" | "rejected") => {
    const response = await fetch("/api/admin/definitions/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ definitionId, action }),
    });

    if (response.ok) {
      setDefinitions(prev => prev.filter(def => def.id !== definitionId));
      setTotalCount(prev => prev - 1);
      setSelectedDefinitions(prev => {
        const newSet = new Set(prev);
        newSet.delete(definitionId);
        return newSet;
      });
    }
  };

  const handleBulkAction = async (action: "approved" | "rejected") => {
    if (selectedDefinitions.size === 0) return;
    
    setBulkActionLoading(true);
    try {
      const response = await fetch("/api/admin/definitions/bulk-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          definitionIds: Array.from(selectedDefinitions), 
          action 
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setDefinitions(prev => prev.filter(def => !selectedDefinitions.has(def.id)));
        setTotalCount(prev => prev - result.updatedCount);
        setSelectedDefinitions(new Set());
      }
    } catch (error) {
      console.error("Error with bulk action:", error);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleSelectDefinition = (definitionId: string, checked: boolean) => {
    setSelectedDefinitions(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(definitionId);
      } else {
        newSet.delete(definitionId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedDefinitions.size === definitions.length) {
      setSelectedDefinitions(new Set());
    } else {
      setSelectedDefinitions(new Set(definitions.map(def => def.id)));
    }
  };

  const allSelected = definitions.length > 0 && selectedDefinitions.size === definitions.length;
  const someSelected = selectedDefinitions.size > 0;

  if (!definitions.length && loading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <PhraseCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!definitions.length && !loading) {
    return <p className="text-muted-foreground">No definitions awaiting review 🎉</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          Total: {totalCount} definitions awaiting review
        </div>
        
        {definitions.length > 0 && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all-definitions"
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                disabled={loading}
              />
              <label 
                htmlFor="select-all-definitions" 
                className="text-sm font-medium cursor-pointer"
              >
                Select All ({definitions.length})
              </label>
            </div>
            
            {someSelected && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedDefinitions.size} selected
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
                      <AlertDialogTitle>Approve Selected Definitions</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to approve {selectedDefinitions.size} definition(s)? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleBulkAction("approved")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve {selectedDefinitions.size} Definition(s)
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
                      <AlertDialogTitle>Reject Selected Definitions</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to reject {selectedDefinitions.size} definition(s)? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleBulkAction("rejected")}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Reject {selectedDefinitions.size} Definition(s)
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        )}
      </div>
      
      {definitions.map((def) => (
        <div key={def.id} className="rounded border p-4 shadow-sm bg-blue-50">
          <div className="flex items-start gap-3">
            <Checkbox
              id={`definition-${def.id}`}
              checked={selectedDefinitions.has(def.id)}
              onCheckedChange={(checked) => handleSelectDefinition(def.id, checked as boolean)}
              className="mt-1"
            />
            <div className="flex-1">
          <div className="mb-2 text-sm text-muted-foreground">
            <span className={`inline-block px-2 py-1 text-xs rounded-full mr-2 ${
              def.status === 'needs review' 
                ? 'bg-red-100 text-red-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {def.status === 'needs review' ? 'Needs Review' : 'Pending Definition'}
            </span>
            <strong>{def.phrase.textOriginal}</strong> — {def.phrase.language.name}
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

      {hasMore && (
        <div ref={ref} className="flex justify-center py-4">
          {loading && <PhraseCardSkeleton />}
        </div>
      )}
    </div>
  );
}