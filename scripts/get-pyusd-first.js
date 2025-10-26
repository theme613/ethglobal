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

async function getPYUSDFirst() {
  try {
    console.log("🪙 Getting PYUSD Tokens on Sepolia Testnet");
    console.log("==========================================\n");

    // Setup provider and signer
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const signerAddress = await wallet.getAddress();
    console.log(`Your address: ${signerAddress}`);

    // Check network
    const network = await provider.getNetwork();
    console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
    
    if (network.chainId !== 11155111) {
      console.log("❌ Wrong network! Make sure you're using Sepolia RPC URL");
      return;
    }
    console.log("✅ Connected to Sepolia Testnet");

    // Check current PYUSD balance
    console.log("\nChecking your PYUSD balance...");
    const pyusdContract = new ethers.Contract(PYUSD_CONTRACT_ADDRESS, ERC20_ABI, wallet);
    
    try {
      const symbol = await pyusdContract.symbol();
      const decimals = await pyusdContract.decimals();
      const balance = await pyusdContract.balanceOf(signerAddress);
      
      console.log(`Token: ${symbol}`);
      console.log(`Your ${symbol} balance: ${ethers.utils.formatUnits(balance, decimals)} ${symbol}`);
      
      if (balance.eq(0)) {
        console.log("\n❌ You have 0 PYUSD tokens!");
        console.log("\n💡 To get PYUSD tokens:");
        console.log("1. Open MetaMask");
        console.log("2. Switch to Sepolia testnet");
        console.log("3. Go to one of these faucets:");
        console.log("   - https://sepoliafaucet.com/");
        console.log("   - https://faucets.chain.link/sepolia");
        console.log("   - https://www.alchemy.com/faucets/ethereum-sepolia");
        console.log("4. Connect your wallet");
        console.log("5. Request test tokens (including PYUSD)");
        console.log("6. Wait for tokens to arrive");
        
        console.log("\n⏳ After getting tokens, run:");
        console.log("node scripts/correct-pyusd-transfer.js");
        
      } else {
        const requiredAmount = ethers.utils.parseUnits("10", decimals);
        if (balance.lt(requiredAmount)) {
          console.log(`\n⚠️  You have ${ethers.utils.formatUnits(balance, decimals)} ${symbol}, but need 10 ${symbol}`);
          console.log("💡 Get more PYUSD from a faucet");
        } else {
          console.log(`\n✅ You have enough ${symbol} for the transfer!`);
          console.log("You can now run: node scripts/correct-pyusd-transfer.js");
        }
      }
      
    } catch (error) {
      console.log("❌ Error checking PYUSD balance:", error.message);
      console.log("💡 The PYUSD contract might not exist on Sepolia");
      console.log("Try getting tokens from a faucet first");
    }

    console.log("\n📋 Summary:");
    console.log("1. Make sure you're on Sepolia testnet");
    console.log("2. Get PYUSD tokens from a faucet");
    console.log("3. Run the transfer script");

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Run the script
getPYUSDFirst();
