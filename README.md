# Ritual Autonomous Agent Dashboard

A premium, state-of-the-art Web3 control panel for deploying, monitoring, and managing autonomous AI agents on the **Ritual Chain Testnet** (Chain ID `1979`).

The dashboard integrates directly with the Ritual Chain smart contract precompiles (`0x0820`) and aggregates metadata and logs in a **Neon PostgreSQL** database.

---

## 🚀 Key Features

- **On-Chain Agent Spawning**: Deploy autonomous agents utilizing the Ritual precompiles with custom identity (Soul), persistent or ephemeral memory, and IPFS storage.
- **Dynamic On-Demand Syncing**: Synchronizes database records with live on-chain logs via client-side triggers (saves Vercel CPU quotas).
- **Responsive Dark/Light Mode**: Smooth transitions, neon glassmorphism effects, and harmonized color palettes.
- **Custom Web3 Integration**: Pure Wagmi/Viem providers (independent of WalletConnect Project ID limits).
- **Comprehensive Lifecycle Operations**: Resume, pause, terminate, or trigger manual checkpoints on-chain directly from the agent detail view.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (Turbopack, React 19)
- **Database**: Neon PostgreSQL via Prisma ORM
- **Web3 Layer**: Wagmi, Viem
- **Smart Contracts**: Solidity (AgentDashboard contract compilation script included)
- **Styling**: Modern CSS with HSL variables for dark/light themes

---

## 📦 Setup & Installation

### 1. Clone the repository and install dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory (copied from `.env.example`):
```env
# Neon PostgreSQL database URL
DATABASE_URL="postgresql://user:password@host:5432/ritual_agents?sslmode=require"

# Ritual Chain Testnet RPC endpoint
NEXT_PUBLIC_RPC_URL="https://rpc.ritualfoundation.org"

# Deployed AgentDashboard contract address (will be set after deploying)
NEXT_PUBLIC_DASHBOARD_CONTRACT_ADDRESS="0xe54D597A8114f6e6Ea50D51bBFFC619A0A86c075"
```

### 3. Generate Prisma Client & Push Database Schema
```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Smart Contract & Deployment

To deploy a custom registry contract:

1. Connect your wallet (e.g., Rabby or MetaMask) configured for **Ritual Chain Testnet** (Chain ID: `1979`, RPC: `https://rpc.ritualfoundation.org`, Token Symbol: `RITUAL`).
2. Visit the `/deploy` page on the dashboard (`http://localhost:3000/deploy`).
3. Click **Deploy AgentDashboard Contract** and approve the transaction in your wallet.
4. Copy the resulting contract address and update the `NEXT_PUBLIC_DASHBOARD_CONTRACT_ADDRESS` environment variable.

### Compile Contracts Locally (Optional)
If you modify `contracts/src/AgentDashboard.sol`, run the compilation script:
```bash
npx ts-node scripts/compile.ts
```
This updates the ABI and bytecode artifacts stored in `lib/web3/AgentDashboard.json`.

---

## 📡 On-Demand Sync (Vercel Hobby Optimization)

To protect Vercel CPU limits from running continuous indexers, this application uses **On-Demand client-driven syncing**:
- When a user connects their wallet or loads the agent list/details, a background request is fired to `/api/sync`.
- This route queries the Ritual Chain Testnet RPC client for events emitted by the `AgentDashboard` contract within the last 100 blocks.
- It parses events like `AgentSpawned`, `AgentPaused`, `AgentResumed`, `AgentCheckpointed`, and `AgentTerminated` and updates the Neon DB accordingly.
