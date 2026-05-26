'use client';

import { AgentStatus } from '@/lib/agents/types';

interface Props {
  status: AgentStatus;
}

export default function AgentStatusBadge({ status }: Props) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      <span className={`pulsing-dot pulsing-dot--${status}`} />
      {status}
    </span>
  );
}
