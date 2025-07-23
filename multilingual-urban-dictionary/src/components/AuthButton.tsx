"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, HelpCircle, Info, MessageSquare } from "lucide-react";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") return null; // avoids flicker

  return session ? (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="border-1 text-sm hover:underline">
            Hi {session.user?.name?.split(" ")[0] ?? "friend"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link href="/profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/how-to-use" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              How to use the site
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/about" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              About page
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/feedback" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Feedback/Feature requests
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()}>
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ) : (
    <Button size="sm" onClick={() => signIn("google")}>
      Sign in
    </Button>
  );
}