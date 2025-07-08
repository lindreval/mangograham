import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { definitionId, exampleId } = await request.json();
    
    if (!definitionId && !exampleId) {
      return NextResponse.json({ error: 'Definition ID or Example ID is required' }, { status: 400 });
    }

    if (definitionId && exampleId) {
      return NextResponse.json({ error: 'Cannot flag both definition and example at once' }, { status: 400 });
    }

    if (definitionId) {
      // Handle definition flagging
      const definition = await prisma.definition.findUnique({
        where: { id: definitionId },
        select: { id: true, status: true }
      });

      if (!definition) {
        return NextResponse.json({ error: 'Definition not found' }, { status: 404 });
      }

      if (definition.status !== 'approved') {
        return NextResponse.json({ error: 'Definition is not approved' }, { status: 400 });
      }

      await prisma.definition.update({
        where: { id: definitionId },
        data: { status: 'pending' }
      });

      return NextResponse.json({ success: true, message: 'Definition flagged successfully' });
    }

    if (exampleId) {
      // Handle example flagging
      const example = await prisma.example.findUnique({
        where: { id: exampleId },
        select: { id: true, status: true }
      });

      if (!example) {
        return NextResponse.json({ error: 'Example not found' }, { status: 404 });
      }

      if (example.status !== 'approved') {
        return NextResponse.json({ error: 'Example is not approved' }, { status: 400 });
      }

      await prisma.example.update({
        where: { id: exampleId },
        data: { status: 'pending' }
      });

      return NextResponse.json({ success: true, message: 'Example flagged successfully' });
    }
  } catch (error) {
    console.error('Error flagging content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}