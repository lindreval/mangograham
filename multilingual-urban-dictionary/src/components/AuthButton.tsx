"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") return null; // avoids flicker

  return session ? (
    <div className="flex items-center gap-2">
      <Link href="/profile" className="text-sm hover:underline">
        Hi {session.user?.name?.split(" ")[0] ?? "friend"}
      </Link>
      <Button size="sm" variant="outline" onClick={() => signOut()}>
        Sign out
      </Button>
    </div>
  ) : (
    <Button size="sm" onClick={() => signIn("google")}>
      Sign in
    </Button>
  );
}