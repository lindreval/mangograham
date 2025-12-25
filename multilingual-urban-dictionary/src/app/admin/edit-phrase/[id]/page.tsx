import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import EditPhraseForm from "@/components/EditPhraseForm";
import { PageHeader, PageBadge } from "@/components/ui/page-header";
import { Edit, ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
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
      definitions: {
        include: {
          examples: true,
        },
        orderBy: {
          createdAt: "asc",
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

  return (
    <main className="mx-auto max-w-4xl p-4 md:p-6 space-y-6">
      {/* Back Navigation */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Moderation Queue
      </Link>

      <PageHeader
        title="Edit Phrase"
        subtitle={`Editing "${phrase.textOriginal}" in ${phrase.language.name}`}
        badge={
          <PageBadge variant="admin">
            <Edit className="mr-1.5 size-3.5" />
            Edit Mode
          </PageBadge>
        }
      />

      {/* Main Content Card */}
      <div className="rounded-xl border-2 border-primary/20 bg-card shadow-card overflow-hidden">
        {/* Gradient Accent Bar */}
        <div className="h-1 bg-gradient-to-r from-primary via-primary to-primary/60" />

        <div className="p-4 md:p-6">
          {/* Admin Notice */}
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-destructive/5 border border-destructive/20 px-4 py-3">
            <ShieldCheck className="size-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive font-medium">
              Admin Only: Changes will be applied immediately.
            </p>
          </div>

          <EditPhraseForm phrase={phrase} languages={languages} />
        </div>
      </div>
    </main>
  );
}
