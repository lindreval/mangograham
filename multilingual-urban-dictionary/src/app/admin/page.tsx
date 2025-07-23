import { authConfig } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InfiniteScrollPhrases } from "@/components/admin/InfiniteScrollPhrases";
import { InfiniteScrollDefinitions } from "@/components/admin/InfiniteScrollDefinitions";
import { InfiniteScrollExamples } from "@/components/admin/InfiniteScrollExamples";
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
    <main className="mx-auto max-w-6xl space-y-8 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Moderation Queue</h1>
        <div className="text-sm text-muted-foreground">
          Welcome, {session.user.name}
        </div>
      </div>

      <Tabs defaultValue="phrases" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="phrases" className="text-purple-600 data-[state=active]:text-purple-800">
            Phrases
          </TabsTrigger>
          <TabsTrigger value="definitions" className="text-blue-600 data-[state=active]:text-blue-800">
            Definitions
          </TabsTrigger>
          <TabsTrigger value="examples" className="text-orange-600 data-[state=active]:text-orange-800">
            Examples
          </TabsTrigger>
        </TabsList>

        <TabsContent value="phrases" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-purple-600">Phrases Awaiting Review</h2>
            <InfiniteScrollPhrases />
          </div>
        </TabsContent>

        <TabsContent value="definitions" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-blue-600">Definitions Awaiting Review</h2>
            <InfiniteScrollDefinitions />
          </div>
        </TabsContent>

        <TabsContent value="examples" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-orange-600">Examples Awaiting Review</h2>
            <InfiniteScrollExamples />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
