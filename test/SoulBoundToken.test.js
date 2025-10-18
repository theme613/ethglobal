const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SoulBoundToken", function () {
  let sbt;
  let owner;
  let kycProvider;
  let user;
  let user2;

  beforeEach(async function () {
    [owner, kycProvider, user, user2] = await ethers.getSigners();
    
    const SoulBoundToken = await ethers.getContractFactory("SoulBoundToken");
    sbt = await SoulBoundToken.deploy();
    await sbt.waitForDeployment();
    
    // Add KYC provider
    await sbt.addKYCProvider(kycProvider.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await sbt.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      expect(await sbt.name()).to.equal("KYCVerificationSBT");
      expect(await sbt.symbol()).to.equal("KYCSBT");
    });
  });

  describe("KYC Provider Management", function () {
    it("Should add KYC provider", async function () {
      expect(await sbt.kycProviders(kycProvider.address)).to.be.true;
    });

    it("Should remove KYC provider", async function () {
      await sbt.removeKYCProvider(kycProvider.address);
      expect(await sbt.kycProviders(kycProvider.address)).to.be.false;
    });

    it("Should only allow owner to manage providers", async function () {
      await expect(
        sbt.connect(user).addKYCProvider(user.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("SBT Minting", function () {
    it("Should mint SBT for verified user", async function () {
      const kycReferenceId = "BRIDGE-123456";
      const riskScore = 15;
      const amlStatus = "CLEAR";
      const expiryDays = 365;

      await sbt.connect(kycProvider).mintSBT(
        user.address,
        kycReferenceId,
        riskScore,
        amlStatus,
        expiryDays
      );

      expect(await sbt.balanceOf(user.address)).to.equal(1);
      expect(await sbt.isVerified(user.address)).to.be.true;
    });

    it("Should not allow duplicate SBT for same user", async function () {
      await sbt.connect(kycProvider).mintSBT(
        user.address,
        "BRIDGE-123456",
        15,
        "CLEAR",
        365
      );

      await expect(
        sbt.connect(kycProvider).mintSBT(
          user.address,
          "BRIDGE-789012",
          20,
          "CLEAR",
          365
        )
      ).to.be.revertedWith("User already verified");
    });

    it("Should only allow KYC providers to mint", async function () {
      await expect(
        sbt.connect(user).mintSBT(
          user2.address,
          "BRIDGE-123456",
          15,
          "CLEAR",
          365
        )
      ).to.be.revertedWith("Only KYC providers can call this function");
    });
  });

  describe("SBT Revocation", function () {
    beforeEach(async function () {
      await sbt.connect(kycProvider).mintSBT(
        user.address,
        "BRIDGE-123456",
        15,
        "CLEAR",
        365
      );
    });

    it("Should revoke SBT", async function () {
      await sbt.connect(kycProvider).revokeSBT(user.address, "Compliance violation");
      
      expect(await sbt.isVerified(user.address)).to.be.false;
    });

    it("Should only allow KYC providers to revoke", async function () {
      await expect(
        sbt.connect(user).revokeSBT(user.address, "Test reason")
      ).to.be.revertedWith("Only KYC providers can call this function");
    });
  });

  describe("SBT Expiry", function () {
    it("Should check and mark expired SBT", async function () {
      // Mint SBT with 1 day expiry
      await sbt.connect(kycProvider).mintSBT(
        user.address,
        "BRIDGE-123456",
        15,
        "CLEAR",
        1
      );

      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [2 * 24 * 60 * 60]); // 2 days
      await ethers.provider.send("evm_mine");

      // Check expiry
      await sbt.checkExpiry(user.address);
      
      expect(await sbt.isVerified(user.address)).to.be.false;
    });
  });

  describe("SBT Renewal", function () {
    beforeEach(async function () {
      await sbt.connect(kycProvider).mintSBT(
        user.address,
        "BRIDGE-123456",
        15,
        "CLEAR",
        365
      );
    });

    it("Should renew SBT", async function () {
      const newExpiryDays = 730; // 2 years
      
      await sbt.connect(kycProvider).renewSBT(user.address, newExpiryDays);
      
      const userSBT = await sbt.getUserSBT(user.address);
      expect(userSBT.status).to.equal(1); // VERIFIED
    });
  });

  describe("Non-transferable", function () {
    beforeEach(async function () {
      await sbt.connect(kycProvider).mintSBT(
        user.address,
        "BRIDGE-123456",
        15,
        "CLEAR",
        365
      );
    });

    it("Should not allow transfers", async function () {
      await expect(
        sbt.connect(user).transferFrom(user.address, user2.address, 0)
      ).to.be.revertedWith("SBT is non-transferable");
    });

    it("Should not allow approvals", async function () {
      await expect(
        sbt.connect(user).approve(user2.address, 0)
      ).to.be.revertedWith("SBT is non-transferable");
    });

    it("Should not allow setApprovalForAll", async function () {
      await expect(
        sbt.connect(user).setApprovalForAll(user2.address, true)
      ).to.be.revertedWith("SBT is non-transferable");
    });
  });

  describe("User Verification", function () {
    it("Should return false for unverified user", async function () {
      expect(await sbt.isUserVerified(user.address)).to.be.false;
    });

    it("Should return true for verified user", async function () {
      await sbt.connect(kycProvider).mintSBT(
        user.address,
        "BRIDGE-123456",
        15,
        "CLEAR",
        365
      );

      expect(await sbt.isUserVerified(user.address)).to.be.true;
    });

    it("Should return false for expired user", async function () {
      await sbt.connect(kycProvider).mintSBT(
        user.address,
        "BRIDGE-123456",
        15,
        "CLEAR",
        1
      );

      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [2 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      expect(await sbt.isUserVerified(user.address)).to.be.false;
    });
  });
});
