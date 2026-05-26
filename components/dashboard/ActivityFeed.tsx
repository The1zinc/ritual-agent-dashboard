'use client';

import { Agent, LogLevel } from '@/lib/agents/types';
import { timeAgo } from '@/lib/utils';

interface Props {
  agents: Agent[];
}

export default function ActivityFeed({ agents }: Props) {
  // Collect all recent logs from all agents, sort by timestamp
  const allLogs = agents
    .flatMap((agent) =>
      agent.logs.map((log) => ({
        ...log,
        agentName: agent.soul.name,
        agentStatus: agent.status,
      }))
    )
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10);

  const dotColorMap: Record<LogLevel, string> = {
    [LogLevel.Info]: 'var(--accent-tertiary)',
    [LogLevel.Warn]: 'var(--accent-warm)',
    [LogLevel.Error]: 'var(--accent-danger)',
    [LogLevel.Action]: 'var(--accent-secondary)',
    [LogLevel.System]: 'var(--accent-primary)',
  };

  return (
    <div className="glass-card-static">
      <div className="section-title">
        <span>⚡</span> Recent Activity
      </div>
      <div className="activity-feed">
        {allLogs.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No activity yet
          </div>
        ) : (
          allLogs.map((log) => (
            <div key={log.id} className="activity-item">
              <div
                className="activity-dot"
                style={{ background: dotColorMap[log.level] }}
              />
              <div className="activity-text">
                <strong>{log.agentName}</strong> — {log.message}
              </div>
              <span className="activity-time">{timeAgo(log.timestamp)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
