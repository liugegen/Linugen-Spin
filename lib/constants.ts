// lib/constants.ts

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://linugen-spin.vercel.app';

// Additional exports that might be required by the template
export const APP_NAME = 'Linugen Spin';
export const APP_DESCRIPTION = 'NFT Spin Game on Monad';

// Import monadTestnet from frame-wallet-provider
import { monadTestnet } from '@/components/frame-wallet-provider';

// Re-export for compatibility with template
export { monadTestnet as defaultChain };