// components/LinugenSpinGame.tsx

'use client';

import React, { useState, useEffect, Fragment } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { useLinugenSpin } from '@/hooks/useLinugenSpin';
import { BadgeLevel } from '@/lib/contracts/LinugenSpin';
import { monadTestnet } from '@/components/frame-wallet-provider';
import { useChainContext } from './frame-wallet-provider';
import { useForceMonadChain } from '@/hooks/useForceMonadChain';
import { Dialog, Transition } from '@headlessui/react';
import { MONAD_EXPLORER_URL } from '@/hooks/useLinugenSpin';

// Countdown Timer Component
const CountdownTimer: React.FC<{ seconds: number }> = ({ seconds }) => {
  const [remainingTime, setRemainingTime] = useState<number>(seconds);
  
  // Format time as HH:MM:SS
  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Update countdown every second
  useEffect(() => {
    setRemainingTime(seconds);
    
    const timer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [seconds]);
  
  // Calculate progress percentage
  const hoursInDay = 24;
  const secondsInDay = hoursInDay * 60 * 60;
  const progress = Math.min(100, Math.max(0, 100 - (remainingTime / secondsInDay) * 100));
  
  // Get hours, minutes, seconds for display
  const hours = Math.floor(remainingTime / 3600);
  const minutes = Math.floor((remainingTime % 3600) / 60);
  const secs = remainingTime % 60;
  
  // Define background color based on time remaining
  const getTimeStyle = (value: number, isHour: boolean = false) => {
    // If less than 1 hour remaining, highlight the timer
    if (remainingTime < 3600) {
      return "bg-yellow-800/60"; 
    }
    // If less than 10 minutes remaining, make it more urgent
    if (remainingTime < 600 && !isHour) {
      return "bg-red-800/60";
    }
    return "bg-gray-800/60";
  };
  
  // Add pulsing animation when time is running low
  const isPulsing = remainingTime < 300; // Less than 5 minutes
  const pulseClass = isPulsing ? "animate-pulse" : "";
  
  return (
    <div className={`font-mono text-yellow-300 flex items-center gap-1.5 ${pulseClass}`}>
      <div className={`${getTimeStyle(hours, true)} px-1.5 py-0.5 rounded text-center min-w-[2ch]`}>
        {hours.toString().padStart(2, '0')}
      </div>
      <span>:</span>
      <div className={`${getTimeStyle(minutes)} px-1.5 py-0.5 rounded text-center min-w-[2ch]`}>
        {minutes.toString().padStart(2, '0')}
      </div>
      <span>:</span>
      <div className={`${getTimeStyle(secs)} px-1.5 py-0.5 rounded text-center min-w-[2ch]`}>
        {secs.toString().padStart(2, '0')}
      </div>
    </div>
  );
};

// Type definitions for SpinResultPopup props
interface SpinResultPopupProps {
  isOpen: boolean;
  closeModal: () => void;
  result: BadgeLevel | null;
  txHash: string | null;
}

// Popup Sukses component
const SpinResultPopup: React.FC<SpinResultPopupProps> = ({ isOpen, closeModal, result, txHash }) => {
  // Helper to determine if the spin result was successful or not
  const isWinResult = (value: BadgeLevel | null): boolean => {
    return value !== null && value !== BadgeLevel.None;
  };
  
  const getResultTitle = (): string => {
    if (!result && !txHash) return 'Waiting...';
    return isWinResult(result) ? 'Congratulations!' : 'No luck this time!';
  };
  
  const getBadgeRarity = (level: BadgeLevel): string => {
    switch (level) {
      case BadgeLevel.Gold: return 'Legendary';
      case BadgeLevel.Silver: return 'Rare';
      case BadgeLevel.Bronze: return 'Common';
      case BadgeLevel.None:
      default: return 'None';
    }
  };
  
  const getTxUrl = (hash: string): string => {
    if (!hash) return '#';
    return `${MONAD_EXPLORER_URL}/tx/${hash}`;
  };
  
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-900 border border-purple-800/30 p-5 sm:p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-xl sm:text-2xl font-bold leading-6 text-white mb-5 text-center"
                >
                  {getResultTitle()}
                </Dialog.Title>
                
                <div className="mt-2 text-center">
                  {isWinResult(result) ? (
                    <div className="mb-5 p-4 bg-gradient-to-br from-purple-900 to-indigo-900 rounded-lg border border-purple-500 shadow-md">
                      <div className={`w-24 h-24 mx-auto ${
                        result === BadgeLevel.Gold ? 'bg-yellow-500' :
                        result === BadgeLevel.Silver ? 'bg-gray-300' :
                        'bg-amber-800'
                      } rounded-full mb-3 flex items-center justify-center transform hover:scale-105 transition-transform duration-300`}>
                        <span className="text-5xl">
                          {result === BadgeLevel.Gold && '🏆'}
                          {result === BadgeLevel.Silver && '🥈'}
                          {result === BadgeLevel.Bronze && '🥉'}
                        </span>
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">
                        {result === BadgeLevel.Gold && 'Golden Relic'}
                        {result === BadgeLevel.Silver && 'Silver Sigil'}
                        {result === BadgeLevel.Bronze && 'Bronze Rune'}
                      </h4>
                      <div className="bg-purple-900/50 p-2 rounded-lg mb-3">
                        <span className="text-lg font-semibold text-white">
                          {result && getBadgeRarity(result)}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">
                        This NFT has been added to your collection!
                      </p>
                    </div>
                  ) : (
                    <div className="mb-5 p-4 bg-gray-800 rounded-lg shadow-md">
                      <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <span className="text-4xl">🎲</span>
                      </div>
                      <p className="text-gray-400 text-lg font-medium">Better luck next time!</p>
                      <p className="text-gray-500 text-sm mt-2">
                        Try again for a chance to win rare NFTs!
                      </p>
                    </div>
                  )}
                  
                  {txHash && (
                    <div className="mt-4 text-sm">
                      <p className="text-gray-400 mb-2">Transaction confirmed on <span className="text-purple-400">Monad Testnet</span>:</p>
                      <div className="bg-gray-800 p-2 rounded-lg mb-2 overflow-hidden shadow-inner">
                        <p className="truncate text-gray-400 text-xs">
                          {txHash}
                        </p>
                      </div>
                      <a 
                        href={getTxUrl(txHash)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-purple-600 hover:bg-purple-700 text-white py-2.5 px-4 rounded-md text-sm inline-block mt-2 transition-colors shadow-md active:bg-purple-800"
                      >
                        View on Monad Explorer
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-700 active:bg-purple-800 focus:outline-none transition-colors shadow-md"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

const LinugenSpinGame: React.FC = () => {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { targetChainId } = useChainContext();
    const { switchChain } = useSwitchChain();
    const { isWrongNetwork, switchToMonad } = useForceMonadChain();
    
    const {
        spinInfo,
        nftBalance,
        gameConstants,
        loading,
        error,
        handleSpin,
        handleBuySpins,
        formattedSpinPrice,
        getTransactionUrl,
        getBadgeName,
        getNFTStats,
        dailySpinStats,
        isDailySpinLimitReached,
        refetchSpinInfo,
        refetchNftBalance
    } = useLinugenSpin();

    const [spinning, setSpinning] = useState(false);
    const [lastResult, setLastResult] = useState<BadgeLevel | null>(null);
    const [buyAmount, setBuyAmount] = useState(1);
    const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [showResultPopup, setShowResultPopup] = useState(false);
    const [badges, setBadges] = useState({ bronze: 0, silver: 0, gold: 0 });
    const [refreshTimer, setRefreshTimer] = useState(0);
    
    // Local state to track spin counts (for responsive UI after spin)
    const [localFreeSpins, setLocalFreeSpins] = useState<number | null>(null);
    const [localPremiumSpins, setLocalPremiumSpins] = useState<number | null>(null);
    const [localSpinsUsed, setLocalSpinsUsed] = useState<number | null>(null);
    
    // Force refresh timer every second to show accurate countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setRefreshTimer(prev => prev + 1);
        }, 1000);
        
        return () => clearInterval(timer);
    }, []);
    
    // Update local state when remote data changes
    useEffect(() => {
        setLocalFreeSpins(dailySpinStats.remaining);
        setLocalSpinsUsed(dailySpinStats.used);
    }, [dailySpinStats]);
    
    useEffect(() => {
        if (spinInfo && spinInfo.premiumSpinsRemaining !== undefined) {
            setLocalPremiumSpins(Number(spinInfo.premiumSpinsRemaining));
        }
    }, [spinInfo]);
    
    // Safe values to handle potential undefined values - menggunakan state lokal jika tersedia
    const freeSpins = localFreeSpins !== null ? localFreeSpins : dailySpinStats.remaining;
    const premiumSpins = localPremiumSpins !== null ? localPremiumSpins : (spinInfo && spinInfo.premiumSpinsRemaining !== undefined 
        ? Number(spinInfo.premiumSpinsRemaining) 
        : 0);
    
    const freeSpinsPerDay = dailySpinStats.total;
    
    // Calculate spins used today
    const spinsUsedToday = localSpinsUsed !== null ? localSpinsUsed : dailySpinStats.used;
    
    // Check if daily spin limit is reached
    const dailySpinLimitReached = freeSpins <= 0;
    
    // Update badge collection stats
    useEffect(() => {
        const updateNFTStats = async () => {
            if (address) {
                const stats = await getNFTStats();
                if (stats) {
                    setBadges({
                        bronze: stats.bronze || 0,
                        silver: stats.silver || 0,
                        gold: stats.gold || 0
                    });
                }
            }
        };
        
        updateNFTStats();
    }, [address, nftBalance, getNFTStats]);
    
    // Hide welcome message after 15 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowWelcomeMessage(false);
        }, 15000);
        
        return () => clearTimeout(timer);
    }, []);

    // Function to close result popup
    const closeResultPopup = () => {
        setShowResultPopup(false);
    };

    // Log ketika user melakukan spin
    const logSpinAction = (action: string, details: any) => {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[SPIN ${action}]`, details);
        }
    };

    // Forceably update the spin counts immediately in UI (without waiting for state update)
    const forceUpdateSpinCountsInUI = (useFreeSpins: boolean) => {
        const newFreeSpins = useFreeSpins ? Math.max(0, freeSpins - 1) : freeSpins;
        const newPremiumSpins = !useFreeSpins ? Math.max(0, premiumSpins - 1) : premiumSpins;
        const newSpinsUsed = useFreeSpins ? spinsUsedToday + 1 : spinsUsedToday;
        
        // First update React state
        setLocalFreeSpins(newFreeSpins);
        setLocalSpinsUsed(newSpinsUsed);
        setLocalPremiumSpins(newPremiumSpins);
        
        // Then direct DOM manipulation for immediate visual feedback
        try {
            const freeSpinElement = document.getElementById('free-spin-count');
            if (freeSpinElement) {
                freeSpinElement.textContent = `${newFreeSpins} / ${freeSpinsPerDay}`;
                
                if (useFreeSpins) {
                    // Visual feedback animation for decreasing free spins
                    freeSpinElement.classList.add('text-red-400');
                    setTimeout(() => {
                        freeSpinElement.classList.remove('text-red-400');
                    }, 1000);
                }
            }
            
            const spinsUsedElement = document.getElementById('spins-used-today');
            if (spinsUsedElement) {
                spinsUsedElement.textContent = `${newSpinsUsed}`;
                
                if (useFreeSpins) {
                    // Visual feedback animation for increasing used spins
                    spinsUsedElement.classList.add('text-green-400');
                    setTimeout(() => {
                        spinsUsedElement.classList.remove('text-green-400');
                    }, 1000);
                }
            }
            
            const premiumSpinElement = document.getElementById('premium-spin-count');
            if (premiumSpinElement && !useFreeSpins) {
                premiumSpinElement.textContent = `${newPremiumSpins}`;
                
                // Visual feedback animation for decreasing premium spins
                premiumSpinElement.classList.add('text-red-400');
                setTimeout(() => {
                    premiumSpinElement.classList.remove('text-red-400');
                }, 1000);
            }
            
            // Update progress bar
            const progressBar = document.getElementById('free-spin-progress');
            if (progressBar instanceof HTMLElement) {
                const newWidth = `${Math.max(0, Math.min(100, (newFreeSpins / freeSpinsPerDay) * 100))}%`;
                progressBar.style.width = newWidth;
                
                if (useFreeSpins) {
                    // Pulse animation for progress bar
                    progressBar.classList.add('animate-pulse');
                    setTimeout(() => {
                        progressBar.classList.remove('animate-pulse');
                    }, 1000);
                }
            }
            
            // Update spin button text to reflect new state
            updateSpinButtonText();
        } catch (e) {
            console.error('Error updating DOM elements:', e);
        }
        
        // Log the update for debugging
        logSpinAction('FORCED_UPDATE', {
            newFreeSpins,
            newPremiumSpins,
            newSpinsUsed,
            usedFreeSpins: useFreeSpins
        });
    };
    
    // Update spin button text based on the current state
    const updateSpinButtonText = () => {
        const buttonElement = document.getElementById('spin-button');
        if (!buttonElement) return;
        
        let text = '';
        if (isWrongNetwork) {
            text = 'Switch to Monad';
        } else if (spinning) {
            text = 'Spinning...';
        } else if (freeSpins > 0) {
            text = `Free Spin (${freeSpins} left)`;
        } else if (premiumSpins > 0) {
            text = `Premium Spin (${premiumSpins} left)`;
        } else if (dailySpinLimitReached) {
            text = `Limit Reached (Reset in ${Math.floor(dailySpinStats.timeToNextReset / 3600)}h)`;
        } else {
            text = 'No Spins Available';
        }
        
        buttonElement.textContent = text;
    };

    // Force switch to Monad when connected
    useEffect(() => {
        if (isConnected && isWrongNetwork && !spinning) {
            // Coba switch ke Monad otomatis saat baru terhubung
            switchToMonad();
        }
    }, [isConnected, isWrongNetwork, spinning, switchToMonad]);

    // Reset local state when there is a successful transaction
    useEffect(() => {
        if (txHash) {
            // Setelah transaksi selesai, refetch data dari blockchain dan reset state lokal
            const fetchDataAndResetLocal = async () => {
                await refetchSpinInfo();
                await refetchNftBalance();
                // Reset local state to null to use data from server
                setLocalFreeSpins(null);
                setLocalPremiumSpins(null);
                setLocalSpinsUsed(null);
            };
            
            // Tunggu beberapa saat agar transaksi tercatat di blockchain
            const timer = setTimeout(() => {
                fetchDataAndResetLocal();
            }, 3000);
            
            return () => clearTimeout(timer);
        }
    }, [txHash, refetchSpinInfo, refetchNftBalance]);

    // Log for debugging state changes
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log('State spin updated:', {
                freeSpins,
                localFreeSpins,
                premiumSpins,
                localPremiumSpins,
                spinsUsedToday,
                localSpinsUsed,
                dailySpinLimitReached
            });
        }
    }, [freeSpins, localFreeSpins, premiumSpins, localPremiumSpins, spinsUsedToday, localSpinsUsed, dailySpinLimitReached]);

    // Not connected state
    if (!isConnected) {
        return (
            <div className="max-w-md mx-auto p-6 bg-gray-900 rounded-lg shadow-lg border border-purple-800/30">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4 text-white">Connect Wallet</h2>
                    <p className="text-gray-300 mb-6">Please connect your wallet to play Linugen Spin!</p>
                    <div className="bg-purple-900/30 p-4 rounded-lg mb-4">
                        <p className="text-purple-300 text-sm">
                            Get 10 free spins every day and collect rare NFT badges on Monad Testnet!
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Force canSpin to be true if premium spins are available
    const canSpin = !dailySpinLimitReached || premiumSpins > 0;
    
    // Get spin button text based on state
    const getSpinButtonText = () => {
        if (isWrongNetwork) return 'Switch to Monad';
        if (spinning) return 'Spinning...';
        
        if (freeSpins > 0) return `Free Spin (${freeSpins} left)`;
        if (premiumSpins > 0) return `Premium Spin (${premiumSpins} left)`;
        if (dailySpinLimitReached) return `Limit Reached (Reset in ${Math.floor(dailySpinStats.timeToNextReset / 3600)}h)`;
        
        return 'No Spins Available';
    };

    // Update progress bar width calculation berdasarkan free spins
    const freeSpinsProgressWidth = `${Math.max(0, Math.min(100, (freeSpins / freeSpinsPerDay) * 100))}%`;

    // Spin function with blockchain result
    const onSpin = async () => {
        // Jika sedang dalam proses spin, jangan lakukan apa-apa
        if (spinning) return;
        
        // Jika tidak bisa spin (limit harian tercapai dan tidak ada premium)
        if (!canSpin) {
            // Tampilkan popup dengan pesan khusus limit tercapai
            setLastResult(BadgeLevel.None);
            setTxHash(null);
            setShowResultPopup(true);
            return;
        }

        // Log status awal
        if (process.env.NODE_ENV === 'development') {
            console.log('[SPIN START]', { freeSpins, premiumSpins, spinsUsedToday, canSpin });
        }

        // Determine if we're using free spins or premium spins
        const useFreeSpins = freeSpins > 0;
        
        // IMMEDIATELY update UI for instant feedback
        forceUpdateSpinCountsInUI(useFreeSpins);

        setSpinning(true);
        setLastResult(null);
        setTxHash(null);
        
        try {
            const result = await handleSpin();
            console.log('Spin result:', result);
            
            if (result) {
                // Blockchain result
                setLastResult(result.badgeLevel);
                setTxHash(result.txHash);
                
                // Show result popup
                setShowResultPopup(true);
                
                // Continue refreshing data from server to ensure consistency
                setTimeout(() => {
                    refetchSpinInfo();
                    refetchNftBalance();
                }, 1000);
            }
        } catch (err) {
            console.error('Spin failed:', err);
            // Jika terjadi error, kembalikan state lokal
            setLocalFreeSpins(null);
            setLocalPremiumSpins(null);
            setLocalSpinsUsed(null);
            
            // Tampilkan error dalam popup juga
            setLastResult(BadgeLevel.None);
            setShowResultPopup(true);
        } finally {
            setSpinning(false);
        }
    };

    // Buy spins function with immediate UI feedback
    const onBuySpins = async () => {
        if (buyAmount <= 0) {
            return;
        }
        
        try {
            // Calculate new premium spins count
            const spinAmount = Math.floor(buyAmount);
            const newPremiumSpins = premiumSpins + spinAmount;
            
            // First update React state
            setLocalPremiumSpins(newPremiumSpins);
            
            // Then direct DOM update for immediate visual feedback
            try {
                const premiumSpinElement = document.getElementById('premium-spin-count');
                if (premiumSpinElement) {
                    premiumSpinElement.textContent = `${newPremiumSpins}`;
                    
                    // Visual feedback animation for increasing premium spins
                    premiumSpinElement.classList.add('text-green-400');
                    setTimeout(() => {
                        premiumSpinElement.classList.remove('text-green-400');
                    }, 1000);
                }
                
                // Also update spin button text to reflect availability of premium spins
                updateSpinButtonText();
            } catch (e) {
                console.error('Error updating DOM elements:', e);
            }
            
            // Log for debugging
            if (process.env.NODE_ENV === 'development') {
                console.log('[BUY SPINS]', {
                    bought: spinAmount,
                    oldPremiumSpins: premiumSpins,
                    newPremiumSpins,
                });
            }
            
            // Execute blockchain transaction
            await handleBuySpins(buyAmount);
            
            // Reset amount to 1 for next purchase
            setBuyAmount(1);
            
            // Refresh data from blockchain after delay
            setTimeout(() => {
                refetchSpinInfo();
            }, 1000);
        } catch (err) {
            // Revert state in case of error
            setLocalPremiumSpins(null);
            console.error('Buy spins failed:', err);
        }
    };

    return (
        <div className="max-w-md mx-auto p-4 sm:p-6 bg-gray-900 rounded-lg shadow-lg border border-purple-800/30 overflow-hidden">
            {/* Spin Result Popup */}
            <SpinResultPopup 
                isOpen={showResultPopup} 
                closeModal={closeResultPopup} 
                result={lastResult} 
                txHash={txHash}
            />
            
            {isWrongNetwork && (
                <div className="mb-5 p-4 bg-yellow-900/40 rounded-lg border border-yellow-500/50 text-center">
                    <p className="text-yellow-300 text-sm mb-2">
                        Please switch to <span className="font-bold">Monad Testnet</span> to play!
                    </p>
                    <button
                        onClick={switchToMonad}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2.5 px-5 rounded-md text-sm transition-colors"
                    >
                        Switch to Monad Testnet
                    </button>
                </div>
            )}
            
            {showWelcomeMessage && !isWrongNetwork && (
                <div className="mb-5 p-4 bg-gradient-to-br from-purple-900 to-indigo-900 rounded-lg border-2 border-purple-500 text-center animate-pulse shadow-lg">
                    <h3 className="font-bold text-xl text-white mb-2">🎉 Welcome! 🎉</h3>
                    <div className="bg-purple-900/50 p-3 rounded-lg mb-2">
                        <span className="text-2xl font-bold text-green-300">10 FREE SPINS</span>
                    </div>
                    <p className="text-purple-200 text-sm">
                        You get <span className="font-bold">10 free spins</span> every day!<br/>
                        Use them to collect awesome NFT badges.
                    </p>
                </div>
            )}
            
            <div className="text-center mb-5">
                <h1 className="text-2xl sm:text-3xl font-bold text-purple-400 mb-2">Linugen Spin</h1>
                <p className="text-gray-300 text-sm sm:text-base">
                    Free spins <span className="text-yellow-300">{freeSpinsPerDay}x</span> daily! Remaining today: <span className="text-green-400 font-bold">{freeSpins}</span>
                </p>
                
                {/* Daily reset tracker */}
                <p className="text-xs text-gray-400 mt-1">
                    Next reset: <span className="text-yellow-300">{dailySpinStats.formattedNextReset}</span>
                </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 mb-5 border border-purple-700/20 shadow-sm">
                <h3 className="font-semibold mb-3 text-white">Your Spins</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-800/60 p-3 rounded-lg">
                        <span className="text-gray-400">Free Spins:</span>
                        <div className="font-bold text-green-400 text-lg" id="free-spin-count">
                            {freeSpins} / {freeSpinsPerDay}
                        </div>
                        <div className="flex items-center mt-1.5">
                            <div className="bg-gray-700 h-2 rounded-full w-full overflow-hidden">
                                <div 
                                    id="free-spin-progress"
                                    className="bg-green-500 h-full rounded-full transition-all duration-300"
                                    style={{ width: freeSpinsProgressWidth }}
                                ></div>
                            </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            Used today: <span className="text-yellow-400" id="spins-used-today">{spinsUsedToday}</span>
                        </div>
                    </div>
                    <div className="bg-gray-800/60 p-3 rounded-lg">
                        <span className="text-gray-400">Premium Spins:</span>
                        <div className="font-bold text-blue-400 text-lg" id="premium-spin-count">
                            {premiumSpins}
                        </div>
                        {premiumSpins > 0 && (
                            <div className="text-xs text-gray-500 mt-2">
                                Never expire!
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Next reset time information with realtime countdown */}
                <div className="mt-4 pt-3 border-t border-gray-700">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">Reset In:</span>
                        <div className="text-xs">
                            <CountdownTimer seconds={dailySpinStats.timeToNextReset} />
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-400">Reset At:</span>
                        <span className="text-xs text-yellow-300 font-medium">
                            {dailySpinStats.formattedNextReset}
                        </span>
                    </div>
                </div>
                
                {/* Daily limit reached warning */}
                {dailySpinLimitReached && freeSpins <= 0 && premiumSpins <= 0 && (
                    <div className="mt-3 p-3 bg-yellow-900/30 border border-yellow-800 rounded text-center">
                        <div className="flex items-center justify-center mb-1">
                            <span className="text-yellow-500 text-lg mr-2">⚠️</span>
                            <span className="text-yellow-400 font-semibold">Spin Limit Reached Today</span>
                        </div>
                        <p className="text-sm text-yellow-300">
                            Free spins reset at 00:00 UTC
                        </p>
                        <div className="mt-2 bg-yellow-950/50 p-1.5 rounded text-xs">
                            <div className="flex justify-between items-center">
                                <span>Time until reset:</span>
                                <CountdownTimer seconds={dailySpinStats.timeToNextReset} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="text-center mb-6">
                <div className={`relative inline-block ${spinning ? 'animate-spin' : ''}`}>
                    <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br from-purple-700 to-purple-400 rounded-full flex items-center justify-center cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-900 rounded-full flex items-center justify-center border-4 border-purple-700">
                            <span className="text-2xl font-bold text-purple-300">
                                {spinning ? '🎲' : '🎰'}
                            </span>
                        </div>
                    </div>
                </div>
                <button
                    id="spin-button"
                    onClick={isWrongNetwork ? switchToMonad : onSpin}
                    disabled={(!canSpin && !isWrongNetwork) || loading || spinning}
                    className={`mt-4 px-8 py-3.5 rounded-lg font-semibold transition-all duration-200 text-white shadow-md
                        ${isWrongNetwork 
                            ? 'bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800' 
                            : dailySpinLimitReached && premiumSpins <= 0
                                ? 'bg-gray-600 cursor-not-allowed opacity-70'
                                : freeSpins > 0 
                                    ? 'bg-green-600 hover:bg-green-700 active:bg-green-800' 
                                    : premiumSpins > 0
                                        ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                                        : 'bg-gray-600 cursor-not-allowed opacity-70'
                        }`}
                >
                    {getSpinButtonText()}
                </button>
                
                {/* Error atau info message */}
                {!canSpin && !isWrongNetwork && (
                    <p className="mt-2 text-red-400 text-sm">
                        {dailySpinLimitReached 
                            ? `Free spins reset ${dailySpinStats.formattedNextReset}`
                            : 'No spins available! Buy premium spins below.'}
                    </p>
                )}
            </div>

            <div className="border-t border-purple-800 pt-5 mt-2">
                <h3 className="font-semibold mb-3 text-white">Buy Premium Spins</h3>
                <div className="text-sm text-gray-400 mb-2">
                    Price: <span className="text-blue-400 font-medium">{formattedSpinPrice} MON</span> per spin
                </div>
                <div className="flex items-center gap-2 mb-3">
                    <input
                        type="number"
                        min="0.001"
                        step="0.001"
                        value={buyAmount}
                        onChange={(e) => setBuyAmount(parseFloat(e.target.value) || 0)}
                        className="flex-1 px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-700 bg-gray-900 text-white border-purple-700 shadow-inner"
                        placeholder="Amount"
                    />
                    <button
                        onClick={isWrongNetwork ? switchToMonad : onBuySpins}
                        disabled={(buyAmount <= 0) || loading}
                        className="px-5 py-3 bg-blue-700 text-white rounded-lg font-semibold disabled:bg-gray-600 disabled:opacity-70 hover:bg-blue-800 active:bg-blue-900 transition-colors shadow-md"
                    >
                        {isWrongNetwork ? 'Switch Network' : loading ? 'Processing...' : 'Buy'}
                    </button>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between text-xs p-2 bg-gray-800/60 rounded-lg">
                    <div className="text-gray-500 mb-1 sm:mb-0">
                        Total cost: <span className="text-blue-400">{(parseFloat(formattedSpinPrice) * buyAmount).toFixed(4)} MON</span>
                    </div>
                    <div className="text-gray-500">
                        You get: <span className="text-blue-400">{Math.floor(buyAmount)} spins</span>
                    </div>
                </div>
            </div>

            <div className="border-t border-purple-800 pt-5 mt-6">
                <h3 className="font-semibold mb-3 text-white">Your Collection</h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-gray-800/70 hover:bg-gray-800 rounded-lg p-3 transition-all duration-200 transform hover:scale-105 hover:shadow-md">
                        <div className="w-12 h-12 mx-auto bg-amber-900/40 rounded-full flex items-center justify-center mb-2">
                            <span className="text-xl">🥉</span>
                        </div>
                        <div className="text-orange-400 font-bold">{badges.bronze}</div>
                        <div className="text-xs text-gray-400">Bronze</div>
                    </div>
                    <div className="bg-gray-800/70 hover:bg-gray-800 rounded-lg p-3 transition-all duration-200 transform hover:scale-105 hover:shadow-md">
                        <div className="w-12 h-12 mx-auto bg-gray-500/20 rounded-full flex items-center justify-center mb-2">
                            <span className="text-xl">🥈</span>
                        </div>
                        <div className="text-gray-300 font-bold">{badges.silver}</div>
                        <div className="text-xs text-gray-400">Silver</div>
                    </div>
                    <div className="bg-gray-800/70 hover:bg-gray-800 rounded-lg p-3 transition-all duration-200 transform hover:scale-105 hover:shadow-md">
                        <div className="w-12 h-12 mx-auto bg-yellow-500/20 rounded-full flex items-center justify-center mb-2">
                            <span className="text-xl">🏆</span>
                        </div>
                        <div className="text-yellow-400 font-bold">{badges.gold}</div>
                        <div className="text-xs text-gray-400">Gold</div>
                    </div>
                </div>
                <div className="mt-3 text-gray-400 text-center text-sm">
                    Total NFTs: <span className="text-purple-300 font-medium">{nftBalance ? Number(nftBalance) : 0}</span>
                </div>
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-900/40 border border-red-700 rounded-lg text-red-300 text-sm">
                    {error}
                </div>
            )}
        </div>
    );
};

export default LinugenSpinGame;