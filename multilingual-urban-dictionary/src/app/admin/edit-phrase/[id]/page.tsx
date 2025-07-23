import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import EditPhraseForm from "@/components/EditPhraseForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Phrase - Admin",
  description: "Edit phrase details (admin only)",
};

export default async function EditPhrasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // Check if user is admin
  const session = await getServerSession(authConfig);
  if (!session || session.user?.role !== "admin") {
    redirect("/");
  }

  // Get phrase data
  const phrase = await prisma.phrase.findUnique({
    where: { id: parseInt(id) },
    include: {
      language: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!phrase) {
    return notFound();
  }

  // Get all languages for the form
  const languages = await prisma.language.findMany({
    orderBy: { name: "asc" },
  });

  // Get all tags for the form
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <main className="mx-auto max-w-4xl p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Edit Phrase</h1>
        <div className="text-sm text-muted-foreground">
          Admin Only
        </div>
      </div>
      
      <EditPhraseForm 
        phrase={phrase}
        languages={languages}
        tags={tags}
      />
    </main>
  );
}