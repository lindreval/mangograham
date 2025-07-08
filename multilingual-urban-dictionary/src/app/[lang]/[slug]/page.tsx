import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import VoteButtons from "@/components/VoteButtons";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import Link from "next/link";
import FlagButton from "@/components/FlagButton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const phrase = await prisma.phrase.findUnique({
    where: { slug },
    include: { language: true },
  });

  return {
    title: phrase?.textOriginal ?? "Phrase",
    description: `Definition of '${phrase?.textOriginal}' in ${phrase?.language.name}`,
  };
}

export default async function PhrasePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  
  // Get current user session
  const session = await getServerSession(authConfig);
  const userId = session?.user?.id;

  const phrase = await prisma.phrase.findUnique({
    where: { slug },
    include: {
      language: true,
      definitions: {
        where: { status: {in: ["approved", "pending"],} },
        include: {
          author: true, // Include definition author
          examples: {
            where: { status: {in: ["approved", "pending"],} },
            include: {
              votes: true, // This gets ExampleVote[]
              author: true, // Include example author
            },
          },
          votes: true, // This gets DefinitionVote[]
        },
      },
    },
  });

  // Helper function to calculate vote score
  const getVoteScore = (votes: { value: number }[]) => 
    votes.reduce((sum, v) => sum + v.value, 0);

  // Sort by vote score (highest to lowest)
  const sortByVotes = (a: { votes: { value: number }[] }, b: { votes: { value: number }[] }) => 
    getVoteScore(b.votes) - getVoteScore(a.votes);

  // Sort definitions and examples by vote score
  if (phrase) {
    phrase.definitions.sort(sortByVotes);
    phrase.definitions.forEach(def => def.examples.sort(sortByVotes));
  }

  if (!phrase || phrase.language.isoCode !== lang) return notFound();

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {phrase.textOriginal}
            {phrase.transliteration && (
              <span className="ml-3 text-xl text-muted-foreground font-normal">
                ({phrase.transliteration})
              </span>
            )}
          </h1>
          <p className="text-muted-foreground">
            Language: {phrase.language.name}
          </p>
          {phrase.pronunciation && (
            <p className="text-sm text-muted-foreground">
              Pronunciation: {phrase.pronunciation}
            </p>
          )}
        </div>
        {userId && (
          <Link
            href={`/submit?phrase=${encodeURIComponent(phrase.textOriginal)}&languageId=${phrase.languageId}`}
            className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90"
          >
            + New Definition
          </Link>
        )}
      </div>
      {phrase.definitions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No approved definitions yet.</p>
      ) : (
        <ul className="space-y-4">
          {phrase.definitions.map((def) => {
            // Find current user's vote on this definition
            const userVote = userId ? def.votes.find(v => v.userId === userId) : null;
            
            return (
              <li key={def.id} className="rounded border p-4 space-y-2">
                <p className="mb-1">{def.body}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>By {def.author.name || def.author.email || 'Anonymous'}</span>
                  <time dateTime={def.createdAt.toISOString()}>
                    {def.createdAt.toLocaleDateString()}
                  </time>
                </div>
                {/* ✅ Voting for Definition */}
                <div className="flex items-center justify-between">
                  <VoteButtons
                    score={def.votes.reduce((sum, v) => sum + v.value, 0)}
                    type="definition"
                    id={def.id}
                    userVote={userVote?.value || null}
                  />
                  <FlagButton definitionId={def.id} />
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Examples{def.examples.length > 0 ? `:` : ''}
                    </h4>
                    {userId && (
                      <Link
                        href={`/submit?phrase=${encodeURIComponent(phrase.textOriginal)}&languageId=${phrase.languageId}&definition=${encodeURIComponent(def.body)}&definitionId=${def.id}`}
                        className="rounded bg-secondary px-3 py-1 text-xs text-secondary-foreground hover:bg-secondary/80"
                      >
                        + Add Example
                      </Link>
                    )}
                  </div>
                  {def.examples.length > 0 && (
                    <div className="space-y-3">
                      {def.examples.map((ex) => {
                      // Find current user's vote on this example
                      const userExampleVote = userId ? ex.votes.find(v => v.userId === userId) : null;
                      
                      return (
                        <div key={ex.id} className="rounded border bg-muted/30 p-3 space-y-2">
                          <p className="text-sm italic">&ldquo;{ex.text}&rdquo;</p>
                          {ex.translation && (
                            <p className="text-xs text-muted-foreground">
                              Translation: {ex.translation}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col text-xs text-muted-foreground">
                              <span>By {ex.author.name || ex.author.email || 'Anonymous'}</span>
                              <time dateTime={ex.createdAt.toISOString()}>
                                {ex.createdAt.toLocaleDateString()}
                              </time>
                            </div>
                            <div className="flex items-center gap-2">
                              <VoteButtons
                                score={ex.votes.reduce((sum, v) => sum + v.value, 0)}
                                type="example"
                                id={ex.id}
                                userVote={userExampleVote?.value || null}
                              />
                              <FlagButton exampleId={ex.id} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}