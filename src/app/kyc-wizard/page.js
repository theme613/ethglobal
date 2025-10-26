"use client";
import React from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import dynamic from "next/dynamic";

const ThreeScene = dynamic(() => import("@/components/ThreeScene"), {
  ssr: false,
});
import KYCWizard from "@/components/KYCWizard";

const KYCWizardPage = () => {
  return (
    <main className="relative w-full h-screen overflow-hidden bg-black text-white">
      <ThreeScene />
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />
      </div>

      <Header />

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <KYCWizard />
        </motion.div>
      </div>

      <Footer />
    </main>
  );
};

export default KYCWizardPage;
