const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting simple deployment...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH\n");

  try {
    // Step 1: Deploy MockPYUSD (for testing)
    console.log("1️⃣ Deploying MockPYUSD...");
    const MockPYUSD = await ethers.getContractFactory("MockPYUSD");
    const mockPYUSD = await MockPYUSD.deploy();
    await mockPYUSD.deployed();
    console.log("✅ MockPYUSD deployed to:", mockPYUSD.address);
    console.log();

    // Step 2: Deploy SoulBoundToken
    console.log("2️⃣ Deploying SoulBoundToken...");
    const SoulBoundToken = await ethers.getContractFactory("SoulBoundToken");
    const sbt = await SoulBoundToken.deploy();
    await sbt.deployed();
    console.log("✅ SoulBoundToken deployed to:", sbt.address);
    console.log();

    // Step 3: Deploy PYUSDKYCSubscription
    console.log("3️⃣ Deploying PYUSDKYCSubscription...");
    const PYUSDKYCSubscription = await ethers.getContractFactory("PYUSDKYCSubscription");
    const feeAmount = ethers.utils.parseUnits("1", 6); // 1 PYUSD with 6 decimals
    const subscription = await PYUSDKYCSubscription.deploy(
      mockPYUSD.address,
      sbt.address,
      feeAmount
    );
    await subscription.deployed();
    console.log("✅ PYUSDKYCSubscription deployed to:", subscription.address);
    console.log();

    // Step 4: Deploy PYUSDPaymentGateway
    console.log("4️⃣ Deploying PYUSDPaymentGateway...");
    const PYUSDPaymentGateway = await ethers.getContractFactory("PYUSDPaymentGateway");
    const paymentGateway = await PYUSDPaymentGateway.deploy(
      mockPYUSD.address,
      sbt.address
    );
    await paymentGateway.deployed();
    console.log("✅ PYUSDPaymentGateway deployed to:", paymentGateway.address);
    console.log();

    // Step 5: Deploy KYCVerification
    console.log("5️⃣ Deploying KYCVerification...");
    const KYCVerification = await ethers.getContractFactory("KYCVerification");
    const kycVerification = await KYCVerification.deploy();
    await kycVerification.deployed();
    console.log("✅ KYCVerification deployed to:", kycVerification.address);
    console.log();

    // Step 6: Deploy Payments
    console.log("6️⃣ Deploying Payments...");
    const Payments = await ethers.getContractFactory("Payments");
    const payments = await Payments.deploy(mockPYUSD.address);
    await payments.deployed();
    console.log("✅ Payments deployed to:", payments.address);
    console.log();

    // Save deployment info
    const deploymentInfo = {
      network: "localhost",
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: {
        MockPYUSD: mockPYUSD.address,
        SoulBoundToken: sbt.address,
        PYUSDKYCSubscription: subscription.address,
        PYUSDPaymentGateway: paymentGateway.address,
        KYCVerification: kycVerification.address,
        Payments: payments.address
      }
    };

    console.log("📋 Deployment Summary:");
    console.log("===================");
    console.log(`Network: ${deploymentInfo.network}`);
    console.log(`Deployer: ${deploymentInfo.deployer}`);
    console.log(`Timestamp: ${deploymentInfo.timestamp}`);
    console.log();
    console.log("Contracts:");
    console.log(`  MockPYUSD: ${deploymentInfo.contracts.MockPYUSD}`);
    console.log(`  SoulBoundToken: ${deploymentInfo.contracts.SoulBoundToken}`);
    console.log(`  PYUSDKYCSubscription: ${deploymentInfo.contracts.PYUSDKYCSubscription}`);
    console.log(`  PYUSDPaymentGateway: ${deploymentInfo.contracts.PYUSDPaymentGateway}`);
    console.log(`  KYCVerification: ${deploymentInfo.contracts.KYCVerification}`);
    console.log(`  Payments: ${deploymentInfo.contracts.Payments}`);
    console.log();

    // Save to file
    const fs = require("fs");
    const path = require("path");
    const deploymentPath = path.join(__dirname, "..", "deployments", "localhost.json");
    
    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.dirname(deploymentPath);
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("📝 Deployment info saved to:", deploymentPath);

    console.log("✅ Deployment completed successfully!");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
