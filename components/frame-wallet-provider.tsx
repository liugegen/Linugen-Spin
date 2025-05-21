'use client';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import { createConfig, http, WagmiProvider } from "wagmi";
import { defineChain } from "viem";
import { createContext, useContext, ReactNode } from "react";
import { injected } from "wagmi/connectors";

// Alchemy API Key
const ALCHEMY_API_KEY = 'VgGmMpwLBn6YH_WOsb1819q6STgxEkF-';
const ALCHEMY_RPC_URL = `https://monad-testnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

// Monad testnet configuration with Alchemy RPC
export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { 
      http: [ALCHEMY_RPC_URL]
    },
    public: { 
      http: [ALCHEMY_RPC_URL]
    },
    alchemy: {
      http: [ALCHEMY_RPC_URL]
    }
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com' }
  },
  testnet: true,
});

// Config with ONLY Monad Testnet chain
export const config = createConfig({
  chains: [monadTestnet], // Only Monad Testnet
  transports: {
    [monadTestnet.id]: http(ALCHEMY_RPC_URL),
  },
  connectors: [
    // Farcaster Frame connector
    farcasterFrame(),
    // Injected wallet connector
    injected({
      shimDisconnect: true,
    }),
  ],
});

// Create context for chain switching
type ChainContextType = {
  targetChainId: number;
  needsChainSwitch: (currentChainId: number) => boolean;
  isMonadTestnet: (chainId: number) => boolean;
  forceMonadTestnet: () => Promise<void>;
};

const ChainContext = createContext<ChainContextType>({
  targetChainId: monadTestnet.id,
  needsChainSwitch: (currentChainId) => currentChainId !== monadTestnet.id,
  isMonadTestnet: (chainId) => chainId === monadTestnet.id,
  forceMonadTestnet: async () => {},
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
    isMonadTestnet: (chainId: number) => chainId === monadTestnet.id,
    forceMonadTestnet: async () => {
      if (typeof window === 'undefined' || !window.ethereum) return;
      
      try {
        // Convert chainId to hex format for mobile wallets
        const chainIdHex = `0x${monadTestnet.id.toString(16)}`;
        console.log('Target chain ID:', chainIdHex);
        console.log('Attempting to switch to chain:', chainIdHex);
        
        // Try to switch to Monad Testnet
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        });
      } catch (error: any) {
        console.error('Switch chain error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        // If chain is not added, add it
        if (error.code === 4902) {
          const chainIdHex = `0x${monadTestnet.id.toString(16)}`;
          console.log('Adding chain:', chainIdHex);
          console.log('Chain details:', {
            chainId: chainIdHex,
            chainName: monadTestnet.name,
            nativeCurrency: monadTestnet.nativeCurrency,
            rpcUrls: [ALCHEMY_RPC_URL],
            blockExplorerUrls: [monadTestnet.blockExplorers.default.url]
          });
          
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: chainIdHex,
              chainName: monadTestnet.name,
              nativeCurrency: monadTestnet.nativeCurrency,
              rpcUrls: [ALCHEMY_RPC_URL],
              blockExplorerUrls: [monadTestnet.blockExplorers.default.url]
            }],
          });
        }
      }
    },
  };

  return (
    <ChainContext.Provider value={chainContextValue}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </WagmiProvider>
    </ChainContext.Provider>
  );
}