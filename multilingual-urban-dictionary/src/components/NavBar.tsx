"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import AuthButton from "@/components/AuthButton";
import SubmitButton from "@/components/SubmitButton";
import SearchPreview from "@/components/SearchPreview";

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
            priority
            className="rounded w-6 h-6 md:w-8 md:h-8"
          />
          <span className="hidden sm:block">Yung Salita</span>
        </Link>

        {/* Search box with live preview */}
        <SearchPreview defaultValue={q} />

        <div className="flex items-center gap-1 md:gap-2 shrink-0">
            <SubmitButton />
            <AuthButton />
        </div>
      </div>
    </header>
  );
}
