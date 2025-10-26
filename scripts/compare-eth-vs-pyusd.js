const { ethers } = require('ethers');

// Configuration - REPLACE THESE WITH YOUR ACTUAL VALUES
const PRIVATE_KEY = "YOUR_PRIVATE_KEY_HERE";
const RPC_URL = "YOUR_SEPOLIA_RPC_URL";

// Contract addresses
const PYUSD_ADDRESS = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";
const RECIPIENT_ADDRESS = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";

// ERC-20 ABI
const ERC20_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
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

async function compareTransfers() {
  try {
    console.log("🔍 Comparing ETH vs PYUSD Transfers");
    console.log("===================================\n");

    // Setup
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const signerAddress = await wallet.getAddress();
    
    console.log(`Your address: ${signerAddress}`);
    console.log(`Network: Sepolia Testnet\n`);

    // Check balances
    const ethBalance = await provider.getBalance(signerAddress);
    const pyusdContract = new ethers.Contract(PYUSD_ADDRESS, ERC20_ABI, wallet);
    const pyusdBalance = await pyusdContract.balanceOf(signerAddress);
    const symbol = await pyusdContract.symbol();
    
    console.log("Current Balances:");
    console.log(`  ETH: ${ethers.utils.formatEther(ethBalance)} ETH`);
    console.log(`  PYUSD: ${ethers.utils.formatUnits(pyusdBalance, 18)} ${symbol}\n`);

    // Show the difference
    console.log("❌ WRONG WAY - ETH Transfer (Shows 'SepoliaETH'):");
    console.log("=================================================");
    console.log("const tx = await wallet.sendTransaction({");
    console.log("  to: RECIPIENT_ADDRESS,");
    console.log("  value: ethers.utils.parseEther('10') // This sends ETH!");
    console.log("});");
    console.log("// Result: Wallet shows '10 SepoliaETH'");
    console.log("// Problem: This is ETH, not PYUSD!\n");

    console.log("✅ CORRECT WAY - PYUSD Transfer (Shows 'PYUSD'):");
    console.log("================================================");
    console.log("const pyusdContract = new ethers.Contract(PYUSD_ADDRESS, ERC20_ABI, wallet);");
    console.log("const tx = await pyusdContract.transfer(RECIPIENT_ADDRESS, AMOUNT_WEI, {");
    console.log("  value: 0 // NO ETH VALUE");
    console.log("});");
    console.log("// Result: Wallet shows '10 PYUSD'");
    console.log("// Correct: This is PYUSD token transfer!\n");

    // Demonstrate the difference
    console.log("🔍 What happens in each case:");
    console.log("=============================");
    console.log("ETH Transfer:");
    console.log("  - Calls wallet.sendTransaction()");
    console.log("  - Sends ETH from your account");
    console.log("  - Wallet shows 'SepoliaETH'");
    console.log("  - Reduces your ETH balance");
    console.log("  - Increases recipient's ETH balance\n");

    console.log("PYUSD Transfer:");
    console.log("  - Calls pyusdContract.transfer()");
    console.log("  - Sends PYUSD tokens from your account");
    console.log("  - Wallet shows 'PYUSD'");
    console.log("  - Reduces your PYUSD balance");
    console.log("  - Increases recipient's PYUSD balance\n");

    // Check if you have PYUSD
    if (pyusdBalance.gt(0)) {
      console.log("✅ You have PYUSD tokens!");
      console.log("   - You can make PYUSD transfers");
      console.log("   - Wallet will show 'PYUSD' not 'SepoliaETH'");
      console.log("   - Use the correct transfer script\n");
    } else {
      console.log("❌ You have 0 PYUSD tokens!");
      console.log("   - You need PYUSD tokens first");
      console.log("   - Get PYUSD from a faucet");
      console.log("   - Then you can make PYUSD transfers\n");
    }

    // Show transaction details
    console.log("📋 Transaction Details:");
    console.log("======================");
    console.log("PYUSD Contract: 0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9");
    console.log("Recipient: 0x8A791620dd6260079BF849Dc5567aDC3F2FdC318");
    console.log("Amount: 10 PYUSD (10000000000000000000 wei)");
    console.log("Network: Sepolia Testnet");
    console.log("Method: ERC-20 transfer() function");

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Run comparison
compareTransfers();
