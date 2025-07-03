"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") return null; // avoids flicker

  return session ? (
    <div className="flex items-center gap-2">
      <span className="text-sm">
        Hi {session.user?.name?.split(" ")[0] ?? "friend"}
      </span>
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