'use client';

import Link from 'next/link';
import { Agent } from '@/lib/agents/types';
import AgentStatusBadge from './AgentStatusBadge';
import { formatDuration, formatBalance, timeAgo, stringToColor } from '@/lib/utils';

interface Props {
  agent: Agent;
}

export default function AgentCard({ agent }: Props) {
  const avatarBg = stringToColor(agent.soul.name);
  const initial = agent.soul.name.charAt(0).toUpperCase();

  return (
    <Link href={`/agents/${agent.id}`} className="agent-card">
      <div className="agent-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            className="agent-card-avatar"
            style={{ background: `linear-gradient(135deg, ${avatarBg}, ${avatarBg}88)` }}
          >
            {initial}
          </div>
          <div>
            <div className="agent-card-name">{agent.soul.name}</div>
            <AgentStatusBadge status={agent.status} />
          </div>
        </div>
      </div>

      <p className="agent-card-purpose">{agent.soul.purpose}</p>

      <div className="agent-card-stats">
        <div className="agent-card-stat">
          <span className="agent-card-stat-label">Uptime</span>
          <span className="agent-card-stat-value">
            {formatDuration(agent.metrics.uptime)}
          </span>
        </div>
        <div className="agent-card-stat">
          <span className="agent-card-stat-label">Actions</span>
          <span className="agent-card-stat-value">
            {agent.metrics.totalActions.toLocaleString()}
          </span>
        </div>
        <div className="agent-card-stat">
          <span className="agent-card-stat-label">Balance</span>
          <span className="agent-card-stat-value">
            {formatBalance(agent.metrics.balance)} Ⓡ
          </span>
        </div>
        <div className="agent-card-stat">
          <span className="agent-card-stat-label">Last Active</span>
          <span className="agent-card-stat-value">{timeAgo(agent.lastActiveAt)}</span>
        </div>
      </div>
    </Link>
  );
}
