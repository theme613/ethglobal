"use client";
import React, { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/navigation";
import { useKYC } from "@/hooks/useKYC";

const Home = () => {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const router = useRouter();
  const { needsKYC, checkKYCStatus } = useKYC();

  // Check KYC status when connection state changes
  useEffect(() => {
    if (isConnected) {
      checkKYCStatus();
    }
  }, [isConnected, checkKYCStatus]);

  // Redirect to KYC pages when KYC is needed
  useEffect(() => {
    if (isConnected && needsKYC) {
      router.push("/kyc/page1");
    }
  }, [isConnected, needsKYC, router]);

  const handleStartNow = () => {
    if (isConnected) {
      if (needsKYC) {
        router.push("/kyc/page1");
      } else {
        router.push("/app");
      }
    } else {
      openConnectModal();
    }
  };
  return (
    <main className="relative w-full h-screen overflow-hidden bg-black text-white">
      {/* Optimized background - no heavy 3D components */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
      </div>

      <Header />

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
        <h1 className="text-6xl font-bold mb-4">
          DeFi Social Hub
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          Socialize and pay with PYUSD—your crypto, your community.
        </p>
        <div className="flex space-x-4">
          <button
            onClick={handleStartNow}
            className="px-6 py-3 bg-white text-black rounded-full font-semibold hover:bg-white/90 transition-colors"
          >
            Start Now
          </button>
          <button className="px-6 py-3 bg-white/10 border border-white/20 rounded-full font-semibold hover:bg-white/20 transition-colors">
            Discover More
          </button>
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default Home;