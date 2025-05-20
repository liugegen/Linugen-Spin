// lib/constants.ts

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://linugen-spin.vercel.app';

// Additional exports that might be required by the template
export const APP_NAME = 'Linugen Spin';
export const APP_DESCRIPTION = 'NFT Spin Game on Monad';

// Monad Chain Configuration
import { defineChain } from 'viem';

export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
    public: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: { 
      name: 'Monad Explorer', 
      url: 'https://testnet.monadexplorer.com' 
    },
  },
  testnet: true,
});

// Re-export for compatibility with template
export { monadTestnet as defaultChain };