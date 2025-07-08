"use server";

import { updateUserReputation } from "@/lib/reputation";

export async function updateReputationAction(userId: string) {
  try {
    const newReputation = await updateUserReputation(userId);
    return { success: true, reputation: newReputation };
  } catch (error) {
    console.error("Error updating reputation:", error);
    return { success: false, error: "Failed to update reputation" };
  }
}