﻿# Linugen-Spin

A blockchain-based NFT spin game built on the Monad Testnet that rewards players with collectible badge NFTs.

## Overview

Linugen Spin is a Web3 game that combines the excitement of a spin game with NFT collecting. Built as a Farcaster Mini App, it allows users to spin daily for a chance to win NFT badges of varying rarity levels. The game features a dark-themed UI with purple accents and offers both free daily spins and premium spins available for purchase.

## Features

- **Free Daily Spins**: Every user receives 10 free spins automatically each day
- **Premium Spins**: Purchase additional spins with MON tokens (Monad's native currency)
- **Collectible NFTs**: Win Bronze, Silver, and Gold rarity badges with different probabilities
- **Monad Blockchain**: Built on Monad Testnet for fast and low-cost transactions
- **Wallet Integration**: Connect with Warpcast wallet, Rainbow, or other Web3 wallets
- **Responsive UI**: Beautiful dark-themed interface with real-time updates
- **Daily Reset Timer**: Countdown timer showing when free spins will reset
- **Transaction History**: View your spin transactions on Monad Explorer

## Win Probabilities

| Badge | Rarity | Probability |
|-------|--------|-------------|
| 🏆 Golden Relic | Legendary | 1% |
| 🥈 Silver Sigil | Rare | 10% |
| 🥉 Bronze Rune | Common | 25% |
| ❌ No Reward | - | 64% |

## Technical Stack

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Blockchain**: Monad Testnet (Chain ID: 10143)
- **Web3 Libraries**: wagmi, viem, and Farcaster Frame SDK
- **Components**: Custom React components with Headless UI
- **State Management**: React hooks and context
- **UI Framework**: Tailwind CSS with custom components

## Getting Started

### Prerequisites

- Node.js 16+
- Yarn or NPM
- A Web3 wallet with Monad Testnet configuration

### Installation

```bash
# Clone the repository
git clone https://github.com/liugegen/Linugen-Spin.git

# Navigate to the project directory
cd linugen-spin

# Install dependencies
yarn install
# or
npm install

# Start development server
yarn dev
# or
npm run dev
```

Visit `http://localhost:3000` to view the app.

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production deployment, update this URL accordingly.

## Using the App

1. **Connect Wallet**: Click the "Connect Wallet" button to link your Web3 wallet
2. **Switch Network**: Ensure you're connected to Monad Testnet (Chain ID 10143)
3. **Free Spins**: Use your 10 daily free spins by clicking the spin button
4. **Buy Premium Spins**: Purchase additional spins with MON tokens
5. **Spin to Win**: Each spin has a chance to win NFT badges of different rarities
6. **View Collection**: See your collected NFTs at the bottom of the game
7. **Track Reset**: The countdown timer shows when your free spins will reset

## Network Configuration

The game runs on Monad Testnet with the following configuration:

- **Network Name**: Monad Testnet
- **Chain ID**: 10143
- **RPC URL**: https://testnet-rpc.monad.xyz
- **Currency Symbol**: MON
- **Block Explorer**: https://testnet.monadexplorer.com

## Smart Contract

The game interacts with a LinugenSpin smart contract deployed on Monad Testnet, which handles:

- Spin functionality and randomization
- NFT minting and distribution
- Premium spin purchases
- Free spin allocation and daily resets
- Badge rarity distribution

## Component Structure

- **LinugenSpinGame**: Main game component with spin functionality
- **CountdownTimer**: Displays time until free spins reset
- **SpinResultPopup**: Shows spin results with animations
- **SwitchNetworkBanner**: Helps users switch to Monad Testnet
- **WalletConnectorModal**: Provides wallet connection options

## Future Enhancements

- Leaderboard for top collectors
- Social sharing of spin results
- Additional badge types and rarities
- Badge trading marketplace
- Special event spins with limited-edition badges

## Troubleshooting

- **Network Issues**: Make sure you're connected to Monad Testnet (Chain ID 10143)
- **Wallet Connection**: Try refreshing the page if wallet connection fails
- **Missing Free Spins**: Free spins reset at 00:00 UTC daily
- **Transaction Errors**: Ensure you have MON tokens for gas fees

## License

MIT

## Acknowledgments

- Built with Farcaster Mini App framework
- Powered by Monad blockchain
- UI inspired by modern Web3 gaming applications
- Made for blockchain NFT enthusiasts
