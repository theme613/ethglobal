"use client";
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { ChatLayout } from "@/components/ChatLayout";
import { Header } from "@/components/Header";

const LivingRoom = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center apple-glass p-6">
      <h2 className="text-3xl font-bold mb-4">Living Room</h2>
      <p className="text-lg text-gray-400">
        Avatar customization coming soon.
      </p>
    </div>
  );
};

const AppPage = () => {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  return (
    <main className="relative w-full h-screen overflow-hidden text-white p-4 apple-inspired-bg">
      <Header />
      <div className="flex w-full h-full pt-24 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-1/2 h-full"
        >
          <LivingRoom />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-1/2 h-full"
        >
          <ChatLayout />
        </motion.div>
      </div>
    </main>
  );
};

export default AppPage;
