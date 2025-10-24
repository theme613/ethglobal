"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CheckCircle, Coins, Shield, ExternalLink, DollarSign } from "lucide-react";

const AccessControlPage = () => {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const [hasSBT, setHasSBT] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("PENDING");
  const [isProcessing, setIsProcessing] = useState(false);
  const [sbtTokenId, setSbtTokenId] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("1.0");

  // Check SBT status
  useEffect(() => {
    if (address) {
      const sbtStatus = localStorage.getItem(`sbt_status_${address}`);
      if (sbtStatus) {
        const parsed = JSON.parse(sbtStatus);
        setHasSBT(parsed.isActive);
        setSbtTokenId(parsed.tokenId);
      }
    }
  }, [address]);

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  const handlePayWithPYUSD = async () => {
    if (!hasSBT) {
      alert("You need an SBT to make PYUSD payments. Please complete KYC verification first.");
      return;
    }

    setIsProcessing(true);
    
    try {
      // Check if MetaMask is available
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed. Please install MetaMask to continue.");
      }
      
      // Get provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // PYUSD KYC Subscription Contract ABI (simplified)
      const subscriptionABI = [
        "function paySubscription() external",
        "event FeePaid(address indexed payer, uint256 amount, uint256 timestamp)"
      ];
      
      // Contract address (update this with your deployed contract address)
      const contractAddress = process.env.NEXT_PUBLIC_SUBSCRIPTION_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";
      
      if (contractAddress === "0x0000000000000000000000000000000000000000") {
        throw new Error("Contract address not configured. Please deploy the contract first.");
      }
      
      // Create contract instance
      const contract = new ethers.Contract(contractAddress, subscriptionABI, signer);
      
      // Call the paySubscription function
      const tx = await contract.paySubscription();
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      setPaymentStatus("COMPLETED");
      
      // Store payment status
      localStorage.setItem(`payment_status_${address}`, JSON.stringify({
        amount: paymentAmount,
        currency: "PYUSD",
        timestamp: new Date().toISOString(),
        status: "COMPLETED",
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber
      }));
      
      console.log("PYUSD payment completed successfully:", {
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber
      });
      
    } catch (err) {
      console.error("Payment failed:", err);
      alert(err.message || "Payment failed. Please check your PYUSD balance and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClaimGasReimbursement = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate gas reimbursement
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert("Gas reimbursement claimed successfully!");
    } catch (err) {
      console.error("Gas reimbursement failed:", err);
      alert("Gas reimbursement failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
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
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Coins className="w-3 h-3" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">PYUSD Payment Gateway</h1>
                  <p className="text-gray-400 text-xs">Step 7 of 8: KYC-gated PYUSD payments</p>
                </div>
              </div>
              
              <div className="flex justify-center mb-2">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => (
                    <div
                      key={step}
                      className={`w-1 h-1 rounded-full ${
                        step <= 7 ? "bg-blue-500" : "bg-gray-600"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* SBT Status Check */}
            <div className={`border rounded-lg p-2 mb-3 ${
              hasSBT ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"
            }`}>
              <div className="flex items-center space-x-2 mb-1">
                <Shield className={`w-3 h-3 ${hasSBT ? "text-green-500" : "text-red-500"}`} />
                <span className="font-semibold text-xs">
                  {hasSBT ? "SBT Verified" : "SBT Required"}
                </span>
              </div>
              {hasSBT ? (
                <div className="text-xs text-gray-300">
                  <p>✅ Token ID: #{sbtTokenId}</p>
                  <p>✅ KYC Status: Verified</p>
                  <p>✅ Access: Granted</p>
                </div>
              ) : (
                <div className="text-xs text-gray-300">
                  <p>❌ No SBT found in wallet</p>
                  <p>❌ KYC verification required</p>
                  <p>❌ Access: Denied</p>
                </div>
              )}
            </div>

            {/* Payment Interface */}
            {hasSBT ? (
              <div className="space-y-3">
                {paymentStatus === "PENDING" && (
                  <div className="text-center py-2">
                    <h3 className="text-sm font-semibold mb-2">Make PYUSD Payment</h3>
                    <p className="text-gray-400 text-xs mb-3">
                      Your SBT allows you to make PYUSD payments through our smart contract.
                    </p>
                    
                    <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-2 mb-3">
                      <label className="block text-xs font-medium mb-1">Payment Amount (PYUSD)</label>
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white/5 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                        placeholder="1.0"
                        min="0.1"
                        step="0.1"
                      />
                    </div>
                    
                    <button
                      onClick={handlePayWithPYUSD}
                      disabled={isProcessing}
                      className="px-4 py-1.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2 text-xs mx-auto"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processing Payment...</span>
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-3 h-3" />
                          <span>Pay {paymentAmount} PYUSD</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {paymentStatus === "COMPLETED" && (
                  <div className="text-center py-2">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <h3 className="text-sm font-bold text-green-500 mb-2">Payment Successful!</h3>
                    <p className="text-gray-400 text-xs mb-3">
                      Your PYUSD payment has been processed successfully.
                    </p>
                    
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2 mb-3">
                      <h4 className="font-semibold mb-1 text-xs">Payment Details</h4>
                      <div className="text-xs space-y-0.5">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Amount:</span>
                          <span>{paymentAmount} PYUSD</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Status:</span>
                          <span className="text-green-500">Completed</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Timestamp:</span>
                          <span>{new Date().toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleClaimGasReimbursement}
                      disabled={isProcessing}
                      className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2 text-xs mx-auto"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Claiming...</span>
                        </>
                      ) : (
                        <>
                          <Coins className="w-3 h-3" />
                          <span>Claim Gas Reimbursement</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-2">
                <Shield className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <h3 className="text-sm font-semibold mb-2">Access Denied</h3>
                <p className="text-gray-400 text-xs mb-3">
                  You need a valid SBT to make PYUSD payments. Please complete KYC verification first.
                </p>
                <button
                  onClick={() => router.push("/kyc/page1")}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-xs"
                >
                  Start KYC Verification
                </button>
              </div>
            )}

            {/* Contract Information */}
            <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-3 mt-4">
              <h4 className="font-semibold mb-2 text-sm flex items-center space-x-2">
                <ExternalLink className="w-3 h-3" />
                <span>Smart Contract Details</span>
              </h4>
              <div className="text-xs text-gray-300 space-y-1">
                <p>• Contract: PYUSDKYCSubscription</p>
                <p>• PYUSD Address: 0x6c3ea9036406852006290770bedfcaba0e23a0e8</p>
                <p>• Network: Ethereum Sepolia</p>
                <p>• Gas Reimbursement: Available</p>
                <p>• SBT Required: Yes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default AccessControlPage;