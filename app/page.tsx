'use client';

import Link from 'next/link';
import { useAgents } from '@/lib/agents/store';
import StatsOverview from '@/components/dashboard/StatsOverview';
import AgentCard from '@/components/agents/AgentCard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';

export default function DashboardPage() {
  const { agents, isLoaded } = useAgents();

  if (!isLoaded) {
    return (
      <div>
        <div className="page-header">
          <div className="skeleton" style={{ width: 300, height: 36, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: 200, height: 20 }} />
        </div>
        <div className="stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Agent Dashboard</h1>
            <p className="page-subtitle">
              Monitor and manage your autonomous on-chain AI agents on Ritual Chain
            </p>
          </div>
          <Link href="/create" className="btn btn-primary btn-lg">
            <span>✦</span> Deploy New Agent
          </Link>
        </div>
      </div>

      <StatsOverview agents={agents} />

      <div className="section">
        <div className="section-title">
          <span>⬡</span> Your Agents
        </div>
        {agents.length > 0 ? (
          <div className="agents-grid stagger-children">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        ) : (
          <div className="glass-card-static">
            <div className="empty-state">
              <div className="empty-state-icon">⬡</div>
              <div className="empty-state-title">No agents deployed yet</div>
              <div className="empty-state-text">
                Create your first autonomous agent to start monitoring on-chain AI activity.
              </div>
              <Link href="/create" className="btn btn-primary">
                Deploy Your First Agent
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="section">
        <ActivityFeed agents={agents} />
      </div>
    </div>
  );
}
