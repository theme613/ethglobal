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

async function testPYUSDTransfer() {
  try {
    console.log("🧪 Testing PYUSD Transfer - Verifying Token Usage");
    console.log("==================================================\n");

    // Setup
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const signerAddress = await wallet.getAddress();
    
    console.log(`Your address: ${signerAddress}`);
    console.log(`Network: Sepolia Testnet\n`);

    // Create contract
    const pyusdContract = new ethers.Contract(PYUSD_ADDRESS, ERC20_ABI, wallet);
    
    // Get token info
    const symbol = await pyusdContract.symbol();
    console.log(`Token: ${symbol}`);
    console.log(`Contract: ${PYUSD_ADDRESS}\n`);

    // Check balances before
    console.log("📊 Balances BEFORE transfer:");
    const ethBalanceBefore = await provider.getBalance(signerAddress);
    const pyusdBalanceBefore = await pyusdContract.balanceOf(signerAddress);
    const recipientPyusdBefore = await pyusdContract.balanceOf(RECIPIENT_ADDRESS);
    
    console.log(`  Your ETH: ${ethers.utils.formatEther(ethBalanceBefore)} ETH`);
    console.log(`  Your ${symbol}: ${ethers.utils.formatUnits(pyusdBalanceBefore, 18)} ${symbol}`);
    console.log(`  Recipient ${symbol}: ${ethers.utils.formatUnits(recipientPyusdBefore, 18)} ${symbol}\n`);

    // Check if you have enough PYUSD
    const amount = ethers.utils.parseUnits("10", 18); // 10 PYUSD
    if (pyusdBalanceBefore.lt(amount)) {
      console.log("❌ Insufficient PYUSD balance!");
      console.log(`   You have: ${ethers.utils.formatUnits(pyusdBalanceBefore, 18)} ${symbol}`);
      console.log(`   Need: 10 ${symbol}`);
      console.log("   Get PYUSD from a faucet first!");
      return;
    }

    // Show what will happen
    console.log("🔍 What will happen:");
    console.log("  - Call pyusdContract.transfer()");
    console.log("  - This is an ERC-20 token transfer");
    console.log("  - NOT an ETH transfer");
    console.log("  - Wallet should show 'PYUSD' not 'SepoliaETH'");
    console.log("  - Your PYUSD balance will decrease");
    console.log("  - Recipient's PYUSD balance will increase");
    console.log("  - Your ETH balance will decrease slightly (for gas only)\n");

    // Execute transfer
    console.log("🚀 Executing PYUSD transfer...");
    const tx = await pyusdContract.transfer(RECIPIENT_ADDRESS, amount, {
      gasLimit: 100000,
      value: 0 // NO ETH VALUE - this is key!
    });

    console.log(`Transaction sent: ${tx.hash}`);
    console.log("Waiting for confirmation...\n");

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log(`✅ Transaction confirmed in block: ${receipt.blockNumber}`);

    // Check balances after
    console.log("\n📊 Balances AFTER transfer:");
    const ethBalanceAfter = await provider.getBalance(signerAddress);
    const pyusdBalanceAfter = await pyusdContract.balanceOf(signerAddress);
    const recipientPyusdAfter = await pyusdContract.balanceOf(RECIPIENT_ADDRESS);
    
    console.log(`  Your ETH: ${ethers.utils.formatEther(ethBalanceAfter)} ETH`);
    console.log(`  Your ${symbol}: ${ethers.utils.formatUnits(pyusdBalanceAfter, 18)} ${symbol}`);
    console.log(`  Recipient ${symbol}: ${ethers.utils.formatUnits(recipientPyusdAfter, 18)} ${symbol}\n`);

    // Calculate changes
    const ethChange = ethBalanceBefore.sub(ethBalanceAfter);
    const pyusdChange = pyusdBalanceBefore.sub(pyusdBalanceAfter);
    const recipientPyusdChange = recipientPyusdAfter.sub(recipientPyusdBefore);
    
    console.log("📈 Changes:");
    console.log(`  Your ETH changed by: -${ethers.utils.formatEther(ethChange)} ETH (gas only)`);
    console.log(`  Your ${symbol} changed by: -${ethers.utils.formatUnits(pyusdChange, 18)} ${symbol}`);
    console.log(`  Recipient ${symbol} changed by: +${ethers.utils.formatUnits(recipientPyusdChange, 18)} ${symbol}\n`);

    // Verify it was a PYUSD transfer
    console.log("✅ VERIFICATION:");
    if (pyusdChange.gt(0) && recipientPyusdChange.gt(0)) {
      console.log("  ✅ PYUSD tokens were transferred successfully");
      console.log("  ✅ This was a TOKEN transfer, not ETH transfer");
      console.log("  ✅ Wallet should have shown 'PYUSD' not 'SepoliaETH'");
    } else {
      console.log("  ❌ PYUSD transfer failed");
    }

    console.log(`\n🔗 Transaction Details:`);
    console.log(`Hash: ${tx.hash}`);
    console.log(`Etherscan: https://sepolia.etherscan.io/tx/${tx.hash}`);
    console.log(`Gas used: ${receipt.gasUsed.toString()}`);

  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run test
testPYUSDTransfer();
