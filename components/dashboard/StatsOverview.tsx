'use client';

import { Agent, AgentStatus } from '@/lib/agents/types';

interface Props {
  agents: Agent[];
}

export default function StatsOverview({ agents }: Props) {
  const totalAgents = agents.length;
  const activeAgents = agents.filter((a) => a.status === AgentStatus.Active).length;
  const totalActions = agents.reduce((sum, a) => sum + a.metrics.totalActions, 0);
  const totalUptime = agents.reduce((sum, a) => sum + a.metrics.uptime, 0);

  const stats = [
    {
      label: 'Total Agents',
      value: totalAgents,
      icon: '⬡',
      glow: 'rgba(139, 92, 246, 0.3)',
      iconBg: 'rgba(139, 92, 246, 0.15)',
    },
    {
      label: 'Active',
      value: activeAgents,
      icon: '◉',
      glow: 'rgba(6, 214, 160, 0.3)',
      iconBg: 'rgba(6, 214, 160, 0.15)',
    },
    {
      label: 'Total Actions',
      value: totalActions.toLocaleString(),
      icon: '⚡',
      glow: 'rgba(56, 189, 248, 0.3)',
      iconBg: 'rgba(56, 189, 248, 0.15)',
    },
    {
      label: 'Combined Uptime',
      value: `${Math.floor(totalUptime / 3600)}h`,
      icon: '⏱',
      glow: 'rgba(245, 158, 11, 0.3)',
      iconBg: 'rgba(245, 158, 11, 0.15)',
    },
  ];

  return (
    <div className="stats-grid stagger-children">
      {stats.map((stat) => (
        <div key={stat.label} className="stat-card">
          <div className="stat-card-glow" style={{ background: stat.glow }} />
          <div className="stat-card-icon" style={{ background: stat.iconBg }}>
            {stat.icon}
          </div>
          <div className="stat-card-label">{stat.label}</div>
          <div className="stat-card-value">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}
