const { ethers } = require('ethers');

// Configuration - REPLACE THESE WITH YOUR ACTUAL VALUES
const PRIVATE_KEY = "YOUR_PRIVATE_KEY_HERE"; // Replace with your actual private key
const RPC_URL = "YOUR_SEPOLIA_RPC_URL"; // Replace with your Sepolia RPC URL (e.g., Alchemy, Infura)

// Sepolia Testnet Configuration
const CHAIN_ID = 11155111; // Sepolia

// Contract addresses
const PYUSD_CONTRACT_ADDRESS = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9"; // PYUSD on Sepolia
const RECIPIENT_ADDRESS = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318"; // Contract address

// ERC-20 ABI (minimal for transfer)
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
    console.log("🚀 Starting PYUSD Transfer on Sepolia Testnet...\n");

    // Setup provider and signer
    console.log("Setting up provider and signer...");
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const signerAddress = await wallet.getAddress();
    console.log(`Signer address: ${signerAddress}`);

    // Check network
    const network = await provider.getNetwork();
    console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
    
    if (network.chainId !== CHAIN_ID) {
      throw new Error(`Wrong network! Expected Sepolia (${CHAIN_ID}), got ${network.chainId}`);
    }

    // Create PYUSD contract instance
    const pyusdContract = new ethers.Contract(PYUSD_CONTRACT_ADDRESS, ERC20_ABI, wallet);

    // Get token info
    const decimals = await pyusdContract.decimals();
    const symbol = await pyusdContract.symbol();
    console.log(`Token: ${symbol} (${decimals} decimals)`);

    // Amount to transfer (10 PYUSD)
    const amount = ethers.utils.parseUnits("10", decimals); // 10 PYUSD
    console.log(`Amount to transfer: ${ethers.utils.formatUnits(amount, decimals)} ${symbol}`);

    // Check sender balance
    console.log("\nChecking balances...");
    const senderBalance = await pyusdContract.balanceOf(signerAddress);
    console.log(`Sender ${symbol} balance: ${ethers.utils.formatUnits(senderBalance, decimals)} ${symbol}`);

    if (senderBalance.lt(amount)) {
      throw new Error(`Insufficient ${symbol} balance for transfer. Required: ${ethers.utils.formatUnits(amount, decimals)}, Available: ${ethers.utils.formatUnits(senderBalance, decimals)}`);
    }

    // Check recipient balance before
    const recipientBalanceBefore = await pyusdContract.balanceOf(RECIPIENT_ADDRESS);
    console.log(`Recipient ${symbol} balance before: ${ethers.utils.formatUnits(recipientBalanceBefore, decimals)} ${symbol}`);

    // Send transfer transaction
    console.log("\nSending transfer transaction...");
    console.log(`From: ${signerAddress}`);
    console.log(`To: ${RECIPIENT_ADDRESS}`);
    console.log(`Amount: ${ethers.utils.formatUnits(amount, decimals)} ${symbol}`);
    console.log(`Token Contract: ${PYUSD_CONTRACT_ADDRESS}`);
    
    // Call the transfer function on the PYUSD contract
    const tx = await pyusdContract.transfer(RECIPIENT_ADDRESS, amount, {
      gasLimit: 100000, // Set gas limit
      value: 0 // Explicitly set value to 0 (no ETH)
    });

    console.log(`Transaction sent. Hash: ${tx.hash}`);
    console.log("Waiting for confirmation...");

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
    console.log(`Gas used: ${receipt.gasUsed.toString()}`);

    // Check final balances
    const senderBalanceAfter = await pyusdContract.balanceOf(signerAddress);
    const recipientBalanceAfter = await pyusdContract.balanceOf(RECIPIENT_ADDRESS);
    
    console.log(`\n✅ Transfer completed successfully!`);
    console.log(`Sender ${symbol} balance after: ${ethers.utils.formatUnits(senderBalanceAfter, decimals)} ${symbol}`);
    console.log(`Recipient ${symbol} balance after: ${ethers.utils.formatUnits(recipientBalanceAfter, decimals)} ${symbol}`);

    // Generate Etherscan link
    const etherscanLink = `https://sepolia.etherscan.io/tx/${tx.hash}`;
    console.log(`\n📊 Transaction Details:`);
    console.log(`Transaction Hash: ${tx.hash}`);
    console.log(`Etherscan Link: ${etherscanLink}`);

  } catch (error) {
    console.error("❌ Error performing transfer:", error.message);
    process.exit(1);
  }
}

// Run the transfer
transferPYUSD();
