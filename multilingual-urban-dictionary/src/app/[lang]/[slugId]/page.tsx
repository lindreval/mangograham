import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import VoteButtons from "@/components/VoteButtons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slugId: string }>;
}): Promise<Metadata> {
  const { slugId } = await params;
  const id = parseInt(slugId.split("-").pop()!);
  const phrase = await prisma.phrase.findUnique({
    where: { id },
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
  params: Promise<{ lang: string; slugId: string }>;
}) {
  const { lang, slugId } = await params;
  const id = parseInt(slugId.split("-").pop()!);
  
  if (isNaN(id)) return notFound();

  const phrase = await prisma.phrase.findUnique({
    where: { id },
    include: {
      language: true,
      definitions: {
        where: { status: "approved" },
        include: {
          examples: {
            include: {
              votes: true, // This gets ExampleVote[]
            },
          },
          votes: true, // This gets DefinitionVote[]
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!phrase || phrase.language.isoCode !== lang) return notFound();

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-3xl font-bold">{phrase.textOriginal}</h1>
      <p className="text-muted-foreground">
        Language: {phrase.language.name} ({phrase.language.isoCode})
      </p>
      {phrase.definitions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No approved definitions yet.</p>
      ) : (
        <ul className="space-y-4">
          {phrase.definitions.map((def) => (
            <li key={def.id} className="rounded border p-4 space-y-2">
              <p className="mb-1">{def.body}</p>
              {/* ✅ Voting for Definition */}
              <VoteButtons
                score={def.votes.reduce((sum, v) => sum + v.value, 0)}
                type="definition"
                id={def.id}
              />
              {def.pronunciation && (
                <p className="text-sm text-muted-foreground">
                  Pronunciation: {def.pronunciation}
                </p>
              )}
              {def.examples.length > 0 && (
                <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                  {def.examples.map((ex) => (
                    <li key={ex.id} className="flex items-center justify-between">
                      <span>– {ex.text}</span>
                      {/* ✅ Voting for Example */}
                      <VoteButtons
                        score={ex.votes.reduce((sum, v) => sum + v.value, 0)}
                        type="example"
                        id={ex.id}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}