"use client";
import React from "react";
import { motion } from "framer-motion";

const partners = ["Vercel", "loom", "Cash App", "Loops", "zapier", "ramp", "Raycast"];

export const Footer = () => {
  return (
    <motion.footer
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="absolute bottom-0 left-0 right-0 z-20 p-4"
    >
      <div className="container mx-auto flex justify-between items-center p-4 bg-black/20 backdrop-blur-lg rounded-t-lg border-t border-white/10">
        <div className="flex items-center space-x-8">
          {partners.map((partner) => (
            <span key={partner} className="text-sm text-gray-400">
              {partner}
            </span>
          ))}
        </div>
      </div>
    </motion.footer>
  );
};
