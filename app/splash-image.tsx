import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Linugen Spin Splash';
export const size = {
  width: 800,
  height: 800,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#1a1a1a',
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
          <span style={{ fontSize: '120px' }}>🎰</span>
        </div>
        <h1 style={{ fontSize: '48px', marginTop: '20px', textAlign: 'center' }}>
          Linugen Spin
        </h1>
        <p style={{ fontSize: '24px', marginTop: '10px', opacity: 0.8, textAlign: 'center' }}>
          Loading your spin experience...
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
} 