"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAccount } from "wagmi";

/**
 * KYC State Management Hook
 * Manages user KYC verification status and flow
 */
export const useKYC = () => {
  const { address, isConnected } = useAccount();
  const [kycStatus, setKycStatus] = useState(() => {
    // Initialize kycStatus directly from localStorage on component mount
    if (typeof window === "undefined" || !address) return null; // Avoid localStorage on server or without address

    let initialStatus = {
      isVerified: false,
      status: "PENDING",
      expiryTime: null,
      riskScore: 0
    };

    try {
      // Check SBT status (10 PYUSD minting completion)
      const storedSBTStatus = localStorage.getItem(`sbt_status_${address}`);
      const sbtVerified = storedSBTStatus ? JSON.parse(storedSBTStatus).isActive : false;
      
      // If SBT minting is complete, KYC is verified
      if (sbtVerified) {
        initialStatus.isVerified = true;
        initialStatus.status = "COMPLETED";
      }

      // Merge with any other stored KYC status
      const storedKYCStatus = localStorage.getItem(`kyc_status_${address}`);
      if (storedKYCStatus) {
        initialStatus = { ...initialStatus, ...JSON.parse(storedKYCStatus) };
      }

    } catch (err) {
      console.error("Failed to load initial KYC status from localStorage:", err);
    }
    return initialStatus;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check KYC status
  const checkKYCStatus = useCallback(async () => {
    if (!address) return null;
    
    setIsLoading(true);
    setError(null);

    try {
      let currentKYCStatus = {
        isVerified: false,
        status: "PENDING",
        expiryTime: null,
        riskScore: 0
      };

      // Check SBT status (10 PYUSD minting completion)
      const storedSBTStatus = localStorage.getItem(`sbt_status_${address}`);
      const sbtVerified = storedSBTStatus ? JSON.parse(storedSBTStatus).isActive : false;
      
      // If SBT minting is complete, KYC is verified
      if (sbtVerified) {
        currentKYCStatus.isVerified = true;
        currentKYCStatus.status = "COMPLETED";
      }

      // Merge with any other stored KYC status if applicable (e.g., from an actual KYC form submission)
      const storedGeneralKYCStatus = localStorage.getItem(`kyc_status_${address}`);
      if (storedGeneralKYCStatus) {
        currentKYCStatus = { ...currentKYCStatus, ...JSON.parse(storedGeneralKYCStatus) };
      }

      setKycStatus(currentKYCStatus);
      return currentKYCStatus;

    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  // Update KYC status
  const updateKYCStatus = useCallback((status) => {
    if (address) {
      localStorage.setItem(`kyc_status_${address}`, JSON.stringify(status));
      setKycStatus(status);
    }
  }, [address]);

  // Clear KYC status
  const clearKYCStatus = useCallback(() => {
    if (address) {
      localStorage.removeItem(`kyc_status_${address}`);
      setKycStatus(null);
    }
  }, [address]);

  // Check if KYC verification is needed
  const needsKYC = useMemo(() => {
    if (!isConnected) return false;
    if (!kycStatus) return true;
    return !kycStatus.isVerified;
  }, [isConnected, kycStatus]);

  return {
    kycStatus,
    isLoading,
    error,
    needsKYC,
    checkKYCStatus,
    updateKYCStatus,
    clearKYCStatus,
  };
};
