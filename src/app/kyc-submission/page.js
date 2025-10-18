"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

const KYCSubmissionPage = () => {
  const { isConnected } = useAccount();
  const router = useRouter();

  // Redirect to KYC wizard
  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    } else {
      router.push("/kyc/page1");
    }
  }, [isConnected, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Redirecting to KYC Process</h2>
        <p className="text-gray-400">Please wait...</p>
      </div>
    </div>
  );
};

export default KYCSubmissionPage;