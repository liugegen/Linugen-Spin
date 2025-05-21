import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { FrameProvider } from "@/components/farcaster-provider";
import dynamic from "next/dynamic";
import { Toaster } from 'react-hot-toast';

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// Dynamic import with SSR disabled to avoid hydration issues
const SwitchNetworkBanner = dynamic(
  () => import("@/components/SwitchNetworkBanner"),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "Linugen Spin",
  description: "Collect NFT badges by spinning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="fc:frame" content='{"version":"next","imageUrl":"https://linugen-spin.vercel.app/opengraph-image.png","button":{"title":"🎰 Spin Now!","action":{"type":"launch_frame","url":"https://linugen-spin.vercel.app","name":"Linugen Spin","splashImageUrl":"https://linugen-spin.vercel.app/images/splash.png","splashBackgroundColor":"#1a1a1a"}}}' />
        <meta property="og:title" content="Linugen Spin - Collect NFT Badges" />
        <meta property="og:description" content="Spin to collect rare NFT badges on Monad Testnet! Get 10 free spins daily." />
        <meta property="og:image" content="https://linugen-spin.vercel.app/opengraph-image.png" />
        <meta property="og:url" content="https://linugen-spin.vercel.app" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Linugen Spin - Collect NFT Badges" />
        <meta name="twitter:description" content="Spin to collect rare NFT badges on Monad Testnet! Get 10 free spins daily." />
        <meta name="twitter:image" content="https://linugen-spin.vercel.app/opengraph-image.png" />
      </head>
      <body className={inter.className}>
        <FrameProvider>
          <Toaster position="top-center" />
          <SwitchNetworkBanner />
          <div className="pt-6">
            {children}
          </div>
        </FrameProvider>
      </body>
    </html>
  );
}
