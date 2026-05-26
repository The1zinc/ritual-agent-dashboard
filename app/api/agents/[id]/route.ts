/* ──────────────────────────────────────────────
 *  API: /api/agents/[id]
 *  GET    — fetch single agent with logs
 *  PATCH  — update agent status
 *  DELETE — delete agent
 * ────────────────────────────────────────────── */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { dbAgentToFrontend } from '../route';

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/agents/:id
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const agent = await prisma.agent.findUnique({
      where: { id },
      include: {
        logs: {
          orderBy: { timestamp: 'desc' },
          take: 100,
        },
      },
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json(dbAgentToFrontend(agent));
  } catch (error) {
    console.error('[GET /api/agents/:id]', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent' },
      { status: 500 }
    );
  }
}

// PATCH /api/agents/:id
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status } = body;

    const logMessages: Record<string, string> = {
      paused: 'Agent paused by owner',
      active: 'Agent resumed — returning to active state',
      terminated: 'Agent terminated — final checkpoint saved',
      checkpointing: 'Manual checkpoint initiated...',
    };

    const agent = await prisma.agent.update({
      where: { id },
      data: {
        status,
        lastActiveAt: new Date(),
        // If checkpointing, revert to active after a simulated delay
        ...(status === 'checkpointing'
          ? {}
          : {}),
        logs: {
          create: {
            level: 'system',
            message: logMessages[status] || `Status changed to ${status}`,
          },
        },
      },
      include: {
        logs: {
          orderBy: { timestamp: 'desc' },
          take: 100,
        },
      },
    });

    // Simulate checkpoint completion
    if (status === 'checkpointing') {
      setTimeout(async () => {
        try {
          await prisma.agent.update({
            where: { id },
            data: {
              status: 'active',
              lastActiveAt: new Date(),
              lastCheckpoint: new Date(),
              logs: {
                create: {
                  level: 'system',
                  message: 'Checkpoint complete — state saved to IPFS',
                },
              },
            },
          });
        } catch {
          // Agent may have been deleted
        }
      }, 2000);
    }

    return NextResponse.json(dbAgentToFrontend(agent));
  } catch (error) {
    console.error('[PATCH /api/agents/:id]', error);
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    );
  }
}

// DELETE /api/agents/:id
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await prisma.agent.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/agents/:id]', error);
    return NextResponse.json(
      { error: 'Failed to delete agent' },
      { status: 500 }
    );
  }
}
