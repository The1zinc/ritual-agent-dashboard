/* ──────────────────────────────────────────────
 *  API: /api/agents/[id]/logs
 *  POST — add a new log entry for an agent
 * ────────────────────────────────────────────── */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { level, message } = body;

    if (!level || !message) {
      return NextResponse.json(
        { error: 'Missing level or message' },
        { status: 400 }
      );
    }

    // Verify agent exists
    const agent = await prisma.agent.findUnique({
      where: { id },
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    const log = await prisma.agentLog.create({
      data: {
        agentId: id,
        level,
        message,
      },
    });

    return NextResponse.json({
      success: true,
      id: log.id,
      timestamp: log.timestamp.getTime(),
    });
  } catch (error) {
    console.error('[POST /api/agents/:id/logs]', error);
    return NextResponse.json(
      { error: 'Failed to add log' },
      { status: 500 }
    );
  }
}
