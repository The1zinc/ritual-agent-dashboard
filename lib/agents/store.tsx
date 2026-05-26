/* ──────────────────────────────────────────────
 *  Agent Store — React Context + localStorage
 * ────────────────────────────────────────────── */

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {
  Agent,
  AgentStatus,
  AgentLog,
  LogLevel,
  CreateAgentFormData,
} from './types';
import { MOCK_AGENTS, SIMULATED_LOG_MESSAGES } from './mock-data';

const STORAGE_KEY = 'ritual-agents-v1';

interface AgentStore {
  agents: Agent[];
  getAgent: (id: string) => Agent | undefined;
  createAgent: (data: CreateAgentFormData) => Agent;
  updateAgentStatus: (id: string, status: AgentStatus) => void;
  deleteAgent: (id: string) => void;
  addLog: (agentId: string, log: AgentLog) => void;
  isLoaded: boolean;
}

const AgentContext = createContext<AgentStore | null>(null);

export function useAgents(): AgentStore {
  const ctx = useContext(AgentContext);
  if (!ctx) throw new Error('useAgents must be used within AgentProvider');
  return ctx;
}

function loadFromStorage(): Agent[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore corrupt storage */
  }
  return null;
}

function saveToStorage(agents: Agent[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(agents));
  } catch {
    /* quota exceeded — silently fail */
  }
}

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load from localStorage or seed with mock data on mount
  useEffect(() => {
    const stored = loadFromStorage();
    const initialAgents = stored && stored.length > 0 ? stored : MOCK_AGENTS;
    if (!stored || stored.length === 0) {
      saveToStorage(MOCK_AGENTS);
    }
    
    const timer = setTimeout(() => {
      setAgents(initialAgents);
      setIsLoaded(true);
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  // Persist on change
  useEffect(() => {
    if (isLoaded) saveToStorage(agents);
  }, [agents, isLoaded]);

  // Simulate live logs for active agents
  useEffect(() => {
    if (!isLoaded) return;

    intervalRef.current = setInterval(() => {
      setAgents((prev) => {
        const activeAgents = prev.filter((a) => a.status === AgentStatus.Active);
        if (activeAgents.length === 0) return prev;

        // Pick a random active agent
        const target = activeAgents[Math.floor(Math.random() * activeAgents.length)];
        // Pick a random log category
        const category =
          SIMULATED_LOG_MESSAGES[
            Math.floor(Math.random() * SIMULATED_LOG_MESSAGES.length)
          ];
        const message =
          category.messages[Math.floor(Math.random() * category.messages.length)];

        const newLog: AgentLog = {
          id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: Date.now(),
          level: category.level,
          message,
        };

        return prev.map((a) => {
          if (a.id !== target.id) return a;
          return {
            ...a,
            logs: [...a.logs.slice(-99), newLog], // keep last 100
            lastActiveAt: Date.now(),
            metrics: {
              ...a.metrics,
              uptime: a.metrics.uptime + 8,
              totalActions:
                category.level === LogLevel.Action
                  ? a.metrics.totalActions + 1
                  : a.metrics.totalActions,
            },
          };
        });
      });
    }, 5000); // new log every 5 seconds

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLoaded]);

  const getAgent = useCallback(
    (id: string) => agents.find((a) => a.id === id),
    [agents]
  );

  const createAgent = useCallback(
    (data: CreateAgentFormData): Agent => {
      const agent: Agent = {
        id: `agent-${Date.now().toString(36)}`,
        address: `0x${Array.from({ length: 40 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join('')}`,
        owner: '0x0000000000000000000000000000000000000000',
        status: AgentStatus.Spawning,
        soul: data.soul,
        memory: data.memory,
        storage: data.storage,
        metrics: {
          uptime: 0,
          totalActions: 0,
          memorySize: 0,
          lastCheckpoint: 0,
          balance: '0',
        },
        logs: [
          {
            id: `log-${Date.now()}`,
            timestamp: Date.now(),
            level: LogLevel.System,
            message: `Agent "${data.soul.name}" spawning — submitting to 0x0820 precompile...`,
          },
        ],
        cid: '',
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
      };

      // Simulate spawn: transition to Active after 3s
      setTimeout(() => {
        setAgents((prev) =>
          prev.map((a) =>
            a.id === agent.id
              ? {
                  ...a,
                  status: AgentStatus.Active,
                  logs: [
                    ...a.logs,
                    {
                      id: `log-${Date.now()}`,
                      timestamp: Date.now(),
                      level: LogLevel.System,
                      message:
                        'Agent spawn confirmed — now active on Ritual Chain',
                    },
                  ],
                }
              : a
          )
        );
      }, 3000);

      setAgents((prev) => [...prev, agent]);
      return agent;
    },
    []
  );

  const updateAgentStatus = useCallback(
    (id: string, status: AgentStatus) => {
      setAgents((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a;
          const logMsg =
            status === AgentStatus.Paused
              ? 'Agent paused by owner'
              : status === AgentStatus.Active
              ? 'Agent resumed — returning to active state'
              : status === AgentStatus.Terminated
              ? 'Agent terminated — final checkpoint saved'
              : status === AgentStatus.Checkpointing
              ? 'Manual checkpoint initiated...'
              : `Status changed to ${status}`;
          return {
            ...a,
            status,
            lastActiveAt: Date.now(),
            logs: [
              ...a.logs,
              {
                id: `log-${Date.now()}`,
                timestamp: Date.now(),
                level: LogLevel.System,
                message: logMsg,
              },
            ],
          };
        })
      );
    },
    []
  );

  const deleteAgent = useCallback((id: string) => {
    setAgents((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const addLog = useCallback(
    (agentId: string, log: AgentLog) => {
      setAgents((prev) =>
        prev.map((a) =>
          a.id === agentId
            ? { ...a, logs: [...a.logs.slice(-99), log], lastActiveAt: Date.now() }
            : a
        )
      );
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
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}
