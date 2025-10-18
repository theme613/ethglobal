"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CheckCircle, Clock, XCircle, Shield, Database, RefreshCw } from "lucide-react";

const VerificationPage = () => {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState("PENDING");
  const [currentStep, setCurrentStep] = useState(3);
  const [kycData, setKycData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  // Simulate verification process
  useEffect(() => {
    const simulateVerification = async () => {
      setIsLoading(true);
      
      // Step 3: KYC API Submit
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCurrentStep(4);
      
      // Step 4: AML Screening
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCurrentStep(5);
      
      // Step 5: Review
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful verification
      setVerificationStatus("APPROVED");
      setKycData({
        referenceId: `BRIDGE-${Date.now()}`,
        riskScore: 15,
        amlStatus: "CLEAR",
        verificationDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      });
      
      setIsLoading(false);
    };

    simulateVerification();
  }, []);

  const getStepIcon = (step, currentStep, status) => {
    if (step < currentStep) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (step === currentStep) {
      return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
    } else {
      return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStepStatus = (step, currentStep, status) => {
    if (step < currentStep) {
      return "completed";
    } else if (step === currentStep) {
      return "processing";
    } else {
      return "pending";
    }
  };

  const steps = [
    {
      id: 3,
      title: "KYC API Submit",
      description: "Data sent to Bridge sandbox API",
      icon: Database
    },
    {
      id: 4,
      title: "AML Screening",
      description: "Automated off-chain compliance check",
      icon: Shield
    },
    {
      id: 5,
      title: "Review",
      description: "Provider returns verification status",
      icon: CheckCircle
    }
  ];

  const handleContinue = () => {
    if (verificationStatus === "APPROVED") {
      router.push("/sbt-minting");
    }
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Wallet Not Connected</h2>
          <p className="text-gray-400">Please connect your wallet to continue</p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-black" />
      </div>

      <Header />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4 py-4">
        <div className="max-w-xl mx-auto w-full">
          <div className="bg-black/80 backdrop-blur-lg rounded-2xl border border-white/10 p-3">
            
            {/* Header */}
            <div className="mb-3">
              <h1 className="text-lg font-bold mb-1">KYC Verification Status</h1>
              <p className="text-gray-400 text-xs mb-2">Steps 3-5 of 8: API Submit, AML Screening & Review</p>
              
              {/* Progress indicator */}
              <div className="flex justify-center mb-2">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => (
                    <div
                      key={step}
                      className={`w-1 h-1 rounded-full ${
                        step <= 5 ? "bg-blue-500" : "bg-gray-600"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Verification steps */}
            <div className="space-y-2 mb-3">
              {steps.map((step) => {
                const stepStatus = getStepStatus(step.id, currentStep, verificationStatus);
                const isCompleted = stepStatus === "completed";
                const isProcessing = stepStatus === "processing";
                
                return (
                  <div
                    key={step.id}
                    className={`p-2 rounded-lg border ${
                      isCompleted 
                        ? "bg-green-500/10 border-green-500/30" 
                        : isProcessing 
                        ? "bg-blue-500/10 border-blue-500/30" 
                        : "bg-gray-500/10 border-gray-500/30"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {getStepIcon(step.id, currentStep, verificationStatus)}
                      <div className="flex-1">
                        <h3 className="text-xs font-semibold">{step.title}</h3>
                        <p className="text-gray-400 text-xs">{step.description}</p>
                      </div>
                      <div className="text-xs">
                        {isCompleted && <span className="text-green-500">Completed</span>}
                        {isProcessing && <span className="text-blue-500">Processing...</span>}
                        {!isCompleted && !isProcessing && <span className="text-gray-500">Pending</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Status display */}
            {verificationStatus === "PENDING" && (
              <div className="text-center py-3">
                <RefreshCw className="w-6 h-6 text-blue-500 animate-spin mx-auto mb-2" />
                <h3 className="text-sm font-semibold mb-1">Verification in Progress</h3>
                <p className="text-gray-400 text-xs">
                  Please wait while we process your KYC verification...
                </p>
              </div>
            )}

            {verificationStatus === "APPROVED" && kycData && (
              <div className="text-center py-3">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h3 className="text-lg font-bold text-green-500 mb-2">Verification Approved!</h3>
                <p className="text-gray-400 text-xs mb-3">
                  Your KYC verification has been successfully completed.
                </p>
                
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2 mb-3">
                  <h4 className="font-semibold mb-1 text-xs">Verification Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs">
                    <div>
                      <span className="text-gray-400">Reference ID:</span>
                      <p className="font-mono text-xs">{kycData.referenceId}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Risk Score:</span>
                      <p className="text-xs">{kycData.riskScore}/100</p>
                    </div>
                    <div>
                      <span className="text-gray-400">AML Status:</span>
                      <p className="text-green-500 text-xs">{kycData.amlStatus}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Expiry Date:</span>
                      <p className="text-xs">{new Date(kycData.expiryDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleContinue}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-xs"
                >
                  Continue to SBT Minting
                </button>
              </div>
            )}

            {verificationStatus === "REJECTED" && (
              <div className="text-center py-3">
                <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <h3 className="text-lg font-bold text-red-500 mb-2">Verification Rejected</h3>
                <p className="text-gray-400 text-xs mb-3">
                  Unfortunately, your KYC verification could not be completed.
                </p>
                <button
                  onClick={() => router.push("/kyc/page1")}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors text-xs"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default VerificationPage;