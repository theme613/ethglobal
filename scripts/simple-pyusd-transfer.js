const { ethers } = require('ethers');

// Configuration - REPLACE THESE WITH YOUR ACTUAL VALUES
const PRIVATE_KEY = "YOUR_PRIVATE_KEY_HERE"; // Replace with your actual private key
const RPC_URL = "YOUR_SEPOLIA_RPC_URL"; // Replace with your Sepolia RPC URL

// Contract addresses
const PYUSD_CONTRACT_ADDRESS = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9"; // PYUSD on Sepolia
const RECIPIENT_ADDRESS = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318"; // Contract address

// ERC-20 ABI (only transfer function)
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
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  }
];

async function transferPYUSD() {
  try {
    console.log("🚀 PYUSD Transfer - Sepolia Testnet");
    console.log("=====================================\n");

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
      throw new Error(`Wrong network! Expected Sepolia (11155111), got ${network.chainId}`);
    }
    console.log("   ✅ Connected to Sepolia Testnet");

    // Create PYUSD contract
    console.log("\n2. Connecting to PYUSD contract...");
    const pyusdContract = new ethers.Contract(PYUSD_CONTRACT_ADDRESS, ERC20_ABI, wallet);
    console.log(`   PYUSD Contract: ${PYUSD_CONTRACT_ADDRESS}`);

    // Get token info
    const decimals = await pyusdContract.decimals();
    console.log(`   Token decimals: ${decimals}`);

    // Amount to transfer (10 PYUSD)
    const amount = ethers.utils.parseUnits("10", decimals);
    console.log(`   Amount to transfer: 10 PYUSD`);

    // Check balances
    console.log("\n3. Checking balances...");
    const senderBalance = await pyusdContract.balanceOf(signerAddress);
    const recipientBalanceBefore = await pyusdContract.balanceOf(RECIPIENT_ADDRESS);
    
    console.log(`   Your PYUSD balance: ${ethers.utils.formatUnits(senderBalance, decimals)} PYUSD`);
    console.log(`   Recipient balance before: ${ethers.utils.formatUnits(recipientBalanceBefore, decimals)} PYUSD`);

    if (senderBalance.lt(amount)) {
      throw new Error(`Insufficient PYUSD balance! You have ${ethers.utils.formatUnits(senderBalance, decimals)} PYUSD, need 10 PYUSD`);
    }

    // Check ETH balance for gas
    const ethBalance = await provider.getBalance(signerAddress);
    console.log(`   Your ETH balance: ${ethers.utils.formatEther(ethBalance)} ETH (for gas)`);
    
    if (ethBalance.lt(ethers.utils.parseEther("0.001"))) {
      console.log("   ⚠️  Low ETH balance! You may need more ETH for gas fees");
    }

    // Send transfer transaction
    console.log("\n4. Sending PYUSD transfer...");
    console.log(`   From: ${signerAddress}`);
    console.log(`   To: ${RECIPIENT_ADDRESS}`);
    console.log(`   Amount: 10 PYUSD`);
    console.log(`   Token: ${PYUSD_CONTRACT_ADDRESS}`);
    
    // Call transfer function - NO ETH VALUE
    const tx = await pyusdContract.transfer(RECIPIENT_ADDRESS, amount, {
      gasLimit: 100000
    });

    console.log(`   Transaction sent! Hash: ${tx.hash}`);
    console.log("   Waiting for confirmation...");

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log(`   ✅ Transaction confirmed in block: ${receipt.blockNumber}`);
    console.log(`   Gas used: ${receipt.gasUsed.toString()}`);

    // Check final balances
    console.log("\n5. Checking final balances...");
    const senderBalanceAfter = await pyusdContract.balanceOf(signerAddress);
    const recipientBalanceAfter = await pyusdContract.balanceOf(RECIPIENT_ADDRESS);
    
    console.log(`   Your PYUSD balance after: ${ethers.utils.formatUnits(senderBalanceAfter, decimals)} PYUSD`);
    console.log(`   Recipient PYUSD balance after: ${ethers.utils.formatUnits(recipientBalanceAfter, decimals)} PYUSD`);

    // Success message
    console.log("\n🎉 PYUSD Transfer Successful!");
    console.log("================================");
    console.log(`Transaction Hash: ${tx.hash}`);
    console.log(`Etherscan Link: https://sepolia.etherscan.io/tx/${tx.hash}`);
    console.log(`Amount Transferred: 10 PYUSD`);
    console.log(`From: ${signerAddress}`);
    console.log(`To: ${RECIPIENT_ADDRESS}`);

  } catch (error) {
    console.error("\n❌ Transfer failed:", error.message);
    
    if (error.message.includes("Insufficient PYUSD balance")) {
      console.log("\n💡 Solution: Get PYUSD tokens from a faucet:");
      console.log("   - https://sepoliafaucet.com/");
      console.log("   - https://faucets.chain.link/sepolia");
      console.log("   - https://www.alchemy.com/faucets/ethereum-sepolia");
    } else if (error.message.includes("Wrong network")) {
      console.log("\n💡 Solution: Make sure you're using Sepolia RPC URL");
    } else if (error.message.includes("insufficient funds")) {
      console.log("\n💡 Solution: Get ETH for gas fees from a faucet");
    }
    
    process.exit(1);
  }
}

// Run the transfer
transferPYUSD();
