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
    <main className="mx-auto max-w-4xl p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1 rounded-lg border-4 bg-card text-card-foreground p-4 md:p-6 shadow-elevation-medium">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground break-words">
            {phrase.textOriginal}
            {phrase.transliteration && (
              <span className="block md:inline md:ml-3 text-lg md:text-xl text-muted-foreground font-normal mt-1 md:mt-0">
                ({phrase.transliteration})
              </span>
            )}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            Language: {phrase.language.name}
          </p>
          {phrase.pronunciation && (
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Pronunciation: {phrase.pronunciation}
            </p>
          )}
        </div>
        {userId && (
          <Link
            href={`/submit?phrase=${encodeURIComponent(phrase.textOriginal)}&languageId=${phrase.languageId}`}
            className="w-full md:w-auto md:flex-shrink-0 rounded bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 font-bold text-center transition-colors"
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
              <li key={def.id} className="rounded-lg border-4 bg-card text-card-foreground p-4 md:p-6 space-y-3 md:space-y-4 shadow-elevation-medium">
                <p className="mb-1 text-sm md:text-base text-card-foreground leading-relaxed">{def.body}</p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs md:text-sm text-card-foreground/70">
                  <span>
                    By {def.author.username ? (
                      <Link href={`/user/${def.author.username}`} className="text-[var(--primary)] hover:underline">
                        {def.author.name || def.author.email || 'Anonymous'}
                      </Link>
                    ) : (
                      def.author.name || def.author.email || 'Anonymous'
                    )}
                  </span>
                  <time dateTime={def.createdAt.toISOString()}>
                    {def.createdAt.toLocaleDateString()}
                  </time>
                </div>
                {/* ✅ Voting for Definition */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <VoteButtons
                    score={def.votes.reduce((sum, v) => sum + v.value, 0)}
                    type="definition"
                    id={def.id}
                    userVote={userVote?.value || null}
                  />
                  <FlagButton definitionId={def.id} />
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h4 className="text-sm md:text-base font-medium text-card-foreground/80">
                      Examples{def.examples.length > 0 ? `:` : ''}
                    </h4>
                    {userId && (
                      <Link
                        href={`/submit?phrase=${encodeURIComponent(phrase.textOriginal)}&languageId=${phrase.languageId}&definition=${encodeURIComponent(def.body)}&definitionId=${def.id}`}
                        className="w-full sm:w-auto rounded bg-primary px-3 py-1 text-xs md:text-sm text-primary-foreground hover:bg-primary/80 font-bold text-center transition-colors"
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
                        <div key={ex.id} className="rounded-lg border-2 bg-secondary/30 text-secondary-foreground p-3 md:p-4 space-y-2 md:space-y-3 shadow-sm">
                          <p className="text-sm md:text-base italic text-secondary-foreground leading-relaxed">&ldquo;{ex.text}&rdquo;</p>
                          {ex.translation && (
                            <p className="text-xs md:text-sm text-secondary-foreground/70">
                              Translation: {ex.translation}
                            </p>
                          )}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex flex-col text-xs md:text-sm text-secondary-foreground/70">
                              <span>
                                By {ex.author.username ? (
                                  <Link href={`/user/${ex.author.username}`} className="text-[var(--primary)] hover:underline">
                                    {ex.author.name || ex.author.email || 'Anonymous'}
                                  </Link>
                                ) : (
                                  ex.author.name || ex.author.email || 'Anonymous'
                                )}
                              </span>
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