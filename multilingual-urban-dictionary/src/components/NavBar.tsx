"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import AuthButton from "@/components/AuthButton";

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
        <form action="/search" className="flex-1 max-w-md">
          <Input
            name="q"
            type="search"
            placeholder="Search a phrase…"
            defaultValue={q}                   // ② use the hook’s value here
            className="w-full"
          />
        </form>

        {/* Auth controls */}
        <AuthButton />
      </div>
    </header>
  );
}
