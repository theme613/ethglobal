/**
 * Smart Contract Interaction Service
 * Handles SBT minting and payment gateway interactions with real MetaMask transactions
 */

import { ethers } from "ethers";

// Import actual contract ABIs from artifacts
import SoulBoundTokenABI from "../../artifacts/contracts/SoulBoundToken.sol/SoulBoundToken.json";
import PYUSDKYCSubscriptionABI from "../../artifacts/contracts/PYUSDKYCSubscription.sol/PYUSDKYCSubscription.json";
import PYUSDPaymentGatewayABI from "../../artifacts/contracts/PYUSDPaymentGateway.sol/PYUSDPaymentGateway.json";
import MockPYUSDABI from "../../artifacts/contracts/MockPYUSD.sol/MockPYUSD.json";

// Contract addresses (update these with your deployed contract addresses)
const CONTRACT_ADDRESSES = {
  // Update these with your actual deployed contract addresses
  SoulBoundToken: process.env.NEXT_PUBLIC_SBT_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000",
  PYUSDKYCSubscription: process.env.NEXT_PUBLIC_SUBSCRIPTION_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000",
  PYUSDPaymentGateway: process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_ADDRESS || "0x0000000000000000000000000000000000000000",
  MockPYUSD: process.env.NEXT_PUBLIC_MOCK_PYUSD_ADDRESS || "0x0000000000000000000000000000000000000000",
};

const PAYMENT_GATEWAY_ABI = [
  "function initiatePayment(address to, uint256 amount, string memory description, string memory paymentId) external",
  "function completePayment(string memory paymentId) external",
  "function canMakePayment(address user, uint256 amount) external view returns (bool, string memory)",
  "function getPayment(string memory paymentId) external view returns (tuple(address from, address to, uint256 amount, uint256 timestamp, string description, bool completed, string paymentId))",
  "function getUserPayments(address user) external view returns (string[] memory)",
  "event PaymentInitiated(string indexed paymentId, address indexed from, address indexed to, uint256 amount, string description)",
  "event PaymentCompleted(string indexed paymentId, address indexed from, address indexed to, uint256 amount, uint256 fee)"
];

export class ContractService {
  constructor(provider, signer) {
    this.provider = provider;
    this.signer = signer;
    this.contractAddresses = CONTRACT_ADDRESSES;
  }

  /**
   * Initialize SBT contract
   * @param {string} contractAddress - SBT contract address (optional, uses default if not provided)
   * @returns {ethers.Contract} - SBT contract instance
   */
  getSBTContract(contractAddress = this.contractAddresses.SoulBoundToken) {
    return new ethers.Contract(contractAddress, SoulBoundTokenABI.abi, this.signer);
  }

  /**
   * Initialize PYUSD KYC Subscription contract
   * @param {string} contractAddress - Contract address (optional, uses default if not provided)
   * @returns {ethers.Contract} - Contract instance
   */
  getSubscriptionContract(contractAddress = this.contractAddresses.PYUSDKYCSubscription) {
    return new ethers.Contract(contractAddress, PYUSDKYCSubscriptionABI.abi, this.signer);
  }

  /**
   * Initialize Payment Gateway contract
   * @param {string} contractAddress - Contract address (optional, uses default if not provided)
   * @returns {ethers.Contract} - Contract instance
   */
  getPaymentGatewayContract(contractAddress = this.contractAddresses.PYUSDPaymentGateway) {
    return new ethers.Contract(contractAddress, PYUSDPaymentGatewayABI.abi, this.signer);
  }

  /**
   * Initialize Mock PYUSD contract
   * @param {string} contractAddress - Contract address (optional, uses default if not provided)
   * @returns {ethers.Contract} - Contract instance
   */
  getMockPYUSDContract(contractAddress = this.contractAddresses.MockPYUSD) {
    return new ethers.Contract(contractAddress, MockPYUSDABI.abi, this.signer);
  }

  /**
   * Initialize Payment Gateway contract
   * @param {string} contractAddress - Payment Gateway contract address
   * @returns {ethers.Contract} - Payment Gateway contract instance
   */
  getPaymentGatewayContract(contractAddress) {
    return new ethers.Contract(contractAddress, PAYMENT_GATEWAY_ABI, this.signer);
  }

