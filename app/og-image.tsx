import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Linugen Spin - Collect NFT Badges';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(to bottom right, #1a1a1a, #2a2a2a)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          padding: '40px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '80px' }}>🎰</span>
          <h1 style={{ fontSize: '60px', margin: 0 }}>Linugen Spin</h1>
        </div>
        <p style={{ fontSize: '32px', marginTop: '20px', textAlign: 'center' }}>
          Collect rare NFT badges on Monad Testnet!
        </p>
        <p style={{ fontSize: '24px', marginTop: '10px', opacity: 0.8 }}>
          10 free spins daily
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
} 