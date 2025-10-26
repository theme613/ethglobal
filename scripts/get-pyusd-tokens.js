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

async function getPYUSDTokens() {
  try {
    console.log("🪙 Getting PYUSD tokens on Sepolia...\n");

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
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const signerAddress = await wallet.getAddress();
    console.log(`Your address: ${signerAddress}`);

    // Check network
    const network = await provider.getNetwork();
    if (network.chainId !== 11155111) {
      console.log("❌ Wrong network! Make sure you're using Sepolia RPC URL");
      return;
    }
    console.log("✅ Connected to Sepolia Testnet");

    // Check current PYUSD balance
    console.log("\nChecking current PYUSD balance...");
    const pyusdContract = new ethers.Contract(PYUSD_CONTRACT_ADDRESS, ERC20_ABI, wallet);
    
    try {
      const symbol = await pyusdContract.symbol();
      const decimals = await pyusdContract.decimals();
      const balance = await pyusdContract.balanceOf(signerAddress);
      
      console.log(`Current ${symbol} balance: ${ethers.utils.formatUnits(balance, decimals)} ${symbol}`);
      
      if (balance.gt(0)) {
        console.log("✅ You already have PYUSD tokens!");
        return;
      }
    } catch (error) {
      console.log("❌ Error checking PYUSD balance:", error.message);
      console.log("💡 The PYUSD contract might not exist on Sepolia");
    }

    console.log("\n🔍 PYUSD Token Information:");
    console.log(`Contract Address: ${PYUSD_CONTRACT_ADDRESS}`);
    console.log(`Network: Sepolia Testnet`);
    console.log(`Your Address: ${signerAddress}`);

    console.log("\n💡 How to get PYUSD tokens:");
    console.log("1. Go to https://sepoliafaucet.com/");
    console.log("2. Connect your wallet");
    console.log("3. Request test tokens (including PYUSD)");
    console.log("4. Wait for tokens to arrive");
    console.log("\nAlternative faucets:");
    console.log("- https://faucets.chain.link/sepolia");
    console.log("- https://www.alchemy.com/faucets/ethereum-sepolia");
    console.log("- https://sepolia-faucet.pk910.de/");

    console.log("\n📋 Steps to get PYUSD:");
    console.log("1. Open MetaMask");
    console.log("2. Switch to Sepolia Testnet");
    console.log("3. Go to one of the faucet websites above");
    console.log("4. Connect your wallet");
    console.log("5. Request test tokens");
    console.log("6. Wait for confirmation");

    console.log("\n⏳ After getting tokens, run:");
    console.log("node scripts/diagnose-pyusd.js");
    console.log("node scripts/pyusd-transfer.js");

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Run the script
getPYUSDTokens();
