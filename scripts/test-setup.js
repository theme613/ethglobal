const { ethers } = require('ethers');

// Configuration - REPLACE THESE WITH YOUR ACTUAL VALUES
const PRIVATE_KEY = "YOUR_PRIVATE_KEY_HERE"; // Replace with your actual private key
const RPC_URL = "YOUR_SEPOLIA_RPC_URL"; // Replace with your Sepolia RPC URL

// Contract addresses
const PYUSD_CONTRACT_ADDRESS = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9"; // PYUSD on Sepolia

// ERC-20 ABI (minimal)
const ERC20_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  }
];

async function testSetup() {
  try {
    console.log("🔍 Testing your setup...\n");

    // Check if configuration is set
    if (PRIVATE_KEY === "YOUR_PRIVATE_KEY_HERE") {
      console.log("❌ Please update PRIVATE_KEY in the script");
      return;
    }

    if (RPC_URL === "YOUR_SEPOLIA_RPC_URL") {
      console.log("❌ Please update RPC_URL in the script");
      return;
    }

    // Setup provider and signer
    console.log("1. Setting up provider and signer...");
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const signerAddress = await wallet.getAddress();
    console.log(`   ✅ Signer address: ${signerAddress}`);

    // Check network
    console.log("\n2. Checking network...");
    const network = await provider.getNetwork();
    console.log(`   Network: ${network.name} (Chain ID: ${network.chainId})`);
    
    if (network.chainId !== 11155111) {
      console.log("   ❌ Wrong network! Expected Sepolia (11155111)");
      return;
    }
    console.log("   ✅ Connected to Sepolia Testnet");

    // Check ETH balance
    console.log("\n3. Checking ETH balance...");
    const ethBalance = await provider.getBalance(signerAddress);
    console.log(`   ETH balance: ${ethers.utils.formatEther(ethBalance)} ETH`);
    
    if (ethBalance.lt(ethers.utils.parseEther("0.001"))) {
      console.log("   ⚠️  Low ETH balance! You may need more ETH for gas fees");
    } else {
      console.log("   ✅ Sufficient ETH for gas fees");
    }

    // Check PYUSD balance
    console.log("\n4. Checking PYUSD balance...");
    const pyusdContract = new ethers.Contract(PYUSD_CONTRACT_ADDRESS, ERC20_ABI, wallet);
    
    try {
      const symbol = await pyusdContract.symbol();
      const decimals = await pyusdContract.decimals();
      const balance = await pyusdContract.balanceOf(signerAddress);
      
      console.log(`   Token: ${symbol} (${decimals} decimals)`);
      console.log(`   PYUSD balance: ${ethers.utils.formatUnits(balance, decimals)} ${symbol}`);
      
      const requiredAmount = ethers.utils.parseUnits("10", decimals);
      if (balance.lt(requiredAmount)) {
        console.log("   ❌ Insufficient PYUSD balance! You need at least 10 PYUSD");
        console.log("   💡 Get PYUSD from a faucet: https://sepoliafaucet.com/");
      } else {
        console.log("   ✅ Sufficient PYUSD balance for transfer");
      }
    } catch (error) {
      console.log("   ❌ Error checking PYUSD balance:", error.message);
      console.log("   💡 Make sure you're connected to Sepolia testnet");
    }

    console.log("\n🎉 Setup test completed!");
    console.log("\nNext steps:");
    console.log("1. If you see any ❌ errors, fix them first");
    console.log("2. If everything looks ✅, run: node scripts/pyusd-transfer.js");

  } catch (error) {
    console.error("❌ Setup test failed:", error.message);
    console.log("\nCommon issues:");
    console.log("- Wrong private key");
    console.log("- Wrong RPC URL");
    console.log("- Not connected to Sepolia testnet");
  }
}

// Run the test
testSetup();
