"use client";

import { useState, useEffect, useRef } from "react";
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

export default function SearchPreview({ defaultValue = "" }: SearchPreviewProps) {
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

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
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setQuery(result.textOriginal);
  };

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
            onFocus={() => results.length > 0 && setIsOpen(true)}
            className="w-full pr-10 h-8 md:h-10 text-sm md:text-base"
            autoComplete="off"
          />
          <Button
            type="submit"
            size="sm"
            variant="ghost"
            className="absolute right-1 h-6 w-6 md:h-8 md:w-8 p-0 hover:bg-muted"
          >
            <Search className="h-3 w-3 md:h-4 md:w-4" />
            <span className="sr-only">Search</span>
          </Button>
        </div>
      </form>

      {/* Search Preview Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border-2 border-primary/20 bg-card shadow-card-hover z-50 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Searching...</span>
            </div>
          ) : results.length > 0 ? (
            <>
              {results.map((result, index) => (
                <Link
                  key={result.id}
                  href={`/${result.language.isoCode}/${result.slug}`}
                  onClick={() => handleResultClick(result)}
                  className="block px-3 py-2 hover:bg-primary/5 border-b border-primary/10 last:border-b-0 transition-all duration-200 animate-in fade-in slide-in-from-top-1"
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
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 text-sm text-primary font-medium hover:bg-primary/5 text-center border-t border-primary/20 transition-all duration-200"
                >
                  View all results →
                </Link>
              )}
            </>
          ) : query.trim().length >= 2 && !loading ? (
            <div className="flex flex-col items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
              <Search className="h-5 w-5 text-muted-foreground/50" />
              <span>No results found for &ldquo;{query}&rdquo;</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}