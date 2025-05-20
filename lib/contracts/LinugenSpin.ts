// lib/contracts/LinugenSpin.ts

export const LINUGEN_SPIN_ABI = [
    {
        "type": "function",
        "name": "spin",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "buySpins",
        "inputs": [],
        "outputs": [],
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "getSpinInfo",
        "inputs": [{"name": "player", "type": "address", "internalType": "address"}],
        "outputs": [
            {"name": "freeSpinsRemaining", "type": "uint256", "internalType": "uint256"},
            {"name": "premiumSpinsRemaining", "type": "uint256", "internalType": "uint256"},
            {"name": "timeUntilNextReset", "type": "uint256", "internalType": "uint256"}
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "balanceOf",
        "inputs": [{"name": "owner", "type": "address", "internalType": "address"}],
        "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "SPIN_PRICE",
        "inputs": [],
        "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "FREE_SPINS_PER_DAY",
        "inputs": [],
        "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
        "stateMutability": "view"
    }
] as const;

export const CONTRACT_ADDRESS = "0x07F4067fEa5815D9afa9110Fdc0a5115fb3c8088" as `0x${string}`;

// Badge levels enum
export enum BadgeLevel {
    None = 0,
    Bronze = 1,
    Silver = 2,
    Gold = 3
}

// Type definitions
export interface SpinInfo {
    freeSpinsRemaining: bigint;
    premiumSpinsRemaining: bigint;
    timeUntilNextReset: bigint;
}

export interface GameConstants {
    spinPrice: bigint;
    freeSpinsPerDay: bigint;
}