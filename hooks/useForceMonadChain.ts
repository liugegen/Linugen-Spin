// hooks/useForceMonadChain.ts

'use client';

import { useEffect, useState } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { monadTestnet } from '@/components/frame-wallet-provider';
import { useChainContext } from '@/components/frame-wallet-provider';

// Alchemy API Key
const ALCHEMY_API_KEY = 'VgGmMpwLBn6YH_WOsb1819q6STgxEkF-';
const ALCHEMY_RPC_URL = `https://monad-testnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

export function useForceMonadChain() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { forceMonadTestnet } = useChainContext();
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [switchCount, setSwitchCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      setIsMobile(mobileRegex.test(userAgent));
    };
    checkMobile();
  }, []);

  // Check if on wrong network
  const isWrongNetwork = isConnected && chainId !== monadTestnet.id;

  // Force switch to Monad Testnet when connected and on wrong network
  // Auto-attempt only once to avoid annoying users
  useEffect(() => {
    if (isWrongNetwork && !isSwitching && switchCount === 0) {
      handleSwitchToMonad();
    }
  }, [isConnected, chainId, isSwitching, switchCount]);

  // Reset switch count when network changes or disconnects/reconnects
  useEffect(() => {
    setSwitchCount(0);
  }, [chainId, isConnected]);

  const handleSwitchToMonad = async () => {
    if (!isConnected || chainId === monadTestnet.id) return;
    
    setIsSwitching(true);
    setError(null);
    
    try {
      console.log('Attempting to switch to Monad Testnet...');
      
      // Add delay for mobile devices to ensure wallet is ready
      if (isMobile) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Convert chainId to hex format for mobile wallets
      const chainIdHex = `0x${monadTestnet.id.toString(16)}`;
      console.log('Using chain ID:', chainIdHex);

      // Try direct wallet switching first
      await forceMonadTestnet();
      
      // If that fails, try wagmi's switchChain
      if (chainId !== monadTestnet.id) {
        await switchChain({ 
          chainId: monadTestnet.id,
          addEthereumChainParameter: {
            chainName: monadTestnet.name,
            nativeCurrency: monadTestnet.nativeCurrency,
            rpcUrls: [ALCHEMY_RPC_URL],
            blockExplorerUrls: [monadTestnet.blockExplorers.default.url]
          }
        });
      }
      
      console.log('Successfully switched to Monad Testnet');
    } catch (err: any) {
      console.error('Failed to switch to Monad Testnet:', err);
      
      // Enhanced error handling for mobile
      let errorMessage = err?.message || 'Failed to switch network';
      
      if (isMobile) {
        if (errorMessage.includes('user rejected')) {
          errorMessage = 'Please approve the network switch in your wallet app';
        } else if (errorMessage.includes('timeout')) {
          errorMessage = 'Network switch timed out. Please try again';
        } else if (errorMessage.includes('chain id')) {
          errorMessage = 'This app only works on Monad Testnet (Chain ID: 10143). Please switch to Monad Testnet in your wallet app';
        } else if (errorMessage.includes('already pending')) {
          errorMessage = 'A network switch is already in progress. Please wait or try again.';
        }
      } else {
        if (errorMessage.includes('chain id')) {
          errorMessage = 'This app only works on Monad Testnet (Chain ID: 10143). Please switch to Monad Testnet in your wallet';
        }
      }
      
      setError(errorMessage);
      setSwitchCount(prev => prev + 1);
      
      // Enhanced error logging
      if (err?.message) {
        console.warn(`Network switch error: ${err.message}`);
      }
    } finally {
      setIsSwitching(false);
    }
  };

  return {
    isWrongNetwork,
    isSwitching,
    error,
    switchToMonad: handleSwitchToMonad,
    targetChainId: monadTestnet.id,
    targetChainName: monadTestnet.name,
    isMobile,
    isMonadTestnet: chainId === monadTestnet.id
  };
}