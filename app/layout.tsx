import type { Metadata } from 'next';
import './globals.css';
import { Web3Provider } from '@/providers/Web3Provider';
import { AgentProvider } from '@/lib/agents/store';
import Navbar from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'Ritual Agent Dashboard — Autonomous On-Chain AI Agents',
  description:
    'Create, monitor, and manage persistent on-chain AI agents on Ritual Chain. Deploy autonomous agents using the 0x0820 precompile with real-time monitoring, logs, and lifecycle management.',
  keywords: [
    'Ritual Chain',
    'AI Agents',
    'Autonomous Agents',
    'Blockchain',
    'DeFi',
    'Web3',
    'On-Chain AI',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>
          <AgentProvider>
            <Navbar />
            <div className="app-layout">
              <main className="main-content animate-fade-in">{children}</main>
            </div>
          </AgentProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
