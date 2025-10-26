const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Verifying contract deployment...\n");

  // Contract addresses from deployment
  const SBT_ADDRESS = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";
  const SUBSCRIPTION_ADDRESS = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";
  const PYUSD_ADDRESS = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";

  try {
    // Get contract instances
    const sbt = await ethers.getContractAt("SoulBoundToken", SBT_ADDRESS);
    const subscription = await ethers.getContractAt("PYUSDKYCSubscription", SUBSCRIPTION_ADDRESS);
    const pyusd = await ethers.getContractAt("MockPYUSD", PYUSD_ADDRESS);

    console.log("📋 Contract Information:");
    console.log("=====================");
    
    // SBT Contract Info
    console.log("SoulBoundToken:");
    console.log(`  Address: ${SBT_ADDRESS}`);
    console.log(`  Name: ${await sbt.name()}`);
    console.log(`  Symbol: ${await sbt.symbol()}`);
    console.log(`  Owner: ${await sbt.owner()}`);
    console.log(`  Total Supply: ${(await sbt.totalSupply()).toString()}`);
    console.log(`  Next Token ID: ${(await sbt.nextTokenId()).toString()}`);
    console.log();

    // Subscription Contract Info
    console.log("PYUSDKYCSubscription:");
    console.log(`  Address: ${SUBSCRIPTION_ADDRESS}`);
    console.log(`  Owner: ${await subscription.owner()}`);
    console.log(`  PYUSD Address: ${await subscription.pyusd()}`);
    console.log(`  SBT Address: ${await subscription.sbt()}`);
    console.log(`  Fee Amount: ${ethers.utils.formatUnits(await subscription.feeAmount(), 6)} PYUSD`);
    
    const stats = await subscription.getStats();
    console.log(`  Total Paid: ${ethers.utils.formatUnits(stats[0], 6)} PYUSD`);
    console.log(`  Total Reimbursed: ${ethers.utils.formatEther(stats[1])} ETH`);
    console.log(`  ETH Balance: ${ethers.utils.formatEther(stats[2])} ETH`);
    console.log(`  PYUSD Balance: ${ethers.utils.formatUnits(stats[3], 6)} PYUSD`);
    console.log();

    // PYUSD Contract Info
    console.log("MockPYUSD:");
    console.log(`  Address: ${PYUSD_ADDRESS}`);
    console.log(`  Name: ${await pyusd.name()}`);
    console.log(`  Symbol: ${await pyusd.symbol()}`);
    console.log(`  Decimals: ${await pyusd.decimals()}`);
    console.log(`  Total Supply: ${ethers.utils.formatUnits(await pyusd.totalSupply(), await pyusd.decimals())} PYUSD`);
    console.log();

    // Test basic functionality
    console.log("🧪 Testing Basic Functionality:");
    console.log("=============================");
    
    const [deployer] = await ethers.getSigners();
    console.log(`Deployer: ${deployer.address}`);
    
    // Check if deployer has PYUSD balance
    const pyusdBalance = await pyusd.balanceOf(deployer.address);
    console.log(`Deployer PYUSD Balance: ${ethers.utils.formatUnits(pyusdBalance, 6)} PYUSD`);
    
    // Check if deployer has SBT
    const hasSBT = await sbt.isKYCVerified(deployer.address);
    console.log(`Deployer KYC Status: ${hasSBT ? 'Verified' : 'Not Verified'}`);
    
    console.log("\n✅ Contract verification completed successfully!");
    console.log("\n🎯 Next Steps:");
    console.log("1. Mint SBT to test user: await sbt.mint('0xUserAddress')");
    console.log("2. Fund subscription with ETH: await subscription.depositETH({ value: ethers.utils.parseEther('1.0') })");
    console.log("3. Test payment flow with KYC-verified user");

  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
