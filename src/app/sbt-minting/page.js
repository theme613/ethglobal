"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CheckCircle, Shield, Coins, ExternalLink } from "lucide-react";
import { CONTRACT_ADDRESSES, getPYUSDAddress } from "@/config/contracts";
import { getEtherscanTransactionUrl } from "@/services/etherscan";

const SBTMintingPage = () => {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState("PENDING");
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  const PAYMENT_AMOUNT = "10"; // 10 PYUSD
  const RECIPIENT_CONTRACT = "0x6c3ea9036406852006290770BEdFcAbA0e23A0e8";

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  // Check existing payment status
  useEffect(() => {
    const checkExistingPayment = async () => {
      if (!isConnected || !address) return;
      
      try {
        // Check localStorage first
        const storedPayment = localStorage.getItem(`sbt_status_${address}`);
        if (storedPayment) {
          const paymentData = JSON.parse(storedPayment);
          if (paymentData.isActive && paymentData.transactionHash) {
            setTxHash(paymentData.transactionHash);
            setPaymentStatus("COMPLETED");
            setIsCheckingStatus(false);
            return;
          }
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkExistingPayment();
  }, [isConnected, address]);

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Check if MetaMask is available
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed. Please install MetaMask to continue.");
      }
      
      // Get provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // PYUSD ERC-20 ABI
      const pyusdABI = [
        "function transfer(address to, uint256 amount) returns (bool)",
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)"
      ];
      
      // Get PYUSD contract address
      const pyusdAddress = getPYUSDAddress();
      
      // Create PYUSD contract instance
      const pyusdContract = new ethers.Contract(pyusdAddress, pyusdABI, signer);
      
      // Get decimals (should be 6 for PYUSD)
      const decimals = await pyusdContract.decimals();
      console.log("PYUSD decimals:", decimals);
      
      // Calculate amount with decimals (10 PYUSD with 6 decimals = 10000000)
      const amount = ethers.utils.parseUnits(PAYMENT_AMOUNT, decimals);
      
      // Check user's PYUSD balance
      const balance = await pyusdContract.balanceOf(address);
      if (balance.lt(amount)) {
        throw new Error(`Insufficient PYUSD balance. You need ${PAYMENT_AMOUNT} PYUSD but have ${ethers.utils.formatUnits(balance, decimals)} PYUSD.`);
      }
      
      // Transfer PYUSD to the recipient contract
      console.log(`Transferring ${PAYMENT_AMOUNT} PYUSD to ${RECIPIENT_CONTRACT}...`);
      const tx = await pyusdContract.transfer(RECIPIENT_CONTRACT, amount);
      
      console.log("Transaction sent:", tx.hash);
      setTxHash(tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      setPaymentStatus("COMPLETED");
      
      // Store payment status in localStorage
      localStorage.setItem(`sbt_status_${address}`, JSON.stringify({
        tokenId: tx.hash.substring(0, 10), // Use part of tx hash as ID
        mintedAt: new Date().toISOString(),
        isActive: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        amount: PAYMENT_AMOUNT,
        recipient: RECIPIENT_CONTRACT
      }));
      
      console.log("PYUSD payment successful:", {
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        amount: PAYMENT_AMOUNT,
        recipient: RECIPIENT_CONTRACT
      });
      
    } catch (err) {
      setError(err.message || "Failed to process PYUSD payment. Please check your wallet connection and try again.");
      console.error("PYUSD payment failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContinueToPayment = () => {
    router.push("/app");
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
                  <Coins className="w-3 h-3" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">10 PYUSD Minting</h1>
                  <p className="text-gray-400 text-xs">Step 6 of 8: Complete your 10 PYUSD minting</p>
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

            {/* Payment Information */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2 mb-3">
              <h4 className="font-semibold mb-1 text-xs flex items-center space-x-2">
                <Coins className="w-3 h-3" />
                <span>Minting Details</span>
              </h4>
              <p className="text-gray-400 text-xs mb-1">
                Complete your {PAYMENT_AMOUNT} PYUSD minting to proceed with the KYC verification process.
              </p>
              <div className="text-xs text-gray-300">
                <p>• Amount: {PAYMENT_AMOUNT} PYUSD</p>
                <p>• Token: PayPal USD (PYUSD)</p>
                <p>• Network: Ethereum Sepolia</p>
                <p>• Decimals: 6</p>
              </div>
            </div>

            {/* Loading State */}
            {isCheckingStatus && (
              <div className="text-center py-3">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <h3 className="text-sm font-semibold mb-1">Checking Minting Status</h3>
                <p className="text-gray-400 text-xs">Verifying your minting status...</p>
              </div>
            )}

            {/* Payment Status */}
            {!isCheckingStatus && paymentStatus === "PENDING" && (
              <div className="text-center py-3">
                <Coins className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h3 className="text-sm font-semibold mb-1">Ready to Mint</h3>
                <p className="text-gray-400 text-xs mb-3">
                  Mint {PAYMENT_AMOUNT} PYUSD to complete your verification.
                </p>
                
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 mb-3">
                    <p className="text-red-400 text-xs">{error}</p>
                  </div>
                )}
                
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2 text-xs mx-auto"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing Minting...</span>
                    </>
                  ) : (
                    <>
                      <Coins className="w-3 h-3" />
                      <span>Mint {PAYMENT_AMOUNT} PYUSD</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {!isCheckingStatus && paymentStatus === "COMPLETED" && txHash && (
              <div className="text-center py-2">
                <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-1" />
                <h3 className="text-sm font-bold text-green-500 mb-1">Minting Successful!</h3>
                <p className="text-gray-400 text-xs mb-2">
                  Your {PAYMENT_AMOUNT} PYUSD minting has been completed successfully. KYC verified!
                </p>
                
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2 mb-2">
                  <h4 className="font-semibold mb-1 text-xs">Transaction Details</h4>
                  <div className="text-xs space-y-0.5">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Amount:</span>
                      <span>{PAYMENT_AMOUNT} PYUSD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className="text-green-500">Completed</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Recipient:</span>
                      <span className="font-mono text-xs">{RECIPIENT_CONTRACT.substring(0, 6)}...{RECIPIENT_CONTRACT.substring(38)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Etherscan:</span>
                      <a 
                        href={getEtherscanTransactionUrl(txHash)} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-400 hover:underline flex items-center space-x-1"
                      >
                        <span>View Transaction</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleContinueToPayment}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-xs"
                >
                  Go to Playground
                </button>
              </div>
            )}

            {/* Contract Info */}
            <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-2 mt-3">
              <h4 className="font-semibold mb-1 text-xs flex items-center space-x-2">
                <Shield className="w-3 h-3" />
                <span>Recipient Contract</span>
              </h4>
              <p className="text-gray-400 text-xs mb-1">
                Your minting will be sent to the following contract address:
              </p>
              <div className="text-xs text-gray-300">
                <p className="font-mono break-all">{RECIPIENT_CONTRACT}</p>
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
