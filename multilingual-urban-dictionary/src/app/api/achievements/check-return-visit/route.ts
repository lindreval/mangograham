import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { AchievementService } from "@/lib/achievements";

export async function POST() {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check for return visit achievements
    const achievements = await AchievementService.checkAndAwardAchievements(
      session.user.id, 
      'RETURN_VISIT'
    );

    return NextResponse.json({ achievements });

  } catch (error) {
    console.error("Return visit check error:", error);
    return NextResponse.json(
      { error: "Failed to check return visit achievements" },
      { status: 500 }
    );
  }
}