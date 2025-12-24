"use client";

import { usePathname } from "next/navigation";
import NavBar from "./NavBar";

export function ConditionalNavBar() {
  const pathname = usePathname();

  // Hide NavBar only on landing page (/)
  const isLandingPage = pathname === "/";

  if (isLandingPage) {
    return null;
  }

  return <NavBar />;
}
