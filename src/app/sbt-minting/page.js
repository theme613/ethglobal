"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CheckCircle, Shield, Coins, ExternalLink } from "lucide-react";

const SBTMintingPage = () => {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const [mintingStatus, setMintingStatus] = useState("PENDING");
  const [isMinting, setIsMinting] = useState(false);
  const [sbtTokenId, setSbtTokenId] = useState(null);
  const [error, setError] = useState(null);

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  const handleMintSBT = async () => {
    setIsMinting(true);
    setError(null);
    
    try {
      // Import the contract service
      const { ContractService } = await import("@/services/contractService");
      
      // Get provider and signer from wagmi
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Initialize contract service
      const contractService = new ContractService(provider, signer);
      
      // Call the real SBT minting function
      const result = await contractService.mintSBT({
        userAddress: address
      });
      
      if (result.success) {
        // Get token ID from the transaction result
        const tokenId = result.tokenId || "Unknown";
        setSbtTokenId(tokenId);
        setMintingStatus("MINTED");
        
        // Store SBT status in localStorage
        localStorage.setItem(`sbt_status_${address}`, JSON.stringify({
          tokenId,
          mintedAt: new Date().toISOString(),
          isActive: true,
          transactionHash: result.transactionHash,
          blockNumber: result.blockNumber
        }));
        
        console.log("SBT minted successfully:", result);
      } else {
        throw new Error(result.message || result.error);
      }
      
    } catch (err) {
      setError(err.message || "Failed to mint SBT. Please check your wallet connection and try again.");
      console.error("SBT minting failed:", err);
    } finally {
      setIsMinting(false);
    }
  };

  const handleContinueToPayment = () => {
    router.push("/access-control");
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
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
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Shield className="w-3 h-3" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">Soul Bound Token (SBT) Minting</h1>
                  <p className="text-gray-400 text-xs">Step 6 of 8: Mint your KYC verification SBT</p>
                </div>
              </div>
              
              <div className="flex justify-center mb-2">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => (
                    <div
                      key={step}
                      className={`w-1 h-1 rounded-full ${
                        step <= 6 ? "bg-blue-500" : "bg-gray-600"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* SBT Information */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2 mb-3">
              <h4 className="font-semibold mb-1 text-xs flex items-center space-x-2">
                <Shield className="w-3 h-3" />
                <span>What is a Soul Bound Token (SBT)?</span>
              </h4>
              <p className="text-gray-400 text-xs mb-1">
                SBTs are non-transferable NFTs that prove your KYC verification status. 
                They cannot be sold or transferred, ensuring your identity remains secure.
              </p>
              <div className="text-xs text-gray-300">
                <p>• EIP-5192 compliant</p>
                <p>• Non-transferable</p>
                <p>• Required for PYUSD payments</p>
              </div>
            </div>

            {/* Minting Status */}
            {mintingStatus === "PENDING" && (
              <div className="text-center py-3">
                <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h3 className="text-sm font-semibold mb-1">Ready to Mint SBT</h3>
                <p className="text-gray-400 text-xs mb-3">
                  Your KYC verification is complete. Mint your Soul Bound Token to proceed with PYUSD payments.
                </p>
                
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 mb-3">
                    <p className="text-red-400 text-xs">{error}</p>
                  </div>
                )}
                
                <button
                  onClick={handleMintSBT}
                  disabled={isMinting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2 text-xs mx-auto"
                >
                  {isMinting ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Minting SBT...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-3 h-3" />
                      <span>Mint SBT</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {mintingStatus === "MINTED" && sbtTokenId && (
              <div className="text-center py-2">
                <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-1" />
                <h3 className="text-sm font-bold text-green-500 mb-1">SBT Successfully Minted!</h3>
                <p className="text-gray-400 text-xs mb-2">
                  Your Soul Bound Token has been minted and is now active in your wallet.
                </p>
                
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2 mb-2">
                  <h4 className="font-semibold mb-1 text-xs">SBT Details</h4>
                  <div className="text-xs space-y-0.5">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Token ID:</span>
                      <span className="font-mono">#{sbtTokenId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className="text-green-500">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span>KYC Verification</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleContinueToPayment}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-xs"
                >
                  Continue to PYUSD Payments
                </button>
              </div>
            )}

            {/* PYUSD Contract Info */}
            <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-2 mt-3">
              <h4 className="font-semibold mb-1 text-xs flex items-center space-x-2">
                <Coins className="w-3 h-3" />
                <span>PYUSD Payment Integration</span>
              </h4>
              <p className="text-gray-400 text-xs mb-1">
                Your SBT will be used to gate PYUSD payments through our smart contract system.
              </p>
              <div className="text-xs text-gray-300">
                <p>• Contract: PYUSDKYCSubscription</p>
                <p>• Token: PayPal USD (PYUSD)</p>
                <p>• Network: Ethereum Sepolia</p>
                <p>• Gas Reimbursement: Available</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default SBTMintingPage;