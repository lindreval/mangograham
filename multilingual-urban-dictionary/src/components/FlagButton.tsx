"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Flag } from "lucide-react";
import { useRouter } from "next/navigation";

interface FlagButtonProps {
  definitionId?: number;
  exampleId?: number;
  onFlagged?: () => void;
}

export default function FlagButton({ definitionId, exampleId, onFlagged }: FlagButtonProps) {
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
        body: JSON.stringify({ definitionId, exampleId }),
      });

      if (response.ok) {
        setIsFlagged(true);
        onFlagged?.();
        // Refresh the page to show updated status
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to flag definition');
      }
    } catch (error) {
      console.error('Error flagging definition:', error);
      alert('An error occurred while flagging the definition');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      title="Report this definition"
      disabled={isLoading || isFlagged}
      className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors ${
        isFlagged 
          ? 'text-orange-600 bg-orange-50' 
          : 'text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={handleFlag}
    >
      <Flag className="h-3 w-3" />
      {isFlagged ? 'Reported' : isLoading ? 'Reporting...' : 'Report'}
    </button>
  );
}