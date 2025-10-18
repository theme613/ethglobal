/**
 * @notice Test Suite for KYCVerification Contract
 * @dev Tests KYC/AML verification functionality
 * @dev Run with: npx hardhat test test/KYCVerification.test.js
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("KYCVerification", function () {
  let kycVerification;
  let admin;
  let provider1;
  let provider2;
  let user1;
  let user2;

  beforeEach(async function () {
    // Get signers
    [admin, provider1, provider2, user1, user2] = await ethers.getSigners();

    // Deploy contract
    const KYCVerification = await ethers.getContractFactory("KYCVerification");
    kycVerification = await KYCVerification.deploy();
    await kycVerification.deployed();

    // Add providers
    await kycVerification.addKYCProvider(provider1.address, "Provider 1");
    await kycVerification.addKYCProvider(provider2.address, "Provider 2");
  });

  describe("Deployment", function () {
    it("Should set admin correctly", async function () {
      expect(await kycVerification.admin()).to.equal(admin.address);
    });

    it("Should initialize default expiry period", async function () {
      const expiryPeriod = await kycVerification.verificationExpiryPeriod();
      expect(expiryPeriod).to.equal(365 * 24 * 60 * 60); // 365 days
    });

    it("Should initialize max risk score", async function () {
      expect(await kycVerification.maxAllowedRiskScore()).to.equal(50);
    });
  });

  describe("KYC Provider Management", function () {
    it("Should add new KYC provider", async function () {
      const provider = await ethers.Wallet.createRandom().getAddress();
      await kycVerification.addKYCProvider(provider, "New Provider");

      const providerInfo = await kycVerification.getProviderInfo(provider);
      expect(providerInfo.isActive).to.equal(true);
      expect(providerInfo.providerName).to.equal("New Provider");
    });

    it("Should emit KYCProviderAdded event", async function () {
      const provider = await ethers.Wallet.createRandom().getAddress();
      await expect(
        kycVerification.addKYCProvider(provider, "New Provider")
      ).to.emit(kycVerification, "KYCProviderAdded");
    });

    it("Should prevent adding duplicate provider", async function () {
      await expect(
        kycVerification.addKYCProvider(provider1.address, "Duplicate")
      ).to.be.revertedWith("Provider already exists");
    });

    it("Should only allow admin to add providers", async function () {
      const provider = await ethers.Wallet.createRandom().getAddress();
      await expect(
        kycVerification.connect(user1).addKYCProvider(provider, "New Provider")
      ).to.be.revertedWith("Only admin can call this function");
    });

    it("Should deactivate provider", async function () {
      await kycVerification.removeKYCProvider(provider1.address);
      const providerInfo = await kycVerification.getProviderInfo(provider1.address);
      expect(providerInfo.isActive).to.equal(false);
    });

    it("Should activate provider", async function () {
      await kycVerification.removeKYCProvider(provider1.address);
      await kycVerification.activateKYCProvider(provider1.address);

      const providerInfo = await kycVerification.getProviderInfo(provider1.address);
      expect(providerInfo.isActive).to.equal(true);
    });

    it("Should get all providers", async function () {
      const providers = await kycVerification.getAllProviders();
      expect(providers.length).to.equal(2);
      expect(providers).to.include(provider1.address);
      expect(providers).to.include(provider2.address);
    });
  });

  describe("Verification Submission", function () {
    it("Should submit verification request", async function () {
      const referenceId = "BRIDGE-REF-001";
      const verificationData = "encrypted-kyc-data";

      await kycVerification
        .connect(provider1)
        .submitVerification(user1.address, referenceId, verificationData);

      const record = await kycVerification.getVerificationRecord(user1.address);
      expect(record.userAddress).to.equal(user1.address);
      expect(record.bridgeReferenceId).to.equal(referenceId);
    });

    it("Should emit VerificationSubmitted event", async function () {
      const referenceId = "BRIDGE-REF-001";

      await expect(
        kycVerification
          .connect(provider1)
          .submitVerification(user1.address, referenceId, "data")
      ).to.emit(kycVerification, "VerificationSubmitted");
    });

    it("Should prevent non-provider from submitting", async function () {
      await expect(
        kycVerification
          .connect(user1)
          .submitVerification(user1.address, "REF-001", "data")
      ).to.be.revertedWith("Only active KYC providers can call this function");
    });

    it("Should prevent inactive provider from submitting", async function () {
      await kycVerification.removeKYCProvider(provider1.address);

      await expect(
        kycVerification
          .connect(provider1)
          .submitVerification(user1.address, "REF-001", "data")
      ).to.be.revertedWith("Only active KYC providers can call this function");
    });
  });

  describe("Verification Approval", function () {
    beforeEach(async function () {
      const referenceId = "BRIDGE-REF-001";
      await kycVerification
        .connect(provider1)
        .submitVerification(user1.address, referenceId, "data");
    });

    it("Should approve verification", async function () {
      const referenceId = "BRIDGE-REF-001";
      const riskScore = 20;

      await kycVerification
        .connect(provider1)
        .approveVerification(user1.address, referenceId, riskScore, "LOW_RISK");

      const status = await kycVerification.getVerificationStatus(user1.address);
      expect(status.status).to.equal(1); // APPROVED = 1
      expect(status.riskScore).to.equal(riskScore);
    });

    it("Should emit VerificationApproved event", async function () {
      const referenceId = "BRIDGE-REF-001";

      await expect(
        kycVerification
          .connect(provider1)
          .approveVerification(user1.address, referenceId, 20, "LOW_RISK")
      ).to.emit(kycVerification, "VerificationApproved");
    });

    it("Should prevent approval with high risk score", async function () {
      const referenceId = "BRIDGE-REF-001";

      await expect(
        kycVerification
          .connect(provider1)
          .approveVerification(user1.address, referenceId, 100, "HIGH_RISK")
      ).to.be.revertedWith("Risk score exceeds maximum allowed");
    });

    it("Should increment provider approval count", async function () {
      const referenceId = "BRIDGE-REF-001";

      await kycVerification
        .connect(provider1)
        .approveVerification(user1.address, referenceId, 20, "LOW_RISK");

      const providerInfo = await kycVerification.getProviderInfo(provider1.address);
      expect(providerInfo.approvalCount).to.equal(1);
    });
  });

  describe("Verification Rejection", function () {
    beforeEach(async function () {
      const referenceId = "BRIDGE-REF-001";
      await kycVerification
        .connect(provider1)
        .submitVerification(user1.address, referenceId, "data");
    });

    it("Should reject verification", async function () {
      const referenceId = "BRIDGE-REF-001";

      await kycVerification
        .connect(provider1)
        .rejectVerification(user1.address, referenceId, "Document not valid");

      const status = await kycVerification.getVerificationStatus(user1.address);
      expect(status.status).to.equal(2); // REJECTED = 2
    });

    it("Should emit VerificationRejected event", async function () {
      const referenceId = "BRIDGE-REF-001";

      await expect(
        kycVerification
          .connect(provider1)
          .rejectVerification(user1.address, referenceId, "Document not valid")
      ).to.emit(kycVerification, "VerificationRejected");
    });

    it("Should increment provider rejection count", async function () {
      const referenceId = "BRIDGE-REF-001";

      await kycVerification
        .connect(provider1)
        .rejectVerification(user1.address, referenceId, "Document not valid");

      const providerInfo = await kycVerification.getProviderInfo(provider1.address);
      expect(providerInfo.rejectionCount).to.equal(1);
    });
  });

  describe("Verification Suspension", function () {
    beforeEach(async function () {
      const referenceId = "BRIDGE-REF-001";
      await kycVerification
        .connect(provider1)
        .submitVerification(user1.address, referenceId, "data");

      await kycVerification
        .connect(provider1)
        .approveVerification(user1.address, referenceId, 20, "LOW_RISK");
    });

    it("Should suspend verified user", async function () {
      await kycVerification
        .connect(provider1)
        .suspendVerification(user1.address, "AML violations detected");

      const status = await kycVerification.getVerificationStatus(user1.address);
      expect(status.status).to.equal(4); // SUSPENDED = 4
    });

    it("Should emit VerificationSuspended event", async function () {
      await expect(
        kycVerification
          .connect(provider1)
          .suspendVerification(user1.address, "AML violations detected")
      ).to.emit(kycVerification, "VerificationSuspended");
    });

    it("Should prevent suspending non-approved verification", async function () {
      const referenceId2 = "BRIDGE-REF-002";
      await kycVerification
        .connect(provider1)
        .submitVerification(user2.address, referenceId2, "data");

      await expect(
        kycVerification
          .connect(provider1)
          .suspendVerification(user2.address, "Test")
      ).to.be.revertedWith("Only approved verifications can be suspended");
    });
  });

  describe("Risk Score Management", function () {
    beforeEach(async function () {
      const referenceId = "BRIDGE-REF-001";
      await kycVerification
        .connect(provider1)
        .submitVerification(user1.address, referenceId, "data");

      await kycVerification
        .connect(provider1)
        .approveVerification(user1.address, referenceId, 20, "LOW_RISK");
    });

    it("Should update risk score", async function () {
      await kycVerification
        .connect(provider1)
        .updateRiskScore(user1.address, 35);

      const status = await kycVerification.getVerificationStatus(user1.address);
      expect(status.riskScore).to.equal(35);
    });

    it("Should emit RiskScoreUpdated event", async function () {
      await expect(
        kycVerification.connect(provider1).updateRiskScore(user1.address, 35)
      ).to.emit(kycVerification, "RiskScoreUpdated");
    });

    it("Should prevent risk score exceeding maximum", async function () {
      await expect(
        kycVerification.connect(provider1).updateRiskScore(user1.address, 100)
      ).to.be.revertedWith("Risk score exceeds maximum allowed");
    });
  });

  describe("Configuration Management", function () {
    it("Should update expiry period", async function () {
      const newPeriod = 180 * 24 * 60 * 60; // 180 days
      await kycVerification.setVerificationExpiryPeriod(newPeriod);

      expect(await kycVerification.verificationExpiryPeriod()).to.equal(newPeriod);
    });

    it("Should update max risk score", async function () {
      await kycVerification.setMaxAllowedRiskScore(75);

      expect(await kycVerification.maxAllowedRiskScore()).to.equal(75);
    });

    it("Should prevent invalid max risk score", async function () {
      await expect(
        kycVerification.setMaxAllowedRiskScore(101)
      ).to.be.revertedWith("Risk score cannot exceed 100");
    });

    it("Should update admin", async function () {
      await kycVerification.setAdmin(user1.address);

      expect(await kycVerification.admin()).to.equal(user1.address);
    });

    it("Should only allow admin to update configuration", async function () {
      await expect(
        kycVerification.connect(user1).setMaxAllowedRiskScore(75)
      ).to.be.revertedWith("Only admin can call this function");
    });
  });

  describe("Verification Status Queries", function () {
    it("Should check if user is verified and active", async function () {
      const referenceId = "BRIDGE-REF-001";
      await kycVerification
        .connect(provider1)
        .submitVerification(user1.address, referenceId, "data");

      await kycVerification
        .connect(provider1)
        .approveVerification(user1.address, referenceId, 20, "LOW_RISK");

      expect(await kycVerification.isVerifiedAndActive(user1.address)).to.equal(true);
    });

    it("Should return false for non-verified user", async function () {
      expect(await kycVerification.isVerifiedAndActive(user1.address)).to.equal(false);
    });

    it("Should return false for expired verification", async function () {
      // Set short expiry period
      await kycVerification.setVerificationExpiryPeriod(10); // 10 seconds

      const referenceId = "BRIDGE-REF-001";
      await kycVerification
        .connect(provider1)
        .submitVerification(user1.address, referenceId, "data");

      await kycVerification
        .connect(provider1)
        .approveVerification(user1.address, referenceId, 20, "LOW_RISK");

      // Wait for expiry
      await ethers.provider.send("evm_increaseTime", [11]);
      await ethers.provider.send("evm_mine");

      expect(await kycVerification.isVerifiedAndActive(user1.address)).to.equal(false);
    });
  });
});
