/**
 * @notice KYC Verification Helper Script
 * @dev Utilities for integrating Bridge API with smart contracts
 * @dev This script provides functions to manage KYC verification flow
 */

const hre = require("hardhat");

/**
 * Submit KYC verification via Bridge API
 * @param {string} userAddress - User wallet address
 * @param {Object} kycData - User KYC data from form
 * @param {string} bridgeApiKey - Bridge API key
 * @returns {Promise<Object>} Bridge API response
 */
async function submitKYCToBridgeAPI(userAddress, kycData, bridgeApiKey) {
  console.log("Submitting KYC to Bridge API...");
  console.log("User Address:", userAddress);

  try {
    // Prepare KYC data for Bridge API
    const payload = {
      userAddress: userAddress,
      firstName: kycData.firstName,
      lastName: kycData.lastName,
      dateOfBirth: kycData.dateOfBirth,
      countryOfResidence: kycData.countryOfResidence,
      identityDocumentType: kycData.documentType,
      identityDocumentNumber: kycData.documentNumber,
      email: kycData.email,
      phoneNumber: kycData.phoneNumber,
      selfieImage: kycData.selfieImage, // Base64 encoded
      documentImage: kycData.documentImage, // Base64 encoded
    };

    // In production, call Bridge API:
    // const response = await fetch('https://api.bridge.xyz/kyc/verify', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${bridgeApiKey}`
    //   },
    //   body: JSON.stringify(payload)
    // });
    //
    // const result = await response.json();
    // return result;

    // Mock response for testing
    const mockResponse = {
      referenceId: `BRIDGE-${Date.now()}`,
      status: "PENDING",
      riskScore: Math.floor(Math.random() * 30), // Mock risk score 0-30
      amlStatus: "PENDING",
      timestamp: new Date().toISOString(),
    };

    console.log("✓ KYC submitted to Bridge API");
    console.log("Reference ID:", mockResponse.referenceId);

    return mockResponse;
  } catch (error) {
    console.error("Error submitting KYC to Bridge API:", error);
    throw error;
  }
}

/**
 * Store KYC verification record on-chain
 * @param {string} kycVerificationAddress - KYCVerification contract address
 * @param {string} userAddress - User wallet address
 * @param {string} referenceId - Bridge API reference ID
 * @param {string} verificationData - Encrypted verification data
 * @returns {Promise<Object>} Transaction receipt
 */
async function storeKYCVerificationOnChain(
  kycVerificationAddress,
  userAddress,
  referenceId,
  verificationData
) {
  console.log("\nStoring KYC verification on-chain...");

  try {
    const [signer] = await hre.ethers.getSigners();
    const KYCVerification = await hre.ethers.getContractFactory("KYCVerification");
    const kycContract = KYCVerification.attach(kycVerificationAddress);

    // Submit verification
    const tx = await kycContract.submitVerification(
      userAddress,
      referenceId,
      verificationData
    );

    const receipt = await tx.wait();

    console.log("✓ KYC verification stored on-chain");
    console.log("Transaction Hash:", receipt.transactionHash);

    return receipt;
  } catch (error) {
    console.error("Error storing KYC verification on-chain:", error);
    throw error;
  }
}

/**
 * Approve KYC verification and mint SBT
 * @param {string} kycVerificationAddress - KYCVerification contract address
 * @param {string} soulBoundTokenAddress - SoulBoundToken contract address
 * @param {string} userAddress - User wallet address
 * @param {string} referenceId - Bridge API reference ID
 * @param {number} riskScore - Risk score from Bridge API (0-100)
 * @param {string} amlStatus - AML screening status
 * @returns {Promise<Object>} Minting transaction receipt
 */
