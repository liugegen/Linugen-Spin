import { NextResponse } from "next/server";
import { APP_URL } from "../../../lib/constants";

export async function GET() {
  const farcasterConfig = {
    // Account association
    accountAssociation: {
      header: "eyJmaWQiOjEwODIyMDIsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhmNDkwMzYyY0UwMDgxRDFlMTA0QmE1Y0Q5MDE4M0I1MUY4YWZkZDFEIn0",
      payload: "eyJkb21haW4iOiJsaW51Z2VuLXNwaW4udmVyY2VsLmFwcCJ9",
      signature: "MHg5NGU3ZTlmZTMwMmNhYzU2NmM2OTg2NjdiNDYyY2Q5ZGZjNWRjZWZjZGYwNWE1ZDZhMjkwOGY2NWI4NGJhNWY1NTlmZTU3MmZlMzBhZjZhYTM5YTRhYjIyMWJiNDU3OWU4NGJlNDA3NzYzMDI1MzdlYTkzYjExMjYwMDYzMjYyNjFj"
    },
    frame: {
      version: "1",
      name: "Linugen Spin",
      iconUrl: `${APP_URL}/images/icon.png`,
      homeUrl: `${APP_URL}`,
      imageUrl: `${APP_URL}/images/feed.png`,
      screenshotUrls: [],
      tags: ["nft", "game", "spin", "web3"],
      primaryCategory: "games",
      buttonTitle: "Play Linugen Spin",
      splashImageUrl: `${APP_URL}/images/splash.png`,
      splashBackgroundColor: "#8B5CF6",
      webhookUrl: `${APP_URL}/api/webhook`,
      network: "monad-testnet",
      chainId: 10143,
    },
  };
  
  return NextResponse.json(farcasterConfig);
}