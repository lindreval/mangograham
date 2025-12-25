"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Flag } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

interface FlagButtonProps {
  definitionId?: number;
  exampleId?: number;
  phraseId?: number;
  onFlagged?: () => void;
}

export default function FlagButton({ definitionId, exampleId, phraseId, onFlagged }: FlagButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFlagged, setIsFlagged] = useState(false);

  const handleFlag = async () => {
    if (!session?.user?.id) {
      // Redirect to sign-in page if not authenticated
      router.push('/api/auth/signin');
      return;
    }

    if (isLoading || isFlagged) return;

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/flag-definition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ definitionId, exampleId, phraseId }),
      });

      if (response.ok) {
        setIsFlagged(true);
        onFlagged?.();
        toast({
          title: "Content reported",
          description: "Thank you for helping keep the community safe.",
          variant: "success",
        });
        // Refresh the page to show updated status
        router.refresh();
      } else {
        const error = await response.json();
        toast({
          title: "Report failed",
          description: error.error || 'Failed to flag content',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error flagging content:', error);
      toast({
        title: "Report failed",
        description: "An error occurred while flagging the content",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    if (phraseId) return "Report this phrase";
    if (definitionId) return "Report this definition";
    if (exampleId) return "Report this example";
    return "Report this content";
  };

  return (
    <button
      type="button"
      title={getTitle()}
      disabled={isLoading || isFlagged}
      className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition-all duration-200 hover:scale-105 active:scale-95 ${
        isFlagged
          ? 'bg-destructive/15 text-destructive'
          : 'text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={handleFlag}
    >
      <Flag className="h-3 w-3" />
      {isFlagged ? 'Reported' : isLoading ? 'Reporting...' : 'Report'}
    </button>
  );
}