import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, username, bio, location, languagesSpoken } = body;

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

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || null,
        username: username || null,
        bio: bio || null,
        location: location || null,
        languagesSpoken: languagesSpoken || [],
      },
    });

    return NextResponse.json({ 
      message: "Profile updated successfully",
      user: updatedUser 
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