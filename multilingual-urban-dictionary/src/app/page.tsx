import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LandingPage from "@/components/landing/LandingPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yung Salita - The Global Urban Dictionary",
  description: "Discover and contribute to the world's largest multilingual urban dictionary. Learn slang, phrases, and expressions from languages around the globe.",
};

export default async function HomePage() {
  const session = await auth();

  // Authenticated users are redirected to /home
  if (session) {
    redirect("/home");
  }

  // Unauthenticated users see the landing page
  return <LandingPage />;
}
