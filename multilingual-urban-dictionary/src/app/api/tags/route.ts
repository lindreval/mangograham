import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/tags - Get all tags
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: {
        author: {
          select: { name: true, username: true }
        },
        _count: {
          select: { phrases: true }
        }
      }
    });

    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

// POST /api/tags - Create a new tag
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, color } = await request.json();
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Tag name is required' }, { status: 400 });
    }

    // Normalize tag name (lowercase, trim whitespace)
    const normalizedName = name.trim().toLowerCase();

    // Check if tag already exists (case-insensitive)
    const existingTag = await prisma.tag.findFirst({
      where: {
        name: {
          equals: normalizedName,
          mode: 'insensitive'
        }
      }
    });

    if (existingTag) {
      return NextResponse.json({ error: 'Tag already exists' }, { status: 400 });
    }

    const tag = await prisma.tag.create({
      data: {
        name: normalizedName,
        color: color || '#3B82F6',
        authorId: session.user.id
      },
      include: {
        author: {
          select: { name: true, username: true }
        },
        _count: {
          select: { phrases: true }
        }
      }
    });

    return NextResponse.json({ tag }, { status: 201 });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}