async function approveKYCAndMintSBT(
  kycVerificationAddress,
  soulBoundTokenAddress,
  userAddress,
  referenceId,
  riskScore,
  amlStatus
) {
  console.log("\nApproving KYC and minting SBT...");

  try {
    const [signer] = await hre.ethers.getSigners();

    // Approve KYC verification
    const KYCVerification = await hre.ethers.getContractFactory("KYCVerification");
    const kycContract = KYCVerification.attach(kycVerificationAddress);

    console.log("  - Approving KYC verification...");
    const approveTx = await kycContract.approveVerification(
      userAddress,
      referenceId,
      riskScore,
      amlStatus
    );
    await approveTx.wait();
    console.log("  ✓ KYC approved");

    // Mint SBT
    const SoulBoundToken = await hre.ethers.getContractFactory("SoulBoundToken");
    const sbtContract = SoulBoundToken.attach(soulBoundTokenAddress);

    console.log("  - Minting SBT...");
    const expiryTime = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60; // 1 year
    const mintTx = await sbtContract.mintKYCToken(userAddress, expiryTime);
    const receipt = await mintTx.wait();

    console.log("✓ SBT minted successfully");
    console.log("Token ID:", receipt.logs[0]?.topics[3]?.toString());

    return receipt;
  } catch (error) {
    console.error("Error approving KYC and minting SBT:", error);
    throw error;
  }
}

/**
 * Reject KYC verification
 * @param {string} kycVerificationAddress - KYCVerification contract address
 * @param {string} userAddress - User wallet address
 * @param {string} referenceId - Bridge API reference ID
 * @param {string} reason - Rejection reason
 * @returns {Promise<Object>} Transaction receipt
 */
async function rejectKYC(kycVerificationAddress, userAddress, referenceId, reason) {
  console.log("\nRejecting KYC verification...");

  try {
    const [signer] = await hre.ethers.getSigners();
    const KYCVerification = await hre.ethers.getContractFactory("KYCVerification");
    const kycContract = KYCVerification.attach(kycVerificationAddress);

    const tx = await kycContract.rejectVerification(userAddress, referenceId, reason);
    const receipt = await tx.wait();

    console.log("✓ KYC rejected");
    console.log("Transaction Hash:", receipt.transactionHash);

    return receipt;
  } catch (error) {
    console.error("Error rejecting KYC:", error);
    throw error;
  }
}

/**
 * Check if user has valid KYC
 * @param {string} kycVerificationAddress - KYCVerification contract address
 * @param {string} userAddress - User wallet address
 * @returns {Promise<boolean>} True if user is verified and active
 */
async function isUserKYCVerified(kycVerificationAddress, userAddress) {
  try {
    const KYCVerification = await hre.ethers.getContractFactory("KYCVerification");
    const kycContract = KYCVerification.attach(kycVerificationAddress);

    const isVerified = await kycContract.isVerifiedAndActive(userAddress);

    return isVerified;
  } catch (error) {
    console.error("Error checking KYC status:", error);
    throw error;
  }
}

/**
 * Get user verification details
 * @param {string} kycVerificationAddress - KYCVerification contract address
 * @param {string} userAddress - User wallet address
 * @returns {Promise<Object>} User verification details
 */
async function getUserVerificationDetails(kycVerificationAddress, userAddress) {
  try {
    const KYCVerification = await hre.ethers.getContractFactory("KYCVerification");
    const kycContract = KYCVerification.attach(kycVerificationAddress);

    const record = await kycContract.getVerificationRecord(userAddress);
    const status = await kycContract.getVerificationStatus(userAddress);

    return {
      userAddress: record.userAddress,
      status: ["PENDING", "APPROVED", "REJECTED", "EXPIRED", "SUSPENDED"][status.status],
      submissionDate: new Date(record.submissionTimestamp * 1000),
      approvalDate: record.approvalTimestamp > 0 ? new Date(record.approvalTimestamp * 1000) : null,
      expiryDate: status.expiryTime > 0 ? new Date(status.expiryTime * 1000) : null,
      riskScore: status.riskScore.toString(),
      amlStatus: status.amlStatus,
      bridgeReferenceId: record.bridgeReferenceId,
    };
  } catch (error) {
    console.error("Error getting verification details:", error);
    throw error;
  }
}

// Export functions
module.exports = {
  submitKYCToBridgeAPI,
  storeKYCVerificationOnChain,
  approveKYCAndMintSBT,
  rejectKYC,
  isUserKYCVerified,
  getUserVerificationDetails,
};
