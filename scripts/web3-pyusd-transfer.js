const Web3 = require('web3');

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
    console.log("🚀 PYUSD ERC-20 Transfer (Web3.js) - Sepolia Testnet");
    console.log("==================================================\n");

    // Setup Web3 provider
    console.log("1. Setting up Web3 connection...");
    const web3 = new Web3(RPC_URL);
    
    // Create account from private key
    const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
    const signerAddress = account.address;
    console.log(`   Your address: ${signerAddress}`);

    // Check network
    const networkId = await web3.eth.net.getId();
    console.log(`   Network ID: ${networkId}`);
    
    if (networkId !== 11155111) {
      throw new Error(`Wrong network! Expected Sepolia (11155111), got ${networkId}`);
    }
    console.log("   ✅ Connected to Sepolia Testnet");

    // Create PYUSD contract instance
    console.log("\n2. Creating PYUSD contract instance...");
    const pyusdContract = new web3.eth.Contract(MINIMAL_ERC20_ABI, PYUSD_ADDRESS);
    console.log(`   PYUSD Contract: ${PYUSD_ADDRESS}`);
    console.log(`   Recipient: ${RECIPIENT_ADDRESS}`);
    console.log(`   Amount: ${AMOUNT_WEI} wei (10 PYUSD)`);

    // Get token info
    console.log("\n3. Getting token information...");
    const symbol = await pyusdContract.methods.symbol().call();
    const decimals = await pyusdContract.methods.decimals().call();
    console.log(`   Token Symbol: ${symbol}`);
    console.log(`   Token Decimals: ${decimals}`);

    // Check balances
    console.log("\n4. Checking balances...");
    const senderBalance = await pyusdContract.methods.balanceOf(signerAddress).call();
    const recipientBalanceBefore = await pyusdContract.methods.balanceOf(RECIPIENT_ADDRESS).call();
    
    console.log(`   Your ${symbol} balance: ${web3.utils.fromWei(senderBalance, 'ether')} ${symbol}`);
    console.log(`   Recipient balance before: ${web3.utils.fromWei(recipientBalanceBefore, 'ether')} ${symbol}`);

    // Check if sender has enough tokens
    if (BigInt(senderBalance) < BigInt(AMOUNT_WEI)) {
      throw new Error(`Insufficient ${symbol} balance! You have ${web3.utils.fromWei(senderBalance, 'ether')} ${symbol}, need 10 ${symbol}`);
    }

    // Check ETH balance for gas
    const ethBalance = await web3.eth.getBalance(signerAddress);
    console.log(`   Your ETH balance: ${web3.utils.fromWei(ethBalance, 'ether')} ETH (for gas)`);
    
    if (BigInt(ethBalance) < BigInt(web3.utils.toWei('0.001', 'ether'))) {
      console.log("   ⚠️  Low ETH balance! You may need more ETH for gas fees");
    }

    // Execute ERC-20 transfer
    console.log("\n5. Executing ERC-20 transfer...");
    console.log(`   Calling: pyusdContract.methods.transfer(${RECIPIENT_ADDRESS}, ${AMOUNT_WEI})`);
    console.log(`   This will show as "10 ${symbol}" in your wallet, NOT "0 SepoliaETH"`);
    
    // THIS IS THE KEY: Call the ERC-20 transfer function
    const tx = await pyusdContract.methods.transfer(RECIPIENT_ADDRESS, AMOUNT_WEI).send({
      from: signerAddress,
      gas: 100000,
      value: 0 // Explicitly set to 0 - NO ETH VALUE
    });

    console.log(`   Transaction sent! Hash: ${tx.transactionHash}`);
    console.log("   Transaction confirmed!");

    // Check final balances
    console.log("\n6. Checking final balances...");
    const senderBalanceAfter = await pyusdContract.methods.balanceOf(signerAddress).call();
    const recipientBalanceAfter = await pyusdContract.methods.balanceOf(RECIPIENT_ADDRESS).call();
    
    console.log(`   Your ${symbol} balance after: ${web3.utils.fromWei(senderBalanceAfter, 'ether')} ${symbol}`);
    console.log(`   Recipient ${symbol} balance after: ${web3.utils.fromWei(recipientBalanceAfter, 'ether')} ${symbol}`);

    // Success message
    console.log("\n🎉 PYUSD ERC-20 Transfer Successful!");
    console.log("=====================================");
    console.log(`Transaction Hash: ${tx.transactionHash}`);
    console.log(`Etherscan Link: https://sepolia.etherscan.io/tx/${tx.transactionHash}`);
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
