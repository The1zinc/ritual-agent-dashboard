/* ──────────────────────────────────────────────
 *  Agent Types — Ritual Autonomous Agent Dashboard
 * ────────────────────────────────────────────── */

export enum AgentStatus {
  Spawning = 'spawning',
  Active = 'active',
  Paused = 'paused',
  Checkpointing = 'checkpointing',
  Reviving = 'reviving',
  Terminated = 'terminated',
}

export enum LogLevel {
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
  Action = 'action',
  System = 'system',
}

export interface AgentLog {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
}

export interface SoulConfig {
  name: string;
  purpose: string;
  constraints: string;
  model: string;
}

export interface MemoryConfig {
  type: 'ephemeral' | 'persistent';
  initialKnowledge: string;
  conversationHistory: boolean;
  maxTokens: number;
}

export interface StorageConfig {
  provider: 'ipfs' | 'gcs' | 'huggingface';
  autoCheckpointInterval: number; // seconds
  restoreFromCid: string; // optional CID for revival
}

export interface AgentMetrics {
  uptime: number;        // seconds
  totalActions: number;
  memorySize: number;    // bytes
  lastCheckpoint: number; // timestamp
  balance: string;       // in RITUAL (wei string)
}

export interface Agent {
  id: string;
  address: string;       // on-chain address
  owner: string;         // wallet address of deployer
  status: AgentStatus;
  soul: SoulConfig;
  memory: MemoryConfig;
  storage: StorageConfig;
  metrics: AgentMetrics;
  logs: AgentLog[];
  cid: string;           // latest checkpoint CID
  createdAt: number;     // timestamp
  lastActiveAt: number;  // timestamp
}

export interface CreateAgentFormData {
  soul: SoulConfig;
  memory: MemoryConfig;
  storage: StorageConfig;
}

export const DEFAULT_SOUL: SoulConfig = {
  name: '',
  purpose: '',
  constraints: '',
  model: 'ritual-llm-v1',
};

export const DEFAULT_MEMORY: MemoryConfig = {
  type: 'persistent',
  initialKnowledge: '',
  conversationHistory: true,
  maxTokens: 4096,
};

export const DEFAULT_STORAGE: StorageConfig = {
  provider: 'ipfs',
  autoCheckpointInterval: 300,
  restoreFromCid: '',
};
