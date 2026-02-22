import { foundry, sepolia } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit';


export const config = getDefaultConfig({
  appName: 'eCO2',
  projectId: '38b5674d0598aec034a669b995aa0350',
  chains: process.env.NODE_ENV === 'development' ? [sepolia, foundry] : [sepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
});