  /**
   * Mint SBT for verified user
   * @param {Object} kycData - KYC verification data
   * @returns {Promise<Object>} - Transaction result
   */
  async mintSBT(kycData) {
    try {
      if (!this.signer) {
        throw new Error("No signer available. Please connect your wallet.");
      }

      const sbtContract = this.getSBTContract();
      
      // Call the actual mint function from the SoulBoundToken contract
      const tx = await sbtContract.mint(kycData.userAddress);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      // Extract token ID from events
      const mintEvent = receipt.logs.find(log => {
        try {
          const parsed = sbtContract.interface.parseLog(log);
          return parsed.name === "Minted";
        } catch (e) {
          return false;
        }
      });

      let tokenId = null;
      if (mintEvent) {
        const parsed = sbtContract.interface.parseLog(mintEvent);
        tokenId = parsed.args.tokenId.toString();
      }

      return {
        success: true,
        transactionHash: tx.hash,
        tokenId,
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber,
        receipt,
      };
    } catch (error) {
      console.error("SBT minting failed:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to mint SBT. Please check your wallet connection and try again.",
      };
    }
  }

  /**
   * Check if user is verified
   * @param {string} userAddress - User address
   * @returns {Promise<boolean>} - Verification status
   */
  async isUserVerified(userAddress) {
    try {
      const sbtContract = this.getSBTContract();
      const isVerified = await sbtContract.isKYCVerified(userAddress);
      return isVerified;
    } catch (error) {
      console.error("Verification check failed:", error);
      return false;
    }
  }

