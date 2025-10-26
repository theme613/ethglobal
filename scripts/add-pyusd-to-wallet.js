const { ethers } = require('ethers');

// Configuration - REPLACE THESE WITH YOUR ACTUAL VALUES
const PRIVATE_KEY = "YOUR_PRIVATE_KEY_HERE";
const RPC_URL = "YOUR_SEPOLIA_RPC_URL";

// PYUSD token details on Sepolia
const PYUSD_TOKEN = {
  address: "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9",
  symbol: "PYUSD",
  decimals: 18,
  name: "PayPal USD"
};

// ERC-20 ABI for token info
const ERC20_ABI = [
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
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
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

async function addPYUSDToWallet() {
  try {
    console.log("🪙 Adding PYUSD to Wallet Display");
    console.log("=================================\n");

    // Setup
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const signerAddress = await wallet.getAddress();
    
    console.log(`Your address: ${signerAddress}`);
    console.log(`Network: Sepolia Testnet\n`);

    // Get token info
    console.log("1. Getting PYUSD token information...");
    const pyusdContract = new ethers.Contract(PYUSD_TOKEN.address, ERC20_ABI, wallet);
    
    const name = await pyusdContract.name();
    const symbol = await pyusdContract.symbol();
    const decimals = await pyusdContract.decimals();
    const balance = await pyusdContract.balanceOf(signerAddress);
    
    console.log(`   Token Name: ${name}`);
    console.log(`   Token Symbol: ${symbol}`);
    console.log(`   Token Decimals: ${decimals}`);
    console.log(`   Your Balance: ${ethers.utils.formatUnits(balance, decimals)} ${symbol}`);
    console.log(`   Contract Address: ${PYUSD_TOKEN.address}\n`);

    // Check if you have PYUSD
    if (balance.eq(0)) {
      console.log("❌ You have 0 PYUSD tokens!");
      console.log("   Get PYUSD from a faucet first:");
      console.log("   - https://sepoliafaucet.com/");
      console.log("   - https://faucets.chain.link/sepolia");
      console.log("   - https://www.alchemy.com/faucets/ethereum-sepolia\n");
    } else {
      console.log("✅ You have PYUSD tokens!");
    }

    // Instructions for adding to wallet
    console.log("2. How to add PYUSD to your wallet display:");
    console.log("===========================================");
    console.log("📱 MetaMask Instructions:");
    console.log("   1. Open MetaMask");
    console.log("   2. Make sure you're on Sepolia testnet");
    console.log("   3. Click 'Import tokens' at the bottom");
    console.log("   4. Click 'Custom Token'");
    console.log("   5. Enter these details:");
    console.log(`      Token Contract Address: ${PYUSD_TOKEN.address}`);
    console.log(`      Token Symbol: ${symbol}`);
    console.log(`      Token Decimals: ${decimals}`);
    console.log("   6. Click 'Add Custom Token'");
    console.log("   7. Click 'Import Tokens'\n");

    console.log("🔧 Alternative Method (Programmatic):");
    console.log("   You can also add the token programmatically:");
    console.log("   ```javascript");
    console.log("   await window.ethereum.request({");
    console.log("     method: 'wallet_watchAsset',");
    console.log("     params: {");
    console.log("       type: 'ERC20',");
    console.log("       options: {");
    console.log(`         address: '${PYUSD_TOKEN.address}',`);
    console.log(`         symbol: '${symbol}',`);
    console.log(`         decimals: ${decimals},`);
    console.log("       },");
    console.log("     },");
    console.log("   });");
    console.log("   ```\n");

    // Show what will happen
    console.log("3. After adding PYUSD to your wallet:");
    console.log("=====================================");
    console.log("✅ Your wallet will show:");
    console.log(`   - ETH balance: X.XXX ETH`);
    console.log(`   - PYUSD balance: ${ethers.utils.formatUnits(balance, decimals)} PYUSD`);
    console.log("✅ When making transfers:");
    console.log("   - Wallet will show 'PYUSD' instead of 'ETH'");
    console.log("   - You can see your PYUSD balance");
    console.log("   - Transfers will be token transfers, not ETH transfers\n");

    // Create a script to add token programmatically
    console.log("4. Quick Add Script:");
    console.log("===================");
    console.log("Run this in your browser console (on your dApp page):");
    console.log("```javascript");
    console.log("// Add PYUSD to MetaMask");
    console.log("await window.ethereum.request({");
    console.log("  method: 'wallet_watchAsset',");
    console.log("  params: {");
    console.log("    type: 'ERC20',");
    console.log("    options: {");
    console.log(`      address: '${PYUSD_TOKEN.address}',`);
    console.log(`      symbol: '${symbol}',`);
    console.log(`      decimals: ${decimals},`);
    console.log("    },");
    console.log("  },");
    console.log("});");
    console.log("```\n");

    console.log("🎯 Result:");
    console.log("=========");
    console.log("After adding PYUSD to your wallet:");
    console.log("- Wallet popup will show PYUSD balance");
    console.log("- You can see both ETH and PYUSD");
    console.log("- Transfers will use PYUSD tokens");
    console.log("- No more '0 ETH' confusion!");

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Run the script
addPYUSDToWallet();
