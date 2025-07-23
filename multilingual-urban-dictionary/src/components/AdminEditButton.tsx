"use client";

// import { useState } from "react";
import { useRouter } from "next/navigation";

interface AdminEditButtonProps {
  phraseId: number;
}

export default function AdminEditButton({ phraseId }: AdminEditButtonProps) {
  // const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const handleEditClick = () => {
    // For now, redirect to an admin edit page
    // Later we can replace this with a modal
    router.push(`/admin/edit-phrase/${phraseId}`);
  };

  return (
    <button
      className="w-full md:w-auto md:flex-shrink-0 rounded bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 font-bold text-center transition-colors"
      onClick={handleEditClick}
    >
      Edit
    </button>
  );
}