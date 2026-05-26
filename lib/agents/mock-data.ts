/* ──────────────────────────────────────────────
 *  Mock Data — Demo agents for the dashboard
 * ────────────────────────────────────────────── */

import { Agent, AgentStatus, AgentLog, LogLevel } from './types';

const now = Date.now();
const hour = 3_600_000;
const minute = 60_000;

function makeLog(
  offset: number,
  level: LogLevel,
  message: string
): AgentLog {
  return {
    id: `log-${Math.random().toString(36).slice(2, 10)}`,
    timestamp: now - offset,
    level,
    message,
  };
}

export const MOCK_AGENTS: Agent[] = [
  {
    id: 'agent-001',
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28',
    owner: '0x1234567890abcdef1234567890abcdef12345678',
    status: AgentStatus.Active,
    soul: {
      name: 'DeFi Sentinel',
      purpose:
        'Monitor DeFi protocol positions for liquidation risk and execute protective actions. Analyze token prices, collateral ratios, and market volatility to preemptively rebalance positions.',
      constraints:
        'Never execute trades above 5% of portfolio value. Always maintain minimum 150% collateral ratio. Respect gas price thresholds.',
      model: 'ritual-llm-v1',
    },
    memory: {
      type: 'persistent',
      initialKnowledge:
        'DeFi protocol mechanics, liquidation thresholds, historical volatility patterns for major token pairs.',
      conversationHistory: true,
      maxTokens: 8192,
    },
    storage: {
      provider: 'ipfs',
      autoCheckpointInterval: 120,
      restoreFromCid: '',
    },
    metrics: {
      uptime: 172800,
      totalActions: 347,
      memorySize: 524288,
      lastCheckpoint: now - 15 * minute,
      balance: '2450000000000000000',
    },
    logs: [
      makeLog(2 * minute, LogLevel.Action, 'Rebalanced WETH/USDC position — collateral ratio restored to 185%'),
      makeLog(5 * minute, LogLevel.Info, 'Market scan complete — no immediate liquidation risks detected'),
      makeLog(12 * minute, LogLevel.Warn, 'ETH volatility spike detected — increasing monitoring frequency'),
      makeLog(18 * minute, LogLevel.Action, 'Executed protective swap: 0.5 WETH → 1,245 USDC'),
      makeLog(25 * minute, LogLevel.Info, 'Checkpoint saved to IPFS — CID: QmXoypiz...'),
      makeLog(35 * minute, LogLevel.System, 'Agent heartbeat — all systems nominal'),
      makeLog(45 * minute, LogLevel.Info, 'Gas price within threshold: 12 gwei'),
      makeLog(1 * hour, LogLevel.Action, 'Added 500 USDC collateral to Aave V3 position'),
      makeLog(1.5 * hour, LogLevel.Error, 'RPC timeout on price feed — retrying with backup endpoint'),
      makeLog(2 * hour, LogLevel.Info, 'Recovered — backup RPC response: 2ms latency'),
    ],
    cid: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    createdAt: now - 48 * hour,
    lastActiveAt: now - 2 * minute,
  },
  {
    id: 'agent-002',
    address: '0x8Ba1f109551bD432803012645Hac136Dcc8525c3',
    owner: '0x1234567890abcdef1234567890abcdef12345678',
    status: AgentStatus.Active,
    soul: {
      name: 'Governance Oracle',
      purpose:
        'Analyze DAO proposals across major protocols, generate risk assessments and plain-language summaries, and publish on-chain attestations for voter reference.',
      constraints:
        'Remain politically neutral. Present both sides of contentious proposals. Never vote on behalf of token holders.',
      model: 'ritual-llm-v1',
    },
    memory: {
      type: 'persistent',
      initialKnowledge:
        'DAO governance frameworks, tokenomics, historical proposal outcomes, common governance attack vectors.',
      conversationHistory: true,
      maxTokens: 16384,
    },
    storage: {
      provider: 'ipfs',
      autoCheckpointInterval: 600,
      restoreFromCid: '',
    },
    metrics: {
      uptime: 604800,
      totalActions: 89,
      memorySize: 1048576,
      lastCheckpoint: now - 8 * minute,
      balance: '1200000000000000000',
    },
    logs: [
      makeLog(8 * minute, LogLevel.Action, 'Published analysis: MakerDAO proposal MIP-127 — Risk Score: 3/10'),
      makeLog(20 * minute, LogLevel.Info, 'Fetched 12 new proposals from Compound, Aave, Uniswap'),
      makeLog(40 * minute, LogLevel.Action, 'Generated summary: Uniswap fee switch proposal — balanced analysis published'),
      makeLog(1 * hour, LogLevel.System, 'Checkpoint saved — memory utilization: 67%'),
      makeLog(2 * hour, LogLevel.Warn, 'Detected potentially malicious proposal on Compound — flagged for review'),
      makeLog(3 * hour, LogLevel.Info, 'Voter engagement metrics updated for 5 active proposals'),
    ],
    cid: 'QmRAQB6YaCyidP37UdDnjFY5vQuiBrcqdyoW1CuDggwpk4',
    createdAt: now - 7 * 24 * hour,
    lastActiveAt: now - 8 * minute,
  },
  {
    id: 'agent-003',
    address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    owner: '0x1234567890abcdef1234567890abcdef12345678',
    status: AgentStatus.Paused,
    soul: {
      name: 'Content Curator',
      purpose:
        'Monitor social feeds and on-chain activity to curate relevant crypto/AI news. Generate daily digests and trend analysis reports.',
      constraints:
        'Filter out promotional content. Verify claims against on-chain data. Maintain objective tone.',
      model: 'ritual-llm-v1',
    },
    memory: {
      type: 'persistent',
      initialKnowledge:
        'Crypto ecosystem landscape, key opinion leaders, historical market narratives, fact-checking methodologies.',
      conversationHistory: false,
      maxTokens: 4096,
    },
    storage: {
      provider: 'gcs',
      autoCheckpointInterval: 900,
      restoreFromCid: '',
    },
    metrics: {
      uptime: 259200,
      totalActions: 156,
      memorySize: 786432,
      lastCheckpoint: now - 6 * hour,
      balance: '800000000000000000',
    },
    logs: [
      makeLog(6 * hour, LogLevel.System, 'Agent paused by owner — reason: maintenance window'),
      makeLog(6.1 * hour, LogLevel.Info, 'Final checkpoint saved before pause'),
      makeLog(7 * hour, LogLevel.Action, 'Published daily digest #42 — 15 curated articles'),
      makeLog(8 * hour, LogLevel.Info, 'Trend analysis: "Autonomous agents" mentions up 340% this week'),
      makeLog(10 * hour, LogLevel.Warn, 'Source reliability score dropped for @crypto_insider — adjusting weight'),
    ],
    cid: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
    createdAt: now - 3 * 24 * hour,
    lastActiveAt: now - 6 * hour,
  },
];

