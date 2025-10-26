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
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  }
];

async function diagnosePYUSD() {
  try {
    console.log("🔍 Diagnosing PYUSD setup...\n");

    // Check configuration
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
      console.log("   💡 Make sure you're using Sepolia RPC URL");
      return;
    }
    console.log("   ✅ Connected to Sepolia Testnet");

    // Check ETH balance
    console.log("\n3. Checking ETH balance...");
    const ethBalance = await provider.getBalance(signerAddress);
    console.log(`   ETH balance: ${ethers.utils.formatEther(ethBalance)} ETH`);
    
    if (ethBalance.lt(ethers.utils.parseEther("0.001"))) {
      console.log("   ⚠️  Low ETH balance! You need ETH for gas fees");
      console.log("   💡 Get ETH from: https://sepoliafaucet.com/");
    } else {
      console.log("   ✅ Sufficient ETH for gas fees");
    }

    // Check PYUSD contract
    console.log("\n4. Checking PYUSD contract...");
    console.log(`   PYUSD Contract: ${PYUSD_CONTRACT_ADDRESS}`);
    
    try {
      const pyusdContract = new ethers.Contract(PYUSD_CONTRACT_ADDRESS, ERC20_ABI, wallet);
      
      // Get token info
      const name = await pyusdContract.name();
      const symbol = await pyusdContract.symbol();
      const decimals = await pyusdContract.decimals();
      
      console.log(`   Token Name: ${name}`);
      console.log(`   Token Symbol: ${symbol}`);
      console.log(`   Decimals: ${decimals}`);
      
      // Check balance
      const balance = await pyusdContract.balanceOf(signerAddress);
      console.log(`   Your ${symbol} balance: ${ethers.utils.formatUnits(balance, decimals)} ${symbol}`);
      
      if (balance.eq(0)) {
        console.log("   ❌ You have 0 PYUSD tokens!");
        console.log("   💡 Get PYUSD from a faucet:");
        console.log("      - https://sepoliafaucet.com/");
        console.log("      - https://faucets.chain.link/sepolia");
        console.log("      - https://www.alchemy.com/faucets/ethereum-sepolia");
      } else {
        console.log("   ✅ You have PYUSD tokens!");
        
        // Check if enough for transfer
        const requiredAmount = ethers.utils.parseUnits("10", decimals);
        if (balance.lt(requiredAmount)) {
          console.log(`   ⚠️  You need at least 10 ${symbol} for the transfer`);
          console.log(`   Current: ${ethers.utils.formatUnits(balance, decimals)} ${symbol}`);
          console.log(`   Required: 10 ${symbol}`);
        } else {
          console.log("   ✅ You have enough PYUSD for the transfer!");
        }
      }
      
    } catch (error) {
      console.log("   ❌ Error checking PYUSD contract:", error.message);
      console.log("   💡 Possible issues:");
      console.log("      - Wrong RPC URL (not Sepolia)");
      console.log("      - Contract address is incorrect");
      console.log("      - Network connection issue");
    }

    // Check if contract exists
    console.log("\n5. Checking if PYUSD contract exists...");
    try {
      const code = await provider.getCode(PYUSD_CONTRACT_ADDRESS);
      if (code === "0x") {
        console.log("   ❌ No contract found at this address!");
        console.log("   💡 The PYUSD contract might not exist on Sepolia");
        console.log("   💡 Try using a different PYUSD address or get tokens from a faucet");
      } else {
        console.log("   ✅ Contract exists at this address");
      }
    } catch (error) {
      console.log("   ❌ Error checking contract:", error.message);
    }

    console.log("\n🎯 Summary:");
    console.log("If you see ❌ errors above, fix them first before running the transfer script.");
    console.log("If everything looks ✅, you can run: node scripts/pyusd-transfer.js");

  } catch (error) {
    console.error("❌ Diagnosis failed:", error.message);
    console.log("\nCommon issues:");
    console.log("- Wrong private key");
    console.log("- Wrong RPC URL (not Sepolia)");
    console.log("- No PYUSD tokens in your account");
    console.log("- Network connection issues");
  }
}

// Run the diagnosis
diagnosePYUSD();
