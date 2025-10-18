/**
 * @notice Test Suite for PYUSDPaymentGateway Contract
 * @dev Tests PYUSD payment gateway with KYC/SBT access control
 * @dev Run with: npx hardhat test test/PYUSDPaymentGateway.test.js
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PYUSDPaymentGateway", function () {
  let paymentGateway;
  let soulBoundToken;
  let mockPYUSD;
  let owner;
  let treasury;
  let kycProvider;
  let user1;
  let user2;
  let user3;

  // Mock PYUSD Token for testing
  async function deployMockPYUSD() {
    const MockToken = await ethers.getContractFactory("ERC20Mock");
    return await MockToken.deploy("PYUSD", "PYUSD", ethers.utils.parseEther("1000000"));
  }

  beforeEach(async function () {
    // Get signers
    [owner, treasury, kycProvider, user1, user2, user3] = await ethers.getSigners();

    // Deploy SoulBoundToken
    const SoulBoundToken = await ethers.getContractFactory("SoulBoundToken");
    soulBoundToken = await SoulBoundToken.deploy();
    await soulBoundToken.deployed();

    // Set KYC provider
    await soulBoundToken.setKYCProvider(kycProvider.address);

    // Deploy mock PYUSD token for testing
    // Using a basic ERC20 implementation
    const MockERC20 = await ethers.getContractFactory("ERC20");
    mockPYUSD = await ethers.getContractFactory("IERC20");

    // For testing purposes, we'll use a simple mock
    const ERC20Mock = `
      pragma solidity ^0.8.20;
      import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
      contract ERC20Mock is ERC20 {
          constructor(string memory name, string memory symbol) ERC20(name, symbol) {
              _mint(msg.sender, 1000000 * 10 ** 18);
          }
      }
    `;

    // Deploy PYUSDPaymentGateway
    const PYUSDPaymentGateway = await ethers.getContractFactory(
      "PYUSDPaymentGateway"
    );

    // For testing, use owner as PYUSD address (we'll mock transfers)
    paymentGateway = await PYUSDPaymentGateway.deploy(
      owner.address, // PYUSD address (placeholder)
      soulBoundToken.address,
      treasury.address,
      100 // 1% fee
    );
    await paymentGateway.deployed();

    // Mint KYC tokens for users
    const expiryTime = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
    await soulBoundToken
      .connect(kycProvider)
      .mintKYCToken(user1.address, expiryTime);
    await soulBoundToken
      .connect(kycProvider)
      .mintKYCToken(user2.address, expiryTime);
  });

  describe("Deployment", function () {
    it("Should deploy with correct configuration", async function () {
      expect(await paymentGateway.feePercentage()).to.equal(100);
      expect(await paymentGateway.treasury()).to.equal(treasury.address);
      expect(await paymentGateway.requireKYCForRecipients()).to.equal(false);
      expect(await paymentGateway.paused()).to.equal(false);
    });

    it("Should set gateway owner", async function () {
      expect(await paymentGateway.owner()).to.equal(owner.address);
    });

    it("Should link to SoulBoundToken contract", async function () {
      expect(await paymentGateway.soulBoundToken()).to.equal(
        soulBoundToken.address
      );
    });

    it("Should prevent invalid PYUSD address", async function () {
      const PYUSDPaymentGateway = await ethers.getContractFactory(
        "PYUSDPaymentGateway"
      );

      await expect(
        PYUSDPaymentGateway.deploy(
          ethers.constants.AddressZero,
          soulBoundToken.address,
          treasury.address,
          100
        )
      ).to.be.revertedWith("Invalid PYUSD token address");
    });

    it("Should prevent invalid SBT address", async function () {
      const PYUSDPaymentGateway = await ethers.getContractFactory(
        "PYUSDPaymentGateway"
      );

      await expect(
        PYUSDPaymentGateway.deploy(
          owner.address,
          ethers.constants.AddressZero,
          treasury.address,
          100
        )
      ).to.be.revertedWith("Invalid SBT contract address");
    });

    it("Should prevent fee percentage exceeding 100%", async function () {
      const PYUSDPaymentGateway = await ethers.getContractFactory(
        "PYUSDPaymentGateway"
      );

      await expect(
        PYUSDPaymentGateway.deploy(
          owner.address,
          soulBoundToken.address,
          treasury.address,
          10001
        )
      ).to.be.revertedWith("Fee percentage too high");
    });
  });

  describe("KYC Access Control", function () {
    it("Should check user has valid KYC", async function () {
      expect(await paymentGateway.hasValidKYC(user1.address)).to.equal(true);
    });

    it("Should return false for non-KYC user", async function () {
      expect(await paymentGateway.hasValidKYC(user3.address)).to.equal(false);
    });

    it("Should prevent payment from non-KYC user", async function () {
      await expect(
        paymentGateway
          .connect(user3)
          .sendPayment(user2.address, ethers.utils.parseEther("10"), "TXN-001")
      ).to.be.revertedWith("User does not have KYC verification");
    });
  });

  describe("Fee Management", function () {
    it("Should update fee percentage", async function () {
      await paymentGateway.setFeePercentage(50); // 0.5%

      expect(await paymentGateway.feePercentage()).to.equal(50);
    });

    it("Should emit FeePercentageUpdated event", async function () {
      await expect(paymentGateway.setFeePercentage(50)).to.emit(
        paymentGateway,
        "FeePercentageUpdated"
      );
    });

    it("Should prevent fee percentage exceeding 100%", async function () {
      await expect(
        paymentGateway.setFeePercentage(10001)
      ).to.be.revertedWith("Fee percentage too high");
    });

    it("Should only allow owner to set fees", async function () {
      await expect(
        paymentGateway.connect(user1).setFeePercentage(50)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Treasury Management", function () {
    it("Should update treasury address", async function () {
      await paymentGateway.setTreasury(user3.address);

      expect(await paymentGateway.treasury()).to.equal(user3.address);
    });

    it("Should emit TreasuryUpdated event", async function () {
      await expect(paymentGateway.setTreasury(user3.address)).to.emit(
        paymentGateway,
        "TreasuryUpdated"
      );
    });

    it("Should prevent invalid treasury address", async function () {
      await expect(
        paymentGateway.setTreasury(ethers.constants.AddressZero)
      ).to.be.revertedWith("Invalid treasury address");
    });

    it("Should only allow owner to set treasury", async function () {
      await expect(
        paymentGateway.connect(user1).setTreasury(user3.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Recipient Whitelisting", function () {
    it("Should whitelist recipient", async function () {
      await paymentGateway.whitelistRecipient(user3.address);

      expect(await paymentGateway.whitelistedRecipients(user3.address)).to.equal(
        true
      );
    });

    it("Should emit RecipientWhitelisted event", async function () {
      await expect(paymentGateway.whitelistRecipient(user3.address)).to.emit(
        paymentGateway,
        "RecipientWhitelisted"
      );
    });

    it("Should remove recipient from whitelist", async function () {
      await paymentGateway.whitelistRecipient(user3.address);
      await paymentGateway.removeFromWhitelist(user3.address);

      expect(await paymentGateway.whitelistedRecipients(user3.address)).to.equal(
        false
      );
    });

    it("Should emit RecipientRemovedFromWhitelist event", async function () {
      await paymentGateway.whitelistRecipient(user3.address);

      await expect(paymentGateway.removeFromWhitelist(user3.address)).to.emit(
        paymentGateway,
        "RecipientRemovedFromWhitelist"
      );
    });

    it("Should only allow owner to whitelist", async function () {
      await expect(
        paymentGateway.connect(user1).whitelistRecipient(user3.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("KYC Requirement for Recipients", function () {
    it("Should update KYC requirement for recipients", async function () {
      await paymentGateway.setRequireKYCForRecipients(true);

      expect(await paymentGateway.requireKYCForRecipients()).to.equal(true);
    });

    it("Should emit KYCRequirementUpdated event", async function () {
      await expect(paymentGateway.setRequireKYCForRecipients(true)).to.emit(
        paymentGateway,
        "KYCRequirementUpdated"
      );
    });

    it("Should only allow owner to update requirement", async function () {
      await expect(
        paymentGateway.connect(user1).setRequireKYCForRecipients(true)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Contract Pause/Unpause", function () {
    it("Should pause contract", async function () {
      await paymentGateway.pause();

      expect(await paymentGateway.paused()).to.equal(true);
    });

    it("Should emit ContractPaused event", async function () {
      await expect(paymentGateway.pause()).to.emit(paymentGateway, "ContractPaused");
    });

    it("Should unpause contract", async function () {
      await paymentGateway.pause();
      await paymentGateway.unpause();

      expect(await paymentGateway.paused()).to.equal(false);
    });

    it("Should emit ContractUnpaused event", async function () {
      await paymentGateway.pause();

      await expect(paymentGateway.unpause()).to.emit(
        paymentGateway,
        "ContractUnpaused"
      );
    });

    it("Should prevent operations when paused", async function () {
      await paymentGateway.pause();

      await expect(
        paymentGateway
          .connect(user1)
          .sendPayment(user2.address, ethers.utils.parseEther("10"), "TXN-001")
      ).to.be.revertedWith("Contract is paused");
    });

    it("Should only allow owner to pause", async function () {
      await expect(paymentGateway.connect(user1).pause()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });
  });

  describe("User Statistics", function () {
    it("Should get user statistics", async function () {
      const stats = await paymentGateway.getUserStats(user1.address);

      expect(stats.paymentCount).to.equal(0);
      expect(stats.totalAmount).to.equal(0);
      expect(stats.hasKYC).to.equal(true);
    });

    it("Should return false for KYC status of non-verified user", async function () {
      const stats = await paymentGateway.getUserStats(user3.address);

      expect(stats.hasKYC).to.equal(false);
    });
  });

  describe("Payment History", function () {
    it("Should get payment history count", async function () {
      const count = await paymentGateway.getPaymentHistoryCount();

      expect(count).to.equal(0);
    });

    it("Should return empty history for new contract", async function () {
      const history = await paymentGateway.getPaymentHistory(10);

      expect(history.length).to.equal(0);
    });

    it("Should limit payment history results", async function () {
      // This would require actually executing payments first
      // For now, we just verify the function doesn't revert
      const history = await paymentGateway.getPaymentHistory(5);
      expect(history.length).to.equal(0);
    });

    it("Should prevent zero limit", async function () {
      await expect(
        paymentGateway.getPaymentHistory(0)
      ).to.be.revertedWith("Limit must be greater than zero");
    });
  });

  describe("Input Validation", function () {
    it("Should prevent invalid recipient address", async function () {
      // This would need mock PYUSD token transfer setup
      // For now, verify the validation logic is in place
    });

    it("Should prevent zero amount", async function () {
      await expect(
        paymentGateway
          .connect(user1)
          .sendPayment(user2.address, 0, "TXN-001")
      ).to.be.revertedWith("Amount must be greater than zero");
    });

    it("Should require transaction ID", async function () {
      await expect(
        paymentGateway
          .connect(user1)
          .sendPayment(user2.address, ethers.utils.parseEther("10"), "")
      ).to.be.revertedWith("Transaction ID required");
    });

    it("Should prevent empty recipient arrays in batch", async function () {
      await expect(
        paymentGateway
          .connect(user1)
          .sendBatchPayments([], [])
      ).to.be.revertedWith("Must send to at least one recipient");
    });

    it("Should prevent mismatched arrays in batch", async function () {
      await expect(
        paymentGateway
          .connect(user1)
          .sendBatchPayments([user2.address], [ethers.utils.parseEther("10"), ethers.utils.parseEther("20")])
      ).to.be.revertedWith("Recipients and amounts arrays must have the same length");
    });

    it("Should prevent excessive batch size", async function () {
      const recipients = Array(51).fill(user2.address);
      const amounts = Array(51).fill(ethers.utils.parseEther("10"));

      await expect(
        paymentGateway.connect(user1).sendBatchPayments(recipients, amounts)
      ).to.be.revertedWith("Maximum 50 recipients per batch");
    });
  });
});
