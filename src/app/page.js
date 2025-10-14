"use client";
import React from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ThreeScene } from "@/components/ThreeScene";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/navigation";

const Home = () => {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const router = useRouter();

  const handleStartNow = () => {
    if (isConnected) {
      router.push("/app");
    } else {
      openConnectModal();
    }
  };
  return (
    <main className="relative w-full h-screen overflow-hidden bg-black text-white">
      <ThreeScene />
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
      </div>

      <Header />

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-6xl font-bold mb-4"
        >
          DeFi Social Hub
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-xl text-gray-400 mb-8"
        >
          Socialize and pay with PYUSD—your crypto, your community.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="flex space-x-4"
        >
          <button
            onClick={handleStartNow}
            className="px-6 py-3 bg-white text-black rounded-full font-semibold"
          >
            Start Now
          </button>
          <button className="px-6 py-3 bg-white/10 border border-white/20 rounded-full font-semibold">
            Discover More
          </button>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
};

export default Home;
