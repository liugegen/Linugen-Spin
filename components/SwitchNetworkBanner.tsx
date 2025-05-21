'use client';

import { useChainId, useSwitchChain } from 'wagmi';
import { monadTestnet } from './frame-wallet-provider';
import { useChainContext } from './frame-wallet-provider';
import { useEffect, useState, useCallback } from 'react';

const ALCHEMY_API_KEY = 'VgGmMpwLBn6YH_WOsb1819q6STgxEkF-';
const ALCHEMY_RPC_URL = `https://monad-testnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

export default function SwitchNetworkBanner() {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { targetChainId, needsChainSwitch } = useChainContext();
  const [showBanner, setShowBanner] = useState(false);
  const [switchAttempted, setSwitchAttempted] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);

  // Define handleSwitchNetwork as useCallback to avoid dependency cycle
  const handleSwitchNetwork = useCallback(async () => {
    if (isSwitching) return;
    
    setIsSwitching(true);
    setSwitchError(null);
    
    try {
      await switchChain({ 
        chainId: targetChainId,
        addEthereumChainParameter: {
          chainName: monadTestnet.name,
          nativeCurrency: monadTestnet.nativeCurrency,
          rpcUrls: [ALCHEMY_RPC_URL],
          blockExplorerUrls: [monadTestnet.blockExplorers.default.url]
        }
      });
      // Success, banner will disappear automatically after chain changes
    } catch (error: any) {
      console.error('Failed to switch network:', error);
      
      // More user-friendly error messages
      if (error?.message?.includes('wallet_addEthereumChain')) {
        setSwitchError('Please approve adding Monad Testnet in your wallet');
      } else if (error?.message?.includes('rejected')) {
        setSwitchError('You rejected the network switch. Try again when ready.');
      } else {
        setSwitchError(error?.message || 'Failed to switch network');
      }
    } finally {
      setIsSwitching(false);
    }
  }, [isSwitching, switchChain, targetChainId]);

  // Only show banner if we need to switch and user is connected
  useEffect(() => {
    if (chainId && needsChainSwitch(chainId)) {
      setShowBanner(true);
      // Reset error message if user successfully switched networks
      if (chainId === targetChainId && switchError) setSwitchError(null);
    } else {
      setShowBanner(false);
      setSwitchError(null);
    }
  }, [chainId, needsChainSwitch, switchError, targetChainId]);

  // Auto attempt switch on component mount, but only once
  useEffect(() => {
    if (showBanner && !switchAttempted) {
      handleSwitchNetwork();
      setSwitchAttempted(true);
    }
  }, [showBanner, switchAttempted, handleSwitchNetwork]);

  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-yellow-600 text-center p-3 shadow-lg">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-center gap-3">
        <p className="text-white font-semibold">
          <span className="animate-pulse inline-block mr-1">⚠️</span> 
          <span className="font-bold">Linugen Spin</span> requires <span className="font-bold bg-yellow-800 px-2 py-0.5 rounded">Monad Testnet</span>
        </p>
        <button
          onClick={handleSwitchNetwork}
          disabled={isSwitching}
          className={`${
            isSwitching 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-white text-yellow-800 hover:bg-yellow-100'
          } px-4 py-1.5 rounded-md font-semibold transition-colors`}
        >
          {isSwitching ? 'Switching...' : 'Switch to Monad Testnet'}
        </button>
        <p className="text-yellow-200 text-xs">
          Current Network: {chainId ? `${chainId} (Not Monad)` : 'Unknown'}
        </p>
      </div>
      
      {switchError && (
        <div className="mt-1 text-white bg-red-600 p-2 text-xs rounded-md max-w-md mx-auto">
          <p className="font-semibold mb-1">Error: {switchError}</p>
          <p>Please add and switch to Monad Testnet manually in your wallet settings.</p>
        </div>
      )}
    </div>
  );
} 