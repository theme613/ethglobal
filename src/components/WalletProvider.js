"use client";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { sepolia } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

// Configuration for RainbowKit and Wagmi - Sepolia Testnet Only
// Using a default project ID for development - replace with your own for production
const config = getDefaultConfig({
  appName: "PYUSD KYC System",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "default_project_id",
  chains: [sepolia], // Only Sepolia Testnet
  ssr: true, // If your dApp uses server side rendering (SSR)
});

const queryClient = new QueryClient();

/**
 * A provider component that wraps the application with Wagmi and RainbowKit contexts.
 * This enables wallet connection and interaction with the blockchain.
 */
export const WalletProvider = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
