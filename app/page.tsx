// app/page.tsx

'use client';

import ConnectButton from '@/components/ConnectButton';
import LinugenSpinGame from '@/components/LinugenSpinGame';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Linugen Spin</h1>
            <p className="text-purple-300">Collect NFT badges by spinning!</p>
          </div>
          
          <ConnectButton />
        </div>

        {/* Game Component */}
        <div className="flex justify-center">
          <LinugenSpinGame />
        </div>

        {/* Info Section */}
        <div className="mt-12">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-purple-500/20">
              <h3 className="font-bold text-lg mb-3 text-green-400">🆓 Free Spins</h3>
              <p className="text-gray-300 text-sm">
                Get 10 free spins every 24 hours. No cost required!
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-purple-500/20">
              <h3 className="font-bold text-lg mb-3 text-blue-400">💎 Premium Spins</h3>
              <p className="text-gray-300 text-sm">
                Buy additional spins for 0.01 MON each. No limits!
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-purple-500/20">
              <h3 className="font-bold text-lg mb-3 text-purple-400">🏆 NFT Rewards</h3>
              <p className="text-gray-300 text-sm">
                Collect Bronze, Silver, and Gold badge NFTs with different rarities.
              </p>
            </div>
          </div>

          {/* Probability Table */}
          <div className="mt-12 bg-gray-800 rounded-lg p-6 shadow-lg border border-purple-500/20">
            <h3 className="font-bold text-lg mb-4 text-white">Win Probabilities</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 text-gray-300">Badge</th>
                    <th className="text-center py-2 text-gray-300">Rarity</th>
                    <th className="text-center py-2 text-gray-300">Probability</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700">
                    <td className="py-2 text-white">🥇 Golden Relic</td>
                    <td className="text-center text-yellow-400">Legendary</td>
                    <td className="text-center font-bold text-yellow-400">1%</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-2 text-white">🥈 Silver Sigil</td>
                    <td className="text-center text-gray-400">Rare</td>
                    <td className="text-center font-bold text-gray-400">10%</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-2 text-white">🥉 Bronze Rune</td>
                    <td className="text-center text-orange-400">Common</td>
                    <td className="text-center font-bold text-orange-400">25%</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-white">❌ No Reward</td>
                    <td className="text-center text-gray-500">-</td>
                    <td className="text-center text-gray-500">64%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 p-6 w-full max-w-md rounded-lg shadow-lg border border-purple-800/30">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-white">Linugen Spin</h2>
            <p className="text-purple-300">Collect NFT badges by spinning!</p>
            <img src="/images/splash.png" alt="Linugen Spin" className="mt-6 mx-auto w-32 h-32" />
          </div>
        </div>
      </div>
    </main>
  );
}