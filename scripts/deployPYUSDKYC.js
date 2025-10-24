const { ethers } = require("hardhat");

/**
 * Deployment script for PYUSD KYC Subscription system
 * 
 * This script deploys:
 * 1. SoulBoundToken (SBT) for KYC verification
 * 2. PYUSDKYCSubscription for gated payments
 * 
 * Usage:
 * npx hardhat run scripts/deployPYUSDKYC.js --network sepolia
 * npx hardhat run scripts/deployPYUSDKYC.js --network mainnet
 */

async function main() {
  console.log("🚀 Starting PYUSD KYC Subscription deployment...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH\n");

  // PYUSD contract addresses
  const PYUSD_ADDRESSES = {
    mainnet: "0x6c3ea9036406852006290770bedfcaba0e23a0e8", // Official PYUSD proxy
    sepolia: "0x0000000000000000000000000000000000000000", // Update with Sepolia PYUSD address
    localhost: "0x0000000000000000000000000000000000000000" // Update with local PYUSD address
  };

  const network = await ethers.provider.getNetwork();
  const networkName = network.name;
  
  console.log(`📡 Network: ${networkName}`);
  
  // Get PYUSD address for current network
  const pyusdAddress = PYUSD_ADDRESSES[networkName] || PYUSD_ADDRESSES.localhost;
  
  if (pyusdAddress === "0x0000000000000000000000000000000000000000") {
    console.log("⚠️  Warning: PYUSD address not set for this network");
    console.log("Please update the PYUSD_ADDRESSES mapping with the correct address\n");
  }

  // Fee amount: 1 PYUSD (assuming 6 decimals)
  const feeAmount = ethers.utils.parseUnits("1", 6); // 1 PYUSD with 6 decimals
  console.log(`💰 Fee amount: ${ethers.utils.formatUnits(feeAmount, 6)} PYUSD\n`);

  try {
    // Step 1: Deploy SoulBoundToken
    console.log("1️⃣ Deploying SoulBoundToken...");
    const SoulBoundToken = await ethers.getContractFactory("SoulBoundToken");
    const sbt = await SoulBoundToken.deploy();
    await sbt.deployed();
    console.log("✅ SoulBoundToken deployed to:", sbt.address);
    console.log("   Name:", await sbt.name());
    console.log("   Symbol:", await sbt.symbol());
    console.log("   Owner:", await sbt.owner());
    const sbtStats = await sbt.getStats();
    console.log("   Total Supply:", sbtStats.totalSupply.toString());
    console.log();

    // Step 2: Deploy PYUSDKYCSubscription
    console.log("2️⃣ Deploying PYUSDKYCSubscription...");
    const PYUSDKYCSubscription = await ethers.getContractFactory("PYUSDKYCSubscription");
    const subscription = await PYUSDKYCSubscription.deploy(
      pyusdAddress,
      sbt.address,
      feeAmount
    );
    await subscription.deployed();
    console.log("✅ PYUSDKYCSubscription deployed to:", subscription.address);
    console.log("   Owner:", await subscription.owner());
    console.log("   PYUSD Address:", await subscription.pyusd());
    console.log("   SBT Address:", await subscription.sbt());
    console.log("   Fee Amount:", ethers.utils.formatUnits(await subscription.feeAmount(), 6), "PYUSD");
    console.log();

    // Step 3: Verify deployment
    console.log("3️⃣ Verifying deployment...");
    const sbtStats = await sbt.getStats();
    const subscriptionStats = await subscription.getStats();
    
    console.log("SBT Stats:");
    console.log("   Total Supply:", sbtStats.totalSupply.toString());
    console.log("   Next Token ID:", sbtStats.nextTokenId.toString());
    console.log();
    
    console.log("Subscription Stats:");
    console.log("   Total Paid:", ethers.utils.formatUnits(subscriptionStats.totalPaid, 6), "PYUSD");
    console.log("   Total Reimbursed:", ethers.utils.formatEther(subscriptionStats.totalReimbursed), "ETH");
    console.log("   ETH Balance:", ethers.utils.formatEther(subscriptionStats.ethBalance), "ETH");
    console.log("   PYUSD Balance:", ethers.utils.formatUnits(subscriptionStats.pyusdBalance, 6), "PYUSD");
    console.log();

    // Step 4: Save deployment info
    const deploymentInfo = {
      network: networkName,
      chainId: network.chainId,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: {
        SoulBoundToken: {
          address: sbt.address,
          name: await sbt.name(),
          symbol: await sbt.symbol(),
          owner: await sbt.owner()
        },
        PYUSDKYCSubscription: {
          address: subscription.address,
          owner: await subscription.owner(),
          pyusdAddress: await subscription.pyusd(),
          sbtAddress: await subscription.sbt(),
          feeAmount: (await subscription.feeAmount()).toString()
        }
      }
    };

    console.log("📋 Deployment Summary:");
    console.log("===================");
    console.log(`Network: ${deploymentInfo.network}`);
    console.log(`Chain ID: ${deploymentInfo.chainId}`);
    console.log(`Deployer: ${deploymentInfo.deployer}`);
    console.log(`Timestamp: ${deploymentInfo.timestamp}`);
    console.log();
    console.log("Contracts:");
    console.log(`  SoulBoundToken: ${deploymentInfo.contracts.SoulBoundToken.address}`);
    console.log(`  PYUSDKYCSubscription: ${deploymentInfo.contracts.PYUSDKYCSubscription.address}`);
    console.log();

    // Step 5: Next steps
    console.log("🎯 Next Steps:");
    console.log("=============");
    console.log("1. Fund the subscription contract with ETH for reimbursements:");
    console.log(`   await subscription.depositETH({ value: ethers.utils.parseEther("1.0") });`);
    console.log();
    console.log("2. Mint SBTs to KYC-verified users:");
    console.log(`   await sbt.mint("0xUserAddress");`);
    console.log();
    console.log("3. Users can now pay subscription fees:");
    console.log(`   await pyusd.approve("${subscription.address}", feeAmount);`);
    console.log(`   await subscription.paySubscription();`);
    console.log();
    console.log("4. Users can claim ETH gas reimbursement:");
    console.log(`   await subscription.claimEthGas(ethers.utils.parseEther("0.01"));`);
    console.log();

    console.log("✅ Deployment completed successfully!");
    console.log("📝 Save the contract addresses for your frontend integration");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
