/* ──────────────────────────────────────────────
 *  Agent Store — React Context + API Integrations
 * ────────────────────────────────────────────── */

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useAccount } from 'wagmi';
import {
  Agent,
  AgentStatus,
  AgentLog,
  CreateAgentFormData,
} from './types';

interface AgentStore {
  agents: Agent[];
  getAgent: (id: string) => Agent | undefined;
  createAgent: (data: CreateAgentFormData, transactionAddress: string) => Promise<Agent>;
  updateAgentStatus: (id: string, status: AgentStatus) => Promise<void>;
  deleteAgent: (id: string) => Promise<void>;
  addLog: (agentId: string, log: AgentLog) => Promise<void>;
  isLoaded: boolean;
  refresh: () => Promise<void>;
}

const AgentContext = createContext<AgentStore | null>(null);

export function useAgents(): AgentStore {
  const ctx = useContext(AgentContext);
  if (!ctx) throw new Error('useAgents must be used within AgentProvider');
  return ctx;
}

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { address: walletAddress } = useAccount();

  const fetchAgents = useCallback(async () => {
    try {
      // Trigger on-demand sync from blockchain to Neon DB before loading
      await fetch('/api/sync').catch(() => {});

      const url = walletAddress ? `/api/agents?owner=${walletAddress}` : '/api/agents';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setAgents(data);
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    } finally {
      setIsLoaded(true);
    }
  }, [walletAddress]);

  // Fetch agents on mount or when connected wallet address changes
  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const getAgent = useCallback(
    (id: string) => agents.find((a) => a.id === id),
    [agents]
  );

  const createAgent = useCallback(
    async (data: CreateAgentFormData, transactionAddress: string): Promise<Agent> => {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          owner: walletAddress || '0x0000000000000000000000000000000000000000',
          address: transactionAddress,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create agent in database');
      }

      const newAgent = await res.json();
      setAgents((prev) => [newAgent, ...prev]);
      return newAgent;
    },
    [walletAddress]
  );

  const updateAgentStatus = useCallback(
    async (id: string, status: AgentStatus) => {
      // Optimistic update
      setAgents((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status, lastActiveAt: Date.now() } : a))
      );

      try {
        const res = await fetch(`/api/agents/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });

        if (!res.ok) {
          throw new Error('Failed to update agent status on server');
        }

        const updatedAgent = await res.json();
        setAgents((prev) => prev.map((a) => (a.id === id ? updatedAgent : a)));
      } catch (error) {
        console.error('Error updating agent status:', error);
        // Revert or refresh on failure
        fetchAgents();
      }
    },
    [fetchAgents]
  );

  const deleteAgent = useCallback(async (id: string) => {
    setAgents((prev) => prev.filter((a) => a.id !== id));

    try {
      const res = await fetch(`/api/agents/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete agent from server');
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
      fetchAgents();
    }
  }, [fetchAgents]);

  const addLog = useCallback(
    async (agentId: string, log: AgentLog) => {
      // Update local state
      setAgents((prev) =>
        prev.map((a) =>
          a.id === agentId
            ? { ...a, logs: [...a.logs.slice(-99), log], lastActiveAt: Date.now() }
            : a
        )
      );

      try {
        const res = await fetch(`/api/agents/${agentId}/logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(log),
        });
        if (!res.ok) throw new Error('Failed to push log');
      } catch (err) {
        console.error('Failed to upload log:', err);
      }
    },
    []
  );

  return (
    <AgentContext.Provider
      value={{
        agents,
        getAgent,
        createAgent,
        updateAgentStatus,
        deleteAgent,
        addLog,
        isLoaded,
        refresh: fetchAgents,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}

