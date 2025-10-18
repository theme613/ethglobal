"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAccount } from "wagmi";

/**
 * KYC State Management Hook
 * Manages user KYC verification status and flow
 */
export const useKYC = () => {
  const { address, isConnected } = useAccount();
  const [kycStatus, setKycStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load KYC status from local storage
  useEffect(() => {
    if (!address) {
      setKycStatus(null);
      return;
    }

    try {
      const storedStatus = localStorage.getItem(`kyc_status_${address}`);
      if (storedStatus) {
        const parsed = JSON.parse(storedStatus);
        setKycStatus(parsed);
      } else {
        setKycStatus(null);
      }
    } catch (err) {
      console.error("Failed to load KYC status:", err);
      setKycStatus(null);
    }
  }, [address]);

  // Check KYC status
  const checkKYCStatus = useCallback(async () => {
    if (!address) return null;
    
    setIsLoading(true);
    setError(null);

    try {
      // Check local storage
      const storedStatus = localStorage.getItem(`kyc_status_${address}`);
      if (storedStatus) {
        const parsed = JSON.parse(storedStatus);
        setKycStatus(parsed);
        return parsed;
      }

      // Create default status if no stored status
      const defaultStatus = {
        isVerified: false,
        status: "PENDING",
        expiryTime: null,
        riskScore: 0
      };

      setKycStatus(defaultStatus);
      return defaultStatus;
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