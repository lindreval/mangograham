"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, ArrowUpDown } from "lucide-react";

interface Phrase {
  id: number;
  textOriginal: string;
  slug: string;
  partOfSpeech: string | null;
  status: string;
  createdAt: Date;
  language: {
    name: string;
    isoCode: string;
  };
  definitions: {
    votes: { value: number }[];
  }[];
}

interface Definition {
  id: number;
  body: string;
  status: string;
  createdAt: Date;
  phrase: {
    textOriginal: string;
    slug: string;
    language: {
      name: string;
      isoCode: string;
    };
  };
  votes: { value: number }[];
  examples: {
    id: number;
    text: string;
    translation: string | null;
    authorId: string;
    definitionId: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
}

interface Example {
  id: number;
  text: string;
  translation: string | null;
  status: string;
  createdAt: Date;
  definition: {
    phrase: {
      textOriginal: string;
      slug: string;
      language: {
        name: string;
        isoCode: string;
      };
    };
  };
  votes: { value: number }[];
}

interface APIResponse {
  data: (Phrase | Definition | Example)[];
  hasMore: boolean;
  type: string;
  totalCounts?: {
    phrases: number;
    definitions: number;
    examples: number;
  };
}

interface InfiniteSortableContributionsProps {
  initialPhrases: Phrase[];
  initialDefinitions: Definition[];
  initialExamples: Example[];
  userId?: string; // Optional prop to fetch specific user's contributions
  totalCounts?: {
    phrases: number;
    definitions: number;
    examples: number;
  };
}

type SortOption = "recent" | "upvotes" | "oldest";
type TabType = "phrases" | "definitions" | "examples";

export default function InfiniteSortableContributions({ 
  initialPhrases, 
  initialDefinitions, 
  initialExamples,
  userId,
  totalCounts
}: InfiniteSortableContributionsProps) {
  const [phrases, setPhrases] = useState<Phrase[]>(initialPhrases);
  const [definitions, setDefinitions] = useState<Definition[]>(initialDefinitions);
  const [examples, setExamples] = useState<Example[]>(initialExamples);
  
  // State for total counts (will be updated from API responses)
  const [counts, setCounts] = useState({
    phrases: totalCounts?.phrases ?? initialPhrases.length,
    definitions: totalCounts?.definitions ?? initialDefinitions.length,
    examples: totalCounts?.examples ?? initialExamples.length,
  });
  
  const [phrasePage, setPhrasePage] = useState(2);
  const [definitionPage, setDefinitionPage] = useState(2);
  const [examplePage, setExamplePage] = useState(2);
  
  const [phraseLoading, setPhraseLoading] = useState(false);
  const [definitionLoading, setDefinitionLoading] = useState(false);
  const [exampleLoading, setExampleLoading] = useState(false);
  
  const [phraseHasMore, setPhraseHasMore] = useState(true);
  const [definitionHasMore, setDefinitionHasMore] = useState(true);
  const [exampleHasMore, setExampleHasMore] = useState(true);

  const [phraseSort, setPhraseSort] = useState<SortOption>("recent");
  const [definitionSort, setDefinitionSort] = useState<SortOption>("recent");
  const [exampleSort, setExampleSort] = useState<SortOption>("recent");

  const [activeTab, setActiveTab] = useState<TabType>("phrases");

  const loadMoreContributions = useCallback(async (type: TabType, page: number, sortBy: SortOption) => {
    const loadingMap = {
      phrases: phraseLoading,
      definitions: definitionLoading,
      examples: exampleLoading,
    };

    const hasMoreMap = {
      phrases: phraseHasMore,
      definitions: definitionHasMore,
      examples: exampleHasMore,
    };

    if (loadingMap[type] || !hasMoreMap[type]) return;

    const setLoadingMap = {
      phrases: setPhraseLoading,
      definitions: setDefinitionLoading,
      examples: setExampleLoading,
    };

    setLoadingMap[type](true);

    try {
      const url = `/api/contributions?page=${page}&limit=10&type=${type}&sortBy=${sortBy}${userId ? `&userId=${userId}` : ''}`;
      const response = await fetch(url);
      const data: APIResponse = await response.json();
      
      if (data.data && data.data.length > 0) {
        // Convert date strings to Date objects
        const dataWithDates = data.data.map((item) => ({
          ...item,
          createdAt: new Date(item.createdAt),
        }));

        // Update counts if provided in response
        if (data.totalCounts) {
          setCounts(data.totalCounts);
        }

        if (type === "phrases") {
          setPhrases(prev => [...prev, ...dataWithDates as Phrase[]]);
          setPhrasePage(prev => prev + 1);
          setPhraseHasMore(data.hasMore);
        } else if (type === "definitions") {
          setDefinitions(prev => [...prev, ...dataWithDates as Definition[]]);
          setDefinitionPage(prev => prev + 1);
          setDefinitionHasMore(data.hasMore);
        } else if (type === "examples") {
          setExamples(prev => [...prev, ...dataWithDates as Example[]]);
          setExamplePage(prev => prev + 1);
          setExampleHasMore(data.hasMore);
        }
      } else {
        if (type === "phrases") setPhraseHasMore(false);
        else if (type === "definitions") setDefinitionHasMore(false);
        else if (type === "examples") setExampleHasMore(false);
      }
    } catch (error) {
      console.error(`Error loading more ${type}:`, error);
    } finally {
      setLoadingMap[type](false);
    }
  }, [phraseLoading, definitionLoading, exampleLoading, phraseHasMore, definitionHasMore, exampleHasMore, userId]);

  // Handle sort changes - reset data and fetch from beginning
  const handleSortChange = async (type: TabType, newSort: SortOption) => {
    if (type === "phrases") {
      setPhraseSort(newSort);
      setPhrases([]); // Clear existing data
      setPhrasePage(2); // Reset to 2 since we'll load page 1
      setPhraseHasMore(true);
    } else if (type === "definitions") {
      setDefinitionSort(newSort);
      setDefinitions([]);
      setDefinitionPage(2);
      setDefinitionHasMore(true);
    } else if (type === "examples") {
      setExampleSort(newSort);
      setExamples([]);
      setExamplePage(2);
      setExampleHasMore(true);
    }

    // Load first page with new sort
    await loadMoreContributions(type, 1, newSort);
  };

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop 
          >= document.documentElement.offsetHeight - 1000) {
        const sortMap = {
          phrases: phraseSort,
          definitions: definitionSort,
          examples: exampleSort,
        };
        const pageMap = {
          phrases: phrasePage,
          definitions: definitionPage,
          examples: examplePage,
        };
        
        loadMoreContributions(activeTab, pageMap[activeTab], sortMap[activeTab]);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMoreContributions, activeTab, phrasePage, definitionPage, examplePage, phraseSort, definitionSort, exampleSort]);

  const SortDropdown = ({ value, onChange, id }: { 
    value: SortOption; 
    onChange: (value: SortOption) => void; 
    id: string;
  }) => (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="w-4 h-4" />
      <Select value={value} onValueChange={(newValue: SortOption) => onChange(newValue)}>
        <SelectTrigger className="w-[140px]" id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent">Most Recent</SelectItem>
          <SelectItem value="upvotes">Most Upvotes</SelectItem>
          <SelectItem value="oldest">Oldest First</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <Card className="border-4 shadow-elevation-medium">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Contributions
        </CardTitle>
        <CardDescription>
          Track all contributions to the community
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="phrases" className="w-full" onValueChange={(value) => setActiveTab(value as TabType)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="phrases">Phrases ({counts.phrases})</TabsTrigger>
            <TabsTrigger value="definitions">Definitions ({counts.definitions})</TabsTrigger>
            <TabsTrigger value="examples">Examples ({counts.examples})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="phrases" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Phrases</h3>
              <SortDropdown 
                value={phraseSort} 
                onChange={(newSort) => handleSortChange("phrases", newSort)}
                id="phrase-sort"
              />
            </div>
            
            {phrases.length === 0 && !phraseLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No phrases submitted yet.</p>
                <Link href="/submit" className="text-primary hover:underline">
                  Submit your first phrase
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {phrases.map((phrase) => {
                  const totalVotes = phrase.definitions.reduce((total, def) => 
                    total + def.votes.reduce((sum, vote) => sum + vote.value, 0), 0
                  );
                  
                  return (
                    <Card key={phrase.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-2">
                          <Link 
                            href={`/${phrase.language.isoCode}/${phrase.slug}`}
                            className="text-lg font-medium hover:underline"
                          >
                            {phrase.textOriginal}
                          </Link>
                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant="outline">{phrase.language.name}</Badge>
                            <Badge variant={
                              phrase.status === 'approved' ? 'default' :
                              phrase.status === 'pending' ? 'secondary' : 'destructive'
                            }>
                              {phrase.status}
                            </Badge>
                          </div>
                        </div>
                        
                        {phrase.partOfSpeech && (
                          <p className="text-sm text-muted-foreground mb-2">
                            Part of speech: {phrase.partOfSpeech}
                          </p>
                        )}
                        
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>{new Date(phrase.createdAt).toLocaleDateString()}</span>
                          <div className="flex items-center gap-4">
                            <span>{phrase.definitions.length} definitions</span>
                            <span className={totalVotes >= 0 ? "text-green-600" : "text-red-600"}>
                              {totalVotes > 0 ? '+' : ''}{totalVotes} votes
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                
                {phraseLoading && (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                )}
                
                {!phraseHasMore && phrases.length > 0 && (
                  <div className="text-center py-8 text-gray-500">
                    You&apos;ve seen all phrases!
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="definitions" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Definitions</h3>
              <SortDropdown 
                value={definitionSort} 
                onChange={(newSort) => handleSortChange("definitions", newSort)}
                id="definition-sort"
              />
            </div>
            
            {definitions.length === 0 && !definitionLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No definitions contributed yet.</p>
                <Link href="/submit" className="text-primary hover:underline">
                  Add your first definition
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {definitions.map((def) => {
                  const voteScore = def.votes.reduce((sum, vote) => sum + vote.value, 0);
                  
                  return (
                    <Card key={def.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-2">
                          <Link 
                            href={`/${def.phrase.language.isoCode}/${def.phrase.slug}`}
                            className="text-lg font-medium hover:underline"
                          >
                            {def.phrase.textOriginal}
                          </Link>
                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant="outline">{def.phrase.language.name}</Badge>
                            <Badge variant={
                              def.status === 'approved' ? 'default' :
                              def.status === 'pending' ? 'secondary' : 'destructive'
                            }>
                              {def.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-sm mb-3 whitespace-pre-wrap">{def.body}</p>
                        
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>{new Date(def.createdAt).toLocaleDateString()}</span>
                          <div className="flex items-center gap-4">
                            <span>{def.examples.length} examples</span>
                            <span className={voteScore >= 0 ? "text-green-600" : "text-red-600"}>
                              {voteScore > 0 ? '+' : ''}{voteScore} votes
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                
                {definitionLoading && (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                )}
                
                {!definitionHasMore && definitions.length > 0 && (
                  <div className="text-center py-8 text-gray-500">
                    You&apos;ve seen all definitions!
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="examples" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Examples</h3>
              <SortDropdown 
                value={exampleSort} 
                onChange={(newSort) => handleSortChange("examples", newSort)}
                id="example-sort"
              />
            </div>
            
            {examples.length === 0 && !exampleLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No examples contributed yet.</p>
                <Link href="/submit" className="text-primary hover:underline">
                  Add your first example
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {examples.map((example) => {
                  const voteScore = example.votes.reduce((sum, vote) => sum + vote.value, 0);
                  
                  return (
                    <Card key={example.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-2">
                          <Link 
                            href={`/${example.definition.phrase.language.isoCode}/${example.definition.phrase.slug}`}
                            className="text-lg font-medium hover:underline"
                          >
                            {example.definition.phrase.textOriginal}
                          </Link>
                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant="outline">{example.definition.phrase.language.name}</Badge>
                            <Badge variant={
                              example.status === 'approved' ? 'default' :
                              example.status === 'pending' ? 'secondary' : 'destructive'
                            }>
                              {example.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-sm italic mb-1 whitespace-pre-wrap">&ldquo;{example.text}&rdquo;</p>
                        
                        {example.translation && (
                          <p className="text-sm text-muted-foreground mb-2 whitespace-pre-wrap">
                            Translation: {example.translation}
                          </p>
                        )}
                        
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>{new Date(example.createdAt).toLocaleDateString()}</span>
                          <span className={voteScore >= 0 ? "text-green-600" : "text-red-600"}>
                            {voteScore > 0 ? '+' : ''}{voteScore} votes
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                
                {exampleLoading && (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                )}
                
                {!exampleHasMore && examples.length > 0 && (
                  <div className="text-center py-8 text-gray-500">
                    You&apos;ve seen all examples!
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}