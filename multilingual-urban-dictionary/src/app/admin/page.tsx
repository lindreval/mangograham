import { authConfig } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InfiniteScrollPhrases } from "@/components/admin/InfiniteScrollPhrases";
import { InfiniteScrollDefinitions } from "@/components/admin/InfiniteScrollDefinitions";
import { InfiniteScrollExamples } from "@/components/admin/InfiniteScrollExamples";
import { PageHeader, PageBadge } from "@/components/ui/page-header";
import { ShieldCheck, MessageSquare, FileText, BookOpen } from "lucide-react";
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

export default async function AdminPage() {
  const session = (await getServerSession(authConfig)) as CustomSession | null;

  if (!session || session.user?.role !== "admin") {
    redirect("/");
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <PageHeader
        title="Moderation Queue"
        subtitle={`Welcome back, ${session.user.name}. Review and manage pending submissions.`}
        badge={
          <PageBadge variant="admin">
            <ShieldCheck className="mr-1.5 size-3.5" />
            Admin Panel
          </PageBadge>
        }
      />

      {/* Main Content Card */}
      <div className="rounded-xl border-2 border-primary/20 bg-card shadow-card overflow-hidden">
        {/* Gradient Accent Bar */}
        <div className="h-1 bg-gradient-to-r from-primary via-primary to-primary/60" />

        <div className="p-4 md:p-6">
          <Tabs defaultValue="phrases" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-muted/50 rounded-lg">
              <TabsTrigger
                value="phrases"
                className="flex items-center gap-2 py-2.5 px-3 text-sm font-medium rounded-md transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground"
              >
                <MessageSquare className="size-4" />
                <span className="hidden sm:inline">Phrases</span>
              </TabsTrigger>
              <TabsTrigger
                value="definitions"
                className="flex items-center gap-2 py-2.5 px-3 text-sm font-medium rounded-md transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground"
              >
                <FileText className="size-4" />
                <span className="hidden sm:inline">Definitions</span>
              </TabsTrigger>
              <TabsTrigger
                value="examples"
                className="flex items-center gap-2 py-2.5 px-3 text-sm font-medium rounded-md transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground"
              >
                <BookOpen className="size-4" />
                <span className="hidden sm:inline">Examples</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="phrases" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <MessageSquare className="size-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Phrases Awaiting Review
                  </h2>
                </div>
                <InfiniteScrollPhrases />
              </div>
            </TabsContent>

            <TabsContent value="definitions" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <FileText className="size-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Definitions Awaiting Review
                  </h2>
                </div>
                <InfiniteScrollDefinitions />
              </div>
            </TabsContent>

            <TabsContent value="examples" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <BookOpen className="size-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Examples Awaiting Review
                  </h2>
                </div>
                <InfiniteScrollExamples />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
