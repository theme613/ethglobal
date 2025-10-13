"use client";
import React from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { WalletConnectButton } from "./ConnectButton";

const navItems = ["Home", "DeFi App", "Assets", "Features", "Pricing", "FAQ"];

export const Header = () => {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute top-0 left-0 right-0 z-20 p-4"
    >
      <div className="container mx-auto flex justify-between items-center p-2 bg-black/20 backdrop-blur-lg rounded-full border border-white/10">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-white rounded-full mr-4" />
          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <a
                key={item}
                href="#"
                className="px-4 py-2 rounded-full text-sm hover:bg-white/10 transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <Search className="cursor-pointer" />
          <WalletConnectButton />
        </div>
      </div>
    </motion.header>
  );
};
