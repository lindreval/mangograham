"use client";

import { useState, useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";

export interface UseAdminInfiniteScrollOptions {
  fetchUrl: string;
  dataKey: string;
  actionUrl: string;
  bulkActionUrl: string;
  entityIdKey: string;
  bulkIdsKey: string;
  limit?: number;
}

export interface UseAdminInfiniteScrollReturn<T> {
  items: T[];
  loading: boolean;
  hasMore: boolean;
  totalCount: number;
  selectedItems: Set<string>;
  bulkActionLoading: boolean;
  allSelected: boolean;
  someSelected: boolean;
  ref: (node?: Element | null) => void;
  handleSelectItem: (id: string, checked: boolean) => void;
  handleSelectAll: () => void;
  handleAction: (id: string, action: "approved" | "rejected") => Promise<void>;
  handleBulkAction: (action: "approved" | "rejected") => Promise<void>;
}

export function useAdminInfiniteScroll<T extends { id: string }>({
  fetchUrl,
  dataKey,
  actionUrl,
  bulkActionUrl,
  entityIdKey,
  bulkIdsKey,
  limit = 10,
}: UseAdminInfiniteScrollOptions): UseAdminInfiniteScrollReturn<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  const fetchItems = useCallback(async (pageNum: number) => {
    try {
      const response = await fetch(`${fetchUrl}?page=${pageNum}&limit=${limit}`);
      const data = await response.json();

      if (pageNum === 1) {
        setItems(data[dataKey]);
        setTotalCount(data.totalCount);
      } else {
        setItems(prev => [...prev, ...data[dataKey]]);
      }

      setHasMore(data.hasMore);
      setLoading(false);
    } catch (error) {
      console.error(`Error fetching ${dataKey}:`, error);
      setLoading(false);
    }
  }, [fetchUrl, dataKey, limit]);

  useEffect(() => {
    fetchItems(1);
  }, [fetchItems]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      setLoading(true);
      const nextPage = page + 1;
      setPage(nextPage);
      fetchItems(nextPage);
    }
  }, [inView, hasMore, loading, page, fetchItems]);

  const handleAction = async (itemId: string, action: "approved" | "rejected") => {
    const response = await fetch(actionUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [entityIdKey]: itemId, action }),
    });

    if (response.ok) {
      setItems(prev => prev.filter(item => item.id !== itemId));
      setTotalCount(prev => prev - 1);
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleBulkAction = async (action: "approved" | "rejected") => {
    if (selectedItems.size === 0) return;

    setBulkActionLoading(true);
    try {
      const response = await fetch(bulkActionUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [bulkIdsKey]: Array.from(selectedItems),
          action
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setItems(prev => prev.filter(item => !selectedItems.has(item.id)));
        setTotalCount(prev => prev - result.updatedCount);
        setSelectedItems(new Set());
      }
    } catch (error) {
      console.error("Error with bulk action:", error);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map(item => item.id)));
    }
  };

  const allSelected = items.length > 0 && selectedItems.size === items.length;
  const someSelected = selectedItems.size > 0;

  return {
    items,
    loading,
    hasMore,
    totalCount,
    selectedItems,
    bulkActionLoading,
    allSelected,
    someSelected,
    ref,
    handleSelectItem,
    handleSelectAll,
    handleAction,
    handleBulkAction,
  };
}
