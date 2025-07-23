import { authConfig } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Definition, Example, Phrase } from "@prisma/client";
import type { Session } from "next-auth";

interface CustomSession extends Session {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id: string;
    role: string;
  };
}

// ✅ Fix: Define a reusable type to avoid inline typing + ESLint error
type PendingPhrase = Phrase & {
  language: {
    name: string;
  };
  definitions: {
    body: string;
  }[];
};

type PendingDefinition = Definition & {
  phrase: {
    textOriginal: string;
    language: {
      name: string;
    };
  };
  examples: {
    text: string;
    translation: string | null;
  }[];
};

type PendingExample = Example & {
  definition: {
    phrase: {
      textOriginal: string;
      language: {
        name: string;
      };
    };
    body: string;
  };
};

export default async function AdminPage() {
  const session = (await getServerSession(authConfig)) as CustomSession | null;

  if (!session || session.user?.role !== "admin") {
    // console.log("User session:", session);
    // console.log("User role:", session?.user?.role);
    // console.log("User name:", session?.user?.name);
    // console.log("not an admin");
    redirect("/");
  }

  console.log("you are an admin");

  const [pendingPhrases, pendingDefs, pendingExamples] = await Promise.all([
    prisma.phrase.findMany({
      where: { 
        status: {
          in: ["pending", "needs review"]
        }
      },
      include: {
        language: true,
        definitions: {
          select: { body: true },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.definition.findMany({
      where: { 
        status: {
          in: ["pending", "needs review"]
        }
      },
      include: {
        phrase: {
          include: {
            language: true,
          },
        },
        examples: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.example.findMany({
      where: { 
        status: {
          in: ["pending", "needs review"]
        }
      },
      include: {
        definition: {
          include: {
            phrase: {
              include: {
                language: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <main className="mx-auto max-w-4xl space-y-8 p-6">
      <h1 className="text-2xl font-bold">Moderation Queue</h1>

      {/* Pending/Needs Review Phrases Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-purple-600">Phrases Awaiting Review ({pendingPhrases.length})</h2>
        {pendingPhrases.length === 0 ? (
          <p className="text-muted-foreground">No phrases awaiting review 🎉</p>
        ) : (
          <ul className="space-y-4">
            {pendingPhrases.map((phrase: PendingPhrase) => (
              <li key={phrase.id} className="rounded border p-4 shadow-sm bg-purple-50">
                <div className="mb-2 text-sm text-muted-foreground">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full mr-2 ${
                    phrase.status === 'needs review' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {phrase.status === 'needs review' ? 'Needs Review' : 'Pending Phrase'}
                  </span>
                  <strong>{phrase.textOriginal}</strong> —{" "}
                  {phrase.language.name}
                </div>
                {phrase.partOfSpeech && (
                  <p className="mb-2 text-sm text-muted-foreground">
                    <strong>Part of Speech:</strong> {phrase.partOfSpeech}
                  </p>
                )}
                {phrase.pronunciation && (
                  <p className="mb-2 text-sm text-muted-foreground">
                    <strong>Pronunciation:</strong> {phrase.pronunciation}
                  </p>
                )}
                {phrase.transliteration && (
                  <p className="mb-2 text-sm text-muted-foreground">
                    <strong>Transliteration:</strong> {phrase.transliteration}
                  </p>
                )}
                {phrase.definitions.length > 0 && (
                  <div className="mb-2 text-sm space-y-1">
                    <strong>Definitions:</strong>
                    {phrase.definitions.map((def, i) => (
                      <p key={i} className="ml-4 italic">• {def.body}</p>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <form
                    action={async () => {
                      "use server";
                      await prisma.phrase.update({
                        where: { id: phrase.id },
                        data: { status: "approved" },
                      });
                      revalidatePath("/admin");
                    }}
                  >
                    <button className="rounded bg-green-600 px-4 py-1 text-white hover:bg-green-700">
                      Approve
                    </button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await prisma.phrase.update({
                        where: { id: phrase.id },
                        data: { status: "rejected" },
                      });
                      revalidatePath("/admin");
                    }}
                  >
                    <button className="rounded bg-red-600 px-4 py-1 text-white hover:bg-red-700">
                      Reject
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Pending/Needs Review Definitions Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-blue-600">Definitions Awaiting Review ({pendingDefs.length})</h2>
        {pendingDefs.length === 0 ? (
          <p className="text-muted-foreground">No definitions awaiting review 🎉</p>
        ) : (
          <ul className="space-y-4">
            {pendingDefs.map((def: PendingDefinition) => (
              <li key={def.id} className="rounded border p-4 shadow-sm bg-blue-50">
                <div className="mb-2 text-sm text-muted-foreground">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full mr-2 ${
                    def.status === 'needs review' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {def.status === 'needs review' ? 'Needs Review' : 'Pending Definition'}
                  </span>
                  <strong>{def.phrase.textOriginal}</strong> —{" "}
                  {def.phrase.language.name}
                </div>
                <p className="mb-2">{def.body}</p>
                {def.examples.length > 0 && (
                  <div className="mb-2 text-sm italic space-y-1">
                      {def.examples.map((ex, i) => (
                      <p key={i}>
                          Example: {ex.text}
                          {ex.translation && <> — Translation: {ex.translation}</>}
                      </p>
                      ))}
                  </div>
                  )}
                <div className="flex gap-2">
                  <form
                    action={async () => {
                      "use server";
                      await prisma.definition.update({
                        where: { id: def.id },
                        data: { status: "approved" },
                      });
                      revalidatePath("/admin");
                    }}
                  >
                    <button className="rounded bg-green-600 px-4 py-1 text-white hover:bg-green-700">
                      Approve
                    </button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await prisma.definition.update({
                        where: { id: def.id },
                        data: { status: "rejected" },
                      });
                      revalidatePath("/admin");
                    }}
                  >
                    <button className="rounded bg-red-600 px-4 py-1 text-white hover:bg-red-700">
                      Reject
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Pending/Needs Review Examples Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-orange-600">Examples Awaiting Review ({pendingExamples.length})</h2>
        {pendingExamples.length === 0 ? (
          <p className="text-muted-foreground">No examples awaiting review 🎉</p>
        ) : (
          <ul className="space-y-4">
            {pendingExamples.map((ex: PendingExample) => (
              <li key={ex.id} className="rounded border p-4 shadow-sm bg-orange-50">
                <div className="mb-2 text-sm text-muted-foreground">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full mr-2 ${
                    ex.status === 'needs review' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {ex.status === 'needs review' ? 'Needs Review' : 'Pending Example'}
                  </span>
                  <strong>{ex.definition.phrase.textOriginal}</strong> —{" "}
                  {ex.definition.phrase.language.name}
                </div>
                <div className="mb-2 text-sm text-muted-foreground">
                  <strong>Definition:</strong> {ex.definition.body}
                </div>
                <p className="mb-2 italic">&ldquo;{ex.text}&rdquo;</p>
                {ex.translation && (
                  <p className="mb-2 text-sm text-muted-foreground">
                    <strong>Translation:</strong> {ex.translation}
                  </p>
                )}
                <div className="flex gap-2">
                  <form
                    action={async () => {
                      "use server";
                      await prisma.example.update({
                        where: { id: ex.id },
                        data: { status: "approved" },
                      });
                      revalidatePath("/admin");
                    }}
                  >
                    <button className="rounded bg-green-600 px-4 py-1 text-white hover:bg-green-700">
                      Approve
                    </button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await prisma.example.update({
                        where: { id: ex.id },
                        data: { status: "rejected" },
                      });
                      revalidatePath("/admin");
                    }}
                  >
                    <button className="rounded bg-red-600 px-4 py-1 text-white hover:bg-red-700">
                      Reject
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
