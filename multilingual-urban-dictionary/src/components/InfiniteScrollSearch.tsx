"use client";

import { useEffect, useState, useCallback } from "react";
import PhraseCard, { PhraseWithLang } from "./PhraseCard";
import StaggeredList from "./ui/staggered-list";

interface APIPhrase {
  id: number;
  textOriginal: string;
  normalized: string;
  slug: string;
  partOfSpeech: string | null;
  pronunciation: string | null;
  transliteration: string | null;
  languageId: number;
  authorId: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  language: {
    id: number;
    name: string;
    isoCode: string;
  };
  definitions: Array<{
    id: number;
    body: string;
    mediaUrl: string | null;
    authorId: string;
    phraseId: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    votes: Array<{
      userId: string;
      definitionId: number;
      value: number;
      createdAt: string;
    }>;
    author: {
      name: string | null;
      email: string | null;
    };
    examples: Array<{
      id: number;
      text: string;
      translation: string | null;
      authorId: string;
      definitionId: number;
      status: string;
      createdAt: string;
      updatedAt: string;
      votes: Array<{
        userId: string;
        exampleId: number;
        value: number;
        createdAt: string;
      }>;
    }>;
  }>;
}

interface InfiniteScrollSearchProps {
  initialPhrases: PhraseWithLang[];
  query: string;
}

export default function InfiniteScrollSearch({ initialPhrases, query }: InfiniteScrollSearchProps) {
  const [phrases, setPhrases] = useState<PhraseWithLang[]>(initialPhrases);
  const [page, setPage] = useState(2);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMorePhrases = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&page=${page}&limit=20`);
      const data = await response.json();
      
      if (data.phrases && data.phrases.length > 0) {
        // Convert date strings to Date objects
        const phrasesWithDates = data.phrases.map((phrase: APIPhrase) => ({
          ...phrase,
          createdAt: new Date(phrase.createdAt),
          updatedAt: new Date(phrase.updatedAt),
          definitions: phrase.definitions?.map((def) => ({
            ...def,
            createdAt: new Date(def.createdAt),
            updatedAt: new Date(def.updatedAt),
            examples: def.examples?.map((ex) => ({
              ...ex,
              createdAt: new Date(ex.createdAt),
              updatedAt: new Date(ex.updatedAt),
            })) || [],
          })) || [],
        }));
        
        setPhrases(prev => [...prev, ...phrasesWithDates]);
        setPage(prev => prev + 1);
        setHasMore(data.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more search results:", error);
    } finally {
      setLoading(false);
    }
  }, [query, page, loading, hasMore]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop 
          >= document.documentElement.offsetHeight - 1000) {
        loadMorePhrases();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMorePhrases]);

  // Reset when query changes
  useEffect(() => {
    setPhrases(initialPhrases);
    setPage(2);
    setHasMore(true);
  }, [query, initialPhrases]);

  return (
    <div className="space-y-4">
      <StaggeredList className="space-y-4" staggerDelay={60} animationDuration={400}>
        {phrases.map((phrase) => (
          <div key={phrase.id} className="transition-transform duration-300 hover:scale-[1.01]">
            <PhraseCard phrase={phrase} />
          </div>
        ))}
      </StaggeredList>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {!hasMore && phrases.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          You made it to the bottom!
        </div>
      )}
    </div>
  );
}