  /**
   * Pay PYUSD subscription fee
   * @returns {Promise<Object>} - Transaction result
   */
  async paySubscription() {
    try {
      if (!this.signer) {
        throw new Error("No signer available. Please connect your wallet.");
      }

      const subscriptionContract = this.getSubscriptionContract();
      
      // Call the paySubscription function
      const tx = await subscriptionContract.paySubscription();
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: tx.hash,
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber,
        receipt,
      };
    } catch (error) {
      console.error("Subscription payment failed:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to pay subscription. Please check your PYUSD balance and wallet connection.",
      };
    }
  }

  /**
   * Claim ETH gas reimbursement
   * @param {string} ethAmount - Amount of ETH to claim in wei
   * @returns {Promise<Object>} - Transaction result
   */
  async claimEthGas(ethAmount) {
    try {
      if (!this.signer) {
        throw new Error("No signer available. Please connect your wallet.");
      }

      const subscriptionContract = this.getSubscriptionContract();
      
      // Call the claimEthGas function
      const tx = await subscriptionContract.claimEthGas(ethAmount);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: tx.hash,
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber,
        receipt,
      };
    } catch (error) {
      console.error("ETH gas claim failed:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to claim ETH gas reimbursement.",
      };
    }
  }

  /**
   * Get user SBT details
   * @param {string} sbtContractAddress - SBT contract address
   * @param {string} userAddress - User address
   * @returns {Promise<Object>} - SBT details
   */
  async getUserSBT(sbtContractAddress, userAddress) {
    try {
      const sbtContract = this.getSBTContract(sbtContractAddress);
      const sbtData = await sbtContract.getUserSBT(userAddress);
      
      return {
        success: true,
        data: {
          user: sbtData.user,
          verificationDate: new Date(Number(sbtData.verificationDate) * 1000),
          expiryDate: new Date(Number(sbtData.expiryDate) * 1000),
          kycReferenceId: sbtData.kycReferenceId,
          status: Number(sbtData.status),
          riskScore: Number(sbtData.riskScore),
          amlStatus: sbtData.amlStatus,
        },
      };
    } catch (error) {
      console.error("SBT details fetch failed:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch SBT details",
      };
    }
  }

  /**
   * Initiate payment
   * @param {string} paymentGatewayAddress - Payment Gateway contract address
   * @param {Object} paymentData - Payment details
   * @returns {Promise<Object>} - Transaction result
   */
  async initiatePayment(paymentGatewayAddress, paymentData) {
    try {
      const paymentContract = this.getPaymentGatewayContract(paymentGatewayAddress);
      
      const tx = await paymentContract.initiatePayment(
        paymentData.to,
        ethers.parseUnits(paymentData.amount.toString(), 6), // PYUSD has 6 decimals
        paymentData.description,
        paymentData.paymentId
      );

      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: tx.hash,
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      console.error("Payment initiation failed:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to initiate payment",
      };
    }
  }

  /**
   * Complete payment
   * @param {string} paymentGatewayAddress - Payment Gateway contract address
   * @param {string} paymentId - Payment ID
   * @returns {Promise<Object>} - Transaction result
   */
  async completePayment(paymentGatewayAddress, paymentId) {
    try {
      const paymentContract = this.getPaymentGatewayContract(paymentGatewayAddress);
      
      const tx = await paymentContract.completePayment(paymentId);
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: tx.hash,
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      console.error("Payment completion failed:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to complete payment",
      };
    }
  }

  /**
   * Check if user can make payment
   * @param {string} paymentGatewayAddress - Payment Gateway contract address
   * @param {string} userAddress - User address
   * @param {number} amount - Payment amount
   * @returns {Promise<Object>} - Payment eligibility
   */
  async canMakePayment(paymentGatewayAddress, userAddress, amount) {
    try {
      const paymentContract = this.getPaymentGatewayContract(paymentGatewayAddress);
      
      const [canPay, reason] = await paymentContract.canMakePayment(
        userAddress,
        ethers.parseUnits(amount.toString(), 6)
      );
      
      return {
        success: true,
        canPay,
        reason,
      };
    } catch (error) {
      console.error("Payment eligibility check failed:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to check payment eligibility",
      };
    }
  }

  /**
   * Get payment details
   * @param {string} paymentGatewayAddress - Payment Gateway contract address
   * @param {string} paymentId - Payment ID
   * @returns {Promise<Object>} - Payment details
   */
  async getPayment(paymentGatewayAddress, paymentId) {
    try {
      const paymentContract = this.getPaymentGatewayContract(paymentGatewayAddress);
      const payment = await paymentContract.getPayment(paymentId);
      
      return {
        success: true,
        data: {
          from: payment.from,
          to: payment.to,
          amount: ethers.formatUnits(payment.amount, 6),
          timestamp: new Date(Number(payment.timestamp) * 1000),
          description: payment.description,
          completed: payment.completed,
          paymentId: payment.paymentId,
        },
      };
    } catch (error) {
      console.error("Payment details fetch failed:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch payment details",
      };
    }
  }

  /**
   * Get user payment history
   * @param {string} paymentGatewayAddress - Payment Gateway contract address
   * @param {string} userAddress - User address
   * @returns {Promise<Object>} - Payment history
   */
  async getUserPayments(paymentGatewayAddress, userAddress) {
    try {
      const paymentContract = this.getPaymentGatewayContract(paymentGatewayAddress);
      const paymentIds = await paymentContract.getUserPayments(userAddress);
      
      return {
        success: true,
        paymentIds,
      };
    } catch (error) {
      console.error("Payment history fetch failed:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch payment history",
      };
    }
  }

  /**
   * Revoke SBT
   * @param {string} sbtContractAddress - SBT contract address
   * @param {string} userAddress - User address
   * @param {string} reason - Revocation reason
   * @returns {Promise<Object>} - Transaction result
   */
  async revokeSBT(sbtContractAddress, userAddress, reason) {
    try {
      const sbtContract = this.getSBTContract(sbtContractAddress);
      
      const tx = await sbtContract.revokeSBT(userAddress, reason);
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: tx.hash,
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      console.error("SBT revocation failed:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to revoke SBT",
      };
    }
  }

  /**
   * Renew SBT
   * @param {string} sbtContractAddress - SBT contract address
   * @param {string} userAddress - User address
   * @param {number} newExpiryDays - New expiry period in days
   * @returns {Promise<Object>} - Transaction result
   */
  async renewSBT(sbtContractAddress, userAddress, newExpiryDays) {
    try {
      const sbtContract = this.getSBTContract(sbtContractAddress);
      
      const tx = await sbtContract.renewSBT(userAddress, newExpiryDays);
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: tx.hash,
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      console.error("SBT renewal failed:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to renew SBT",
      };
    }
  }
}

// Export utility functions
export const formatEther = (value) => ethers.formatEther(value);
export const parseEther = (value) => ethers.parseEther(value);
export const formatUnits = (value, decimals) => ethers.formatUnits(value, decimals);
export const parseUnits = (value, decimals) => ethers.parseUnits(value, decimals);
