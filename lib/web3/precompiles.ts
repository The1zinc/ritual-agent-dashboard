/* ──────────────────────────────────────────────
 *  Ritual 0x0820 — Persistent Agent Precompile
 *  25-field ABI interface + encoding helpers
 * ────────────────────────────────────────────── */

export const PERSISTENT_AGENT_ADDRESS = '0x0000000000000000000000000000000000000820' as const;

/**
 * The 25 fields of the Persistent Agent precompile input.
 * Most can be left at default values — only soul, messages, and model are required.
 */
export interface PersistentAgentInput {
  /** Field 1: Unique job identifier */
  jobId: string;
  /** Field 2: Agent soul — identity/purpose/constraints */
  soul: string;
  /** Field 3: System prompt */
  systemPrompt: string;
  /** Field 4: Agent behavioral constraints */
  constraints: string;
  /** Field 5: Messages JSON (conversation input) */
  messagesJson: string;
  /** Field 6: Model identifier */
  model: string;
  /** Field 7: Max output tokens */
  maxTokens: number;
  /** Field 8: Memory type (0=ephemeral, 1=persistent) */
  memoryType: number;
  /** Field 9: Initial knowledge base */
  initialKnowledge: string;
  /** Field 10: Storage provider (0=IPFS, 1=GCS, 2=HuggingFace) */
  storageProvider: number;
  /** Field 11: Storage reference URI */
  storageRef: string;
  /** Field 12: Auto-checkpoint interval in seconds */
  checkpointInterval: number;
  /** Field 13: Enable scheduler (0=off, 1=on) */
  schedulerEnabled: number;
  /** Field 14: Schedule cron expression */
  scheduleCron: string;
  /** Field 15: Allowed tool list (JSON) */
  allowedTools: string;
  /** Field 16: HTTP endpoints whitelist (JSON) */
  httpWhitelist: string;
  /** Field 17: Wallet funding amount (wei) */
  fundingAmount: bigint;
  /** Field 18: Max gas per action */
  maxGasPerAction: bigint;
  /** Field 19: TEE attestation required */
  requireTEE: boolean;
  /** Field 20: ZK proof mode (0=none, 1=generation, 2=verification) */
  zkMode: number;
  /** Field 21: Privacy level (0=public, 1=encrypted, 2=FHE) */
  privacyLevel: number;
  /** Field 22: Temperature (0-100, maps to 0.0-1.0) */
  temperature: number;
  /** Field 23: Restore from CID (empty for new agent) */
  restoreFromCid: string;
  /** Field 24: Conversation history enabled */
  convoHistory: boolean;
  /** Field 25: Callback gas limit */
  callbackGasLimit: bigint;
}

/** Default input with sensible defaults for most fields */
export function createDefaultAgentInput(): PersistentAgentInput {
  return {
    jobId: '',
    soul: '',
    systemPrompt: '',
    constraints: '',
    messagesJson: '[]',
    model: 'ritual-llm-v1',
    maxTokens: 4096,
    memoryType: 1, // persistent
    initialKnowledge: '',
    storageProvider: 0, // IPFS
    storageRef: '',
    checkpointInterval: 300,
    schedulerEnabled: 0,
    scheduleCron: '',
    allowedTools: '[]',
    httpWhitelist: '[]',
    fundingAmount: 0n,
    maxGasPerAction: 500000n,
    requireTEE: false,
    zkMode: 0,
    privacyLevel: 0,
    temperature: 70, // 0.7
    restoreFromCid: '',
    convoHistory: true,
    callbackGasLimit: 1000000n,
  };
}

/** ABI for the AgentDashboard contract */
export const AGENT_DASHBOARD_ABI = [
  {
    type: 'function',
    name: 'spawnAgent',
    inputs: [
      { name: 'soul', type: 'string' },
      { name: 'systemPrompt', type: 'string' },
      { name: 'constraints', type: 'string' },
      { name: 'messagesJson', type: 'string' },
      { name: 'model', type: 'string' },
      { name: 'maxTokens', type: 'uint256' },
      { name: 'memoryType', type: 'uint8' },
      { name: 'initialKnowledge', type: 'string' },
      { name: 'storageProvider', type: 'uint8' },
      { name: 'checkpointInterval', type: 'uint256' },
      { name: 'temperature', type: 'uint8' },
      { name: 'convoHistory', type: 'bool' },
      { name: 'restoreFromCid', type: 'string' },
    ],
    outputs: [{ name: 'agentId', type: 'bytes32' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'pauseAgent',
    inputs: [{ name: 'agentId', type: 'bytes32' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'resumeAgent',
    inputs: [{ name: 'agentId', type: 'bytes32' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'checkpointAgent',
    inputs: [{ name: 'agentId', type: 'bytes32' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'reviveAgent',
    inputs: [
      { name: 'agentId', type: 'bytes32' },
      { name: 'cid', type: 'string' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'terminateAgent',
    inputs: [{ name: 'agentId', type: 'bytes32' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getAgentCount',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'AgentSpawned',
    inputs: [
      { name: 'agentId', type: 'bytes32', indexed: true },
      { name: 'owner', type: 'address', indexed: true },
      { name: 'soul', type: 'string', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'AgentPaused',
    inputs: [{ name: 'agentId', type: 'bytes32', indexed: true }],
  },
  {
    type: 'event',
    name: 'AgentResumed',
    inputs: [{ name: 'agentId', type: 'bytes32', indexed: true }],
  },
  {
    type: 'event',
    name: 'AgentCheckpointed',
    inputs: [
      { name: 'agentId', type: 'bytes32', indexed: true },
      { name: 'cid', type: 'string', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'AgentRevived',
    inputs: [
      { name: 'agentId', type: 'bytes32', indexed: true },
      { name: 'cid', type: 'string', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'AgentTerminated',
    inputs: [{ name: 'agentId', type: 'bytes32', indexed: true }],
  },
  {
    type: 'event',
    name: 'AgentResult',
    inputs: [
      { name: 'agentId', type: 'bytes32', indexed: true },
      { name: 'result', type: 'bytes', indexed: false },
    ],
  },
] as const;
