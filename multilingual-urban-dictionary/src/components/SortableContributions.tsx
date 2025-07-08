"use client";

import { useState } from "react";
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

interface SortableContributionsProps {
  phrases: Phrase[];
  definitions: Definition[];
  examples: Example[];
}

type SortOption = "recent" | "upvotes" | "oldest";

export default function SortableContributions({ phrases, definitions, examples }: SortableContributionsProps) {
  const [phraseSort, setPhraseSort] = useState<SortOption>("recent");
  const [definitionSort, setDefinitionSort] = useState<SortOption>("recent");
  const [exampleSort, setExampleSort] = useState<SortOption>("recent");

  const sortPhrases = (phrases: Phrase[], sortBy: SortOption) => {
    return [...phrases].sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "upvotes":
          const aVotes = a.definitions.reduce((total, def) => 
            total + def.votes.reduce((sum, vote) => sum + vote.value, 0), 0
          );
          const bVotes = b.definitions.reduce((total, def) => 
            total + def.votes.reduce((sum, vote) => sum + vote.value, 0), 0
          );
          return bVotes - aVotes;
        default:
          return 0;
      }
    });
  };

  const sortDefinitions = (definitions: Definition[], sortBy: SortOption) => {
    return [...definitions].sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "upvotes":
          const aVotes = a.votes.reduce((sum, vote) => sum + vote.value, 0);
          const bVotes = b.votes.reduce((sum, vote) => sum + vote.value, 0);
          return bVotes - aVotes;
        default:
          return 0;
      }
    });
  };

  const sortExamples = (examples: Example[], sortBy: SortOption) => {
    return [...examples].sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "upvotes":
          const aVotes = a.votes.reduce((sum, vote) => sum + vote.value, 0);
          const bVotes = b.votes.reduce((sum, vote) => sum + vote.value, 0);
          return bVotes - aVotes;
        default:
          return 0;
      }
    });
  };

  const sortedPhrases = sortPhrases(phrases, phraseSort);
  const sortedDefinitions = sortDefinitions(definitions, definitionSort);
  const sortedExamples = sortExamples(examples, exampleSort);

  const SortDropdown = ({ value, onChange, id }: { value: SortOption; onChange: (value: SortOption) => void; id: string }) => (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="w-4 h-4" />
      <Select value={value} onValueChange={onChange}>
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          My Contributions
        </CardTitle>
        <CardDescription>
          Track all your contributions to the community
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="phrases" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="phrases">Phrases ({phrases.length})</TabsTrigger>
            <TabsTrigger value="definitions">Definitions ({definitions.length})</TabsTrigger>
            <TabsTrigger value="examples">Examples ({examples.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="phrases" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Your Phrases</h3>
              <SortDropdown 
                value={phraseSort} 
                onChange={setPhraseSort}
                id="phrase-sort"
              />
            </div>
            
            {sortedPhrases.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>You haven&apos;t submitted any phrases yet.</p>
                <Link href="/submit" className="text-primary hover:underline">
                  Submit your first phrase
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedPhrases.map((phrase) => {
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
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="definitions" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Your Definitions</h3>
              <SortDropdown 
                value={definitionSort} 
                onChange={setDefinitionSort}
                id="definition-sort"
              />
            </div>
            
            {sortedDefinitions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>You haven&apos;t contributed any definitions yet.</p>
                <Link href="/submit" className="text-primary hover:underline">
                  Add your first definition
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedDefinitions.map((def) => {
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
                        
                        <p className="text-sm mb-3">{def.body}</p>
                        
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
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="examples" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Your Examples</h3>
              <SortDropdown 
                value={exampleSort} 
                onChange={setExampleSort}
                id="example-sort"
              />
            </div>
            
            {sortedExamples.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>You haven&apos;t contributed any examples yet.</p>
                <Link href="/submit" className="text-primary hover:underline">
                  Add your first example
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedExamples.map((example) => {
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
                        
                        <p className="text-sm italic mb-1">&ldquo;{example.text}&rdquo;</p>
                        
                        {example.translation && (
                          <p className="text-sm text-muted-foreground mb-2">
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
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}