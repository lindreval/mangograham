"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

interface PhraseDetailsFABProps {
  phraseTitle: string;
  languageId: number;
}

export default function PhraseDetailsFAB({
  phraseTitle,
  languageId,
}: PhraseDetailsFABProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const handleClick = () => {
    if (!session?.user?.id) {
      // Redirect to sign-in page if not authenticated
      router.push("/api/auth/signin");
      return;
    }

    // Navigate to submit page with pre-filled phrase and languageId
    router.push(
      `/submit?phrase=${encodeURIComponent(phraseTitle)}&languageId=${languageId}`
    );
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Add new definition"
      title="Add new definition"
      className="
        fixed bottom-6 right-6 lg:hidden z-50
        h-14 w-14
        rounded-full bg-primary text-primary-foreground
        shadow-lg hover:shadow-xl
        flex items-center justify-center
        transition-all duration-[var(--duration-hover)] ease-[var(--ease-smooth)]
        hover:scale-110 active:scale-95
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
      "
    >
      <Plus className="h-6 w-6" aria-hidden="true" />
    </button>
  );
}
