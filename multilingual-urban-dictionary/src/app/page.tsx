// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
//       <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={180}
//           height={38}
//           priority
//         />
//         <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
//           <li className="mb-2 tracking-[-.01em]">
//             Hi I&apos;m Lindell Dre{" "}
//             <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">
//               src/app/page.tsx
//             </code>
//             .
//           </li>
//           <li className="tracking-[-.01em]">
//             Save and see your changes instantly.
//           </li>
//         </ol>

//         <div className="flex gap-4 items-center flex-col sm:flex-row">
//           <a
//             className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={20}
//               height={20}
//             />
//             Deploy now
//           </a>
//           <a
//             className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Read our docs
//           </a>
//         </div>
//       </main>
//       <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/file.svg"
//             alt="File icon"
//             width={16}
//             height={16}
//           />
//           Learn
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/window.svg"
//             alt="Window icon"
//             width={16}
//             height={16}
//           />
//           Examples
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/globe.svg"
//             alt="Globe icon"
//             width={16}
//             height={16}
//           />
//           Go to nextjs.org →
//         </a>
//       </footer>
//     </div>
//   );
// }

// import prisma from "@/lib/prisma";
// import LanguageSidebar from "@/components/LanguageSidebar";
// import PhraseCard from "@/components/PhraseCard";

// export const revalidate = 60; // ISR every minute

// export default async function Home() {
//   const [phrases, languages] = await Promise.all([
//     prisma.phrase.findMany({
//       orderBy: { createdAt: "desc" },
//       take: 20,
//       include: { language: true, definitions: { where: { status: "approved" }, take: 1 } },
//     }),
//     prisma.language.findMany(),
//   ]);

//   return (
//     <main className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
//       {/* sidebar */}
//       <LanguageSidebar languages={languages} />

//       {/* feed */}
//       <section className="flex-1 space-y-4">
//         {phrases.map((p) => (
//           <PhraseCard key={p.id} phrase={p} />
//         ))}
//       </section>
//     </main>
//   );
// }

import { prisma } from "@/lib/prisma";
import LanguageSidebar from "@/components/LanguageSidebar";
import InfiniteScrollPhrases from "@/components/InfiniteScrollPhrases";
import type { Metadata } from "next";
import type { PhraseWithLang } from "@/components/PhraseCard";
import type { Language } from "@prisma/client";

export const metadata: Metadata = {
  title: "Home",
  description: "Discover the latest slang and phrases from languages around the world",
};

export const revalidate = 60; // ISR – re-render at most once per minute

export default async function Home() {
  let phrases: PhraseWithLang[] = [];
  let languages: Language[] = [];

  try {
    // Fetch newest 20 phrases with optimized query - only load what's needed for cards
    const rawPhrases = await prisma.phrase.findMany({
      where: {
        status: {
          in: ["approved", "pending"],
        },
        definitions: {
          some: {
            status: {
              in: ["approved", "pending"],
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        language: {
          select: { id: true, name: true, isoCode: true },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        definitions: {
          where: {
            status: {
              in: ["approved", "pending"],
            },
          },
          take: 3, // Only load top 3 definitions per phrase for card display
          include: {
            _count: {
              select: { votes: true }
            },
            author: {
              select: { name: true, email: true },
            },
            examples: {
              where: {
                status: {
                  in: ["approved", "pending"],
                },
              },
              take: 1, // Only need 1 example for card display
              select: {
                id: true,
                text: true,
                translation: true,
                createdAt: true,
                updatedAt: true,
                status: true,
                authorId: true,
                definitionId: true,
              },
            },
          },
        },
      },
    });

    // Calculate vote scores efficiently using a single aggregation query
    const definitionIds = rawPhrases.flatMap(p => p.definitions.map(d => d.id));
    const exampleIds = rawPhrases.flatMap(p => p.definitions.flatMap(d => d.examples.map(e => e.id)));

    // Get vote scores for all definitions and examples in bulk
    const [defVoteScores, exVoteScores] = await Promise.all([
      definitionIds.length > 0
        ? prisma.$queryRaw<{ definitionId: number; score: bigint }[]>`
            SELECT "definitionId", COALESCE(SUM(value), 0) as score
            FROM "DefinitionVote"
            WHERE "definitionId" = ANY(${definitionIds}::int[])
            GROUP BY "definitionId"
          `
        : Promise.resolve([]),
      exampleIds.length > 0
        ? prisma.$queryRaw<{ exampleId: number; score: bigint }[]>`
            SELECT "exampleId", COALESCE(SUM(value), 0) as score
            FROM "ExampleVote"
            WHERE "exampleId" = ANY(${exampleIds}::int[])
            GROUP BY "exampleId"
          `
        : Promise.resolve([]),
    ]);

    // Create lookup maps for O(1) access
    const defScoreMap = new Map(defVoteScores.map(v => [v.definitionId, Number(v.score)]));
    const exScoreMap = new Map(exVoteScores.map(v => [v.exampleId, Number(v.score)]));

    // Transform data with pre-calculated scores
    phrases = rawPhrases.map(phrase => ({
      ...phrase,
      definitions: phrase.definitions
        .map(def => ({
          ...def,
          voteScore: defScoreMap.get(def.id) ?? 0,
          votes: [], // Empty array - score is pre-calculated
          examples: def.examples.map(ex => ({
            ...ex,
            voteScore: exScoreMap.get(ex.id) ?? 0,
            votes: [], // Empty array - score is pre-calculated
          })),
        }))
        .sort((a, b) => b.voteScore - a.voteScore), // Sort by score
    })) as PhraseWithLang[];

    languages = await prisma.language.findMany({
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.warn("Database not available during build:", error);
  }

  return (
    <main className="mx-auto max-w-6xl p-4">
      <div className="md:flex md:gap-6">
        <LanguageSidebar languages={languages} />
        <InfiniteScrollPhrases initialPhrases={phrases} />
      </div>
    </main>
  );
}

