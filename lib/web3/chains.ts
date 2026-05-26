import { defineChain } from 'viem';

export const ritualTestnet = defineChain({
  id: 1979,
  name: 'Ritual Chain Testnet',
  nativeCurrency: {
    name: 'RITUAL',
    symbol: 'RITUAL',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.ritualfoundation.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Ritual Explorer',
      url: 'https://explorer.ritualfoundation.org',
    },
  },
  testnet: true,
});

export const RITUAL_FAUCET_URL = 'https://faucet.ritualfoundation.org';
export const RITUAL_DOCS_URL = 'https://docs.ritual.net';
export const RITUAL_CHAIN_ID = 1979;
