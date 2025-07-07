import { authConfig } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Definition } from "@prisma/client";
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

  const pendingDefs = await prisma.definition.findMany({
    where: { status: "pending" },
    include: {
      phrase: {
        include: {
          language: true,
        },
      },
      examples: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Moderation Queue</h1>

      {pendingDefs.length === 0 ? (
        <p>No pending definitions 🎉</p>
      ) : (
        <ul className="space-y-4">
          {pendingDefs.map((def: PendingDefinition) => (
            <li key={def.id} className="rounded border p-4 shadow-sm">
              <div className="mb-2 text-sm text-muted-foreground">
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
              <form
                action={async () => {
                  "use server";
                  await prisma.definition.update({
                    where: { id: def.id },
                    data: { status: "approved" },
                  });
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
                }}
              >
                <button className="rounded bg-red-600 px-4 py-1 text-white hover:bg-red-700">
                  Reject
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
