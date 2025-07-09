import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import SubmitForm from "./SubmitForm";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit",
  description: "Submit new phrases, definitions, and examples to the dictionary",
};

// ✅ Add this
interface CustomSession extends Session {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id: string;
    role: string;
  };
}

export default async function SubmitPage() {
  // ✅ Cast session properly
  const session = (await getServerSession(authConfig)) as CustomSession | null;

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const langs = await prisma.language.findMany({ orderBy: { name: "asc" } });

  return (
    <main className="mx-auto max-w-xl space-y-6 p-6">
      <Suspense fallback={<div>Loading...</div>}>
        <SubmitForm languages={langs} />
      </Suspense>
    </main>
  );
}