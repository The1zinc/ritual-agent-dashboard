'use client';

import { http, createConfig, WagmiProvider } from 'wagmi';
import { injected, coinbaseWallet } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ritualTestnet } from '@/lib/web3/chains';

export const config = createConfig({
  chains: [ritualTestnet],
  connectors: [
    injected(),
    coinbaseWallet({ appName: 'Ritual Agent Dashboard' }),
  ],
  transports: {
    [ritualTestnet.id]: http(),
  },
  ssr: true,
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

