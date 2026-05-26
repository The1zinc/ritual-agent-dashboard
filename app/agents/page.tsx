'use client';

import Link from 'next/link';
import { useAgents } from '@/lib/agents/store';
import AgentCard from '@/components/agents/AgentCard';
import { AgentStatus } from '@/lib/agents/types';
import { useState } from 'react';

export default function AgentsPage() {
  const { agents, isLoaded } = useAgents();
  const [filter, setFilter] = useState<'all' | AgentStatus>('all');

  const filtered =
    filter === 'all' ? agents : agents.filter((a) => a.status === filter);

  const filters: { label: string; value: 'all' | AgentStatus }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: AgentStatus.Active },
    { label: 'Paused', value: AgentStatus.Paused },
    { label: 'Spawning', value: AgentStatus.Spawning },
    { label: 'Terminated', value: AgentStatus.Terminated },
  ];

  if (!isLoaded) {
    return (
      <div>
        <div className="skeleton" style={{ width: 200, height: 36, marginBottom: 24 }} />
        <div className="agents-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 220, borderRadius: 16 }} />
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
            <h1 className="page-title">All Agents</h1>
            <p className="page-subtitle">
              {agents.length} agent{agents.length !== 1 ? 's' : ''} deployed on Ritual
              Chain
            </p>
          </div>
          <Link href="/create" className="btn btn-primary">
            <span>✦</span> Deploy Agent
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="btn-group" style={{ marginBottom: 'var(--space-xl)' }}>
        {filters.map((f) => (
          <button
            key={f.value}
            className={`btn btn-sm ${filter === f.value ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
            {f.value !== 'all' && (
              <span style={{ opacity: 0.7 }}>
                ({agents.filter((a) => a.status === f.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="agents-grid stagger-children">
          {filtered.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      ) : (
        <div className="glass-card-static">
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">No agents match this filter</div>
            <div className="empty-state-text">
              Try selecting a different status filter or deploy a new agent.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
