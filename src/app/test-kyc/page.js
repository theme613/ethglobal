"use client";
import React from "react";
import { useAccount } from "wagmi";
import { useKYC } from "@/hooks/useKYC";

const TestKYCPage = () => {
  const { isConnected } = useAccount();
  const { kycStatus, needsKYC, checkKYCStatus, updateKYCStatus, clearKYCStatus } = useKYC();

  const handleTestKYC = async () => {
    console.log("Testing KYC check...");
    await checkKYCStatus();
  };

  const handleSetVerified = () => {
    updateKYCStatus({
      isVerified: true,
      status: "APPROVED",
      expiryTime: Date.now() + (365 * 24 * 60 * 60 * 1000),
      riskScore: 10
    });
  };

  const handleClearKYC = () => {
    clearKYCStatus();
  };

  return (
    <div className="p-8 bg-black text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">KYC Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <strong>Connection Status:</strong> {isConnected ? "Connected" : "Not Connected"}
        </div>
        
        <div>
          <strong>KYC Status:</strong> {JSON.stringify(kycStatus, null, 2)}
        </div>
        
        <div>
          <strong>Needs KYC:</strong> {needsKYC ? "Yes" : "No"}
        </div>
        
        <div className="space-x-4">
          <button
            onClick={handleTestKYC}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Check KYC Status
          </button>
          
          <button
            onClick={handleSetVerified}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Set as Verified
          </button>
          
          <button
            onClick={handleClearKYC}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Clear KYC Status
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestKYCPage;
