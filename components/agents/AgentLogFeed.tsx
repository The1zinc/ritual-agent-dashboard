'use client';

import { useEffect, useRef } from 'react';
import { AgentLog } from '@/lib/agents/types';
import { formatTimestamp } from '@/lib/utils';

interface Props {
  logs: AgentLog[];
  title?: string;
}

export default function AgentLogFeed({ logs, title = 'Live Logs' }: Props) {
  const bodyRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [logs.length]);

  return (
    <div className="log-feed">
      <div className="log-feed-header">
        <div className="log-feed-title">
          <span style={{ color: 'var(--accent-secondary)' }}>▸</span>
          {title}
        </div>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {logs.length} entries
        </span>
      </div>
      <div className="log-feed-body" ref={bodyRef}>
        {logs.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            No logs yet — waiting for agent activity...
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="log-entry">
              <span className="log-timestamp">{formatTimestamp(log.timestamp)}</span>
              <span className={`log-level log-level--${log.level}`}>{log.level}</span>
              <span className="log-message">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
