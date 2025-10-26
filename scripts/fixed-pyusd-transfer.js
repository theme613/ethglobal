const { ethers } = require('ethers');

// Configuration - REPLACE THESE WITH YOUR ACTUAL VALUES
const PRIVATE_KEY = "YOUR_PRIVATE_KEY_HERE"; // Replace with your actual private key
const RPC_URL = "YOUR_SEPOLIA_RPC_URL"; // Replace with your Sepolia RPC URL

// Contract addresses and parameters
const PYUSD_ADDRESS = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9"; // PYUSD on Sepolia
const RECIPIENT_ADDRESS = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318"; // Recipient address
const AMOUNT_WEI = "10000000000000000000"; // 10 PYUSD in wei (18 decimals)

// Minimal ERC-20 ABI - ONLY the transfer function
const MINIMAL_ERC20_ABI = [
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
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  }
];

async function transferPYUSD() {
  try {
    console.log("🚀 PYUSD ERC-20 Transfer - Sepolia Testnet");
    console.log("==========================================\n");

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

    // Create PYUSD contract instance
    console.log("\n2. Creating PYUSD contract instance...");
    const pyusdContract = new ethers.Contract(PYUSD_ADDRESS, MINIMAL_ERC20_ABI, wallet);
    console.log(`   PYUSD Contract: ${PYUSD_ADDRESS}`);
    console.log(`   Recipient: ${RECIPIENT_ADDRESS}`);
    console.log(`   Amount: ${AMOUNT_WEI} wei (10 PYUSD)`);

    // Get token info
    console.log("\n3. Getting token information...");
    const symbol = await pyusdContract.symbol();
    const decimals = await pyusdContract.decimals();
    console.log(`   Token Symbol: ${symbol}`);
    console.log(`   Token Decimals: ${decimals}`);

    // Check balances
    console.log("\n4. Checking balances...");
    const senderBalance = await pyusdContract.balanceOf(signerAddress);
    const recipientBalanceBefore = await pyusdContract.balanceOf(RECIPIENT_ADDRESS);
    
    console.log(`   Your ${symbol} balance: ${ethers.utils.formatUnits(senderBalance, decimals)} ${symbol}`);
    console.log(`   Recipient balance before: ${ethers.utils.formatUnits(recipientBalanceBefore, decimals)} ${symbol}`);

    // Check if sender has enough tokens
    if (senderBalance.lt(AMOUNT_WEI)) {
      throw new Error(`Insufficient ${symbol} balance! You have ${ethers.utils.formatUnits(senderBalance, decimals)} ${symbol}, need 10 ${symbol}`);
    }

    // Check ETH balance for gas
    const ethBalance = await provider.getBalance(signerAddress);
    console.log(`   Your ETH balance: ${ethers.utils.formatEther(ethBalance)} ETH (for gas)`);
    
    if (ethBalance.lt(ethers.utils.parseEther("0.001"))) {
      console.log("   ⚠️  Low ETH balance! You may need more ETH for gas fees");
    }

    // Execute ERC-20 transfer
    console.log("\n5. Executing ERC-20 transfer...");
    console.log(`   Calling: pyusdContract.transfer(${RECIPIENT_ADDRESS}, ${AMOUNT_WEI})`);
    console.log(`   This will show as "10 ${symbol}" in your wallet, NOT "0 SepoliaETH"`);
    
    // THIS IS THE KEY: Call the ERC-20 transfer function
    const tx = await pyusdContract.transfer(RECIPIENT_ADDRESS, AMOUNT_WEI, {
      gasLimit: 100000,
      value: 0 // Explicitly set to 0 - NO ETH VALUE
    });

    console.log(`   Transaction sent! Hash: ${tx.hash}`);
    console.log("   Waiting for confirmation...");

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log(`   ✅ Transaction confirmed in block: ${receipt.blockNumber}`);
    console.log(`   Gas used: ${receipt.gasUsed.toString()}`);

    // Check final balances
    console.log("\n6. Checking final balances...");
    const senderBalanceAfter = await pyusdContract.balanceOf(signerAddress);
    const recipientBalanceAfter = await pyusdContract.balanceOf(RECIPIENT_ADDRESS);
    
    console.log(`   Your ${symbol} balance after: ${ethers.utils.formatUnits(senderBalanceAfter, decimals)} ${symbol}`);
    console.log(`   Recipient ${symbol} balance after: ${ethers.utils.formatUnits(recipientBalanceAfter, decimals)} ${symbol}`);

    // Success message
    console.log("\n🎉 PYUSD ERC-20 Transfer Successful!");
    console.log("=====================================");
    console.log(`Transaction Hash: ${tx.hash}`);
    console.log(`Etherscan Link: https://sepolia.etherscan.io/tx/${tx.hash}`);
    console.log(`Amount Transferred: 10 ${symbol}`);
    console.log(`From: ${signerAddress}`);
    console.log(`To: ${RECIPIENT_ADDRESS}`);
    console.log(`Token Contract: ${PYUSD_ADDRESS}`);
    console.log(`Method: ERC-20 transfer() function`);

  } catch (error) {
    console.error("\n❌ Transfer failed:", error.message);
    
    if (error.message.includes("Insufficient")) {
      console.log("\n💡 You don't have enough PYUSD tokens!");
      console.log("Get PYUSD from a faucet:");
      console.log("- https://sepoliafaucet.com/");
      console.log("- https://faucets.chain.link/sepolia");
      console.log("- https://www.alchemy.com/faucets/ethereum-sepolia");
    } else if (error.message.includes("Wrong network")) {
      console.log("\n💡 Make sure you're using Sepolia RPC URL");
    } else if (error.message.includes("insufficient funds")) {
      console.log("\n💡 Get ETH for gas fees from a faucet");
    }
    
    process.exit(1);
  }
}

// Run the transfer
transferPYUSD();
