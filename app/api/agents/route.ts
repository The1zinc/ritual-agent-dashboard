/* ──────────────────────────────────────────────
 *  API: /api/agents
 *  GET  — list all agents
 *  POST — create a new agent
 * ────────────────────────────────────────────── */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/agents?owner=0x...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner');

    const agents = await prisma.agent.findMany({
      where: owner ? { owner } : undefined,
      include: {
        logs: {
          orderBy: { timestamp: 'desc' },
          take: 100,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform DB rows into the frontend Agent shape
    const transformed = agents.map(dbAgentToFrontend);
    return NextResponse.json(transformed);
  } catch (error) {
    console.error('[GET /api/agents]', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

// POST /api/agents
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { soul, memory, storage } = body;

    // Generate a random Ethereum-style address
    const address = `0x${Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('')}`;

    const agent = await prisma.agent.create({
      data: {
        address,
        owner: body.owner || '0x0000000000000000000000000000000000000000',
        status: 'spawning',
        soulName: soul.name,
        soulPurpose: soul.purpose,
        soulConstraints: soul.constraints || '',
        soulModel: soul.model || 'ritual-llm-v1',
        memoryType: memory.type || 'persistent',
        memoryInitialKnowledge: memory.initialKnowledge || '',
        memoryConvoHistory: memory.conversationHistory ?? true,
        memoryMaxTokens: memory.maxTokens || 4096,
        storageProvider: storage.provider || 'ipfs',
        storageCheckpointInterval: storage.autoCheckpointInterval || 300,
        storageRestoreFromCid: storage.restoreFromCid || '',
        logs: {
          create: {
            level: 'system',
            message: `Agent "${soul.name}" spawning — submitting to 0x0820 precompile...`,
          },
        },
      },
      include: { logs: true },
    });

    // Simulate spawn: after 3 seconds, update to active
    // (In production, this would be triggered by on-chain callback)
    setTimeout(async () => {
      try {
        await prisma.agent.update({
          where: { id: agent.id },
          data: {
            status: 'active',
            lastActiveAt: new Date(),
            logs: {
              create: {
                level: 'system',
                message: 'Agent spawn confirmed — now active on Ritual Chain',
              },
            },
          },
        });
      } catch {
        // Agent might have been deleted in the meantime
      }
    }, 3000);

    return NextResponse.json(dbAgentToFrontend(agent), { status: 201 });
  } catch (error) {
    console.error('[POST /api/agents]', error);
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
}

/* ── Helper: Transform DB row → frontend Agent shape ── */
interface DbAgent {
  id: string;
  address: string;
  owner: string;
  status: string;
  soulName: string;
  soulPurpose: string;
  soulConstraints: string;
  soulModel: string;
  memoryType: string;
  memoryInitialKnowledge: string;
  memoryConvoHistory: boolean;
  memoryMaxTokens: number;
  storageProvider: string;
  storageCheckpointInterval: number;
  storageRestoreFromCid: string;
  cid: string;
  uptimeSeconds: number;
  totalActions: number;
  memorySize: number;
  lastCheckpoint: Date | null;
  balance: string;
  createdAt: Date;
  lastActiveAt: Date;
  logs: { id: string; level: string; message: string; timestamp: Date }[];
}

export function dbAgentToFrontend(a: DbAgent) {
  return {
    id: a.id,
    address: a.address,
    owner: a.owner,
    status: a.status,
    soul: {
      name: a.soulName,
      purpose: a.soulPurpose,
      constraints: a.soulConstraints,
      model: a.soulModel,
    },
    memory: {
      type: a.memoryType,
      initialKnowledge: a.memoryInitialKnowledge,
      conversationHistory: a.memoryConvoHistory,
      maxTokens: a.memoryMaxTokens,
    },
    storage: {
      provider: a.storageProvider,
      autoCheckpointInterval: a.storageCheckpointInterval,
      restoreFromCid: a.storageRestoreFromCid,
    },
    metrics: {
      uptime: a.uptimeSeconds,
      totalActions: a.totalActions,
      memorySize: a.memorySize,
      lastCheckpoint: a.lastCheckpoint ? a.lastCheckpoint.getTime() : 0,
      balance: a.balance,
    },
    logs: a.logs
      .map((l) => ({
        id: l.id,
        timestamp: l.timestamp.getTime(),
        level: l.level,
        message: l.message,
      }))
      .sort((x, y) => x.timestamp - y.timestamp),
    cid: a.cid,
    createdAt: a.createdAt.getTime(),
    lastActiveAt: a.lastActiveAt.getTime(),
  };
}
