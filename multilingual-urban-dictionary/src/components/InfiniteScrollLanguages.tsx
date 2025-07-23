"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import PhraseCard, { PhraseWithLang } from "./PhraseCard";
import type { Language } from "@prisma/client";

interface APILanguage extends Language {
  _count: {
    phrases: number;
  };
}

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
    name: string;
    isoCode: string;
  };
  tags?: Array<{
    tag: {
      id: number;
      name: string;
      color: string | null;
    };
  }>;
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

interface InfiniteScrollLanguagesProps {
  initialLanguages?: APILanguage[];
  initialPhrases?: PhraseWithLang[];
  languageId?: number;
  mode: 'languages' | 'phrases';
}

export default function InfiniteScrollLanguages({ 
  initialLanguages, 
  initialPhrases, 
  languageId, 
  mode 
}: InfiniteScrollLanguagesProps) {
  const [languages, setLanguages] = useState<APILanguage[]>(initialLanguages || []);
  const [phrases, setPhrases] = useState<PhraseWithLang[]>(initialPhrases || []);
  const [page, setPage] = useState(2);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMoreLanguages = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/languages?page=${page}&limit=20`);
      const data = await response.json();
      
      if (data.languages && data.languages.length > 0) {
        setLanguages(prev => [...prev, ...data.languages]);
        setPage(prev => prev + 1);
        setHasMore(data.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more languages:", error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  const loadMorePhrases = useCallback(async () => {
    if (loading || !hasMore || !languageId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/language-phrases?languageId=${languageId}&page=${page}&limit=20`);
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
      console.error("Error loading more phrases:", error);
    } finally {
      setLoading(false);
    }
  }, [languageId, page, loading, hasMore]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop 
          >= document.documentElement.offsetHeight - 1000) {
        if (mode === 'languages') {
          loadMoreLanguages();
        } else {
          loadMorePhrases();
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMoreLanguages, loadMorePhrases, mode]);

  // Reset when props change
  useEffect(() => {
    if (mode === 'languages' && initialLanguages) {
      setLanguages(initialLanguages);
      setPhrases([]);
    } else if (mode === 'phrases' && initialPhrases) {
      setPhrases(initialPhrases);
      setLanguages([]);
    }
    setPage(2);
    setHasMore(true);
  }, [mode, initialLanguages, initialPhrases, languageId]);

  if (mode === 'languages') {
    return (
      <div className="space-y-4">
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {languages.map((l) => (
            <Link key={l.id} href={`/${l.isoCode}`}>
              <li
                id={l.isoCode}
                className="rounded-lg border-2 p-3 bg-background shadow-sm transition-transform duration-300 hover:scale-102 hover:bg-accent shadow-elevation-medium hover:shadow-elevation-high cursor-pointer"
              >
                <div className="font-medium">
                  {l.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {l._count.phrases} phrases
                </div>
              </li>
            </Link>
          ))}
        </ul>
        
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}
        
        {/* {!hasMore && languages.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            You&apos;ve seen all languages!
          </div>
        )} */}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {phrases.map((phrase) => (
          <PhraseCard key={phrase.id} phrase={phrase} />
        ))}
      </div>
      
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}
      
      {!hasMore && phrases.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          You&apos;ve seen all phrases for this language!
        </div>
      )}
    </div>
  );
}