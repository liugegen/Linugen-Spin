// hooks/useForceMonadChain.ts

'use client';

import { useEffect, useState } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { monadTestnet } from '@/components/frame-wallet-provider';

export function useForceMonadChain() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [switchCount, setSwitchCount] = useState(0);

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
      await switchChain({ chainId: monadTestnet.id });
      console.log('Successfully switched to Monad Testnet');
    } catch (err: any) {
      console.error('Failed to switch to Monad Testnet:', err);
      setError(err?.message || 'Failed to switch network');
      
      // Increment switch attempt counter
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
    targetChainName: monadTestnet.name
  };
}