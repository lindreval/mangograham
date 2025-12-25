// API endpoint for polling new achievements (client-side polling)
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get unnotified achievements (recently unlocked)
    const unnotifiedAchievements = await prisma.userAchievement.findMany({
      where: {
        userId: session.user.id,
        isCompleted: true,
        notified: false,
        // Only get achievements unlocked in the last 30 seconds
        unlockedAt: {
          gte: new Date(Date.now() - 30000)
        }
      },
      include: {
        achievement: true
      },
      orderBy: {
        unlockedAt: 'desc'
      }
    });

    // Mark achievements as notified
    if (unnotifiedAchievements.length > 0) {
      await prisma.userAchievement.updateMany({
        where: {
          id: {
            in: unnotifiedAchievements.map(ua => ua.id)
          }
        },
        data: {
          notified: true
        }
      });
    }

    return NextResponse.json({ 
      achievements: unnotifiedAchievements.map(ua => ua.achievement)
    });

  } catch (error) {
    console.error("Achievement polling error:", error);
    return NextResponse.json(
      { error: "Failed to poll achievements" },
      { status: 500 }
    );
  }
}