const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PYUSD KYC Subscription System", function () {
  let owner, user1, user2, user3;
  let sbt, subscription, pyusd;
  let feeAmount;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();

    // Deploy mock PYUSD token for testing
    const MockPYUSD = await ethers.getContractFactory("MockPYUSD");
    pyusd = await MockPYUSD.deploy();
    await pyusd.deployed();

    // Deploy SoulBoundToken
    const SoulBoundToken = await ethers.getContractFactory("SoulBoundToken");
    sbt = await SoulBoundToken.deploy();
    await sbt.deployed();

    // Set fee amount (1 PYUSD with 6 decimals)
    feeAmount = ethers.utils.parseUnits("1", 6);

    // Deploy PYUSDKYCSubscription
    const PYUSDKYCSubscription = await ethers.getContractFactory("PYUSDKYCSubscription");
    subscription = await PYUSDKYCSubscription.deploy(
      pyusd.address,
      sbt.address,
      feeAmount
    );
    await subscription.deployed();

    // Mint PYUSD to users for testing
    await pyusd.mint(user1.address, ethers.utils.parseUnits("10", 6));
    await pyusd.mint(user2.address, ethers.utils.parseUnits("10", 6));
    await pyusd.mint(user3.address, ethers.utils.parseUnits("10", 6));
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await subscription.owner()).to.equal(owner.address);
    });

    it("Should set the correct PYUSD address", async function () {
      expect(await subscription.pyusd()).to.equal(pyusd.address);
    });

    it("Should set the correct SBT address", async function () {
      expect(await subscription.sbt()).to.equal(sbt.address);
    });

    it("Should set the correct fee amount", async function () {
      expect(await subscription.feeAmount()).to.equal(feeAmount);
    });

    it("Should initialize with zero stats", async function () {
      const stats = await subscription.getStats();
      expect(stats.totalPaid).to.equal(0);
      expect(stats.totalReimbursed).to.equal(0);
      expect(stats.ethBalance).to.equal(0);
      expect(stats.pyusdBalance).to.equal(0);
    });
  });

  describe("SBT Integration", function () {
    it("Should allow SBT holders to pay subscription", async function () {
      // Mint SBT to user1
      await sbt.mint(user1.address);

      // Approve PYUSD spending
      await pyusd.connect(user1).approve(subscription.address, feeAmount);

      // Pay subscription
      await expect(subscription.connect(user1).paySubscription())
        .to.emit(subscription, "FeePaid")
        .withArgs(user1.address, feeAmount, await getCurrentTimestamp());

      // Check payment status
      expect(await subscription.paid(user1.address)).to.be.true;
      expect(await subscription.hasUserPaid(user1.address)).to.be.true;
    });

    it("Should reject payment from non-SBT holders", async function () {
      // Try to pay without SBT
      await pyusd.connect(user1).approve(subscription.address, feeAmount);
      
      await expect(subscription.connect(user1).paySubscription())
        .to.be.revertedWith("Not KYC-verified (no SBT)");
    });

    it("Should prevent double payment", async function () {
      // Mint SBT to user1
      await sbt.mint(user1.address);

      // First payment
      await pyusd.connect(user1).approve(subscription.address, feeAmount);
      await subscription.connect(user1).paySubscription();

      // Try second payment
      await expect(subscription.connect(user1).paySubscription())
        .to.be.revertedWith("Already paid");
    });
  });

  describe("ETH Reimbursement", function () {
    beforeEach(async function () {
      // Mint SBT to user1 and user2
      await sbt.mint(user1.address);
      await sbt.mint(user2.address);

      // Fund subscription contract with ETH
      await subscription.depositETH({ value: ethers.utils.parseEther("1.0") });
    });

    it("Should allow paid users to claim ETH reimbursement", async function () {
      // User1 pays subscription
      await pyusd.connect(user1).approve(subscription.address, feeAmount);
      await subscription.connect(user1).paySubscription();

      // User1 claims ETH reimbursement
      const ethAmount = ethers.utils.parseEther("0.1");
      const initialBalance = await user1.getBalance();
      
      await expect(subscription.connect(user1).claimEthGas(ethAmount))
        .to.emit(subscription, "GasReimbursed")
        .withArgs(user1.address, ethAmount, await getCurrentTimestamp());

      // Check balance increased
      const finalBalance = await user1.getBalance();
      expect(finalBalance).to.be.gt(initialBalance);
      
      // Check reimbursement status
      expect(await subscription.reimbursed(user1.address)).to.be.true;
      expect(await subscription.hasUserBeenReimbursed(user1.address)).to.be.true;
    });

    it("Should reject reimbursement without payment", async function () {
      const ethAmount = ethers.utils.parseEther("0.1");
      
      await expect(subscription.connect(user1).claimEthGas(ethAmount))
        .to.be.revertedWith("PYUSD payment required first");
    });

    it("Should reject double reimbursement", async function () {
      // User1 pays and claims
      await pyusd.connect(user1).approve(subscription.address, feeAmount);
      await subscription.connect(user1).paySubscription();
      await subscription.connect(user1).claimEthGas(ethers.utils.parseEther("0.1"));

      // Try to claim again
      await expect(subscription.connect(user1).claimEthGas(ethers.utils.parseEther("0.1")))
        .to.be.revertedWith("Already reimbursed");
    });

    it("Should reject reimbursement if insufficient ETH", async function () {
      // User1 pays subscription
      await pyusd.connect(user1).approve(subscription.address, feeAmount);
      await subscription.connect(user1).paySubscription();

      // Try to claim more ETH than available
      const ethAmount = ethers.utils.parseEther("2.0");
      
      await expect(subscription.connect(user1).claimEthGas(ethAmount))
        .to.be.revertedWith("Contract low on ETH");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to deposit ETH", async function () {
      const depositAmount = ethers.utils.parseEther("0.5");
      
      await expect(subscription.depositETH({ value: depositAmount }))
        .to.emit(subscription, "ETHDeposited")
        .withArgs(owner.address, depositAmount);
    });

    it("Should allow owner to withdraw PYUSD fees", async function () {
      // User1 pays subscription
      await sbt.mint(user1.address);
      await pyusd.connect(user1).approve(subscription.address, feeAmount);
      await subscription.connect(user1).paySubscription();

      // Owner withdraws fees
      const initialBalance = await pyusd.balanceOf(owner.address);
      await subscription.withdrawFees();
      const finalBalance = await pyusd.balanceOf(owner.address);
      
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should allow owner to update fee amount", async function () {
      const newFeeAmount = ethers.utils.parseUnits("2", 6);
      
      await expect(subscription.updateFeeAmount(newFeeAmount))
        .to.emit(subscription, "FeeAmountUpdated")
        .withArgs(feeAmount, newFeeAmount);
      
      expect(await subscription.feeAmount()).to.equal(newFeeAmount);
    });

    it("Should allow owner to transfer ownership", async function () {
      await subscription.transferOwnership(user1.address);
      expect(await subscription.owner()).to.equal(user1.address);
    });

    it("Should reject non-owner admin functions", async function () {
      await expect(subscription.connect(user1).withdrawFees())
        .to.be.revertedWith("Not the owner");
      
      await expect(subscription.connect(user1).updateFeeAmount(feeAmount))
        .to.be.revertedWith("Not the owner");
      
      await expect(subscription.connect(user1).transferOwnership(user2.address))
        .to.be.revertedWith("Not the owner");
    });
  });

  describe("Statistics", function () {
    it("Should track total paid and reimbursed amounts", async function () {
      // Fund contract
      await subscription.depositETH({ value: ethers.utils.parseEther("1.0") });

      // User1 pays and claims
      await sbt.mint(user1.address);
      await pyusd.connect(user1).approve(subscription.address, feeAmount);
      await subscription.connect(user1).paySubscription();
      await subscription.connect(user1).claimEthGas(ethers.utils.parseEther("0.1"));

      const stats = await subscription.getStats();
      expect(stats.totalPaid).to.equal(feeAmount);
      expect(stats.totalReimbursed).to.equal(ethers.utils.parseEther("0.1"));
    });
  });

  describe("SBT Contract", function () {
    it("Should mint SBTs correctly", async function () {
      await sbt.mint(user1.address);
      
      expect(await sbt.balanceOf(user1.address)).to.equal(1);
      expect(await sbt.hasSBT(user1.address)).to.be.true;
      expect(await sbt.isKYCVerified(user1.address)).to.be.true;
    });

    it("Should prevent double minting", async function () {
      await sbt.mint(user1.address);
      
      await expect(sbt.mint(user1.address))
        .to.be.revertedWith("Address already has SBT");
    });

    it("Should allow owner to revoke SBTs", async function () {
      await sbt.mint(user1.address);
      await sbt.revoke(user1.address);
      
      expect(await sbt.balanceOf(user1.address)).to.equal(0);
      expect(await sbt.hasSBT(user1.address)).to.be.false;
    });

    it("Should prevent non-owner from minting", async function () {
      await expect(sbt.connect(user1).mint(user2.address))
        .to.be.revertedWith("Not the owner");
    });
  });
});

// Helper function to get current timestamp
async function getCurrentTimestamp() {
  const block = await ethers.provider.getBlock("latest");
  return block.timestamp;
}
