'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAgents } from '@/lib/agents/store';
import { AgentStatus } from '@/lib/agents/types';
import { useAccount, useWriteContract, useConfig } from 'wagmi';
import { waitForTransactionReceipt } from '@wagmi/core';
import { AGENT_DASHBOARD_ABI } from '@/lib/web3/precompiles';
import AgentStatusBadge from '@/components/agents/AgentStatusBadge';
import AgentMetrics from '@/components/agents/AgentMetrics';
import AgentLogFeed from '@/components/agents/AgentLogFeed';
import { truncateAddress, stringToColor } from '@/lib/utils';
import Link from 'next/link';

export default function AgentDetailPage() {
  const params = useParams();
  const { getAgent, updateAgentStatus, refresh } = useAgents();
  const agent = getAgent(params.id as string);

  // Poll for logs and metrics updates while actively viewing the dashboard
  useEffect(() => {
    if (!agent || agent.status === AgentStatus.Terminated) return;

    const interval = setInterval(() => {
      refresh();
    }, 10000); // check for new logs/metrics every 10 seconds

    return () => clearInterval(interval);
  }, [agent, refresh]);

  if (!agent) {
    return (
      <div className="glass-card-static">
        <div className="empty-state">
          <div className="empty-state-icon">⬡</div>
          <div className="empty-state-title">Agent not found</div>
          <div className="empty-state-text">
            This agent may have been terminated or the ID is invalid.
          </div>
          <Link href="/agents" className="btn btn-primary">
            Back to Agents
          </Link>
        </div>
      </div>
    );
  }

  const avatarBg = stringToColor(agent.soul.name);
  const initial = agent.soul.name.charAt(0).toUpperCase();

  const config = useConfig();
  const { isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const handleAction = async (action: string) => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      const contractAddress = (process.env.NEXT_PUBLIC_DASHBOARD_CONTRACT_ADDRESS ||
        '0xe54D597A8114f6e6Ea50D51bBFFC619A0A86c075') as `0x${string}`;
      const onChainId = agent.address as `0x${string}`;

      let functionName: 'pauseAgent' | 'resumeAgent' | 'checkpointAgent' | 'terminateAgent';
      let targetStatus = AgentStatus.Active;

      switch (action) {
        case 'pause':
          functionName = 'pauseAgent';
          targetStatus = AgentStatus.Paused;
          break;
        case 'resume':
          functionName = 'resumeAgent';
          targetStatus = AgentStatus.Active;
          break;
        case 'checkpoint':
          functionName = 'checkpointAgent';
          targetStatus = AgentStatus.Checkpointing;
          break;
        case 'terminate':
          functionName = 'terminateAgent';
          targetStatus = AgentStatus.Terminated;
          break;
        default:
          return;
      }

      // 1. Submit lifecycle update transaction to blockchain
      const txHash = await writeContractAsync({
        address: contractAddress,
        abi: AGENT_DASHBOARD_ABI,
        functionName,
        args: [onChainId],
      });

      // 2. Wait for transaction to be mined
      await waitForTransactionReceipt(config, { hash: txHash });

      // 3. Update agent status in Neon DB
      await updateAgentStatus(agent.id, targetStatus);
    } catch (err: any) {
      console.error(`Failed to execute action ${action}:`, err);
      alert(`Transaction failed: ${err.message || err}`);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="agent-detail-header">
        <div className="agent-detail-info">
          <div
            className="agent-detail-avatar"
            style={{
              background: `linear-gradient(135deg, ${avatarBg}, ${avatarBg}88)`,
            }}
          >
            {initial}
          </div>
          <div>
            <h1 className="agent-detail-name">{agent.soul.name}</h1>
            <div className="agent-detail-address">
              {truncateAddress(agent.address)} · Created{' '}
              {new Date(agent.createdAt).toLocaleDateString()}
            </div>
            <div className="agent-detail-meta">
              <AgentStatusBadge status={agent.status} />
              <span
                style={{
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                Model: {agent.soul.model}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="btn-group">
          {agent.status === AgentStatus.Active && (
            <>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleAction('checkpoint')}
              >
                📸 Checkpoint
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => handleAction('pause')}
              >
                ⏸ Pause
              </button>
            </>
          )}
          {agent.status === AgentStatus.Paused && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleAction('resume')}
            >
              ▶ Resume
            </button>
          )}
          {agent.status !== AgentStatus.Terminated && (
            <button
              className="btn btn-danger btn-sm"
              onClick={() => handleAction('terminate')}
            >
              ⏹ Terminate
            </button>
          )}
          <Link href="/agents" className="btn btn-ghost btn-sm">
            ← Back
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <AgentMetrics metrics={agent.metrics} />

      {/* Detail Grid */}
      <div className="detail-grid">
        {/* Soul */}
        <div className="glass-card-static">
          <div className="detail-section-title">
            <span>🧠</span> Soul
          </div>
          <div className="detail-field">
            <div className="detail-field-label">Purpose</div>
            <div className="detail-field-value">{agent.soul.purpose}</div>
          </div>
          <div className="detail-field">
            <div className="detail-field-label">Constraints</div>
            <div className="detail-field-value">{agent.soul.constraints}</div>
          </div>
        </div>

        {/* Memory & Storage */}
        <div className="glass-card-static">
          <div className="detail-section-title">
            <span>💾</span> Memory & Storage
          </div>
          <div className="detail-field">
            <div className="detail-field-label">Memory Type</div>
            <div className="detail-field-value" style={{ textTransform: 'capitalize' }}>
              {agent.memory.type}
            </div>
          </div>
          <div className="detail-field">
            <div className="detail-field-label">Max Tokens</div>
            <div className="detail-field-value">
              {agent.memory.maxTokens.toLocaleString()}
            </div>
          </div>
          <div className="detail-field">
            <div className="detail-field-label">Conversation History</div>
            <div className="detail-field-value">
              {agent.memory.conversationHistory ? 'Enabled' : 'Disabled'}
            </div>
          </div>
          <div className="detail-field">
            <div className="detail-field-label">Storage Provider</div>
            <div className="detail-field-value" style={{ textTransform: 'uppercase' }}>
              {agent.storage.provider}
            </div>
          </div>
          <div className="detail-field">
            <div className="detail-field-label">Auto-Checkpoint Interval</div>
            <div className="detail-field-value">
              {agent.storage.autoCheckpointInterval}s
            </div>
          </div>
          {agent.cid && (
            <div className="detail-field">
              <div className="detail-field-label">Latest CID</div>
              <div
                className="detail-field-value"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
              >
                {agent.cid}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logs */}
      <div className="section">
        <AgentLogFeed logs={agent.logs} title={`${agent.soul.name} — Live Logs`} />
      </div>
    </div>
  );
}
