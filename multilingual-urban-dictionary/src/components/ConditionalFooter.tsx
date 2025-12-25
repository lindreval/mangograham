"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export function ConditionalFooter() {
  const pathname = usePathname();

  // Hide Footer only on landing page (/)
  const isLandingPage = pathname === "/";

  if (isLandingPage) {
    return null;
  }

  return <Footer />;
}
