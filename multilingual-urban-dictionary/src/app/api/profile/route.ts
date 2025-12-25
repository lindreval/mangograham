import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AchievementService } from "@/lib/achievements";
import { profileUpdateSchema, validateRequestBody, sanitizeText } from "@/lib/validations";

// TODO: Add rate limiting (Upstash Redis) - limit to 10 updates/day per user

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate request body with Zod
    const validation = await validateRequestBody(request, profileUpdateSchema);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { name, username, bio, location, languagesSpoken } = validation.data;

    // Validate username uniqueness if it's being changed
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: username,
          NOT: {
            id: session.user.id
          }
        }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Username is already taken" },
          { status: 400 }
        );
      }
    }

    // Update user profile with XSS sanitization
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name ? sanitizeText(name) : null,
        username: username || null, // Username already validated by regex
        bio: bio ? sanitizeText(bio) : null,
        location: location ? sanitizeText(location) : null,
        languagesSpoken: languagesSpoken || [],
      },
    });

    // Check for profile completion achievement
    const achievements = await AchievementService.checkAndAwardAchievements(session.user.id, 'PROFILE_UPDATED');

    return NextResponse.json({ 
      message: "Profile updated successfully",
      user: updatedUser,
      achievements 
    });

  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Delete user and all related data (cascade deletes will handle most of this)
    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({ 
      message: "Account deleted successfully" 
    });

  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}