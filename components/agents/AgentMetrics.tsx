'use client';

import { AgentMetrics as AgentMetricsType } from '@/lib/agents/types';
import { formatDuration, formatBytes, formatBalance, timeAgo } from '@/lib/utils';

interface Props {
  metrics: AgentMetricsType;
}

export default function AgentMetrics({ metrics }: Props) {
  const items = [
    { label: 'Uptime', value: formatDuration(metrics.uptime), color: 'var(--accent-secondary)' },
    { label: 'Actions', value: metrics.totalActions.toLocaleString(), color: 'var(--accent-primary)' },
    { label: 'Memory', value: formatBytes(metrics.memorySize), color: 'var(--accent-tertiary)' },
    { label: 'Balance', value: `${formatBalance(metrics.balance)} Ⓡ`, color: 'var(--accent-warm)' },
    {
      label: 'Last Checkpoint',
      value: metrics.lastCheckpoint > 0 ? timeAgo(metrics.lastCheckpoint) : 'Never',
      color: 'var(--accent-pink)',
    },
  ];

  return (
    <div className="metrics-grid">
      {items.map((item) => (
        <div key={item.label} className="metric-card">
          <div className="metric-label">{item.label}</div>
          <div className="metric-value" style={{ color: item.color }}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}
