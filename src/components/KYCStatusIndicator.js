"use client";
import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { useKYC } from "@/hooks/useKYC";

/**
 * KYC Status Indicator Component
 * Shows user's KYC verification status
 */
export const KYCStatusIndicator = () => {
  const { kycStatus, needsKYC, isLoading } = useKYC();

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center space-x-2 px-3 py-2 bg-blue-500/20 rounded-full border border-blue-500/30"
      >
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-blue-400">Checking KYC status...</span>
      </motion.div>
    );
  }

  if (needsKYC) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center space-x-2 px-3 py-2 bg-yellow-500/20 rounded-full border border-yellow-500/30"
      >
        <AlertCircle className="w-4 h-4 text-yellow-500" />
        <span className="text-sm text-yellow-400">KYC Verification Required</span>
      </motion.div>
    );
  }

  if (kycStatus?.isVerified) {
    const isExpired = kycStatus.expiryTime && Date.now() > kycStatus.expiryTime;
    
    if (isExpired) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center space-x-2 px-3 py-2 bg-red-500/20 rounded-full border border-red-500/30"
        >
          <XCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-400">KYC Expired</span>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center space-x-2 px-3 py-2 bg-green-500/20 rounded-full border border-green-500/30"
      >
        <CheckCircle className="w-4 h-4 text-green-500" />
        <span className="text-sm text-green-400">KYC Verified</span>
      </motion.div>
    );
  }

  return null;
};
