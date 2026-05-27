import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createPublicClient, http } from 'viem';
import { ritualTestnet } from '@/lib/web3/chains';
import { AGENT_DASHBOARD_ABI } from '@/lib/web3/precompiles';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const contractAddress = (process.env.NEXT_PUBLIC_DASHBOARD_CONTRACT_ADDRESS ||
      '0xe54D597A8114f6e6Ea50D51bBFFC619A0A86c075') as `0x${string}`;

    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.ritualfoundation.org';
    const publicClient = createPublicClient({
      chain: ritualTestnet,
      transport: http(rpcUrl),
    });

    const currentBlock = await publicClient.getBlockNumber();
    // Query last 100 blocks (approx 3-5 minutes of history)
    const fromBlock = currentBlock > 100n ? currentBlock - 100n : 0n;

    // Fetch contract logs for our deployed dashboard
    const logs = await publicClient.getContractEvents({
      address: contractAddress,
      abi: AGENT_DASHBOARD_ABI,
      fromBlock,
      toBlock: currentBlock,
    });

    let syncCount = 0;

    for (const log of logs) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { eventName, args } = log as any;
      if (!args || !args.agentId) continue;

      const agentId = args.agentId as string;

      // Find if this agent is recorded in our database
      const dbAgent = await prisma.agent.findUnique({
        where: { address: agentId },
      });

      if (!dbAgent) {
        // If spawned directly on-chain outside the dashboard, dynamically register it
        if (eventName === 'AgentSpawned') {
          await prisma.agent.create({
            data: {
              address: agentId,
              owner: args.owner || '0x0000000000000000000000000000000000000000',
              status: 'active',
              soulName: args.soul || 'Discovered Agent',
              soulPurpose: 'Spawned directly on-chain',
              soulConstraints: '',
              soulModel: 'ritual-llm-v1',
              memoryType: 'persistent',
              memoryInitialKnowledge: '',
              memoryConvoHistory: true,
              memoryMaxTokens: 4096,
              storageProvider: 'ipfs',
              storageCheckpointInterval: 300,
              storageRestoreFromCid: '',
              logs: {
                create: {
                  level: 'system',
                  message: `Agent spawned on-chain at block ${log.blockNumber}`,
                },
              },
            },
          });
          syncCount++;
        }
        continue;
      }

      // Update state or insert logs based on contract events
      switch (eventName) {
        case 'AgentSpawned':
          if (dbAgent.status === 'spawning') {
            await prisma.agent.update({
              where: { id: dbAgent.id },
              data: {
                status: 'active',
                logs: {
                  create: {
                    level: 'system',
                    message: `Spawn confirmed on-chain at block ${log.blockNumber}`,
                  },
                },
              },
            });
            syncCount++;
          }
          break;

        case 'AgentPaused':
          if (dbAgent.status !== 'paused') {
            await prisma.agent.update({
              where: { id: dbAgent.id },
              data: {
                status: 'paused',
                logs: {
                  create: {
                    level: 'system',
                    message: 'On-chain event: Agent paused by owner',
                  },
                },
              },
            });
            syncCount++;
          }
          break;

        case 'AgentResumed':
          if (dbAgent.status !== 'active') {
            await prisma.agent.update({
              where: { id: dbAgent.id },
              data: {
                status: 'active',
                logs: {
                  create: {
                    level: 'system',
                    message: 'On-chain event: Agent resumed',
                  },
                },
              },
            });
            syncCount++;
          }
          break;

        case 'AgentCheckpointed':
          const newCid = args.cid || '';
          if (dbAgent.status === 'checkpointing' || dbAgent.cid !== newCid) {
            await prisma.agent.update({
              where: { id: dbAgent.id },
              data: {
                status: 'active',
                cid: newCid,
                lastCheckpoint: new Date(),
                logs: {
                  create: {
                    level: 'system',
                    message: `On-chain event: Checkpoint complete. Saved to IPFS with CID: ${newCid}`,
                  },
                },
              },
            });
            syncCount++;
          }
          break;

        case 'AgentRevived':
          const revivedCid = args.cid || '';
          await prisma.agent.update({
            where: { id: dbAgent.id },
            data: {
              status: 'active',
              cid: revivedCid,
              logs: {
                create: {
                  level: 'system',
                  message: `On-chain event: Agent revived from CID: ${revivedCid}`,
                },
              },
            },
          });
          syncCount++;
          break;

        case 'AgentTerminated':
          if (dbAgent.status !== 'terminated') {
            await prisma.agent.update({
              where: { id: dbAgent.id },
              data: {
                status: 'terminated',
                logs: {
                  create: {
                    level: 'system',
                    message: 'On-chain event: Agent terminated',
                  },
                },
              },
            });
            syncCount++;
          }
          break;

        case 'AgentResult':
          const rawResult = args.result;
          let message = 'On-chain result produced';
          try {
            // Attempt to decode raw hex result to human-readable text
            if (rawResult.startsWith('0x')) {
              const hex = rawResult.slice(2);
              let str = '';
              for (let i = 0; i < hex.length; i += 2) {
                const charCode = parseInt(hex.substring(i, i + 2), 16);
                if (charCode > 0) str += String.fromCharCode(charCode);
              }
              message = str;
            }
          } catch {
            message = `Raw bytes result: ${rawResult}`;
          }

          // Prevent inserting duplicate result logs in quick succession
          const duplicate = await prisma.agentLog.findFirst({
            where: {
              agentId: dbAgent.id,
              level: 'action',
              message,
              timestamp: {
                gte: new Date(Date.now() - 60 * 1000), // last 60 seconds
              },
            },
          });

          if (!duplicate) {
            await prisma.agent.update({
              where: { id: dbAgent.id },
              data: {
                totalActions: { increment: 1 },
                lastActiveAt: new Date(),
                logs: {
                  create: {
                    level: 'action',
                    message,
                  },
                },
              },
            });
            syncCount++;
          }
          break;
      }
    }

    return NextResponse.json({
      success: true,
      processedEvents: logs.length,
      databaseUpdates: syncCount,
    });
  } catch (error: unknown) {
    console.error('[GET /api/sync]', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to sync chain events', details: errorMsg },
      { status: 500 }
    );
  }
}
