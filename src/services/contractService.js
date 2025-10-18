/**
 * Smart Contract Interaction Service
 * Handles SBT minting and payment gateway interactions
 */

import { ethers } from "ethers";

// Contract ABIs (simplified for demo)
const SBT_ABI = [
  "function mintSBT(address user, string memory kycReferenceId, uint8 riskScore, string memory amlStatus, uint256 expiryDays) external returns (uint256)",
  "function isUserVerified(address user) external view returns (bool)",
  "function getUserSBT(address user) external view returns (tuple(address user, uint256 verificationDate, uint256 expiryDate, string kycReferenceId, uint8 status, uint8 riskScore, string amlStatus))",
  "function revokeSBT(address user, string memory reason) external",
  "function renewSBT(address user, uint256 newExpiryDays) external",
  "function checkExpiry(address user) external",
  "event SBTMinted(address indexed user, uint256 indexed tokenId, string kycReferenceId, uint256 verificationDate, uint256 expiryDate)"
];

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
  }

  /**
   * Initialize SBT contract
   * @param {string} contractAddress - SBT contract address
   * @returns {ethers.Contract} - SBT contract instance
   */
  getSBTContract(contractAddress) {
    return new ethers.Contract(contractAddress, SBT_ABI, this.signer);
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
   * @param {string} sbtContractAddress - SBT contract address
   * @param {Object} kycData - KYC verification data
   * @returns {Promise<Object>} - Transaction result
   */
  async mintSBT(sbtContractAddress, kycData) {
    try {
      const sbtContract = this.getSBTContract(sbtContractAddress);
      
      const tx = await sbtContract.mintSBT(
        kycData.userAddress,
        kycData.referenceId,
        kycData.riskScore,
        kycData.amlStatus,
        kycData.expiryDays || 365
      );

      const receipt = await tx.wait();
      
      // Extract token ID from events
      const mintEvent = receipt.logs.find(log => {
        try {
          const parsed = sbtContract.interface.parseLog(log);
          return parsed.name === "SBTMinted";
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
      };
    } catch (error) {
      console.error("SBT minting failed:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to mint SBT",
      };
    }
  }

  /**
   * Check if user is verified
   * @param {string} sbtContractAddress - SBT contract address
   * @param {string} userAddress - User address
   * @returns {Promise<boolean>} - Verification status
   */
  async isUserVerified(sbtContractAddress, userAddress) {
    try {
      const sbtContract = this.getSBTContract(sbtContractAddress);
      const isVerified = await sbtContract.isUserVerified(userAddress);
      return isVerified;
    } catch (error) {
      console.error("Verification check failed:", error);
      return false;
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
