import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import VoteButtons from "@/components/VoteButtons";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import Link from "next/link";
import FlagButton from "@/components/FlagButton";
import AdminEditButton from "@/components/AdminEditButton";
import PhraseDetailsFAB from "@/components/PhraseDetailsFAB";
import { Plus } from "lucide-react";

// ISR: Revalidate phrase pages every hour
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const phrase = await prisma.phrase.findUnique({
    where: { slug },
    include: {
      language: true,
      definitions: {
        where: { status: "approved" },
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!phrase) {
    return {
      title: "Phrase Not Found",
      description: "The phrase you're looking for doesn't exist.",
    };
  }

  const topDefinition = phrase.definitions[0]?.body;
  const description = topDefinition
    ? `${phrase.textOriginal} in ${phrase.language.name}: ${topDefinition.substring(0, 150)}${topDefinition.length > 150 ? "..." : ""}`
    : `Learn the meaning of '${phrase.textOriginal}' in ${phrase.language.name} on Yung Salita.`;

  return {
    title: `${phrase.textOriginal} - ${phrase.language.name} Slang`,
    description,
    keywords: [
      phrase.textOriginal,
      phrase.language.name,
      "slang",
      "definition",
      "urban dictionary",
    ],
    openGraph: {
      title: `${phrase.textOriginal} - ${phrase.language.name} Slang`,
      description,
      type: "article",
      locale: phrase.language.isoCode,
    },
    twitter: {
      card: "summary",
      title: `${phrase.textOriginal} - ${phrase.language.name} Slang`,
      description,
    },
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
  const isAdmin = session?.user?.role === "admin";
  const isAuthenticated = !!userId;

  const phrase = await prisma.phrase.findUnique({
    where: { slug },
    include: {
      language: true,
      tags: {
        include: {
          tag: true,
        },
      },
      definitions: {
        where: {
          status: "approved",
          // Hide NSFW content from unauthenticated users
          ...(isAuthenticated ? {} : { isNSFW: false })
        },
        include: {
          author: true,
          examples: {
            where: {
              status: "approved",
              // Hide NSFW examples from unauthenticated users
              ...(isAuthenticated ? {} : { isNSFW: false })
            },
            include: {
              votes: true,
              author: true,
            },
          },
          votes: true,
        },
      },
    },
  });

  // Helper function to calculate vote score
  const getVoteScore = (votes: { value: number }[]) =>
    votes.reduce((sum, v) => sum + v.value, 0);

  // Sort by vote score (highest to lowest)
  const sortByVotes = (
    a: { votes: { value: number }[] },
    b: { votes: { value: number }[] }
  ) => getVoteScore(b.votes) - getVoteScore(a.votes);

  // Sort definitions and examples by vote score
  if (phrase) {
    phrase.definitions.sort(sortByVotes);
    phrase.definitions.forEach((def) => def.examples.sort(sortByVotes));
  }

  if (!phrase || phrase.language.isoCode !== lang) return notFound();

  // If phrase is NSFW and user is not authenticated, show auth required message
  if (phrase.isNSFW && !isAuthenticated) {
    return (
      <main className="mx-auto max-w-4xl p-4 md:p-6 space-y-6 animate-page-enter">
        <div className="rounded-[20px] border-4 border-destructive/50 bg-card text-card-foreground p-8 text-center shadow-card">
          <div className="text-6xl mb-4">🔞</div>
          <h1 className="text-2xl font-black mb-4">Age-Restricted Content</h1>
          <p className="text-muted-foreground mb-6">
            This phrase contains mature content. Please sign in to view (18+ only).
          </p>
          <Link
            href="/api/auth/signin"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground font-bold shadow-md hover:shadow-lg hover:bg-primary/90 transition-all duration-200"
          >
            Sign In to View
          </Link>
        </div>
      </main>
    );
  }

  // Generate JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: phrase.textOriginal,
    description:
      phrase.definitions[0]?.body || `Definition of ${phrase.textOriginal}`,
    inLanguage: phrase.language.isoCode,
    url: `${process.env.NEXTAUTH_URL || "https://yungsalita.com"}/${phrase.language.isoCode}/${phrase.slug}`,
    dateCreated: phrase.createdAt.toISOString(),
    dateModified: phrase.updatedAt.toISOString(),
    isPartOf: {
      "@type": "WebSite",
      name: "Yung Salita",
      url: process.env.NEXTAUTH_URL || "https://yungsalita.com",
    },
    ...(phrase.definitions.length > 0 && {
      definition: phrase.definitions.map((def) => ({
        "@type": "Definition",
        text: def.body,
        dateCreated: def.createdAt.toISOString(),
        author: {
          "@type": "Person",
          name: def.author.name || "Anonymous",
        },
      })),
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="mx-auto max-w-4xl p-4 md:p-6 space-y-6 animate-page-enter">
        {/* Hero Section */}
        <div className="space-y-4">
          {/* Main Hero Card */}
          <div
            className="
              rounded-[20px] border-4 border-primary bg-card text-card-foreground p-4 md:p-5
              shadow-card relative overflow-hidden
                          "
          >
            {/* Language Badge */}
            <div className="mb-4 relative z-10 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-bold bg-primary text-primary-foreground tracking-[0.15em] uppercase shadow-sm">
                {phrase.language.name}
              </span>
              {phrase.isNSFW && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-bold bg-destructive text-destructive-foreground tracking-[0.15em] uppercase shadow-sm">
                  🔞 NSFW
                </span>
              )}
            </div>

            {/* Hero Title */}
            <h1
              className="
                text-3xl md:text-4xl lg:text-5xl font-black text-foreground
                tracking-tighter leading-[1.1] break-words
                drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]
                relative z-10
              "
            >
              {phrase.textOriginal}
              {phrase.transliteration && (
                <span className="block mt-2 text-lg md:text-xl text-muted-foreground/70 font-medium italic tracking-wide">
                  /{phrase.transliteration}/
                </span>
              )}
            </h1>

            {/* Meta Info */}
            {(phrase.region || phrase.pronunciation) && (
              <div className="mt-4 space-y-1 relative z-10">
                {phrase.region && (
                  <p className="text-sm text-muted-foreground/70">
                    <span className="text-muted-foreground/50">📍 Region:</span>{" "}
                    <span className="font-medium">{phrase.region}</span>
                  </p>
                )}
                {phrase.pronunciation && (
                  <p className="text-sm text-muted-foreground/70">
                    <span className="text-muted-foreground/50">🔊 Sounds like:</span>{" "}
                    <span className="font-medium italic">{phrase.pronunciation}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Actions Card - Desktop Only */}
          <div
            className="
              hidden lg:flex
              rounded-[16px] border-2 border-primary/30 bg-card/80 backdrop-blur-sm
              p-4 shadow-sm
              flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3
            "
          >
            {/* Primary Action */}
            {userId ? (
              <Link
                href={`/submit?phrase=${encodeURIComponent(phrase.textOriginal)}&languageId=${phrase.languageId}`}
                className="
                  flex-1 sm:flex-none
                  inline-flex items-center justify-center gap-2
                  rounded-full bg-primary px-5 py-2.5
                  text-sm text-primary-foreground font-bold
                  shadow-sm hover:shadow-md hover:bg-primary/90
                  transition-all duration-200
                "
              >
                <span className="text-lg leading-none">+</span>
                <span>New Definition</span>
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground/70 italic">
                Sign in to contribute
              </p>
            )}

            {/* Secondary Actions */}
            {userId && (
              <div className="flex items-center justify-end gap-2">
                {isAdmin && <AdminEditButton phraseId={phrase.id} />}
                <FlagButton phraseId={phrase.id} />
              </div>
            )}
          </div>
        </div>

        {/* Definitions */}
        {phrase.definitions.length === 0 ? (
          <div className="rounded-[20px] border-4 border-dashed border-muted-foreground/30 bg-card/50 p-8 text-center">
            <p className="text-muted-foreground/70 text-lg">
              No definitions yet. Be the first to add one!
            </p>
          </div>
        ) : (
          <ul className="space-y-6">
            {phrase.definitions.map((def, defIndex) => {
              const userVote = userId
                ? def.votes.find((v) => v.userId === userId)
                : null;
              const defScore = def.votes.reduce((sum, v) => sum + v.value, 0);

              return (
                <li
                  key={def.id}
                  className="
                    rounded-[20px] border-4 border-primary bg-card text-card-foreground p-4 md:p-5
                    shadow-card relative overflow-hidden
                                      "
                >
                  {/* Definition Number Badge */}
                  <div className="absolute -top-0 -right-0 w-12 h-12 bg-primary/10 rounded-bl-[20px] flex items-center justify-center">
                    <span className="text-primary font-black text-lg">
                      #{defIndex + 1}
                    </span>
                  </div>

                  {/* Definition Body */}
                  <p className="text-[15px] md:text-base text-card-foreground/90 leading-[1.8] whitespace-pre-wrap pr-10 relative z-10">
                    {def.body}
                  </p>

                  {/* Author, Date & Voting */}
                  <div className="mt-3 pt-2 md:mt-4 md:pt-3 relative z-10">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

                    {/* Mobile: Author + Votes on same row, Date below */}
                    {/* Desktop: Maintain flexible layout */}
                    <div className="flex flex-col gap-2">
                      {/* First Row: Author + Vote Buttons */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground/60">
                          <span className="text-muted-foreground/40 mr-1">by</span>
                          {def.author.username ? (
                            <Link
                              href={`/user/${def.author.username}`}
                              className="font-medium text-primary/80 hover:text-primary hover:underline transition-colors"
                            >
                              {def.author.name || def.author.email || "Anonymous"}
                            </Link>
                          ) : (
                            <span className="font-medium text-muted-foreground/80">
                              {def.author.name || def.author.email || "Anonymous"}
                            </span>
                          )}
                        </span>

                        {/* Vote Buttons + Score */}
                        <div className="flex items-center gap-2">
                          <VoteButtons
                            score={defScore}
                            type="definition"
                            id={def.id}
                            userVote={userVote?.value || null}
                          />
                          <span
                            className={`
                              inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold
                              ${defScore >= 0 ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}
                            `}
                          >
                            <span className="text-[8px]">
                              {defScore >= 0 ? "▲" : "▼"}
                            </span>
                            {Math.abs(defScore)}
                          </span>
                        </div>
                      </div>

                      {/* Second Row: Date + Flag */}
                      <div className="flex items-center justify-between">
                        <time
                          dateTime={def.createdAt.toISOString()}
                          className="text-[11px] text-muted-foreground/50 font-mono tabular-nums"
                        >
                          {def.createdAt.toLocaleDateString()}
                        </time>
                        <FlagButton definitionId={def.id} />
                      </div>
                    </div>
                  </div>

                  {/* Examples Section */}
                  <div className="mt-4 md:mt-6 space-y-3 md:space-y-4 relative z-10">
                    <div className="flex flex-row items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-card-foreground/80 uppercase tracking-wider">
                        Examples
                        {def.examples.length > 0 && (
                          <span className="ml-2 text-primary/60">
                            ({def.examples.length})
                          </span>
                        )}
                      </h4>
                      {userId && (
                        <Link
                          href={`/submit?phrase=${encodeURIComponent(phrase.textOriginal)}&languageId=${phrase.languageId}&definition=${encodeURIComponent(def.body)}&definitionId=${def.id}`}
                          className="
                            rounded-full bg-primary/10 border-2 border-primary/30
                            px-2 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-xs text-primary font-bold
                            hover:bg-primary hover:text-primary-foreground hover:border-primary
                            transition-all duration-200
                            flex items-center gap-1 sm:gap-1.5 flex-shrink-0
                          "
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add Example</span>
                        </Link>
                      )}
                    </div>

                    {def.examples.length > 0 && (
                      <div className="space-y-3 md:space-y-4">
                        {def.examples.map((ex) => {
                          const userExampleVote = userId
                            ? ex.votes.find((v) => v.userId === userId)
                            : null;
                          const exScore = ex.votes.reduce(
                            (sum, v) => sum + v.value,
                            0
                          );

                          return (
                            <div
                              key={ex.id}
                              className="relative pl-6"
                            >
                              {/* Large decorative opening quote */}
                              <span
                                className="absolute -left-1 -top-2 text-4xl md:text-5xl text-primary/20 font-serif leading-none select-none"
                                aria-hidden="true"
                              >
                                &ldquo;
                              </span>

                              <div className="border-l-2 border-primary/30 pl-4 py-2 bg-accent/10 dark:bg-accent/5 rounded-r-lg">
                                <p className="text-sm md:text-base italic text-card-foreground/80 leading-relaxed whitespace-pre-wrap">
                                  {ex.text}
                                </p>
                                {ex.translation && (
                                  <p className="text-xs md:text-sm text-card-foreground/50 mt-2 not-italic whitespace-pre-wrap">
                                    <span className="text-muted-foreground/40">
                                      Translation:
                                    </span>{" "}
                                    {ex.translation}
                                  </p>
                                )}

                                {/* Example Meta - Mobile: Keep on same row */}
                                <div className="mt-3 pt-2 border-t border-foreground/5">
                                  {/* Single row with author + votes */}
                                  <div className="flex items-center justify-between gap-2">
                                    {/* Author & Date - Compact for mobile */}
                                    <div className="text-[11px] md:text-xs text-muted-foreground/60 flex-1 min-w-0">
                                      <span className="text-muted-foreground/40 mr-1">
                                        by
                                      </span>
                                      {ex.author.username ? (
                                        <Link
                                          href={`/user/${ex.author.username}`}
                                          className="font-medium text-primary/80 hover:text-primary hover:underline transition-colors"
                                        >
                                          {ex.author.name ||
                                            ex.author.email ||
                                            "Anonymous"}
                                        </Link>
                                      ) : (
                                        <span className="font-medium text-muted-foreground/80">
                                          {ex.author.name ||
                                            ex.author.email ||
                                            "Anonymous"}
                                        </span>
                                      )}
                                      <span className="mx-1 md:mx-2 text-muted-foreground/30">
                                        •
                                      </span>
                                      <time
                                        dateTime={ex.createdAt.toISOString()}
                                        className="font-mono tabular-nums text-muted-foreground/50"
                                      >
                                        {ex.createdAt.toLocaleDateString()}
                                      </time>
                                    </div>

                                    {/* Vote Buttons + Score + Flag */}
                                    <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                                      <VoteButtons
                                        score={exScore}
                                        type="example"
                                        id={ex.id}
                                        userVote={userExampleVote?.value || null}
                                      />
                                      <span
                                        className={`
                                          inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold
                                          ${exScore >= 0 ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}
                                        `}
                                      >
                                        <span className="text-[8px]">
                                          {exScore >= 0 ? "▲" : "▼"}
                                        </span>
                                        {Math.abs(exScore)}
                                      </span>
                                      <FlagButton exampleId={ex.id} />
                                    </div>
                                  </div>
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

        {/* Tags Section */}
        {phrase.tags && phrase.tags.length > 0 && (
          <div
            className="
              rounded-[20px] border-4 border-primary bg-card text-card-foreground p-4 md:p-5
              shadow-card relative overflow-hidden
                          "
          >
            <h3 className="text-sm font-bold text-card-foreground/80 uppercase tracking-wider mb-4 relative z-10">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2 relative z-10">
              {phrase.tags.map((phraseTag) => (
                <span
                  key={phraseTag.tag.id}
                  className="
                    inline-flex items-center px-3 py-1.5 rounded-full
                    text-xs font-bold text-white tracking-wide uppercase
                    shadow-sm -rotate-1 hover:rotate-0 transition-transform
                  "
                  style={{ backgroundColor: phraseTag.tag.color || "#3B82F6" }}
                >
                  {phraseTag.tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button - Mobile Only */}
      <PhraseDetailsFAB
        phraseTitle={phrase.textOriginal}
        languageId={phrase.languageId}
      />
    </>
  );
}