/** Simulated log messages for live demo feed */
export const SIMULATED_LOG_MESSAGES: { level: LogLevel; messages: string[] }[] = [
  {
    level: LogLevel.Info,
    messages: [
      'Market scan complete — all positions healthy',
      'Fetched latest block data — height: #1,847,293',
      'Gas price check: 8.2 gwei — within optimal range',
      'Memory utilization: 45% — well within limits',
      'Heartbeat response: 3ms latency to RPC endpoint',
      'Token price feed updated — 12 pairs refreshed',
      'Network peer count: 47 — connectivity stable',
    ],
  },
  {
    level: LogLevel.Action,
    messages: [
      'Executed monitoring sweep — 0 anomalies detected',
      'Published on-chain attestation — tx confirmed in 2 blocks',
      'Updated risk scores for 5 tracked protocols',
      'Generated weekly performance report',
      'Triggered scheduled rebalance — awaiting confirmation',
    ],
  },
  {
    level: LogLevel.Warn,
    messages: [
      'Elevated gas prices detected — delaying non-critical operations',
      'Secondary RPC endpoint responding slowly — monitoring',
      'Token pair WBTC/ETH showing unusual spread — flagged',
    ],
  },
  {
    level: LogLevel.System,
    messages: [
      'Auto-checkpoint initiated — saving state to IPFS',
      'Memory compaction complete — freed 128KB',
      'Agent heartbeat — all systems nominal',
    ],
  },
];
