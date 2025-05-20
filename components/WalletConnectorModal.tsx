'use client';

import React, { useState, Fragment, useEffect, useCallback } from 'react';
import { useConnect, useAccount, useDisconnect, useSwitchChain } from 'wagmi';
import { Dialog, Transition } from '@headlessui/react';
import { monadTestnet } from './frame-wallet-provider';

export default function WalletConnectorModal() {
  const [isConnecting, setIsConnecting] = useState(false);
  const { isConnected, address, chainId } = useAccount();
  const { connectAsync, connectors, error, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const isWrongNetwork = chainId !== monadTestnet.id;

  // Auto-connect function definition
  const autoConnect = useCallback(async () => {
    if (!isConnected && !isConnecting && !isPending) {
      setIsConnecting(true);
      try {
        if (connectors && connectors.length > 0) {
          const connector = connectors[0]; // Usually this is injected (MetaMask)
          await connectAsync({ connector });
        }
      } catch (error) {
        console.error('Auto-connect failed:', error);
      } finally {
        setIsConnecting(false);
      }
    }
  }, [connectAsync, connectors, isConnected, isConnecting, isPending]);
  
  // Auto-connect to wallet and Monad Testnet
  useEffect(() => {
    autoConnect();
  }, [autoConnect]);
  
  // Auto-switch to Monad Testnet when connected but on wrong network
  const handleSwitchNetwork = useCallback(async () => {
    if (isConnected && isWrongNetwork) {
      try {
        await switchChain({ chainId: monadTestnet.id });
      } catch (e) {
        console.error('Network switch failed:', e);
      }
    }
  }, [isConnected, isWrongNetwork, switchChain]);

  useEffect(() => {
    if (isConnected && isWrongNetwork) {
      handleSwitchNetwork();
    }
  }, [isConnected, isWrongNetwork, handleSwitchNetwork]);

  return (
    <>
      {isConnected ? (
        <div className="flex items-center gap-3">
          {isWrongNetwork ? (
            <button 
              onClick={handleSwitchNetwork}
              className="text-sm px-2 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
            >
              Switch to Monad
            </button>
          ) : (
            <span className="text-sm px-2 py-1 bg-green-600 text-white rounded-md">
              Monad
            </span>
          )}
          
          <span className="text-sm text-white">
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
          </span>
          
          <button
            onClick={() => disconnect()}
            className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={autoConnect}
          disabled={isPending || isConnecting}
          className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 disabled:opacity-75"
        >
          {isPending || isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
    </>
  );
} 