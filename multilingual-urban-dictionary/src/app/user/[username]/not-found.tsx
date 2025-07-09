import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-4xl p-4 md:p-6">
      <Card className="border-4 shadow-elevation-medium">
        <CardContent className="pt-6 text-center">
          <h1 className="text-4xl font-bold mb-4">User Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The user you&apos;re looking for doesn&apos;t exist or hasn&apos;t set up their profile yet.
          </p>
          <Link 
            href="/" 
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go Home
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}