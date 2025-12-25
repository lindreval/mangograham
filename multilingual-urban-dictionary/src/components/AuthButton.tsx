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
import { User, HelpCircle, Info, MessageSquare, Menu, LogIn, LogOut } from "lucide-react";

function NavigationLinks() {
  return (
    <>
      <DropdownMenuItem asChild className="hover:bg-primary/5 rounded-lg transition-colors cursor-pointer">
        <Link href="/how-to-use" className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4" />
          How to use the site
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild className="hover:bg-primary/5 rounded-lg transition-colors cursor-pointer">
        <Link href="/about" className="flex items-center gap-2">
          <Info className="h-4 w-4" />
          About page
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild className="hover:bg-primary/5 rounded-lg transition-colors cursor-pointer">
        <Link href="/feedback" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Feedback/Feature requests
        </Link>
      </DropdownMenuItem>
    </>
  );
}

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Button variant="ghost" size="icon" className="opacity-0" disabled>
        <Menu className="h-5 w-5" />
      </Button>
    );
  }

  if (session) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="border-1 text-sm ring-2 ring-primary/20 ring-offset-2 hover:scale-105 transition-transform focus-visible:ring-primary focus-visible:ring-offset-background"
          >
            Hi {session.user?.name?.split(" ")[0] ?? "friend"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-48 rounded-xl border-2 border-primary/20 bg-card shadow-card-hover animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <DropdownMenuItem asChild className="hover:bg-primary/5 rounded-lg transition-colors cursor-pointer">
            <Link href="/profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <NavigationLinks />
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => signOut()}
            className="flex items-center gap-2 hover:bg-primary/5 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:scale-105 transition-transform focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 rounded-xl border-2 border-primary/20 bg-card shadow-card-hover animate-in fade-in slide-in-from-top-2 duration-200"
      >
        <NavigationLinks />
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signIn("google")}
          className="flex items-center gap-2 hover:bg-primary/5 rounded-lg transition-colors cursor-pointer"
        >
          <LogIn className="h-4 w-4" />
          Sign in
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}