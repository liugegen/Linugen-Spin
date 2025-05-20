// hooks/useLinugenSpin.ts

'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { LINUGEN_SPIN_ABI, CONTRACT_ADDRESS, SpinInfo, GameConstants, BadgeLevel } from '@/lib/contracts/LinugenSpin';

// Extended result type for spin result
export interface SpinResult {
    badgeLevel: BadgeLevel;
    txHash: string;
}

// Type for daily spin tracking
export interface DailySpinStats {
    used: number;
    remaining: number;
    total: number;
    nextResetTime: Date | null;
    formattedNextReset: string;
    timeToNextReset: number; // seconds until next reset
}

// Constants
export const MONAD_EXPLORER_URL = 'https://testnet.monadexplorer.com';

// Helper functions for explorer links
export const getTransactionUrl = (txHash: string): string => {
    return `${MONAD_EXPLORER_URL}/tx/${txHash}`;
};

export const getAddressUrl = (address: string): string => {
    return `${MONAD_EXPLORER_URL}/address/${address}`;
};

export const useLinugenSpin = () => {
    const { address } = useAccount();
    const { writeContract } = useWriteContract();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [latestTxHash, setLatestTxHash] = useState<`0x${string}` | undefined>();
    const [dailySpinStats, setDailySpinStats] = useState<DailySpinStats>({
        used: 0,
        remaining: 10,
        total: 10,
        nextResetTime: null,
        formattedNextReset: '',
        timeToNextReset: 24 * 60 * 60 // default 24 hours
    });

    // Wait for transaction receipt
    const { isLoading: isConfirming, data: txReceipt } = useWaitForTransactionReceipt({
        hash: latestTxHash,
    });

    // Read contract functions
    const { data: spinInfoFromContract, refetch: refetchSpinInfo } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: LINUGEN_SPIN_ABI,
        functionName: 'getSpinInfo',
        args: address ? [address] : undefined,
        query: { enabled: !!address }
    }) as { data: SpinInfo | undefined, refetch: () => void };

    // Fallback if data is not yet available - ALWAYS give 10 free spins for new users
    // If spinInfoFromContract is undefined or null, provide default 10 free spins
    const spinInfo: SpinInfo | undefined = spinInfoFromContract || (address ? {
        freeSpinsRemaining: BigInt(10),
        premiumSpinsRemaining: BigInt(0),
        timeUntilNextReset: BigInt(24 * 60 * 60) // 24 hours
    } : undefined);

    // Double check that spinInfo is not undefined and provide default values if undefined
    // This is to handle potential NaN values
    const safeSpinInfo: SpinInfo | undefined = spinInfo 
        ? {
            freeSpinsRemaining: spinInfo.freeSpinsRemaining || BigInt(10),
            premiumSpinsRemaining: spinInfo.premiumSpinsRemaining || BigInt(0),
            timeUntilNextReset: spinInfo.timeUntilNextReset || BigInt(24 * 60 * 60)
        } 
        : address 
            ? {
                freeSpinsRemaining: BigInt(10),
                premiumSpinsRemaining: BigInt(0),
                timeUntilNextReset: BigInt(24 * 60 * 60)
            } 
            : undefined;

    const { data: spinPrice } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: LINUGEN_SPIN_ABI,
        functionName: 'SPIN_PRICE',
    }) as { data: bigint | undefined };

    const { data: freeSpinsPerDay } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: LINUGEN_SPIN_ABI,
        functionName: 'FREE_SPINS_PER_DAY',
    }) as { data: bigint | undefined };

    const { data: nftBalance, refetch: refetchNftBalance } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: LINUGEN_SPIN_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: { enabled: !!address }
    }) as { data: bigint | undefined, refetch: () => void };

    // Update daily spin stats whenever spinInfo changes
    useEffect(() => {
        if (!safeSpinInfo || !freeSpinsPerDay) return;

        const total = Number(freeSpinsPerDay);
        const remaining = Number(safeSpinInfo.freeSpinsRemaining);
        const used = total - remaining;
        
        // Calculate next reset time in UTC
        const nextResetSeconds = Number(safeSpinInfo.timeUntilNextReset);
        const nextResetTime = new Date();
        nextResetTime.setSeconds(nextResetTime.getSeconds() + nextResetSeconds);
        
        // Format next reset time
        const formattedNextReset = formatNextResetTime(nextResetTime);
        
        setDailySpinStats({
            used,
            remaining,
            total,
            nextResetTime,
            formattedNextReset,
            timeToNextReset: nextResetSeconds
        });
    }, [safeSpinInfo, freeSpinsPerDay]);

    // Update timer every second
    useEffect(() => {
        const timer = setInterval(() => {
            setDailySpinStats(prev => {
                if (prev.timeToNextReset <= 0) {
                    // Trigger a refresh when timer reaches zero
                    refetchSpinInfo();
                    return prev;
                }
                
                const newTimeToReset = prev.timeToNextReset - 1;
                const nextResetTime = new Date();
                nextResetTime.setSeconds(nextResetTime.getSeconds() + newTimeToReset);
                
                return {
                    ...prev,
                    timeToNextReset: newTimeToReset,
                    nextResetTime,
                    formattedNextReset: formatNextResetTime(nextResetTime)
                };
            });
        }, 1000);
        
        return () => clearInterval(timer);
    }, [refetchSpinInfo]);

    // Format next reset time to show in UTC
    const formatNextResetTime = (date: Date): string => {
        try {
            // Show time in UTC format with date if it's tomorrow
            const now = new Date();
            const isToday = date.getUTCDate() === now.getUTCDate() && 
                           date.getUTCMonth() === now.getUTCMonth() &&
                           date.getUTCFullYear() === now.getUTCFullYear();
            
            // Format: "Today at HH:MM UTC" or "Tomorrow at HH:MM UTC"
            return `${isToday ? 'Today' : 'Tomorrow'} at ${date.getUTCHours().toString().padStart(2, '0')}:${date.getUTCMinutes().toString().padStart(2, '0')} UTC`;
        } catch (e) {
            console.error('Error formatting date:', e);
            return 'Soon';
        }
    };

    // Format remaining time as countdown
    const formatCountdown = (): string => {
        const seconds = dailySpinStats.timeToNextReset;
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Check if daily free spins are exhausted
    const isDailySpinLimitReached = (): boolean => {
        return dailySpinStats.remaining <= 0;
    };

    // Read NFT statistics for a user
    const getNFTStats = async () => {
        if (!address) return null;
        
        try {
            // Read NFT data from the contract for each badge level
            const bronzeCount = await readBadgeCount(BadgeLevel.Bronze);
            const silverCount = await readBadgeCount(BadgeLevel.Silver);
            const goldCount = await readBadgeCount(BadgeLevel.Gold);
            
            return {
                bronze: Number(bronzeCount || 0),
                silver: Number(silverCount || 0),
                gold: Number(goldCount || 0)
            };
        } catch (err) {
            console.error('Failed to get NFT stats:', err);
            return {
                bronze: 0,
                silver: 0,
                gold: 0
            };
        }
    };
    
    // Helper to read specific badge count
    const readBadgeCount = async (badgeLevel: BadgeLevel): Promise<number> => {
        // Simulation of blockchain data based on nftBalance
        // In a real implementation, this would call the contract to get data
        
        // Distribution:
        // - Bronze: 70% of total NFTs
        // - Silver: 25% of total NFTs
        // - Gold: 5% of total NFTs
        if (!nftBalance) return 0;
        
        const totalNFTs = Number(nftBalance);
        
        switch (badgeLevel) {
            case BadgeLevel.Bronze:
                return Math.floor(totalNFTs * 0.7);
            case BadgeLevel.Silver:
                return Math.floor(totalNFTs * 0.25);
            case BadgeLevel.Gold:
                return Math.floor(totalNFTs * 0.05);
            default:
                return 0;
        }
    };

    // Determine badge level from transaction receipt
    const getBadgeLevelFromTransaction = (txHash: string): Promise<BadgeLevel> => {
        // In a real implementation, we would read logs from the transaction
        // to determine which badge the user received.
        
        // For simulation, we use probability
        return new Promise((resolve) => {
            const randomResult = Math.random();
            let badgeLevel = BadgeLevel.None;
            
            if (randomResult <= 0.01) badgeLevel = BadgeLevel.Gold;
            else if (randomResult <= 0.11) badgeLevel = BadgeLevel.Silver;
            else if (randomResult <= 0.36) badgeLevel = BadgeLevel.Bronze;
            
            resolve(badgeLevel);
        });
    };

    // Spin function
    const handleSpin = async (): Promise<SpinResult | null> => {
        if (!address) return null;
        
        // Verify if user has spins available
        if (safeSpinInfo && Number(safeSpinInfo.freeSpinsRemaining) <= 0 && Number(safeSpinInfo.premiumSpinsRemaining) <= 0) {
            setError('No spins available! Either buy premium spins or wait until the next reset at 00:00 UTC.');
            return null;
        }
        
        setLoading(true);
        setError(null);
        
        return new Promise<SpinResult | null>((resolve, reject) => {
            try {
                writeContract({
                    address: CONTRACT_ADDRESS,
                    abi: LINUGEN_SPIN_ABI,
                    functionName: 'spin',
                }, {
                    onSuccess: async (hash) => {
                        setLatestTxHash(hash);
                        
                        // In a real implementation, we would read results from blockchain events
                        try {
                            // Simulate reading data from blockchain
                            // Wait a bit to simulate blockchain time
                            await new Promise(r => setTimeout(r, 1500));
                            
                            // Get badge level from transaction
                            const badgeLevel = await getBadgeLevelFromTransaction(hash);
                            
                            const result: SpinResult = {
                                badgeLevel,
                                txHash: hash
                            };
                            
                            // Pre-emptively update spin counts to ensure immediate UI feedback
                            // This will be updated accurately when refetchSpinInfo() below
                            if (safeSpinInfo) {
                                if (Number(safeSpinInfo.freeSpinsRemaining) > 0) {
                                    // Update stats for free spin usage
                                    setDailySpinStats(prev => ({
                                        ...prev,
                                        remaining: Math.max(0, prev.remaining - 1),
                                        used: Math.min(prev.total, prev.used + 1)
                                    }));
                                }
                            }
                            
                            // Refresh data
                            refetchSpinInfo();
                            refetchNftBalance();
                            
                            setLoading(false);
                            resolve(result);
                        } catch (err) {
                            console.error('Error processing transaction:', err);
                            setError('Error processing spin results. Please check your transaction.');
                            setLoading(false);
                            reject(err);
                        }
                    },
                    onError: (err) => {
                        setError(err.message || 'Spin failed');
                        setLoading(false);
                        reject(err);
                    }
                });
            } catch (err: any) {
                setError(err.message || 'Spin failed');
                setLoading(false);
                reject(err);
            }
        });
    };

    // Buy spins function
    const handleBuySpins = async (amount: number) => {
        if (!address || !spinPrice) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const value = spinPrice * BigInt(Math.floor(amount * 1000)) / BigInt(1000);
            
            writeContract({
                address: CONTRACT_ADDRESS,
                abi: LINUGEN_SPIN_ABI,
                functionName: 'buySpins',
                value,
            }, {
                onSuccess: (hash) => {
                    setLatestTxHash(hash);
                    // Refresh immediately to show updated premium spin count
                    setTimeout(() => {
                        refetchSpinInfo();
                    }, 1000);
                },
                onError: (err) => {
                    setError(err.message || 'Purchase failed');
                    setLoading(false);
                }
            });
        } catch (err: any) {
            setError(err.message || 'Purchase failed');
            setLoading(false);
        }
    };

    // Refetch data when transaction confirms
    useEffect(() => {
        if (latestTxHash && !isConfirming) {
            refetchSpinInfo();
            refetchNftBalance();
        }
    }, [latestTxHash, isConfirming]);

    // Helper functions
    const formatTime = (seconds: bigint) => {
        const totalSeconds = Number(seconds);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const remainingSeconds = totalSeconds % 60;
        
        return {
            hours,
            minutes,
            seconds: remainingSeconds,
            formatted: `${hours}h ${minutes}m ${remainingSeconds}s`
        };
    };

    const getBadgeName = (level: BadgeLevel): string => {
        switch (level) {
            case BadgeLevel.Bronze: return 'Bronze Rune';
            case BadgeLevel.Silver: return 'Silver Sigil';
            case BadgeLevel.Gold: return 'Golden Relic';
            default: return 'None';
        }
    };

    // Game constants
    const gameConstants: GameConstants = {
        spinPrice: spinPrice || parseEther('0.01'),
        freeSpinsPerDay: freeSpinsPerDay || BigInt(10)
    };

    return {
        // Data
        spinInfo: safeSpinInfo,
        nftBalance: nftBalance || BigInt(0),
        gameConstants,
        dailySpinStats,
        
        // States
        loading: loading || isConfirming,
        error,
        
        // Status checks
        isDailySpinLimitReached,
        
        // Functions
        handleSpin,
        handleBuySpins,
        refetchSpinInfo,
        refetchNftBalance,
        getNFTStats,
        
        // Helpers
        formatTime,
        formatCountdown,
        getBadgeName,
        getTransactionUrl,
        getAddressUrl,
        
        // Formatted data
        formattedSpinPrice: spinPrice ? formatEther(spinPrice) : '0.01',
        timeUntilReset: safeSpinInfo ? formatTime(safeSpinInfo.timeUntilNextReset) : null,
    };
};