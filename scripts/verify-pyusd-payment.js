const { ethers } = require('ethers');

// Configuration - REPLACE THESE WITH YOUR ACTUAL VALUES
const PRIVATE_KEY = "YOUR_PRIVATE_KEY_HERE";
const RPC_URL = "YOUR_SEPOLIA_RPC_URL";

// Contract addresses
const PYUSD_ADDRESS = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9"; // PYUSD on Sepolia
const RECIPIENT_ADDRESS = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";

// ERC-20 ABI for verification
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

async function verifyPYUSDPayment() {
  try {
    console.log("🔍 Verifying PYUSD Payment on Sepolia Testnet");
    console.log("==============================================\n");

    // Setup provider and signer
    console.log("1. Setting up connection...");
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const signerAddress = await wallet.getAddress();
    console.log(`   Your address: ${signerAddress}`);

    // Check network
    const network = await provider.getNetwork();
    console.log(`   Network: ${network.name} (Chain ID: ${network.chainId})`);
    
    if (network.chainId !== 11155111) {
      console.log("   ❌ Wrong network! Expected Sepolia (11155111)");
      return;
    }
    console.log("   ✅ Connected to Sepolia Testnet");

    // Check PYUSD contract
    console.log("\n2. Verifying PYUSD contract...");
    console.log(`   PYUSD Contract: ${PYUSD_ADDRESS}`);
    
    try {
      const pyusdContract = new ethers.Contract(PYUSD_ADDRESS, ERC20_ABI, wallet);
      
      // Get token information
      const name = await pyusdContract.name();
      const symbol = await pyusdContract.symbol();
      const decimals = await pyusdContract.decimals();
      
      console.log(`   Token Name: ${name}`);
      console.log(`   Token Symbol: ${symbol}`);
      console.log(`   Token Decimals: ${decimals}`);
      
      // Verify this is PYUSD
      if (symbol.toUpperCase() !== "PYUSD") {
        console.log("   ❌ This is NOT PYUSD! Symbol:", symbol);
        return;
      }
      console.log("   ✅ This is PYUSD token");
      
      // Check if contract exists
      const code = await provider.getCode(PYUSD_ADDRESS);
      if (code === "0x") {
        console.log("   ❌ No contract found at this address!");
        return;
      }
      console.log("   ✅ Contract exists at this address");
      
    } catch (error) {
      console.log("   ❌ Error checking PYUSD contract:", error.message);
      return;
    }

    // Check balances
    console.log("\n3. Checking PYUSD balances...");
    const pyusdContract = new ethers.Contract(PYUSD_ADDRESS, ERC20_ABI, wallet);
    
    const senderBalance = await pyusdContract.balanceOf(signerAddress);
    const recipientBalance = await pyusdContract.balanceOf(RECIPIENT_ADDRESS);
    const symbol = await pyusdContract.symbol();
    const decimals = await pyusdContract.decimals();
    
    console.log(`   Your PYUSD balance: ${ethers.utils.formatUnits(senderBalance, decimals)} ${symbol}`);
    console.log(`   Recipient PYUSD balance: ${ethers.utils.formatUnits(recipientBalance, decimals)} ${symbol}`);

    // Check ETH balances
    console.log("\n4. Checking ETH balances...");
    const senderEthBalance = await provider.getBalance(signerAddress);
    const recipientEthBalance = await provider.getBalance(RECIPIENT_ADDRESS);
    
    console.log(`   Your ETH balance: ${ethers.utils.formatEther(senderEthBalance)} ETH`);
    console.log(`   Recipient ETH balance: ${ethers.utils.formatEther(recipientEthBalance)} ETH`);

    // Verify payment method
    console.log("\n5. Verifying payment method...");
    
    if (senderBalance.gt(0)) {
      console.log("   ✅ You have PYUSD tokens - payment will use PYUSD");
      console.log("   ✅ This is a TOKEN transfer, not ETH transfer");
    } else {
      console.log("   ❌ You have 0 PYUSD tokens");
      console.log("   ❌ Payment will fail - need PYUSD tokens");
    }

    // Check transaction type
    console.log("\n6. Transaction type verification...");
    console.log("   When you run the transfer script:");
    console.log("   - It will call pyusdContract.transfer()");
    console.log("   - This is an ERC-20 token transfer");
    console.log("   - NOT an ETH transfer");
    console.log("   - Wallet should show 'PYUSD' not 'SepoliaETH'");

    // Summary
    console.log("\n📊 Verification Summary:");
    console.log("========================");
    console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
    console.log(`PYUSD Contract: ${PYUSD_ADDRESS}`);
    console.log(`Token: ${symbol} (${decimals} decimals)`);
    console.log(`Your PYUSD: ${ethers.utils.formatUnits(senderBalance, decimals)} ${symbol}`);
    console.log(`Your ETH: ${ethers.utils.formatEther(senderEthBalance)} ETH`);
    console.log(`Payment Method: ${senderBalance.gt(0) ? 'PYUSD Token Transfer' : 'No PYUSD - Will Fail'}`);

    if (senderBalance.gt(0)) {
      console.log("\n✅ VERIFICATION PASSED:");
      console.log("   - Using Sepolia testnet");
      console.log("   - Using PYUSD token (not ETH)");
      console.log("   - Payment will be token transfer");
      console.log("   - Wallet should show PYUSD amount");
    } else {
      console.log("\n❌ VERIFICATION FAILED:");
      console.log("   - You need PYUSD tokens first");
      console.log("   - Get PYUSD from a faucet");
      console.log("   - Then run the transfer script");
    }

  } catch (error) {
    console.error("❌ Verification failed:", error.message);
  }
}

// Run verification
verifyPYUSDPayment();
