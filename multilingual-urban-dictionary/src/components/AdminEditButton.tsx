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
      className="bg-primary hover:bg-orange-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
      onClick={handleEditClick}
    >
      Edit
    </button>
  );
}