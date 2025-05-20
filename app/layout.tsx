import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { FrameProvider } from "@/components/farcaster-provider";
import dynamic from "next/dynamic";

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
      <body className={inter.className}>
        <FrameProvider>
          <SwitchNetworkBanner />
          <div className="pt-6">
            {children}
          </div>
        </FrameProvider>
      </body>
    </html>
  );
}
