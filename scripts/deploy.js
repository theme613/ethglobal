const { ethers } = require("hardhat");

async function main() {
  console.log("Starting deployment...");

  // Get the contract factories
  const SoulBoundToken = await ethers.getContractFactory("SoulBoundToken");
  const PYUSDPaymentGateway = await ethers.getContractFactory("PYUSDPaymentGateway");

  // Deploy SoulBoundToken
  console.log("Deploying SoulBoundToken...");
  const sbt = await SoulBoundToken.deploy();
  await sbt.waitForDeployment();
  const sbtAddress = await sbt.getAddress();
  console.log("SoulBoundToken deployed to:", sbtAddress);

  // Deploy PYUSDPaymentGateway
  console.log("Deploying PYUSDPaymentGateway...");
  // Note: You'll need to replace these with actual addresses
  const PYUSD_TOKEN_ADDRESS = "0x..."; // Replace with actual PYUSD token address
  const paymentGateway = await PYUSDPaymentGateway.deploy(
    PYUSD_TOKEN_ADDRESS,
    sbtAddress
  );
  await paymentGateway.waitForDeployment();
  const paymentGatewayAddress = await paymentGateway.getAddress();
  console.log("PYUSDPaymentGateway deployed to:", paymentGatewayAddress);

  // Set up KYC provider
  console.log("Setting up KYC provider...");
  const [deployer] = await ethers.getSigners();
  await sbt.addKYCProvider(deployer.address);
  console.log("KYC provider added:", deployer.address);

  // Verify contracts (optional)
  console.log("Verifying contracts...");
  try {
    await hre.run("verify:verify", {
      address: sbtAddress,
      constructorArguments: [],
    });
    console.log("SoulBoundToken verified");
  } catch (error) {
    console.log("SoulBoundToken verification failed:", error.message);
  }

  try {
    await hre.run("verify:verify", {
      address: paymentGatewayAddress,
      constructorArguments: [PYUSD_TOKEN_ADDRESS, sbtAddress],
    });
    console.log("PYUSDPaymentGateway verified");
  } catch (error) {
    console.log("PYUSDPaymentGateway verification failed:", error.message);
  }

  console.log("\n=== Deployment Summary ===");
  console.log("SoulBoundToken:", sbtAddress);
  console.log("PYUSDPaymentGateway:", paymentGatewayAddress);
  console.log("KYC Provider:", deployer.address);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    contracts: {
      SoulBoundToken: sbtAddress,
      PYUSDPaymentGateway: paymentGatewayAddress,
    },
    timestamp: new Date().toISOString(),
  };

  const fs = require("fs");
  const path = require("path");
  const deploymentPath = path.join(__dirname, "..", "deployments", `${hre.network.name}.json`);
  
  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.dirname(deploymentPath);
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment info saved to:", deploymentPath);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });