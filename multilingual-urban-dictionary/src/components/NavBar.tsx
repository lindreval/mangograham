"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import AuthButton from "@/components/AuthButton";
import SubmitButton from "@/components/SubmitButton";

export default function NavBar() {
  // ① Read the current query string from Next’s client-side hook
  const params = useSearchParams();
  const q = params.get("q") ?? "";

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/60 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        {/* Site logo / brand */}
        <Link href="/" className="font-semibold">
          Yung Salita
        </Link>

        {/* Search box now pre-filled from the URL without touching window */}
        <form action="/search" className="mx-auto w-full max-w-xl px-4">
          <div className="relative flex items-center">
            <Input
              name="q"
              type="search"
              placeholder="Search a phrase…"
              defaultValue={q}                   // ② use the hook’s value here
              className="w-full pr-10"
            />
            <Button
              type="submit"
              size="sm"
              variant="ghost"
              className="absolute right-1 h-8 w-8 p-0 hover:bg-muted"
            >
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
          </div>
        </form>

        <div className="flex items-center gap-2 ml-auto">
            <SubmitButton />
            <AuthButton />
        </div>
      </div>
    </header>
  );
}
