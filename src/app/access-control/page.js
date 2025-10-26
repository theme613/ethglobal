"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CheckCircle, Coins, Shield, DollarSign, ExternalLink } from "lucide-react"; // Added ExternalLink icon
import { getCurrentNetworkConfig, getPYUSDAddress } from "@/config/contracts";
import { getEtherscanTransactionUrl } from "@/services/etherscan"; // Import Etherscan utility

const AccessControlPage = () => {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const [hasSBT, setHasSBT] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("PENDING");
  const [isProcessing, setIsProcessing] = useState(false);
  const [sbtTokenId, setSbtTokenId] = useState(null);
  const [paymentAmount] = useState("10"); // Fixed amount for testnet
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAddingNetwork, setIsAddingNetwork] = useState(false);
  const [currentNetwork, setCurrentNetwork] = useState(null);

  // Optimized SBT status check and redirect
  useEffect(() => {
    if (!isConnected) {
      router.push("/");
      return;
    }
    
    if (address && !isInitialized) {
      const initializeData = async () => {
        try {
          // Check network status
          if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const network = await provider.getNetwork();
            setCurrentNetwork(network);
          }

          // Check SBT status
          const sbtStatus = localStorage.getItem(`sbt_status_${address}`);
          if (sbtStatus) {
            const parsed = JSON.parse(sbtStatus);
            setHasSBT(parsed.isActive);
            setSbtTokenId(parsed.tokenId);
          }
          
          // Check payment status
          const paymentStatus = localStorage.getItem(`payment_status_${address}`);
          if (paymentStatus) {
            const parsed = JSON.parse(paymentStatus);
            if (parsed.status === "COMPLETED") {
              setPaymentStatus("COMPLETED");
            }
          }
        } catch (error) {
          console.error("Error initializing data:", error);
        } finally {
          setIsInitialized(true);
        }
      };

      initializeData();
    }
  }, [isConnected, address, isInitialized]);

  const handleAuthorizeTransaction = async () => {
    if (!hasSBT) {
      alert("You need an SBT to authorize PYUSD transactions. Please complete KYC verification first.");
      return;
    }

    setIsProcessing(true);
    
    try {
      // Optimized: Early validation
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed. Please install MetaMask to continue.");
      }
      
      // Get provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Retrieve PYUSD address and ABI from config
      const pyusdAddress = getPYUSDAddress();
      const PYUSD_ABI = [
        "function approve(address spender, uint256 amount) returns (bool)",
        "function decimals() view returns (uint8)"
      ];
      const pyusdContract = new ethers.Contract(pyusdAddress, PYUSD_ABI, signer);

      // Fetch decimals from PYUSD contract
      const contractAddress = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318"; // PYUSDKYCSubscription contract
      
      const pyusdDecimals = await pyusdContract.decimals();
      const amountToApprove = ethers.utils.parseUnits(paymentAmount, pyusdDecimals);

      // First, prompt user to approve the PYUSDKYCSubscription contract to spend PYUSD
      console.log(`Approving PYUSDKYCSubscription contract (${contractAddress}) to spend ${paymentAmount} PYUSD...`);
      const approvalTx = await pyusdContract.approve(contractAddress, amountToApprove);
      await approvalTx.wait();
      console.log("PYUSD approval successful:", approvalTx.hash);

      // Force switch to Sepolia Testnet for PYUSD only
      const network = await provider.getNetwork();
      if (network.chainId !== 11155111) { // Sepolia chain ID
        // Force switch to Sepolia network
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }] // 11155111 in hex
          });
        } catch (switchError) {
          // If network doesn't exist, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0xaa36a7', // 11155111 in hex
                chainName: 'Ethereum Sepolia Testnet',
                nativeCurrency: {
                  name: 'SepoliaETH',
                  symbol: 'SepoliaETH',
                  decimals: 18
                },
                rpcUrls: ['https://sepolia.infura.io/v3/'],
                blockExplorerUrls: ['https://sepolia.etherscan.io/']
              }]
            });
          } else {
            throw new Error("Please switch to Ethereum Sepolia Testnet to use PYUSD transactions.");
          }
        }
      }
      
      // pyusdAddress is already declared above
      const subscriptionABI = [
        "function paySubscription() external",
        "function getStats() external view returns (uint256, uint256, uint256, uint256)",
        "function feeAmount() external view returns (uint256)",
        "function pyusd() external view returns (address)",
        "event FeePaid(address indexed payer, uint256 amount, uint256 timestamp)"
      ];
      
      // Create contract instance
      const contract = new ethers.Contract(contractAddress, subscriptionABI, signer);
      
      // Call the paySubscription function
      const tx = await contract.paySubscription();
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      setPaymentStatus("COMPLETED");
      
      // Optimized: Store payment status with minimal data
      const paymentData = {
        amount: paymentAmount,
        currency: "PYUSD",
        timestamp: Date.now(), // Use timestamp instead of ISO string for performance
        status: "COMPLETED",
        txHash: tx.hash,
        blockNumber: receipt.blockNumber
      };
      
      localStorage.setItem(`payment_status_${address}`, JSON.stringify(paymentData));
      
      console.log("PYUSD transaction authorized successfully:", {
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber
      });
      
    } catch (err) {
      console.error("PYUSD transaction authorization failed:", err);
      alert(err.message || "PYUSD transaction authorization failed. Please check your PYUSD balance on Sepolia testnet and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSwitchToSepolia = async () => {
    setIsAddingNetwork(true);
    
    try {
      // Force switch to Sepolia network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }] // 11155111 in hex
      });
      
      alert("Successfully switched to Sepolia Testnet for PYUSD transactions!");
    } catch (switchError) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xaa36a7', // 11155111 in hex
              chainName: 'Ethereum Sepolia Testnet',
              nativeCurrency: {
                name: 'SepoliaETH',
                symbol: 'SepoliaETH',
                decimals: 18
              },
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              blockExplorerUrls: ['https://sepolia.etherscan.io/']
            }]
          });
          
          // After adding, try to switch again
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }]
          });
          
          alert("Sepolia Testnet added and switched successfully for PYUSD transactions!");
        } catch (addError) {
          console.error("Failed to add Sepolia network:", addError);
          alert("Failed to add Sepolia Testnet. Please add it manually in your wallet.");
        }
      } else {
        console.error("Failed to switch to Sepolia network:", switchError);
        alert("Failed to switch to Sepolia Testnet. Please switch manually in your wallet.");
      }
    } finally {
      setIsAddingNetwork(false);
    }
  };

  const handleClaimGasReimbursement = async () => {
    setIsProcessing(true);
    
    try {
      // Optimized: Reduced simulation time for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert("Gas reimbursement claimed successfully!");
      router.push("/app"); // Redirect to the playground place
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

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Loading Access Control</h2>
          <p className="text-gray-400">Checking your verification status...</p>
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
                  <h1 className="text-lg font-bold">Authorization of KYC-vetted PYUSD Transaction</h1>
                  <p className="text-gray-400 text-xs">Step 7 of 8: KYC-gated PYUSD transactions</p>
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
                    <h3 className="text-sm font-semibold mb-2">Authorize PYUSD Transaction</h3>
                    <p className="text-gray-400 text-xs mb-3">
                      Your SBT allows you to authorize PYUSD transactions on Sepolia testnet. No ETH required.
                    </p>
                    
                    <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-2 mb-3">
                      <label className="block text-xs font-medium mb-1">Transaction Amount (PYUSD)</label>
                      <div className="w-full px-2 py-1.5 bg-white/5 rounded-lg border border-white/20 text-xs text-gray-300">
                        {paymentAmount} PYUSD (Fixed Testnet Amount)
                      </div>
                    </div>
                    
                    <button
                      onClick={handleAuthorizeTransaction}
                      disabled={isProcessing}
                      className="px-4 py-1.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2 text-xs mx-auto"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processing Transaction...</span>
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-3 h-3" />
                          <span>Authorize {paymentAmount} PYUSD</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {paymentStatus === "COMPLETED" && (
                  <div className="text-center py-2">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <h3 className="text-sm font-bold text-green-500 mb-2">PYUSD Transaction Authorized!</h3>
                    <p className="text-gray-400 text-xs mb-3">
                      Your PYUSD transaction on Sepolia testnet has been authorized successfully.
                    </p>
                    
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2 mb-3">
                      <h4 className="font-semibold mb-1 text-xs">Transaction Details</h4>
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
                        {paymentData?.txHash && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Etherscan:</span>
                            <a 
                              href={getEtherscanTransactionUrl(paymentData.txHash)} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-400 hover:underline flex items-center space-x-1"
                            >
                              <span>View Transaction</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
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
                  You need a valid SBT to authorize PYUSD transactions. Please complete KYC verification first.
                </p>
                <button
                  onClick={() => router.push("/kyc/page1")}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-xs"
                >
                  Start KYC Verification
                </button>
              </div>
            )}

            {/* PYUSD Network Information */}

          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default AccessControlPage;
