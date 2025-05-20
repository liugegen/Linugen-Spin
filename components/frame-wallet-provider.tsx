'use client';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import { createConfig, http, WagmiProvider } from "wagmi";
import { defineChain } from "viem";
import { createContext, useContext, ReactNode } from "react";
import { injected } from "wagmi/connectors";

// Monad testnet configuration
export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
    public: { http: ['https://testnet-rpc.monad.xyz'] }
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com' }
  },
  testnet: true,
});

// Base Sepolia configuration (Commonly used in Warpcast)
export const baseSepolia = defineChain({
  id: 84532,
  name: 'Base Sepolia',
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://sepolia.base.org'] },
    public: { http: ['https://sepolia.base.org'] }
  },
  blockExplorers: {
    default: { name: 'Base Sepolia Explorer', url: 'https://sepolia.basescan.org' }
  },
  testnet: true,
});

// Config with both chains and MULTIPLE CONNECTORS
export const config = createConfig({
  // List Monad Testnet as the primary chain
  chains: [monadTestnet, baseSepolia],
  transports: {
    [monadTestnet.id]: http('https://testnet-rpc.monad.xyz'),
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
  // Multiple connectors for user to choose from
  connectors: [
    // Farcaster Frame connector (labeled as 'Warpcast')
    farcasterFrame(),
    // Metamask / Browser Wallet connector
    injected({
      shimDisconnect: true,
    }),
  ],
});

// Create context for chain switching
type ChainContextType = {
  targetChainId: number;
  needsChainSwitch: (currentChainId: number) => boolean;
};

const ChainContext = createContext<ChainContextType>({
  targetChainId: monadTestnet.id,
  needsChainSwitch: (currentChainId) => currentChainId !== monadTestnet.id,
});

export const useChainContext = () => useContext(ChainContext);

const queryClient = new QueryClient();

export default function FrameWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Always provide Monad Testnet as target chain
  const chainContextValue = {
    targetChainId: monadTestnet.id,
    needsChainSwitch: (currentChainId: number) => currentChainId !== monadTestnet.id,
  };

  return (
    <ChainContext.Provider value={chainContextValue}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </WagmiProvider>
    </ChainContext.Provider>
  );
}