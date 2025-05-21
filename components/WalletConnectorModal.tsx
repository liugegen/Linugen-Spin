'use client';

import React, { useState, Fragment, useEffect, useCallback } from 'react';
import { useConnect, useAccount, useDisconnect, useSwitchChain } from 'wagmi';
import { Dialog, Transition } from '@headlessui/react';
import { monadTestnet } from './frame-wallet-provider';

const ALCHEMY_API_KEY = 'VgGmMpwLBn6YH_WOsb1819q6STgxEkF-';
const ALCHEMY_RPC_URL = `https://monad-testnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

export default function WalletConnectorModal() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { isConnected, address, chainId } = useAccount();
  const { connectAsync, connectors, error, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const isWrongNetwork = chainId !== monadTestnet.id;

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      setIsMobile(mobileRegex.test(userAgent));
    };
    checkMobile();
  }, []);

  // Auto-connect function definition
  const autoConnect = useCallback(async () => {
    if (!isConnected && !isConnecting && !isPending) {
      setIsConnecting(true);
      try {
        if (connectors && connectors.length > 0) {
          // For mobile, prefer injected connector
          const connector = connectors.find(c => c.id === 'injected') || connectors[0];
          
          // Add delay for mobile devices
          if (isMobile) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
          await connectAsync({ 
            connector
          });
        }
      } catch (error: any) {
        console.error('Auto-connect failed:', error);
        // Enhanced error handling for mobile
        if (isMobile && error?.message) {
          if (error.message.includes('user rejected')) {
            console.warn('User rejected connection in mobile wallet');
          } else if (error.message.includes('timeout')) {
            console.warn('Connection timed out on mobile device');
          }
        }
      } finally {
        setIsConnecting(false);
      }
    }
  }, [connectAsync, connectors, isConnected, isConnecting, isPending, isMobile]);
  
  // Auto-connect to wallet and Monad Testnet
  useEffect(() => {
    autoConnect();
  }, [autoConnect]);
  
  // Auto-switch to Monad Testnet when connected but on wrong network
  const handleSwitchNetwork = useCallback(async () => {
    if (isConnected && isWrongNetwork) {
      try {
        // Add delay for mobile devices
        if (isMobile) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        await switchChain({ 
          chainId: monadTestnet.id,
          addEthereumChainParameter: {
            chainName: monadTestnet.name,
            nativeCurrency: monadTestnet.nativeCurrency,
            rpcUrls: [ALCHEMY_RPC_URL],
            blockExplorerUrls: [monadTestnet.blockExplorers.default.url]
          }
        });
      } catch (e: any) {
        console.error('Network switch failed:', e);
        // Enhanced error handling for mobile
        if (isMobile && e?.message) {
          if (e.message.includes('user rejected')) {
            console.warn('User rejected network switch in mobile wallet');
          } else if (e.message.includes('timeout')) {
            console.warn('Network switch timed out on mobile device');
          }
        }
      }
    }
  }, [isConnected, isWrongNetwork, switchChain, isMobile]);

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
              {isMobile ? 'Switch in Wallet' : 'Switch to Monad'}
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