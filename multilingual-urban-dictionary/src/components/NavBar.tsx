"use client";

import Link from "next/link";
import Image from "next/image";
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
      <div className="mx-auto flex h-14 md:h-16 max-w-6xl items-center gap-2 md:gap-4 px-3 md:px-4">
        {/* Site logo / brand */}
        <Link href="/" className="flex items-center gap-1 md:gap-2 font-semibold hover:opacity-80 transition-opacity shrink-0">
          <Image
            src="/yungsalita.png"
            alt="Yung Salita"
            width={32}
            height={32}
            className="rounded w-6 h-6 md:w-8 md:h-8"
          />
          <span className="hidden sm:block">Yung Salita</span>
        </Link>

        {/* Search box now pre-filled from the URL without touching window */}
        <form action="/search" className="flex-1 mx-2 md:mx-auto md:w-full md:max-w-xl">
          <div className="relative flex items-center">
            <Input
              name="q"
              type="search"
              placeholder="Search"
              defaultValue={q}                   // ② use the hook’s value here
              className="w-full pr-10 h-8 md:h-10 text-sm md:text-base"
            />
            <Button
              type="submit"
              size="sm"
              variant="ghost"
              className="absolute right-1 h-6 w-6 md:h-8 md:w-8 p-0 hover:bg-muted"
            >
              <Search className="h-3 w-3 md:h-4 md:w-4" />
              <span className="sr-only">Search</span>
            </Button>
          </div>
        </form>

        <div className="flex items-center gap-1 md:gap-2 shrink-0">
            <SubmitButton />
            <AuthButton />
        </div>
      </div>
    </header>
  );
}
