"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import Link from "next/link";

interface SearchResult {
  id: string;
  textOriginal: string;
  transliteration: string | null;
  slug: string;
  language: {
    name: string;
    isoCode: string;
  };
}

interface SearchPreviewProps {
  defaultValue?: string;
}

const RECENT_SEARCHES_KEY = "yung-salita-recent-searches";
const MAX_RECENT_SEARCHES = 5;

export default function SearchPreview({ defaultValue = "" }: SearchPreviewProps) {
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showRecent, setShowRecent] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        try {
          setRecentSearches(JSON.parse(stored));
        } catch (error) {
          console.error("Failed to parse recent searches:", error);
        }
      }
    }
  }, []);

  // Save search to recent searches
  const saveToRecentSearches = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== searchQuery.toLowerCase());
      const updated = [searchQuery, ...filtered].slice(0, MAX_RECENT_SEARCHES);

      if (typeof window !== "undefined") {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      }

      return updated;
    });
  }, []);

  // Clear recent searches (reserved for future use)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    }
    setShowRecent(false);
  }, []);

  // Highlight matching text in search results (reserved for future use)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const highlightMatch = useCallback((text: string, query: string) => {
    if (!query.trim()) return <span>{text}</span>;

    const parts = text.split(new RegExp(`(${query})`, "gi"));

    return (
      <span>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={index} className="font-bold text-primary">
              {part}
            </span>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </span>
    );
  }, []);

  // Debounce search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      setShowRecent(false);
      return;
    }

    setShowRecent(false);
    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search-preview?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data);
        setIsOpen(true);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeout);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowRecent(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveToRecentSearches(query.trim());
      setIsOpen(false);
      setShowRecent(false);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    saveToRecentSearches(result.textOriginal);
    setIsOpen(false);
    setShowRecent(false);
    setQuery(result.textOriginal);
  };

  const handleRecentSearchClick = (recentQuery: string) => {
    setQuery(recentQuery);
    setShowRecent(false);
    // This will trigger the search via the useEffect
  };

  const handleInputFocus = () => {
    if (query.trim().length === 0 && recentSearches.length > 0) {
      setShowRecent(true);
      setIsOpen(true);
    } else if (results.length > 0) {
      setIsOpen(true);
    }
  };

  // Reset selected index when results or recent searches change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [results, showRecent]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Handle recent searches navigation
      if (showRecent && recentSearches.length > 0) {
        const maxIndex = recentSearches.length - 1;

        switch (e.key) {
          case "ArrowDown":
            e.preventDefault();
            setSelectedIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
            break;
          case "ArrowUp":
            e.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
            break;
          case "Enter":
            if (selectedIndex >= 0) {
              e.preventDefault();
              handleRecentSearchClick(recentSearches[selectedIndex]);
            }
            break;
          case "Escape":
            e.preventDefault();
            setShowRecent(false);
            setIsOpen(false);
            setSelectedIndex(-1);
            break;
        }
        return;
      }

      // Handle search results navigation
      if (!isOpen || results.length === 0) return;

      const maxIndex = results.length + (results.length === 8 ? 0 : -1); // Include "View all" if 8 results

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
          break;
        case "Enter":
          if (selectedIndex >= 0) {
            e.preventDefault();
            if (selectedIndex < results.length) {
              const result = results[selectedIndex];
              saveToRecentSearches(result.textOriginal);
              router.push(`/${result.language.isoCode}/${result.slug}`);
              setIsOpen(false);
              setQuery(result.textOriginal);
            } else if (results.length === 8) {
              // "View all results" option
              saveToRecentSearches(query);
              router.push(`/search?q=${encodeURIComponent(query)}`);
              setIsOpen(false);
            }
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          setSelectedIndex(-1);
          break;
      }
    },
    [isOpen, results, selectedIndex, router, query, showRecent, recentSearches, saveToRecentSearches]
  );

  return (
    <div ref={searchRef} className="relative flex-1 mx-2 md:mx-auto md:w-full md:max-w-xl">
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center">
          <Input
            ref={inputRef}
            name="q"
            type="search"
            placeholder="Search phrases..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            className="w-full pr-10 h-8 md:h-10 text-sm md:text-base"
            autoComplete="off"
            role="combobox"
            aria-expanded={isOpen}
            aria-controls="search-listbox"
            aria-activedescendant={selectedIndex >= 0 ? `search-option-${selectedIndex}` : undefined}
          />
          <Button
            type="submit"
            size="sm"
            variant="ghost"
            className="absolute right-1 h-6 w-6 md:h-8 md:w-8 p-0 hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
          >
            <Search className="h-3 w-3 md:h-4 md:w-4" />
            <span className="sr-only">Search</span>
          </Button>
        </div>
      </form>

      {/* Search Preview Dropdown */}
      {isOpen && (
        <div
          ref={listRef}
          id="search-listbox"
          role="listbox"
          aria-label="Search results"
          className="absolute top-full left-0 right-0 mt-1 rounded-xl border-2 border-primary/20 bg-card shadow-card-hover z-50 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-[var(--duration-hover)] ease-[var(--ease-smooth)]"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground" role="status">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Searching...</span>
            </div>
          ) : results.length > 0 ? (
            <>
              {results.map((result, index) => (
                <Link
                  key={result.id}
                  id={`search-option-${index}`}
                  href={`/${result.language.isoCode}/${result.slug}`}
                  onClick={() => handleResultClick(result)}
                  role="option"
                  aria-selected={selectedIndex === index}
                  className={`block px-3 py-2 border-b border-primary/10 last:border-b-0 transition-all duration-[var(--duration-hover)] ease-[var(--ease-smooth)] animate-in fade-in slide-in-from-top-1 ${
                    selectedIndex === index
                      ? "bg-primary/10 outline-none"
                      : "hover:bg-primary/5"
                  }`}
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-sm">
                        {result.textOriginal}
                      </span>
                      {result.transliteration && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({result.transliteration})
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {result.language.name}
                    </span>
                  </div>
                </Link>
              ))}
              {results.length === 8 && (
                <Link
                  id={`search-option-${results.length}`}
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={() => setIsOpen(false)}
                  role="option"
                  aria-selected={selectedIndex === results.length}
                  className={`block px-3 py-2 text-sm text-primary font-medium text-center border-t border-primary/20 transition-all duration-[var(--duration-hover)] ease-[var(--ease-smooth)] ${
                    selectedIndex === results.length
                      ? "bg-primary/10 outline-none"
                      : "hover:bg-primary/5"
                  }`}
                >
                  View all results →
                </Link>
              )}
            </>
          ) : query.trim().length >= 2 && !loading ? (
            <div className="flex flex-col items-center justify-center gap-2 p-4 text-sm text-muted-foreground" role="status">
              <Search className="h-5 w-5 text-muted-foreground/50" aria-hidden="true" />
              <span>No results found for &ldquo;{query}&rdquo;</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}