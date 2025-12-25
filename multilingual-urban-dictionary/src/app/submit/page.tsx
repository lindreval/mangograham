import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import SubmitForm from "./SubmitForm";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { PageHeader, PageBadge } from "@/components/ui/page-header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit",
  description: "Submit new phrases, definitions, and examples to the dictionary",
};

interface CustomSession extends Session {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id: string;
    role: string;
  };
}

function SubmitFormSkeleton() {
  return (
    <div className="rounded-xl border-2 border-primary/20 bg-card shadow-card overflow-hidden animate-pulse">
      <div className="h-1 bg-gradient-to-r from-primary via-primary to-primary/60" />
      <div className="p-6 md:p-8">
        <div className="space-y-6">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="space-y-4">
            <div className="h-12 bg-muted rounded" />
            <div className="h-12 bg-muted rounded" />
            <div className="h-24 bg-muted rounded" />
            <div className="h-16 bg-muted rounded" />
          </div>
          <div className="h-12 bg-primary/20 rounded-full w-32" />
        </div>
      </div>
    </div>
  );
}

export default async function SubmitPage() {
  const session = (await getServerSession(authConfig)) as CustomSession | null;

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const langs = await prisma.language.findMany({ orderBy: { name: "asc" } });

  return (
    <main className="relative mx-auto max-w-xl p-4 md:p-6 space-y-6 animate-page-enter">
      {/* Subtle background accent */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/2 w-[400px] h-[400px] bg-primary/[0.02] rounded-full blur-3xl -translate-x-1/2" />
      </div>

      <PageHeader
        title="Contribute"
        subtitle="Share your knowledge with the community"
        badge={
          <PageBadge>
            <Plus className="w-3 h-3 mr-1.5" />
            New Submission
          </PageBadge>
        }
      />

      <Suspense
        fallback={
          <SubmitFormSkeleton />
        }
      >
        <SubmitForm languages={langs} />
      </Suspense>
    </main>
  );
}
