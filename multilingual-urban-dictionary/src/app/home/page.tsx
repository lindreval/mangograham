import BrowsePage from "@/components/browse/BrowsePage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "Discover the latest slang and phrases from languages around the world",
};

export default function Home() {
  return <BrowsePage />;
}
