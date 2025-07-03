"use client";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import AuthButton from "@/components/AuthButton";

export default function NavBar() {
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/60 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        {/* Site logo / brand */}
        <Link href="/" className="font-semibold">
          Yung Salita
        </Link>

        {/* Search box (non-functional placeholder for now) */}
        <form action="/search" className="flex-1">
          <Input
            name="q"
            type="search"
            placeholder="Search a phrase…"
            className="w-full"
          />
        </form>

        {/* Auth controls */}
        <AuthButton />
      </div>
    </header>
  );
}
