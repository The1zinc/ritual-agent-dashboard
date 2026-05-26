'use client';

import { useParams } from 'next/navigation';
import { useAgents } from '@/lib/agents/store';
import { AgentStatus } from '@/lib/agents/types';
import AgentStatusBadge from '@/components/agents/AgentStatusBadge';
import AgentMetrics from '@/components/agents/AgentMetrics';
import AgentLogFeed from '@/components/agents/AgentLogFeed';
import { truncateAddress, stringToColor } from '@/lib/utils';
import Link from 'next/link';

export default function AgentDetailPage() {
  const params = useParams();
  const { getAgent, updateAgentStatus } = useAgents();
  const agent = getAgent(params.id as string);

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

  const handleAction = (action: string) => {
    switch (action) {
      case 'pause':
        updateAgentStatus(agent.id, AgentStatus.Paused);
        break;
      case 'resume':
        updateAgentStatus(agent.id, AgentStatus.Active);
        break;
      case 'checkpoint':
        updateAgentStatus(agent.id, AgentStatus.Checkpointing);
        setTimeout(() => updateAgentStatus(agent.id, AgentStatus.Active), 2000);
        break;
      case 'terminate':
        updateAgentStatus(agent.id, AgentStatus.Terminated);
        break;
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
